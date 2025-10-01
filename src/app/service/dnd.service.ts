import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime, debounceTime } from 'rxjs/operators';
import { animate } from 'animejs';
import {
  DragState,
  DndSystemConfig,
  SnapConfig,
  AutoScrollConfig,
  AccessibilityConfig,
  GhostConfig,
  PlaceholderConfig,
  DragEvents,
  Task,
  TaskStatus,
  ColumnSnapInfo,
  SlotInfo,
  PositionInfo,
  DragStartEvent,
  DragEvent,
  DropEvent,
  CancelEvent
} from '../../types/board.types';

@Injectable({
  providedIn: 'root'
})
export class DndService {
  
  // Estado global del drag & drop
  private readonly _dragState = new BehaviorSubject<DragState>({
    isDragging: false,
    draggedTask: null,
    sourceColumn: null,
    targetColumn: null,
    targetIndex: -1,
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    startTime: 0
  });

  // Configuración por defecto
  private readonly defaultConfig: DndSystemConfig = {
    snap: {
      grid: {
        enabled: true,
        slotHeight: 120, // Altura base de tarjeta + gap
        gap: 12,
        dynamicHeight: true
      },
      targets: {
        enabled: true,
        tolerance: 50,
        smoothing: 0.15
      },
      thresholds: {
        snapThreshold: 8,
        dragThreshold: 5,
        autoScrollThreshold: 50
      }
    },
    autoScroll: {
      vertical: {
        enabled: true,
        speed: 2,
        zone: 50,
        maxSpeed: 12
      },
      horizontal: {
        enabled: true,
        speed: 2,
        zone: 50,
        maxSpeed: 8
      }
    },
    accessibility: {
      keyboard: {
        enabled: true,
        moveStep: 5,
        announceChanges: true
      },
      announcements: {
        onPickup: 'Tarjeta seleccionada. Use las flechas para mover, Enter para soltar, Escape para cancelar.',
        onMove: 'Movido a {column}, posición {position}',
        onDrop: 'Tarjeta movida a {column}, posición {position}',
        onCancel: 'Movimiento cancelado. Tarjeta regresada a posición original.'
      }
    },
    ghost: {
      enabled: true,
      opacity: 0.8,
      scale: 1.05,
      zIndex: 9999,
      className: 'dnd-ghost'
    },
    placeholder: {
      enabled: true,
      opacity: 0.3,
      height: 'auto',
      backgroundColor: '#e5e7eb',
      borderStyle: '2px dashed #9ca3af',
      animationDuration: 200
    },
    events: {}
  };

  private currentConfig: DndSystemConfig = { ...this.defaultConfig };
  private destroy$ = new Subject<void>();
  
  // Elementos del DOM
  private draggedElement: HTMLElement | null = null;
  private ghostElement: HTMLElement | null = null;
  private placeholderElement: HTMLElement | null = null;
  private originalParent: HTMLElement | null = null;
  
  // Estado de columnas y slots
  private columnsInfo: Map<TaskStatus, ColumnSnapInfo> = new Map();
  private autoScrollAnimation: any = null;
  
  // ARIA live region para accesibilidad
  private ariaLiveRegion: HTMLElement | null = null;

  constructor(private ngZone: NgZone) {
    this.initializeAriaLiveRegion();
    this.setupGlobalEventListeners();
  }

  // ===== API PÚBLICA =====

  get dragState$(): Observable<DragState> {
    return this._dragState.asObservable();
  }

  get isDragging(): boolean {
    return this._dragState.value.isDragging;
  }

  get currentDragState(): DragState {
    return this._dragState.value;
  }

  /**
   * Configura el sistema de drag & drop
   */
  configure(config: Partial<DndSystemConfig>): void {
    this.currentConfig = this.mergeConfig(this.defaultConfig, config);
  }

