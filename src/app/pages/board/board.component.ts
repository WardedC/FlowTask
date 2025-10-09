import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  CdkDrag, 
  CdkDropList,
  CdkDragPreview,
  CdkDragPlaceholder,
  CdkDragStart,
  CdkDragEnd
} from '@angular/cdk/drag-drop';

type Card = { id: string; title: string; desc?: string };
type Column = { id: string; title: string; cards: Card[] };

@Component({
  selector: 'app-board',
  imports: [CommonModule, CdkDropList, CdkDrag, CdkDragPreview, CdkDragPlaceholder],
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

  // Configuración de temas por columna
  private readonly columnThemes = [
    { color: 'ft-crimson', name: 'crimson' },
    { color: 'ft-amber', name: 'amber' },
    { color: 'ft-turquoise', name: 'turquoise' },
  ];

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
    return `bg-${this.columnThemes[index].color}`;
  }

  getColumnBadgeClass(index: number): string {
    const theme = this.columnThemes[index].color;
    return `bg-${theme}/10 text-${theme}`;
  }

  getColumnHoverClass(index: number): string {
    return `hover:text-${this.columnThemes[index].color}`;
  }

  getColumnBarClass(index: number): string {
    return `bg-${this.columnThemes[index].color}`;
  }

  getColumnGripClass(index: number): string {
    return `group-hover:text-${this.columnThemes[index].color}`;
  }

  getColumnAvatarClass(index: number): string {
    const theme = this.columnThemes[index];
    const nextTheme = this.columnThemes[(index + 1) % this.columnThemes.length];
    return `bg-gradient-to-br from-${theme.color} to-${nextTheme.color}`;
  }
}
