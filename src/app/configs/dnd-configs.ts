import { DndSystemConfig } from '../../types/board.types';

/**
 * Configuración por defecto del sistema de Drag & Drop
 * 
 * Esta configuración proporciona un balance óptimo entre funcionalidad,
 * rendimiento y accesibilidad para la mayoría de casos de uso.
 */
export const DEFAULT_DND_CONFIG: DndSystemConfig = {
  
  // ===== CONFIGURACIÓN DE SNAP =====
  snap: {
    // Grid vertical (slots de tarjetas)
    grid: {
      enabled: true,
      slotHeight: 120,      // Altura base de tarjeta + gap
      gap: 12,              // Espacio entre tarjetas
      dynamicHeight: true   // Calcular altura automáticamente
    },
    
    // Targets horizontales (columnas)
    targets: {
      enabled: true,
      tolerance: 60,        // Distancia máxima para snap horizontal
      smoothing: 0.2        // Suavizado durante el drag (0-1)
    },
    
    // Umbrales y tolerancias
    thresholds: {
      snapThreshold: 10,       // Píxeles para evitar "bailes"
      dragThreshold: 8,        // Movimiento mínimo para iniciar drag
      autoScrollThreshold: 60  // Distancia del borde para auto-scroll
    }
  },

  // ===== CONFIGURACIÓN DE AUTO-SCROLL =====
  autoScroll: {
    // Scroll vertical (dentro de listas)
    vertical: {
      enabled: true,
      speed: 3,           // Velocidad base (px por frame)
      zone: 60,           // Tamaño de zona de activación (px)
      maxSpeed: 15        // Velocidad máxima
    },
    
    // Scroll horizontal (tablero completo)
    horizontal: {
      enabled: true,
      speed: 2,
      zone: 50,
      maxSpeed: 10
    }
  },

  // ===== CONFIGURACIÓN DE ACCESIBILIDAD =====
  accessibility: {
    // Navegación por teclado
    keyboard: {
      enabled: true,
      moveStep: 10,             // Píxeles por paso con flechas
      announceChanges: true     // Anunciar cambios via ARIA live
    },
    
    // Mensajes para screen readers
    announcements: {
      onPickup: 'Tarjeta seleccionada para mover. Use las flechas para cambiar posición, Enter para confirmar, Escape para cancelar.',
      onMove: 'Moviendo a {column}, posición {position}',
      onDrop: '¡Tarjeta movida exitosamente a {column}!',
      onCancel: 'Movimiento cancelado. Tarjeta regresó a su posición original.'
    }
  },

  // ===== CONFIGURACIÓN DE GHOST ELEMENT =====
  ghost: {
    enabled: true,
    opacity: 0.7,          // Transparencia del clone
    scale: 1.08,           // Escala del elemento ghost
    zIndex: 9999,          // Z-index para estar encima
    className: 'board-drag-ghost'  // Clase CSS adicional
  },

  // ===== CONFIGURACIÓN DE PLACEHOLDER =====
  placeholder: {
    enabled: true,
    opacity: 0.4,                              // Transparencia del placeholder
    height: 'auto',                            // Altura ('auto' o número en px)
    backgroundColor: '#e5e7eb',                // Color de fondo
    borderStyle: '2px dashed #9ca3af',         // Estilo de borde
    animationDuration: 250                     // Duración de animación (ms)
  },

  // ===== EVENTOS (se configuran en el componente) =====
  events: {
    // onDragStart: (event) => console.log('Drag started', event),
    // onDrop: (event) => console.log('Task dropped', event),
    // onCancel: (event) => console.log('Drag cancelled', event)
  },

  // ===== MODO DEBUG =====
  debug: false  // true para logs detallados en consola
};

/**
 * Configuración optimizada para móviles
 * 
 * Ajustes específicos para mejorar la experiencia en dispositivos táctiles
 */
export const MOBILE_DND_CONFIG: DndSystemConfig = {
  ...DEFAULT_DND_CONFIG,
  
  snap: {
    ...DEFAULT_DND_CONFIG.snap,
    targets: {
      enabled: true,
      tolerance: 80,        // Mayor tolerancia en móvil
      smoothing: 0.25       // Más suavizado para compensar precisión táctil
    },
    thresholds: {
      snapThreshold: 15,    // Mayor threshold para evitar movimientos accidentales
      dragThreshold: 12,    // Mayor threshold inicial
      autoScrollThreshold: 80
    }
  },
  
  autoScroll: {
    vertical: {
      enabled: true,
      speed: 4,             // Scroll más rápido en móvil
      zone: 80,             // Zona más grande
      maxSpeed: 20
    },
    horizontal: {
      enabled: true,
      speed: 3,
      zone: 60,
      maxSpeed: 15
    }
  },
  
  ghost: {
    ...DEFAULT_DND_CONFIG.ghost,
    scale: 1.1,             // Escala ligeramente mayor para mejor visibilidad
    opacity: 0.8
  }
};

