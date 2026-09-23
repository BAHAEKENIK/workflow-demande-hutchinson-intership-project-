package com.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateDemandeRequest {
    @NotBlank
    private String titre;
    private String description;

    private Long demandeurId;
    private String newDemandeurNom;
    private String newDemandeurPrenom;
    private String newDemandeurEmail;

    // Plus de workflowId – sera déterminé automatiquement côté backend
    // private Long workflowId; // SUPPRIMÉ

    private List<Long> etapesSupplementairesIds;

    private DetailDemandeDto detail;

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
        // SUPPRESSION des champs d'accès dossiers serveurs
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
}