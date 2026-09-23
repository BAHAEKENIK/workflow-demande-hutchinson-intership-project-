package com.workflow.repository;

import com.workflow.entity.Historique;
import com.workflow.entity.Demande;
import com.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    List<Historique> findByDemandeOrderByDateActionAsc(Demande demande);
    boolean existsByDemandeAndUtilisateur(Demande demande, User utilisateur);
    List<Historique> findByUtilisateur(User utilisateur);
    long countByUtilisateurAndAction(User utilisateur, String action);
}