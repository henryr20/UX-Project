<p align="center">
  <img src="public/images/logo.png" alt="Logo de PolyForge" width="76" />
</p>

<h1 align="center">PolyForge</h1>

<p align="center">Una plataforma de aprendizaje de modelado 3D, texturizado e iluminación.</p>

<p align="center">
  <a href="#el-proyecto">El proyecto</a> ·
  <a href="#puesta-en-marcha">Instalación</a> ·
  <a href="#probar-la-aplicación">Uso</a> ·
  <a href="https://app.notion.com/p/4077ad838e1e80fea025f905af47f8f5?v=4077ad838e1e805dbe1a000cc0f5d6bc">Tablero de tareas</a>
</p>

## El proyecto

PolyForge reúne cursos de creación 3D en una interfaz pensada para consultar el progreso y continuar aprendiendo. Este repositorio contiene el desarrollo de la interfaz y la navegación, realizado con Angular a partir de un prototipo en Figma.

La versión actual incluye Inicio, Acceso, Ayuda y una página de error 404. Los cursos y sus porcentajes de progreso son datos de muestra. El acceso permite probar el flujo de verificación, pero todavía no envía correos ni crea una sesión de usuario.

### Funciones disponibles

- Inicio con progreso circular, estadísticas y tarjetas de cursos con imágenes propias.
- Temas claro y oscuro con portada adaptada y preferencia guardada en el navegador.
- Menú móvil superpuesto con efecto de cristal y selección mediante color y subrayado.
- Acceso por correo y código de seis dígitos, con pegado del código, reenvío y cambio de correo.
- Preguntas frecuentes desplegables y animadas.
- Página 404 con enlaces para recuperar la navegación.
- Validación de campos, mensajes de error y éxito, y aviso de falta de conexión.
- Navegación con teclado, foco visible, etiquetas accesibles y respeto al movimiento reducido.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Angular 21 | Componentes, rutas y formularios reactivos |
| TypeScript 5.9 | Lógica de la aplicación |
| SCSS | Estilos, temas y adaptación a distintos tamaños de pantalla |
| Inter | Tipografía alojada localmente |

## Puesta en marcha

### Requisitos

- Node.js compatible con Angular 21: `20.19.x` o superior de la rama 20, `22.12.x` o superior de la rama 22, o una versión igual o superior a 24.
- npm. El proyecto declara la versión `11.19.0` como gestor de paquetes.
- Git para clonar el repositorio.

### Instalación

```bash
git clone https://github.com/henryr20/UX-Project.git
cd UX-Project
npm ci
npm start
```

Abre [http://localhost:4200](http://localhost:4200) en el navegador. Los cambios en el código se reflejan automáticamente mientras el servidor está en ejecución.

No hace falta configurar claves, variables de entorno ni servicios externos.

## Probar la aplicación

| Ruta | Pantalla |
| --- | --- |
| `/inicio` | Progreso, estadísticas y selección de cursos |
| `/login` | Acceso de prueba con correo y código |
| `/ayuda` | Preguntas frecuentes |
| Cualquier ruta inexistente | Error 404 |

Para probar el acceso:

1. Introduce un correo con formato válido y pulsa **Enviar código**.
2. Escribe o pega el código de prueba **371942**.
3. Pulsa la flecha de verificación. La confirmación aparece en verde.

Puedes introducir un correo incorrecto o un código incompleto para comprobar los mensajes de validación. El código se prepara localmente; no se envía ningún correo.

Los botones de los cursos muestran un aviso de disponibilidad. Las lecciones y el guardado real del progreso quedan fuera de esta versión.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/polyforge/` |
| `npm run watch` | Compila en modo desarrollo y observa los cambios |

## Organización del código

```text
src/
├── app/
│   ├── components/     Tarjetas de curso e iconos reutilizables
│   ├── pages/          Inicio, Acceso, Ayuda y error 404
│   ├── app.routes.ts   Rutas de navegación
│   ├── app.config.ts   Configuración de la aplicación
│   ├── app.html        Cabecera, navegación y footer
│   └── app.scss        Estilos de la estructura general
└── styles.scss         Estilos compartidos y temas
public/
├── fonts/              Inter y su licencia
└── images/             Logotipo, portadas e imágenes de cursos
```

## Autor

**Enrique Javier Romero Ramírez** · [henryr20](https://github.com/henryr20)

Proyecto de Desarrollo de Interfaces, UT2: Inicio y navegación.
