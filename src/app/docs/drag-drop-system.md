# Sistema de Drag & Drop Avanzado con Anime.js

## Descripción

Sistema completo de drag & drop para tableros tipo Trello implementado con Angular y anime.js, que incluye snap grid, auto-scroll, accesibilidad completa y animaciones fluidas.

## Características

### 🎯 Snap Grid Inteligente
- **Grid vertical**: Snap automático a slots de tarjetas con altura configurable
- **Targets horizontales**: Snap al centro de cada columna/lista
- **Cálculo dinámico**: Ajuste automático de posiciones basado en contenido
- **Tolerancias configurables**: Prevención de "bailes" entre slots

### 🖱️ Interacción Multi-Modal
- **Mouse**: Drag & drop completo con threshold configurable
- **Touch**: Soporte nativo para dispositivos móviles
- **Teclado**: Navegación completa con flechas, Enter y Escape

### ♿ Accesibilidad Completa
- **ARIA**: Roles, estados y propiedades semánticas
- **Screen Readers**: Anuncios en vivo de cambios de estado
- **Navegación**: Soporte completo de teclado
- **Focus Management**: Indicadores visuales claros

### 🎨 Animaciones Fluidas
- **Ghost Element**: Clone visual durante el drag
- **Placeholder**: Indicador de posición de destino
- **Smooth Transitions**: Animaciones con easing avanzado
- **GPU Acceleration**: Uso de transform3d para máximo rendimiento

### 📱 Auto-Scroll
- **Vertical**: Scroll automático en listas largas
- **Horizontal**: Scroll del tablero completo
- **Zonas configurables**: Distancia y velocidad ajustables
- **Aceleración progresiva**: Velocidad basada en proximidad al borde

## Arquitectura

```
src/
├── types/
│   └── board.types.ts          # Interfaces y tipos TypeScript
├── service/
│   ├── dnd.service.ts          # Servicio global de DnD
│   └── board.service.ts        # Servicio de datos del board
├── directives/
│   └── draggable-snap.directive.ts # Directiva para elementos draggables
└── pages/board/
    ├── board.component.ts      # Componente principal del board
    ├── board.component.html    # Template con directivas
    └── board.component.css     # Estilos del sistema de DnD
```

## Uso Básico

### 1. Importar y Configurar

```typescript
// En tu componente
import { DraggableSnapDirective } from './directives/draggable-snap.directive';
import { DndService } from './service/dnd.service';
import { DndSystemConfig } from './types/board.types';

@Component({
  imports: [DraggableSnapDirective],
  // ...
})
export class BoardComponent {
  // Configuración del sistema
  dndConfig: DndSystemConfig = {
    snap: {
      grid: {
        enabled: true,
        slotHeight: 120,
        gap: 12,
        dynamicHeight: true
      },
      targets: {
        enabled: true,
        tolerance: 60,
        smoothing: 0.2
      }
    },
    // ... más configuración
  };

  constructor(private dndService: DndService) {
    // Configurar el servicio
    this.dndService.configure(this.dndConfig);
  }
}
```

### 2. Template HTML

```html
<!-- Contenedor de columnas -->
<div class="kanban-board">
  
  <!-- Columna -->
  <div *ngFor="let column of columns" 
       class="board-column"
       [attr.data-column-id]="column.id"
       role="list"
       [attr.aria-label]="column.title">
    
    <!-- Lista de tareas -->
    <div class="space-y-3">
      
      <!-- Tarea draggable -->
      <div *ngFor="let task of column.tasks" 
           class="task-card"
           [attr.data-task-id]="task.id"
           [appDraggableSnap]="task"
           [dragConfig]="dndConfig"
           (dragStart)="onDragStart($event)"
           (drop)="onDrop($event)"
           (cancel)="onDragCancel($event)"
           role="listitem"
           tabindex="0">
        
        <!-- Contenido de la tarea -->
        <h4>{{ task.title }}</h4>
        <p>{{ task.description }}</p>
        
      </div>
    </div>
  </div>
</div>
```

### 3. Manejar Eventos

```typescript
export class BoardComponent {
  
  onDragStart(event: DragStartEvent): void {
    console.log('Drag iniciado:', event.task.title);
    // Lógica adicional al iniciar drag
  }

  onDrop(event: DropEvent): void {
    // Actualizar datos
    this.boardService.updateTask(event.task.id, {
      status: event.targetColumn,
      position: event.targetIndex
    }).subscribe({
      next: (updatedTask) => {
        console.log('Tarea movida exitosamente');
      },
      error: (error) => {
        console.error('Error al mover tarea:', error);
      }
    });
  }

  onDragCancel(event: CancelEvent): void {
    console.log('Drag cancelado:', event.reason);
    // Manejar cancelación
  }
}
```

## Configuración Avanzada

### Personalizar Snap Grid

```typescript
const snapConfig: SnapConfig = {
  grid: {
    enabled: true,
    slotHeight: 100,        // Altura de cada slot
    gap: 8,                 // Espacio entre slots
    dynamicHeight: false    // Usar altura fija
  },
  targets: {
    enabled: true,
    tolerance: 80,          // Distancia máxima para snap
    smoothing: 0.15         // Suavizado (0-1)
  },
  thresholds: {
    snapThreshold: 12,      // Píxeles anti-baile
    dragThreshold: 8,       // Movimiento mínimo
    autoScrollThreshold: 50 // Zona de auto-scroll
  }
};
```

### Configurar Auto-Scroll

