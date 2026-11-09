package es.polyforge;

import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="codigo_verificacion")
public class CodigoVerificacion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) @JoinColumn(name="usuario_id") Usuario usuario;
    @Column(nullable=false) String hash;
    @Column(nullable=false) Instant expira;
    int intentos;
    boolean usado;
}
