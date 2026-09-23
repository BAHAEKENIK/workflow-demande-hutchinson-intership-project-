package com.workflow.config;

import com.workflow.entity.*;
import com.workflow.repository.DepartmentRepository;
import com.workflow.repository.EtapeValidationRepository;
import com.workflow.repository.UserRepository;
import com.workflow.repository.WorkflowRepository;
import com.workflow.service.WorkflowService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          DepartmentRepository departmentRepository,
                                          PasswordEncoder passwordEncoder,
                                          WorkflowRepository workflowRepository,
                                          WorkflowService workflowService,
                                          EtapeValidationRepository etapeValidationRepository) {
        return args -> {
            // 1. Créer département IT s'il n'existe pas
            Department itDepartment = departmentRepository.findByName("IT")
                    .orElseGet(() -> {
                        Department dept = new Department();
                        dept.setName("IT");
                        return departmentRepository.save(dept);
                    });

            // 2. Créer utilisateur ADMIN s'il n'existe pas
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@workflow.local");
                admin.setFirstName("Admin");
                admin.setLastName("IT");
                admin.setRole(Role.ADMIN);
                admin.setDepartment(itDepartment);
                admin.setFirstLogin(true);
                userRepository.save(admin);
                System.out.println("✅ Utilisateur ADMIN créé avec succès (login: admin / admin123)");
            } else {
                System.out.println("⚠️ Utilisateur ADMIN existe déjà");
            }

            // 3. Lier le chef du département IT à l'admin (si ce n'est pas déjà fait)
            if (itDepartment.getChef() == null) {
                User admin = userRepository.findByUsername("admin").orElse(null);
                if (admin != null) {
                    itDepartment.setChef(admin);
                    departmentRepository.save(itDepartment);
                    System.out.println("✅ Département IT lié à l'admin");
                }
            }

            // 4. Créer ou mettre à jour le workflow DEMANDE (actif)
            Optional<Workflow> existingDemandeWorkflow = workflowRepository.findFirstByTypeAndActifTrueOrderByIdAsc(WorkflowType.DEMANDE);
            if (existingDemandeWorkflow.isEmpty()) {
                workflowRepository.findByTypeAndActifTrue(WorkflowType.DEMANDE)
                        .forEach(wf -> { wf.setActif(false); workflowRepository.save(wf); });

                Workflow demandeWorkflow = new Workflow();
                demandeWorkflow.setNom("Workflow standard - Validation par IT");
                demandeWorkflow.setType(WorkflowType.DEMANDE);
                demandeWorkflow.setActif(true);
                demandeWorkflow.setDynamic(false);
                User admin = userRepository.findByUsername("admin").orElse(null);
                demandeWorkflow.setCreateur(admin);
                demandeWorkflow = workflowRepository.save(demandeWorkflow);

                EtapeValidation etape = new EtapeValidation();
                etape.setWorkflow(demandeWorkflow);
                etape.setOrdre(0);
                etape.setDepartment(itDepartment);
                etape.setStatut(StatutEtape.PENDING);
                etapeValidationRepository.save(etape);
                demandeWorkflow.getEtapes().add(etape);
                workflowRepository.save(demandeWorkflow);

                System.out.println("✅ Workflow DEMANDE actif créé (ID=" + demandeWorkflow.getId() + ")");
            } else {
                System.out.println("⚠️ Un workflow DEMANDE actif existe déjà (ID=" + existingDemandeWorkflow.get().getId() + ")");
            }

            // 5. Créer ou mettre à jour le workflow SUPPRESSION (actif)
            // Récupérer ou créer le département RH
            Department rhDepartment = departmentRepository.findByName("RH")
                    .orElseGet(() -> {
                        Department dept = new Department();
                        dept.setName("RH");
                        dept.setLocal(true);
                        return departmentRepository.save(dept);
                    });

            // ✅ CRÉER UN UTILISATEUR RH ET L’ASSIGNER COMME CHEF DU DÉPARTEMENT RH
            User rhUser = userRepository.findByUsername("rh").orElse(null);
            if (rhUser == null) {
                rhUser = new User();
                rhUser.setUsername("rh");
                rhUser.setPassword(passwordEncoder.encode("rh123"));
                rhUser.setEmail("rh@hutchinson.com");
                rhUser.setFirstName("Responsable");
                rhUser.setLastName("RH");
                rhUser.setRole(Role.CHEF_DEPT);
                rhUser.setDepartment(rhDepartment);
                rhUser.setFirstLogin(true);
                rhUser = userRepository.save(rhUser);
                System.out.println("✅ Utilisateur RH créé (login: rh / rh123)");
            }
            if (rhDepartment.getChef() == null) {
                rhDepartment.setChef(rhUser);
                departmentRepository.save(rhDepartment);
                System.out.println("✅ Chef du département RH assigné à l'utilisateur rh");
            }

            Optional<Workflow> existingDeleteWorkflow = workflowRepository.findFirstByTypeAndActifTrueOrderByIdAsc(WorkflowType.SUPPRESSION);
            if (existingDeleteWorkflow.isEmpty()) {
                workflowRepository.findByTypeAndActifTrue(WorkflowType.SUPPRESSION)
                        .forEach(wf -> { wf.setActif(false); workflowRepository.save(wf); });

                Workflow deleteWorkflow = new Workflow();
                deleteWorkflow.setNom("Workflow suppression utilisateur");
                deleteWorkflow.setType(WorkflowType.SUPPRESSION);
                deleteWorkflow.setActif(true);
                deleteWorkflow.setDynamic(false);
                User adminUser = userRepository.findByUsername("admin").orElse(null);
                deleteWorkflow.setCreateur(adminUser);
                deleteWorkflow = workflowRepository.save(deleteWorkflow);

                EtapeValidation etape = new EtapeValidation();
                etape.setWorkflow(deleteWorkflow);
                etape.setOrdre(0);
                etape.setDepartment(rhDepartment);
                etape.setStatut(StatutEtape.PENDING);
                etapeValidationRepository.save(etape);
                deleteWorkflow.getEtapes().add(etape);
                workflowRepository.save(deleteWorkflow);

                System.out.println("✅ Workflow SUPPRESSION actif créé (ID=" + deleteWorkflow.getId() + ")");
            } else {
                System.out.println("⚠️ Un workflow SUPPRESSION actif existe déjà (ID=" + existingDeleteWorkflow.get().getId() + ")");
            }
        };
    }
}