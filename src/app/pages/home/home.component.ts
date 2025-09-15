import { ChangeDetectionStrategy, Component, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, createTimeline, stagger } from 'animejs';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  viewMode: 'grid' | 'list' = 'grid';
  user = { name: 'Edward', initial: 'E' };
  menuOpen = false;

  @ViewChildren('wsItem') wsItems!: QueryList<ElementRef<HTMLElement>>;

  workspaces = [
    {
      id: 'ws-flow-dev',
      title: 'FlowTask - Desarrollo',
      desc: 'Tableros del equipo de desarrollo, sprints y bugs.',
      cover: '/assets/FlowTask.png',
    },
    {
      id: 'ws-design',
      title: 'Diseño UX/UI',
      desc: 'Wireframes, mockups y bibliotecas de componentes.',
      cover: '/assets/FlowTask.png',
    },
    {
      id: 'ws-marketing',
      title: 'Marketing',
      desc: 'Campañas, contenidos y calendario social.',
      cover: '/assets/FlowTask.png',
    },
    {
      id: 'ws-ops',
      title: 'Operaciones',
      desc: 'Checklists, proveedores y documentación interna.',
      cover: '/assets/FlowTask.png',
    },
    {
      id: 'ws-hr',
      title: 'Recursos Humanos',
      desc: 'Onboarding, políticas y vacantes activas.',
      cover: '/assets/FlowTask.png',
    },
    {
      id: 'ws-labs',
      title: 'Laboratorio',
      desc: 'Ideas, pruebas A/B y prototipos.',
      cover: '/assets/FlowTask.png',
    },
  ];

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
