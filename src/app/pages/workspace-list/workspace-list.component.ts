import { Component, ChangeDetectorRef, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, createTimeline, stagger } from 'animejs';

interface Workspace {
  id: number;
  name: string;
  description: string;
  theme: string;
  icon: string;
  taskCount: number;
  isFavorite: boolean;
}

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.css'
})
export class WorkspaceListComponent implements AfterViewInit {
viewMode: 'grid' | 'list' = 'grid';
  user = { name: 'Edward', initial: 'E' };
  menuOpen = false;
  isLoading = false; // Para mostrar loading states
  isDarkMode = false; // Para el modo dark/light
  
  // Modal properties
  isModalOpen = false;
  newWorkspace = {
    name: '',
    description: '',
    theme: 'cerulean',
    customColor: '#0075A2',
    customIcon: 'fas fa-layer-group',
    members: [] as string[]
  };
  newMemberEmail = '';
  
  // Available themes for workspace creation
  availableThemes = [
    { id: 'cerulean', name: 'Desarrollo', color: '#0075A2', icon: 'fas fa-code' },
    { id: 'violet', name: 'Diseño', color: '#6A4C93', icon: 'fas fa-palette' },
    { id: 'amber', name: 'Marketing', color: '#FFB400', icon: 'fas fa-bullhorn' },
    { id: 'turquoise', name: 'Operaciones', color: '#2EC4B6', icon: 'fas fa-cogs' },
    { id: 'emerald', name: 'Ventas', color: '#10B981', icon: 'fas fa-chart-line' },
    { id: 'rose', name: 'Soporte', color: '#F43F5E', icon: 'fas fa-headset' },
    { id: 'purple', name: 'Investigación', color: '#8B5CF6', icon: 'fas fa-microscope' },
    { id: 'orange', name: 'Finanzas', color: '#F97316', icon: 'fas fa-coins' },
    { id: 'cyan', name: 'DevOps', color: '#06B6D4', icon: 'fas fa-server' },
    { id: 'indigo', name: 'Educación', color: '#6366F1', icon: 'fas fa-graduation-cap' },
    { id: 'pink', name: 'Eventos', color: '#EC4899', icon: 'fas fa-calendar-alt' },
    { id: 'lime', name: 'Sostenibilidad', color: '#84CC16', icon: 'fas fa-leaf' },
    { id: 'custom', name: 'Personalizado', color: '#374151', icon: 'fas fa-paint-brush' }
  ];

  // Available icons for custom selection
  availableIcons = [
    // Work & Business
    { category: 'Trabajo', icons: [
      'fas fa-briefcase', 'fas fa-building', 'fas fa-chart-bar', 'fas fa-chart-line',
      'fas fa-chart-pie', 'fas fa-clipboard', 'fas fa-tasks', 'fas fa-project-diagram',
      'fas fa-bullseye', 'fas fa-rocket', 'fas fa-lightbulb', 'fas fa-handshake'
    ]},
    // Technology
    { category: 'Tecnología', icons: [
      'fas fa-code', 'fas fa-laptop-code', 'fas fa-database', 'fas fa-server',
      'fas fa-cloud', 'fas fa-cogs', 'fas fa-microchip', 'fas fa-robot',
      'fas fa-wifi', 'fas fa-mobile-alt', 'fas fa-desktop', 'fas fa-tablet-alt'
    ]},
    // Design & Creative
    { category: 'Diseño', icons: [
      'fas fa-palette', 'fas fa-paint-brush', 'fas fa-pen-nib', 'fas fa-camera',
      'fas fa-image', 'fas fa-film', 'fas fa-music', 'fas fa-video',
      'fas fa-magic', 'fas fa-eye', 'fas fa-drafting-compass', 'fas fa-cut'
    ]},
    // Communication
    { category: 'Comunicación', icons: [
      'fas fa-bullhorn', 'fas fa-comments', 'fas fa-envelope', 'fas fa-phone',
      'fas fa-headset', 'fas fa-microphone', 'fas fa-broadcast-tower', 'fas fa-rss',
      'fas fa-share-alt', 'fas fa-hashtag', 'fas fa-at', 'fas fa-globe'
    ]},
    // Education & Research
    { category: 'Educación', icons: [
      'fas fa-graduation-cap', 'fas fa-book', 'fas fa-microscope', 'fas fa-flask',
      'fas fa-atom', 'fas fa-dna', 'fas fa-brain', 'fas fa-user-graduate',
      'fas fa-chalkboard-teacher', 'fas fa-pencil-alt', 'fas fa-bookmark', 'fas fa-certificate'
    ]},
    // Finance & Analytics
    { category: 'Finanzas', icons: [
      'fas fa-coins', 'fas fa-dollar-sign', 'fas fa-credit-card', 'fas fa-calculator',
      'fas fa-piggy-bank', 'fas fa-wallet', 'fas fa-receipt', 'fas fa-file-invoice',
      'fas fa-balance-scale', 'fas fa-trending-up', 'fas fa-percentage', 'fas fa-exchange-alt'
    ]},
    // General
    { category: 'General', icons: [
      'fas fa-star', 'fas fa-heart', 'fas fa-home', 'fas fa-users',
      'fas fa-calendar-alt', 'fas fa-clock', 'fas fa-flag', 'fas fa-trophy',
      'fas fa-gift', 'fas fa-gamepad', 'fas fa-puzzle-piece', 'fas fa-cube'
    ]}
  ];

