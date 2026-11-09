import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { api, ApiError, sesionActiva } from '../api';

@Component({
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="wrap cuenta">
      <div class="panel">
        <img class="logo-cuenta" src="images/logo.png" alt="" width="56" height="66" />
        <h1>{{ registro ? 'Crear cuenta' : 'Iniciar sesión' }}</h1>
        <form (ngSubmit)="enviar()" #form="ngForm">
          <label for="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autocomplete="email"
            [(ngModel)]="email" required email maxlength="254" />
          <label for="password">Contraseña</label>
          <input id="password" name="password" type="password"
            [autocomplete]="registro ? 'new-password' : 'current-password'"
            [(ngModel)]="password" required minlength="8" maxlength="72" />
          @if (registro) {
            <p class="hint">Usa al menos ocho caracteres.</p>
            <label for="confirmacion">Confirma la contraseña</label>
            <input id="confirmacion" name="confirmacion" type="password" autocomplete="new-password"
              [(ngModel)]="confirmacion" required maxlength="72"
              [attr.aria-invalid]="confirmacion && confirmacion !== password ? 'true' : null"
              [attr.aria-describedby]="confirmacion && confirmacion !== password ? 'confirmacion-error' : null" />
            @if (confirmacion && confirmacion !== password) {
              <p id="confirmacion-error" class="mensaje-error">Las contraseñas no coinciden.</p>
            }
          }
          @if (mensaje()) { <p class="mensaje-error" role="alert">{{ mensaje() }}</p> }
          @if (exito() && !registro) {
            <p class="mensaje-exito" role="status">{{ exito() }}</p>
          }
          <button class="primary" type="submit" [disabled]="form.invalid || enviando() || (registro && confirmacion !== password)">
            {{ registro ? 'Registrarme' : 'Iniciar sesión' }}
          </button>
        </form>
        @if (registro) {
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>.</p>
        } @else {
          <p>¿No tienes cuenta? <a routerLink="/registro">Regístrate</a>.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .cuenta { max-width: 540px; }
    .cuenta .panel { padding: clamp(16px, 5vw, var(--radius-card)); }
    .logo-cuenta { display: block; object-fit: contain; margin: 0 auto 16px; }
    h1 { text-align: center; }
    form { display: grid; gap: 12px; }
    input { width: 100%; background: var(--input); color: var(--text);
      border: 1px solid var(--line); padding: 10px 16px; }
    button { justify-self: start; }
    button:disabled { opacity: .6; cursor: default; }
  `,
})
export class Login {
  private readonly router = inject(Router);
  readonly registro = inject(ActivatedRoute).snapshot.data['registro'] === true;
  readonly enviando = signal(false);
  readonly mensaje = signal('');
  readonly exito = signal('');

  constructor() {
    const estado = inject(Location).getState() as { cuentaCreada?: boolean; cuentaEliminada?: boolean } | null;
    if (estado?.cuentaCreada) this.exito.set('Cuenta creada correctamente. Ya puedes iniciar sesión.');
    if (estado?.cuentaEliminada) this.exito.set('Cuenta eliminada correctamente.');

    for (const aviso of [this.mensaje, this.exito]) {
      effect(onCleanup => {
        if (!aviso()) return;
        const temporizador = setTimeout(() => aviso.set(''), 6000);
        onCleanup(() => clearTimeout(temporizador));
      });
    }
  }
  email = '';
  password = '';
  confirmacion = '';

  async enviar() {
    if (this.enviando() || (this.registro && this.confirmacion !== this.password)) return;
    this.enviando.set(true);
    this.mensaje.set('');
    try {
      await api(this.registro ? '/registro' : '/sesion', 'POST', {
        email: this.email.trim(),
        password: this.password,
      });
      if (this.registro) {
        await this.router.navigateByUrl('/login', { state: { cuentaCreada: true } });
      } else {
        sesionActiva.set(true);
        await this.router.navigateByUrl('/comunidad', { state: { sesionIniciada: true } });
      }
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const mensajes: Record<number, string> = {
        400: 'Revisa el correo y la longitud de la contraseña.',
        401: 'El correo o la contraseña no son correctos.',
        409: 'Ya existe una cuenta con ese correo.',
      };
      this.mensaje.set(mensajes[status] ?? 'No se pudo conectar con el servicio. Inténtalo de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }
}
