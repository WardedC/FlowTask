import { 
  Directive, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  NgZone,
  Renderer2,
  HostListener
} from '@angular/core';
import { Subject, fromEvent, merge } from 'rxjs';
import { takeUntil, filter, throttleTime } from 'rxjs/operators';
import { DndService } from '../service/dnd.service';
import { 
  Task, 
  DndSystemConfig, 
  DropEvent, 
  DragStartEvent, 
  CancelEvent,
  DragEvent 
} from '../../types/board.types';

@Directive({
  selector: '[appDraggableSnap]',
  standalone: true
})
export class DraggableSnapDirective implements OnInit, OnDestroy {
  
  @Input() appDraggableSnap!: Task; // La tarea que se puede arrastrar
  @Input() dragDisabled = false; // Deshabilitar drag temporalmente
  @Input() dragConfig?: Partial<DndSystemConfig>; // Configuración específica
  
  @Output() dragStart = new EventEmitter<DragStartEvent>();
  @Output() drag = new EventEmitter<DragEvent>();
  @Output() drop = new EventEmitter<DropEvent>();
  @Output() cancel = new EventEmitter<CancelEvent>();

  private destroy$ = new Subject<void>();
  private isDragging = false;
  private mousePressed = false;
  private touchIdentifier?: number;
  
  // Umbrales para detección de drag
  private dragThreshold = 5;
  private startPosition = { x: 0, y: 0 };
  private currentPosition = { x: 0, y: 0 };