  /**
   * Inicia el drag de una tarea
   */
  startDrag(task: Task, element: HTMLElement, event: MouseEvent | TouchEvent): void {
    if (this.isDragging) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const rect = element.getBoundingClientRect();
    const offset = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    // Actualizar estado
    this.updateDragState({
      isDragging: true,
      draggedTask: task,
      sourceColumn: task.status,
      targetColumn: task.status,
      targetIndex: -1,
      currentPosition: { x: clientX, y: clientY },
      offset,
      startTime: Date.now()
    });

    this.draggedElement = element;
    this.originalParent = element.parentElement;

    // Crear ghost y placeholder
    this.createGhost(element);
    this.createPlaceholder(element);

    // Preparar elemento para drag
    this.prepareDragElement(element, clientX - offset.x, clientY - offset.y);

    // Calcular información de columnas
    this.calculateColumnsInfo();

    // Anunciar inicio de drag (accesibilidad)
    this.announceToScreenReader(this.currentConfig.accessibility.announcements.onPickup);

    // Disparar evento
    if (this.currentConfig.events.onDragStart) {
      const dragStartEvent: DragStartEvent = {
        task,
        element,
        position: { x: clientX, y: clientY },
        sourceColumn: task.status
      };
      this.currentConfig.events.onDragStart(dragStartEvent);
    }
  }

  /**
   * Actualiza la posición durante el drag
   */
  updateDrag(clientX: number, clientY: number): void {
    if (!this.isDragging || !this.draggedElement) return;

    const state = this._dragState.value;
    
    // Actualizar posición del elemento
    this.updateDragElementPosition(clientX - state.offset.x, clientY - state.offset.y);

    // Calcular nueva posición con snap
    const positionInfo = this.calculateSnapPosition(clientX, clientY);

    // Actualizar estado
    this.updateDragState({
      ...state,
      currentPosition: { x: clientX, y: clientY },
      targetColumn: positionInfo.column,
      targetIndex: positionInfo.index
    });

    // Actualizar placeholder
    this.updatePlaceholder(positionInfo);

    // Auto-scroll
    this.handleAutoScroll(clientX, clientY);

    // Disparar evento
    if (this.currentConfig.events.onDrag) {
      const dragEvent: DragEvent = {
        task: state.draggedTask!,
        element: this.draggedElement,
        position: { x: clientX, y: clientY },
        delta: { x: clientX - state.currentPosition.x, y: clientY - state.currentPosition.y }
      };
      this.currentConfig.events.onDrag(dragEvent);
    }
  }

  /**
   * Finaliza el drag y realiza el drop
   */
  drop(): void {
    if (!this.isDragging) return;

    const state = this._dragState.value;
    const canDrop = state.targetColumn !== null && state.targetIndex >= 0;

    if (canDrop && state.draggedTask) {
      // Realizar drop
      this.performDrop(state);
    } else {
      // Cancelar drag
      this.cancelDrag('outside');
    }
  }

  /**
   * Cancela el drag actual
   */
  cancelDrag(reason: 'escape' | 'outside' | 'error' = 'escape'): void {
    if (!this.isDragging) return;

    const state = this._dragState.value;

    // Animar vuelta a posición original
    this.animateRevert();

    // Disparar evento de cancelación
    if (this.currentConfig.events.onCancel && state.draggedTask) {
      const cancelEvent: CancelEvent = {
        task: state.draggedTask,
        sourceColumn: state.sourceColumn!,
        reason
      };
      this.currentConfig.events.onCancel(cancelEvent);
    }

    // Anunciar cancelación
    this.announceToScreenReader(this.currentConfig.accessibility.announcements.onCancel);

    // Limpiar después de la animación
    setTimeout(() => {
      this.cleanup();
    }, 300);
  }

  /**
   * Actualiza la información de las columnas (llamar cuando cambien las tareas)
   */
  updateColumnsInfo(): void {
    if (this.isDragging) {
      this.calculateColumnsInfo();
    }
  }

