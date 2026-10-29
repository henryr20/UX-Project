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
  {
    path: 'ayuda',
    title: 'Ayuda · PolyForge',
    loadComponent: () => import('./pages/help').then((m) => m.Help),
  },
  {
    path: '**',
    title: 'Página no encontrada · PolyForge',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