  // Color presets for quick selection
  colorPresets = [
    '#0075A2', '#6A4C93', '#FFB400', '#2EC4B6', '#10B981', '#F43F5E',
    '#8B5CF6', '#F97316', '#06B6D4', '#6366F1', '#EC4899', '#84CC16',
    '#EF4444', '#F59E0B', '#3B82F6', '#8B5A2B', '#6B7280', '#000000'
  ];

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

  constructor(private host: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef, private router: Router, private route: ActivatedRoute) {
    // Inicializar el modo dark desde localStorage o usar light por defecto
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

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
      'crimson': 'bg-[#D7263D]',
      'emerald': 'bg-[#10B981]',
      'rose': 'bg-[#F43F5E]',
      'purple': 'bg-[#8B5CF6]',
      'orange': 'bg-[#F97316]',
      'cyan': 'bg-[#06B6D4]',
      'indigo': 'bg-[#6366F1]',
      'pink': 'bg-[#EC4899]',
      'lime': 'bg-[#84CC16]'
    };
    return themeMap[theme] || 'bg-[#0075A2]';
  }

  // Nuevos colores más vivos para modo dark
  getThemeVividClasses(theme: string): string {
    const themeMap: { [key: string]: string } = {
      'cerulean': 'bg-[#0EA5E9]',     // Más brillante - sky-500
      'violet': 'bg-[#8B5CF6]',       // Más brillante - violet-500  
      'amber': 'bg-[#F59E0B]',        // Más brillante - amber-500
      'turquoise': 'bg-[#06D6A0]',    // Más brillante - custom turquoise
      'crimson': 'bg-[#EF4444]'       // Más brillante - red-500
    };
    return themeMap[theme] || 'bg-[#0EA5E9]';
  }

  getThemeHoverClasses(theme: string): string {
    const themeMap: { [key: string]: string } = {
      'cerulean': 'hover:shadow-[0_8px_30px_rgba(0,117,162,0.3)]',
      'violet': 'hover:shadow-[0_8px_30px_rgba(106,76,147,0.3)]',
      'amber': 'hover:shadow-[0_8px_30px_rgba(255,180,0,0.3)]',
      'turquoise': 'hover:shadow-[0_8px_30px_rgba(46,196,182,0.3)]',
      'crimson': 'hover:shadow-[0_8px_30px_rgba(215,38,61,0.3)]',
      'emerald': 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)]',
      'rose': 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.3)]',
      'purple': 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.3)]',
      'orange': 'hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)]',
      'cyan': 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.3)]',
      'indigo': 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)]',
      'pink': 'hover:shadow-[0_8px_30px_rgba(236,72,153,0.3)]',
      'lime': 'hover:shadow-[0_8px_30px_rgba(132,204,22,0.3)]'
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

  // Modal methods
  openCreateWorkspaceModal(): void {
    this.isModalOpen = true;
    this.resetForm();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeCreateWorkspaceModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  resetForm(): void {
    this.newWorkspace = {
      name: '',
      description: '',
      theme: 'cerulean',
      customColor: '#0075A2',
      customIcon: 'fas fa-layer-group',
      members: []
    };
    this.newMemberEmail = '';
  }

  selectTheme(themeId: string): void {
    this.newWorkspace.theme = themeId;
    if (themeId !== 'custom') {
      const selectedTheme = this.availableThemes.find(t => t.id === themeId);
      if (selectedTheme) {
        this.newWorkspace.customColor = selectedTheme.color;
        this.newWorkspace.customIcon = selectedTheme.icon;
      }
    }
  }

  selectColor(color: string): void {
    this.newWorkspace.customColor = color;
    this.newWorkspace.theme = 'custom';
  }

  selectIcon(icon: string): void {
    this.newWorkspace.customIcon = icon;
    this.newWorkspace.theme = 'custom';
  }

  onCustomColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newWorkspace.customColor = target.value;
    this.newWorkspace.theme = 'custom';
  }

  getCurrentColor(): string {
    return this.newWorkspace.customColor;
  }

  getCurrentIcon(): string {
    return this.newWorkspace.customIcon;
  }

  addMember(): void {
    if (this.newMemberEmail && this.isValidEmail(this.newMemberEmail)) {
      if (!this.newWorkspace.members.includes(this.newMemberEmail)) {
        this.newWorkspace.members.push(this.newMemberEmail);
        this.newMemberEmail = '';
      }
    }
  }

  removeMember(index: number): void {
    this.newWorkspace.members.splice(index, 1);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return this.newWorkspace.name.trim().length >= 3 && 
           this.newWorkspace.description.trim().length >= 10;
  }

  createWorkspace(): void {
    if (!this.isFormValid()) return;

    // Generate unique ID
    const newId = 'ws-' + Date.now();
    
    // Create new workspace object with custom values
    const workspace = {
      id: newId,
      title: this.newWorkspace.name,
      desc: this.newWorkspace.description,
      cover: '/assets/FlowTask.png',
      theme: this.newWorkspace.theme,
      themeColor: this.newWorkspace.customColor,
      icon: this.newWorkspace.customIcon,
      lastActivity: 'Recién creado',
      tasks: {
        total: 0,
        completed: 0,
        pending: 0
      },
      members: this.newWorkspace.members.length || 1,
      boards: 0,
      isFavorite: false
    };

    // Add to workspaces array with animation
    this.workspaces.unshift(workspace);
    
    // Close modal
    this.closeCreateWorkspaceModal();
    
    // Show success notification (you can implement this)
    this.showSuccessNotification('¡Workspace creado exitosamente!');
  }

  showSuccessNotification(message: string): void {
    // Simple notification - you can enhance this with a proper toast library
    console.log(message);
    // Here you could implement a toast notification
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

  // Dark/Light mode methods
  toggleDarkMode(event?: Event): void {
    if (event) {
      const target = event.target as HTMLInputElement;
      this.isDarkMode = target.checked;
    } else {
      this.isDarkMode = !this.isDarkMode;
    }
    
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    console.log('Dark mode toggled:', this.isDarkMode);
    this.applyTheme();
    // Force change detection
    this.cdr.detectChanges();
  }

  private applyTheme(): void {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove any existing classes first
    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    if (this.isDarkMode) {
      html.classList.add('dark');
      body.classList.add('dark');
      console.log('Dark mode applied');
    } else {
      html.classList.add('light');
      body.classList.add('light');
      console.log('Light mode applied');
    }
    
    // Force change detection after DOM update
    setTimeout(() => {
      console.log('HTML classes:', html.className);
      console.log('Body classes:', body.className);
      console.log('isDarkMode state:', this.isDarkMode);
      this.cdr.detectChanges();
    }, 100);
  }

  // Método para navegar al workspace específico
  openWorkspace(workspaceId: string): void {
    this.router.navigateByUrl(`/home/workspaces/${workspaceId}`);
  }
}