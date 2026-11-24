package es.polyforge;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="usuario")
public class Usuario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @Column(nullable=false, unique=true, length=254) String email;
    @Column(nullable=false) boolean verificado;
    @Column(length=60) String passwordHash;

    @Column(length=16) String categoriaPreferida;
    @ElementCollection
    @CollectionTable(name="usuario_leccion", joinColumns=@JoinColumn(name="usuario_id"))
    @Column(name="leccion", nullable=false, length=40)
    Set<String> leccionesCompletadas = new HashSet<>();

    public Long getId() { return id; }
}
