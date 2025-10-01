import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Board, BoardData, BoardColumn, Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData, TaskAssignee } from '../../types/board.types';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  
  // Mock data storage
  private mockBoards: Board[] = [
    {
      id: 1,
      title: 'Desarrollo Frontend',
      workspace_id: 1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      tasks_total: 8,
      tasks_completed: 2,
      tasks_pending: 6,
      description: 'Board para tareas de desarrollo frontend del proyecto FlowTask',
      icon: 'fa-code',
      theme_color: '#0075A2',
      theme: 'cerulean'
    },
    {
      id: 2,
      title: 'Diseño UI/UX',
      workspace_id: 1,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      tasks_total: 10,
      tasks_completed: 7,
      tasks_pending: 3,
      description: 'Diseños y prototipos de interfaces de usuario',
      icon: 'fa-palette',
      theme_color: '#6A4C93',
      theme: 'violet'
    },
    {
      id: 3,
      title: 'Testing y QA',
      workspace_id: 1,
      created_at: '2024-01-12T11:00:00Z',
      updated_at: '2024-01-19T13:00:00Z',
      tasks_total: 6,
      tasks_completed: 3,
      tasks_pending: 3,
      description: 'Pruebas y aseguramiento de calidad',
      icon: 'fa-bug',
      theme_color: '#10B981',
      theme: 'emerald'
    },
    {
      id: 4,
      title: 'DevOps y Deploy',
      workspace_id: 1,
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-16T18:00:00Z',
      tasks_total: 5,
      tasks_completed: 4,
      tasks_pending: 1,
      description: 'Configuración de servidores y despliegues',
      icon: 'fa-server',
      theme_color: '#F97316',
      theme: 'orange'
    }
  ];

  private mockTasks: Task[] = [
    // Tasks for Board 1 (Frontend Development)
    {
      id: 1,
      title: 'Diseñar componente de login',
      description: 'Crear el diseño responsive para el componente de autenticación',
      board_id: 1,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      due_date: '2024-01-25T00:00:00Z',
      position: 0
    },
    {
      id: 2,
      title: 'Implementar validación de formularios',
      description: 'Agregar validaciones para todos los campos del formulario',
      board_id: 1,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      due_date: null,
      position: 1
    },
    {
      id: 3,
      title: 'Configurar routing dinámico',
      description: 'Implementar rutas dinámicas para boards y workspaces',
      board_id: 1,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      created_at: '2024-01-16T08:00:00Z',
      updated_at: '2024-01-16T08:00:00Z',
      due_date: '2024-01-30T00:00:00Z',
      position: 2
    },
    {
      id: 4,
      title: 'Optimizar rendimiento del dashboard',
      description: 'Mejorar la velocidad de carga y reducir el tiempo de renderizado',
      board_id: 1,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      created_at: '2024-01-16T09:00:00Z',
      updated_at: '2024-01-18T14:00:00Z',
      due_date: '2024-01-22T00:00:00Z',
      position: 0
    },
    {
      id: 5,
      title: 'Agregar animaciones con Anime.js',
      description: 'Implementar animaciones suaves para mejorar la UX',
      board_id: 1,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-19T11:00:00Z',
      due_date: null,
      position: 1
    },
    {
      id: 6,
      title: 'Revisar código del componente de workspace',
      description: 'Code review del componente desarrollado por el equipo',
      board_id: 1,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-19T16:00:00Z',
      due_date: null,
      position: 0
    },
    {
      id: 7,
      title: 'Configurar routing de la aplicación',
      description: 'Implementar todas las rutas necesarias para la navegación',
      board_id: 1,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-15T17:00:00Z',
      due_date: null,
      position: 0
    },
    {
      id: 8,
      title: 'Setup inicial del proyecto Angular',
      description: 'Configuración inicial del framework y dependencias',
      board_id: 1,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-12T17:00:00Z',
      due_date: null,
      position: 1
    }
  ];

  private boardDataSubject = new BehaviorSubject<BoardData | null>(null);
  public boardData$ = this.boardDataSubject.asObservable();

  constructor() { }

  /**
   * Obtiene los datos completos de un board incluyendo sus tareas organizadas por columnas
   */
  getBoardData(boardId: number): Observable<BoardData> {
    const board = this.mockBoards.find(b => b.id === boardId);
    
    if (!board) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    const boardTasks = this.mockTasks.filter(task => task.board_id === boardId);
    
    const columns: BoardColumn[] = [
      {
        id: TaskStatus.TODO,
        title: 'Por Hacer',
        color: '#6B7280',
        tasks: boardTasks.filter(task => task.status === TaskStatus.TODO).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'En Progreso',
        color: '#F59E0B',
        tasks: boardTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.IN_REVIEW,
        title: 'En Revisión',
        color: '#8B5CF6',
        tasks: boardTasks.filter(task => task.status === TaskStatus.IN_REVIEW).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.DONE,
        title: 'Completado',
        color: '#10B981',
        tasks: boardTasks.filter(task => task.status === TaskStatus.DONE).sort((a, b) => a.position - b.position)
      }
    ];

    const completedTasks = columns.find(col => col.id === TaskStatus.DONE)?.tasks.length || 0;
    
    const boardData: BoardData = {
      board: board,
      columns: columns,
      totalTasks: boardTasks.length,
      completedTasks: completedTasks,
      pendingTasks: boardTasks.length - completedTasks
    };

    this.boardDataSubject.next(boardData);
    
    // Simular delay de API
    return of(boardData).pipe(delay(300));
  }

  /**
   * Obtiene todos los boards de un workspace
   */
  getBoardsByWorkspace(workspaceId: number): Observable<Board[]> {
    const workspaceBoards = this.mockBoards.filter(board => board.workspace_id === workspaceId);
    
    // Calcular estadísticas actualizadas para cada board
    const boardsWithStats = workspaceBoards.map(board => {
      const boardTasks = this.mockTasks.filter(task => task.board_id === board.id);
      const completedTasks = boardTasks.filter(task => task.status === TaskStatus.DONE).length;
      
      return {
        ...board,
        tasks_total: boardTasks.length,
        tasks_completed: completedTasks,
        tasks_pending: boardTasks.length - completedTasks,
        updated_at: new Date().toISOString()
      };
    });
    
    return of(boardsWithStats).pipe(delay(200));
  }

  /**
   * Crea una nueva tarea en un board
   */
  createTask(boardId: number, taskData: CreateTaskData): Observable<Task> {
    const board = this.mockBoards.find(b => b.id === boardId);
    
    if (!board) {
      throw new Error(`Board with ID ${boardId} not found`);
    }

    // Obtener la posición correcta en la columna de destino
    const columnTasks = this.mockTasks.filter(
      task => task.board_id === boardId && task.status === (taskData.status || TaskStatus.TODO)
    );
    
    const newTask: Task = {
      id: Date.now(), // En producción sería generado por el backend
      title: taskData.title,
      description: taskData.description || null,
      board_id: boardId,
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: taskData.due_date || null,
      position: columnTasks.length,
      assignees: []
    };

    // Agregar la tarea a los datos mock
    this.mockTasks.push(newTask);

    // Actualizar estadísticas del board
    board.tasks_total++;
    board.updated_at = new Date().toISOString();
    
    // Refrescar datos del board si está siendo observado
    this.refreshBoardData(boardId);
    
    return of(newTask).pipe(delay(150));
  }

  /**
   * Actualiza una tarea existente
   */
  updateTask(taskId: number, updates: UpdateTaskData): Observable<Task> {
    const taskIndex = this.mockTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const existingTask = this.mockTasks[taskIndex];
    const boardId = existingTask.board_id;

    // Si cambió el status, reorganizar posiciones
    if (updates.status && updates.status !== existingTask.status) {
      // Actualizar posiciones en la columna origen
      this.reorderTasksInColumn(boardId, existingTask.status, taskId);
      
      // Actualizar posiciones en la columna destino (después de mover la tarea)
      // La reorganización se hará después de actualizar la tarea
    }

    // Actualizar la tarea
    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      id: taskId, // Asegurar que el ID no cambie
      updated_at: new Date().toISOString(),
      // Mantener assignees del existingTask por ahora (simplificado)
      assignees: existingTask.assignees
    };

    this.mockTasks[taskIndex] = updatedTask;

    // Si cambió el status, reorganizar la nueva columna
    if (updates.status && updates.status !== existingTask.status) {
      this.reorderTasksInColumn(boardId, updates.status);
    }

    // Actualizar estadísticas del board
    const board = this.mockBoards.find(b => b.id === boardId);
    if (board) {
      board.updated_at = new Date().toISOString();
      
      // Recalcular estadísticas si cambió el status
      if (updates.status) {
        this.recalculateBoardStats(boardId);
      }
    }
    
    // Refrescar datos del board
    this.refreshBoardData(boardId);
    
    return of(updatedTask).pipe(delay(150));
  }

  /**
   * Elimina una tarea
   */
  deleteTask(taskId: number): Observable<boolean> {
    const taskIndex = this.mockTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const task = this.mockTasks[taskIndex];
    const boardId = task.board_id;
    
    // Eliminar la tarea
    this.mockTasks.splice(taskIndex, 1);
    
    // Reordenar posiciones en la columna
    this.reorderTasksInColumn(boardId, task.status);

    // Actualizar estadísticas del board
    const board = this.mockBoards.find(b => b.id === boardId);
    if (board) {
      board.tasks_total--;
      board.updated_at = new Date().toISOString();
      this.recalculateBoardStats(boardId);
    }
    
    // Refrescar datos del board
    this.refreshBoardData(boardId);
    
    return of(true).pipe(delay(100));
  }

  /**
   * Mueve una tarea a una nueva posición/columna
   */
  moveTask(taskId: number, targetStatus: TaskStatus, newPosition: number): Observable<Task> {
    const updates: UpdateTaskData = { 
      status: targetStatus, 
      position: newPosition 
    };
    return this.updateTask(taskId, updates);
  }

  /**
   * Reordena las tareas dentro de una columna
   */
  private reorderTasksInColumn(
    boardId: number, 
    status: TaskStatus, 
    excludeTaskId?: number
  ): void {
    const columnTasks = this.mockTasks
      .filter(task => task.board_id === boardId && task.status === status)
      .filter(task => !excludeTaskId || task.id !== excludeTaskId)
      .sort((a, b) => a.position - b.position);

    // Reordenar posiciones secuencialmente
    columnTasks.forEach((task, index) => {
      task.position = index;
    });
  }

  /**
   * Recalcula las estadísticas de un board
   */
  private recalculateBoardStats(boardId: number): void {
    const board = this.mockBoards.find(b => b.id === boardId);
    if (!board) return;

    const boardTasks = this.mockTasks.filter(task => task.board_id === boardId);
    const completedTasks = boardTasks.filter(task => task.status === TaskStatus.DONE).length;
    
    board.tasks_total = boardTasks.length;
    board.tasks_completed = completedTasks;
    board.tasks_pending = boardTasks.length - completedTasks;
  }

  /**
   * Refresca los datos del board en el observable
   */
  private refreshBoardData(boardId: number): void {
    const board = this.mockBoards.find(b => b.id === boardId);
    
    if (!board) return;

    const boardTasks = this.mockTasks.filter(task => task.board_id === boardId);
    
    const columns: BoardColumn[] = [
      {
        id: TaskStatus.TODO,
        title: 'Por Hacer',
        color: '#6B7280',
        tasks: boardTasks.filter(task => task.status === TaskStatus.TODO).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'En Progreso',
        color: '#F59E0B',
        tasks: boardTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.IN_REVIEW,
        title: 'En Revisión',
        color: '#8B5CF6',
        tasks: boardTasks.filter(task => task.status === TaskStatus.IN_REVIEW).sort((a, b) => a.position - b.position)
      },
      {
        id: TaskStatus.DONE,
        title: 'Completado',
        color: '#10B981',
        tasks: boardTasks.filter(task => task.status === TaskStatus.DONE).sort((a, b) => a.position - b.position)
      }
    ];

    const completedTasks = columns.find(col => col.id === TaskStatus.DONE)?.tasks.length || 0;
    
    const boardData: BoardData = {
      board: board,
      columns: columns,
      totalTasks: boardTasks.length,
      completedTasks: completedTasks,
      pendingTasks: boardTasks.length - completedTasks
    };

    this.boardDataSubject.next(boardData);
  }

  /**
   * Crea un nuevo board
   */
  createBoard(workspaceId: number, boardData: Partial<Board>): Observable<Board> {
    const newBoard: Board = {
      id: Date.now(),
      title: boardData.title || 'Nuevo Board',
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks_total: 0,
      tasks_completed: 0,
      tasks_pending: 0,
      description: boardData.description || null,
      icon: boardData.icon || 'fa-clipboard-list',
      theme_color: boardData.theme_color || '#0075A2',
      theme: boardData.theme || 'custom'
    };

    this.mockBoards.push(newBoard);
    
    return of(newBoard).pipe(delay(200));
  }
}