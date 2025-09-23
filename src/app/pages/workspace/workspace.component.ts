import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../service/theme.service';
import { animate, createTimeline, stagger } from 'animejs';
import { AnimatedStatsCardComponent, StatsCardData } from '../../components/animated-stats-card/animated-stats-card.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, AnimatedStatsCardComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit, OnDestroy, AfterViewInit {
  workspaceId: string | null = null;
  workspaceName: string = '';
  isDarkMode: boolean = false;
  private themeSubscription: Subscription = new Subscription();

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
      title: 'Listas',
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

  // ViewChildren para animaciones
  @ViewChildren('statsCard') statsCards!: QueryList<ElementRef>;
  @ViewChildren('boardCard') boardCards!: QueryList<ElementRef>;
  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef>;
  @ViewChildren('teamMember') teamMembers!: QueryList<ElementRef>;
  @ViewChildren('contentCard') contentCards!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService
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
      ...(this.boardCards?.toArray().map(r => r.nativeElement) ?? []),
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

    // Animar board cards
    const boardElements = this.boardCards?.toArray().map(r => r.nativeElement) ?? [];
    if (boardElements.length) {
      boardElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px) scale(0.96)';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tl2 = createTimeline({ autoplay: true });
      tl2.add(boardElements as any, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.96, 1],
        delay: stagger(100, { start: 300 }),
        duration: 520,
        ease: 'outCubic',
        complete: () => {
          boardElements.forEach(el => {
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

  onBoardHoverEnter(ev: MouseEvent): void {
    const target = ev.currentTarget as HTMLElement | null;
    if (!target) return;
    target.style.willChange = 'transform';
    
    // Animar la carta
    animate(target, {
      translateX: [0, 8],
      scale: [1, 1.01],
      duration: 160,
      ease: 'linear'
    });

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.w-10.h-10 i');
    if (icon) {
      animate(icon, {
        scale: [1, 1.2],
        rotate: [0, -8],
        duration: 160,
        ease: 'linear'
      });
    }
  }

  onBoardHoverLeave(ev: MouseEvent): void {
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

    // Animar el icono dentro de la carta
    const icon = target.querySelector('.w-10.h-10 i');
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
}