package es.polyforge;

import java.util.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
interface Usuarios extends JpaRepository<Usuario,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Usuario> findByEmail(String email);
}
interface Codigos extends JpaRepository<CodigoVerificacion,Long> {
    Optional<CodigoVerificacion> findFirstByUsuarioIdOrderByIdDesc(Long id);
    void deleteByUsuarioId(Long id);
}
interface Consultas extends JpaRepository<Soporte,Long> {
    List<Soporte> findByUsuarioIdOrderByIdDesc(Long id);
    Optional<Soporte> findByIdAndUsuarioId(Long id, Long usuarioId);
    void deleteByUsuarioId(Long id);
}
interface Posts extends JpaRepository<PostComunidad,Long> {
    List<PostComunidad> findAllByOrderByIdDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PostComunidad p where p.id = ?1")
    Optional<PostComunidad> buscarParaEditar(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select p from PostComunidad p
        where p.autor = ?1 or ?1 member of p.likes or ?1 member of p.guardados
        order by p.id
        """)
    List<PostComunidad> relacionadosCon(Usuario usuario);
}
