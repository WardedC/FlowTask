import { ChangeDetectionStrategy, Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { animate, createTimeline, stagger } from 'animejs';

@Component({
  selector: 'app-loggin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loggin.component.html',
  styleUrl: './loggin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogginComponent implements AfterViewInit {
  form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    remember: FormControl<boolean>;
  }>;
  submitted = false;
  private registerMode = false;

  @ViewChild('splash', { static: false }) splashRef!: ElementRef<HTMLElement>;
  @ViewChild('card', { static: false }) cardRef!: ElementRef<HTMLElement>;

  constructor(private fb: FormBuilder, private host: ElementRef<HTMLElement>) {
    this.form = this.fb.nonNullable.group({
      email: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.email] }),
      password: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(6)] }),
      remember: this.fb.nonNullable.control(false)
    });
  }

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;

   // Staged entrance
    const tl = createTimeline({ autoplay: true });
    tl.add(root.querySelector('.login-card') as Element, {
      // Card entrance
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      ease: 'outCubic'
    });
    tl.add(root.querySelectorAll('.form-item'), {
      // Stagger form items
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 400,
      delay: stagger(90),
      ease: 'outCubic'
    }, '-=350');

    // Splash squares setup
    const splash = this.splashRef?.nativeElement;
    const card = this.cardRef?.nativeElement;
    if (splash && card) {
      requestAnimationFrame(() => {
        const sr = splash.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2 - sr.left;
        const cy = cr.top + cr.height / 2 - sr.top;

        const rand = (min: number, max: number) => Math.random() * (max - min) + min;
        const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

        const count = 70;
        const sizes = [
          6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 12, 12, 14, 14, 16, 18, 20, 24, 28, 32, 36, 40,
          56, 72, 96, 128, 160, 200, 240
        ];
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        // Colores ponderados (menos probabilidad de blanco)
        const colors = [
          '#0075A2', '#0075A2', '#0075A2',
          '#D7263D', '#D7263D', '#D7263D',
          '#FAF0CA', '#FAF0CA',
          '#FCFFFC'
        ];
        const squares: HTMLElement[] = [];
        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
        const margin = 28; // avoid leaving the viewport
        const maxDx = sr.width / 2 - margin;
        const maxDy = sr.height / 2 - margin;
        const rMaxAllowed = Math.min(maxDx, maxDy);
        // Balance exacto: mitad izquierda, mitad derecha
        const leftQuota = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
          const el = document.createElement('div');
          el.className = 'splash-square';
          const size = pick(sizes);
          const aspect = pick([1, 1, 1, 1.3, 1.6, 2.0]);
          const orient = Math.random() < 0.5 ? 'h' : 'v';
          
          // Base inline styles to avoid Angular style encapsulation issues

          el.style.position = 'absolute';
          el.style.left = `${cx}px`;
          el.style.top = `${cy}px`;
          el.style.width = orient === 'h' ? `${Math.round(size * aspect)}px` : `${size}px`;
          el.style.height = orient === 'v' ? `${Math.round(size * aspect)}px` : `${size}px`;
          el.style.background = pick(colors);
          el.style.borderRadius = '6px';
          el.style.opacity = '1';
          el.style.boxShadow = '0 8px 22px rgba(0,0,0,0.25)';
          el.style.willChange = 'transform, opacity, border-radius';
          el.style.backfaceVisibility = 'hidden';
          el.style.mixBlendMode = 'normal';
          const side = i < leftQuota ? -1 : 1; // -1: izquierda, 1: derecha
          const angle = side === 1
            ? rand(-Math.PI / 2, Math.PI / 2)         // hemisferio derecho (cos > 0)
            : rand(Math.PI / 2, 3 * Math.PI / 2);     // hemisferio izquierdo (cos < 0)
          const tLarge = (size - minSize) / (maxSize - minSize); // 0 pequeño, 1 grande
          const isSmall = size < 96; // pequeñas rotan; >=96 no rotan
          const rInner = Math.max(80, rMaxAllowed * 0.28);
          const rMid   = Math.max(rInner + 40, rMaxAllowed * 0.52);
          const rMax   = rMaxAllowed;
          let rBase: number;
          if (isSmall) {
            // Pequeños con sesgo fuerte al anillo exterior
            rBase = rMid + (rMax - rMid) * Math.pow(Math.random(), 0.35);
          } else {
            // Grandes concentrados entre interior y medio
            const u = Math.random();
            rBase = u < 0.4
              ? rInner + (rMid - rInner) * Math.pow(Math.random(), 1.2)
              : rMid + (rMax - rMid) * Math.pow(Math.random(), 0.9);
          }
          let dist = (rBase + Math.pow(1 - tLarge, 1.2) * (rMax - rMid) * 0.5) * rand(1.02, 1.18);
          if (isSmall) { dist *= 1.12; }
          let dx = Math.cos(angle) * dist;
          let dy = Math.sin(angle) * dist;
          dx = Math.max(-maxDx, Math.min(maxDx, dx));
          dy = Math.max(-maxDy, Math.min(maxDy, dy));
          if (Math.abs(dx) < 6) { dx = dx < 0 ? -6 : 6; }
          // Gentle idle rotation target
          const rotBase = rand(-45, 45); // base marcada
          (el as any).dataset.dx = String(dx);
          (el as any).dataset.dy = String(dy);
          (el as any).dataset.rotBase = String(rotBase);
          (el as any).dataset.x0 = String(dx);
          (el as any).dataset.y0 = String(dy);
          (el as any).dataset.tLarge = String(tLarge);
          (el as any).dataset.size = String(size);
          // initial transform vars and transform definition using CSS variables
          el.style.setProperty('--x', '0px');
          el.style.setProperty('--y', '0px');
          el.style.setProperty('--scale', '0');
          el.style.setProperty('--rot', '0deg');
          el.style.transform = 'translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(var(--scale, 0)) rotate(var(--rot, 0deg))';
          splash.appendChild(el);
          squares.push(el);
        }


        animate(squares, {
          '--x': (el: any) => `${parseFloat((el?.dataset?.dx || '0'))}px`,
          '--y': (el: any) => `${parseFloat((el?.dataset?.dy || '0'))}px`,
          '--scale': (el: any) => {
            const tLarge = parseFloat(el?.dataset?.tLarge || '0'); // 0 pequeño, 1 grande
            const base = 0.96 + (1 - tLarge) * 0.18; // pequeños algo más grandes
            return base * rand(0.96, 1.06);
          },
          '--rot': (el: any) => `${parseFloat((el?.dataset?.rotBase || '0'))}deg`,
          borderRadius: () => `${Math.round(rand(0, 10))}px`,
          duration: () => rand(1200, 1800),
          delay: () => rand(0, 400),
          ease: 'outElastic(1, .6)',
          complete: () => {
            // Rotación continua solo para pequeñas (<96)
            const smallSquares = squares.filter(el => parseFloat((el as any).dataset?.size || '0') < 96);
            if (smallSquares.length) {
              animate(smallSquares, {
                '--rot': '+=360deg',
                duration: () => rand(14000, 22000),
                loop: true,
                ease: 'linear',
                delay: (_el: any, i: number) => i * 45
              });
            }
          }
        });      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    // Simulate submit animation
    const btn = this.host.nativeElement.querySelector('.btn-primary') as HTMLElement | null;
    if (btn) {
      animate(btn, { scale: [1, 0.98, 1], duration: 350, ease: 'inOutQuad' });
    }
    // Replace with real auth logic
    // console.log('auth', this.form.value);
  }

  toggleRegister(ev?: Event): void {
    ev?.preventDefault();
    const card = this.cardRef?.nativeElement;
    if (!card) return;
    const panel = card.querySelector('.register-panel') as HTMLElement | null;
    const front = card.querySelector('.front-face') as HTMLElement | null;
    const direction = this.registerMode ? [180, 0] as [number, number] : [0, 180] as [number, number];
    this.registerMode = !this.registerMode;
    // Flip animation on the card
    animate(card, {
      rotateY: direction,
      duration: 650,
      ease: 'inOutCubic'
    });
    // Crossfade panels
    if (panel) {
      animate(panel, {
        opacity: this.registerMode ? [0, 1] : [1, 0],
        duration: 450,
        delay: this.registerMode ? 220 : 0,
        ease: 'inOutCubic',
        begin: () => {
          if (this.registerMode) {
            panel.style.pointerEvents = 'auto';
            if (front) front.style.pointerEvents = 'none';
          } else {
            if (front) front.style.pointerEvents = '';
          }
        },
        complete: () => {
          if (!this.registerMode) {
            panel.style.pointerEvents = 'none';
            if (front) front.style.pointerEvents = '';
          }
        }
      });
    }
  }

  buttonWave(ev: MouseEvent): void {
    const btn = ev.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    btn.appendChild(span);
    const maxDim = Math.max(rect.width, rect.height) * 1.6;
    animate(span, {
      scale: [0, maxDim / 16],
      opacity: [0.65, 0],
      duration: 600,
      ease: 'outCubic',
      onComplete: () => span.remove()
    });
  }
}



