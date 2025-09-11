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

        const count = 32; // más figuras
        const sizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 56, 72, 96, 128, 160, 200, 240];
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        const colors = [
          '#0075A2', // cerulean
          '#D7263D', // crimson
          '#FAF0CA', // lemon chiffon
          '#FCFFFC'  // baby powder
        ];
        const squares: HTMLElement[] = [];
        for (let i = 0; i < count; i++) {
          const el = document.createElement('div');
          el.className = 'splash-square';
          const size = pick(sizes);
          // Base inline styles to avoid Angular style encapsulation issues
          el.style.position = 'absolute';
          el.style.left = `${cx}px`;
          el.style.top = `${cy}px`;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.background = pick(colors);
          el.style.borderRadius = '6px';
          el.style.opacity = '1';
          el.style.boxShadow = '0 8px 22px rgba(0,0,0,0.25)';
          el.style.willChange = 'transform, opacity, border-radius';
          el.style.backfaceVisibility = 'hidden';
          el.style.mixBlendMode = 'screen';
          // Lateral splash vector (bias to left/right)
          const side = Math.random() < 0.5 ? -1 : 1; // -1: left, 1: right
          const jitter = rand(-0.22, 0.22); // mantener lateral, ~ +/-12.6deg
          const angle = side === 1 ? jitter : Math.PI + jitter;
          // Mapear tamaño -> distancia (grande más cerca, pequeño más lejos)
          const tLarge = (size - minSize) / (maxSize - minSize); // 0 pequeño, 1 grande
          const minDist = 220; // distancia para los más grandes (cerca)
          const maxDist = 900; // distancia para los más pequeños (lejos)
          const baseDist = minDist + (1 - tLarge) * (maxDist - minDist); // inversamente proporcional
          const dist = baseDist * rand(0.9, 1.15);
          let dx = Math.cos(angle) * dist;
          let dy = Math.sin(angle) * dist * 0.38; // algo más de vertical
          const yExtra = rand(-110, 110); // ligera expansión arriba/abajo
          // Asegura que X nunca sea 0 (ni demasiado pequeña)
          if (Math.abs(dx) < 1) {
            dx = side * rand(60, 160);
          }
          // Gentle idle rotation target
          const rotBase = rand(-45, 45); // base más marcada
          (el as any).dataset.dx = String(dx);
          (el as any).dataset.dy = String(dy + yExtra);
          (el as any).dataset.rotBase = String(rotBase);
          (el as any).dataset.tLarge = String(tLarge);
          // initial transform vars and transform definition using CSS variables
          el.style.setProperty('--x', '0px');
          el.style.setProperty('--y', '0px');
          el.style.setProperty('--scale', '0');
          el.style.setProperty('--rot', '0deg');
          el.style.transform = 'translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(var(--scale, 0)) rotate(var(--rot, 0deg))';
          splash.appendChild(el);
          squares.push(el);
        }

        // Animate splash outward from behind the card
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
            // Gentle idle rotation after splash
            animate(squares, {
              '--rot': (el: any) => {
                const base = parseFloat((el?.dataset?.rotBase || '0'));
                const delta = rand(18, 26); // rotación más notoria
              return [`${base - delta}deg`, `${base + delta}deg`];
            },
              duration: () => rand(4500, 7000),
              direction: 'alternate',
              loop: true,
              ease: 'inOutSine',
              delay: (_el: any, i: number) => i * 60
            });
          }
        });
      });
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
