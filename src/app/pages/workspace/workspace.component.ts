import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../service/theme.service';
import { animate, createTimeline, stagger } from 'animejs';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit, OnDestroy, AfterViewInit {
  workspaceId: string | null = null;
  workspaceName: string = '';
  isDarkMode: boolean = false;
  private themeSubscription: Subscription = new Subscription();

  // ViewChildren para animaciones
  @ViewChildren('statsCard') statsCards!: QueryList<ElementRef>;
  @ViewChildren('boardCard') boardCards!: QueryList<ElementRef>;
  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef>;
  @ViewChildren('teamMember') teamMembers!: QueryList<ElementRef>;
  @ViewChildren('contentCard') contentCards!: QueryList<ElementRef>;
  @ViewChildren('cardIcon') cardIcons!: QueryList<ElementRef>;

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
    // Animar elementos después de que la vista se inicialice
    setTimeout(() => this.animateEntrance(), 100);
    // Iniciar efectos de lámpara de lava en los headers después de que todo esté renderizado
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.initLavaLampEffects();
      });
    }, 1000);
  }

  private animateEntrance(): void {
    // Animar stats cards
    const statsElements = this.statsCards?.toArray().map(r => r.nativeElement) ?? [];
    if (statsElements.length) {
      statsElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      const tl = createTimeline({ autoplay: true });
      tl.add(statsElements as any, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.96, 1],
        delay: stagger(80),
        duration: 520,
        ease: 'outCubic'
      });
    }

    // Animar content cards (containers principales)
    const contentElements = this.contentCards?.toArray().map(r => r.nativeElement) ?? [];
    if (contentElements.length) {
      contentElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      setTimeout(() => {
        const tl1 = createTimeline({ autoplay: true });
        tl1.add(contentElements as any, {
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.95, 1],
          delay: stagger(120),
          duration: 600,
          ease: 'outCubic'
        });
      }, 150);
    }

    // Animar board cards
    const boardElements = this.boardCards?.toArray().map(r => r.nativeElement) ?? [];
    if (boardElements.length) {
      boardElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      setTimeout(() => {
        const tl2 = createTimeline({ autoplay: true });
        tl2.add(boardElements as any, {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.96, 1],
          delay: stagger(100),
          duration: 520,
          ease: 'outCubic'
        });
      }, 300);
    }

    // Animar activity items
    const activityElements = this.activityItems?.toArray().map(r => r.nativeElement) ?? [];
    if (activityElements.length) {
      activityElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      setTimeout(() => {
        const tl3 = createTimeline({ autoplay: true });
        tl3.add(activityElements as any, {
          opacity: [0, 1],
          translateX: [-20, 0],
          delay: stagger(80),
          duration: 450,
          ease: 'outCubic'
        });
      }, 500);
    }

    // Animar team members
    const teamElements = this.teamMembers?.toArray().map(r => r.nativeElement) ?? [];
    if (teamElements.length) {
      teamElements.forEach((el) => {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transformOrigin = '50% 50%';
        el.style.willChange = 'transform, opacity';
      });
      
      setTimeout(() => {
        const tl4 = createTimeline({ autoplay: true });
        tl4.add(teamElements as any, {
          opacity: [0, 1],
          translateX: [-15, 0],
          scale: [0.98, 1],
          delay: stagger(100),
          duration: 450,
          ease: 'outCubic'
        });
      }, 650);
    }
  }

  private initLavaLampEffects(): void {
    // Obtener todos los headers de las stats cards
    const statsElements = this.statsCards?.toArray().map(r => r.nativeElement) ?? [];
    
    if (statsElements.length === 0) {
      console.log('No se encontraron stats cards');
      return;
    }

    console.log(`Inicializando efectos para ${statsElements.length} cartas`);
    
    statsElements.forEach((card, index) => {
      const header = card.querySelector('.relative.h-20');
      if (header) {
        console.log(`Creando efecto para carta ${index}`);
        this.createLavaLampEffect(header as HTMLElement, index);
      } else {
        console.log(`No se encontró header para carta ${index}`);
      }
    });
  }

  private createLavaLampEffect(container: HTMLElement, cardIndex: number): void {
    console.log(`Iniciando lava lamp effect para header ${cardIndex}`);
    
    // Asegurar que el header tenga posición relativa
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    const createParticle = () => {
      if (!container || !container.parentElement) return;
      
      const particle = document.createElement('div');
      
      // Tamaño aleatorio pequeño para que se vea como burbujas
      const size = 4 + Math.random() * 8; // 4-12px
      
      // Posición inicial aleatoria en el ancho del header, empezar desde abajo
      const startX = Math.random() * (container.offsetWidth - size);
      const startY = container.offsetHeight - 5; // Empezar cerca del fondo
      
      particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, ${0.5 + Math.random() * 0.3});
        border-radius: 50%;
        pointer-events: none;
        z-index: 5;
        will-change: transform, opacity;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;
      
      // Agregar directamente al header
      container.appendChild(particle);
      console.log(`Partícula creada en header ${cardIndex} - posición (${startX}, ${startY})`);
      
      // Animación hacia arriba dentro del header
      const endY = -size - 5;
      const drift = (Math.random() - 0.5) * 15; // Deriva lateral suave
      
      animate(particle, {
        translateY: [0, endY],
        translateX: [0, drift],
        opacity: [0.8, 0.9, 0.3, 0],
        scale: [0.8, 1, 1.1, 0.6],
        rotate: Math.random() * 180,
        duration: 2500 + Math.random() * 1500, // 2.5-4 segundos
        easing: 'easeOutCubic',
        complete: () => {
          if (particle.parentNode === container) {
            container.removeChild(particle);
          }
        }
      });
    };
    
    // Crear partículas iniciales inmediatamente
    createParticle();
    setTimeout(() => createParticle(), 300);
    setTimeout(() => createParticle(), 600);
    
    // Intervalo para crear partículas continuas
    const interval = setInterval(() => {
      if (container.parentElement) {
        createParticle();
      } else {
        clearInterval(interval);
      }
    }, 700 + Math.random() * 500); // Cada 0.7-1.2 segundos
    
    console.log(`Efecto lava lamp configurado para header ${cardIndex}`);
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
}