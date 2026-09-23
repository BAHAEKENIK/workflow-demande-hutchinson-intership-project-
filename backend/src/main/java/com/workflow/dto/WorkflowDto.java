package com.workflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkflowDto {
    private Long id;
    private String nom;
    private String type;
    private List<Long> departmentIds;   // utilisé pour tous les workflows (DEMANDE et SUPPRESSION)
}