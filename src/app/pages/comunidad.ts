import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { api, ApiError, sesionActiva } from '../api';

interface Post {
  id: number;
  titulo: string;
  descripcion: string;
  likes: number;
  gustado: boolean;
  guardado: boolean;
  propio: boolean;
}

@Component({
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap">
      <header class="intro-comunidad">
        <p class="hint">POLYFORGE</p>
        <h1>{{ perfil ? 'Mi perfil' : 'Comunidad' }}</h1>
        @if (perfil) {
          @if (correo()) {
            <p>{{ correo() }}</p>
            <div class="acciones">
              <button type="button" [disabled]="ocupado()" (click)="cerrarSesion()">Cerrar sesión</button>
              <button type="button" class="mensaje-error" [disabled]="ocupado()"
                (click)="pedirConfirmacion(confirmacion, null)">Eliminar cuenta</button>
            </div>
          }
        } @else {
          <p>Comparte tus proyectos 3D y descubre lo que está creando la comunidad.</p>
        }
      </header>
      @if (mensaje() && !editor.open && !confirmacion.open) { <p class="mensaje-error" role="alert">{{ mensaje() }}</p> }
      @if (exito()) { <p class="mensaje-exito" role="status">{{ exito() }}</p> }

      @if (sinSesion()) {
        <div class="panel">
          <p>Inicia sesión para ver y compartir publicaciones.</p>
          <a routerLink="/login">Iniciar sesión</a>
        </div>
      } @else if (cargando()) {
        <p role="status">Cargando publicaciones…</p>
      } @else if (listaDisponible()) {
        @if (!perfil) {
        <div class="herramientas">
          <input type="search" aria-label="Buscar publicaciones" placeholder="Buscar proyectos, ideas…"
            [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)" />
          <button class="primary" type="button" [disabled]="ocupado()" (click)="abrirEditor(editor)">
            + Nueva publicación
          </button>
        </div>
        <div class="acciones filtros" role="group" aria-label="Filtrar publicaciones">
          <button type="button" [attr.aria-pressed]="!soloGuardados()" (click)="soloGuardados.set(false)">Todas</button>
          <button type="button" [attr.aria-pressed]="soloGuardados()" (click)="soloGuardados.set(true)">Guardadas</button>
        </div>
        }
        <section class="publicaciones" aria-labelledby="publicaciones">
          <h2 id="publicaciones">{{ perfil ? 'Mis publicaciones' : 'Publicaciones' }}</h2>
          @for (post of resultados(); track post.id) {
            <article class="panel">
              <h3>{{ post.titulo }}</h3>
              <p class="descripcion">{{ post.descripcion }}</p>
              <div class="acciones">
                <button type="button" [attr.aria-pressed]="post.gustado" [disabled]="ocupado()"
                  (click)="marcar(post, 'like', !post.gustado)">Me gusta · {{ post.likes }}</button>
                <button type="button" [attr.aria-pressed]="post.guardado" [disabled]="ocupado()"
                  (click)="marcar(post, 'guardado', !post.guardado)">
                  {{ post.guardado ? 'Guardado' : 'Guardar' }}
                </button>
                @if (post.propio) {
                  <button type="button" class="mensaje-error" [disabled]="ocupado()"
                    (click)="pedirConfirmacion(confirmacion, post)">Eliminar</button>
                }
              </div>
            </article>
          } @empty {
            <p>{{ busqueda().trim() ? 'No hay publicaciones que coincidan.' : soloGuardados() ? 'Todavía no tienes publicaciones guardadas.' : perfil ? 'Todavía no has publicado nada.' : 'Todavía no hay publicaciones.' }}</p>
          }
        </section>
      }
      <dialog #editor aria-labelledby="editor-titulo" (cancel)="cerrarEditor($event)">
        <div class="cabecera-editor">
          <h2 id="editor-titulo">Nueva publicación</h2>
          <button type="button" aria-label="Cerrar" [disabled]="ocupado()" (click)="editor.close()">×</button>
        </div>
        <form (ngSubmit)="publicar(editor, form)" #form="ngForm">
          <label for="titulo">Título</label>
          <input id="titulo" name="titulo" [(ngModel)]="titulo" required maxlength="120" aria-describedby="titulo-ayuda" autofocus />
          <small id="titulo-ayuda" class="hint">{{ titulo.length }} de 120 caracteres</small>
          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" [(ngModel)]="descripcion"
            required maxlength="4000" rows="4" aria-describedby="descripcion-ayuda"></textarea>
          <small id="descripcion-ayuda" class="hint">{{ descripcion.length }} de 4000 caracteres</small>
          @if (ocupado() && editor.open) { <p role="status">Guardando publicación…</p> }
          @if (mensaje()) { <p class="mensaje-error" role="alert">{{ mensaje() }}</p> }
          <div class="acciones acciones-editor">
            <button type="button" [disabled]="ocupado()" (click)="editor.close()">Cancelar</button>
            <button class="primary" type="submit" [disabled]="form.invalid || ocupado()">
              {{ ocupado() ? 'Publicando…' : 'Publicar' }}
            </button>
          </div>
        </form>
      </dialog>
      <dialog #confirmacion class="confirmacion" aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-texto" (cancel)="cerrarEditor($event)">
        <h2 id="confirmacion-titulo">{{ postPendiente() ? 'Eliminar publicación' : 'Eliminar cuenta' }}</h2>
        <p id="confirmacion-texto">
          @if (postPendiente(); as post) {
            ¿Seguro que quieres eliminar «{{ post.titulo }}»? Esta acción no se puede deshacer.
          } @else {
            ¿Seguro que quieres eliminar tu cuenta? También se borrarán tus publicaciones y tus datos asociados.
          }
        </p>
        @if (mensaje()) { <p class="mensaje-error" role="alert">{{ mensaje() }}</p> }
        <div class="acciones acciones-editor">
          <button type="button" autofocus [disabled]="ocupado()" (click)="confirmacion.close()">Cancelar</button>
          <button type="button" class="boton-peligro" [disabled]="ocupado()" (click)="confirmarEliminacion(confirmacion)">
            {{ ocupado() ? 'Eliminando…' : postPendiente() ? 'Eliminar publicación' : 'Eliminar cuenta' }}
          </button>
        </div>
      </dialog>
    </section>
  `,
  styles: `
    .wrap { max-width: 900px; }
    .intro-comunidad { border-bottom: 1px solid var(--line); margin-bottom: 24px; padding-bottom: 12px; }
    .intro-comunidad .hint { color: var(--purple); letter-spacing: .14em; font-weight: 700; }
    .panel { border-radius: var(--radius-card); }
    form, .publicaciones { display: grid; gap: 12px; }
    .publicaciones { margin-top: 28px; }
    input, textarea { width: 100%; padding: 10px 16px; font: inherit; color: var(--text);
      background: var(--input); border: 1px solid var(--line); }

    .herramientas { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
    .herramientas input { flex: 1 1 240px; }
    .herramientas input, .herramientas button { height: calc(var(--radius-card) * 2); }
    .filtros { margin-top: 12px; }
    dialog {
      width: min(520px, calc(100% - 32px)); padding: 24px;
      background: var(--panel); color: var(--text); border: 1px solid var(--line);
      border-radius: var(--radius-campo-amplio);
    }
    dialog::backdrop { background: rgb(0 0 0 / 65%); }
    .confirmacion {
      background: color-mix(in srgb, var(--panel) 86%, transparent);
      border-color: color-mix(in srgb, var(--purple) 32%, var(--line));
      backdrop-filter: blur(24px) saturate(150%);
      box-shadow: 0 18px 56px #0005, inset 0 1px 0 #ffffff28;
    }
    .confirmacion::backdrop { background: rgb(0 0 0 / 42%); backdrop-filter: blur(6px); }
    .confirmacion p { overflow-wrap: anywhere; }
    .boton-peligro { background: #a5243a; border-color: #a5243a; color: white; }
    .cabecera-editor { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
    .cabecera-editor h2 { margin: 0; }
    .acciones-editor { justify-content: flex-end; }
    textarea { resize: vertical; }
    form button { justify-self: start; }
    .acciones { display: flex; flex-wrap: wrap; gap: 8px; }
    [aria-pressed="true"] { border-color: var(--purple); color: var(--purple); }
    .descripcion { white-space: pre-wrap; overflow-wrap: anywhere; }
  `,
})
export class Comunidad implements OnInit {
  private readonly router = inject(Router);
  readonly perfil = inject(ActivatedRoute).snapshot.data['perfil'] === true;
  readonly correo = signal('');
  readonly posts = signal<Post[]>([]);
  readonly busqueda = signal('');
  readonly soloGuardados = signal(false);
  readonly resultados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.posts().filter(post =>
      (!this.perfil || post.propio) && (!this.soloGuardados() || post.guardado) &&
      (post.titulo + ' ' + post.descripcion).toLowerCase().includes(texto),
    );
  });
  readonly cargando = signal(true);
  readonly listaDisponible = signal(false);
  readonly sinSesion = signal(false);
  readonly ocupado = signal(false);
  readonly mensaje = signal('');
  readonly postPendiente = signal<Post | null>(null);
  readonly exito = signal(
    (inject(Location).getState() as { sesionIniciada?: boolean } | null)?.sesionIniciada
      ? 'Sesión iniciada correctamente.'
      : '',
  );
  titulo = '';
  descripcion = '';

  constructor() {
    for (const aviso of [this.mensaje, this.exito]) {
      effect(onCleanup => {
        if (!aviso()) return;
        const temporizador = setTimeout(() => aviso.set(''), 6000);
        onCleanup(() => clearTimeout(temporizador));
      });
    }
  }

  async ngOnInit() {
    try {
      if (this.perfil) {
        const usuario = await api<{ email: string }>('/usuarios/me');
        this.correo.set(usuario.email);
      }
      this.posts.set(await api<Post[]>('/posts'));
      this.listaDisponible.set(true);
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirEditor(editor: HTMLDialogElement) {
    this.mensaje.set('');
    editor.showModal();
  }

  cerrarEditor(event: Event) {
    if (this.ocupado()) event.preventDefault();
  }

  async publicar(editor: HTMLDialogElement, form: NgForm) {
    const titulo = this.titulo.trim();
    const descripcion = this.descripcion.trim();
    if (!titulo || !descripcion) {
      this.exito.set('');
      this.mensaje.set('Completa el título y la descripción.');
      return;
    }
    await this.actualizar(async () => {
      const post = await api<Post>('/posts', 'POST', { titulo, descripcion });
      this.posts.update(posts => [post, ...posts]);
      form.resetForm({ titulo: '', descripcion: '' });
      this.busqueda.set('');
      this.soloGuardados.set(false);
      editor.close();
      this.exito.set('Publicación creada correctamente.');
    });
  }

  async marcar(post: Post, accion: 'like' | 'guardado', activo: boolean) {
    await this.actualizar(async () => {
      const actualizado = await api<Post>(`/posts/${post.id}/${accion}`, 'PUT', { activo });
      this.posts.update(posts => posts.map(item => item.id === post.id ? actualizado : item));
      if (accion === 'guardado') {
        this.exito.set(actualizado.guardado ? 'Publicación guardada.' : 'Publicación quitada de guardadas.');
      } else {
        this.exito.set(actualizado.gustado ? 'Me gusta añadido.' : 'Me gusta quitado.');
      }
    });
  }

  pedirConfirmacion(ventana: HTMLDialogElement, post: Post | null) {
    this.mensaje.set('');
    this.postPendiente.set(post);
    ventana.showModal();
  }

  async confirmarEliminacion(ventana: HTMLDialogElement) {
    const post = this.postPendiente();
    await this.actualizar(async () => {
      if (post) {
        await api(`/posts/${post.id}`, 'DELETE');
        this.posts.update(posts => posts.filter(item => item.id !== post.id));
        ventana.close();
        this.exito.set('Publicación eliminada.');
      } else {
        await api('/usuarios/me', 'DELETE');
        sesionActiva.set(false);
        ventana.close();
        await this.router.navigateByUrl('/login', { state: { cuentaEliminada: true } });
      }
    });
  }

  async cerrarSesion() {
    await this.actualizar(async () => {
      await api('/sesion', 'DELETE');
      sesionActiva.set(false);
      await this.router.navigateByUrl('/login');
    });
  }

  private async actualizar(accion: () => Promise<void>) {
    if (this.ocupado()) return;
    this.ocupado.set(true);
    this.mensaje.set('');
    this.exito.set('');
    try {
      await accion();
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.ocupado.set(false);
    }
  }

  private mostrarError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      sesionActiva.set(false);
      this.correo.set('');
      this.sinSesion.set(true);
      return;
    }
    this.mensaje.set('No se pudo completar la operación. Inténtalo de nuevo.');
  }
}
