import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate } from 'animejs';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';

export interface BoardCardData {
  title: string;
  description: string;
  icon: string;
  color: string; // Hex color code (e.g., '#0075A2')
  theme?: string; // Optional theme identifier for future API compatibility
  progress: number;
  completed: number;
  pending: number;
  total: number;
}

@Component({
  selector: 'app-animated-board-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Board Card with simplified design matching activity cards - UPDATED -->
    <div #cardElement class="animate-element group bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] mb-4"
         (mouseenter)="onCardHoverEnter($event)" (mouseleave)="onCardHoverLeave($event)"
         style="opacity: 0; transform: translateY(20px) scale(0.96);">
      
      <!-- Board Content -->
      <div class="p-4">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div #iconContainer class="w-10 h-10 rounded-lg flex items-center justify-center shadow-md icon-container"
                 [style]="getIconContainerStyle()">
              <i [class]="'fas ' + data.icon + ' text-white text-sm'"></i>
            </div>
            <div>
              <h3 #titleElement class="text-gray-900 dark:text-white font-bold text-base">
                {{ data.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-xs mt-0.5">{{ data.description }}</p>
            </div>
          </div>
          <button #buttonElement class="text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-md"
                  [style]="getButtonStyle()"
                  (click)="navigateToBoard()">
            Ver <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        
        <!-- Progress Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300 text-sm font-medium">Progreso</span>
            <span #progressTextContainer class="text-sm font-bold"
                  [style]="getProgressTextStyle()">
              <span #progressText>0</span>%
            </span>
          </div>
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div #progressBar class="h-full rounded-full transition-all duration-800"
                 [style]="getProgressBarStyle()"
                 style="width: 0%;"></div>
          </div>
          
          <!-- Stats -->
          <div class="flex items-center gap-4 text-sm pt-2">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span class="text-green-600 dark:text-green-400 font-medium text-xs">
                <span #completedNumber>0</span> Completadas
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              <span class="text-orange-600 dark:text-orange-400 font-medium text-xs">
                <span #pendingNumber>0</span> Pendientes
              </span>
            </div>
            <span class="text-gray-600 dark:text-gray-400 ml-auto text-xs">
              Total: <span #totalNumber>0</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .group {
      transition: all 0.3s ease;
    }
    
    .animate-element {
      will-change: transform, opacity;
    }

    /* Custom gray shade for progress section */
    .bg-gray-750 {
      background-color: #374151; /* Between gray-700 and gray-800 */
    }

    /* Enhanced shadow for hover */
    .hover\\:shadow-3xl:hover {
      box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    /* Force icon container color */
    .icon-container {
      background-color: var(--icon-bg-color) !important;
    }
  `]
})
export class AnimatedBoardCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() data!: BoardCardData;
  @Input() animationDelay: number = 0;
  
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef<HTMLElement>;
  @ViewChild('progressBar', { static: false }) progressBar!: ElementRef<HTMLElement>;
  @ViewChild('progressText', { static: false }) progressText!: ElementRef<HTMLElement>;
  @ViewChild('progressTextContainer', { static: false }) progressTextContainer!: ElementRef<HTMLElement>;
  @ViewChild('completedNumber', { static: false }) completedNumber!: ElementRef<HTMLElement>;
  @ViewChild('pendingNumber', { static: false }) pendingNumber!: ElementRef<HTMLElement>;
  @ViewChild('totalNumber', { static: false }) totalNumber!: ElementRef<HTMLElement>;
  @ViewChild('iconContainer', { static: false }) iconContainer!: ElementRef<HTMLElement>;
  @ViewChild('titleElement', { static: false }) titleElement!: ElementRef<HTMLElement>;
  @ViewChild('buttonElement', { static: false }) buttonElement!: ElementRef<HTMLElement>;


  constructor(private router: Router) {}
  private isDestroyed = false;

  // Función utilitaria para convertir hex a rgba
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  ngOnInit(): void {
    if (!this.data) {
      console.warn('AnimatedBoardCard: No se proporcionaron datos');
    } else {
      console.log('AnimatedBoardCard recibió datos:', this.data);
    }
  }

  getIconContainerStyle(): any {
    return {
      'background-color': this.data.color + ' !important',
      '--icon-bg-color': this.data.color
    };
  }

  getButtonStyle(): any {
    return {
      'background-color': this.data.color + ' !important'
    };
  }

  getProgressTextStyle(): any {
    return {
      'color': this.data.color + ' !important'
    };
  }

  getProgressBarStyle(): any {
    return {
      'background': `linear-gradient(90deg, ${this.data.color}, ${this.data.color}dd) !important`
    };
  }

  ngAfterViewInit(): void {
    this.setElementColors();
    this.animateCardEntrance();
  }

  private setElementColors(): void {
    // Usar directamente el color del data en lugar de mapeo fijo
    const boardColor = this.data.color;

    // Establecer color del icono - ya no es necesario porque usamos getIconContainerStyle()
    if (this.iconContainer) {
      this.iconContainer.nativeElement.style.backgroundColor = boardColor;
    }

    // Establecer color del texto del progreso - ya no es necesario porque usamos getProgressTextStyle()
    if (this.progressTextContainer) {
      this.progressTextContainer.nativeElement.style.color = boardColor;
    }

    // Establecer botón usando el color del board
    if (this.buttonElement) {
      const button = this.buttonElement.nativeElement;
      
      // Aplicar el color directo del board al botón
      button.style.backgroundColor = boardColor;
      button.style.color = '#ffffff';
      button.style.border = `1px solid ${boardColor}`;
      button.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.1)`;
      
      button.addEventListener('mouseenter', () => {
        button.style.opacity = '0.9';
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = `0 4px 12px ${this.hexToRgba(boardColor, 0.3)}`;
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
        button.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.1)`;
      });
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  private animateCardEntrance(): void {
    if (!this.cardElement) return;

    const cardEl = this.cardElement.nativeElement;
    
    // Configurar estado inicial
    cardEl.style.opacity = '0';
    cardEl.style.transform = 'translateY(20px) scale(0.96)';
    cardEl.style.transformOrigin = '50% 50%';
    cardEl.style.willChange = 'transform, opacity';

    // Ejecutar animación de entrada con delay escalonado
    setTimeout(() => {
      animate(cardEl, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.96, 1],
        duration: 520,
        easing: 'cubicBezier(0.175, 0.885, 0.32, 1.275)',
        complete: () => {
          cardEl.style.willChange = '';
          // Iniciar animaciones del contenido después de la entrada
          this.animateContent();
        }
      });
    }, this.animationDelay);
  }

  private animateContent(): void {
    // Animar la barra de progreso
    this.animateProgressBar();
    
    // Animar los números
    this.animateNumbers();
  }

  private animateProgressBar(): void {
    if (!this.progressBar || !this.progressText) return;
    
    const progressEl = this.progressBar.nativeElement;
    const progressTextEl = this.progressText.nativeElement;
    
    // Usar directamente el color del board
    const gradient = `linear-gradient(90deg, ${this.data.color}, ${this.data.color}dd)`;
    progressEl.style.background = gradient;
    
    setTimeout(() => {
      // Animar la barra
      progressEl.style.width = `${this.data.progress}%`;
      
      // Animar el texto del porcentaje
      this.animateCounter(progressTextEl, 0, this.data.progress, 1000);
    }, 200);
  }

  private animateNumbers(): void {
    setTimeout(() => {
      // Animar número de completadas
      if (this.completedNumber) {
        this.animateCounter(this.completedNumber.nativeElement, 0, this.data.completed, 800);
      }
      
      // Animar número de pendientes
      if (this.pendingNumber) {
        this.animateCounter(this.pendingNumber.nativeElement, 0, this.data.pending, 900);
      }
      
      // Animar número total
      if (this.totalNumber) {
        this.animateCounter(this.totalNumber.nativeElement, 0, this.data.total, 1000);
      }
    }, 400);
  }

  private animateCounter(element: HTMLElement, start: number, end: number, duration: number): void {
    if (this.isDestroyed) return;
    
    const startTime = performance.now();
    const difference = end - start;
    
    const step = (currentTime: number) => {
      if (this.isDestroyed) return;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(start + (difference * eased));
      
      element.textContent = currentValue.toString();
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end.toString();
      }
    };
    
    requestAnimationFrame(step);
  }

  onCardHoverEnter(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    
    target.style.willChange = 'transform';
    
    animate(target, {
      translateX: [0, 16],
      duration: 160,
      ease: 'linear'
    });
  }

  onCardHoverLeave(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    
    animate(target, {
      translateX: 0,
      duration: 140,
      ease: 'linear',
      complete: () => {
        target.style.willChange = '';
      }
    });
  }

  navigateToBoard(): void {
    
    this.router.navigate([`/home/board/1`]);
  }
}