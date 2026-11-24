import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Aprendizaje } from '../aprendizaje';
import { sesionActiva } from '../api';

@Component({
  imports: [RouterLink],
  template: `<section class="wrap cursos-page">
    @if (curso(); as actual) {
      <a routerLink="/cursos">← Todos los cursos</a>
      <h1>{{ actual.name }}</h1>
      <img
        class="portada-curso"
        [src]="actual.image"
        [alt]="actual.imageAlt"
        width="768"
        height="512"
      />
      <p>
        Lee cada lección y realiza la práctica en tu programa de modelado 3D. Puedes marcar tu
        avance y retomarlo en otra sesión.
      </p>
      @if (!sesion()) {
        <p class="hint">Para guardar el progreso, <a routerLink="/login">inicia sesión</a>.</p>
      }
      @for (leccion of actual.lecciones; track leccion.id) {
        <article class="panel leccion">
          <h2>{{ leccion.titulo }}</h2>
          <p>{{ leccion.texto }}</p>
          <p><strong>Práctica.</strong> {{ leccion.practica }}</p>
          @if (sesion()) {
            <button
              type="button"
              [disabled]="estado.ocupado() || estado.cargando() || !!estado.error()"
              [attr.aria-pressed]="estado.completadas().includes(leccion.id)"
              (click)="completar(leccion.id)"
            >
              {{
                estado.completadas().includes(leccion.id)
                  ? 'Completada · Marcar pendiente'
                  : 'Marcar como completada'
              }}
            </button>
          }
        </article>
      }
    } @else if (id()) {
      <h1>Curso no encontrado</h1>
      <p>Revisa la dirección o vuelve a la lista.</p>
      <a routerLink="/cursos">Ver cursos</a>
    } @else {
      <h1>Cursos</h1>
      <p>Ejercicios breves para practicar modelado, materiales e iluminación.</p>
      <label for="categoria-curso">Categoría</label>
      <select
        id="categoria-curso"
        [value]="categoria()"
        (change)="categoria.set($any($event.target).value)"
      >
        <option>Todas</option>
        <option>Modelado</option>
        <option>Texturizado</option>
        <option>Render</option>
      </select>
      <p class="hint">La selección inicial utiliza la categoría preferida de tu perfil.</p>
      <p role="status">{{ visibles().length }} cursos disponibles.</p>
      <div class="course-grid">
        @for (curso of visibles(); track curso.id; let primero = $first) {
          <article class="panel curso-resumen">
            <img
              [src]="curso.image.replace('.webp', '-384.webp')"
              [alt]="curso.imageAlt"
              width="384"
              height="256"
              [attr.loading]="primero ? 'eager' : 'lazy'"
              [attr.fetchpriority]="primero ? 'high' : 'auto'"
            />
            <p class="hint">{{ curso.category }}</p>
            <h2>{{ curso.name }}</h2>
            <p>{{ curso.progress }} % completado · 3 lecciones</p>
            <a [routerLink]="['/cursos', curso.id]">Abrir curso</a>
          </article>
        }
      </div>
    }
    @if (estado.cargando()) {
      <p role="status">Recuperando tu progreso…</p>
    }
    @if (estado.error()) {
      <p role="alert">{{ estado.error() }}</p>
      <button type="button" (click)="estado.cargar()">Reintentar</button>
    }
    <p role="status" aria-live="polite">{{ mensaje() }}</p>
  </section>`,
  styles: `
    h1 {
      margin-top: 20px;
    }
    .cursos-page {
      max-width: 1100px;
    }
    .portada-curso {
      width: 100%;
      max-height: 320px;
      object-fit: cover;
      border-radius: var(--radius-card);
    }
    .leccion {
      margin-top: 20px;
    }
    .curso-resumen img {
      width: 100%;
      height: auto;
      border-radius: 16px;
    }
    select {
      font: inherit;
      padding: 12px;
      background: var(--panel);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 12px;
    }
    [aria-pressed='true'] {
      border-color: var(--purple);
      color: var(--purple);
    }
  `,
})
export class Cursos {
  readonly estado = inject(Aprendizaje);
  readonly sesion = sesionActiva;
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap);
  readonly id = computed(() => this.parametros()?.get('id'));
  readonly curso = computed(() => this.estado.cursos().find((c) => c.id === this.id()));
  readonly categoria = signal('Todas');
  readonly visibles = computed(() =>
    this.estado
      .cursos()
      .filter((c) => this.categoria() === 'Todas' || c.category === this.categoria()),
  );
  readonly mensaje = signal('');

  constructor() {
    effect(() => {
      if (this.sesion()) void this.estado.cargar();
    });
    effect(() => this.categoria.set(this.estado.categoria()));
  }

  async completar(id: string) {
    const completada = !this.estado.completadas().includes(id);
    if (await this.estado.guardar('/aprendizaje/' + id, { completada })) {
      this.mensaje.set(
        completada
          ? 'Lección completada. Tu progreso se ha guardado.'
          : 'Lección marcada como pendiente.',
      );
    }
  }
}
