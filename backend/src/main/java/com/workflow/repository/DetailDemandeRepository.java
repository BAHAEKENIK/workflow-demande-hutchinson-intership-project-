package com.workflow.repository;

import com.workflow.entity.DetailDemande;
import com.workflow.entity.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DetailDemandeRepository extends JpaRepository<DetailDemande, Long> {
    Optional<DetailDemande> findByDemande(Demande demande);
}