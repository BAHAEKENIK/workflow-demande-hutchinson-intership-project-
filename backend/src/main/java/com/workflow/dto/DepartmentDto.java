package com.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentDto {
    private Long id;
    @NotBlank
    private String name;
    private Long chefId;
    private String chefName;
    private boolean local = true;
    private Long secondChefId;
    private String secondChefName;
}