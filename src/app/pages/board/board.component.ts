import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  CdkDrag, 
  CdkDropList,
  CdkDragPreview,
  CdkDragPlaceholder,
  CdkDragHandle,
  CdkDragStart,
  CdkDragEnd
} from '@angular/cdk/drag-drop';

type Card = { id: string; title: string; desc?: string; checked?: boolean };
type Column = { id: string; title: string; cards: Card[] };

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, CdkDragPreview, CdkDragPlaceholder, CdkDragHandle],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
  // 🚀 PERFORMANCE: OnPush evita change detection innecesario
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
  
  // Flag para optimizar estilos durante el drag
  isDragging = false;

  columns: Column[] = [
    { id: 'todo', title: 'Por hacer', cards: [
      { id: 'c1', title: 'Configurar entorno de desarrollo', desc: 'Instalar dependencias y configurar VS Code' },
      { id: 'c2', title: 'Diseñar esquema de base de datos', desc: 'Crear modelo de datos para usuarios y proyectos' },
      { id: 'c5', title: 'Revisar documentación de API', desc: 'Leer docs de endpoints REST' },
    ]},
    { id: 'doing', title: 'En progreso', cards: [
      { id: 'c3', title: 'Implementar sistema de autenticación', desc: 'JWT + refresh tokens' },
      { id: 'c6', title: 'Crear componentes de UI', desc: 'Diseñar cards y modales' },
    ]},
    { id: 'done', title: 'Completado', cards: [
      { id: 'c4', title: 'Setup de Tailwind y Flowbite', desc: 'Configuración completa del proyecto' },
      { id: 'c7', title: 'Integración con Angular CDK', desc: 'Drag & drop funcional' },
    ]},
  ];

  // Configuración de temas por columna (se ciclan para nuevas columnas)
  private readonly columnThemes = [
    { color: 'ft-crimson', name: 'crimson' },
    { color: 'ft-amber', name: 'amber' },
    { color: 'ft-turquoise', name: 'turquoise' },
  ];

  // Contador para generar IDs únicos de columnas
  private columnIdCounter = this.columns.length;
  
  // Contador para generar IDs únicos de tarjetas
  private cardIdCounter = 8; // Empezar después de las tarjetas existentes (c1-c7)

  // Control del modal para crear nueva lista
  showNewListModal = false;
  newListName = '';

  // Control del modal para crear nueva tarea
  showNewTaskModal = false;
  newTaskTitle = '';
  newTaskDesc = '';
  selectedColumnIndex: number | null = null;

  /**
   * Abre el modal para crear una nueva columna/lista
   */
  openNewListModal() {
    this.newListName = '';
    this.showNewListModal = true;
  }

  /**
   * Cancela la creación de nueva lista
   */
  cancelNewList() {
    this.showNewListModal = false;
    this.newListName = '';
  }

  /**
   * Crea una nueva columna/lista con el nombre ingresado
   */
  addNewColumn() {
    const listName = this.newListName.trim();
    
    // Si el usuario no ingresa un nombre, no crear la lista
    if (!listName) {
      return;
    }
    
    const newColumnId = `column-${this.columnIdCounter++}`;
    const newColumn: Column = {
      id: newColumnId,
      title: listName,
      cards: []
    };
    this.columns.push(newColumn);
    
    // Cerrar modal y limpiar
    this.showNewListModal = false;
    this.newListName = '';
  }

  /**
   * Abre el modal para crear una nueva tarea en una columna específica
   */
  openNewTaskModal(columnIndex: number) {
    this.selectedColumnIndex = columnIndex;
    this.newTaskTitle = '';
    this.newTaskDesc = '';
    this.showNewTaskModal = true;
  }

  /**
   * Cancela la creación de nueva tarea
   */
  cancelNewTask() {
    this.showNewTaskModal = false;
    this.newTaskTitle = '';
    this.newTaskDesc = '';
    this.selectedColumnIndex = null;
  }

  /**
   * Crea una nueva tarea en la columna seleccionada
   */
  addNewTask() {
    const title = this.newTaskTitle.trim();
    
    // Validar que hay título y columna seleccionada
    if (!title || this.selectedColumnIndex === null) {
      return;
    }
    
    const newCardId = `c${this.cardIdCounter++}`;
    const newCard: Card = {
      id: newCardId,
      title: title,
      desc: this.newTaskDesc.trim() || undefined,
      checked: false
    };
    
    this.columns[this.selectedColumnIndex].cards.push(newCard);
    
    // Cerrar modal y limpiar
    this.showNewTaskModal = false;
    this.newTaskTitle = '';
    this.newTaskDesc = '';
    this.selectedColumnIndex = null;
  }

  /**
   * Retorna array de IDs de columnas para permitir drag & drop entre ellas
   */
  getConnectedLists(): string[] {
    return this.columns.map((_, index) => `cdk-drop-list-${index}`);
  }

  /**
   * Maneja el evento de drop cuando se suelta una carta
   */
  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /**
   * Maneja el evento de drop cuando se suelta una columna completa
   * Reordena las columnas en el array
   */
  dropColumn(event: CdkDragDrop<Column[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  /**
   * Toggle el estado de checked de una tarjeta
   */
  toggleCardCheck(card: Card, event: Event) {
    event.stopPropagation(); // Prevenir que inicie el drag
    card.checked = !card.checked;
  }

  // ========================================
  // 🚀 PERFORMANCE OPTIMIZATION METHODS
  // ========================================

  /**
   * 🎯 TrackBy para columnas - Evita re-render completo
   * Angular solo re-renderiza la columna que cambió
   */
  trackByColumnId(index: number, column: Column): string {
    return column.id;
  }

  /**
   * 🎯 TrackBy para tarjetas - CRÍTICO para performance
   * Sin esto, Angular re-crea TODAS las tarjetas en cada change detection
   */
  trackByCardId(index: number, card: Card): string {
    return card.id;
  }

  /**
   * 🎯 Evento de inicio de drag
   * Activa flag para optimizar estilos durante el arrastre
   */
  onDragStarted(event: CdkDragStart): void {
    this.isDragging = true;
    // Agregar clase al body para simplificar estilos globales y mejorar performance
    document.body.classList.add('is-dragging');
    
    // 🚀 Forzar reflow para asegurar que los estilos se apliquen inmediatamente
    // Esto previene el "flicker" inicial del drag
    void document.body.offsetHeight;
  }

  /**
   * 🎯 Evento de fin de drag
   * Restaura estilos normales
   */
  onDragEnded(event: CdkDragEnd): void {
    this.isDragging = false;
    // Remover clase del body después de un micro-delay para transiciones suaves
    requestAnimationFrame(() => {
      document.body.classList.remove('is-dragging');
    });
  }

  // Métodos helper para clases CSS dinámicas
  getColumnColorClass(index: number): string {
    const themeIndex = index % this.columnThemes.length; // Cicla los colores
    return `bg-${this.columnThemes[themeIndex].color}`;
  }

  getColumnBadgeClass(index: number): string {
    // Badge neutral y elegante para cualquier cantidad de columnas
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }

  getColumnHoverClass(index: number): string {
    const themeIndex = index % this.columnThemes.length; // Cicla los colores
    return `hover:text-${this.columnThemes[themeIndex].color}`;
  }

  getColumnBarClass(index: number): string {
    const themeIndex = index % this.columnThemes.length; // Cicla los colores
    return `bg-${this.columnThemes[themeIndex].color}`;
  }

  getColumnGripClass(index: number): string {
    const themeIndex = index % this.columnThemes.length; // Cicla los colores
    return `group-hover:text-${this.columnThemes[themeIndex].color}`;
  }

  getColumnAvatarClass(index: number): string {
    const themeIndex = index % this.columnThemes.length; // Cicla los colores
    const theme = this.columnThemes[themeIndex];
    const nextTheme = this.columnThemes[(themeIndex + 1) % this.columnThemes.length];
    return `bg-gradient-to-br from-${theme.color} to-${nextTheme.color}`;
  }
}
