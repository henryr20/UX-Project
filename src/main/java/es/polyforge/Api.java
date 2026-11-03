package es.polyforge;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
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
    private final BCryptPasswordEncoder encoder;
    private final boolean demo;
    private final SecureRandom random = new SecureRandom();

    Api(Usuarios usuarios, Codigos codigos, Consultas consultas, BCryptPasswordEncoder encoder,
        @Value("${polyforge.demo-code}") boolean demo) {
        this.usuarios = usuarios;
        this.codigos = codigos;
        this.consultas = consultas;
        this.encoder = encoder;
        this.demo = demo;
    }

    record Correo(@NotBlank @Email @Size(max=254) String email) {}
    record Verificacion(@NotBlank @Email @Size(max=254) String email,
                        @NotNull @Pattern(regexp="[0-9]{6}") String codigo) {}
    record Consulta(@NotBlank @Size(max=120) String asunto,
                    @NotBlank @Size(max=4000) String mensaje) {}
    record ConsultaVista(Long id, String asunto, String mensaje, Instant creado) {}

    @GetMapping("/csrf")
    CsrfToken csrf(CsrfToken token) { return token; }

    @PostMapping("/verificacion")
    @ResponseStatus(HttpStatus.ACCEPTED)
    Map<String,String> solicitar(@Valid @RequestBody Correo entrada) {
        if (!demo) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Simulación desactivada");
        String email = normalizar(entrada.email());
        Usuario usuario = usuarios.findByEmail(email).orElseGet(() -> {
            var nuevo = new Usuario();
            nuevo.email = email;
            return usuarios.saveAndFlush(nuevo);
        });
        Instant ahora = Instant.now();
        if (codigos.findFirstByUsuarioIdOrderByIdDesc(usuario.id)
                .filter(c -> c.expira.minusSeconds(540).isAfter(ahora)).isPresent()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
        }
        String codigo = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        var registro = new CodigoVerificacion();
        registro.usuario = usuario;
        registro.hash = encoder.encode(codigo);
        registro.expira = ahora.plusSeconds(600);
        codigos.save(registro);
        return Map.of("codigoDemo", codigo);
    }

    @PostMapping("/verificacion/confirmar")
    ResponseEntity<Void> confirmar(@Valid @RequestBody Verificacion entrada, HttpServletRequest request) {
        if (!demo) return ResponseEntity.status(503).build();
        var usuario = usuarios.findByEmail(normalizar(entrada.email()));
        var codigo = usuario.flatMap(u -> codigos.findFirstByUsuarioIdOrderByIdDesc(u.id));
        if (codigo.isEmpty()) return ResponseEntity.badRequest().build();
        var registro = codigo.get();
        if (registro.usado || !registro.expira.isAfter(Instant.now()) || registro.intentos >= 5) {
            return ResponseEntity.badRequest().build();
        }
        registro.intentos++;
        if (!encoder.matches(entrada.codigo(), registro.hash)) return ResponseEntity.badRequest().build();
        registro.usado = true;
        usuario.get().verificado = true;
        var session = request.getSession();
        request.changeSessionId();
        session.setAttribute("usuario", usuario.get().id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuarios/me")
    Map<String,Object> perfil(HttpServletRequest request) {
        var u = usuarioActual(request);
        return Map.of("id", u.id, "email", u.email, "verificado", u.verificado);
    }

    @DeleteMapping("/usuarios/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void eliminarPerfil(HttpServletRequest request) {
        var u = usuarioActual(request);
        consultas.deleteByUsuarioId(u.id);
        codigos.deleteByUsuarioId(u.id);
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