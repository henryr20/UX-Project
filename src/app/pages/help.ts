import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../components/icon';
@Component({
  standalone: true,
  imports: [RouterLink, Icon],
  template: `<section class="wrap help-page">
    <p class="eyebrow">Estamos para ayudarte</p>
    <h1>Preguntas frecuentes</h1>
    <p class="help-intro">Resuelve tus dudas y sigue dando forma a tus ideas.</p>
    <div class="faq-list">
      <details>
        <summary>¿Por dónde empiezo? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            En <a routerLink="/inicio">Inicio</a> encontrarás cursos de modelado, texturizado e
            iluminación. Elige el que más te interese para dar tu siguiente paso.
          </p>
        </div>
      </details>
      <details>
        <summary>¿Cómo accedo a mi cuenta? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            Ve a <a routerLink="/login">Acceder</a>, introduce tu correo y solicita un código.
            Después, escribe sus seis dígitos y pulsa la flecha para verificarlo.
          </p>
          <p>
            El acceso está disponible en modo de prueba: no se envían correos ni se crea una sesión
            real.
          </p>
        </div>
      </details>
      <details>
        <summary>¿Puedo continuar los cursos? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            Las lecciones todavía no están disponibles. Puedes explorar la selección de cursos; los
            porcentajes de progreso son datos de muestra.
          </p>
        </div>
      </details>
      <details>
        <summary>¿Cómo cambio entre tema claro y oscuro? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            Usa el botón del sol o la luna en la cabecera. Tu preferencia se guarda en este
            navegador cuando el almacenamiento está disponible.
          </p>
        </div>
      </details>
      <details>
        <summary>¿Puedo navegar con el teclado? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            Usa Tab para recorrer los controles y Enter para activar los enlaces o abrir estas
            preguntas. Al comenzar, puedes usar «Saltar al contenido» para ir directamente a la
            página.
          </p>
        </div>
      </details>
      <details>
        <summary>¿Qué hago si pierdo la conexión? <pf-icon name="chevron" /></summary>
        <div class="faq-answer">
          <p>
            Si aparece el aviso de conexión, comprueba tu red y vuelve a intentarlo. Si una
            dirección no existe, la página de error te permite volver al inicio.
          </p>
        </div>
      </details>
    </div>
    <a class="back-home" routerLink="/inicio">Volver al inicio <pf-icon name="arrow" /></a>
  </section>`,
})
export class Help {}
