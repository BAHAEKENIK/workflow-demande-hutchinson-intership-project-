package com.workflow.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoriqueResponse {
    private String utilisateurNom;
    private String action;
    private String commentaire;
    private LocalDateTime dateAction;
    private Integer etapeIndex;
}