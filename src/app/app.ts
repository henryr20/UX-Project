import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  light = signal(false);
  online = signal(navigator.onLine);
  constructor() {
    try {
      this.light.set(localStorage.getItem('polyforge-theme') === 'light');
    } catch {}
    document.documentElement.dataset['theme'] = this.light() ? 'light' : 'dark';
  }
  toggleTheme() {
    this.light.update((value) => !value);
    const theme = this.light() ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem('polyforge-theme', theme);
    } catch {}
  }
  @HostListener('window:online') connected() {
    this.online.set(true);
  }
  @HostListener('window:offline') disconnected() {
    this.online.set(false);
  }
}
