import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `<section class="wrap login">
    <h1>Login</h1>
    <p>Accede con tu correo y un código de verificación.</p>
    <div class="panel">
      <p class="hint">
        El envío de email está simulado en este boceto. No se crea una sesión real.
      </p>
      <form [formGroup]="emailForm" (ngSubmit)="requestCode()" novalidate>
        <label for="email">Correo electrónico *</label
        ><input
          id="email"
          type="email"
          autocomplete="email"
          formControlName="email"
          placeholder="nombre&#64;ejemplo.com"
          [attr.aria-invalid]="emailForm.controls.email.invalid && emailForm.controls.email.touched"
          aria-describedby="email-error"
        />
        @if (emailForm.controls.email.invalid && emailForm.controls.email.touched) {
          <p id="email-error" class="error">Introduce un correo válido.</p>
        }
        <button class="primary" type="submit">
          {{ requested() ? 'Reenviar código' : 'Solicitar código' }}
        </button>
      </form>
      @if (requested()) {
        <form class="code-form" [formGroup]="codeForm" (ngSubmit)="verifyCode()" novalidate>
          <label for="code">Código de verificación *</label
          ><input
            id="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            formControlName="code"
            placeholder="6 dígitos"
            [attr.aria-invalid]="codeError()"
            aria-describedby="code-hint code-error"
          />
          <p id="code-hint" class="hint">
            Código de prueba: 371942. No se ha enviado ningún correo.
          </p>
          @if (codeError()) {
            <p id="code-error" class="error">El código no es válido. Comprueba los seis dígitos.</p>
          }
          <button type="submit" class="primary">Verificar código</button>
        </form>
      }
      <p role="status">{{ message() }}</p>
      @if (verified()) {
        <a routerLink="/inicio">Volver a Inicio</a>
      }
    </div>
  </section>`,
})
export class Login {
  private fb = inject(FormBuilder);
  emailForm = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });
  requested = signal(false);
  verified = signal(false);
  codeError = signal(false);
  message = signal('');
  constructor() {
    this.emailForm.controls.email.valueChanges.subscribe(() => {
      this.requested.set(false);
      this.verified.set(false);
      this.codeError.set(false);
      this.codeForm.reset();
      this.message.set('');
    });
  }
  requestCode() {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) {
      this.message.set('Revisa el correo antes de continuar.');
      return;
    }
    this.requested.set(true);
    this.verified.set(false);
    this.codeError.set(false);
    this.codeForm.reset();
    this.message.set('Código de prueba preparado.');
    setTimeout(() => document.getElementById('code')?.focus());
  }
  verifyCode() {
    if (
      !this.requested() ||
      this.codeForm.invalid ||
      this.codeForm.controls.code.value !== '371942'
    ) {
      this.verified.set(false);
      this.codeError.set(true);
      this.message.set('Revisa el código.');
      return;
    }
    this.codeError.set(false);
    this.verified.set(true);
    this.message.set('Verificación de prueba completada.');
  }
}
