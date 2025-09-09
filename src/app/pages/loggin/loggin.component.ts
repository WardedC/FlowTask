import { ChangeDetectionStrategy, Component, ElementRef, AfterViewInit } from '@angular/core';
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

  constructor(private fb: FormBuilder, private host: ElementRef<HTMLElement>) {
    this.form = this.fb.nonNullable.group({
      email: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.email] }),
      password: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(6)] }),
      remember: this.fb.nonNullable.control(true)
    });
  }

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;

    // Float background shapes + staged entrance
    const tl = createTimeline({ autoplay: true });
    tl.add(root.querySelectorAll('.bg-shape'), {
      opacity: [0, 1],
      translateY: [-16, 0],
      scale: [0.9, 1],
      duration: 900,
      delay: stagger(120),
      ease: 'outQuad'
    });
    tl.add(root.querySelector('.login-card') as Element, {
      // Card entrance
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      ease: 'outCubic'
    }, '-=350');
    tl.add(root.querySelectorAll('.form-item'), {
      // Stagger form items
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 400,
      delay: stagger(90),
      ease: 'outCubic'
    }, '-=250');

    // Gentle idle motion for shapes (start after timeline to avoid conflicts)
    const idleDelay = 1500; // ~timeline total
    animate(root.querySelectorAll('.bg-shape.s1'), {
      translateY: [0, 14],
      duration: 3200,
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      delay: idleDelay,
      composition: 'blend'
    });
    animate(root.querySelectorAll('.bg-shape.s2'), {
      translateY: [0, -16],
      translateX: [0, 6],
      duration: 3600,
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      delay: idleDelay,
      composition: 'blend'
    });
    animate(root.querySelectorAll('.bg-shape.s3'), {
      translateY: [0, 10],
      translateX: [0, -8],
      duration: 3400,
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      delay: idleDelay,
      composition: 'blend'
    });
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
