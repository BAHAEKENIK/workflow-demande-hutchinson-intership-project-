package com.workflow.service;

import com.workflow.entity.*;
import com.workflow.repository.WorkflowRepository;
import com.workflow.repository.DepartmentRepository;
import com.workflow.repository.EtapeValidationRepository;
import com.workflow.repository.UserRepository;
import com.workflow.repository.DemandeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final EtapeValidationRepository etapeRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final DepartmentRepository departmentRepository;
    private final DemandeRepository demandeRepository;

    public WorkflowService(
            WorkflowRepository workflowRepository,
            EtapeValidationRepository etapeRepository,
            UserRepository userRepository,
            UserService userService,
            DepartmentRepository departmentRepository,
            DemandeRepository demandeRepository
    ) {
        this.workflowRepository = workflowRepository;
        this.etapeRepository = etapeRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.departmentRepository = departmentRepository;
        this.demandeRepository = demandeRepository;
    }

    public Workflow getWorkflow(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow non trouvé"));
    }

    public List<Workflow> getAllActiveWorkflows() {
        return workflowRepository.findAllActiveNonDynamic();
    }

    public List<Workflow> getWorkflowsByType(WorkflowType type) {
        return workflowRepository.findByTypeAndActifTrue(type);
    }

    public Workflow getActiveWorkflowByType(WorkflowType type) {
        return workflowRepository.findFirstByTypeAndActifTrueOrderByIdAsc(type)
                .orElseThrow(() -> new RuntimeException("Aucun workflow actif de type " + type + " trouvé"));
    }

    @Transactional
    public Workflow createCustomWorkflow(String nom, List<Long> departmentIds) {
        Workflow workflow = new Workflow();
        workflow.setNom(nom);
        workflow.setType(WorkflowType.DEMANDE);
        workflow.setCreateur(userService.getCurrentUser());
        workflow.setActif(true);
        workflow.setDynamic(false);
        workflow.setEtapes(new ArrayList<>());
        workflow = workflowRepository.save(workflow);

        int ordre = 0;
        for (Long deptId : departmentIds) {
            Department dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new RuntimeException("Département non trouvé: " + deptId));
            EtapeValidation etape = new EtapeValidation();
            etape.setWorkflow(workflow);
            etape.setOrdre(ordre++);
            etape.setDepartment(dept);
            etape.setStatut(StatutEtape.PENDING);
            etapeRepository.save(etape);
            workflow.getEtapes().add(etape);
        }
        return workflow;
    }

    @Transactional
    public void deactivateWorkflow(Long id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow non trouvé"));

        if (workflow.getType() == WorkflowType.SUPPRESSION && workflow.getActif()) {
            throw new IllegalStateException("Impossible de désactiver le workflow SUPPRESSION actif. Veuillez d'abord en créer un nouveau.");
        }

        boolean hasPendingDemandes = demandeRepository.existsByWorkflowAndStatutNot(workflow, StatutDemande.APPROVED);
        if (hasPendingDemandes) {
            throw new IllegalStateException("Impossible de désactiver ce workflow car des demandes sont encore en cours.");
        }

        workflow.setActif(false);
        workflowRepository.save(workflow);
    }

    @Transactional
    public void deleteWorkflowPermanently(Long id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow non trouvé"));

        if (workflow.getActif()) {
            throw new IllegalStateException("Impossible de supprimer définitivement un workflow actif. Désactivez-le d'abord.");
        }

        boolean hasAnyDemande = demandeRepository.existsByWorkflow(workflow);
        if (hasAnyDemande) {
            throw new IllegalStateException("Impossible de supprimer ce workflow car des demandes (même terminées) y sont associées. La traçabilité l'exige.");
        }

        workflowRepository.delete(workflow);
    }

    @Transactional
    public Workflow updateWorkflow(Long id, String nom, List<Long> departmentIds) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow non trouvé"));

        if (workflow.getType() != WorkflowType.DEMANDE) {
            throw new IllegalArgumentException("Seuls les workflows de type DEMANDE peuvent être modifiés.");
        }

        workflow.setNom(nom);
        // Supprimer les anciennes étapes
        etapeRepository.deleteAll(workflow.getEtapes());
        workflow.getEtapes().clear();

        int ordre = 0;
        for (Long deptId : departmentIds) {
            Department dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new RuntimeException("Département non trouvé: " + deptId));
            EtapeValidation etape = new EtapeValidation();
            etape.setWorkflow(workflow);
            etape.setOrdre(ordre++);
            etape.setDepartment(dept);
            etape.setStatut(StatutEtape.PENDING);
            etapeRepository.save(etape);
            workflow.getEtapes().add(etape);
        }
        return workflowRepository.save(workflow);
    }

    @Transactional
    public Workflow createCompositeWorkflow(Workflow baseWorkflow, List<Long> etapesSupplementairesIds) {
        Workflow composite = new Workflow();
        composite.setNom("Composé: " + baseWorkflow.getNom() + " + " + (etapesSupplementairesIds != null ? etapesSupplementairesIds.size() : 0) + " suppl.");
        composite.setType(WorkflowType.DEMANDE);
        composite.setCreateur(userService.getCurrentUser());
        composite.setActif(true);
        composite.setDynamic(true);
        composite = workflowRepository.save(composite);

        int ordre = 0;
        for (EtapeValidation e : baseWorkflow.getEtapes()) {
            EtapeValidation newEtape = new EtapeValidation();
            newEtape.setWorkflow(composite);
            newEtape.setOrdre(ordre++);
            newEtape.setDepartment(e.getDepartment());
            newEtape.setStatut(StatutEtape.PENDING);
            etapeRepository.save(newEtape);
            composite.getEtapes().add(newEtape);
        }
        if (etapesSupplementairesIds != null) {
            for (Long deptId : etapesSupplementairesIds) {
                Department dept = departmentRepository.findById(deptId)
                        .orElseThrow(() -> new RuntimeException("Département supplémentaire non trouvé: " + deptId));
                EtapeValidation newEtape = new EtapeValidation();
                newEtape.setWorkflow(composite);
                newEtape.setOrdre(ordre++);
                newEtape.setDepartment(dept);
                newEtape.setStatut(StatutEtape.PENDING);
                etapeRepository.save(newEtape);
                composite.getEtapes().add(newEtape);
            }
        }
        return composite;
    }

    @Transactional
    public Workflow createOrReplaceSuppressionWorkflow(String nom, List<Long> departmentIds) {
        List<Workflow> oldActive = workflowRepository.findByTypeAndActifTrue(WorkflowType.SUPPRESSION);
        for (Workflow w : oldActive) {
            w.setActif(false);
            workflowRepository.save(w);
        }

        Workflow newWorkflow = new Workflow();
        newWorkflow.setNom(nom);
        newWorkflow.setType(WorkflowType.SUPPRESSION);
        newWorkflow.setCreateur(userService.getCurrentUser());
        newWorkflow.setActif(true);
        newWorkflow.setDynamic(false);
        newWorkflow.setEtapes(new ArrayList<>());
        newWorkflow = workflowRepository.save(newWorkflow);

        int ordre = 0;
        for (Long deptId : departmentIds) {
            Department dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new RuntimeException("Département non trouvé: " + deptId));
            EtapeValidation etape = new EtapeValidation();
            etape.setWorkflow(newWorkflow);
            etape.setOrdre(ordre++);
            etape.setDepartment(dept);
            etape.setStatut(StatutEtape.PENDING);
            etapeRepository.save(etape);
            newWorkflow.getEtapes().add(etape);
        }
        return newWorkflow;
    }

    // ========== GESTION DU WORKFLOW PAR DÉFAUT ==========

    /**
     * Définit un workflow comme étant le workflow par défaut pour son type.
     * Réinitialise le flag par défaut pour tous les autres workflows du même type.
     *
     * @param id   l'identifiant du workflow à définir comme par défaut
     * @param type le type de workflow (DEMANDE ou SUPPRESSION)
     * @return le workflow mis à jour
     */
    @Transactional
    public Workflow setDefaultWorkflow(Long id, WorkflowType type) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow non trouvé"));
        if (workflow.getType() != type) {
            throw new IllegalArgumentException("Le workflow n'appartient pas au type " + type);
        }
        // Réinitialiser le flag par défaut pour tous les workflows du même type
        workflowRepository.resetDefaultForType(type);
        workflow.setParDefaut(true);
        return workflowRepository.save(workflow);
    }

    /**
     * Récupère le workflow par défaut actif pour un type donné.
     * La requête filtre directement sur actif = true.
     *
     * @param type le type de workflow (DEMANDE ou SUPPRESSION)
     * @return le workflow actif marqué comme par défaut
     * @throws RuntimeException si aucun workflow par défaut actif n'est trouvé
     */
    public Workflow getDefaultWorkflowByType(WorkflowType type) {
        return workflowRepository.findByTypeAndParDefautTrueAndActifTrue(type)
                .orElseThrow(() -> new RuntimeException("Aucun workflow par défaut actif défini pour le type " + type));
    }
}