  // Estado de teclado para accesibilidad
  private keyboardMode = false;
  private focusedElement?: HTMLElement;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private dndService: DndService
  ) {}

  ngOnInit(): void {
    this.setupElement();
    this.setupEventListeners();
    this.setupAccessibility();
    
    // Configurar el servicio si se proporciona configuración
    if (this.dragConfig) {
      this.dndService.configure(this.dragConfig);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  // ===== CONFIGURACIÓN INICIAL =====

  private setupElement(): void {
    const element = this.elementRef.nativeElement;
    
    // Aplicar estilos base para draggable
    this.renderer.setStyle(element, 'cursor', 'grab');
    this.renderer.setStyle(element, 'user-select', 'none');
    this.renderer.setStyle(element, 'touch-action', 'none');
    this.renderer.addClass(element, 'draggable-snap-element');
    
    // Asegurar que tenga el data attribute para identificación
    if (this.appDraggableSnap) {
      this.renderer.setAttribute(element, 'data-task-id', this.appDraggableSnap.id.toString());
    }
  }

  private setupEventListeners(): void {
    const element = this.elementRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      // Mouse events
      merge(
        fromEvent<MouseEvent>(element, 'mousedown'),
        fromEvent<TouchEvent>(element, 'touchstart', { passive: false })
      ).pipe(
        takeUntil(this.destroy$),
        filter(() => !this.dragDisabled && !this.dndService.isDragging)
      ).subscribe((event) => {
        this.handleStartEvent(event);
      });

      // Global mouse/touch move events
      merge(
        fromEvent<MouseEvent>(document, 'mousemove'),
        fromEvent<TouchEvent>(document, 'touchmove', { passive: false })
      ).pipe(
        takeUntil(this.destroy$),
        throttleTime(16), // ~60fps
        filter(() => this.mousePressed)
      ).subscribe((event) => {
        this.handleMoveEvent(event);
      });

      // Global mouse/touch up events
      merge(
        fromEvent<MouseEvent>(document, 'mouseup'),
        fromEvent<TouchEvent>(document, 'touchend'),
        fromEvent<TouchEvent>(document, 'touchcancel')
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe((event) => {
        this.handleEndEvent(event);
      });

      // Context menu (disable during drag)
      fromEvent<Event>(element, 'contextmenu')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          if (this.isDragging) {
            event.preventDefault();
          }
        });

      // Drag image (disable default)
      fromEvent<Event>(element, 'dragstart')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          event.preventDefault();
        });
    });

    // Subscribe to DndService state changes
    this.dndService.dragState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.updateElementState(state.isDragging && state.draggedTask?.id === this.appDraggableSnap?.id);
      });
  }

  private setupAccessibility(): void {
    const element = this.elementRef.nativeElement;
    
    // ARIA attributes
    this.renderer.setAttribute(element, 'role', 'button');
    this.renderer.setAttribute(element, 'tabindex', '0');
    this.renderer.setAttribute(element, 'aria-grabbed', 'false');
    this.renderer.setAttribute(element, 'aria-label', `Mover tarjeta: ${this.appDraggableSnap?.title || 'Sin título'}`);

    // Keyboard navigation
    fromEvent<KeyboardEvent>(element, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.handleKeyboardEvent(event);
      });

    // Focus management
    fromEvent(element, 'focus')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.focusedElement = element;
        this.keyboardMode = true;
      });

    fromEvent(element, 'blur')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.keyboardMode = false;
      });
  }

  // ===== MANEJO DE EVENTOS =====

  private handleStartEvent(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    
    if (this.dragDisabled || !this.appDraggableSnap) return;

    const { clientX, clientY } = this.getClientCoordinates(event);
    
    // Guardar posición inicial
    this.startPosition = { x: clientX, y: clientY };
    this.currentPosition = { x: clientX, y: clientY };
    this.mousePressed = true;
    
    // Guardar touch identifier si es touch event
    if ('touches' in event && event.touches.length > 0) {
      this.touchIdentifier = event.touches[0].identifier;
    }

    // Cambiar cursor
    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grabbing');

    // Configurar threshold desde el servicio
    const config = this.dndService.currentDragState;
    this.dragThreshold = 5; // Default threshold
  }

  private handleMoveEvent(event: MouseEvent | TouchEvent): void {
    if (!this.mousePressed || this.dragDisabled) return;

    const { clientX, clientY } = this.getClientCoordinates(event);
    
    // Verificar si es el touch correcto
    if ('touches' in event && this.touchIdentifier !== undefined) {
      const touch = Array.from(event.touches).find(t => t.identifier === this.touchIdentifier);
      if (!touch) return;
    }

    this.currentPosition = { x: clientX, y: clientY };

    // Verificar si se ha superado el threshold para iniciar drag
    if (!this.isDragging) {
      const distance = Math.sqrt(
        Math.pow(clientX - this.startPosition.x, 2) + 
        Math.pow(clientY - this.startPosition.y, 2)
      );

      if (distance >= this.dragThreshold) {
        this.startDrag(event);
      }
    } else {
      // Actualizar posición durante el drag
      this.dndService.updateDrag(clientX, clientY);
    }
  }

  private handleEndEvent(event: MouseEvent | TouchEvent): void {
    if (!this.mousePressed) return;

    // Verificar si es el touch correcto
    if ('changedTouches' in event && this.touchIdentifier !== undefined) {
      const touch = Array.from(event.changedTouches).find(t => t.identifier === this.touchIdentifier);
      if (!touch) return;
    }

    this.mousePressed = false;
    this.touchIdentifier = undefined;

    // Restaurar cursor
    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', 'grab');

    if (this.isDragging) {
      this.endDrag();
    }
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.keyboardMode || this.dragDisabled || !this.appDraggableSnap) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (!this.isDragging) {
          this.startKeyboardDrag();
        } else {
          this.endKeyboardDrag();
        }
        break;

      case 'Escape':
        if (this.isDragging) {
          event.preventDefault();
          this.cancelKeyboardDrag();
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.isDragging) {
          event.preventDefault();
          this.moveWithKeyboard(event.key);
        }
        break;
    }
  }

  // ===== DRAG OPERATIONS =====

  private startDrag(event: MouseEvent | TouchEvent): void {
    if (!this.appDraggableSnap) return;

    this.isDragging = true;
    const element = this.elementRef.nativeElement;

    // Actualizar ARIA state
    this.renderer.setAttribute(element, 'aria-grabbed', 'true');
    
    // Iniciar drag en el servicio
    this.dndService.startDrag(this.appDraggableSnap, element, event);

    // Emit drag start event
    this.ngZone.run(() => {
      const { clientX, clientY } = this.getClientCoordinates(event);
      this.dragStart.emit({
        task: this.appDraggableSnap!,
        element,
        position: { x: clientX, y: clientY },
        sourceColumn: this.appDraggableSnap!.status
      });
    });
  }

  private endDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    
    // Actualizar ARIA state
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-grabbed', 'false');
    
    // Finalizar drag en el servicio
    this.dndService.drop();
  }

  private startKeyboardDrag(): void {
    if (!this.appDraggableSnap) return;

    this.isDragging = true;
    this.keyboardMode = true;
    const element = this.elementRef.nativeElement;

    // Mock mouse event for keyboard drag
    const rect = element.getBoundingClientRect();
    const mockEvent = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      preventDefault: () => {}
    } as MouseEvent;

    // Actualizar ARIA state
    this.renderer.setAttribute(element, 'aria-grabbed', 'true');

    // Iniciar drag en el servicio
    this.dndService.startDrag(this.appDraggableSnap, element, mockEvent);

    // Emit event
    this.ngZone.run(() => {
      this.dragStart.emit({
        task: this.appDraggableSnap!,
        element,
        position: { x: mockEvent.clientX, y: mockEvent.clientY },
        sourceColumn: this.appDraggableSnap!.status
      });
    });
  }

  private endKeyboardDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.keyboardMode = false;
    
    // Actualizar ARIA state
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-grabbed', 'false');
    
    // Finalizar drag
    this.dndService.drop();
  }

  private cancelKeyboardDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.keyboardMode = false;
    
    // Actualizar ARIA state
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-grabbed', 'false');
    
    // Cancelar drag
    this.dndService.cancelDrag('escape');
  }

  private moveWithKeyboard(direction: string): void {
    if (!this.isDragging) return;

    const step = 20; // Pixels per step
    const currentState = this.dndService.currentDragState;
    let newX = currentState.currentPosition.x;
    let newY = currentState.currentPosition.y;

    switch (direction) {
      case 'ArrowUp':
        newY -= step;
        break;
      case 'ArrowDown':
        newY += step;
        break;
      case 'ArrowLeft':
        newX -= step;
        break;
      case 'ArrowRight':
        newX += step;
        break;
    }

    // Actualizar posición
    this.dndService.updateDrag(newX, newY);
  }

  // ===== UTILIDADES =====

  private getClientCoordinates(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if ('touches' in event) {
      const touch = this.touchIdentifier !== undefined 
        ? Array.from(event.touches).find(t => t.identifier === this.touchIdentifier)
        : event.touches[0];
      
      return touch ? { clientX: touch.clientX, clientY: touch.clientY } : { clientX: 0, clientY: 0 };
    }
    
    return { clientX: event.clientX, clientY: event.clientY };
  }

  private updateElementState(isDragging: boolean): void {
    const element = this.elementRef.nativeElement;
    
    if (isDragging) {
      this.renderer.addClass(element, 'is-dragging');
      this.renderer.setStyle(element, 'pointer-events', 'none');
    } else {
      this.renderer.removeClass(element, 'is-dragging');
      this.renderer.removeStyle(element, 'pointer-events');
    }
  }

  private cleanup(): void {
    this.mousePressed = false;
    this.isDragging = false;
    this.keyboardMode = false;
    this.touchIdentifier = undefined;
    this.focusedElement = undefined;
  }

  // ===== HOST LISTENERS (FALLBACK) =====

  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): void {
    if (this.isDragging) {
      event.preventDefault();
    }
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: Event): void {
    event.preventDefault();
  }
}