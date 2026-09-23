package com.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteUserRequest {
    @NotBlank
    private String commentaire;
}