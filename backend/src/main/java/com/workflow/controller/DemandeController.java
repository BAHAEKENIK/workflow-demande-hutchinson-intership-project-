package com.workflow.controller;

import com.workflow.dto.request.CreateDemandeRequest;
import com.workflow.dto.request.ValidationRequest;
import com.workflow.dto.response.DemandeResponse;
import com.workflow.dto.response.HistoriqueResponse;
import com.workflow.entity.Demande;
import com.workflow.entity.EtapeValidation;
import com.workflow.entity.Historique;
import com.workflow.entity.Role;
import com.workflow.entity.StatutDemande;
import com.workflow.entity.User;
import com.workflow.repository.HistoriqueRepository;
import com.workflow.service.DemandeService;
import com.workflow.service.PdfService;
import com.workflow.service.UserService;
import com.workflow.service.ValidationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.workflow.repository.DemandeRepository;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    private final DemandeService demandeService;
    private final ValidationService validationService;
    private final HistoriqueRepository historiqueRepository;
    private final PdfService pdfService;
    private final UserService userService;
    private final DemandeRepository demandeRepository;

    public DemandeController(DemandeService demandeService,
                             ValidationService validationService,
                             HistoriqueRepository historiqueRepository,
                             PdfService pdfService,
                             UserService userService,
                             DemandeRepository demandeRepository) {
        this.demandeService = demandeService;
        this.validationService = validationService;
        this.historiqueRepository = historiqueRepository;
        this.pdfService = pdfService;
        this.userService = userService;
        this.demandeRepository = demandeRepository;
    }

    @PostMapping
    public ResponseEntity<DemandeResponse> createDemande(@Valid @RequestBody CreateDemandeRequest request) {
        DemandeResponse response = demandeService.createDemande(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<DemandeResponse>> getDemandes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) StatutDemande statut,
            @RequestParam(required = false) String myAction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreation"));
        Page<DemandeResponse> demandes;
        if (myAction != null && !myAction.isBlank()) {
            demandes = demandeService.getDemandesByUserAction(myAction, statut, pageable);
        } else {
            demandes = demandeService.getDemandesForCurrentUser(pageable, statut);
        }
        return ResponseEntity.ok(demandes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeResponse> getDemande(@PathVariable Long id) {
        return ResponseEntity.ok(demandeService.getDemandeById(id));
    }

    @PostMapping("/valider")
    public ResponseEntity<?> validerDemande(@Valid @RequestBody ValidationRequest request) {
        validationService.validerDemande(request);
        return ResponseEntity.ok(Map.of("message", "Action effectuée"));
    }

    @GetMapping("/{id}/historique")
    public ResponseEntity<List<HistoriqueResponse>> getHistorique(@PathVariable Long id) {
        Demande demande = demandeService.getDemandeEntity(id);
        List<Historique> historiques = historiqueRepository.findByDemandeOrderByDateActionAsc(demande);
        List<HistoriqueResponse> responses = historiques.stream().map(h -> {
            HistoriqueResponse r = new HistoriqueResponse();
            r.setUtilisateurNom(h.getUtilisateur().getFirstName() + " " + h.getUtilisateur().getLastName());
            r.setAction(h.getAction());
            r.setCommentaire(h.getCommentaire());
            r.setDateAction(h.getDateAction());
            r.setEtapeIndex(h.getEtapeIndex());
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id,
                                            @RequestParam(required = false) Boolean full,
                                            @RequestParam(required = false, defaultValue = "fr") String lang) {
        System.out.println("Langue reçue pour le PDF : " + lang);
        Demande demande = demandeService.getDemandeEntity(id);
        User currentUser = userService.getCurrentUser();
        boolean isDemandeur = demande.getDemandeur().equals(currentUser);
        boolean fullExport = (full != null && full) || isDemandeur;
        byte[] pdfBytes = fullExport ? pdfService.generateFullPdf(demande, lang) : pdfService.generatePartialPdf(demande, lang);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "demande_" + id + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/{id}/diagramme")
    public ResponseEntity<Map<String, Object>> getWorkflowDiagram(@PathVariable Long id) {
        Demande demande = demandeService.getDemandeEntity(id);
        List<EtapeValidation> etapes = demande.getWorkflow().getEtapes();
        List<Historique> historiques = historiqueRepository.findByDemandeOrderByDateActionAsc(demande);
        Map<String, Object> result = new HashMap<>();
        result.put("statutGlobal", demande.getStatut());
        result.put("etapeCourante", demande.getEtapeCourante());
        List<Map<String, Object>> steps = new ArrayList<>();
        for (int i = 0; i < etapes.size(); i++) {
            EtapeValidation e = etapes.get(i);
            Map<String, Object> step = new HashMap<>();
            step.put("ordre", i + 1);
            String validateurName = "N/A";
            if (e.getDepartment() != null) {
                validateurName = e.getDepartment().getName();
            }
            step.put("nomValidateur", validateurName);
            step.put("statut", e.getStatut().name());
            for (Historique h : historiques) {
                if (h.getEtapeIndex() != null && h.getEtapeIndex() == i) {
                    step.put("action", h.getAction());
                    step.put("commentaire", h.getCommentaire());
                    break;
                }
            }
            steps.add(step);
        }
        result.put("etapes", steps);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDto> getStats() {
        User currentUser = userService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        long pending = demandeService.countDemandesByStatut(currentUser, isAdmin, StatutDemande.PENDING);
        long approved = demandeService.countDemandesByStatut(currentUser, isAdmin, StatutDemande.APPROVED);
        long rejected = demandeService.countDemandesByStatut(currentUser, isAdmin, StatutDemande.REJECTED);
        return ResponseEntity.ok(new StatsDto(pending, approved, rejected));
    }

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Long>> getMyActionStats() {
        User currentUser = userService.getCurrentUser();
        long approvedCount = demandeRepository.findDemandesByUserAction(currentUser, "APPROVE", null, Pageable.unpaged()).getTotalElements();
        long rejectedCount = demandeRepository.findDemandesByUserAction(currentUser, "REJECT", null, Pageable.unpaged()).getTotalElements();
        Map<String, Long> stats = new HashMap<>();
        stats.put("approved", approvedCount);
        stats.put("rejected", rejectedCount);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Long>> getMyStats() {
        User current = userService.getCurrentUser();
        long approved = historiqueRepository.countByUtilisateurAndAction(current, "APPROVE");
        long rejected = historiqueRepository.countByUtilisateurAndAction(current, "REJECT");
        Map<String, Long> stats = new HashMap<>();
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/employee/{employeeId}/last")
    public ResponseEntity<DemandeResponse> getLastDemandeByEmployeeId(@PathVariable Long employeeId) {
        DemandeResponse response = demandeService.getLastDemandeByEmployeeId(employeeId);
        return ResponseEntity.ok(response);
    }

    public record StatsDto(long pending, long approved, long rejected) {}
}