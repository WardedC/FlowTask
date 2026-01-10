import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(true);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // Iniciar siempre en modo oscuro
    this.applyTheme(true);
  }

  // Obtener el estado actual del tema
  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  // Cambiar el tema
  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.setTheme(newTheme);
  }

  // Establecer un tema específico
  setTheme(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);
    this.applyTheme(isDark);
  }

  // Aplicar el tema al DOM
  private applyTheme(isDark: boolean): void {
    const html = document.documentElement;
    const body = document.body;

    // Remover clases previas
    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');

    // Aplicar nueva clase
    if (isDark) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.add('light');
      body.classList.add('light');
    }
  }

}
