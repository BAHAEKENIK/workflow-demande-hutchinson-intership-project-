package com.workflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoriqueDto {
    private LocalDateTime dateAction;
    private String action;
    private String commentaire;
    private Long demandeId;
    private String demandeTitre;
}