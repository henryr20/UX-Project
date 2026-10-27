import { Component, input, output } from '@angular/core';
export interface Course {
  name: string;
  category: string;
  progress: number;
}
@Component({
  selector: 'pf-course-card',
  standalone: true,
  template: `<article class="panel">
    <p class="hint">{{ course().category }}</p>
    <h3>{{ course().name }}</h3>
    <div class="progress-label">
      <span>Tu progreso</span><strong>{{ course().progress }}%</strong>
    </div>
    <progress
      max="100"
      [value]="course().progress"
      [attr.aria-label]="'Progreso en ' + course().name"
    ></progress
    ><button (click)="select.emit()" [attr.aria-label]="'Continuar: ' + course().name">
      Continuar
    </button>
  </article>`,
})
export class CourseCard {
  course = input.required<Course>();
  select = output<void>();
}
