package com.workflow.dto.response;

import com.workflow.entity.StatutDemande;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DemandeResponse {
    private Long id;
    private String titre;
    private String description;
    private Long demandeurId;
    private String demandeurNom;
    private String createurNom;
    private String workflowNom;
    private StatutDemande statut;
    private LocalDateTime dateCreation;
    private Boolean userCanValidate;
    private Integer etapeCourante;
    private Integer totalEtapes;
    private DetailDemandeDto detail;
    private List<EtapeValidationDto> etapes;

    @Data
    public static class DetailDemandeDto {
        private String localisation;
        private String responsableNom;
        private String observationsGenerales;
        private Boolean mobilier;
        private Boolean carteRestaurant;
        private Boolean carteCafe;
        private Boolean parkingInterieur;
        private Boolean casier;
        private Boolean photocopiePermis;
        private String autreServicesGeneraux;
        private Boolean telephoneFixe;
        private Boolean telephoneMobile;
        private Boolean smartphoneMobile;
        private String typeLigne;
        private String autreTelephonie;
        private Boolean ordinateurBureau;
        private Boolean ordinateurPortable;
        private Boolean carteNomade;
        private Boolean connexionExterne;
        private Boolean utilisateurPvd;
        private String autreOrdinateur;
        private Boolean courrierOffice365;
        private String autreServiceIt;
        private Object accesProgrammes;
        // SUPPRESSION des trois champs d'accès dossiers serveurs
        // private String accesDossiersObservation;
        // private Boolean clauseConfidentialite;
        // private String autreAccesDossiers;
        private Boolean banqueThemis;
        private Boolean banqueHypervision;
        private Boolean banqueHelios;
        private Boolean banqueCap;
        private String autreBanque;
        private String autreBesoin;
    }

    @Data
    public static class EtapeValidationDto {
        private Integer ordre;
        private String nomValidateur;   // nom du département
        private String statut;
    }
}