// ======== Department.java ========
package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private boolean local = true;   // true = interne (T/), false = externe (Z/)

    @OneToOne
    @JoinColumn(name = "chef_id")
    @JsonIgnoreProperties({"department", "members"})
    private User chef;

    // Second chef pour les départements externes (Z/)
    @OneToOne
    @JoinColumn(name = "second_chef_id")
    @JsonIgnoreProperties({"department", "members"})
    private User secondChef;

    @OneToMany(mappedBy = "department")
    @JsonIgnoreProperties("department")
    private List<User> members = new ArrayList<>();

    // ✅ Soft delete : départements actifs uniquement
    private boolean active = true;
}