package es.polyforge;

import java.time.Instant;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@Transactional
class Api {
    private final Usuarios usuarios;
    private final Codigos codigos;
    private final Consultas consultas;
    private final Posts posts;
    private final BCryptPasswordEncoder encoder;

    Api(Usuarios usuarios, Codigos codigos, Consultas consultas, Posts posts, BCryptPasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.codigos = codigos;
        this.consultas = consultas;
        this.posts = posts;
        this.encoder = encoder;
    }

    record Credenciales(@NotBlank @Email @Size(max=254) String email,
                        @NotBlank @Size(min=8,max=72) String password) {}
    record Consulta(@NotBlank @Size(max=120) String asunto,
                    @NotBlank @Size(max=4000) String mensaje) {}
    record ConsultaVista(Long id, String asunto, String mensaje, Instant creado) {}

    @GetMapping("/csrf")
    CsrfToken csrf(CsrfToken token) { return token; }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    void registrar(@Valid @RequestBody Credenciales datos) {
        validarLongitud(datos.password());
        String email = normalizar(datos.email());
        if (usuarios.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        var usuario = new Usuario();
        usuario.email = email;
        usuario.passwordHash = encoder.encode(datos.password());
        try {
            usuarios.saveAndFlush(usuario);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado", e);
        }
    }

    @PostMapping("/sesion")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void iniciarSesion(@Valid @RequestBody Credenciales datos, HttpServletRequest request) {
        validarLongitud(datos.password());
        var usuario = usuarios.buscarPorEmail(normalizar(datos.email()))
            .filter(u -> u.passwordHash != null && encoder.matches(datos.password(), u.passwordHash))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        var session = request.getSession();
        request.changeSessionId();
        session.setAttribute("usuario", usuario.id);
    }

    private static void validarLongitud(String password) {
        if (password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contraseña demasiado larga");
        }
    }

    @GetMapping("/usuarios/me")
    Map<String,Object> perfil(HttpServletRequest request) {
        var u = usuarioActual(request);
        return Map.of("id", u.id, "email", u.email, "verificado", u.verificado);
    }

    @PutMapping("/usuarios/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void editarPerfil(@Valid @RequestBody Credenciales datos, HttpServletRequest request) {
        var usuario = usuarioActual(request);
        validarLongitud(datos.password());
        if (usuario.passwordHash == null || !encoder.matches(datos.password(), usuario.passwordHash)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        String email = normalizar(datos.email());
        if (email.equals(usuario.email)) return;
        if (usuarios.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        usuario.email = email;
        usuario.verificado = false;
        try {
            usuarios.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado", e);
        }
    }

    @DeleteMapping("/usuarios/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void eliminarPerfil(HttpServletRequest request) {
        var u = usuarioActual(request);
        consultas.deleteByUsuarioId(u.id);
        codigos.deleteByUsuarioId(u.id);
        for (var post : posts.relacionadosCon(u)) {
            if (Objects.equals(post.autor.getId(), u.id)) {
                posts.delete(post);
            } else {
                post.likes.remove(u);
                post.guardados.remove(u);
            }
        }
        usuarios.delete(u);
        request.getSession(false).invalidate();
    }

    @DeleteMapping("/sesion")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void salir(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) session.invalidate();
    }

    @GetMapping("/soporte")
    List<ConsultaVista> listar(HttpServletRequest request) {
        return consultas.findByUsuarioIdOrderByIdDesc(usuarioActual(request).id)
            .stream().map(Api::vista).toList();
    }

    @GetMapping("/soporte/{id}")
    ConsultaVista leer(@PathVariable Long id, HttpServletRequest request) {
        return vista(buscar(id, request));
    }

    @PostMapping("/soporte")
    @ResponseStatus(HttpStatus.CREATED)
    ConsultaVista crear(@Valid @RequestBody Consulta datos, HttpServletRequest request) {
        var s = new Soporte();
        s.usuario = usuarioActual(request);
        s.creado = Instant.now();
        actualizar(s, datos);
        return vista(consultas.save(s));
    }

    @PutMapping("/soporte/{id}")
    ConsultaVista editar(@PathVariable Long id, @Valid @RequestBody Consulta datos, HttpServletRequest request) {
        var s = buscar(id, request);
        actualizar(s, datos);
        return vista(s);
    }

    @DeleteMapping("/soporte/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void eliminar(@PathVariable Long id, HttpServletRequest request) {
        consultas.delete(buscar(id, request));
    }


    record Publicacion(@NotBlank @Size(max=120) String titulo,
                       @NotBlank @Size(max=4000) String descripcion) {}
    record Marca(@NotNull Boolean activo) {}
    record PostVista(Long id, String titulo, String descripcion, int likes, boolean gustado, boolean guardado, boolean propio) {}

    @GetMapping("/posts")
    List<PostVista> listarPosts(HttpServletRequest request) {
        var usuario = usuarioActual(request);
        return posts.findAllByOrderByIdDesc().stream()
            .map(post -> vistaPost(post, usuario)).toList();
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    PostVista publicar(@Valid @RequestBody Publicacion datos, HttpServletRequest request) {
        var post = new PostComunidad();
        post.autor = usuarioActual(request);
        post.titulo = datos.titulo().strip();
        post.descripcion = datos.descripcion().strip();
        return vistaPost(posts.save(post), post.autor);
    }

    @PutMapping("/posts/{id}/like")
    PostVista marcarLike(@PathVariable Long id, @Valid @RequestBody Marca marca, HttpServletRequest request) {
        var usuario = usuarioActual(request);
        var post = buscarPost(id);
        marcar(post.likes, usuario, marca.activo());
        return vistaPost(post, usuario);
    }

    @PutMapping("/posts/{id}/guardado")
    PostVista marcarGuardado(@PathVariable Long id, @Valid @RequestBody Marca marca, HttpServletRequest request) {
        var usuario = usuarioActual(request);
        var post = buscarPost(id);
        marcar(post.guardados, usuario, marca.activo());
        return vistaPost(post, usuario);
    }

    @PutMapping("/posts/{id}")
    PostVista editarPost(@PathVariable Long id, @Valid @RequestBody Publicacion datos, HttpServletRequest request) {
        var usuario = usuarioActual(request);
        var post = buscarPostPropio(id, usuario);
        post.titulo = datos.titulo().strip();
        post.descripcion = datos.descripcion().strip();
        return vistaPost(post, usuario);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void eliminarPost(@PathVariable Long id, HttpServletRequest request) {
        var usuario = usuarioActual(request);
        posts.delete(buscarPostPropio(id, usuario));
    }

    private PostComunidad buscarPostPropio(Long id, Usuario usuario) {
        var post = buscarPost(id);
        if (!Objects.equals(post.autor.getId(), usuario.id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return post;
    }

    private PostComunidad buscarPost(Long id) {
        return posts.buscarParaEditar(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private static void marcar(Set<Usuario> usuarios, Usuario usuario, boolean activo) {
        if (activo) {
            usuarios.add(usuario);
        } else {
            usuarios.remove(usuario);
        }
    }

    private static PostVista vistaPost(PostComunidad post, Usuario usuario) {
        return new PostVista(post.id, post.titulo, post.descripcion, post.likes.size(), post.likes.contains(usuario),
            post.guardados.contains(usuario), Objects.equals(post.autor.getId(), usuario.id));
    }

    private Usuario usuarioActual(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("usuario") instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return usuarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private Soporte buscar(Long id, HttpServletRequest request) {
        return consultas.findByIdAndUsuarioId(id, usuarioActual(request).id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private static void actualizar(Soporte s, Consulta datos) {
        s.asunto = datos.asunto().strip();
        s.mensaje = datos.mensaje().strip();
    }

    private static ConsultaVista vista(Soporte s) {
        return new ConsultaVista(s.id, s.asunto, s.mensaje, s.creado);
    }

    private static String normalizar(String email) { return email.strip().toLowerCase(Locale.ROOT); }
}
