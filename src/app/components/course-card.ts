import { Component, input, output } from '@angular/core';
import { Icon } from './icon';
export interface Course {
  name: string;
  category: string;
  progress: number;
  image: string;
  imageAlt: string;
}
@Component({
  selector: 'pf-course-card',
  standalone: true,
  imports: [Icon],
  template: `<article class="panel course-card">
    <div class="course-art">
      <img
        [src]="course().image"
        [alt]="course().imageAlt"
        width="1536"
        height="1024"
        loading="lazy"
        decoding="async"
      />
      <span class="course-tag">{{ course().category }}</span>
    </div>
    <div class="course-body">
      <p class="eyebrow">Tu próximo paso</p>
      <h3>{{ course().name }}</h3>
      <div class="progress-label">
        <span>Progreso del curso</span><strong>{{ course().progress }}%</strong>
      </div>
      <progress
        max="100"
        [value]="course().progress"
        [attr.aria-label]="'Progreso en ' + course().name"
      ></progress>
      <button
        class="course-action"
        type="button"
        (click)="select.emit()"
        [attr.aria-label]="'Continuar: ' + course().name"
      >
        Continuar aprendiendo <pf-icon name="arrow" />
      </button>
    </div>
  </article>`,
})
export class CourseCard {
  course = input.required<Course>();
  select = output<void>();
}
