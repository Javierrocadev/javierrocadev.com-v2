// taos-astro.js - Adaptación de Taos para Astro
// Basado en https://github.com/versoly/taos

// Configuración por defecto (similar a la de Taos)
const defaultConfig = {
    selector: '[data-taos]', // Selector para los elementos animados
    once: true,              // La animación se ejecuta una sola vez
    threshold: 0.2,          // Umbral de visibilidad para activar la animación
    delay: 0,                // Retraso base para todas las animaciones (ms)
    duration: 1000,          // Duración de la animación (ms)
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Función de easing
  };
  
  // Mapa de animaciones disponibles (basado en las animaciones de Taos)
  const animations = {
    'fade': {
      initial: { opacity: '0' },
      target: { opacity: '1' }
    },
    'slide-up': {
      initial: { opacity: '0', transform: 'translateY(20px)' },
      target: { opacity: '1', transform: 'translateY(0)' }
    },
    'slide-down': {
      initial: { opacity: '0', transform: 'translateY(-20px)' },
      target: { opacity: '1', transform: 'translateY(0)' }
    },
    'slide-left': {
      initial: { opacity: '0', transform: 'translateX(20px)' },
      target: { opacity: '1', transform: 'translateX(0)' }
    },
    'slide-right': {
      initial: { opacity: '0', transform: 'translateX(-20px)' },
      target: { opacity: '1', transform: 'translateX(0)' }
    },
    'zoom-in': {
      initial: { opacity: '0', transform: 'scale(0.95)' },
      target: { opacity: '1', transform: 'scale(1)' }
    },
    'zoom-out': {
      initial: { opacity: '0', transform: 'scale(1.05)' },
      target: { opacity: '1', transform: 'scale(1)' }
    },
    'flip-up': {
      initial: { opacity: '0', transform: 'perspective(500px) rotateX(10deg)' },
      target: { opacity: '1', transform: 'perspective(500px) rotateX(0)' }
    },
    'flip-down': {
      initial: { opacity: '0', transform: 'perspective(500px) rotateX(-10deg)' },
      target: { opacity: '1', transform: 'perspective(500px) rotateX(0)' }
    },
  };
  
  // Clase principal
  class TaosAstro {
    constructor(userConfig = {}) {
      this.config = { ...defaultConfig, ...userConfig };
      this.animatedElements = new Set();
      this.observer = null;
      this.initialized = false;
    }
  
    // Inicializa la biblioteca
    init() {
      if (this.initialized) return;
      
      // Crear el IntersectionObserver
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        threshold: this.config.threshold,
        rootMargin: '0px'
      });
  
      // Inicializar elementos existentes
      this.initElements();
  
      // Detección de MutationObserver para detectar nuevos elementos
      if (typeof MutationObserver !== 'undefined') {
        const mutationObserver = new MutationObserver(() => {
          this.initElements();
        });
        
        mutationObserver.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
  
      this.initialized = true;
      return this;
    }
  
    // Inicializa los elementos con atributo data-taos
    initElements() {
      const elements = document.querySelectorAll(this.config.selector);
      elements.forEach(element => {
        if (!this.animatedElements.has(element)) {
          this.prepareElement(element);
          this.observer.observe(element);
          this.animatedElements.add(element);
        }
      });
    }
  
    // Prepara un elemento para la animación
    prepareElement(element) {
      const animation = element.getAttribute('data-taos') || 'fade';
      const delay = parseInt(element.getAttribute('data-taos-delay') || this.config.delay);
      const duration = parseInt(element.getAttribute('data-taos-duration') || this.config.duration);
      const easing = element.getAttribute('data-taos-easing') || this.config.easing;
      const once = element.hasAttribute('data-taos-once') ? 
                   element.getAttribute('data-taos-once') !== 'false' : 
                   this.config.once;
      
      // Guardar los datos en el elemento
      element._taosData = {
        animation,
        delay,
        duration,
        easing,
        once
      };
  
      // Aplicar estilos iniciales
      if (animations[animation]) {
        Object.entries(animations[animation].initial).forEach(([prop, value]) => {
          element.style[prop] = value;
        });
      }
  
      // Configurar la transición
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
    }
  
    // Maneja las intersecciones detectadas
    handleIntersection(entries) {
      entries.forEach(entry => {
        const element = entry.target;
        const data = element._taosData;
        
        if (!data) return;
        
        if (entry.isIntersecting) {
          this.animateElement(element, data.animation);
          
          if (data.once) {
            this.observer.unobserve(element);
          }
        } else if (!data.once) {
          this.resetElement(element, data.animation);
        }
      });
    }
  
    // Anima un elemento
    animateElement(element, animationName) {
      const animation = animations[animationName];
      if (!animation) return;
      
      // Aplicar estilos de destino
      Object.entries(animation.target).forEach(([prop, value]) => {
        element.style[prop] = value;
      });
    }
  
    // Resetea un elemento a su estado inicial
    resetElement(element, animationName) {
      const animation = animations[animationName];
      if (!animation) return;
      
      // Aplicar estilos iniciales
      Object.entries(animation.initial).forEach(([prop, value]) => {
        element.style[prop] = value;
      });
    }
  
    // Método para añadir animaciones personalizadas
    addAnimation(name, initialStyles, targetStyles) {
      animations[name] = {
        initial: initialStyles,
        target: targetStyles
      };
      return this;
    }
  }
  
  // Crear instancia y exportarla
  const taosAstro = new TaosAstro();
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    taosAstro.init();
  });
  
  // Exportar para uso en módulos
  export default taosAstro;