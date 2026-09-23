package com.workflow.controller;

import com.workflow.dto.MessageResponse;
import com.workflow.dto.WorkflowDto;
import com.workflow.entity.Workflow;
import com.workflow.entity.WorkflowType;
import com.workflow.service.WorkflowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> getAllWorkflows(
            @RequestParam(required = false) WorkflowType type) {
        List<Workflow> workflows;
        if (type != null) {
            workflows = workflowService.getWorkflowsByType(type);
        } else {
            workflows = workflowService.getAllActiveWorkflows();
        }
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> getWorkflow(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getWorkflow(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DEPT')")
    public ResponseEntity<Workflow> createWorkflow(@RequestBody WorkflowDto workflowDto) {
        Workflow workflow = workflowService.createCustomWorkflow(
                workflowDto.getNom(),
                workflowDto.getDepartmentIds()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(workflow);
    }

    @PostMapping("/suppression")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Workflow> createSuppressionWorkflow(@RequestBody WorkflowDto workflowDto) {
        Workflow workflow = workflowService.createOrReplaceSuppressionWorkflow(
                workflowDto.getNom(),
                workflowDto.getDepartmentIds()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(workflow);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteWorkflow(@PathVariable Long id) {
        workflowService.deactivateWorkflow(id);
        return ResponseEntity.ok(new MessageResponse("Workflow désactivé"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Workflow> updateWorkflow(@PathVariable Long id, @RequestBody WorkflowDto workflowDto) {
        Workflow updated = workflowService.updateWorkflow(id, workflowDto.getNom(), workflowDto.getDepartmentIds());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/permanent/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteWorkflowPermanently(@PathVariable Long id) {
        workflowService.deleteWorkflowPermanently(id);
        return ResponseEntity.ok(new MessageResponse("Workflow supprimé définitivement"));
    }

    // ========== GESTION DU WORKFLOW PAR DÉFAUT ==========

    @PutMapping("/{id}/set-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setDefaultWorkflow(@PathVariable Long id, @RequestParam WorkflowType type) {
        Workflow workflow = workflowService.setDefaultWorkflow(id, type);
        return ResponseEntity.ok(workflow);
    }

    @GetMapping("/default")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DEPT')")
    public ResponseEntity<Workflow> getDefaultWorkflow(@RequestParam WorkflowType type) {
        Workflow workflow = workflowService.getDefaultWorkflowByType(type);
        return ResponseEntity.ok(workflow);
    }
}