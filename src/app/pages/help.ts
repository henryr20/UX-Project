import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

const paginas: Record<string, string> = {
  'primeros-pasos': 'primerospasos.html',
  cuenta: 'cuenta.html',
  cursos: 'cursos.html',
  comunidad: 'comunidad.html',
  perfil: 'perfil.html',
  conexion: 'conexion.html',
};

@Component({
  template: `<section class="wrap ayuda-integrada">
    <h1>Ayuda</h1>
    <p>Consulta los temas, el índice de palabras o el buscador del manual.</p>
    <p><a [href]="enlace()">Abrir ayuda en página completa</a></p>
    <iframe
      [src]="recurso()"
      title="Manual de ayuda de PolyForge con contenido, índice y búsqueda"
    ></iframe>
  </section>`,
  styles: `
    .ayuda-integrada {
      max-width: 1400px;
    }
    iframe {
      display: block;
      width: 100%;
      height: 78vh;
      min-height: 500px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--panel);
    }
    @media (max-width: 640px) {
      .ayuda-integrada {
        padding-inline: 4%;
      }
      iframe {
        height: 80vh;
      }
    }
  `,
})
export class Help {
  private readonly parametros = toSignal(inject(ActivatedRoute).paramMap);
  private readonly sanitizer = inject(DomSanitizer);
  readonly enlace = computed(
    () => '/ayuda-web/' + (paginas[this.parametros()?.get('tema') ?? ''] ?? 'index.html'),
  );
  readonly recurso = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.enlace()));
}
