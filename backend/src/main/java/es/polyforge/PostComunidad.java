package es.polyforge;

import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;

@Entity
@Table(name = "post_comunidad")
public class PostComunidad {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    Usuario autor;

    @Column(nullable = false, length = 120)
    String titulo;

    @Column(nullable = false, length = 4000)
    String descripcion;

    @ManyToMany
    @JoinTable(name = "post_like", joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id"))
    Set<Usuario> likes = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "post_guardado", joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id"))
    Set<Usuario> guardados = new HashSet<>();
}
