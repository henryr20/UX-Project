package es.polyforge;

import jakarta.persistence.*;

@Entity
@Table(name="usuario")
public class Usuario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @Column(nullable=false, unique=true, length=254) String email;
    @Column(nullable=false) boolean verificado;
}