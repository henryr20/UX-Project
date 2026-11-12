<p align="center">
  <img src="public/images/logo.png" alt="Logo de PolyForge" width="76" />
</p>

# PolyForge

Proyecto de una web de aprendizaje de modelado 3D, texturizado e iluminación, con frontend en Angular y API en Spring Boot. Incluye registro de usuarios y una comunidad para compartir publicaciones de texto.

Los cursos, las estadísticas y los porcentajes de progreso son datos de muestra. Las lecciones todavía no están disponibles.

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña.
- Comunidad con creación de publicaciones, búsqueda por título y descripción, likes y filtro de guardadas. Requiere iniciar sesión.
- Perfil con publicaciones propias, cierre de sesión y eliminación de cuenta. Al borrar la cuenta también se eliminan sus publicaciones y datos asociados.
- Temas claro y oscuro con la preferencia guardada en el navegador.
- Diseño adaptable, menú móvil, preguntas frecuentes y página 404.
- Validación de formularios, avisos de estado y navegación con teclado.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend | Angular 21.2, TypeScript 5.9, RxJS y SCSS |
| Backend | Java 21, Spring Boot 3.5, Spring Security y Maven |
| Persistencia | Spring Data JPA, Hibernate y MySQL/MariaDB |
| Recursos | Tipografía Inter alojada localmente e imágenes en `public/` |

## Instalación y ejecución

### Requisitos

- Node.js `^20.19.0`, `^22.12.0` o `>=24.0.0`, según las dependencias del archivo de bloqueo.
- npm; `package.json` declara `npm@11.19.0`.
- JDK 21 y Maven, instalado o integrado en IntelliJ IDEA.
- MySQL o MariaDB en ejecución. Puedes usar el servicio MySQL de XAMPP.

### 1. Backend

La configuración por defecto conecta con `localhost:3306`, usuario `root` y contraseña vacía. Crea la base de datos `polyforge` si el usuario tiene permisos; Hibernate crea o actualiza las tablas.

Puedes ajustar la conexión mediante variables de entorno:

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/polyforge?createDatabaseIfNotExist=true` | URL JDBC de la base de datos |
| `DB_USER` | `root` | Usuario de la base de datos |
| `DB_PASSWORD` | Vacía | Contraseña de la base de datos |
| `DB_SCHEMA` | `update` | Modo de gestión del esquema de Hibernate |
| `ANGULAR_ORIGIN` | `http://localhost:4200` | Origen del frontend permitido por CORS |

Desde la raíz del proyecto, con Maven disponible:

```bash
cd backend
mvn spring-boot:run
```

También puedes abrir `backend/pom.xml` en IntelliJ IDEA, seleccionar JDK 21 y ejecutar [PolyForge.java](backend/src/main/java/es/polyforge/PolyForge.java).

La API se sirve en `http://localhost:8080/api`.

### 2. Frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm ci
npm start
```

Abre [http://localhost:4200](http://localhost:4200). El frontend llama a la API en el puerto `8080` del mismo servidor indicado en la URL del navegador. Para probar el registro, el perfil y la comunidad, mantén el backend y la base de datos en marcha.

## Uso

1. Entra en **Acceder → Regístrate** y crea una cuenta. La contraseña debe tener al menos ocho caracteres.
2. Inicia sesión con tu correo y contraseña.
3. En **Comunidad**, crea una publicación con título y descripción. Puedes buscar publicaciones, darles **Me gusta** y guardarlas.
4. En **Mi perfil**, edita tu correo con la contraseña actual, gestiona tus publicaciones o cierra sesión.

| Ruta | Contenido |
| --- | --- |
| `/inicio` | Cursos y progreso de muestra |
| `/login` | Inicio de sesión |
| `/registro` | Creación de cuenta |
| `/comunidad` | Publicaciones y guardadas |
| `/perfil` | Cuenta y publicaciones propias |
| `/ayuda` | Preguntas frecuentes |
| Otras rutas | Página 404 |

La sesión se mantiene mediante una cookie. Las contraseñas se almacenan como hashes BCrypt y las peticiones que modifican datos incluyen un token CSRF obtenido de `/api/csrf`.

**Detalle pendiente:** la página de Ayuda conserva un texto antiguo sobre acceso por código. El formulario actual usa correo y contraseña.

## Comandos

Ejecutados desde la raíz del proyecto:

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia Angular en modo desarrollo |
| `npm run build` | Genera la compilación de producción en `dist/polyforge/` |
| `npm run watch` | Compila en modo desarrollo y vuelve a compilar al guardar cambios |

## Estructura

```text
src/
├── app/
│   ├── components/     Tarjetas de curso e iconos
│   ├── pages/          Inicio, acceso, comunidad, perfil, ayuda y 404
│   ├── api.ts          Peticiones a la API y estado de sesión
│   ├── app.routes.ts   Rutas de navegación
│   └── app.*           Componente principal, navegación y estilos
└── styles.scss         Estilos compartidos y temas
backend/
├── pom.xml             Dependencias y configuración Maven
└── src/main/           API, entidades, repositorios y configuración
public/
├── fonts/              Archivos originales de Inter y su licencia
└── images/             Logotipo, portadas e imágenes de cursos
```

## Aplicación Android (PGL)

1. Arranca MySQL en XAMPP y ejecuta el backend Java en el puerto `8080`.
2. En Android Studio, abre la carpeta `android/` como proyecto, sincroniza Gradle y ejecuta el módulo `app` en un emulador.
3. Entra con una cuenta de PolyForge o regístrate en la app. En **Comunidad** puedes listar, publicar, editar y eliminar tus posts. Comprueba en la web que aparecen los mismos cambios.

| Actividad | Interfaz | Función |
| --- | --- | --- |
| Acceso | XML Views | Registro e inicio de sesión |
| Comunidad | Jetpack Compose | Listado, guardados, likes y borrado de publicaciones propias |
| Editor | XML Views | Crear y editar una publicación |

Las actividades gestionan la interfaz y delegan las llamadas a la API en la capa de datos. La app usa la cookie de sesión y el token CSRF del backend. El emulador usa `http://10.0.2.2:8080/api` para acceder al servidor del PC.

En un móvil físico de la misma red, configura `polyforgeApiUrl=http://IP_DEL_PC:8080/api` en las propiedades de Gradle y recompila. El acceso HTTP está habilitado en la compilación de depuración para las pruebas locales.

## Autor

**Enrique Javier Romero Ramírez** · [henryr20](https://github.com/henryr20)

Proyecto de Desarrollo de Interfaces, UT2: Inicio y navegación.
