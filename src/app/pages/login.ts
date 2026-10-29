import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../components/icon';
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `<section class="wrap login">
    <div class="login-heading">
      <img src="images/logo.png" width="72" height="84" alt="" />
      <h1>Inicia sesión</h1>
      <p>Accede con tu correo y verifica tu identidad.</p>
    </div>
    <div class="panel login-panel">
      <form [formGroup]="emailForm" (ngSubmit)="requestCode()" novalidate>
        <label for="email">Correo electrónico <span aria-hidden="true">*</span></label>
        <input
          id="email"
          type="email"
          autocomplete="email"
          required
          formControlName="email"
          placeholder="nombre&#64;ejemplo.com"
          [attr.aria-invalid]="emailForm.controls.email.invalid && emailForm.controls.email.touched"
          [attr.aria-describedby]="
            emailForm.controls.email.invalid && emailForm.controls.email.touched
              ? 'email-error'
              : null
          "
        />
        @if (emailForm.controls.email.invalid && emailForm.controls.email.touched) {
          <p id="email-error" class="error">Introduce un correo válido.</p>
        }
        <button class="primary send-code" type="submit">
          {{ requested() ? 'Reenviar código' : 'Enviar código' }} <pf-icon name="arrow" />
        </button>
      </form>
      @if (requested()) {
        <form class="code-form" (submit)="$event.preventDefault(); verifyCode()" novalidate>
          <fieldset class="otp-fieldset">
            <legend>Código de verificación</legend>
            <p id="code-hint" class="hint">Introduce los seis dígitos. Código de prueba: 371942.</p>
            <div class="otp-row">
              @for (digit of digits(); track $index; let i = $index) {
                <input
                  class="otp-digit"
                  [id]="'digit-' + i"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  [attr.autocomplete]="i === 0 ? 'one-time-code' : 'off'"
                  maxlength="6"
                  [value]="digit"
                  [attr.aria-label]="'Dígito ' + (i + 1) + ' de 6'"
                  [attr.aria-invalid]="codeError()"
                  [attr.aria-describedby]="codeError() ? 'code-hint code-error' : 'code-hint'"
                  (input)="enterDigit($event, i)"
                  (paste)="pasteDigits($event, i)"
                  (keydown)="moveDigit($event, i)"
                  (focus)="selectDigit($event)"
                />
              }
            </div>
          </fieldset>
          @if (codeError()) {
            <p id="code-error" class="error">El código no es válido. Comprueba los seis dígitos.</p>
          }
          <div class="code-options">
            <span class="hint">¿Otro correo?</span
            ><button class="text-button" type="button" (click)="changeEmail()">
              Cambiar correo
            </button>
          </div>
          <button
            class="primary verify-button"
            type="submit"
            aria-label="Verificar código"
            title="Verificar código"
          >
            <pf-icon name="arrow" />
          </button>
        </form>
      }
      <p role="status" [class.success]="verified()">{{ message() }}</p>
      @if (verified()) {
        <a routerLink="/inicio">Volver al inicio</a>
      }
      <p class="login-note">
        <pf-icon name="shield" /><span
          >Acceso de prueba. No se envían correos ni se crea una sesión real.</span
        >
      </p>
      <a class="login-help" routerLink="/ayuda">¿Necesitas ayuda?</a>
    </div>
  </section>`,
})
export class Login {
  private fb = inject(FormBuilder);
  emailForm = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  digits = signal<string[]>(Array(6).fill(''));
  requested = signal(false);
  verified = signal(false);
  codeError = signal(false);
  message = signal('');
  constructor() {
    this.emailForm.controls.email.valueChanges.subscribe(() => {
      this.requested.set(false);
      this.resetCode();
      this.message.set('');
    });
  }
  private resetCode() {
    this.digits.set(Array(6).fill(''));
    this.verified.set(false);
    this.codeError.set(false);
  }
  private focusDigit(index: number) {
    document.getElementById('digit-' + Math.max(0, Math.min(index, 5)))?.focus();
  }
  selectDigit(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }
  enterDigit(event: Event, index: number) {
    const field = event.target as HTMLInputElement;
    const value = field.value.replace(/[^0-9]/g, '');
    this.writeDigits(value, index);
    field.value = this.digits()[index];
  }
  private writeDigits(value: string, index: number) {
    const next = [...this.digits()];
    if (!value) next[index] = '';
    else
      value
        .slice(0, 6 - index)
        .split('')
        .forEach((digit, offset) => (next[index + offset] = digit));
    this.digits.set(next);
    this.codeError.set(false);
    this.verified.set(false);
    this.message.set('');
    if (value) this.focusDigit(Math.min(index + value.length, 5));
  }
  pasteDigits(event: ClipboardEvent, index: number) {
    event.preventDefault();
    this.writeDigits((event.clipboardData?.getData('text') || '').replace(/[^0-9]/g, ''), index);
  }
  moveDigit(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.focusDigit(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      event.preventDefault();
      this.digits.update((values) => values.map((v, i) => (i === index - 1 ? '' : v)));
      this.focusDigit(index - 1);
      this.codeError.set(false);
      this.verified.set(false);
    }
  }
  changeEmail() {
    this.requested.set(false);
    this.resetCode();
    this.message.set('');
    document.getElementById('email')?.focus();
  }
  requestCode() {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) {
      this.message.set('Revisa el correo antes de continuar.');
      document.getElementById('email')?.focus();
      return;
    }
    this.requested.set(true);
    this.resetCode();
    this.message.set('Código de prueba preparado.');
    setTimeout(() => this.focusDigit(0));
  }
  verifyCode() {
    if (!this.requested() || this.emailForm.invalid || this.digits().join('') !== '371942') {
      this.verified.set(false);
      this.codeError.set(true);
      this.message.set('Revisa el código.');
      const missing = this.digits().findIndex((digit) => !digit);
      this.focusDigit(missing < 0 ? 0 : missing);
      return;
    }
    this.codeError.set(false);
    this.verified.set(true);
    this.message.set('Verificación de prueba completada.');
  }
}

