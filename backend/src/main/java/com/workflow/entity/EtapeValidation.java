package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "etapes_validation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtapeValidation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnoreProperties("etapes")   // ← évite la boucle via Workflow.etapes
    private Workflow workflow;

    private Integer ordre;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"chef", "members"})   // ← évite la boucle via Department
    private Department department;

    @Enumerated(EnumType.STRING)
    private StatutEtape statut = StatutEtape.PENDING;

    // Le champ 'directeur' a été supprimé
}