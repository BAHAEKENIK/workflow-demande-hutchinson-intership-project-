package com.workflow.mapper;

import com.workflow.dto.response.DemandeResponse;
import com.workflow.entity.*;
import org.springframework.stereotype.Component;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class DemandeMapper {

    public DemandeResponse toResponse(Demande demande) {

        DemandeResponse response = new DemandeResponse();

        response.setId(demande.getId());
        response.setTitre(demande.getTitre());
        response.setDescription(demande.getDescription());

        response.setDemandeurId(demande.getDemandeur().getId());
        response.setDemandeurNom(
                demande.getDemandeur().getFirstName() + " " +
                demande.getDemandeur().getLastName()
        );

        response.setCreateurNom(
                demande.getCreateur().getFirstName() + " " +
                demande.getCreateur().getLastName()
        );

        response.setWorkflowNom(demande.getWorkflow().getNom());
        response.setStatut(demande.getStatut());
        response.setDateCreation(demande.getDateCreation());
        response.setEtapeCourante(demande.getEtapeCourante());
        response.setTotalEtapes(demande.getWorkflow().getEtapes().size());

        // ✅ DetailDemande
        if (demande.getDetailDemande() != null) {

            DetailDemande detail = demande.getDetailDemande();
            DemandeResponse.DetailDemandeDto detailDto = new DemandeResponse.DetailDemandeDto();

            detailDto.setLocalisation(detail.getLocalisation());
            detailDto.setResponsableNom(detail.getResponsableNom());
            detailDto.setObservationsGenerales(detail.getObservationsGenerales());
            detailDto.setMobilier(detail.getMobilier());
            detailDto.setCarteRestaurant(detail.getCarteRestaurant());
            detailDto.setCarteCafe(detail.getCarteCafe());
            detailDto.setParkingInterieur(detail.getParkingInterieur());
            detailDto.setCasier(detail.getCasier());
            detailDto.setPhotocopiePermis(detail.getPhotocopiePermis());
            detailDto.setAutreServicesGeneraux(detail.getAutreServicesGeneraux());
            detailDto.setTelephoneFixe(detail.getTelephoneFixe());
            detailDto.setTelephoneMobile(detail.getTelephoneMobile());
            detailDto.setSmartphoneMobile(detail.getSmartphoneMobile());
            detailDto.setTypeLigne(detail.getTypeLigne());
            detailDto.setAutreTelephonie(detail.getAutreTelephonie());
            detailDto.setOrdinateurBureau(detail.getOrdinateurBureau());
            detailDto.setOrdinateurPortable(detail.getOrdinateurPortable());
            detailDto.setCarteNomade(detail.getCarteNomade());
            detailDto.setConnexionExterne(detail.getConnexionExterne());
            detailDto.setUtilisateurPvd(detail.getUtilisateurPvd());
            detailDto.setAutreOrdinateur(detail.getAutreOrdinateur());
            detailDto.setCourrierOffice365(detail.getCourrierOffice365());
            detailDto.setAutreServiceIt(detail.getAutreServiceIt());
            detailDto.setAccesProgrammes(detail.getAccesProgrammes());
            // ✅ Suppression des trois champs d'accès dossiers serveurs
            // detailDto.setAccesDossiersObservation(detail.getAccesDossiersObservation());
            // detailDto.setClauseConfidentialite(detail.getClauseConfidentialite());
            // detailDto.setAutreAccesDossiers(detail.getAutreAccesDossiers());
            detailDto.setBanqueThemis(detail.getBanqueThemis());
            detailDto.setBanqueHypervision(detail.getBanqueHypervision());
            detailDto.setBanqueHelios(detail.getBanqueHelios());
            detailDto.setBanqueCap(detail.getBanqueCap());
            detailDto.setAutreBanque(detail.getAutreBanque());
            detailDto.setAutreBesoin(detail.getAutreBesoin());

            response.setDetail(detailDto);
        }

        // ✅ Mapper étapes avec filtrage des nulls
        response.setEtapes(
            demande.getWorkflow().getEtapes().stream()
                .filter(Objects::nonNull)
                .map(etape -> {
                    DemandeResponse.EtapeValidationDto etapeDto = new DemandeResponse.EtapeValidationDto();
                    etapeDto.setOrdre(etape.getOrdre());
                    etapeDto.setNomValidateur(etape.getDepartment() != null ? etape.getDepartment().getName() : "N/A");
                    etapeDto.setStatut(etape.getStatut().name());
                    return etapeDto;
                }).collect(Collectors.toList())
        );

        return response;
    }
}