package com.workflow.service;

import com.workflow.dto.request.CreateDemandeRequest;
import com.workflow.dto.response.DemandeResponse;
import com.workflow.entity.*;
import java.util.List;
import com.workflow.mapper.DemandeMapper;
import com.workflow.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final UserRepository userRepository;
    private final WorkflowRepository workflowRepository;
    private final DetailDemandeRepository detailDemandeRepository;
    private final UserService userService;
    private final DemandeMapper demandeMapper;
    private final EmailService emailService;
    private final HistoriqueRepository historiqueRepository;
    private final WorkflowService workflowService;
    private final NotificationService notificationService;

    public DemandeService(DemandeRepository demandeRepository,
                          UserRepository userRepository,
                          WorkflowRepository workflowRepository,
                          DetailDemandeRepository detailDemandeRepository,
                          UserService userService,
                          DemandeMapper demandeMapper,
                          EmailService emailService,
                          HistoriqueRepository historiqueRepository,
                          WorkflowService workflowService,
                          NotificationService notificationService) {
        this.demandeRepository = demandeRepository;
        this.userRepository = userRepository;
        this.workflowRepository = workflowRepository;
        this.detailDemandeRepository = detailDemandeRepository;
        this.userService = userService;
        this.demandeMapper = demandeMapper;
        this.emailService = emailService;
        this.historiqueRepository = historiqueRepository;
        this.workflowService = workflowService;
        this.notificationService = notificationService;
    }

    @Transactional
    public DemandeResponse createDemande(CreateDemandeRequest request) {
        User createur = userService.getCurrentUser();
        if (createur.getRole() != Role.ADMIN && createur.getRole() != Role.CHEF_DEPT) {
            throw new AccessDeniedException("Seul un chef de département ou ADMIN peut créer une demande");
        }

        User demandeur;
        if (request.getDemandeurId() != null) {
            demandeur = userRepository.findById(request.getDemandeurId())
                    .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
            if (createur.getRole() != Role.ADMIN && !demandeur.getDepartment().equals(createur.getDepartment())) {
                throw new AccessDeniedException("Vous ne pouvez créer une demande que pour votre département");
            }
        } else {
            String email = request.getNewDemandeurEmail();
            if (email == null || email.isBlank()) {
                String base = (request.getNewDemandeurPrenom() + "." + request.getNewDemandeurNom())
                        .toLowerCase()
                        .replaceAll("[^a-z0-9.]", "");
                email = base + "@hutchinson.com";
                int counter = 1;
                while (userRepository.existsByEmail(email)) {
                    email = base + counter++ + "@hutchinson.com";
                }
            }
            demandeur = new User();
            demandeur.setUsername(email);
            demandeur.setPassword("");
            demandeur.setEmail(email);
            demandeur.setFirstName(request.getNewDemandeurPrenom());
            demandeur.setLastName(request.getNewDemandeurNom());
            demandeur.setRole(Role.EMPLOYEE);
            demandeur.setDepartment(createur.getDepartment());
            demandeur.setFirstLogin(false);
            demandeur = userRepository.save(demandeur);
        }

        Workflow baseWorkflow = workflowService.getDefaultWorkflowByType(WorkflowType.DEMANDE);

        Workflow finalWorkflow = workflowService.createCompositeWorkflow(
                baseWorkflow,
                request.getEtapesSupplementairesIds()
        );

        Demande demande = new Demande();
        demande.setTitre(request.getTitre());
        demande.setDescription(request.getDescription());
        demande.setDemandeur(demandeur);
        demande.setCreateur(createur);
        demande.setWorkflow(finalWorkflow);
        demande.setStatut(StatutDemande.PENDING);
        demande.setEtapeCourante(0);
        demande = demandeRepository.save(demande);

        DetailDemande detail = new DetailDemande();
        detail.setDemande(demande);
        CreateDemandeRequest.DetailDemandeDto dto = request.getDetail();
        if (dto != null) {
            detail.setLocalisation(dto.getLocalisation());
            detail.setResponsableNom(dto.getResponsableNom());
            detail.setObservationsGenerales(dto.getObservationsGenerales());
            detail.setMobilier(dto.getMobilier() != null ? dto.getMobilier() : false);
            detail.setCarteRestaurant(dto.getCarteRestaurant() != null ? dto.getCarteRestaurant() : false);
            detail.setCarteCafe(dto.getCarteCafe() != null ? dto.getCarteCafe() : false);
            detail.setParkingInterieur(dto.getParkingInterieur() != null ? dto.getParkingInterieur() : false);
            detail.setCasier(dto.getCasier() != null ? dto.getCasier() : false);
            detail.setPhotocopiePermis(dto.getPhotocopiePermis() != null ? dto.getPhotocopiePermis() : false);
            detail.setAutreServicesGeneraux(dto.getAutreServicesGeneraux());
            detail.setTelephoneFixe(dto.getTelephoneFixe() != null ? dto.getTelephoneFixe() : false);
            detail.setTelephoneMobile(dto.getTelephoneMobile() != null ? dto.getTelephoneMobile() : false);
            detail.setSmartphoneMobile(dto.getSmartphoneMobile() != null ? dto.getSmartphoneMobile() : false);
            detail.setTypeLigne(dto.getTypeLigne());
            detail.setAutreTelephonie(dto.getAutreTelephonie());
            detail.setOrdinateurBureau(dto.getOrdinateurBureau() != null ? dto.getOrdinateurBureau() : false);
            detail.setOrdinateurPortable(dto.getOrdinateurPortable() != null ? dto.getOrdinateurPortable() : false);
            detail.setCarteNomade(dto.getCarteNomade() != null ? dto.getCarteNomade() : false);
            detail.setConnexionExterne(dto.getConnexionExterne() != null ? dto.getConnexionExterne() : false);
            detail.setUtilisateurPvd(dto.getUtilisateurPvd() != null ? dto.getUtilisateurPvd() : false);
            detail.setAutreOrdinateur(dto.getAutreOrdinateur());
            detail.setCourrierOffice365(dto.getCourrierOffice365() != null ? dto.getCourrierOffice365() : false);
            detail.setAutreServiceIt(dto.getAutreServiceIt());
            detail.setAccesProgrammes(dto.getAccesProgrammes());
            detail.setBanqueThemis(dto.getBanqueThemis() != null ? dto.getBanqueThemis() : false);
            detail.setBanqueHypervision(dto.getBanqueHypervision() != null ? dto.getBanqueHypervision() : false);
            detail.setBanqueHelios(dto.getBanqueHelios() != null ? dto.getBanqueHelios() : false);
            detail.setBanqueCap(dto.getBanqueCap() != null ? dto.getBanqueCap() : false);
            detail.setAutreBanque(dto.getAutreBanque());
            detail.setAutreBesoin(dto.getAutreBesoin());
        }
        detailDemandeRepository.save(detail);
        demande.setDetailDemande(detail);

        List<EtapeValidation> etapes = finalWorkflow.getEtapes();
        if (!etapes.isEmpty()) {
            EtapeValidation premiereEtape = etapes.get(0);
            Department dept = premiereEtape.getDepartment();
            if (dept != null && dept.getChef() != null) {
                try {
                    emailService.sendEmail(dept.getChef().getEmail(),
                            "Nouvelle demande à valider",
                            "Une demande \"" + demande.getTitre() + "\" a été créée et vous attend pour validation.");
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'envoi de l'email au validateur : " + e.getMessage());
                }
            }
        }

        return demandeMapper.toResponse(demande);
    }

    @Transactional
    public DemandeResponse createDeleteUserDemande(Long userId, String commentaire) {
        User createur = userService.getCurrentUser();
        // Modification : autoriser également CHEF_DEPT (la vérification RH est déjà faite dans le contrôleur)
        if (createur.getRole() != Role.ADMIN && createur.getRole() != Role.CHEF_DEPT) {
            throw new AccessDeniedException("Seul un administrateur ou le responsable RH peut demander la suppression d'un utilisateur");
        }
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Workflow deleteWorkflow = workflowRepository.findFirstByTypeAndActifTrueOrderByIdAsc(WorkflowType.SUPPRESSION)
                .orElseThrow(() -> new RuntimeException("Aucun workflow SUPPRESSION actif configuré. Veuillez contacter l'administrateur."));

        Demande demande = new Demande();
        demande.setTitre("SUPPRESSION_" + userToDelete.getUsername() + "_" + System.currentTimeMillis());
        demande.setDescription("Demande de suppression de l'utilisateur " + userToDelete.getFirstName() + " " + userToDelete.getLastName() + "\nCommentaire: " + commentaire);
        demande.setDemandeur(createur);
        demande.setCreateur(createur);
        demande.setWorkflow(deleteWorkflow);
        demande.setStatut(StatutDemande.PENDING);
        demande.setEtapeCourante(0);
        demande = demandeRepository.save(demande);

        notificationService.createNotification(
                createur,
                "Demande de suppression créée",
                "Votre demande de suppression pour " + userToDelete.getUsername() + " a été créée et est en attente de validation.",
                "/demandes/" + demande.getId()
        );

        List<EtapeValidation> etapes = deleteWorkflow.getEtapes();
        if (!etapes.isEmpty()) {
            EtapeValidation premiereEtape = etapes.get(0);
            User premierValidateur = getValidatorUser(premiereEtape);
            if (premierValidateur != null) {
                notificationService.createNotification(
                        premierValidateur,
                        "Nouvelle demande de suppression",
                        "Une demande de suppression pour " + userToDelete.getUsername() + " vous attend.",
                        "/demandes/" + demande.getId()
                );

                Department dept = premiereEtape.getDepartment();
                if (dept != null && dept.getChef() != null) {
                    try {
                        emailService.sendEmail(dept.getChef().getEmail(),
                                "Nouvelle demande de suppression à valider",
                                "Une demande de suppression pour l'utilisateur " + userToDelete.getUsername() + " a été créée et vous attend pour validation.");
                    } catch (Exception e) {
                        System.err.println("Erreur lors de l'envoi de l'email au validateur : " + e.getMessage());
                    }
                }
            }
        }

        return demandeMapper.toResponse(demande);
    }

    @Transactional
    public void createBulkDeleteUserDemandes(List<Long> userIds, String commentaire) {
        User createur = userService.getCurrentUser();
        // Modification : autoriser également CHEF_DEPT (la vérification RH est déjà faite dans le contrôleur)
        if (createur.getRole() != Role.ADMIN && createur.getRole() != Role.CHEF_DEPT) {
            throw new AccessDeniedException("Seul un administrateur ou le responsable RH peut demander des suppressions");
        }
        Workflow deleteWorkflow = workflowRepository.findFirstByTypeAndActifTrueOrderByIdAsc(WorkflowType.SUPPRESSION)
                .orElseThrow(() -> new RuntimeException("Aucun workflow SUPPRESSION actif configuré. Veuillez contacter l'administrateur."));

        List<EtapeValidation> etapes = deleteWorkflow.getEtapes();
        User premierValidateur = null;
        if (!etapes.isEmpty()) {
            premierValidateur = getValidatorUser(etapes.get(0));
        }

        for (Long userId : userIds) {
            User userToDelete = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userId));
            Demande demande = new Demande();
            demande.setTitre("SUPPRESSION_" + userToDelete.getUsername() + "_" + System.currentTimeMillis());
            demande.setDescription("Demande de suppression de " + userToDelete.getFirstName() + " " + userToDelete.getLastName() + "\nCommentaire: " + commentaire);
            demande.setDemandeur(createur);
            demande.setCreateur(createur);
            demande.setWorkflow(deleteWorkflow);
            demande.setStatut(StatutDemande.PENDING);
            demande.setEtapeCourante(0);
            demande = demandeRepository.save(demande);

            notificationService.createNotification(
                    createur,
                    "Demande de suppression créée",
                    "Votre demande de suppression pour " + userToDelete.getUsername() + " a été créée.",
                    "/demandes/" + demande.getId()
            );

            if (premierValidateur != null) {
                notificationService.createNotification(
                        premierValidateur,
                        "Nouvelle demande de suppression",
                        "Une demande de suppression pour " + userToDelete.getUsername() + " vous attend.",
                        "/demandes/" + demande.getId()
                );
            }
        }
    }

    private User getValidatorUser(EtapeValidation etape) {
        if (etape.getDepartment() != null) {
            Department dept = etape.getDepartment();
            if (dept.getChef() != null) return dept.getChef();
            if (!dept.isLocal() && dept.getSecondChef() != null) return dept.getSecondChef();
        }
        return null;
    }

    public Page<DemandeResponse> getDemandesForCurrentUser(Pageable pageable, StatutDemande statut) {
        User currentUser = userService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        Page<Demande> demandePage = demandeRepository.findDemandesForUser(
                currentUser, currentUser.getId(), isAdmin, statut, pageable);
        return demandePage.map(demandeMapper::toResponse);
    }

    private EtapeValidation getEtapeSafely(Workflow workflow, int index) {
        List<EtapeValidation> etapes = workflow.getEtapes();
        if (index >= etapes.size()) return null;
        EtapeValidation etape = etapes.get(index);
        if (etape == null || etape.getDepartment() == null) return null;
        return etape;
    }

    /**
     * Vérifie si un utilisateur est le validateur attendu pour une étape donnée.
     * Règle simplifiée :
     * - ADMIN peut tout valider.
     * - CHEF_DEPT peut valider si son département correspond à celui de l'étape.
     */
    private boolean isUserValidatorForEtape(EtapeValidation etape, User user) {
        if (etape == null || etape.getDepartment() == null) return false;
        Department dept = etape.getDepartment();
        // ADMIN peut tout valider
        if (user.getRole() == Role.ADMIN) {
            return true;
        }
        // Chef de département : son département doit correspondre à celui de l'étape
        if (user.getRole() == Role.CHEF_DEPT && user.getDepartment() != null
                && user.getDepartment().getId().equals(dept.getId())) {
            return true;
        }
        return false;
    }

    // Méthode corrigée selon la spécification : suppression du bloc excluant demandeur/créateur
    public DemandeResponse getDemandeById(Long id) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        User currentUser = userService.getCurrentUser();

        boolean canValidate = false;

        // 1. La demande doit être en attente et l'utilisateur est le validateur explicite
        if (demande.getStatut() == StatutDemande.PENDING) {
            EtapeValidation etape = getEtapeSafely(demande.getWorkflow(), demande.getEtapeCourante());
            if (isUserValidatorForEtape(etape, currentUser)) {
                canValidate = true;
            }
        }

        // 2. Un utilisateur qui a déjà agi sur cette demande ne peut pas re‑valider
        if (historiqueRepository.existsByDemandeAndUtilisateur(demande, currentUser)) {
            canValidate = false;
        }

        DemandeResponse response = demandeMapper.toResponse(demande);
        response.setUserCanValidate(canValidate);
        return response;
    }

    public Demande getDemandeEntity(Long id) {
        Demande demande = demandeRepository.findByIdWithWorkflowEtapes(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        User currentUser = userService.getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return demande;
        }
        if (demande.getDemandeur().equals(currentUser) || demande.getCreateur().equals(currentUser)) {
            return demande;
        }
        if (demande.getStatut() == StatutDemande.PENDING) {
            EtapeValidation etape = getEtapeSafely(demande.getWorkflow(), demande.getEtapeCourante());
            if (isUserValidatorForEtape(etape, currentUser)) {
                return demande;
            }
        }
        if (historiqueRepository.existsByDemandeAndUtilisateur(demande, currentUser)) {
            return demande;
        }
        throw new AccessDeniedException("Vous n'avez pas accès à cette demande");
    }

    public long countDemandesByStatut(User currentUser, boolean isAdmin, StatutDemande statut) {
        return demandeRepository.countDemandesForUser(currentUser, currentUser.getId(), isAdmin, statut);
    }

    public Page<DemandeResponse> getDemandesByUserAction(String action, StatutDemande statut, Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        System.out.println("=== getDemandesByUserAction ===");
        System.out.println("Utilisateur : " + currentUser.getUsername());
        System.out.println("Action : " + action);
        Page<Demande> demandePage = demandeRepository.findDemandesByUserAction(currentUser, action, statut, pageable);
        System.out.println("Nombre de demandes trouvées : " + demandePage.getTotalElements());
        return demandePage.map(demandeMapper::toResponse);
    }

    public DemandeResponse getLastDemandeByEmployeeId(Long employeeId) {
        User currentUser = userService.getCurrentUser();
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        boolean isAuthorized = currentUser.getRole() == Role.ADMIN ||
                (currentUser.getRole() == Role.CHEF_DEPT && currentUser.getDepartment().equals(employee.getDepartment()));
        if (!isAuthorized) {
            throw new AccessDeniedException("Accès non autorisé aux demandes de cet employé");
        }

        Demande lastDemande = demandeRepository.findTopByDemandeurOrderByDateCreationDesc(employee)
                .orElseThrow(() -> new RuntimeException("Aucune demande antérieure pour cet employé"));

        return demandeMapper.toResponse(lastDemande);
    }

    public List<Demande> getPreviousApprovedDemandesForEmployee(User employee, Long currentDemandeId) {
        return demandeRepository.findPreviousApprovedDemandesByEmployee(employee, currentDemandeId);
    }
}