```typescript
const autoScrollConfig: AutoScrollConfig = {
  vertical: {
    enabled: true,
    speed: 3,      // Velocidad base
    zone: 60,      // Tamaño de zona de activación
    maxSpeed: 15   // Velocidad máxima
  },
  horizontal: {
    enabled: true,
    speed: 2,
    zone: 50,
    maxSpeed: 10
  }
};
```

### Personalizar Accesibilidad

```typescript
const accessibilityConfig: AccessibilityConfig = {
  keyboard: {
    enabled: true,
    moveStep: 10,           // Píxeles por paso con flechas
    announceChanges: true   // Anuncios para screen readers
  },
  announcements: {
    onPickup: 'Tarjeta seleccionada. Use flechas para mover.',
    onMove: 'Moviendo a {column}, posición {position}',
    onDrop: 'Tarjeta movida a {column}',
    onCancel: 'Movimiento cancelado'
  }
};
```

## API Reference

### Interfaces Principales

#### `DndSystemConfig`
Configuración completa del sistema de drag & drop.

```typescript
interface DndSystemConfig {
  snap: SnapConfig;
  autoScroll: AutoScrollConfig;
  accessibility: AccessibilityConfig;
  ghost: GhostConfig;
  placeholder: PlaceholderConfig;
  events: DragEvents;
  debug?: boolean;
}
```

#### `DragState`
Estado global del sistema de drag & drop.

```typescript
interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  sourceColumn: TaskStatus | null;
  targetColumn: TaskStatus | null;
  targetIndex: number;
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
  startTime: number;
}
```

#### Eventos Disponibles

- `DragStartEvent`: Se dispara al iniciar el drag
- `DragEvent`: Se dispara durante el movimiento
- `DragEnterEvent`: Se dispara al entrar en una zona válida
- `DragOverEvent`: Se dispara mientras está sobre una zona
- `DragLeaveEvent`: Se dispara al salir de una zona
- `DropEvent`: Se dispara al soltar la tarea
- `CancelEvent`: Se dispara al cancelar el drag

### Métodos del Servicio

#### `DndService`

```typescript
class DndService {
  // Configuración
  configure(config: Partial<DndSystemConfig>): void;
  
  // Control de drag
  startDrag(task: Task, element: HTMLElement, event: MouseEvent | TouchEvent): void;
  updateDrag(clientX: number, clientY: number): void;
  drop(): void;
  cancelDrag(reason?: 'escape' | 'outside' | 'error'): void;
  
  // Estado
  get dragState$(): Observable<DragState>;
  get isDragging(): boolean;
  get currentDragState(): DragState;
  
  // Utilidades
  updateColumnsInfo(): void;
  destroy(): void;
}
```

## Estilos CSS Incluidos

El sistema incluye estilos CSS completos:

- **Estados de drag**: `.dnd-dragging`, `.is-dragging`
- **Ghost element**: `.board-drag-ghost`
- **Placeholder**: `.dnd-placeholder` con animaciones
- **Drop zones**: `.drop-zone-active` con efectos visuales
- **Accesibilidad**: Estados de focus y ARIA
- **Responsive**: Ajustes para móviles
- **Dark mode**: Soporte completo para tema oscuro

## Navegación por Teclado

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre tareas |
| `Espacio` / `Enter` | Seleccionar/soltar tarea |
| `↑` `↓` `←` `→` | Mover tarea seleccionada |
| `Escape` | Cancelar movimiento |

## Rendimiento

### Optimizaciones Implementadas

- **GPU Acceleration**: Uso de `transform3d` y `will-change`
- **OnPush Strategy**: Detección de cambios optimizada
- **Throttling**: Eventos de movimiento limitados a 60fps
- **Reutilización**: Elementos DOM reutilizados durante el drag
- **Cleanup**: Limpieza automática de listeners y animaciones

### Métricas Recomendadas

- **Tiempo de respuesta**: < 16ms para 60fps
- **Memoria**: Limpieza automática de referencias
- **CPU**: Uso eficiente con `requestAnimationFrame`

## Compatibilidad

- **Navegadores**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Dispositivos**: Desktop y móvil
- **Frameworks**: Angular 15+
- **Screen Readers**: NVDA, JAWS, VoiceOver

## Troubleshooting

### Problemas Comunes

1. **Tarjetas no se mueven**
   - Verificar que `[appDraggableSnap]` tenga una tarea válida
   - Comprobar que `dragDisabled` no esté en `true`

2. **Snap no funciona**
   - Asegurar que las columnas tengan `[data-column-id]`
   - Verificar configuración de `tolerance` en `snapConfig`

3. **Auto-scroll muy rápido/lento**
   - Ajustar `speed` y `maxSpeed` en `autoScrollConfig`
   - Modificar `zone` para cambiar área de activación

4. **Problemas de accesibilidad**
   - Verificar que los elementos tengan `role` y `aria-label`
   - Comprobar que `announceChanges` esté habilitado

### Debug Mode

Activar modo debug para logs detallados:

```typescript
dndConfig.debug = true;
```

## Ejemplos Completos

Ver `BoardComponent` para implementación completa con:
- Configuración del sistema
- Manejo de eventos
- Integración con servicios de datos
- Estilos CSS completos
- Soporte de accesibilidad

## Contribución

Para extender el sistema:

1. **Nuevos eventos**: Agregar a `DragEvents` interface
2. **Configuraciones**: Extender `DndSystemConfig`
3. **Animaciones**: Modificar estilos CSS o agregar a anime.js calls
4. **Plataformas**: Agregar soporte en `DraggableSnapDirective`