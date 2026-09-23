package com.workflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileUpdateDto {
    private String firstName;
    private String lastName;
    @Email @NotBlank
    private String email;
}