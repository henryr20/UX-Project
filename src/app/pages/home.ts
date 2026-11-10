import { Component, signal } from '@angular/core';
import { temaClaro } from '../theme';
import { CourseCard, Course } from '../components/course-card';
@Component({
  standalone: true,
  imports: [CourseCard],
  template: `<section class="wrap">
    <div class="home-heading">
      <h1>Inicio</h1>
      <p>Aprende modelado 3D a tu ritmo.</p>
      <p class="hint">Estás explorando como invitado. El progreso mostrado es de muestra.</p>
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
            aria-valuenow="35"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="radial-value">
              <strong>35<span>%</span></strong>
            </div>
          </div>
          <div class="progress-copy">
            <p class="progress-kicker">Paso a paso</p>
            <h3>Tus ideas van tomando forma</h3>
            <p>Cada lección cuenta. Continúa donde lo dejaste.</p>
          </div>
        </div>
        <div class="progress-stats">
          <div><strong>5</strong><span>Cursos</span></div>
          <div><strong>12</strong><span>Lecciones</span></div>
          <div><strong>2</strong><span>Proyectos</span></div>
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
      @for (course of courses; track course.name) {
        <pf-course-card
          [course]="course"
          (select)="message.set('Las lecciones de este curso estarán disponibles próximamente.')"
        />
      }
    </div>
    <p class="hint" role="status">{{ message() }}</p>
  </section>`,
})
export class Home {
  readonly temaClaro = temaClaro;
  message = signal('');
  courses: Course[] = [
    {
      name: 'Modelado 3D desde cero',
      category: 'Modelado',
      progress: 40,
      image: 'images/curso-modelado.webp',
      imageAlt: 'Lámpara de escritorio con una parte del modelo mostrando su malla poligonal',
    },
    {
      name: 'Primeras texturas',
      category: 'Texturizado',
      progress: 20,
      image: 'images/curso-texturas.webp',
      imageAlt: 'Estudio de materiales con una taza de cerámica y muestras de superficies',
    },
    {
      name: 'Iluminación básica',
      category: 'Render',
      progress: 65,
      image: 'images/curso-iluminacion.webp',
      imageAlt: 'Escena arquitectónica con un arco y una silla iluminados lateralmente',
    },
  ];
}
