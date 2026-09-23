package com.workflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.workflow.converter.JsonConverter;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detail_demandes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailDemande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "demande_id", nullable = false, unique = true)
    @JsonIgnoreProperties("detailDemande")
    private Demande demande;

    private String localisation;
    private String responsableNom;
    private String observationsGenerales;

    // Services Généraux
    private Boolean mobilier = false;
    private Boolean carteRestaurant = false;
    private Boolean carteCafe = false;
    private Boolean parkingInterieur = false;
    private Boolean casier = false;
    private Boolean photocopiePermis = false;
    private String autreServicesGeneraux;

    // Téléphonie
    private Boolean telephoneFixe = false;
    private Boolean telephoneMobile = false;
    private Boolean smartphoneMobile = false;
    private String typeLigne;
    private String autreTelephonie;

    // Ordinateur
    private Boolean ordinateurBureau = false;
    private Boolean ordinateurPortable = false;
    private Boolean carteNomade = false;
    private Boolean connexionExterne = false;
    private Boolean utilisateurPvd = false;
    private String autreOrdinateur;

    // Courrier et Office 365
    private Boolean courrierOffice365 = false;
    private String autreServiceIt;

    // Accès programmes (JSON)
    @Convert(converter = JsonConverter.class)
    @Column(columnDefinition = "JSON")
    private Object accesProgrammes;

    // Banque en ligne
    private Boolean banqueThemis = false;
    private Boolean banqueHypervision = false;
    private Boolean banqueHelios = false;
    private Boolean banqueCap = false;
    private String autreBanque;

    // Autre besoin
    private String autreBesoin;
}