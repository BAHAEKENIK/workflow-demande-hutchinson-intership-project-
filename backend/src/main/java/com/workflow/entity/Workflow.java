package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workflow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    // Remplacement de TypeWorkflow par WorkflowType
    @Enumerated(EnumType.STRING)
    private WorkflowType type;

    @ManyToOne
    @JoinColumn(name = "createur_id")
    @JsonIgnoreProperties({"workflows", "etapes"})
    private User createur;
    
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<EtapeValidation> etapes = new ArrayList<>();

    private Boolean actif = true;

    @Column(nullable = false)
    private boolean dynamic = false;

    @Column(nullable = false)
    private boolean parDefaut = false;
}