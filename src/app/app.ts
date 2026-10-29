import { Component, signal, HostListener } from '@angular/core';
import { Icon } from './components/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  menuOpen = signal(false);
  light = signal(false);
  closeMenu(restoreFocus = false) {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) document.getElementById('navigation-toggle')?.focus();
  }
  navigateFromMenu() {
    if (!this.menuOpen()) return;
    this.closeMenu();
    setTimeout(() => document.getElementById('contenido')?.focus({ preventScroll: true }));
  }
  @HostListener('document:click', ['$event']) outsideMenu(event: MouseEvent) {
    if (!(event.target as Element).closest('.site-header')) this.closeMenu();
  }
  @HostListener('window:resize') resizeMenu() {
    if (window.innerWidth > 640) this.closeMenu();
  }
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
