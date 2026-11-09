package es.polyforge;

import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="soporte")
public class Soporte {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id") Usuario usuario;
    @Column(nullable=false,length=120) String asunto;
    @Column(nullable=false,length=4000) String mensaje;
    @Column(nullable=false) Instant creado;
}
