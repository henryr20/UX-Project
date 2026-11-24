import { Injectable, computed, effect, signal } from '@angular/core';
import { api, sesionActiva } from './api';

export interface Leccion {
  id: string;
  titulo: string;
  texto: string;
  practica: string;
}
export interface Curso {
  id: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  lecciones: Leccion[];
}
export const cursos: Curso[] = [
  {
    id: 'modelado',
    name: 'Modelado 3D desde cero',
    category: 'Modelado',
    image: 'images/curso-modelado.webp',
    imageAlt: 'Lámpara de escritorio y su malla poligonal',
    lecciones: [
      {
        id: 'modelado-1',
        titulo: 'Formas y proporciones',
        texto:
          'Empieza con formas básicas. Un cilindro puede representar el pie de una lámpara y una esfera su articulación. Ajusta primero la silueta desde varias vistas antes de añadir detalles.',
        practica:
          'En tu programa 3D, crea una lámpara con tres formas básicas. Comprueba su silueta desde delante y de lado.',
      },
      {
        id: 'modelado-2',
        titulo: 'Organizar la malla',
        texto:
          'Los vértices forman aristas y caras. Mantén una distribución de caras regular en las zonas que necesiten una superficie suave. Revisa los cambios de forma con una vista de alambre.',
        practica:
          'Activa la vista de alambre y localiza una zona con demasiadas caras. Simplifícala conservando la silueta.',
      },
      {
        id: 'modelado-3',
        titulo: 'Revisar el modelo',
        texto:
          'Comprueba la escala, la orientación de las caras y los nombres de los objetos. Una escena organizada facilita cambiar materiales y preparar la iluminación.',
        practica:
          'Nombra las piezas, revisa las normales y guarda una versión del modelo antes de aplicar materiales.',
      },
    ],
  },
  {
    id: 'texturas',
    name: 'Primeras texturas',
    category: 'Texturizado',
    image: 'images/curso-texturas.webp',
    imageAlt: 'Taza y muestras de materiales',
    lecciones: [
      {
        id: 'texturas-1',
        titulo: 'Color y material',
        texto:
          'El color base define el aspecto del material antes de sus reflejos. Empieza con pocos materiales y distingue las piezas mediante valores de color coherentes.',
        practica:
          'Asigna materiales diferentes a dos piezas y comprueba que se distinguen con una iluminación neutra.',
      },
      {
        id: 'texturas-2',
        titulo: 'Rugosidad y reflejos',
        texto:
          'La rugosidad modifica la nitidez del reflejo. Una superficie rugosa produce reflejos más difusos. Compara cambios pequeños manteniendo fija la luz.',
        practica:
          'Duplica un objeto y compara tres valores de rugosidad con el mismo material y la misma luz.',
      },
      {
        id: 'texturas-3',
        titulo: 'Preparar las coordenadas UV',
        texto:
          'Las coordenadas UV relacionan la superficie del modelo con una imagen plana. Las zonas estiradas pueden deformar la textura. Un patrón cuadriculado permite reconocerlas.',
        practica:
          'Aplica un patrón cuadriculado y revisa si los cuadrados conservan un tamaño parecido sobre la superficie.',
      },
    ],
  },
  {
    id: 'iluminacion',
    name: 'Iluminación básica',
    category: 'Render',
    image: 'images/curso-iluminacion.webp',
    imageAlt: 'Habitación con luz lateral',
    lecciones: [
      {
        id: 'iluminacion-1',
        titulo: 'Luz principal',
        texto:
          'La posición de la luz principal determina qué formas se leen mejor. Una luz lateral permite observar cambios de volumen y las sombras que produce el objeto.',
        practica:
          'Coloca una sola luz a un lado del modelo. Cambia su altura y compara cómo se reconoce el volumen.',
      },
      {
        id: 'iluminacion-2',
        titulo: 'Sombras y separación',
        texto:
          'El tamaño de la fuente de luz influye en la suavidad de las sombras. Revisa también el contraste entre el objeto y el fondo para que la silueta sea visible.',
        practica:
          'Aumenta el tamaño de la luz y compara el borde de la sombra. Ajusta el fondo para separar la silueta.',
      },
      {
        id: 'iluminacion-3',
        titulo: 'Preparar una prueba de render',
        texto:
          'Realiza primero una imagen de prueba con resolución moderada. Corrige encuadre y luces antes de aumentar la resolución final para evitar cálculos que acabarías descartando.',
        practica:
          'Genera un render de prueba, identifica una mejora concreta y aplícala antes de guardar el resultado final.',
      },
    ],
  },
];

interface EstadoAprendizaje {
  completadas: string[];
  categoria: string;
}

@Injectable({ providedIn: 'root' })
export class Aprendizaje {
  readonly completadas = signal<string[]>([]);
  readonly categoria = signal('Todas');
  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly error = signal('');
  readonly cursos = computed(() =>
    cursos.map((curso) => ({
      ...curso,
      progress: Math.round(
        (curso.lecciones.filter((l) => this.completadas().includes(l.id)).length /
          curso.lecciones.length) *
          100,
      ),
    })),
  );
  readonly progreso = computed(() => Math.round((this.completadas().length / 9) * 100));
  private version = 0;

  constructor() {
    effect(() => {
      if (!sesionActiva()) {
        this.version++;
        this.completadas.set([]);
        this.categoria.set('Todas');
        this.error.set('');
        this.cargando.set(false);
      }
    });
  }

  async cargar() {
    if (!sesionActiva()) return;
    const version = ++this.version;
    this.cargando.set(true);
    this.error.set('');
    try {
      const datos = await api<EstadoAprendizaje>('/aprendizaje');
      if (version === this.version && sesionActiva()) this.aplicar(datos);
    } catch {
      if (version === this.version)
        this.error.set(
          'No se pudo recuperar tu progreso. Comprueba la conexión y vuelve a intentarlo.',
        );
    } finally {
      if (version === this.version) this.cargando.set(false);
    }
  }

  async guardar(ruta: string, datos: object) {
    if (this.ocupado()) return false;
    const version = this.version;
    this.ocupado.set(true);
    this.error.set('');
    try {
      const estado = await api<EstadoAprendizaje>(ruta, 'PUT', datos);
      if (version !== this.version || !sesionActiva()) return false;
      this.aplicar(estado);
      return true;
    } catch {
      if (version === this.version)
        this.error.set(
          'No se pudo guardar el cambio. Comprueba la conexión y vuelve a intentarlo.',
        );
      return false;
    } finally {
      this.ocupado.set(false);
    }
  }

  private aplicar(datos: EstadoAprendizaje) {
    this.completadas.set(datos.completadas);
    this.categoria.set(datos.categoria);
  }
}