  /**
   * Destruye el servicio y limpia recursos
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
    this.removeAriaLiveRegion();
  }

  // ===== MÉTODOS PRIVADOS =====

  private updateDragState(newState: Partial<DragState>): void {
    this._dragState.next({ ...this._dragState.value, ...newState });
  }

  private mergeConfig(base: DndSystemConfig, override: Partial<DndSystemConfig>): DndSystemConfig {
    return {
      snap: { ...base.snap, ...override.snap },
      autoScroll: { ...base.autoScroll, ...override.autoScroll },
      accessibility: { ...base.accessibility, ...override.accessibility },
      ghost: { ...base.ghost, ...override.ghost },
      placeholder: { ...base.placeholder, ...override.placeholder },
      events: { ...base.events, ...override.events },
      debug: override.debug ?? base.debug
    };
  }

  private createGhost(element: HTMLElement): void {
    if (!this.currentConfig.ghost.enabled) return;

    // Crear un clon profundo que incluya todos los estilos computados
    this.ghostElement = this.createVisualClone(element);
    const config = this.currentConfig.ghost;
    const rect = element.getBoundingClientRect();

    // Aplicar estilos del ghost
    Object.assign(this.ghostElement.style, {
      position: 'fixed',
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      opacity: config.opacity.toString(),
      transform: `scale(${config.scale}) rotate(3deg)`,
      zIndex: config.zIndex.toString(),
      pointerEvents: 'none',
      transition: 'none',
      willChange: 'transform',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'grabbing'
    });

    if (config.className) {
      this.ghostElement.classList.add(config.className);
    }

    // Agregar clase especial para identificación
    this.ghostElement.classList.add('dnd-ghost-active');

    document.body.appendChild(this.ghostElement);
  }

  private createVisualClone(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Copiar estilos computados para mantener la apariencia visual exacta
    const computedStyle = window.getComputedStyle(element);
    
    // Lista de propiedades importantes para preservar
    const importantStyles = [
      'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
      'padding', 'margin', 'borderRadius', 'border', 'backgroundImage',
      'backgroundSize', 'backgroundPosition', 'textAlign', 'lineHeight'
    ];

    importantStyles.forEach(prop => {
      (clone.style as any)[prop] = (computedStyle as any)[prop];
    });

    // Limpiar IDs para evitar duplicados
    clone.id = '';
    clone.querySelectorAll('[id]').forEach((el: Element) => {
      (el as HTMLElement).id = '';
    });

    // Remover atributos de datos específicos
    clone.removeAttribute('data-task-id');
    clone.removeAttribute('aria-grabbed');
    
    return clone;
  }

  private createPlaceholder(element: HTMLElement): void {
    if (!this.currentConfig.placeholder.enabled) return;

    this.placeholderElement = document.createElement('div');
    const config = this.currentConfig.placeholder;
    const rect = element.getBoundingClientRect();

    // Crear contenido visual del placeholder
    const placeholderContent = document.createElement('div');
    placeholderContent.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-400 text-sm">
        <i class="fas fa-arrows-alt mr-2"></i>
        <span>Soltá aquí</span>
      </div>
    `;

    // Aplicar estilos del placeholder
    Object.assign(this.placeholderElement.style, {
      width: rect.width + 'px',
      height: config.height === 'auto' ? rect.height + 'px' : config.height + 'px',
      opacity: '0',
      backgroundColor: config.backgroundColor || '#f3f4f6',
      border: config.borderStyle || '2px dashed #9ca3af',
      borderRadius: '12px',
      transition: `all ${config.animationDuration}ms ease-out`,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    });

    this.placeholderElement.appendChild(placeholderContent);
    this.placeholderElement.classList.add('dnd-placeholder');
    
    // Insertar en la posición original con una referencia estable
    this.insertPlaceholderAtPosition(element);

    // Animar entrada del placeholder
    requestAnimationFrame(() => {
      animate(this.placeholderElement!, {
        opacity: [0, config.opacity],
        scale: [0.95, 1],
        duration: config.animationDuration,
        easing: 'easeOutExpo'
      });
    });
  }

  private insertPlaceholderAtPosition(element: HTMLElement): void {
    const parent = element.parentElement;
    if (!parent) return;

    // Encontrar la posición exacta del elemento
    const siblings = Array.from(parent.children);
    const elementIndex = siblings.indexOf(element);

    if (elementIndex !== -1) {
      if (elementIndex === siblings.length - 1) {
        // Es el último elemento
        parent.appendChild(this.placeholderElement!);
      } else {
        // Insertar antes del siguiente elemento
        parent.insertBefore(this.placeholderElement!, siblings[elementIndex + 1]);
      }
    } else {
      // Fallback: agregar al final
      parent.appendChild(this.placeholderElement!);
    }
  }

  private prepareDragElement(element: HTMLElement, x: number, y: number): void {
    // En lugar de modificar el elemento original, solo lo ocultamos
    // El ghost se encarga de la visualización durante el drag
    Object.assign(element.style, {
      opacity: '0.1',
      transform: 'scale(0.95)',
      transition: 'all 0.2s ease',
      pointerEvents: 'none'
    });

    element.classList.add('dnd-dragging');
    
    // Posicionar el ghost en la posición inicial
    if (this.ghostElement) {
      this.updateDragElementPosition(x, y);
    }
  }

  private updateDragElementPosition(x: number, y: number): void {
    // Solo actualizar la posición del ghost, no el elemento original
    if (this.ghostElement) {
      // Usar anime.js para animación suave del ghost
      this.ghostElement.style.left = x + 'px';
      this.ghostElement.style.top = y + 'px';
      
      // Aplicar transformación adicional para efecto de rotación suave
      const rotation = Math.sin(Date.now() / 1000) * 2 + 3; // Rotación sutil que varía
      this.ghostElement.style.transform = `scale(${this.currentConfig.ghost.scale}) rotate(${rotation}deg)`;
    }
  }

  private calculateColumnsInfo(): void {
    this.columnsInfo.clear();
    
    const columns = document.querySelectorAll('[data-column-id]');
    columns.forEach((col) => {
      const element = col as HTMLElement;
      const columnId = element.getAttribute('data-column-id') as TaskStatus;
      if (!columnId) return;

      const bounds = element.getBoundingClientRect();
      const slots = this.calculateColumnSlots(element);

      const columnInfo: ColumnSnapInfo = {
        id: columnId,
        element,
        bounds,
        centerX: bounds.left + bounds.width / 2,
        slots
      };

      this.columnsInfo.set(columnId, columnInfo);
    });
  }

  private calculateColumnSlots(columnElement: HTMLElement): SlotInfo[] {
    const slots: SlotInfo[] = [];
    const tasksContainer = columnElement.querySelector('.space-y-3');
    if (!tasksContainer) return slots;

    const containerBounds = tasksContainer.getBoundingClientRect();
    const tasks = tasksContainer.querySelectorAll('.task-card:not(.dnd-dragging)');
    
    const slotHeight = this.currentConfig.snap.grid.slotHeight;
    const gap = this.currentConfig.snap.grid.gap;

    // Crear slots basados en las tareas existentes + uno extra al final
    tasks.forEach((task, index) => {
      const taskElement = task as HTMLElement;
      const taskBounds = taskElement.getBoundingClientRect();
      
      slots.push({
        index,
        bounds: taskBounds,
        centerY: taskBounds.top + taskBounds.height / 2,
        occupied: true,
        taskId: parseInt(taskElement.getAttribute('data-task-id') || '0')
      });
    });

    // Agregar slot vacío al final
    const lastSlotY = slots.length > 0 
      ? slots[slots.length - 1].bounds.bottom + gap
      : containerBounds.top + 16; // padding inicial

    slots.push({
      index: slots.length,
      bounds: new DOMRect(containerBounds.left, lastSlotY, containerBounds.width, slotHeight),
      centerY: lastSlotY + slotHeight / 2,
      occupied: false
    });

    return slots;
  }

  private calculateSnapPosition(clientX: number, clientY: number): PositionInfo {
    let closestColumn: ColumnSnapInfo | null = null;
    let minDistance = Infinity;

    // Encontrar columna más cercana
    this.columnsInfo.forEach((columnInfo) => {
      const distance = Math.abs(clientX - columnInfo.centerX);
      if (distance < minDistance && distance < this.currentConfig.snap.targets.tolerance) {
        minDistance = distance;
        closestColumn = columnInfo;
      }
    });

    if (!closestColumn) {
      return { 
        column: this._dragState.value.sourceColumn!, 
        index: -1, 
        slot: { x: 0, y: 0, width: 0, height: 0 }, 
        isValid: false 
      };
    }

    // Encontrar slot más cercano en la columna
    let closestSlot: SlotInfo | null = null;
    let minSlotDistance = Infinity;

    (closestColumn as ColumnSnapInfo).slots.forEach((slot: SlotInfo) => {
      const distance = Math.abs(clientY - slot.centerY);
      if (distance < minSlotDistance) {
        minSlotDistance = distance;
        closestSlot = slot;
      }
    });

    if (!closestSlot) {
      return { 
        column: (closestColumn as ColumnSnapInfo).id, 
        index: -1, 
        slot: { x: 0, y: 0, width: 0, height: 0 }, 
        isValid: false 
      };
    }

    const selectedColumn = closestColumn as ColumnSnapInfo;
    const selectedSlot = closestSlot as SlotInfo;

    return {
      column: selectedColumn.id,
      index: selectedSlot.index,
      slot: {
        x: selectedSlot.bounds.left,
        y: selectedSlot.bounds.top,
        width: selectedSlot.bounds.width,
        height: selectedSlot.bounds.height
      },
      isValid: true
    };
  }

  private updatePlaceholder(positionInfo: PositionInfo): void {
    if (!this.placeholderElement || !positionInfo.isValid) return;

    const targetColumn = this.columnsInfo.get(positionInfo.column);
    if (!targetColumn) return;

    const tasksContainer = targetColumn.element.querySelector('.space-y-3') as HTMLElement;
    if (!tasksContainer) return;

    // Remover placeholder de su posición actual
    if (this.placeholderElement.parentElement) {
      this.placeholderElement.remove();
    }

    // Insertar placeholder en nueva posición
    const tasks = Array.from(tasksContainer.querySelectorAll('.task-card:not(.dnd-dragging)'));
    
    if (positionInfo.index >= tasks.length) {
      // Al final
      tasksContainer.appendChild(this.placeholderElement);
    } else {
      // Antes del elemento en el índice
      tasksContainer.insertBefore(this.placeholderElement, tasks[positionInfo.index]);
    }

    // Animar aparición
    animate(this.placeholderElement, {
      opacity: [0, this.currentConfig.placeholder.opacity],
      scale: [0.8, 1],
      duration: this.currentConfig.placeholder.animationDuration,
      easing: 'easeOutExpo'
    });
  }

  private handleAutoScroll(clientX: number, clientY: number): void {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const zones = {
      top: clientY < this.currentConfig.autoScroll.vertical.zone,
      bottom: clientY > viewport.height - this.currentConfig.autoScroll.vertical.zone,
      left: clientX < this.currentConfig.autoScroll.horizontal.zone,
      right: clientX > viewport.width - this.currentConfig.autoScroll.horizontal.zone
    };

    // Cancelar animación anterior
    if (this.autoScrollAnimation) {
      this.autoScrollAnimation.pause();
      this.autoScrollAnimation = null;
    }

    // Scroll vertical
    if (zones.top || zones.bottom) {
      const direction = zones.top ? -1 : 1;
      const speed = this.currentConfig.autoScroll.vertical.speed * direction;
      this.startAutoScroll('vertical', speed);
    }

    // Scroll horizontal
    if (zones.left || zones.right) {
      const direction = zones.left ? -1 : 1;
      const speed = this.currentConfig.autoScroll.horizontal.speed * direction;
      this.startAutoScroll('horizontal', speed);
    }
  }

  private startAutoScroll(direction: 'vertical' | 'horizontal', speed: number): void {
    const scroll = () => {
      if (direction === 'vertical') {
        window.scrollBy(0, speed);
      } else {
        window.scrollBy(speed, 0);
      }

      // Continuar scroll
      if (this.isDragging) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  private performDrop(state: DragState): void {
    if (!state.draggedTask || !state.targetColumn) return;

    // Animar elemento a su posición final
    this.animateToDrop(state);

    // Disparar evento de drop
    if (this.currentConfig.events.onDrop) {
      const dropEvent: DropEvent = {
        task: state.draggedTask,
        sourceColumn: state.sourceColumn!,
        targetColumn: state.targetColumn,
        targetIndex: state.targetIndex,
        newPosition: state.targetIndex
      };
      this.currentConfig.events.onDrop(dropEvent);
    }

    // Anunciar drop
    const announcement = this.currentConfig.accessibility.announcements.onDrop
      .replace('{column}', this.getColumnName(state.targetColumn))
      .replace('{position}', (state.targetIndex + 1).toString());
    
    this.announceToScreenReader(announcement);

    // Limpiar después de la animación
    setTimeout(() => {
      this.cleanup();
    }, 300);
  }

  private animateToDrop(state: DragState): void {
    if (!this.ghostElement || !this.placeholderElement) return;

    const placeholderRect = this.placeholderElement.getBoundingClientRect();

    // Animar ghost hacia la posición del placeholder
    animate(this.ghostElement, {
      left: placeholderRect.left,
      top: placeholderRect.top,
      rotate: 0,
      scale: 1,
      opacity: 0.8,
      duration: 400,
      easing: 'easeOutExpo',
      complete: () => {
        // Animar placeholder hacia el estado final
        if (this.placeholderElement) {
          animate(this.placeholderElement, {
            opacity: 1,
            scale: 1.02,
            duration: 200,
            easing: 'easeOutBack',
            complete: () => {
              // Pequeña animación de confirmación
              if (this.placeholderElement) {
                animate(this.placeholderElement, {
                  scale: 1,
                  duration: 150,
                  easing: 'easeOutExpo'
                });
              }
            }
          });
        }
      }
    });
  }

  private animateRevert(): void {
    if (!this.ghostElement || !this.originalParent) return;

    // Calcular posición original basada en el placeholder
    let targetRect;
    if (this.placeholderElement && document.contains(this.placeholderElement)) {
      targetRect = this.placeholderElement.getBoundingClientRect();
    } else {
      // Fallback a la posición del padre original
      targetRect = this.originalParent.getBoundingClientRect();
    }

    // Animar ghost de vuelta con efecto elástico
    animate(this.ghostElement, {
      left: targetRect.left,
      top: targetRect.top,
      rotate: 0,
      scale: 0.95,
      opacity: 0.5,
      duration: 400,
      easing: 'easeOutBack',
      complete: () => {
        // Animar desaparición
        if (this.ghostElement) {
          animate(this.ghostElement, {
            opacity: 0,
            scale: 0.8,
            rotate: '-5deg',
            duration: 200,
            easing: 'easeInExpo'
          });
        }
      }
    });
  }

  private cleanup(): void {
    // Resetear estado
    this.updateDragState({
      isDragging: false,
      draggedTask: null,
      sourceColumn: null,
      targetColumn: null,
      targetIndex: -1,
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      startTime: 0
    });

    // Limpiar elemento original si aún existe en el DOM
    if (this.draggedElement) {
      // Verificar si el elemento aún existe en el DOM antes de modificarlo
      if (document.contains(this.draggedElement)) {
        this.draggedElement.classList.remove('dnd-dragging');
        Object.assign(this.draggedElement.style, {
          opacity: '',
          transform: '',
          transition: '',
          pointerEvents: ''
        });
      }
      this.draggedElement = null;
    }

    // Limpiar ghost con animación suave
    if (this.ghostElement) {
      animate(this.ghostElement, {
        opacity: 0,
        scale: 0.8,
        rotate: '10deg',
        duration: 200,
        easing: 'easeInExpo',
        complete: () => {
          if (this.ghostElement && document.contains(this.ghostElement)) {
            this.ghostElement.remove();
          }
          this.ghostElement = null;
        }
      });
    } else {
      this.ghostElement = null;
    }

    // Limpiar placeholder con animación
    if (this.placeholderElement) {
      animate(this.placeholderElement, {
        opacity: 0,
        scale: 0.9,
        duration: 150,
        easing: 'easeInExpo',
        complete: () => {
          if (this.placeholderElement && document.contains(this.placeholderElement)) {
            this.placeholderElement.remove();
          }
          this.placeholderElement = null;
        }
      });
    } else {
      this.placeholderElement = null;
    }

    // Limpiar referencias
    this.originalParent = null;
    this.columnsInfo.clear();

    // Cancelar auto-scroll
    if (this.autoScrollAnimation) {
      this.autoScrollAnimation.pause();
      this.autoScrollAnimation = null;
    }

    // Limpiar clases de drop zones activas
    document.querySelectorAll('.drop-zone-active').forEach(el => {
      el.classList.remove('drop-zone-active');
    });

    // Limpiar cualquier elemento ghost huérfano
    document.querySelectorAll('.dnd-ghost-active').forEach(el => {
      el.remove();
    });
  }

  private setupGlobalEventListeners(): void {
    // Escape key para cancelar
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.key === 'Escape' && this.isDragging) {
          this.cancelDrag('escape');
        }
      });

    // Resize para recalcular columnas
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(250),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.isDragging) {
          this.calculateColumnsInfo();
        }
      });
  }

  private initializeAriaLiveRegion(): void {
    this.ariaLiveRegion = document.createElement('div');
    Object.assign(this.ariaLiveRegion, {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
    
    Object.assign(this.ariaLiveRegion.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });

    document.body.appendChild(this.ariaLiveRegion);
  }

  private removeAriaLiveRegion(): void {
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.remove();
      this.ariaLiveRegion = null;
    }
  }

  private announceToScreenReader(message: string): void {
    if (!this.currentConfig.accessibility.keyboard.announceChanges || !this.ariaLiveRegion) return;

    this.ariaLiveRegion.textContent = message;
    
    // Limpiar después de un momento
    setTimeout(() => {
      if (this.ariaLiveRegion) {
        this.ariaLiveRegion.textContent = '';
      }
    }, 1000);
  }

  private getColumnName(columnId: TaskStatus): string {
    const names = {
      [TaskStatus.TODO]: 'Por Hacer',
      [TaskStatus.IN_PROGRESS]: 'En Progreso', 
      [TaskStatus.IN_REVIEW]: 'En Revisión',
      [TaskStatus.DONE]: 'Completado'
    };
    return names[columnId] || columnId;
  }
}