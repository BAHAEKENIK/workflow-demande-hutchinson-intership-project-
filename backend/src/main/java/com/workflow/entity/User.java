package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean firstLogin = true;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties("members")
    private Department department;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Champs pour réinitialisation de mot de passe
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    // ✅ Champ pour désactiver un utilisateur (soft delete)
    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}