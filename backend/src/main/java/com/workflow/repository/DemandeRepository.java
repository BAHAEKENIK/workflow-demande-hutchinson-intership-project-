package com.workflow.repository;

import com.workflow.entity.Workflow;
import com.workflow.entity.Demande;
import com.workflow.entity.User;
import com.workflow.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {

    // Méthodes simples existantes
    Page<Demande> findByDemandeur(User demandeur, Pageable pageable);
    Page<Demande> findByCreateur(User createur, Pageable pageable);
    Page<Demande> findByStatut(StatutDemande statut, Pageable pageable);
    
    /**
     * Requête avec prise en compte de l'historique (utilisateur ayant déjà agi)
     * et incluant la logique de validation pour les chefs de département
     * (soit chef explicite, soit chef connecté appartenant au département de l'étape).
     * Exclusion des demandes de suppression (titre commençant par SUPPRESSION_).
     */
    @Query("SELECT d FROM Demande d " +
           "WHERE (:adminMode = true OR " +
           "      d.demandeur = :user OR " +
           "      d.createur = :user OR " +
           "      (d.statut = 'PENDING' AND EXISTS (" +
           "         SELECT e FROM EtapeValidation e " +
           "         WHERE e.workflow = d.workflow " +
           "         AND e.ordre = d.etapeCourante " +
           "         AND (e.department.chef.id = :userId " +
           "              OR EXISTS (SELECT u FROM User u WHERE u.id = :userId AND u.role = 'CHEF_DEPT' AND u.department.id = e.department.id)" +
           "         )" +
           "      )) " +
           "      OR EXISTS (" +
           "         SELECT h FROM Historique h " +
           "         WHERE h.demande = d AND h.utilisateur = :user)) " +
           "AND (:statut IS NULL OR d.statut = :statut) " +
           "AND d.titre NOT LIKE 'SUPPRESSION_%'")
    Page<Demande> findDemandesForUser(@Param("user") User user,
                                      @Param("userId") Long userId,
                                      @Param("adminMode") boolean adminMode,
                                      @Param("statut") StatutDemande statut,
                                      Pageable pageable);
    
    @Query("SELECT d FROM Demande d " +
           "LEFT JOIN FETCH d.workflow w " +
           "LEFT JOIN FETCH w.etapes e " +
           "LEFT JOIN FETCH e.department " +
           "WHERE d.id = :id")
    Optional<Demande> findByIdWithWorkflowEtapes(@Param("id") Long id);

    // Méthode de comptage avec la même logique (incluant l'historique)
    @Query("SELECT COUNT(d) FROM Demande d " +
           "WHERE (:adminMode = true OR " +
           "      d.demandeur = :user OR " +
           "      d.createur = :user OR " +
           "      (d.statut = :statut AND EXISTS (" +
           "         SELECT e FROM EtapeValidation e " +
           "         WHERE e.workflow = d.workflow " +
           "         AND e.ordre = d.etapeCourante " +
           "         AND e.department.chef.id = :userId)) " +
           "      OR EXISTS (" +
           "         SELECT h FROM Historique h " +
           "         WHERE h.demande = d AND h.utilisateur = :user)) " +
           "AND d.statut = :statut " +
           "AND d.titre NOT LIKE 'SUPPRESSION_%'")
    long countDemandesForUser(@Param("user") User user,
                              @Param("userId") Long userId,
                              @Param("adminMode") boolean adminMode,
                              @Param("statut") StatutDemande statut);
    
    List<Demande> findByDemandeur(User demandeur);
    List<Demande> findByCreateur(User createur);
    
    // Requête pour les actions de l'utilisateur (historique) – exclusion des demandes SUPPRESSION_
    @Query("SELECT d FROM Demande d " +
           "WHERE EXISTS (SELECT h FROM Historique h " +
           "              WHERE h.demande = d AND h.utilisateur = :user " +
           "              AND h.action = :action) " +
           "AND (:statut IS NULL OR d.statut = :statut) " +
           "AND d.titre NOT LIKE 'SUPPRESSION_%'")
    Page<Demande> findDemandesByUserAction(@Param("user") User user,
                                           @Param("action") String action,
                                           @Param("statut") StatutDemande statut,
                                           Pageable pageable);
    
    Optional<Demande> findTopByDemandeurOrderByDateCreationDesc(User demandeur);
       
    /**
     * Récupère toutes les demandes APPROVED d'un employé (sauf une éventuelle demande à exclure),
     * triées par date de création décroissante, avec leurs détails chargés.
     */
    @Query("SELECT DISTINCT d FROM Demande d " +
           "LEFT JOIN FETCH d.detailDemande " +
           "WHERE d.demandeur = :employee " +
           "AND d.statut = com.workflow.entity.StatutDemande.APPROVED " +
           "AND (:excludeId IS NULL OR d.id != :excludeId) " +
           "ORDER BY d.dateCreation DESC")
    List<Demande> findPreviousApprovedDemandesByEmployee(@Param("employee") User employee,
                                                         @Param("excludeId") Long excludeId);
    
    // ========== MÉTHODES POUR LA GESTION DES WORKFLOWS (traçabilité) ==========
    
    /**
     * Vérifie s'il existe des demandes non terminées (statut différent de APPROVED)
     * associées à un workflow donné.
     */
    boolean existsByWorkflowAndStatutNot(Workflow workflow, StatutDemande statut);

    /**
     * Vérifie s'il existe au moins une demande (quel que soit son statut)
     * associée à un workflow donné.
     */
    boolean existsByWorkflow(Workflow workflow);
}