// Interfaces basadas en la estructura de base de datos proporcionada

export interface Board {
  id: number;
  title: string;
  workspace_id: number | null;
  created_at: string;
  updated_at: string;
  tasks_total: number;
  tasks_completed: number;
  tasks_pending: number;
  description: string | null;
  icon: string;
  theme_color: string;
  theme: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  board_id: number;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  position: number; // Para ordenamiento dentro del estado
  assignees?: TaskAssignee[];
}

export interface TaskAssignee {
  id: number;
  task_id: number;
  user_id: number;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Interfaces para el componente Board (presentación)
export interface BoardColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export interface BoardData {
  board: Board;
  columns: BoardColumn[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

// Interface para crear nuevas tareas
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignees: number[];
  due_date?: string;
  status?: TaskStatus;
}

// Interface para actualizar tareas
export interface UpdateTaskData extends Partial<CreateTaskData> {
  position?: number;
  status?: TaskStatus;
}

// Interface para drag & drop
export interface DragDropResult {
  taskId: number;
  sourceColumnId: TaskStatus;
  targetColumnId: TaskStatus;
  newPosition: number;
}

// ===== DRAG & DROP AVANZADO CON ANIME.JS =====

// Estado global del drag & drop
export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  sourceColumn: TaskStatus | null;
  targetColumn: TaskStatus | null;
  targetIndex: number;
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
  startTime: number;
}

// Configuración del sistema de snap
export interface SnapConfig {
  // Configuración de la cuadrícula vertical
  grid: {
    enabled: boolean;
    slotHeight: number; // Altura de cada "slot" de tarjeta
    gap: number; // Espacio entre tarjetas
    dynamicHeight: boolean; // Calcular altura dinámicamente
  };
  
  // Configuración de targets horizontales (columnas)
  targets: {
    enabled: boolean;
    tolerance: number; // Distancia mínima para activar snap
    smoothing: number; // Suavizado durante el drag (0-1)
  };
  
  // Umbrales y tolerancias
  thresholds: {
    snapThreshold: number; // Píxeles para evitar "bailes"
    dragThreshold: number; // Movimiento mínimo para iniciar drag
    autoScrollThreshold: number; // Distancia del borde para activar auto-scroll
  };
}

// Configuración de auto-scroll
export interface AutoScrollConfig {
  vertical: {
    enabled: boolean;
    speed: number; // Velocidad de scroll (px/frame)
    zone: number; // Tamaño de la zona de activación (px)
    maxSpeed: number; // Velocidad máxima
  };
  horizontal: {
    enabled: boolean;
    speed: number;
    zone: number;
    maxSpeed: number;
  };
}

// Configuración de accesibilidad
export interface AccessibilityConfig {
  keyboard: {
    enabled: boolean;
    moveStep: number; // Píxeles por paso con teclado
    announceChanges: boolean; // Anunciar cambios via ARIA live
  };
  announcements: {
    onPickup: string;
    onMove: string;
    onDrop: string;
    onCancel: string;
  };
}

// Eventos del drag & drop
export interface DragEvents {
  onDragStart?: (event: DragStartEvent) => void;
  onDrag?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEnterEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragLeave?: (event: DragLeaveEvent) => void;
  onDrop?: (event: DropEvent) => void;
  onCancel?: (event: CancelEvent) => void;
}

// Eventos específicos
export interface DragStartEvent {
  task: Task;
  element: HTMLElement;
  position: { x: number; y: number };
  sourceColumn: TaskStatus;
}

export interface DragEvent {
  task: Task;
  element: HTMLElement;
  position: { x: number; y: number };
  delta: { x: number; y: number };
}

export interface DragEnterEvent {
  task: Task;
  targetColumn: TaskStatus;
  targetIndex: number;
}

export interface DragOverEvent {
  task: Task;
  targetColumn: TaskStatus;
  targetIndex: number;
  position: { x: number; y: number };
}

export interface DragLeaveEvent {
  task: Task;
  sourceColumn: TaskStatus;
}

export interface DropEvent {
  task: Task;
  sourceColumn: TaskStatus;
  targetColumn: TaskStatus;
  targetIndex: number;
  newPosition: number;
}

export interface CancelEvent {
  task: Task;
  sourceColumn: TaskStatus;
  reason: 'escape' | 'outside' | 'error';
}

// Configuración del ghost/clone
export interface GhostConfig {
  enabled: boolean;
  opacity: number;
  scale: number;
  zIndex: number;
  className?: string;
}

// Configuración del placeholder
export interface PlaceholderConfig {
  enabled: boolean;
  opacity: number;
  height: number | 'auto';
  backgroundColor?: string;
  borderStyle?: string;
  animationDuration: number;
}

// Configuración completa del sistema de drag & drop
export interface DndSystemConfig {
  snap: SnapConfig;
  autoScroll: AutoScrollConfig;
  accessibility: AccessibilityConfig;
  ghost: GhostConfig;
  placeholder: PlaceholderConfig;
  events: DragEvents;
  debug?: boolean;
}

// Información de posición calculada
export interface PositionInfo {
  column: TaskStatus;
  index: number;
  slot: { x: number; y: number; width: number; height: number };
  isValid: boolean;
}

// Estado de las columnas para el snap
export interface ColumnSnapInfo {
  id: TaskStatus;
  element: HTMLElement;
  bounds: DOMRect;
  centerX: number;
  slots: SlotInfo[];
}

export interface SlotInfo {
  index: number;
  bounds: DOMRect;
  centerY: number;
  occupied: boolean;
  taskId?: number;
}