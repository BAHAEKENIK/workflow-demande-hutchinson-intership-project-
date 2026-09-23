package com.workflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    @NotBlank
    private String username;
    @Email @NotBlank
    private String email;
    private String firstName;
    private String lastName;
    private String displayRole;
    @NotBlank
    private String role; // ADMIN, CHEF_DEPT, DIRECTEUR
    private Long departmentId;
    private String departmentName;
    private boolean firstLogin;
    private boolean active;   // ✅ AJOUTÉ
}