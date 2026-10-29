import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="wrap login">
    <p class="hint">Error 404</p>
    <h1>Página no encontrada</h1>
    <div class="panel">
      <p>La dirección no corresponde a ninguna página de PolyForge. Comprueba que esté bien escrita o utiliza los enlaces para continuar.</p>
      <p><a routerLink="/inicio">Volver al inicio</a></p>
      <p><a routerLink="/ayuda">Consultar la ayuda</a></p>
    </div>
  </section>`,
})
export class NotFound {}
