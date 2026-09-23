package com.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidationRequest {
    @NotNull
    private Long demandeId;
    @NotBlank
    private String action;   // "APPROVE" ou "REJECT"
    private String commentaire;  // obligatoire si REJECT
}