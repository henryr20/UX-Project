import { Component, computed, effect, inject } from '@angular/core';
import { temaClaro } from '../theme';
import { CourseCard } from '../components/course-card';
import { Router } from '@angular/router';
import { Aprendizaje } from '../aprendizaje';
import { sesionActiva } from '../api';
@Component({
  standalone: true,
  imports: [CourseCard],
  template: `<section class="wrap">
    <div class="home-heading">
      <h1>Inicio</h1>
      <p>Aprende modelado 3D a tu ritmo.</p>
      <p class="hint">{{ sesion() ? 'Tu avance se guarda en tu cuenta.' : 'Explora los cursos y practica a tu ritmo.' }}</p>
    </div>
    <div class="intro">
      <section class="panel progress-card" aria-labelledby="progress-title">
        <div class="progress-heading">
          <h2 id="progress-title">Tu progreso</h2>
          <span class="progress-badge">Aprendizaje 3D</span>
        </div>
        <div class="progress-overview">
          <div
            class="radial"
            role="progressbar"
            aria-label="Progreso general"
            [attr.aria-valuenow]="estado.progreso()" [style.background]="radial()"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="radial-value">
              <strong>{{ estado.progreso() }}<span>%</span></strong>
            </div>
          </div>
          <div class="progress-copy">
            <p class="progress-kicker">Paso a paso</p>
            <h3>Tus ideas van tomando forma</h3>
            <p>Cada lección cuenta. Continúa donde lo dejaste.</p>
          </div>
        </div>
        <div class="progress-stats">
          <div><strong>3</strong><span>Cursos</span></div>
          <div><strong>{{ estado.completadas().length }}</strong><span>Lecciones completadas</span></div>
          <div><strong>{{ terminados() }}</strong><span>Cursos completados</span></div>
        </div>
      </section>
      <div class="hero-visual">
        <img
          class="cover"
          [src]="temaClaro() ? 'images/portada-geometria.webp' : 'images/portada-geometria-oscura.webp'"
          [attr.srcset]="temaClaro()
            ? 'images/portada-geometria-640.webp 640w, images/portada-geometria.webp 1280w'
            : 'images/portada-geometria-oscura-640.webp 640w, images/portada-geometria-oscura.webp 1280w'"
          sizes="(max-width: 800px) 90vw, (max-width: 1333px) 46vw, 610px"
          width="1280"
          height="853"
          alt="Cubo, esfera y cilindro con materiales de distintos colores"
          fetchpriority="high"
        />
      </div>
    </div>
    <h2 class="section-title">Continuar aprendiendo</h2>
    <div class="course-grid">
      @for (course of estado.cursos(); track course.name) {
        <pf-course-card
          [course]="course"
          (select)="abrirCurso(course.id)"
        />
      }
    </div>
    @if (estado.error()) { <p role="alert">{{ estado.error() }}</p><button type="button" (click)="estado.cargar()">Reintentar</button> }
  </section>`,
})
export class Home {
  readonly temaClaro = temaClaro;
  readonly sesion = sesionActiva;
  readonly estado = inject(Aprendizaje);
  private readonly router = inject(Router);
  readonly terminados = computed(() => this.estado.cursos().filter(c => c.progress === 100).length);
  readonly radial = computed(() => `conic-gradient(var(--orange) ${this.estado.progreso()}%, var(--line) 0)`);

  constructor() {
    effect(() => { if (this.sesion()) void this.estado.cargar(); });
  }

  abrirCurso(id: string) {
    void this.router.navigate(['/cursos', id]);
  }
}
