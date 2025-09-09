import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
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
