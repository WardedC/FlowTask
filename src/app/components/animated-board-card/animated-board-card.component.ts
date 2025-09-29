import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate } from 'animejs';

export interface BoardCardData {
  title: string;
  description: string;
  icon: string;
  color: string;
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
    <div #cardElement class="animate-element group list-card bg-gray-50 dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl p-4 m-2"
         (mouseenter)="onCardHoverEnter($event)" (mouseleave)="onCardHoverLeave($event)"
         style="opacity: 0; transform: translateY(20px) scale(0.96);">
      
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div #iconContainer class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
            <i [class]="'fas ' + data.icon + ' text-white'"></i>
          </div>
          <div>
            <h3 #titleElement class="font-bold text-gray-900 dark:text-white transition-colors duration-200">
              {{ data.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ data.description }}</p>
          </div>
        </div>
        <button #buttonElement class="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 hover:scale-105 hover:shadow-md">
          <span>Ver Board</span>
          <i class="fas fa-external-link-alt ml-1.5 text-[10px]"></i>
        </button>
      </div>
      
      <!-- Progress Bar Animada -->
      <div class="mb-3">
        <div class="flex justify-between text-xs mb-2">
          <span class="text-gray-600 dark:text-gray-400">Progreso</span>
          <span #progressTextContainer class="font-bold text-blue-600 dark:text-blue-400">
            <span #progressText>0</span>%
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div #progressBar class="h-2.5 rounded-full transition-all duration-1000 ease-out"
               style="width: 0%; background-color: #6B7280;">
          </div>
        </div>
      </div>
      
      <!-- Estadísticas con números animados -->
      <div class="flex justify-between text-xs">
        <div class="flex items-center space-x-4">
          <span class="flex items-center text-green-600 dark:text-green-400">
            <i class="fas fa-check-circle mr-1"></i>
            <strong #completedNumber>0</strong>&nbsp;Completadas
          </span>
          <span class="flex items-center text-orange-600 dark:text-orange-400">
            <i class="fas fa-clock mr-1"></i>
            <strong #pendingNumber>0</strong>&nbsp;Pendientes
          </span>
        </div>
        <span class="text-gray-500 dark:text-gray-400">
          Total:&nbsp;<strong #totalNumber>0</strong>
        </span>
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
    }
  }

  ngAfterViewInit(): void {
    this.setElementColors();
    this.animateCardEntrance();
  }

  private setElementColors(): void {
    const colorMap: { [key: string]: { bg: string, light: string, dark: string } } = {
      'blue': { bg: '#3B82F6', light: '#DBEAFE', dark: '#2563EB' },
      'purple': { bg: '#8B5CF6', light: '#EDE9FE', dark: '#7C3AED' },
      'emerald': { bg: '#10B981', light: '#D1FAE5', dark: '#059669' }
    };

    const colors = colorMap[this.data.color] || { bg: '#6B7280', light: '#F3F4F6', dark: '#4B5563' };

    // Establecer color del icono
    if (this.iconContainer) {
      this.iconContainer.nativeElement.style.backgroundColor = colors.bg;
    }

    // Establecer color del texto del progreso
    if (this.progressTextContainer) {
      this.progressTextContainer.nativeElement.style.color = colors.dark;
    }

    // Establecer botón con efecto glassmorphism dinámico sin glow
    if (this.buttonElement) {
      const button = this.buttonElement.nativeElement;
      // Crear gradiente dinámico basado en el color de la carta
      const lightColor = this.hexToRgba(colors.bg, 0.1);
      const mediumColor = this.hexToRgba(colors.bg, 0.2);
      
      button.style.background = `linear-gradient(135deg, ${lightColor}, ${mediumColor})`;
      button.style.color = '#ffffff';
      button.style.border = `1px solid ${this.hexToRgba(colors.bg, 0.3)}`;
      button.style.backdropFilter = 'blur(20px)';
      button.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.1)`;
      button.style.transform = 'scale(1)';
      
      button.addEventListener('mouseenter', () => {
        const hoverLight = this.hexToRgba(colors.bg, 0.25);
        const hoverMedium = this.hexToRgba(colors.bg, 0.35);
        button.style.background = `linear-gradient(135deg, ${hoverLight}, ${hoverMedium})`;
        button.style.border = `1px solid ${this.hexToRgba(colors.bg, 0.5)}`;
        button.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.15)`;
        button.style.transform = 'scale(1.05) translateY(-2px)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = `linear-gradient(135deg, ${lightColor}, ${mediumColor})`;
        button.style.border = `1px solid ${this.hexToRgba(colors.bg, 0.3)}`;
        button.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.1)`;
        button.style.transform = 'scale(1) translateY(0px)';
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
    
    // Establecer el color de la barra según el tipo
    const colorMap: { [key: string]: string } = {
      'blue': '#3B82F6',
      'purple': '#8B5CF6', 
      'emerald': '#10B981'
    };
    
    progressEl.style.backgroundColor = colorMap[this.data.color] || '#6B7280';
    
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
}