/**
 * Configuración de alta precisión
 * 
 * Para casos donde se requiere máxima precisión en el posicionamiento
 */
export const PRECISION_DND_CONFIG: DndSystemConfig = {
  ...DEFAULT_DND_CONFIG,
  
  snap: {
    ...DEFAULT_DND_CONFIG.snap,
    targets: {
      enabled: true,
      tolerance: 40,        // Menor tolerancia para mayor precisión
      smoothing: 0.1        // Menos suavizado
    },
    thresholds: {
      snapThreshold: 5,     // Threshold muy pequeño
      dragThreshold: 3,
      autoScrollThreshold: 40
    }
  },
  
  placeholder: {
    ...DEFAULT_DND_CONFIG.placeholder,
    animationDuration: 150  // Animaciones más rápidas
  }
};

/**
 * Configuración accesible
 * 
 * Optimizada para usuarios de tecnologías asistivas
 */
export const ACCESSIBLE_DND_CONFIG: DndSystemConfig = {
  ...DEFAULT_DND_CONFIG,
  
  accessibility: {
    keyboard: {
      enabled: true,
      moveStep: 5,          // Movimientos más pequeños y precisos
      announceChanges: true
    },
    announcements: {
      onPickup: 'Tarjeta seleccionada. Título: {title}. Estado actual: {status}. Use las flechas para mover, Enter para soltar, Escape para cancelar.',
      onMove: 'Moviendo tarjeta a columna {column}, posición {position} de {total}',
      onDrop: 'Tarjeta "{title}" movida exitosamente de {fromColumn} a {toColumn}, posición {position}',
      onCancel: 'Movimiento de tarjeta "{title}" cancelado. Regresó a {originalColumn}, posición {originalPosition}'
    }
  },
  
  ghost: {
    ...DEFAULT_DND_CONFIG.ghost,
    enabled: false          // Desactivar ghost para reducir distracción visual
  },
  
  placeholder: {
    ...DEFAULT_DND_CONFIG.placeholder,
    opacity: 0.8,           // Placeholder más visible
    animationDuration: 400  // Animación más lenta para seguimiento visual
  }
};

/**
 * Configuración de rendimiento
 * 
 * Optimizada para dispositivos con recursos limitados
 */
export const PERFORMANCE_DND_CONFIG: DndSystemConfig = {
  ...DEFAULT_DND_CONFIG,
  
  autoScroll: {
    vertical: {
      enabled: true,
      speed: 2,             // Velocidades reducidas
      zone: 40,
      maxSpeed: 8
    },
    horizontal: {
      enabled: false,       // Desactivar scroll horizontal para reducir carga
      speed: 0,
      zone: 0,
      maxSpeed: 0
    }
  },
  
  ghost: {
    ...DEFAULT_DND_CONFIG.ghost,
    enabled: false          // Sin ghost para mejor rendimiento
  },
  
  placeholder: {
    ...DEFAULT_DND_CONFIG.placeholder,
    animationDuration: 100  // Animaciones más rápidas
  },
  
  accessibility: {
    ...DEFAULT_DND_CONFIG.accessibility,
    announcements: {
      onPickup: 'Tarjeta seleccionada',
      onMove: '',           // Mensajes mínimos
      onDrop: 'Tarjeta movida',
      onCancel: 'Movimiento cancelado'
    }
  }
};

/**
 * Función helper para crear configuraciones personalizadas
 */
export function createDndConfig(overrides: Partial<DndSystemConfig>): DndSystemConfig {
  return {
    ...DEFAULT_DND_CONFIG,
    ...overrides,
    snap: {
      ...DEFAULT_DND_CONFIG.snap,
      ...overrides.snap
    },
    autoScroll: {
      ...DEFAULT_DND_CONFIG.autoScroll,
      ...overrides.autoScroll
    },
    accessibility: {
      ...DEFAULT_DND_CONFIG.accessibility,
      ...overrides.accessibility
    },
    ghost: {
      ...DEFAULT_DND_CONFIG.ghost,
      ...overrides.ghost
    },
    placeholder: {
      ...DEFAULT_DND_CONFIG.placeholder,
      ...overrides.placeholder
    },
    events: {
      ...DEFAULT_DND_CONFIG.events,
      ...overrides.events
    }
  };
}

/**
 * Detectar configuración óptima basada en el dispositivo
 */
export function getOptimalDndConfig(): DndSystemConfig {
  // Detectar si es móvil
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Detectar si prefiere menos movimiento (accesibilidad)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Detectar rendimiento del dispositivo (aproximado)
  const isLowPerformance = navigator.hardwareConcurrency <= 2;

  if (prefersReducedMotion) {
    return ACCESSIBLE_DND_CONFIG;
  }
  
  if (isLowPerformance) {
    return PERFORMANCE_DND_CONFIG;
  }
  
  if (isMobile) {
    return MOBILE_DND_CONFIG;
  }
  
  return DEFAULT_DND_CONFIG;
}