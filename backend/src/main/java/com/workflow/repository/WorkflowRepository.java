package com.workflow.repository;

import com.workflow.entity.Workflow;
import com.workflow.entity.WorkflowType;
import com.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    
    // Méthodes existantes avec WorkflowType
    List<Workflow> findByTypeAndActifTrue(WorkflowType type);
    List<Workflow> findByCreateurIdAndActifTrue(Long createurId);
    List<Workflow> findAllByActifTrue();
    List<Workflow> findByCreateur(User createur);
    
    // Requête pour exclure les workflows dynamiques (nom commençant par "Composé:")
    @Query("SELECT w FROM Workflow w WHERE w.actif = true AND w.nom NOT LIKE 'Composé:%'")
    List<Workflow> findAllActiveNonDynamic();
    
    Optional<Workflow> findByNomAndActifTrue(String nom);

    // ✅ UNIQUE méthode pour récupérer le premier workflow actif d’un type donné, trié par ID asc
    Optional<Workflow> findFirstByTypeAndActifTrueOrderByIdAsc(WorkflowType type);

    // L'ancienne méthode findDefaultWorkflow() est supprimée.
    // Elle sera remplacée dans les services par findFirstByTypeAndActifTrueOrderByIdAsc

    // ========== NOUVELLES MÉTHODES POUR LE CHAMP "parDefaut" ==========
    
    /**
     * Récupère le workflow marqué comme par défaut pour un type donné.
     */
    Optional<Workflow> findByTypeAndParDefautTrue(WorkflowType type);

    /**
     * Réinitialise le flag `parDefaut` à false pour tous les workflows d'un type donné.
     * Utilisé avant de définir un nouveau workflow par défaut.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Workflow w SET w.parDefaut = false WHERE w.type = :type")
    void resetDefaultForType(@Param("type") WorkflowType type);

    Optional<Workflow> findByTypeAndParDefautTrueAndActifTrue(WorkflowType type);
}