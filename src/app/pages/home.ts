import { Component, signal } from '@angular/core';
import { CourseCard, Course } from '../components/course-card';
@Component({
  standalone: true,
  imports: [CourseCard],
  template: `<section class="wrap">
    <div class="intro">
      <div>
        <h1>Inicio</h1>
        <p>Aprende modelado 3D a tu ritmo.</p>
        <p class="hint">Estás como invitado. El progreso es de ejemplo.</p>
        <section class="panel">
          <h2>Tu progreso</h2>
          <div class="progress-row">
            <div
              class="radial"
              role="progressbar"
              aria-label="Progreso general"
              aria-valuenow="35"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <strong>35%</strong>
            </div>
            <div class="stats">
              <div><strong>5</strong><span>Cursos</span></div>
              <div><strong>12</strong><span>Lecciones</span></div>
              <div><strong>2</strong><span>Proyectos</span></div>
            </div>
          </div>
        </section>
      </div>
      <img
        class="cover"
        src="images/portada.png"
        width="1254"
        height="1254"
        alt="Robot naranja con un cubo morado"
        fetchpriority="high"
      />
    </div>
    <h2 class="section-title">Continuar aprendiendo</h2>
    <div class="course-grid">
      @for (course of courses; track course.name) {
        <pf-course-card
          [course]="course"
          (select)="
            message.set('Este curso es de ejemplo. Las lecciones todavía no están disponibles.')
          "
        />
      }
    </div>
    <p class="hint" role="status">{{ message() }}</p>
  </section>`,
})
export class Home {
  message = signal('');
  courses: Course[] = [
    { name: 'Modelado 3D desde cero', category: 'Modelado', progress: 40 },
    { name: 'Primeras texturas', category: 'Texturizado', progress: 20 },
    { name: 'Iluminación básica', category: 'Render', progress: 65 },
  ];
}
