import { ChangeDetectionStrategy, Component, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, createTimeline, stagger } from 'animejs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  viewMode: 'grid' | 'list' = 'grid';
  user = { name: 'Edward', initial: 'E' };
  menuOpen = false;
  isLoading = false; // Para mostrar loading states

  @ViewChildren('wsItem') wsItems!: QueryList<ElementRef<HTMLElement>>;

  workspaces = [
    {
      id: 'ws-flow-dev',
      title: 'FlowTask - Desarrollo',
      desc: 'Tableros del equipo de desarrollo, sprints y bugs.',
      cover: '/assets/FlowTask.png',
      theme: 'cerulean',
      themeColor: '#0075A2',
      icon: 'fas fa-code',
      lastActivity: '2 horas',
      tasks: {
        total: 24,
        completed: 18,
        pending: 6
      },
      members: 5,
      boards: 4,
      isFavorite: true
    },
    {
      id: 'ws-design',
      title: 'Diseño UX/UI',
      desc: 'Wireframes, mockups y bibliotecas de componentes.',
      cover: '/assets/FlowTask.png',
      theme: 'violet',
      themeColor: '#6A4C93',
      icon: 'fas fa-palette',
      lastActivity: '4 horas',
      tasks: {
        total: 16,
        completed: 12,
        pending: 4
      },
      members: 3,
      boards: 3,
      isFavorite: false
    },
    {
      id: 'ws-marketing',
      title: 'Marketing',
      desc: 'Campañas, contenidos y calendario social.',
      cover: '/assets/FlowTask.png',
      theme: 'amber',
      themeColor: '#FFB400',
      icon: 'fas fa-bullhorn',
      lastActivity: '1 día',
      tasks: {
        total: 19,
        completed: 15,
        pending: 4
      },
      members: 4,
      boards: 5,
      isFavorite: true
    },
    {
      id: 'ws-ops',
      title: 'Operaciones',
      desc: 'Checklists, proveedores y documentación interna.',
      cover: '/assets/FlowTask.png',
      theme: 'turquoise',
      themeColor: '#2EC4B6',
      icon: 'fas fa-cogs',
      lastActivity: '6 horas',
      tasks: {
        total: 31,
        completed: 28,
        pending: 3
      },
      members: 6,
      boards: 7,
      isFavorite: false
    },
    {
      id: 'ws-hr',
      title: 'Recursos Humanos',
      desc: 'Onboarding, políticas y vacantes activas.',
      cover: '/assets/FlowTask.png',
      theme: 'cerulean',
      themeColor: '#0075A2',
      icon: 'fas fa-users',
      lastActivity: '3 días',
      tasks: {
        total: 12,
        completed: 8,
        pending: 4
      },
      members: 2,
      boards: 2,
      isFavorite: false
    },
    {
      id: 'ws-labs',
      title: 'Laboratorio',
      desc: 'Ideas, pruebas A/B y prototipos.',
      cover: '/assets/FlowTask.png',
      theme: 'violet',
      themeColor: '#6A4C93',
      icon: 'fas fa-flask',
      lastActivity: '1 semana',
      tasks: {
        total: 8,
        completed: 5,
        pending: 3
      },
      members: 3,
      boards: 2,
      isFavorite: true
    },
  ];

  // Mensajes dinámicos de bienvenida
  welcomeMessages = [
    '¡Buenos días! ¿Listo para ser productivo?',
    '¡Hola! Tienes tareas esperándote',
    '¡Bienvenido de vuelta! Sigamos organizando',
    '¡Perfecto! Hora de hacer cosas increíbles',
    '¡Excelente! Tus proyectos te están esperando'
  ];
  
  currentMessage = this.welcomeMessages[Math.floor(Math.random() * this.welcomeMessages.length)];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Animate initial grid view if present
    if (this.viewMode === 'grid') {
      // Defer to ensure DOM is ready
      requestAnimationFrame(() => this.animateGridEntrance());
    }
    // When view children change (switch grid/list), re-apply as needed
    this.wsItems?.changes.subscribe(() => {
      if (this.viewMode === 'grid') {
        requestAnimationFrame(() => this.animateGridEntrance());
      }
    });
  }

  // Métodos de utilidad para los workspaces
  getTaskProgress(workspace: any): number {
    return Math.round((workspace.tasks.completed / workspace.tasks.total) * 100);
  }

  getThemeClasses(theme: string): string {
    const themeMap: { [key: string]: string } = {
      'cerulean': 'bg-[#0075A2]',
      'violet': 'bg-[#6A4C93]',
      'amber': 'bg-[#FFB400]',
      'turquoise': 'bg-[#2EC4B6]',
      'crimson': 'bg-[#D7263D]'
    };
    return themeMap[theme] || 'bg-[#0075A2]';
  }

  getThemeHoverClasses(theme: string): string {
    const themeMap: { [key: string]: string } = {
      'cerulean': 'hover:shadow-[0_8px_30px_rgba(0,117,162,0.3)]',
      'violet': 'hover:shadow-[0_8px_30px_rgba(106,76,147,0.3)]',
      'amber': 'hover:shadow-[0_8px_30px_rgba(255,180,0,0.3)]',
      'turquoise': 'hover:shadow-[0_8px_30px_rgba(46,196,182,0.3)]',
      'crimson': 'hover:shadow-[0_8px_30px_rgba(215,38,61,0.3)]'
    };
    return themeMap[theme] || 'hover:shadow-[0_8px_30px_rgba(0,117,162,0.3)]';
  }

  // Método para toggle de favoritos con animación
  toggleFavorite(workspace: any, event: Event): void {
    event.stopPropagation(); // Evitar que se abra el workspace
    
    // Cambiar el estado
    workspace.isFavorite = !workspace.isFavorite;
    
    // Obtener el botón para animar
    const button = event.target as HTMLElement;
    const heartIcon = button.querySelector('i') || button;
    
    // Aplicar animación de "pop"
    heartIcon.classList.add('favorite-animation');
    
    // Remover la clase después de la animación
    setTimeout(() => {
      heartIcon.classList.remove('favorite-animation');
    }, 300);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
    // Run grid entrance animation on switch
    if (mode === 'grid') {
      requestAnimationFrame(() => this.animateGridEntrance());
    }
  }

  onListHoverEnter(ev: MouseEvent): void {
    if (this.viewMode !== 'list') return;
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    const card = (target.matches('.list-card') ? target : target.querySelector('.list-card')) as HTMLElement | null;
    const el = card ?? target;
    el.style.willChange = 'transform';
    animate(el, {
      translateX: [0, 16],
      duration: 160,
      ease: 'linear'
    });
  }

  onListHoverLeave(ev: MouseEvent): void {
    if (this.viewMode !== 'list') return;
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    const card = (target.matches('.list-card') ? target : target.querySelector('.list-card')) as HTMLElement | null;
    const el = card ?? target;
    animate(el, {
      translateX: 0,
      duration: 140,
      ease: 'linear',
      complete: () => {
        el.style.willChange = '';
      }
    });
  }

  private animateGridEntrance(): void {
    const items = this.wsItems?.toArray().map(r => r.nativeElement) ?? [];
    if (!items.length) return;
    // Neutralize CSS keyframe animations to avoid double-animating
    items.forEach((el) => {
      el.style.animation = 'none';
      el.style.opacity = '0';
      el.style.transformOrigin = '50% 50%';
      el.style.willChange = 'transform, opacity';
    });
    const tl = createTimeline({ autoplay: true });
    tl.add(items as any, {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.96, 1],
      delay: stagger(80),
      duration: 520,
      ease: 'outCubic'
    });
  }
}
