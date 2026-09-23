package com.workflow.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.workflow.entity.*;
import com.workflow.repository.HistoriqueRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter HEADER_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FILENAME_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Couleurs
    private static final Color PRIMARY_BLUE = new Color(41, 98, 255);
    private static final Color PRIMARY_BLUE_LIGHT = new Color(230, 238, 255);
    private static final Color SUCCESS_GREEN = new Color(34, 139, 34);
    private static final Color DANGER_RED = new Color(220, 53, 69);
    private static final Color WARNING_AMBER = new Color(255, 193, 7);
    private static final Color HEADER_BG = new Color(240, 242, 245);
    private static final Color BORDER_COLOR = new Color(200, 200, 200);
    private static final Color TEXT_DARK = new Color(33, 37, 41);
    private static final Color TEXT_MUTED = new Color(108, 117, 125);
    private static final Color ALTERNATE_ROW = new Color(248, 249, 250);
    private static final Color SECTION_BOX_BG = new Color(245, 247, 252);
    private static final Color REJECT_ROW_BG = new Color(255, 240, 240);
    private static final Color PENDING_ROW_BG = new Color(255, 252, 235);
    private static final Color DARK_BORDER = new Color(160, 170, 185);

    private final HistoriqueRepository historiqueRepository;

    // Dictionnaires de traductions
    private static final Map<String, Map<String, String>> TRANSLATIONS = new HashMap<>();

    static {
        // Français
        Map<String, String> fr = new HashMap<>();
        fr.put("title_request", "Demande de Besoin");
        fr.put("title_suppression", "Demande de suppression d'utilisateur");
        fr.put("general_info", "Informations générales");
        fr.put("request_number", "N° Demande");
        fr.put("title_label", "Titre");
        fr.put("description_label", "Description");
        fr.put("requester", "Demandeur");
        fr.put("creator", "Créateur");
        fr.put("creation_date", "Date de création");
        fr.put("global_status", "Statut global");
        fr.put("deleted_user", "Utilisateur supprimé");
        fr.put("full_name", "Nom complet");
        fr.put("username", "Nom d'utilisateur");
        fr.put("email", "Email");
        fr.put("role", "Rôle");
        fr.put("department", "Département");
        fr.put("details", "Détails de la demande");
        fr.put("location_responsible", "Localisation & Responsable");
        fr.put("location", "Localisation");
        fr.put("responsible", "Responsable");
        fr.put("observations", "Observations");
        fr.put("general_services", "Services généraux");
        fr.put("furniture", "Mobilier");
        fr.put("meal_voucher", "Carte restaurant");
        fr.put("coffee_card", "Carte café");
        fr.put("indoor_parking", "Parking intérieur");
        fr.put("locker", "Casier");
        fr.put("copy_permit", "Photocopie / permis");
        fr.put("other_services", "Autres services généraux");
        fr.put("telephony", "Téléphonie");
        fr.put("landline", "Téléphone fixe");
        fr.put("mobile_phone", "Téléphone mobile");
        fr.put("smartphone", "Smartphone mobile");
        fr.put("line_type", "Type de ligne");
        fr.put("other_telephony", "Autre téléphonie");
        fr.put("computer", "Ordinateur & Connexion");
        fr.put("desktop", "Ordinateur bureau");
        fr.put("laptop", "Ordinateur portable");
        fr.put("nomad_card", "Carte nomade");
        fr.put("external_connection", "Connexion externe");
        fr.put("pvd_user", "Utilisateur PVD");
        fr.put("other_computer", "Autre ordinateur");
        fr.put("it_services", "Services IT");
        fr.put("office365", "Courrier Office 365");
        fr.put("other_it", "Autre service IT");
        fr.put("banks", "Banques");
        fr.put("themis", "Banque Themis");
        fr.put("hypervision", "Banque Hypervision");
        fr.put("helios", "Banque Helios");
        fr.put("cap", "Banque Cap");
        fr.put("other_bank", "Autre banque");
        fr.put("other_need", "Autre besoin");
        fr.put("workflow_validation", "Parcours de validation");
        fr.put("workflow", "Workflow");
        fr.put("step", "Étape");
        fr.put("department_label", "Département");
        fr.put("validator", "Validateur");
        fr.put("status", "Statut");
        fr.put("action_comment", "Action / Commentaire");
        fr.put("approved", "APPROUVÉE");
        fr.put("rejected", "REJETÉE");
        fr.put("pending", "EN ATTENTE");
        fr.put("final_approved", "✓ DEMANDE APPROUVÉE DÉFINITIVEMENT");
        fr.put("final_rejected", "✕ DEMANDE REJETÉE DÉFINITIVEMENT");
        fr.put("footer", "Document généré automatiquement — ");
        fr.put("yes", "Oui");
        fr.put("no", "Non");
        fr.put("none", "Aucun");
        fr.put("not_assigned", "Non assigné");
        fr.put("not_defined", "Non défini");
        TRANSLATIONS.put("fr", fr);

        // Anglais
        Map<String, String> en = new HashMap<>();
        en.put("title_request", "Request Form");
        en.put("title_suppression", "User Deletion Request");
        en.put("general_info", "General Information");
        en.put("request_number", "Request No.");
        en.put("title_label", "Title");
        en.put("description_label", "Description");
        en.put("requester", "Requester");
        en.put("creator", "Creator");
        en.put("creation_date", "Creation Date");
        en.put("global_status", "Global Status");
        en.put("deleted_user", "Deleted User");
        en.put("full_name", "Full Name");
        en.put("username", "Username");
        en.put("email", "Email");
        en.put("role", "Role");
        en.put("department", "Department");
        en.put("details", "Request Details");
        en.put("location_responsible", "Location & Responsible");
        en.put("location", "Location");
        en.put("responsible", "Responsible");
        en.put("observations", "Observations");
        en.put("general_services", "General Services");
        en.put("furniture", "Furniture");
        en.put("meal_voucher", "Meal voucher");
        en.put("coffee_card", "Coffee card");
        en.put("indoor_parking", "Indoor parking");
        en.put("locker", "Locker");
        en.put("copy_permit", "Copy / permit");
        en.put("other_services", "Other general services");
        en.put("telephony", "Telephony");
        en.put("landline", "Landline");
        en.put("mobile_phone", "Mobile phone");
        en.put("smartphone", "Smartphone");
        en.put("line_type", "Line type");
        en.put("other_telephony", "Other telephony");
        en.put("computer", "Computer & Connection");
        en.put("desktop", "Desktop computer");
        en.put("laptop", "Laptop");
        en.put("nomad_card", "Nomad card");
        en.put("external_connection", "External connection");
        en.put("pvd_user", "PVD user");
        en.put("other_computer", "Other computer");
        en.put("it_services", "IT Services");
        en.put("office365", "Office 365 mail");
        en.put("other_it", "Other IT service");
        en.put("banks", "Banks");
        en.put("themis", "Themis bank");
        en.put("hypervision", "Hypervision bank");
        en.put("helios", "Helios bank");
        en.put("cap", "Cap bank");
        en.put("other_bank", "Other bank");
        en.put("other_need", "Other need");
        en.put("workflow_validation", "Validation Process");
        en.put("workflow", "Workflow");
        en.put("step", "Step");
        en.put("department_label", "Department");
        en.put("validator", "Validator");
        en.put("status", "Status");
        en.put("action_comment", "Action / Comment");
        en.put("approved", "APPROVED");
        en.put("rejected", "REJECTED");
        en.put("pending", "PENDING");
        en.put("final_approved", "✓ REQUEST FINALLY APPROVED");
        en.put("final_rejected", "✕ REQUEST FINALLY REJECTED");
        en.put("footer", "Automatically generated document — ");
        en.put("yes", "Yes");
        en.put("no", "No");
        en.put("none", "None");
        en.put("not_assigned", "Not assigned");
        en.put("not_defined", "Not defined");
        TRANSLATIONS.put("en", en);

        // Espagnol
        Map<String, String> es = new HashMap<>();
        es.put("title_request", "Solicitud de Necesidad");
        es.put("title_suppression", "Solicitud de eliminación de usuario");
        es.put("general_info", "Información general");
        es.put("request_number", "N° Solicitud");
        es.put("title_label", "Título");
        es.put("description_label", "Descripción");
        es.put("requester", "Solicitante");
        es.put("creator", "Creador");
        es.put("creation_date", "Fecha de creación");
        es.put("global_status", "Estado global");
        es.put("deleted_user", "Usuario eliminado");
        es.put("full_name", "Nombre completo");
        es.put("username", "Nombre de usuario");
        es.put("email", "Correo electrónico");
        es.put("role", "Rol");
        es.put("department", "Departamento");
        es.put("details", "Detalles de la solicitud");
        es.put("location_responsible", "Ubicación y responsable");
        es.put("location", "Ubicación");
        es.put("responsible", "Responsable");
        es.put("observations", "Observaciones");
        es.put("general_services", "Servicios generales");
        es.put("furniture", "Mobiliario");
        es.put("meal_voucher", "Ticket restaurante");
        es.put("coffee_card", "Tarjeta café");
        es.put("indoor_parking", "Aparcamiento interior");
        es.put("locker", "Taquilla");
        es.put("copy_permit", "Fotocopia / permiso");
        es.put("other_services", "Otros servicios generales");
        es.put("telephony", "Telefonía");
        es.put("landline", "Teléfono fijo");
        es.put("mobile_phone", "Teléfono móvil");
        es.put("smartphone", "Smartphone");
        es.put("line_type", "Tipo de línea");
        es.put("other_telephony", "Otra telefonía");
        es.put("computer", "Ordenador y conexión");
        es.put("desktop", "Ordenador de sobremesa");
        es.put("laptop", "Portátil");
        es.put("nomad_card", "Tarjeta nómada");
        es.put("external_connection", "Conexión externa");
        es.put("pvd_user", "Usuario PVD");
        es.put("other_computer", "Otro ordenador");
        es.put("it_services", "Servicios TI");
        es.put("office365", "Correo Office 365");
        es.put("other_it", "Otro servicio TI");
        es.put("banks", "Bancos");
        es.put("themis", "Banco Themis");
        es.put("hypervision", "Banco Hypervision");
        es.put("helios", "Banco Helios");
        es.put("cap", "Banco Cap");
        es.put("other_bank", "Otro banco");
        es.put("other_need", "Otra necesidad");
        es.put("workflow_validation", "Recorrido de validación");
        es.put("workflow", "Flujo");
        es.put("step", "Paso");
        es.put("department_label", "Departamento");
        es.put("validator", "Validador");
        es.put("status", "Estado");
        es.put("action_comment", "Acción / Comentario");
        es.put("approved", "APROBADA");
        es.put("rejected", "RECHAZADA");
        es.put("pending", "PENDIENTE");
        es.put("final_approved", "✓ SOLICITUD APROBADA DEFINITIVAMENTE");
        es.put("final_rejected", "✕ SOLICITUD RECHAZADA DEFINITIVAMENTE");
        es.put("footer", "Documento generado automáticamente — ");
        es.put("yes", "Sí");
        es.put("no", "No");
        es.put("none", "Ninguno");
        es.put("not_assigned", "No asignado");
        es.put("not_defined", "No definido");
        TRANSLATIONS.put("es", es);
    }

    public PdfService(HistoriqueRepository historiqueRepository) {
        this.historiqueRepository = historiqueRepository;
    }

    public byte[] generateFullPdf(Demande demande, String lang) {
        return generatePdf(demande, true, null, lang);
    }

    public byte[] generatePartialPdf(Demande demande, String lang) {
        return generatePdf(demande, false, null, lang);
    }

    public byte[] generateSuppressionPdf(Demande demande, Map<String, String> userInfo, String lang) {
        return generatePdf(demande, true, userInfo, lang);
    }

    // ========== NOUVELLE MÉTHODE AVEC HISTORIQUE ==========
    public byte[] generateFullPdfWithHistory(Demande currentDemande,
                                             List<Demande> previousDemandes,
                                             String lang) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 48, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            boolean isSuppression = currentDemande.getTitre().startsWith("SUPPRESSION_");
            addHeader(document, currentDemande, isSuppression, lang);
            addGeneralInfo(document, currentDemande, isSuppression, null, lang);
            addDetails(document, currentDemande.getDetailDemande(), lang);
            
            // Ajouter la section historique si des demandes antérieures existent
            if (previousDemandes != null && !previousDemandes.isEmpty()) {
                addHistorySection(document, previousDemandes, lang);
            }
            
            addWorkflowTable(document, currentDemande, true, lang);
            addFinalStatus(document, currentDemande.getStatut(), lang);
            addFooter(document, lang);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF avec historique", e);
        }
    }

    // ========== MÉTHODE PRIVÉE POUR LA SECTION HISTORIQUE ==========
    private void addHistorySection(Document doc, List<Demande> previousDemandes, String lang) throws DocumentException {
        addSectionTitle(doc, "📜 Historique des besoins précédents");
        
        for (Demande old : previousDemandes) {
            addSubSectionTitle(doc, "Demande n°" + old.getId() + " du " + formatDate(old.getDateCreation()));
            DetailDemande detail = old.getDetailDemande();
            if (detail != null) {
                PdfPTable table = createInfoTable();
                addInfoRow(table, translate("furniture", lang), bool(detail.getMobilier(), lang));
                addInfoRow(table, translate("meal_voucher", lang), bool(detail.getCarteRestaurant(), lang));
                addInfoRow(table, translate("coffee_card", lang), bool(detail.getCarteCafe(), lang));
                addInfoRow(table, translate("indoor_parking", lang), bool(detail.getParkingInterieur(), lang));
                addInfoRow(table, translate("locker", lang), bool(detail.getCasier(), lang));
                addInfoRow(table, translate("copy_permit", lang), bool(detail.getPhotocopiePermis(), lang));
                addInfoRow(table, translate("other_services", lang), detail.getAutreServicesGeneraux());
                addInfoRow(table, translate("landline", lang), bool(detail.getTelephoneFixe(), lang));
                addInfoRow(table, translate("mobile_phone", lang), bool(detail.getTelephoneMobile(), lang));
                addInfoRow(table, translate("smartphone", lang), bool(detail.getSmartphoneMobile(), lang));
                addInfoRow(table, translate("desktop", lang), bool(detail.getOrdinateurBureau(), lang));
                addInfoRow(table, translate("laptop", lang), bool(detail.getOrdinateurPortable(), lang));
                addInfoRow(table, translate("office365", lang), bool(detail.getCourrierOffice365(), lang));
                addInfoRow(table, translate("themis", lang), bool(detail.getBanqueThemis(), lang));
                addInfoRow(table, translate("hypervision", lang), bool(detail.getBanqueHypervision(), lang));
                addInfoRow(table, translate("helios", lang), bool(detail.getBanqueHelios(), lang));
                addInfoRow(table, translate("cap", lang), bool(detail.getBanqueCap(), lang));
                doc.add(table);
            }
            doc.add(new Paragraph(" "));
        }
    }

    public String generateFilename(Demande demande) {
        String creator = sanitizeFilenamePart(fullName(demande.getCreateur()));
        String requester = sanitizeFilenamePart(fullName(demande.getDemandeur()));
        String date = demande.getDateCreation() != null
                ? demande.getDateCreation().format(FILENAME_DATE_FORMAT)
                : LocalDateTime.now().format(FILENAME_DATE_FORMAT);
        return String.format("%s--demande-%s--%s.pdf", creator, requester, date);
    }

    private String sanitizeFilenamePart(String name) {
        if (name == null || name.isBlank()) return "inconnu";
        return name.replaceAll("[^a-zA-Z0-9\\-_.]", "").trim();
    }

    private byte[] generatePdf(Demande demande, boolean full, Map<String, String> userInfo, String lang) {
        System.out.println("Génération PDF avec langue : " + lang);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 48, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            boolean isSuppression = demande.getTitre().startsWith("SUPPRESSION_");
            addHeader(document, demande, isSuppression, lang);
            addGeneralInfo(document, demande, isSuppression, userInfo, lang);
            addDetails(document, demande.getDetailDemande(), lang);
            addWorkflowTable(document, demande, full, lang);
            addFinalStatus(document, demande.getStatut(), lang);
            addFooter(document, lang);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    private String translate(String key, String lang) {
        Map<String, String> dict = TRANSLATIONS.getOrDefault(lang, TRANSLATIONS.get("fr"));
        String result = dict.getOrDefault(key, key);
        System.out.println("Langue utilisée pour traduction : " + lang + ", clé : " + key + " → " + result);
        return result;
    }

    private void addHeader(Document doc, Demande demande, boolean isSuppression, String lang) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1f, 3f, 1f});
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        Image logo = loadLogo();
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        if (logo != null) logoCell.addElement(logo);
        else logoCell.addElement(new Paragraph(" "));
        headerTable.addCell(logoCell);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_BLUE);
        String titleText = isSuppression ? translate("title_suppression", lang) : translate("title_request", lang);
        Paragraph titlePara = new Paragraph(titleText, titleFont);
        PdfPCell titleCell = new PdfPCell(titlePara);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(titleCell);

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_MUTED);
        String dateStr = LocalDateTime.now().format(HEADER_DATE_FORMAT);
        Paragraph datePara = new Paragraph(dateStr, dateFont);
        PdfPCell dateCell = new PdfPCell(datePara);
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        dateCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(dateCell);

        doc.add(headerTable);
        doc.add(createThickSeparator(PRIMARY_BLUE));
        doc.add(new Paragraph(" "));
    }

    private Image loadLogo() {
        try (InputStream is = getClass().getResourceAsStream("/logo.png")) {
            if (is != null) {
                Image logo = Image.getInstance(is.readAllBytes());
                logo.scaleToFit(80, 60);
                return logo;
            }
        } catch (Exception e) {
            System.err.println("Logo not found: " + e.getMessage());
        }
        return null;
    }

    private void addGeneralInfo(Document doc, Demande demande, boolean isSuppression, Map<String, String> userInfo, String lang) throws DocumentException {
        addSectionTitle(doc, translate("general_info", lang));

        PdfPTable table = createInfoTable();

        addInfoRow(table, translate("request_number", lang), String.valueOf(demande.getId()));
        addInfoRow(table, translate("title_label", lang), demande.getTitre());
        addInfoRow(table, translate("description_label", lang), safe(demande.getDescription()));
        addInfoRow(table, translate("requester", lang), fullName(demande.getDemandeur()));
        addInfoRow(table, translate("creator", lang), fullName(demande.getCreateur()));
        addInfoRow(table, translate("creation_date", lang), formatDate(demande.getDateCreation()));
        addInfoRow(table, translate("global_status", lang), formatStatutDemande(demande.getStatut(), lang));

        doc.add(table);
        doc.add(new Paragraph(" "));

        if (isSuppression && userInfo != null && !userInfo.isEmpty()) {
            addSectionTitle(doc, translate("deleted_user", lang));
            PdfPTable userTable = createInfoTable();
            addInfoRow(userTable, translate("full_name", lang), userInfo.getOrDefault("firstName", "") + " " + userInfo.getOrDefault("lastName", ""));
            addInfoRow(userTable, translate("username", lang), userInfo.getOrDefault("username", ""));
            addInfoRow(userTable, translate("email", lang), userInfo.getOrDefault("email", ""));
            addInfoRow(userTable, translate("role", lang), userInfo.getOrDefault("role", ""));
            addInfoRow(userTable, translate("department", lang), userInfo.getOrDefault("department", translate("none", lang)));
            doc.add(userTable);
            doc.add(new Paragraph(" "));

            // Ajouter les informations sur les responsables du département
            if (userInfo.containsKey("responsable") || userInfo.containsKey("secondResponsable") || userInfo.containsKey("departmentLocal")) {
                addSubSectionTitle(doc, "Responsables du département");
                PdfPTable respTable = createInfoTable();
                addInfoRow(respTable, "Chef de département", userInfo.getOrDefault("responsable", "Non défini"));
                if (!userInfo.getOrDefault("responsableEmail", "").isEmpty()) {
                    addInfoRow(respTable, "Email du chef", userInfo.get("responsableEmail"));
                }
                if (!userInfo.getOrDefault("secondResponsable", "").isEmpty()) {
                    addInfoRow(respTable, "Second chef (externe)", userInfo.get("secondResponsable"));
                    if (!userInfo.getOrDefault("secondResponsableEmail", "").isEmpty()) {
                        addInfoRow(respTable, "Email second chef", userInfo.get("secondResponsableEmail"));
                    }
                }
                addInfoRow(respTable, "Département local ?", userInfo.getOrDefault("departmentLocal", ""));
                doc.add(respTable);
                doc.add(new Paragraph(" "));
            }
        } else if (isSuppression) {
            String[] parts = demande.getTitre().split("_");
            if (parts.length >= 2) {
                String username = parts[1];
                addSectionTitle(doc, translate("deleted_user", lang));
                PdfPTable userTable = createInfoTable();
                addInfoRow(userTable, translate("username", lang), username);
                doc.add(userTable);
                doc.add(new Paragraph(" "));
            }
        }
    }

    private void addDetails(Document doc, DetailDemande detail, String lang) throws DocumentException {
        if (detail == null) return;

        addSectionTitle(doc, translate("details", lang));

        // Localisation & Responsable
        addSubSectionTitle(doc, translate("location_responsible", lang));
        PdfPTable tableLoc = createInfoTable();
        addInfoRow(tableLoc, translate("location", lang), detail.getLocalisation());
        addInfoRow(tableLoc, translate("responsible", lang), detail.getResponsableNom());
        addInfoRow(tableLoc, translate("observations", lang), detail.getObservationsGenerales());
        doc.add(tableLoc);
        doc.add(new Paragraph(" "));

        // Services généraux
        addSubSectionTitle(doc, translate("general_services", lang));
        PdfPTable tableServ = createInfoTable();
        addInfoRow(tableServ, translate("furniture", lang), bool(detail.getMobilier(), lang));
        addInfoRow(tableServ, translate("meal_voucher", lang), bool(detail.getCarteRestaurant(), lang));
        addInfoRow(tableServ, translate("coffee_card", lang), bool(detail.getCarteCafe(), lang));
        addInfoRow(tableServ, translate("indoor_parking", lang), bool(detail.getParkingInterieur(), lang));
        addInfoRow(tableServ, translate("locker", lang), bool(detail.getCasier(), lang));
        addInfoRow(tableServ, translate("copy_permit", lang), bool(detail.getPhotocopiePermis(), lang));
        addInfoRow(tableServ, translate("other_services", lang), detail.getAutreServicesGeneraux());
        doc.add(tableServ);
        doc.add(new Paragraph(" "));

        // Téléphonie
        addSubSectionTitle(doc, translate("telephony", lang));
        PdfPTable tableTel = createInfoTable();
        addInfoRow(tableTel, translate("landline", lang), bool(detail.getTelephoneFixe(), lang));
        addInfoRow(tableTel, translate("mobile_phone", lang), bool(detail.getTelephoneMobile(), lang));
        addInfoRow(tableTel, translate("smartphone", lang), bool(detail.getSmartphoneMobile(), lang));
        addInfoRow(tableTel, translate("line_type", lang), detail.getTypeLigne());
        addInfoRow(tableTel, translate("other_telephony", lang), detail.getAutreTelephonie());
        doc.add(tableTel);
        doc.add(new Paragraph(" "));

        // Ordinateur
        addSubSectionTitle(doc, translate("computer", lang));
        PdfPTable tableOrd = createInfoTable();
        addInfoRow(tableOrd, translate("desktop", lang), bool(detail.getOrdinateurBureau(), lang));
        addInfoRow(tableOrd, translate("laptop", lang), bool(detail.getOrdinateurPortable(), lang));
        addInfoRow(tableOrd, translate("nomad_card", lang), bool(detail.getCarteNomade(), lang));
        addInfoRow(tableOrd, translate("external_connection", lang), bool(detail.getConnexionExterne(), lang));
        addInfoRow(tableOrd, translate("pvd_user", lang), bool(detail.getUtilisateurPvd(), lang));
        addInfoRow(tableOrd, translate("other_computer", lang), detail.getAutreOrdinateur());
        doc.add(tableOrd);
        doc.add(new Paragraph(" "));

        // Services IT
        addSubSectionTitle(doc, translate("it_services", lang));
        PdfPTable tableIt = createInfoTable();
        addInfoRow(tableIt, translate("office365", lang), bool(detail.getCourrierOffice365(), lang));
        addInfoRow(tableIt, translate("other_it", lang), detail.getAutreServiceIt());
        doc.add(tableIt);
        doc.add(new Paragraph(" "));

        // Accès programmes (inchangé, non traduit – on garde le contenu original)
        addAccesProgrammesDetails(doc, detail.getAccesProgrammes());

        // Banques
        addSubSectionTitle(doc, translate("banks", lang));
        PdfPTable tableBanque = createInfoTable();
        addInfoRow(tableBanque, translate("themis", lang), bool(detail.getBanqueThemis(), lang));
        addInfoRow(tableBanque, translate("hypervision", lang), bool(detail.getBanqueHypervision(), lang));
        addInfoRow(tableBanque, translate("helios", lang), bool(detail.getBanqueHelios(), lang));
        addInfoRow(tableBanque, translate("cap", lang), bool(detail.getBanqueCap(), lang));
        addInfoRow(tableBanque, translate("other_bank", lang), detail.getAutreBanque());
        doc.add(tableBanque);
        doc.add(new Paragraph(" "));

        // Autre besoin
        if (!isBlank(detail.getAutreBesoin())) {
            addSubSectionTitle(doc, translate("other_need", lang));
            PdfPTable tableAutre = createInfoTable();
            addInfoRow(tableAutre, translate("description_label", lang), detail.getAutreBesoin());
            doc.add(tableAutre);
            doc.add(new Paragraph(" "));
        }
    }

    private String bool(Boolean b, String lang) {
        return Boolean.TRUE.equals(b) ? translate("yes", lang) : translate("no", lang);
    }

    private void addWorkflowTable(Document doc, Demande demande, boolean full, String lang) throws DocumentException {
        addSectionTitle(doc, translate("workflow_validation", lang));

        String workflowName = Optional.ofNullable(demande.getWorkflow())
                .map(Workflow::getNom)
                .orElse(translate("not_defined", lang));

        Font wfNameFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, TEXT_MUTED);
        Paragraph wfNamePara = new Paragraph(translate("workflow", lang) + " : " + workflowName, wfNameFont);
        wfNamePara.setSpacingBefore(2);
        wfNamePara.setSpacingAfter(6);
        doc.add(wfNamePara);

        java.util.List<EtapeValidation> etapes = Optional.ofNullable(demande.getWorkflow())
                .map(Workflow::getEtapes)
                .orElse(java.util.List.of());

        if (etapes.isEmpty()) {
            Font emptyFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, TEXT_MUTED);
            doc.add(new Paragraph("Aucune étape définie pour ce workflow.", emptyFont));
            doc.add(new Paragraph(" "));
            return;
        }

        java.util.List<Historique> historiques = historiqueRepository.findByDemandeOrderByDateActionAsc(demande);
        boolean hasRejection = historiques.stream().anyMatch(h -> "REJECT".equals(h.getAction()));
        int rejectIndex = hasRejection ? historiques.stream().filter(h -> "REJECT".equals(h.getAction())).mapToInt(Historique::getEtapeIndex).findFirst().orElse(-1) : -1;
        int currentStep = demande.getEtapeCourante();

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.7f, 2.0f, 2.0f, 1.6f, 3.7f});
        table.setSpacingBefore(4);

        String[] headers = {translate("step", lang), translate("department_label", lang), translate("validator", lang), translate("status", lang), translate("action_comment", lang)};
        for (String header : headers) table.addCell(createHeaderCell(header));

        boolean alternate = false;
        int displayLimit = full ? etapes.size() : Math.min(currentStep + 1, etapes.size());

        for (int i = 0; i < displayLimit; i++) {
            EtapeValidation etape = etapes.get(i);
            String statutText, actionComment = "";
            Color rowBg, statutColor = TEXT_MUTED;

            if (hasRejection && i >= rejectIndex) {
                if (i == rejectIndex) {
                    statutText = translate("rejected", lang);
                    statutColor = DANGER_RED;
                    rowBg = REJECT_ROW_BG;
                    Historique hist = findHistorique(historiques, i);
                    if (hist != null) actionComment = "REJECT" + (hist.getCommentaire() != null ? " : " + hist.getCommentaire() : "");
                } else {
                    statutText = "—";
                    rowBg = HEADER_BG;
                    actionComment = "—";
                }
            } else {
                Historique hist = findHistorique(historiques, i);
                if (hist != null) {
                    if ("APPROVE".equals(hist.getAction())) {
                        statutText = translate("approved", lang);
                        statutColor = SUCCESS_GREEN;
                        rowBg = alternate ? ALTERNATE_ROW : Color.WHITE;
                    } else if ("REJECT".equals(hist.getAction())) {
                        statutText = translate("rejected", lang);
                        statutColor = DANGER_RED;
                        rowBg = REJECT_ROW_BG;
                    } else {
                        statutText = safe(hist.getAction());
                        rowBg = alternate ? ALTERNATE_ROW : Color.WHITE;
                    }
                    actionComment = hist.getCommentaire() != null ? hist.getCommentaire() : "";
                } else if (i < currentStep) {
                    statutText = translate("approved", lang);
                    statutColor = SUCCESS_GREEN;
                    rowBg = alternate ? ALTERNATE_ROW : Color.WHITE;
                } else if (i == currentStep && demande.getStatut() == StatutDemande.PENDING) {
                    statutText = translate("pending", lang);
                    statutColor = WARNING_AMBER;
                    rowBg = PENDING_ROW_BG;
                } else {
                    statutText = translate("pending", lang);
                    statutColor = WARNING_AMBER;
                    rowBg = alternate ? ALTERNATE_ROW : Color.WHITE;
                }
            }

            table.addCell(createCell(String.valueOf(i + 1), Element.ALIGN_CENTER, rowBg));
            table.addCell(createCell(getDepartmentName(etape), Element.ALIGN_LEFT, rowBg));
            table.addCell(createCell(getValidatorName(etape, lang), Element.ALIGN_LEFT, rowBg));
            table.addCell(createColoredStatusCell(statutText, statutColor, rowBg));
            table.addCell(createCell(actionComment, Element.ALIGN_LEFT, rowBg));
            alternate = !alternate;
        }

        if (!full && displayLimit < etapes.size()) {
            int remaining = etapes.size() - displayLimit;
            PdfPCell dotsCell = new PdfPCell(new Phrase("... (" + remaining + " étape(s) restante(s))", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, TEXT_MUTED)));
            dotsCell.setColspan(5);
            dotsCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            dotsCell.setBackgroundColor(HEADER_BG);
            dotsCell.setBorder(Rectangle.BOX);
            dotsCell.setBorderColor(BORDER_COLOR);
            dotsCell.setPadding(8);
            table.addCell(dotsCell);
        }

        doc.add(table);
        doc.add(new Paragraph(" "));
    }

    private String getValidatorName(EtapeValidation etape, String lang) {
        return Optional.ofNullable(etape)
                .map(EtapeValidation::getDepartment)
                .map(Department::getChef)
                .map(this::fullName)
                .orElse(translate("not_assigned", lang));
    }

    private void addFinalStatus(Document doc, StatutDemande statut, String lang) throws DocumentException {
        if (statut == null) return;
        if (statut == StatutDemande.APPROVED) {
            doc.add(createStatusBanner(SUCCESS_GREEN, translate("final_approved", lang)));
        } else if (statut == StatutDemande.REJECTED) {
            doc.add(createStatusBanner(DANGER_RED, translate("final_rejected", lang)));
        }
    }

    private void addFooter(Document doc, String lang) throws DocumentException {
        doc.add(createThickSeparator(DARK_BORDER));
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, TEXT_MUTED);
        Paragraph footer = new Paragraph(translate("footer", lang) + LocalDateTime.now().format(DATE_FORMAT), footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private void addSectionTitle(Document doc, String title) throws DocumentException {
        PdfPTable titleBar = new PdfPTable(1);
        titleBar.setWidthPercentage(100);
        titleBar.setSpacingBefore(10);
        titleBar.setSpacingAfter(2);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, PRIMARY_BLUE);
        PdfPCell cell = new PdfPCell(new Phrase(title, sectionFont));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBorderColor(PRIMARY_BLUE);
        cell.setBorderWidthLeft(4);
        cell.setPaddingLeft(10);
        cell.setPaddingTop(4);
        cell.setPaddingBottom(4);
        cell.setBackgroundColor(PRIMARY_BLUE_LIGHT);
        titleBar.addCell(cell);
        doc.add(titleBar);
        doc.add(new Paragraph(" "));
    }

    private void addSubSectionTitle(Document doc, String title) throws DocumentException {
        Font subFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(60, 70, 100));
        Paragraph p = new Paragraph(title, subFont);
        p.setSpacingBefore(6);
        p.setSpacingAfter(2);
        doc.add(p);
    }

    private PdfPTable createInfoTable() {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 2});
        table.getDefaultCell().setBorder(Rectangle.NO_BORDER);
        table.setSpacingBefore(2);
        return table;
    }

    private void addInfoRow(PdfPTable table, String label, String value) {
        if (isBlank(value)) return;
        PdfPCell labelCell = createLabelCell(label);
        PdfPCell valueCell = createValueCell(value);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private PdfPCell createLabelCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXT_DARK);
        PdfPCell cell = new PdfPCell(new Phrase(text + " :", font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        return cell;
    }

    private PdfPCell createValueCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
        PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(4);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        return cell;
    }

    private PdfPCell createHeaderCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(PRIMARY_BLUE);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(7);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setUseAscender(true);
        return cell;
    }

    private PdfPCell createCell(String text, int alignment, Color bgColor) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
        PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(BORDER_COLOR);
        cell.setBorder(Rectangle.BOX);
        if (bgColor != null) cell.setBackgroundColor(bgColor);
        cell.setUseAscender(true);
        return cell;
    }

    private PdfPCell createColoredStatusCell(String text, Color textColor, Color rowBg) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textColor);
        PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(BORDER_COLOR);
        cell.setBorder(Rectangle.BOX);
        if (rowBg != null) cell.setBackgroundColor(rowBg);
        cell.setUseAscender(true);
        return cell;
    }

    private PdfPTable createStatusBanner(Color color, String message) {
        PdfPTable banner = new PdfPTable(1);
        banner.setWidthPercentage(100);
        banner.setSpacingBefore(20);
        Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(message, statusFont));
        cell.setBackgroundColor(color);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(14);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setUseAscender(true);
        banner.addCell(cell);
        return banner;
    }

    private PdfPTable createThickSeparator(Color color) {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(Rectangle.TOP);
        lineCell.setBorderColor(color);
        lineCell.setBorderWidth(2);
        lineCell.setPadding(0);
        line.addCell(lineCell);
        return line;
    }

    private String getDepartmentName(EtapeValidation etape) {
        return Optional.ofNullable(etape).map(EtapeValidation::getDepartment).map(Department::getName).orElse("N/A");
    }

    private String fullName(User user) {
        if (user == null) return "";
        return fullName(user.getFirstName(), user.getLastName());
    }

    private String fullName(String firstName, String lastName) {
        String f = safe(firstName).trim();
        String l = safe(lastName).trim();
        return (f + " " + l).trim();
    }

    private String safe(String v) { return v != null ? v : ""; }
    private String safeObject(Object obj) { return obj != null ? obj.toString() : ""; }
    private String formatDate(LocalDateTime date) { return date != null ? date.format(DATE_FORMAT) : ""; }
    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    private String formatStatutDemande(StatutDemande statut, String lang) {
        if (statut == null) return "—";
        switch (statut) {
            case PENDING: return translate("pending", lang);
            case APPROVED: return translate("approved", lang);
            case REJECTED: return translate("rejected", lang);
            default: return statut.name();
        }
    }

    private Historique findHistorique(java.util.List<Historique> historiques, int etapeIndex) {
        return historiques.stream().filter(h -> h.getEtapeIndex() != null && h.getEtapeIndex() == etapeIndex).findFirst().orElse(null);
    }

    // ==================== ACCÈS PROGRAMMES (MODIFIED: NEW SHAREPOINT BOOLEANS) ====================
    @SuppressWarnings("unchecked")
    private void addAccesProgrammesDetails(Document doc, Object accesProgrammes) throws DocumentException {
        if (accesProgrammes == null) return;

        PdfPTable outerBox = new PdfPTable(1);
        outerBox.setWidthPercentage(100);
        outerBox.setSpacingBefore(6);
        outerBox.setSpacingAfter(4);

        PdfPCell boxCell = new PdfPCell();
        boxCell.setBorder(Rectangle.BOX);
        boxCell.setBorderColor(DARK_BORDER);
        boxCell.setBackgroundColor(SECTION_BOX_BG);
        boxCell.setPadding(10);

        Font boxTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_BLUE);
        Paragraph boxTitle = new Paragraph("Accès programmes", boxTitleFont);
        boxCell.addElement(boxTitle);
        boxCell.addElement(new Paragraph(" "));

        Map<String, Object> data;
        try {
            data = (Map<String, Object>) accesProgrammes;
        } catch (ClassCastException e) {
            Paragraph rawPara = new Paragraph("Accès programmes : " + safeObject(accesProgrammes),
                    FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_MUTED));
            boxCell.addElement(rawPara);
            outerBox.addCell(boxCell);
            doc.add(outerBox);
            doc.add(new Paragraph(" "));
            return;
        }

        // ========== CICLOS BLOCK REMOVED ==========

        Map<String, Object> aplicaciones = (Map<String, Object>) data.get("aplicaciones");
        if (aplicaciones != null && !aplicaciones.isEmpty()) {
            Font appTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(50, 60, 90));
            Paragraph appTitle = new Paragraph("Applications", appTitleFont);
            appTitle.setSpacingBefore(8);
            boxCell.addElement(appTitle);
            boxCell.addElement(new Paragraph(" "));

            java.util.List<String> appList = new java.util.ArrayList<>();
            for (Map.Entry<String, Object> entry : aplicaciones.entrySet()) {
                if (Boolean.TRUE.equals(entry.getValue())) {
                    appList.add(formatAppLabel(entry.getKey()));
                }
            }

            if (!appList.isEmpty()) {
                PdfPTable appGrid = new PdfPTable(3);
                appGrid.setWidthPercentage(90);
                appGrid.getDefaultCell().setBorder(Rectangle.NO_BORDER);
                appGrid.getDefaultCell().setPadding(3);

                Font appFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
                for (String app : appList) {
                    PdfPCell appCell = new PdfPCell(new Phrase("▸ " + app, appFont));
                    appCell.setBorder(Rectangle.NO_BORDER);
                    appCell.setPadding(3);
                    appCell.setPaddingLeft(8);
                    appCell.setBackgroundColor(PRIMARY_BLUE_LIGHT);
                    appGrid.addCell(appCell);
                }
                boxCell.addElement(appGrid);
            } else {
                Font emptyFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, TEXT_MUTED);
                boxCell.addElement(new Paragraph("Aucune application sélectionnée", emptyFont));
            }
            boxCell.addElement(new Paragraph(" "));
        }

        // ========== SHAREPOINT TANGER ==========
        if (data.containsKey("sharepointTanger") && Boolean.TRUE.equals(data.get("sharepointTanger"))) {
            Font spTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(50, 60, 90));
            Paragraph spTitle = new Paragraph("SharePoint Tanger", spTitleFont);
            spTitle.setSpacingBefore(6);
            boxCell.addElement(spTitle);
            Font spValueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
            Paragraph spValue = new Paragraph("Accès activé", spValueFont);
            spValue.setIndentationLeft(8);
            boxCell.addElement(spValue);
            boxCell.addElement(new Paragraph(" "));
        }

        // ========== SHAREPOINT COURADIR ==========
        if (data.containsKey("sharepointCouradir") && Boolean.TRUE.equals(data.get("sharepointCouradir"))) {
            Font spTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(50, 60, 90));
            Paragraph spTitle = new Paragraph("SharePoint Couradir", spTitleFont);
            spTitle.setSpacingBefore(6);
            boxCell.addElement(spTitle);
            Font spValueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXT_DARK);
            Paragraph spValue = new Paragraph("Accès activé", spValueFont);
            spValue.setIndentationLeft(8);
            boxCell.addElement(spValue);
            boxCell.addElement(new Paragraph(" "));
        }

        outerBox.addCell(boxCell);
        doc.add(outerBox);
        doc.add(new Paragraph(" "));
    }

    @SuppressWarnings("unchecked")
    private void addCicloSection(PdfPCell parentCell, String key, String title, Map<String, Object> ciclos) {
        Map<String, Boolean> ciclo = (Map<String, Boolean>) ciclos.get(key);
        if (ciclo == null) return;

        java.util.List<String> selected = new java.util.ArrayList<>();
        for (Map.Entry<String, Boolean> entry : ciclo.entrySet()) {
            if (Boolean.TRUE.equals(entry.getValue())) {
                selected.add(formatCicloLabel(entry.getKey()));
            }
        }

        if (selected.isEmpty()) return;

        Font cicloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_BLUE);
        Paragraph cicloPara = new Paragraph(title, cicloFont);
        cicloPara.setIndentationLeft(6);
        cicloPara.setSpacingBefore(5);
        parentCell.addElement(cicloPara);

        PdfPTable itemTable = new PdfPTable(2);
        itemTable.setWidthPercentage(85);
        itemTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);
        itemTable.getDefaultCell().setPadding(2);

        Font itemFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_DARK);
        for (String item : selected) {
            PdfPCell itemCell = new PdfPCell(new Phrase("  • " + item, itemFont));
            itemCell.setBorder(Rectangle.NO_BORDER);
            itemCell.setPadding(2);
            itemCell.setPaddingLeft(12);
            itemCell.setBackgroundColor(Color.WHITE);
            itemTable.addCell(itemCell);
        }
        parentCell.addElement(itemTable);
        parentCell.addElement(new Paragraph(" "));
    }

    private String formatCicloLabel(String key) {
        Map<String, String> map = new HashMap<>();
        map.put("negociar", "Négocier");
        map.put("abrirNuevoCliente", "Ouvrir nouveau client");
        map.put("procesarPedidos", "Traiter commandes");
        map.put("prepararEnvios", "Préparer envois");
        map.put("facturar", "Facturer");
        map.put("gestionarCobrosContabilizar", "Gérer encaissements / Comptabiliser");
        map.put("solicitarPago", "Demander paiement");
        map.put("autorizarPago", "Autoriser paiement");
        map.put("realizarPago", "Effectuer paiement");
        map.put("conciliarBancos", "Rapprocher banques");
        map.put("reclutar", "Recruter");
        map.put("incorporar", "Incorporer");
        map.put("evaluarDesempeno", "Évaluer performance");
        map.put("gestionarNominas", "Gérer paies");
        map.put("solicitarCompra", "Demander achat");
        map.put("aprobarCompra", "Approuver achat");
        map.put("recibirMercancia", "Réceptionner marchandise");
        map.put("verificarFactura", "Vérifier facture");
        map.put("registrarInventario", "Enregistrer stock");
        map.put("realizarConteoFisico", "Effectuer inventaire physique");
        map.put("ajustarInventario", "Ajuster stock");
        map.put("transferirMercancia", "Transférer marchandise");
        return map.getOrDefault(key, key);
    }

    private String formatAppLabel(String key) {
        Map<String, String> map = new HashMap<>();
        map.put("macpac", "MacPac");
        map.put("sacha", "Sacha");
        map.put("kp", "KP");
        map.put("biff", "BIFF");
        map.put("temis", "Themis");
        map.put("hypervision", "Hypervision");
        map.put("helios", "Hélios");
        map.put("cap", "CAP");
        map.put("sap", "SAP");
        map.put("powerBi", "Power BI");
        map.put("excel", "Excel Avancé");
        map.put("outlook", "Outlook");
        map.put("teams", "Microsoft Teams");
        map.put("sharepoint", "SharePoint");
        map.put("onedrive", "OneDrive");
        map.put("azure", "Azure DevOps");
        map.put("jira", "Jira");
        map.put("confluence", "Confluence");
        map.put("gitlab", "GitLab");
        map.put("navision", "Navision");
        map.put("tom", "TOM");
        map.put("cosmos", "Cosmos");
        map.put("pvd", "PVD");
        return map.getOrDefault(key, key);
    }
}