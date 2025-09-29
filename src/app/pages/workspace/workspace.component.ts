import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../service/theme.service';
import { animate, createTimeline, stagger } from 'animejs';
import { AnimatedStatsCardComponent, StatsCardData } from '../../components/animated-stats-card/animated-stats-card.component';
import { AnimatedBoardCardComponent, BoardCardData } from '../../components/animated-board-card/animated-board-card.component';
import { CreateModalComponent, ModalConfig, CreateItemData } from '../../components/create-modal/create-modal.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimatedStatsCardComponent, AnimatedBoardCardComponent, CreateModalComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit, OnDestroy, AfterViewInit {
  workspaceId: string | null = null;
  workspaceName: string = '';
  isDarkMode: boolean = false;
  private themeSubscription: Subscription = new Subscription();

  // Modal properties para crear board
  isModalOpen = false;
  newBoard = {
    name: '',
    description: '',
    theme: 'cerulean',
    customColor: '#0075A2',
    customIcon: 'fas fa-layer-group',
    members: [] as string[]
  };
  newMemberEmail = '';

  // Modal configuration for new component
  modalConfig: ModalConfig = {
    title: 'Crear Nuevo Board',
    icon: 'fa-layer-group',
    type: 'board'
  };

  // Available themes para board creation
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

  // Available icons para board selection
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

  // Color presets para board
  colorPresets = [
    '#0075A2', '#6A4C93', '#FFB400', '#2EC4B6', '#10B981', '#F43F5E',
    '#8B5CF6', '#F97316', '#06B6D4', '#6366F1', '#EC4899', '#84CC16',
    '#EF4444', '#F59E0B', '#3B82F6', '#8B5A2B', '#6B7280', '#000000'
  ];

  // Datos para las tarjetas de estadísticas
  statsCardsData: StatsCardData[] = [
    {
      title: 'Total',
      value: '24',
      description: 'Total de Tareas',
      icon: 'fa-tasks',
      gradient: {
        from: '#0075A2',
        to: '#6A4C93',
        fromDark: '#0EA5E9',
        toDark: '#8B5CF6'
      },
      accentColor: '#2EC4B6',
      statusText: 'Actualizadas hoy'
    },
    {
      title: 'Completadas',
      value: '18',
      description: 'Tareas Completadas',
      icon: 'fa-check-circle',
      gradient: {
        from: '#2EC4B6',
        to: '#10B981',
        fromDark: '#06D6A0',
        toDark: '#34D399'
      },
      accentColor: '#10B981',
      statusText: '¡Excelente progreso!'
    },
    {
      title: 'En proceso',
      value: '6',
      description: 'Tareas Pendientes',
      icon: 'fa-clock',
      gradient: {
        from: '#FFB400',
        to: '#F59E0B',
        fromDark: '#FBBF24',
        toDark: '#F59E0B'
      },
      accentColor: '#F59E0B',
      statusText: '¡A por ellas!'
    }
  ];

  // Datos para las tarjetas de board
  boardCardsData: BoardCardData[] = [
    {
      title: 'Board Desarrollo',
      description: 'Sprint actual en progreso',
      icon: 'fa-code',
      color: 'blue',
      progress: 75,
      completed: 12,
      pending: 4,
      total: 16
    },
    {
      title: 'Board Diseño',
      description: 'UI/UX en proceso',
      icon: 'fa-palette',
      color: 'purple',
      progress: 90,
      completed: 9,
      pending: 1,
      total: 10
    },
    {
      title: 'Board Testing',
      description: 'QA y pruebas',
      icon: 'fa-bug',
      color: 'emerald',
      progress: 45,
      completed: 3,
      pending: 4,
      total: 7
    }
  ];

  // ViewChildren para animaciones
  @ViewChildren('statsCard') statsCards!: QueryList<ElementRef>;
  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef>;
  @ViewChildren('teamMember') teamMembers!: QueryList<ElementRef>;
  @ViewChildren('contentCard') contentCards!: QueryList<ElementRef>;
  @ViewChildren('addBoardBtn') addBoardBtn!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener el ID del workspace de la ruta
    this.workspaceId = this.route.snapshot.paramMap.get('id');
    
    // Suscribirse al tema
    this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    // Aquí podrías hacer una llamada a tu API usando el workspaceId
    // Por ahora simulamos obtener datos
    this.loadWorkspaceData();
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    this.themeSubscription.unsubscribe();
  }

  private loadWorkspaceData(): void {
    // Simular carga de datos del workspace
    // En el futuro aquí harías: this.workspaceService.getWorkspace(this.workspaceId)
    
    // Datos de ejemplo basados en el ID
    const workspaceData = {
      '1': { name: 'Desarrollo Web', description: 'Proyectos de desarrollo frontend y backend' },
      '2': { name: 'Marketing Digital', description: 'Campañas y estrategias de marketing' },
      '3': { name: 'Diseño UX/UI', description: 'Diseños y prototipos de interfaces' },
      '4': { name: 'Análisis de Datos', description: 'Reportes y análisis de métricas' },
      '5': { name: 'Gestión de Proyectos', description: 'Coordinación y seguimiento de proyectos' },
      '6': { name: 'Recursos Humanos', description: 'Gestión de talento y procesos internos' }
    };

    const data = workspaceData[this.workspaceId as keyof typeof workspaceData];
    this.workspaceName = data?.name || `Workspace ${this.workspaceId}`;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngAfterViewInit(): void {
    // Desactivar cualquier animación CSS automática inmediatamente
    this.disableAutomaticAnimations();
    
    // Ejecutar animaciones inmediatamente sin delay para evitar el período estático
    requestAnimationFrame(() => {
      this.animateEntrance();
    });
  }

  private disableAutomaticAnimations(): void {
    // Desactivar animaciones automáticas en todas las cartas
    const allElements = [
      ...(this.statsCards?.toArray().map(r => r.nativeElement) ?? []),
      ...(this.activityItems?.toArray().map(r => r.nativeElement) ?? []),
      ...(this.teamMembers?.toArray().map(r => r.nativeElement) ?? []),
      ...(this.contentCards?.toArray().map(r => r.nativeElement) ?? [])
    ];

    allElements.forEach(el => {
      if (el) {
        // Forzar desactivación de todas las animaciones CSS
        el.style.setProperty('animation', 'none', 'important');
        el.style.setProperty('animation-delay', '0s', 'important');
        el.style.setProperty('animation-duration', '0s', 'important');
        el.style.setProperty('animation-fill-mode', 'none', 'important');
        // Asegurar que el elemento esté visible
        el.style.setProperty('opacity', '1', 'important');
      }
    });
  }

  private animateEntrance(): void {
    // Las statsCards ahora se animan solas, no necesitamos animarlas aquí
    
    // Animar content cards (containers principales)
    const contentElements = this.contentCards?.toArray().map(r => r.nativeElement) ?? [];
    if (contentElements.length) {
      contentElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tl1 = createTimeline({ autoplay: true });
      tl1.add(contentElements as any, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        delay: stagger(120, { start: 150 }), // Delay inicial de 150ms
        duration: 600,
        ease: 'outCubic',
        complete: () => {
          contentElements.forEach(el => {
            el.style.willChange = '';
          });
        }
      });
    }

    // Animar el botón de agregar board
    const addBoardElements = this.addBoardBtn?.toArray().map(r => r.nativeElement) ?? [];
    if (addBoardElements.length) {
      addBoardElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px) scale(0.9)';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tlAddBoard = createTimeline({ autoplay: true });
      tlAddBoard.add(addBoardElements as any, {
        opacity: [0, 1],
        translateX: [20, 0],
        scale: [0.9, 1],
        delay: 200, // Aparece después de los content cards
        duration: 400,
        ease: 'outCubic',
        complete: () => {
          addBoardElements.forEach(el => {
            el.style.willChange = '';
          });
        }
      });
    }

    // Animar activity items
    const activityElements = this.activityItems?.toArray().map(r => r.nativeElement) ?? [];
    if (activityElements.length) {
      activityElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(-20px)';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tl3 = createTimeline({ autoplay: true });
      tl3.add(activityElements as any, {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: stagger(80, { start: 500 }),
        duration: 450,
        ease: 'outCubic',
        complete: () => {
          activityElements.forEach(el => {
            el.style.willChange = '';
          });
        }
      });
    }

    // Animar team members
    const teamElements = this.teamMembers?.toArray().map(r => r.nativeElement) ?? [];
    if (teamElements.length) {
      teamElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(-15px) scale(0.98)';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tl4 = createTimeline({ autoplay: true });
      tl4.add(teamElements as any, {
        opacity: [0, 1],
        translateX: [-15, 0],
        scale: [0.98, 1],
        delay: stagger(100, { start: 650 }),
        duration: 450,
        ease: 'outCubic',
        complete: () => {
          teamElements.forEach(el => {
            el.style.willChange = '';
          });
        }
      });
    }
  }

  // Métodos para efectos hover
  onStatsHoverEnter(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    target.style.willChange = 'transform';
    
    // Animar la carta
    animate(target, {
      scale: [1, 1.02],
      duration: 160,
      ease: 'linear'
    });

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.card-icon i');
    if (icon) {
      animate(icon, {
        scale: [1, 1.15],
        rotate: [0, 5],
        duration: 160,
        ease: 'linear'
      });
    }
  }

  onStatsHoverLeave(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    
    // Animar la carta
    animate(target, {
      scale: 1,
      duration: 140,
      ease: 'linear',
      complete: () => {
        target.style.willChange = '';
      }
    });

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.card-icon i');
    if (icon) {
      animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 140,
        ease: 'linear'
      });
    }
  }

  onActivityHoverEnter(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    target.style.willChange = 'transform';
    
    // Animar la carta
    animate(target, {
      translateX: [0, 12],
      duration: 160,
      ease: 'linear'
    });

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.w-10.h-10 i, .w-8.h-8 i');
    if (icon) {
      animate(icon, {
        scale: [1, 1.25],
        rotate: [0, 12],
        duration: 160,
        ease: 'linear'
      });
    }
  }

  onActivityHoverLeave(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    
    // Animar la carta
    animate(target, {
      translateX: 0,
      duration: 140,
      ease: 'linear',
      complete: () => {
        target.style.willChange = '';
      }
    });

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.w-10.h-10 i, .w-8.h-8 i');
    if (icon) {
      animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 140,
        ease: 'linear'
      });
    }
  }

  onTeamHoverEnter(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    target.style.willChange = 'transform';
    
    // Animar la carta
    animate(target, {
      translateX: [0, 12],
      scale: [1, 1.005],
      duration: 160,
      ease: 'linear'
    });

    // Animar el avatar/icono dentro de la carta
    const avatar = target.querySelector('.w-12.h-12, .w-10.h-10');
    if (avatar) {
      animate(avatar, {
        scale: [1, 1.1],
        rotate: [0, -5],
        duration: 160,
        ease: 'linear'
      });
    }
  }

  onTeamHoverLeave(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    
    // Animar la carta
    animate(target, {
      translateX: 0,
      scale: 1,
      duration: 140,
      ease: 'linear',
      complete: () => {
        target.style.willChange = '';
      }
    });

    // Animar el avatar/icono dentro de la carta
    const avatar = target.querySelector('.w-12.h-12, .w-10.h-10');
    if (avatar) {
      animate(avatar, {
        scale: 1,
        rotate: 0,
        duration: 140,
        ease: 'linear'
      });
    }
  }

  // Método para optimización de *ngFor
  trackByCardTitle(index: number, card: StatsCardData): string {
    return card.title;
  }

  // Método para optimización de *ngFor de boards
  trackByBoardTitle(index: number, board: BoardCardData): string {
    return board.title;
  }

  // Modal methods
  openCreateBoardModal(): void {
    console.log('Opening board modal...');
    this.isModalOpen = true;
    console.log('Modal state:', this.isModalOpen);
    this.resetForm();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position of modal to top
    setTimeout(() => {
      const modalElement = document.querySelector('#create-board-modal');
      if (modalElement) {
        modalElement.scrollTop = 0;
      }
    }, 50);
    
    // Force animation trigger after DOM update
    setTimeout(() => {
      console.log('Triggering change detection...');
      this.cdr.detectChanges();
    }, 10);
  }

  closeCreateBoardModal(): void {
    this.isModalOpen = false;
    this.resetForm();
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  // New modal component event handlers
  onModalClosed(): void {
    this.closeCreateBoardModal();
  }

  onBoardCreated(boardData: CreateItemData): void {
    // Convert CreateItemData to BoardCardData format
    const newBoardCard: BoardCardData = {
      title: boardData.name,
      description: boardData.description,
      icon: boardData.icon,
      color: boardData.color,
      progress: 0,
      completed: 0,
      pending: 0,
      total: 0
    };

    // Add to boardCardsData array
    this.boardCardsData.push(newBoardCard);
    
    // Close modal
    this.closeCreateBoardModal();

    console.log('Nuevo board creado:', newBoardCard);
  }

  resetForm(): void {
    this.newBoard = {
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
    this.newBoard.theme = themeId;
    if (themeId !== 'custom') {
      const selectedTheme = this.availableThemes.find(t => t.id === themeId);
      if (selectedTheme) {
        this.newBoard.customColor = selectedTheme.color;
        this.newBoard.customIcon = selectedTheme.icon;
      }
    }
  }

  selectColor(color: string): void {
    this.newBoard.customColor = color;
    this.newBoard.theme = 'custom';
  }

  selectIcon(icon: string): void {
    this.newBoard.customIcon = icon;
    this.newBoard.theme = 'custom';
  }

  onCustomColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newBoard.customColor = target.value;
    this.newBoard.theme = 'custom';
  }

  getCurrentColor(): string {
    return this.newBoard.customColor;
  }

  getCurrentIcon(): string {
    return this.newBoard.customIcon;
  }

  addMember(): void {
    if (this.newMemberEmail && this.isValidEmail(this.newMemberEmail)) {
      if (!this.newBoard.members.includes(this.newMemberEmail)) {
        this.newBoard.members.push(this.newMemberEmail);
        this.newMemberEmail = '';
      }
    }
  }

  removeMember(index: number): void {
    this.newBoard.members.splice(index, 1);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isFormValid(): boolean {
    return this.newBoard.name.trim().length >= 3 && 
           this.newBoard.description.trim().length >= 10;
  }

  createBoard(): void {
    if (!this.isFormValid()) return;

    // Generate unique ID
    const newId = 'board-' + Date.now();
    
    // Mapeo de colores para el componente AnimatedBoardCard
    const colorMap: { [key: string]: 'blue' | 'purple' | 'green' | 'orange' } = {
      '#0075A2': 'blue',
      '#6A4C93': 'purple', 
      '#10B981': 'green',
      '#F97316': 'orange'
    };
    
    const boardColor = colorMap[this.newBoard.customColor] || 'blue';
    
    // Create new board object
    const newBoardData: BoardCardData = {
      title: this.newBoard.name,
      description: this.newBoard.description,
      icon: this.newBoard.customIcon.replace('fas fa-', 'fa-'),
      color: boardColor,
      progress: 0,
      completed: 0,
      pending: 0,
      total: 0
    };

    // Add to boards array
    this.boardCardsData.unshift(newBoardData);
    
    // Close modal
    this.closeCreateBoardModal();
    
    // Show success notification
    this.showSuccessNotification('¡Board creado exitosamente!');
  }

  showSuccessNotification(message: string): void {
    console.log(message);
    // Aquí podrías implementar una notificación toast más elaborada
  }

  // Métodos para el botón de agregar nuevo board
  onAddNewBoard(): void {
    this.openCreateBoardModal();
  }

  onAddBoardHover(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    
    target.style.willChange = 'transform';
    
    // Animar el botón
    animate(target, {
      scale: [1, 1.05],
      translateY: [0, -1],
      duration: 200,
      ease: 'outCubic'
    });

    // Animar el icono plus dentro del botón
    const plusIcon = target.querySelector('.fa-plus');
    if (plusIcon) {
      animate(plusIcon, {
        rotate: [0, 180],
        scale: [1, 1.1],
        duration: 300,
        ease: 'outCubic'
      });
    }

    // Animar el círculo de fondo del icono
    const iconBg = target.querySelector('.w-5.h-5');
    if (iconBg) {
      animate(iconBg, {
        scale: [1, 1.15],
        duration: 200,
        ease: 'outCubic'
      });
    }
  }

  onAddBoardLeave(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    
    // Animar el botón de vuelta
    animate(target, {
      scale: 1,
      translateY: 0,
      duration: 180,
      ease: 'outCubic',
      complete: () => {
        target.style.willChange = '';
      }
    });

    // Animar el icono plus de vuelta
    const plusIcon = target.querySelector('.fa-plus');
    if (plusIcon) {
      animate(plusIcon, {
        rotate: 0,
        scale: 1,
        duration: 250,
        ease: 'outCubic'
      });
    }

    // Animar el círculo de fondo del icono de vuelta
    const iconBg = target.querySelector('.w-5.h-5');
    if (iconBg) {
      animate(iconBg, {
        scale: 1,
        duration: 180,
        ease: 'outCubic'
      });
    }
  }
}