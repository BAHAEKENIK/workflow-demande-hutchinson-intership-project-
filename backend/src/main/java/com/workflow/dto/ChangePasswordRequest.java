package com.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String oldPassword;   // facultatif si firstLogin=true
    @NotBlank
    private String newPassword;
}