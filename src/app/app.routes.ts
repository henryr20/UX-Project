import { Routes } from '@angular/router';
import { Home } from './pages/home';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio · PolyForge',
    component: Home,
  },
  {
    path: 'login',
    title: 'Login · PolyForge',
    loadComponent: () => import('./pages/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Registro · PolyForge',
    data: { registro: true },
    loadComponent: () => import('./pages/login').then((m) => m.Login),
  },
  {
    path: 'comunidad',
    title: 'Comunidad · PolyForge',
    loadComponent: () => import('./pages/comunidad').then((m) => m.Comunidad),
  },
  {
    path: 'perfil',
    title: 'Mi perfil · PolyForge',
    data: { perfil: true },
    loadComponent: () => import('./pages/comunidad').then((m) => m.Comunidad),
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
