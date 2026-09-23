package com.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historiques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Historique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    private String action;   // "APPROVE", "REJECT", "CREATE", "CANCEL"

    private String commentaire;

    private LocalDateTime dateAction;

    private Integer etapeIndex;  // quelle étape a été traitée (si applicable)

    @PrePersist
    protected void onCreate() {
        dateAction = LocalDateTime.now();
    }
    
}