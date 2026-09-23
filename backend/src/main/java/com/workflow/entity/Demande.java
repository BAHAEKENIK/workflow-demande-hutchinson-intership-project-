// ======== Demande.java ========
package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "demandeur_id", nullable = false)
    @JsonIgnoreProperties({"demandes", "workflows"})
    private User demandeur;

    @ManyToOne
    @JoinColumn(name = "createur_id", nullable = false)
    @JsonIgnoreProperties({"demandes", "workflows"})
    private User createur;

    @ManyToOne
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnoreProperties("etapes")
    private Workflow workflow;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut = StatutDemande.PENDING;

    private LocalDateTime dateCreation;
    private LocalDateTime dateDerniereModification;

    private Integer etapeCourante = 0;

    @OneToOne(mappedBy = "demande", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    @JsonIgnoreProperties("demande")
    private DetailDemande detailDemande;

    // ✅ NOUVEAU CHAMP
    @Enumerated(EnumType.STRING)
    private TypeDemande type = TypeDemande.STANDARD;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateDerniereModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateDerniereModification = LocalDateTime.now();
    }
}