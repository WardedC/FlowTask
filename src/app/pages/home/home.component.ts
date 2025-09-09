import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `
  


    <!-- Draggable demo area -->
    <div class="relative mt-8 h-80 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
      <div
        class="draggable-card relative select-none shadow-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-4 w-64"
        [style.transform]="'translate(' + x + 'px,' + y + 'px)'">
        <div class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Tarjeta draggable</div>
        <p class="text-sm text-gray-600 dark:text-gray-300">Arrástrame con el mouse o el dedo.</p>
        <div class="mt-3 text-xs text-gray-400">x: {{ x | number:'1.0-0' }}, y: {{ y | number:'1.0-0' }}</div>

        <!-- Pointer events -->
        <div
          class="absolute inset-0"
          style="cursor: grab;"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="onPointerUp($event)"
          (lostpointercapture)="onPointerUp($event)"></div>
      </div>
    </div>



  `,
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  x = 0;
  y = 0;
  private dragging = false;
  private startX = 0;
  private startY = 0;

  onPointerDown(ev: PointerEvent) {
    const el = ev.currentTarget as HTMLElement;
    // Start dragging and capture pointer
    this.dragging = true;
    try { el.setPointerCapture(ev.pointerId); } catch {}
    // Calculate offset from current translation
    this.startX = ev.clientX - this.x;
    this.startY = ev.clientY - this.y;
    // Visual feedback
    el.style.cursor = 'grabbing';
  }

  onPointerMove(ev: PointerEvent) {
    if (!this.dragging) return;
    this.x = ev.clientX - this.startX;
    this.y = ev.clientY - this.startY;
  }

  onPointerUp(ev: PointerEvent) {
    this.dragging = false;
    const el = ev.currentTarget as HTMLElement;
    el.style.cursor = 'grab';
    try { el.releasePointerCapture(ev.pointerId); } catch {}
  }
}
