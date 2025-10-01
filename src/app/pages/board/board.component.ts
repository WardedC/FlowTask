import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../service/theme.service';
import { animate, createTimeline, stagger } from 'animejs';
import { 
  Board, 
  BoardData, 
  BoardColumn, 
  Task, 
  TaskStatus, 
  TaskPriority, 
  CreateTaskData, 
  UpdateTaskData, 
  DragDropResult,
  DndSystemConfig,
  DropEvent,
  DragStartEvent,
  CancelEvent
} from '../../../types/board.types';
import { BoardService } from '../../service/board.service';
import { DndService } from '../../service/dnd.service';
import { DraggableSnapDirective } from '../../directives/draggable-snap.directive';
import { getOptimalDndConfig } from '../../configs/dnd-configs';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DraggableSnapDirective],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
  boardId: string | null = null;
  workspaceId: string | null = null;
  boardData: BoardData | null = null;
  isDarkMode: boolean = false;
  private themeSubscription: Subscription = new Subscription();

  // Drag & Drop configuración avanzada (detecta automáticamente la óptima)
  dndConfig: DndSystemConfig;

  // Tracking para nuevas tarjetas y animaciones
  private newTaskIds = new Set<number>();
  private lastTaskCount = 0;

  // Modal properties para crear task
  isTaskModalOpen = false;
  newTask: CreateTaskData = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assignees: [],
    due_date: '',
    status: TaskStatus.TODO
  };

  // Task status enum para template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  @ViewChildren('columnContainer') columnContainers!: QueryList<ElementRef>;
  @ViewChildren('taskCard') taskCards!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private boardService: BoardService,
    private dndService: DndService
  ) {
    // Configurar el sistema de DnD con la configuración óptima para el dispositivo
    this.dndConfig = getOptimalDndConfig();
    
    // Agregar los event handlers
    this.dndConfig.events = {
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onCancel: this.onDragCancel.bind(this)
    };
  }

  ngOnInit(): void {
    // Obtener IDs de la ruta
    this.boardId = this.route.snapshot.paramMap.get('boardId');
    this.workspaceId = this.route.snapshot.paramMap.get('id');
    
    // Configurar el servicio de drag & drop
    this.dndService.configure(this.dndConfig);
    
    // Suscribirse al tema
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
      this.cdr.markForCheck();
    });
    
    // Suscribirse a cambios en los datos del board
    this.themeSubscription.add(
      this.boardService.boardData$.subscribe(boardData => {
        if (boardData) {
          this.boardData = { ...boardData }; // Crear una copia para forzar detección de cambios
          this.cdr.markForCheck(); // Usar markForCheck con OnPush strategy
          
          // Actualizar tracking de tareas
          this.updateTaskCount();
          
          // Notificar al servicio de DnD que las columnas cambiaron
          setTimeout(() => {
            this.dndService.updateColumnsInfo();
          }, 50);
        }
      })
    );
    
    // Cargar datos del board
    this.loadBoardData();
    
    // Inicializar conteo de tareas
    this.updateTaskCount();
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Animar entrada después de que la vista esté lista
    setTimeout(() => {
      this.animateEntrance();
    }, 100);

    // Configurar observadores para manejar cambios dinámicos
    this.setupResizeObserver();
  }

  /**
   * Configura observadores para cambios de tamaño
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        // Actualizar información de columnas cuando cambie el tamaño
        if (this.dndService.isDragging) {
          this.dndService.updateColumnsInfo();
        }
      });

      // Observar el contenedor del board
      const boardContainer = document.querySelector('.kanban-board');
      if (boardContainer) {
        resizeObserver.observe(boardContainer);
      }

      // Limpiar el observador al destruir el componente
      this.themeSubscription.add(() => {
        resizeObserver.disconnect();
      });
    }
  }

  private loadBoardData(): void {
    // Usar un ID fijo por ahora (en producción mapearías el string del boardId a un número)
    const numericBoardId = 1; // Por simplicidad, usar siempre el board con ID 1
    
    this.boardService.getBoardData(numericBoardId).subscribe({
      next: (boardData) => {
        this.boardData = boardData;
        console.log('Board data loaded:', boardData);
      },
      error: (error) => {
        console.error('Error loading board data:', error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    });
  }

  private animateEntrance(): void {
    // Animar entrada del board
    animate('.board-header', {
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 400,
      easing: 'easeOutExpo'
    });

    animate('.board-column', {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 500,
      delay: stagger(100),
      easing: 'easeOutExpo'
    });

    animate('.task-card', {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 400,
      delay: stagger(50),
      easing: 'easeOutExpo'
    });
  }

  goBack(): void {
    this.router.navigateByUrl(`/home/workspaces/${this.workspaceId}`);
  }

  // ===== EVENTOS DEL SISTEMA DE DRAG & DROP =====

  /**
   * Maneja el inicio del drag de una tarea
   */
  onDragStart(event: DragStartEvent): void {
    console.log('Drag started:', event.task.title);
    // Aquí puedes agregar lógica adicional cuando inicia el drag
    // Por ejemplo, cambiar el estado visual de otras columnas
  }

  /**
   * Maneja el drop de una tarea
   */
  onDrop(event: DropEvent): void {
    console.log('Task dropped:', {
      task: event.task.title,
      from: event.sourceColumn,
      to: event.targetColumn,
      position: event.targetIndex
    });

    // Actualizar datos localmente primero para respuesta inmediata
    this.updateLocalBoardData(event);

    // Luego actualizar en el servidor
    this.boardService.updateTask(event.task.id, {
      status: event.targetColumn,
      position: event.targetIndex
    }).subscribe({
      next: (updatedTask) => {
        console.log('Task moved successfully:', updatedTask);
        // Los datos ya fueron actualizados localmente, no necesitamos hacer nada más
      },
      error: (error) => {
        console.error('Error moving task:', error);
        // En caso de error, revertir los cambios locales
        this.revertLocalBoardData(event);
        // Mostrar notificación de error al usuario
        this.showErrorNotification('Error al mover la tarea. Intenta nuevamente.');
      }
    });
  }

  /**
   * Actualiza los datos del board localmente para respuesta inmediata
   */
  private updateLocalBoardData(event: DropEvent): void {
    if (!this.boardData) return;

    // Encontrar y remover la tarea de la columna origen
    const sourceColumn = this.boardData.columns.find(col => col.id === event.sourceColumn);
    const targetColumn = this.boardData.columns.find(col => col.id === event.targetColumn);

    if (!sourceColumn || !targetColumn) return;

    const taskIndex = sourceColumn.tasks.findIndex(task => task.id === event.task.id);
    if (taskIndex === -1) return;

    // Remover tarea de la columna origen
    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);

    // Actualizar el status de la tarea
    movedTask.status = event.targetColumn;

    // Agregar tarea a la columna destino en la posición correcta
    targetColumn.tasks.splice(event.targetIndex, 0, movedTask);

    // Actualizar contadores
    this.updateBoardCounters();

    // Forzar detección de cambios
    this.cdr.markForCheck();
  }

  /**
   * Revierte los cambios locales en caso de error
   */
  private revertLocalBoardData(event: DropEvent): void {
    // Recargar datos del servidor para revertir cambios
    this.loadBoardData();
  }

  /**
   * Actualiza los contadores del board
   */
  private updateBoardCounters(): void {
    if (!this.boardData) return;

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;

    this.boardData.columns.forEach(column => {
      totalTasks += column.tasks.length;
      if (column.id === 'done') {
        completedTasks += column.tasks.length;
      } else {
        pendingTasks += column.tasks.length;
      }
    });

    this.boardData.totalTasks = totalTasks;
    this.boardData.completedTasks = completedTasks;
    this.boardData.pendingTasks = pendingTasks;

    // Actualizar también el objeto board
    if (this.boardData.board) {
      this.boardData.board.tasks_total = totalTasks;
      this.boardData.board.tasks_completed = completedTasks;
      this.boardData.board.tasks_pending = pendingTasks;
    }
  }

  /**
   * Muestra una notificación de error
   */
  private showErrorNotification(message: string): void {
    // Implementar notificación de error
    console.error(message);
    // Aquí podrías usar un servicio de notificaciones
  }

  /**
   * Maneja la cancelación del drag
   */
  onDragCancel(event: CancelEvent): void {
    console.log('Drag cancelled:', event.reason);
    // Aquí puedes agregar lógica para cuando se cancela el drag
    // Por ejemplo, mostrar un mensaje al usuario
  }

  /**
   * Actualiza el conteo de tareas y detecta nuevas
   */
  private updateTaskCount(): void {
    if (!this.boardData) return;

    const currentCount = this.boardData.columns.reduce((total, column) => {
      return total + column.tasks.length;
    }, 0);

    // Si hay más tareas que antes, detectar las nuevas
    if (currentCount > this.lastTaskCount) {
      this.detectNewTasks();
    }

    this.lastTaskCount = currentCount;
  }

  /**
   * Detecta y marca nuevas tareas para animación
   */
  private detectNewTasks(): void {
    if (!this.boardData) return;

    this.boardData.columns.forEach(column => {
      column.tasks.forEach(task => {
        if (!this.newTaskIds.has(task.id)) {
          // Esta es una tarea nueva, marcarla temporalmente
          this.newTaskIds.add(task.id);
          
          // Remover el ID después de un tiempo para evitar memory leaks
          setTimeout(() => {
            this.newTaskIds.delete(task.id);
          }, 3000);
        }
      });
    });
  }

  /**
   * Verifica si una tarea es nueva (para aplicar estilos especiales)
   */
  isNewTask(taskId: number): boolean {
    return this.newTaskIds.has(taskId);
  }

  // Métodos para gestión de tareas
  openCreateTaskModal(columnId: TaskStatus): void {
    this.newTask.status = columnId;
    this.isTaskModalOpen = true;
  }

  closeCreateTaskModal(): void {
    this.isTaskModalOpen = false;
    this.resetTaskForm();
  }

  createTask(): void {
    if (!this.newTask.title.trim() || !this.boardData) return;

    // Crear una copia de los datos para evitar problemas de referencia
    const taskData = { ...this.newTask };

    console.log('Creating task:', taskData);

    this.boardService.createTask(this.boardData.board.id, taskData).subscribe({
      next: (createdTask) => {
        console.log('Task created successfully:', createdTask);
        
        // Marcar la tarea como nueva para animación especial
        this.newTaskIds.add(createdTask.id);
        
        this.closeCreateTaskModal();
        
        // Actualizar conteo después de un pequeño delay para dar tiempo a que la UI se actualice
        setTimeout(() => {
          this.updateTaskCount();
        }, 100);
      },
      error: (error) => {
        console.error('Error creating task:', error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    });
  }

  private resetTaskForm(): void {
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      assignees: [],
      due_date: '',
      status: TaskStatus.TODO
    };
  }

  deleteTask(taskId: number): void {
    this.boardService.deleteTask(taskId).subscribe({
      next: (success) => {
        console.log('Task deleted successfully:', taskId);
        // El servicio ya actualiza los datos a través del observable
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        // Podrías mostrar un mensaje de error al usuario aquí
      }
    });
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors = {
      [TaskPriority.LOW]: '#10B981',
      [TaskPriority.MEDIUM]: '#F59E0B',
      [TaskPriority.HIGH]: '#F97316',
      [TaskPriority.URGENT]: '#EF4444'
    };
    return colors[priority];
  }

  getPriorityText(priority: TaskPriority): string {
    const texts = {
      [TaskPriority.LOW]: 'Baja',
      [TaskPriority.MEDIUM]: 'Media',
      [TaskPriority.HIGH]: 'Alta',
      [TaskPriority.URGENT]: 'Urgente'
    };
    return texts[priority];
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  isOverdue(dateString: string | null): boolean {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  // Getter methods for safer template access
  get boardTitle(): string {
    return this.boardData?.board?.title || 'Cargando...';
  }

  get boardDescription(): string {
    return this.boardData?.board?.description || 'Sin descripción';
  }

  get boardThemeColor(): string {
    return this.boardData?.board?.theme_color || '#0075A2';
  }

  get boardIcon(): string {
    return this.boardData?.board?.icon || 'fa-clipboard-list';
  }

  get boardGradient(): string {
    const color = this.boardThemeColor;
    return `linear-gradient(135deg, ${color}, ${color}80)`;
  }

  get boardIconClass(): string {
    return `fas ${this.boardIcon} text-white text-xl`;
  }

  // TrackBy functions para mejorar rendimiento
  trackByColumnId(index: number, column: BoardColumn): TaskStatus {
    return column.id;
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}