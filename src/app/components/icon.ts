import { Component, input } from '@angular/core';
@Component({
  selector: 'pf-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    [attr.fill]="filled() ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="paths[name()] || paths['arrow']" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  name = input('arrow');
  filled = input(false);
  paths: Record<string, string> = {
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'm6 6 12 12M6 18 18 6',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
    moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    play: 'm9 5 11 7-11 7Z',
    cube: 'm12 3 9 5v8l-9 5-9-5V8Zm0 10 9-5M12 13 3 8m9 5v8',
    layers: 'm12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5',
    light: 'M9 18h6m-5 3h4M8 13a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z',
    chevron: 'm6 9 6 6 6-6',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z',
    bookmark: 'M6 4h12v16l-6-4-6 4Z',
    edit: 'm15 5 4 4M4 20l1-5L16 4a2.8 2.8 0 0 1 4 4L9 19Z',
    trash: 'M3 6h18M8 6V4h8v2M5 6l1 14h12l1-14M10 10v6m4-6v6',
    shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-5',
  };
}
