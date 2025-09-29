import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate } from 'animejs';

export interface StatsCardData {
  title: string;
  value: string;
  description: string;
  icon: string;
  gradient: {
    from: string;
    to: string;
    fromDark: string;
    toDark: string;
  };
  accentColor: string;
  statusText: string;
}

@Component({
  selector: 'app-animated-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #cardElement class="animate-element bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group"
         (mouseenter)="onCardHoverEnter($event)" (mouseleave)="onCardHoverLeave($event)"
         style="opacity: 0; transform: translateY(20px) scale(0.96);">
      <!-- Sección superior con animación -->
      <div class="relative h-18 overflow-hidden"
           [ngClass]="'bg-gradient-to-br from-[' + data.gradient.from + '] to-[' + data.gradient.to + '] dark:from-[' + data.gradient.fromDark + '] dark:to-[' + data.gradient.toDark + ']'">
        <!-- Overlay de gradiente -->
        <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent stats-header-overlay"></div>
        
        <!-- Contenedor de animación de figuras geométricas -->
        <div #animationContainer class="absolute inset-0 pointer-events-none overflow-hidden" 
             style="z-index: 1;">
        </div>
        
        <!-- Icono de la carta -->
        <div class="absolute top-3 left-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center card-icon"
             style="z-index: 3;">
          <i [class]="'fas ' + data.icon + ' text-sm text-white'"></i>
        </div>
        
        <!-- Título -->
        <div class="absolute bottom-3 right-4" style="z-index: 3;">
          <p class="text-white/90 text-lg font-medium">{{ data.title }}</p>
        </div>
      </div>
      
      <!-- Sección inferior con métricas -->
      <div class="p-4 relative overflow-hidden">
        <!-- Partículas flotantes en el fondo del body -->
        <div #bodyParticles class="absolute inset-0 pointer-events-none" style="z-index: 1;">
        </div>
        
        <!-- Contenido principal -->
        <div class="relative" style="z-index: 2;">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ data.description }}</p>
          
          <!-- Valor principal con círculo y icono de tendencia -->
          <div class="flex items-center justify-between mb-2">
            <!-- Lado izquierdo: círculo + número -->
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full animate-pulse" 
                   [ngClass]="{
                     'bg-[#2EC4B6]': data.title === 'Total',
                     'bg-green-500': data.title === 'Completadas',
                     'bg-orange-500': data.title === 'En proceso'
                   }"></div>
              <p #valueNumber class="text-2xl font-bold transition-colors duration-200"
                 [ngClass]="{
                   'text-gray-900 dark:text-white group-hover:text-[var(--ft-cerulean)]': data.title === 'Total',
                   'text-green-600 dark:text-green-400 group-hover:text-[#2EC4B6]': data.title === 'Completadas',
                   'text-orange-600 dark:text-orange-400 group-hover:text-[#FFB400]': data.title === 'En proceso'
                 }">
                {{ data.value }}
              </p>
            </div>
            
            <!-- Lado derecho: icono de tendencia -->
            <div class="flex items-center">
              <i class="fas text-lg"
                 [ngClass]="{
                   'fa-tasks text-[#2EC4B6]': data.title === 'Total',
                   'fa-check-circle text-green-500': data.title === 'Completadas',
                   'fa-clock text-orange-500': data.title === 'En proceso'
                 }"></i>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-header-overlay {
      z-index: 2;
      pointer-events: none;
    }

    .card-icon {
      position: relative;
      z-index: 3;
    }

    .geometric-shape {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(2px);
      will-change: transform, opacity;
      transition: all 0.1s ease-out;
    }

    .geometric-shape.triangle {
      border-radius: 0;
      background: transparent;
      width: 0;
      height: 0;
      box-shadow: none;
      filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
    }

    .geometric-shape.rectangle {
      border-radius: 4px;
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.25);
    }

    /* Transiciones suaves para hover effects */
    .group {
      transition: all 0.3s ease;
    }

    /* Estilos para partículas del body */
    .body-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(0.5px);
      will-change: transform, opacity;
    }

    /* Animación para el efecto de pulso en el número */
    @keyframes number-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class AnimatedStatsCardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() data!: StatsCardData;
  @Input() animationDelay: number = 0; // Delay para animación de entrada escalonada
  @ViewChild('animationContainer', { static: false }) animationContainer!: ElementRef<HTMLElement>;
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef<HTMLElement>;
  @ViewChild('bodyParticles', { static: false }) bodyParticles!: ElementRef<HTMLElement>;
  @ViewChild('valueNumber', { static: false }) valueNumber!: ElementRef<HTMLElement>;
  
  private animationInstances: any[] = [];
  private shapes: HTMLElement[] = [];
  private isDestroyed = false;

  ngOnInit(): void {
    // Validación de datos requeridos
    if (!this.data) {
      console.warn('AnimatedStatsCard: No se proporcionaron datos');
    }
  }

  ngAfterViewInit(): void {
    // Iniciar animación de entrada
    this.animateCardEntrance();
    
    // Iniciar las animaciones geométricas después de la entrada
    setTimeout(() => {
      this.startGeometricAnimation();
    }, 300 + this.animationDelay);
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
          // Iniciar animaciones del contenido del body después de la entrada
          this.animateBodyContent();
        }
      });
    }, this.animationDelay);
  }

  private animateBodyContent(): void {
    // Crear partículas flotantes
    this.createBodyParticles();
    
    // Animar el número con efecto de conteo
    this.animateValueCounter();
  }

  private createBodyParticles(): void {
    if (!this.bodyParticles) return;
    
    const container = this.bodyParticles.nativeElement;
    const particleCount = 3;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full opacity-30';
      
      // Color basado en el tema de la carta
      const color = this.getParticleColor();
      particle.style.backgroundColor = color;
      
      // Posición aleatoria
      particle.style.left = Math.random() * 80 + 10 + '%';
      particle.style.top = Math.random() * 60 + 20 + '%';
      
      container.appendChild(particle);
      
      // Animar partícula flotante
      this.animateParticle(particle, i);
    }
  }

  private getParticleColor(): string {
    switch (this.data.title) {
      case 'Total': return '#2EC4B6';
      case 'Completadas': return '#10B981';
      case 'En proceso': return '#F59E0B';
      default: return '#6B7280';
    }
  }

  private animateParticle(particle: HTMLElement, index: number): void {
    if (this.isDestroyed) return;
    
    // Crear una animación continua suave usando loop
    const animation = animate(particle, {
      translateY: [
        { value: 0, duration: 1500 },
        { value: -12, duration: 1500 },
        { value: 0, duration: 1500 }
      ],
      translateX: [
        { value: 0, duration: 1500 },
        { value: Math.random() * 6 - 3, duration: 1500 },
        { value: 0, duration: 1500 }
      ],
      opacity: [
        { value: 0.3, duration: 1500 },
        { value: 0.7, duration: 1500 },
        { value: 0.3, duration: 1500 }
      ],
      scale: [
        { value: 1, duration: 1500 },
        { value: 1.2, duration: 1500 },
        { value: 1, duration: 1500 }
      ],
      loop: true,
      easing: 'easeInOutSine',
      delay: index * 300, // Escalonar las animaciones
      autoplay: true
    });
    
    // Almacenar la animación para limpieza
    this.animationInstances.push(animation);
  }

  private animateValueCounter(): void {
    if (!this.valueNumber) return;
    
    const numberEl = this.valueNumber.nativeElement;
    const targetValue = parseInt(this.data.value);
    let currentValue = 0;
    const duration = 1000;
    const steps = 30;
    const increment = targetValue / steps;
    const stepDuration = duration / steps;
    
    const counter = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(counter);
        return;
      }
      
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(counter);
      }
      numberEl.textContent = Math.floor(currentValue).toString();
    }, stepDuration);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.cleanupAnimations();
  }

  private startGeometricAnimation(): void {
    if (this.isDestroyed || !this.animationContainer) {
      return;
    }

    const container = this.animationContainer.nativeElement;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width || 280;
    const containerHeight = containerRect.height || 80;

    // Configuración de la animación
    const shapeCount = 8; // Número de figuras geométricas
    const shapeTypes = ['circle', 'triangle', 'rectangle'];

    for (let i = 0; i < shapeCount; i++) {
      // Todas las figuras inician inmediatamente
      this.createShape(container, containerWidth, containerHeight, shapeTypes, true);
    }
  }

  private createShape(container: HTMLElement, width: number, height: number, shapeTypes: string[], immediateStart: boolean = false): void {
    if (this.isDestroyed) return;

    const shape = document.createElement('div');
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = 12 + Math.random() * 20; // Tamaño más grande: entre 12-32px
    
    // Posición inicial aleatoria en el fondo
    const startX = Math.random() * (width - size);
    const startY = height + size + Math.random() * 20;
    
    // Configurar la forma según el tipo
    this.setupShapeGeometry(shape, shapeType, size);
    
    // Posicionar la forma
    shape.style.left = `${startX}px`;
    shape.style.top = `${startY}px`;
    shape.style.position = 'absolute';
    shape.style.zIndex = '1';
    shape.style.opacity = '0.5'; // Comenzar con opacidad más visible

    container.appendChild(shape);
    this.shapes.push(shape);

    // Crear la animación
    this.animateShape(shape, width, height, size, immediateStart);
  }  private setupShapeGeometry(shape: HTMLElement, shapeType: string, size: number): void {
    shape.className = `geometric-shape ${shapeType}`;
    
    const opacity = 0.5 + Math.random() * 0.3; // Opacidad más intensa: 0.5-0.8
    
    switch (shapeType) {
      case 'circle':
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.background = `rgba(255, 255, 255, ${opacity})`;
        shape.style.borderRadius = '50%';
        shape.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.3)'; // Sombra blanca sutil
        break;
        
      case 'triangle':
        const triangleSize = size * 0.8;
        shape.style.width = '0';
        shape.style.height = '0';
        shape.style.borderLeft = `${triangleSize/2}px solid transparent`;
        shape.style.borderRight = `${triangleSize/2}px solid transparent`;
        shape.style.borderBottom = `${triangleSize}px solid rgba(255, 255, 255, ${opacity})`;
        shape.style.filter = 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))'; // Sombra para triángulo
        break;
        
      case 'rectangle':
        const rectWidth = size * 1.2;
        const rectHeight = size * 0.8;
        shape.style.width = `${rectWidth}px`;
        shape.style.height = `${rectHeight}px`;
        shape.style.background = `rgba(255, 255, 255, ${opacity})`;
        shape.style.borderRadius = '3px';
        shape.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.3)'; // Sombra blanca sutil
        break;
    }
  }

  private animateShape(shape: HTMLElement, containerWidth: number, containerHeight: number, size: number, immediateStart: boolean = false): void {
    if (this.isDestroyed) return;

    // Movimiento completo hacia arriba con deriva lateral orgánica
    const endY = -(containerHeight + size + 30); // Subir completamente fuera del contenedor
    const drift = (Math.random() - 0.5) * (containerWidth * 0.4); // Deriva lateral más pronunciada
    const duration = 5000 + Math.random() * 3000; // Duración: 5-8 segundos
    const delay = 0; // Sin delay - inicio completamente inmediato
    
    // Opacidad pico más intensa en el medio del recorrido
    const peakOpacity = 0.6 + Math.random() * 0.3; // Opacidad pico: 0.6-0.9

    const animation = animate(shape, {
      keyframes: [
        { 
          translateY: 0, 
          translateX: 0, 
          opacity: 0.2, // Comenzar con poca opacidad
          scale: 0.7,
          rotate: 0 
        },
        { 
          translateY: -(containerHeight * 0.25), 
          translateX: drift * 0.2, 
          opacity: peakOpacity * 0.7, 
          scale: 1.0,
          rotate: Math.random() * 60 - 30 
        },
        { 
          translateY: -(containerHeight * 0.5), 
          translateX: drift * 0.5, 
          opacity: peakOpacity, // Máxima opacidad en el centro
          scale: 1.2,
          rotate: Math.random() * 120 - 60 
        },
        { 
          translateY: -(containerHeight * 0.75), 
          translateX: drift * 0.8, 
          opacity: peakOpacity * 0.8, 
          scale: 1.1,
          rotate: Math.random() * 180 - 90 
        },
        { 
          translateY: endY, 
          translateX: drift, 
          opacity: 0, // Desaparecer al final
          scale: 0.8,
          rotate: Math.random() * 360 - 180 
        }
      ],
      duration: duration,
      delay: delay,
      easing: 'easeInOutSine',
      loop: true,
      autoplay: true,
      complete: () => {
        // Callback cuando se completa un ciclo
      }
    });

    // Añadir variación adicional con una segunda animación sutil
    const floatAnimation = animate(shape, {
      translateX: [
        { value: '+=8', duration: 2500 + Math.random() * 1500 },
        { value: '-=16', duration: 2500 + Math.random() * 1500 },
        { value: '+=8', duration: 2500 + Math.random() * 1500 }
      ],
      easing: 'easeInOutQuad',
      loop: true,
      autoplay: true
    });

    // Verificar que el componente no esté destruido antes de iniciar animaciones
    if (!this.isDestroyed) {
      // Restaurar el seek aleatorio para distribuir las figuras en diferentes puntos del ciclo
      // pero mantener el inicio inmediato
      animation.seek(animation.duration * Math.random());
      floatAnimation.seek(floatAnimation.duration * Math.random());

      this.animationInstances.push(animation, floatAnimation);
    } else {
      // Si está destruido, pausar inmediatamente
      animation.pause();
      floatAnimation.pause();
    }
  }

  private cleanupAnimations(): void {
    // Marcar como destruido primero
    this.isDestroyed = true;
    
    // Pausar todas las animaciones
    this.animationInstances.forEach(animation => {
      try {
        if (animation && typeof animation.pause === 'function') {
          animation.pause();
        }
        if (animation && typeof animation.remove === 'function') {
          animation.remove();
        }
      } catch (e) {
        // Ignorar errores al pausar animaciones ya terminadas
        console.warn('Error cleaning animation:', e);
      }
    });
    
    // Limpiar arrays
    this.animationInstances = [];
    
    // Remover figuras del DOM de forma segura
    this.shapes.forEach(shape => {
      try {
        if (shape && shape.parentElement) {
          shape.parentElement.removeChild(shape);
        }
      } catch (e) {
        console.warn('Error removing shape:', e);
      }
    });
    this.shapes = [];
  }

  // Efectos hover para la carta
  onCardHoverEnter(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;

    target.style.willChange = 'transform';
    
    animate(target, {
      scale: [1, 1.02],
      duration: 160,
      easing: 'easeOutQuad'
    });

    // Animar el icono
    const icon = target.querySelector('.card-icon i');
    if (icon) {
      animate(icon, {
        scale: [1, 1.15],
        rotate: [0, 5],
        duration: 160,
        easing: 'easeOutQuad'
      });
    }
  }

  onCardHoverLeave(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    
    animate(target, {
      scale: 1,
      duration: 140,
      easing: 'easeOutQuad',
      complete: () => {
        target.style.willChange = '';
      }
    });

    // Animar el icono de vuelta
    const icon = target.querySelector('.card-icon i');
    if (icon) {
      animate(icon, {
        scale: 1,
        rotate: 0,
        duration: 140,
        easing: 'easeOutQuad'
      });
    }
  }
}