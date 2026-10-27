import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio · PolyForge',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Login · PolyForge',
    loadComponent: () => import('./pages/login').then((m) => m.Login),
  },
  { path: '**', redirectTo: 'inicio' },
];
