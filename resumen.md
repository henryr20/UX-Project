# Entrega 04 — PolyForge

## Funcionalidades

| Apartado | Implementación |
| --- | --- |
| Navegación | Inicio, Cursos, Comunidad, Ayuda, perfil, login, registro y ruta 404 |
| Acceso | Registro con correo único, contraseña BCrypt, cookie de sesión y protección CSRF |
| Ayuda | Proyecto HelpNDoc, seis páginas, índice, palabras clave, buscador e imágenes |
| Imágenes | Portadas distintas para cada curso, WebP, tamaños adaptados y carga diferida |
| Personalización | Categoría preferida guardada en la cuenta y aplicada al catálogo |
| Interfaz adicional | Lecciones de cada curso y prácticas con seguimiento |
| Elemento diferenciador | Progreso radial real conectado a nueve prácticas y recuperado entre sesiones |
| Búsqueda y CRUD | Publicaciones, búsqueda por título y descripción, guardados, creación, edición y borrado propios |
| Usabilidad | Validaciones, contador de resultados, estados vacíos, carga, errores, reintento y confirmaciones |
| PWA | Service worker, manifest con iconos, redirección HTTPS y pantallas visitadas disponibles offline |

## Comprobaciones

Se utilizó una base temporal con dos cuentas. Se comprobó que las lecciones y las preferencias no se comparten entre usuarios y que dos actualizaciones simultáneas conservan ambas lecciones. La edición de publicaciones ajenas devuelve 404. El diseño se revisó en escritorio, móvil de 390 px y tablet de 768 px.

| Pantalla | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| /inicio | 96 | 100 | 96 | 100 |
| /cursos | 96 | 100 | 96 | 100 |
| /ayuda | 86 | 100 | 96 | 100 |

Mediciones locales de producción con simulación móvil de Lighthouse en Edge y certificado local aceptado. Los valores superan los mínimos de 80 en rendimiento y 85 en accesibilidad y buenas prácticas. El registro está en [validacion-final.json](docs/validacion-final.json).

## Evidencias y enlaces

- [Repositorio](https://github.com/henryr20/UX-Project).
- [Kanban principal](https://app.notion.com/p/4077ad838e1e80fea025f905af47f8f5?v=4077ad838e1e805dbe1a000cc0f5d6bc).
- [Inicio con progreso real](docs/imagenes/instalacion-inicio.png).
- [Curso y prácticas](docs/imagenes/final-curso.png).
- [Preferencias del perfil](docs/imagenes/final-perfil.png).
- [Ayuda HelpNDoc](docs/imagenes/final-ayuda.png).
- [Proyecto editable de HelpNDoc](docs/ayuda/PolyForge.hnd).

Las nuevas tarjetas del Kanban están en Realizado y aparecen primero por fecha de creación.

## Preparación de la entrega

El usuario gestiona Git y la publicación. Queda registrar las ramas develop/main/feature y al menos dos ramas nuevas de desarrollo, conservar commits reales y compartir el repositorio con la profesora. La frecuencia de cuatro commits semanales se comprueba sobre el historial real.

El PDF final se llama EnriqueRomeroRamirez_04_.PDF y tiene un máximo de tres folios. Debe incluir las capturas de la aplicación en ejecución y sus navegaciones, los enlaces al repositorio y al Kanban, una captura actual del tablero, el elemento diferenciador y las conclusiones personales. La captura de la aplicación ocupa como máximo un folio, la del tablero como máximo otro y la innovación como máximo medio. La defensa individual y el acceso de la profesora forman parte de la entrega.

## Elemento diferenciador

PolyForge une prácticas breves de modelado, texturizado e iluminación con un seguimiento individual del aprendizaje. El usuario marca las lecciones realizadas, ve el avance en un radial y puede compartir el resultado en Comunidad. El progreso y la categoría favorita se conservan en la cuenta, de modo que puede retomar el trabajo en otra sesión.
