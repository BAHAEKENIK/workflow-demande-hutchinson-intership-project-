package com.workflow.repository;

import com.workflow.entity.User;
import com.workflow.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Authentification : ne renvoie que les utilisateurs actifs
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.active = true")
    Optional<User> findByUsername(@Param("username") String username);

    // Version explicite
    Optional<User> findByUsernameAndActiveTrue(String username);

    // Version interne pour l'administration (peut renvoyer également les inactifs)
    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsernameIgnoreActive(@Param("username") String username);

    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(Role role);
    List<User> findByDepartmentIdAndRole(Long departmentId, Role role);

    // Recherche full‑text sur les champs texte (sans filtre actif – à utiliser avec prudence)
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName, String lastName, String email);
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName, String lastName, String email, Pageable pageable);

    // ✅ Méthode de recherche paginée avec filtre actif (nom exact attendu par le contrôleur)
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndActiveTrue(
            String firstName, String lastName, String email, Pageable pageable);

    // Nouvelles méthodes pour le filtre actif
    List<User> findAllByActiveTrue();
    Page<User> findAllByActiveTrue(Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND u.active = true")
    Page<User> searchByKeywordAndActiveTrue(@Param("keyword") String keyword, Pageable pageable);

    // Méthode de recherche paginée avec filtre rôle et mot‑clé, en ne prenant que les actifs
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           " LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND u.active = true")
    Page<User> findAllActiveWithFilters(@Param("keyword") String keyword,
                                        @Param("role") Role role,
                                        Pageable pageable);

    // Récupère tous les administrateurs actifs
    @Query("SELECT u FROM User u WHERE u.role = com.workflow.entity.Role.ADMIN AND u.active = true")
    List<User> findAllActiveAdmins();
}