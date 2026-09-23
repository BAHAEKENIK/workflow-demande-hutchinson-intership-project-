package com.workflow.service;

import com.workflow.dto.ChangePasswordRequest;
import com.workflow.entity.*;
import com.workflow.repository.*;
import com.workflow.util.PasswordValidator;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DemandeRepository demandeRepository;
    private final HistoriqueRepository historiqueRepository;
    private final WorkflowRepository workflowRepository;
    private final DepartmentRepository departmentRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       DemandeRepository demandeRepository,
                       HistoriqueRepository historiqueRepository,
                       WorkflowRepository workflowRepository,
                       DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.demandeRepository = demandeRepository;
        this.historiqueRepository = historiqueRepository;
        this.workflowRepository = workflowRepository;
        this.departmentRepository = departmentRepository;
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
    }

    public void changePassword(ChangePasswordRequest request) {
        User currentUser = getCurrentUser();

        if (!currentUser.isFirstLogin()) {
            if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPassword())) {
                throw new IllegalArgumentException("Ancien mot de passe incorrect");
            }
        }

        if (passwordEncoder.matches(request.getNewPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        PasswordValidator.validate(request.getNewPassword());

        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        currentUser.setFirstLogin(false);
        userRepository.save(currentUser);
    }

    public void createPasswordResetTokenForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        String resetUrl = emailService.getBaseUrl() + "/reset-password?token=" + token;

        String htmlContent =
            "<!DOCTYPE html>" +
            "<html lang=\"fr\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">" +
            "<head>" +
            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<meta name=\"x-apple-disable-message-reformatting\">" +
            "<meta name=\"format-detection\" content=\"telephone=no,address=no,email=no,date=no,url=no\">" +
            "<title>Réinitialisation de votre mot de passe</title>" +
            "<!--[if mso]>" +
            "<noscript>" +
            "<xml>" +
            "<o:OfficeDocumentSettings>" +
            "<o:AllowPNG/>" +
            "<o:PixelsPerInch>96</o:PixelsPerInch>" +
            "</o:OfficeDocumentSettings>" +
            "</xml>" +
            "</noscript>" +
            "<![endif]-->" +
            "<style>" +
            "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');" +
            "* { margin: 0; padding: 0; box-sizing: border-box; }" +
            "body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" +
            "table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }" +
            "img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }" +
            "body { width: 100% !important; height: 100% !important; margin: 0 !important; padding: 0 !important; background-color: #F0F2F5; font-family: 'Inter', Arial, Helvetica, sans-serif; }" +
            ".email-wrapper { width: 100%; background-color: #F0F2F5; padding: 40px 16px; }" +
            ".email-container { max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(20, 37, 89, 0.08), 0 1px 4px rgba(20, 37, 89, 0.04); }" +
            ".top-accent { height: 4px; background: linear-gradient(90deg, #E21C2A 0%, #142559 50%, #E21C2A 100%); }" +
            ".header-section { background: linear-gradient(135deg, #142559 0%, #1A3470 40%, #1E3D80 100%); padding: 40px 48px 36px 48px; position: relative; overflow: hidden; }" +
            ".header-section::before { content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(226, 28, 42, 0.12) 0%, transparent 70%); border-radius: 50%; }" +
            ".header-section::after { content: ''; position: absolute; bottom: -40%; left: 10%; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%); border-radius: 50%; }" +
            ".logo-area { margin-bottom: 28px; position: relative; z-index: 1; }" +
            ".header-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #E21C2A 0%, #C41822 100%); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(226, 28, 42, 0.3); }" +
            ".header-icon svg { width: 28px; height: 28px; fill: #FFFFFF; }" +
            ".header-title { font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3; margin-bottom: 8px; position: relative; z-index: 1; letter-spacing: -0.02em; }" +
            ".header-subtitle { font-size: 14px; font-weight: 400; color: rgba(255, 255, 255, 0.65); line-height: 1.5; position: relative; z-index: 1; }" +
            ".body-section { padding: 40px 48px; }" +
            ".greeting { font-size: 18px; font-weight: 600; color: #142559; margin-bottom: 6px; }" +
            ".body-text { font-size: 15px; font-weight: 400; color: #4A5568; line-height: 1.7; margin-bottom: 16px; }" +
            ".highlight-box { background: linear-gradient(135deg, #FFF5F5 0%, #FFFAFA 100%); border-left: 4px solid #E21C2A; border-radius: 0 10px 10px 0; padding: 18px 22px; margin: 28px 0; }" +
            ".highlight-box p { font-size: 14px; color: #4A5568; line-height: 1.6; margin: 0; }" +
            ".highlight-box strong { color: #142559; }" +
            ".cta-wrapper { text-align: center; margin: 36px 0 32px 0; }" +
            ".cta-button { display: inline-block; background: linear-gradient(135deg, #E21C2A 0%, #C41822 100%); color: #FFFFFF !important; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; box-shadow: 0 4px 16px rgba(226, 28, 42, 0.35), 0 1px 3px rgba(226, 28, 42, 0.2); transition: all 0.2s ease; border: none; cursor: pointer; }" +
            ".cta-button:hover { background: linear-gradient(135deg, #C41822 0%, #A8141D 100%); box-shadow: 0 6px 24px rgba(226, 28, 42, 0.45); transform: translateY(-1px); }" +
            ".cta-button:active { transform: translateY(0); }" +
            ".cta-fallback { margin-top: 16px; font-size: 12px; color: #A0AEC0; word-break: break-all; line-height: 1.5; }" +
            ".cta-fallback a { color: #142559; text-decoration: underline; }" +
            ".divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #E2E8F0 20%, #E2E8F0 80%, transparent 100%); margin: 28px 0; }" +
            ".info-row { display: flex; align-items: flex-start; margin-bottom: 12px; }" +
            ".info-icon { width: 32px; height: 32px; min-width: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 14px; margin-top: 2px; font-size: 14px; }" +
            ".info-icon.clock { background: #EBF4FF; color: #3182CE; }" +
            ".info-icon.shield { background: #F0FFF4; color: #38A169; }" +
            ".info-icon.alert { background: #FFFBEB; color: #D69E2E; }" +
            ".info-content { font-size: 13.5px; color: #4A5568; line-height: 1.5; }" +
            ".info-content strong { color: #2D3748; font-weight: 600; }" +
            ".security-notice { background: #F7FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 22px; margin-top: 28px; }" +
            ".security-notice p { font-size: 13px; color: #718096; line-height: 1.6; margin: 0; }" +
            ".security-notice p + p { margin-top: 8px; }" +
            ".footer-section { background: #F8FAFC; border-top: 1px solid #EDF2F7; padding: 28px 48px; text-align: center; }" +
            ".footer-logo { margin-bottom: 16px; }" +
            ".footer-divider { width: 40px; height: 2px; background: #E21C2A; margin: 0 auto 16px auto; border-radius: 2px; }" +
            ".footer-text { font-size: 12px; color: #A0AEC0; line-height: 1.6; margin-bottom: 4px; }" +
            ".footer-text a { color: #142559; text-decoration: none; font-weight: 500; }" +
            ".footer-text a:hover { text-decoration: underline; }" +
            ".footer-legal { font-size: 11px; color: #CBD5E0; margin-top: 12px; line-height: 1.5; }" +
            "@media only screen and (max-width: 640px) {" +
            "  .email-wrapper { padding: 16px 8px; }" +
            "  .header-section { padding: 32px 28px 28px 28px; }" +
            "  .body-section { padding: 28px; }" +
            "  .footer-section { padding: 24px 28px; }" +
            "  .header-title { font-size: 20px; }" +
            "  .cta-button { padding: 14px 32px; font-size: 14px; }" +
            "}" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"email-wrapper\">" +
            "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" +
            "<tr><td align=\"center\">" +
            "<div class=\"email-container\">" +

            /* ── Top accent bar ── */
            "<div class=\"top-accent\" style=\"height:4px; background:linear-gradient(90deg, #E21C2A 0%, #142559 50%, #E21C2A 100%); font-size:0; line-height:0;\">&nbsp;</div>" +

            /* ── Header with logo + title ── */
            "<div class=\"header-section\" style=\"background:linear-gradient(135deg, #142559 0%, #1A3470 40%, #1E3D80 100%); padding:40px 48px 36px 48px; position:relative; overflow:hidden;\">" +

            /* Logo */
            "<div class=\"logo-area\" style=\"margin-bottom:28px; position:relative; z-index:1;\">" +
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1.2380214 -1.2380214 357.6729128 43.7434228\" width=\"180\" height=\"22\" preserveAspectRatio=\"xMidYMid meet\" aria-label=\"Hutchinson\" style=\"display:block;\">" +
            "<path d=\"m 350.15339,11.80675 0,1.49625 0.685,0 c 0.39125,0 0.67499,-0.0563 0.85124,-0.17125 0.18251,-0.1175 0.27,-0.30375 0.27,-0.55375 0,-0.26625 -0.0913,-0.46 -0.28,-0.58625 -0.1875,-0.12375 -0.48124,-0.185 -0.88999,-0.185 l -0.63625,0 z m -1.04001,-0.64375 1.86375,0 c 0.6725,0 1.185,0.11 1.53125,0.3275 0.3475,0.21625 0.52124,0.54125 0.52124,0.96625 0,0.3475 -0.095,0.63625 -0.28125,0.86375 -0.1875,0.2275 -0.45125,0.3775 -0.79875,0.45 l 1.08,2.15875 -1.16124,0 -0.9625,-1.99 -0.7525,0 0,1.99 -1.04,0 0,-4.76625 z m 1.765,-1.14875 c -0.50126,0 -0.96375,0.0863 -1.39625,0.25875 -0.43251,0.17625 -0.8175,0.43375 -1.16251,0.77125 -0.35624,0.3575 -0.63375,0.7625 -0.82499,1.20375 -0.19251,0.445 -0.28751,0.905 -0.28751,1.38375 0,0.4775 0.0913,0.9325 0.27501,1.36625 0.17999,0.43125 0.44499,0.8225 0.78749,1.16625 0.35001,0.3475 0.7475,0.61625 1.18875,0.8025 0.445,0.18625 0.89625,0.2775 1.36251,0.2775 0.50374,0 0.98124,-0.0888 1.43375,-0.2675 0.45249,-0.17875 0.85999,-0.4425 1.21875,-0.78875 0.3475,-0.3325 0.61124,-0.71 0.79499,-1.14 0.19,-0.42875 0.28251,-0.88125 0.28251,-1.36 0,-0.5075 -0.0888,-0.9825 -0.26499,-1.4175 -0.17377,-0.43875 -0.43751,-0.83125 -0.78125,-1.17875 -0.36375,-0.35125 -0.76376,-0.62 -1.20751,-0.8025 -0.445,-0.1825 -0.91749,-0.275 -1.41875,-0.275 m -0.004,-0.63625 c 0.59249,0 1.15499,0.105 1.68125,0.32125 0.5275,0.2125 0.99875,0.52875 1.41001,0.9475 0.39875,0.3975 0.70875,0.85375 0.91625,1.36125 0.20999,0.50625 0.31499,1.0425 0.31499,1.61625 0,0.585 -0.10624,1.135 -0.3225,1.64875 -0.21625,0.5175 -0.52999,0.9675 -0.94375,1.36375 -0.42125,0.40375 -0.89374,0.7125 -1.41875,0.925 -0.52499,0.215 -1.06874,0.3225 -1.6375,0.3225 -0.57375,0 -1.12374,-0.11 -1.65125,-0.33125 -0.52749,-0.2225 -0.99624,-0.5375 -1.40875,-0.95125 -0.40875,-0.40625 -0.72,-0.865 -0.93249,-1.37375 -0.21626,-0.50875 -0.3225,-1.045 -0.3225,-1.60375 0,-0.5625 0.10999,-1.1075 0.33499,-1.6325 0.22375,-0.525 0.54625,-0.99375 0.96501,-1.4075 0.40625,-0.4 0.86249,-0.7 1.36999,-0.9025 0.50875,-0.205 1.05751,-0.30375 1.645,-0.30375\" fill=\"#FFFFFF\"/>" +
            "<path d=\"m 284.01238,20.36463 c -1.37749,-1.02 -3.51499,-1.72375 -6.36,-2.09625 -0.99375,-0.12375 -3.005,-0.28375 -6.14375,-0.48875 -2.0675,-0.12 -3.5725,-0.34 -4.47249,-0.655 -1.18127,-0.405 -1.755,-1.015 -1.755,-1.8625 0,-0.81625 0.54,-1.44875 1.65374,-1.9325 1.1725,-0.50875 2.90625,-0.765 5.145,-0.765 3.4925,0 8.19375,0.5975 12.20875,2.41875 0.115,0.0525 0.205,-0.0463 0.205,-0.225 l 0,-3.73 c 0,-0.18 0.0112,-0.31875 -0.085,-0.36375 -2.555,-1.1725 -8.19,-1.90625 -12.04875,-1.90625 -3.625,0 -6.48125,0.61875 -8.49,1.84125 -2.0525,1.24875 -3.0925,2.9825 -3.0925,5.14875 0,2.12125 0.93001,3.655 2.75751,4.55625 1.51625,0.745 4.16874,1.24625 7.87875,1.4925 4.1375,0.26125 6.69874,0.51375 7.62,0.75 1.68999,0.435 2.50749,1.2625 2.50749,2.52875 0,1.08875 -0.62624,1.9325 -1.91249,2.5775 -1.39876,0.685 -3.42875,1.07375 -5.97,1.035 -3.70501,-0.0588 -8.48375,-0.89375 -12.41501,-3.325 -0.12375,-0.0763 -0.22125,0.002 -0.22125,0.18125 l 0,3.4525 c 0,0.17875 -0.0163,0.33875 0.065,0.3675 0.04,0.015 4.135,3.095 12.54,3.095 3.97375,0 7.07501,-0.65875 9.21625,-1.95875 2.18625,-1.33375 3.2975,-3.23875 3.2975,-5.66875 0,-1.91625 -0.72125,-3.41875 -2.12875,-4.4675 M 339.17225,9.30675 c -0.17874,0 -0.32499,0.14625 -0.32499,0.32625 l 0.055,16.4325 c 10e-4,0.17875 -0.0925,0.21375 -0.20875,0.0763 L 324.78601,9.6493 c -0.11624,-0.13625 -0.22875,-0.27 -0.25125,-0.295 -0.0237,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37375,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.32625 l 0,21.98375 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.6375,0 c 0.17874,0 0.32499,-0.14625 0.32499,-0.325 l 0,-16.99875 c 0,-0.18 0.0962,-0.215 0.21251,-0.0788 l 14.69499,17.15625 c 0.11626,0.13625 0.35875,0.24625 0.5375,0.24625 l 3.61001,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.98375 c 0,-0.18 -0.14625,-0.32625 -0.325,-0.32625 l -3.63751,0 z m -29.84149,17.09938 c -1.84625,1.49375 -3.7775,2.25125 -6.875,2.25125 -3.115,0 -5.065,-0.75375 -6.92125,-2.23875 -1.83875,-1.4675 -2.77125,-3.42875 -2.77125,-5.82375 0,-2.315 0.95375,-4.2525 2.83375,-5.76375 1.8975,-1.52375 3.825,-2.3 6.85875,-2.3 2.77499,0 4.5525,0.68125 6.41,2.02 2.13875,1.53875 3.22375,3.57125 3.22375,6.04375 0,2.37625 -0.9275,4.3325 -2.75875,5.81125 m 2.53625,-14.75625 c -2.67875,-2.01875 -5.4625,-3.04375 -9.41125,-3.04375 -3.92125,0 -6.71875,1.02375 -9.4375,3.04375 -3.11625,2.32375 -4.695,5.3325 -4.695,8.945 0,3.67375 1.55874,6.695 4.6325,8.975 2.68124,2 5.4975,3.01125 9.5,3.01125 3.96375,0 6.76375,-1.0025 9.44,-2.98125 3.07375,-2.28125 4.63249,-5.3125 4.63249,-9.005 0,-3.6125 -1.56999,-6.62125 -4.66124,-8.945 M 253.125,26.06575 c 0,0.17875 -0.0925,0.2125 -0.20875,0.0762 L 239.005,9.64945 c -0.115,-0.13625 -0.22749,-0.27 -0.25,-0.295 -0.0238,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37251,0 c -0.17875,0 -0.32499,0.14625 -0.32499,0.32625 l 0,21.98375 c 0,0.17875 0.14625,0.325 0.32499,0.325 l 3.63875,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-17 c 0,-0.17875 0.095,-0.215 0.21125,-0.0775 l 14.69625,17.155 c 0.11625,0.1375 0.35875,0.2475 0.5375,0.2475 l 3.60625,0 c 0.17875,0 0.32625,-0.14625 0.32625,-0.325 l 0,-21.98375 c 0,-0.18 -0.1475,-0.32625 -0.32625,-0.32625 l -3.63875,0 c -0.17875,0 -0.325,0.14625 -0.32375,0.32625 l 0.0588,16.4325 z m -28.38462,5.551 c 0,0.17875 0.14625,0.32625 0.325,0.32625 l 3.63625,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-21.98375 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -3.63625,0 c -0.17875,0 -0.325,0.1475 -0.325,0.32625 l 0,21.98375 z M 215.79413,17.35 c 0,0.17875 -0.14625,0.32625 -0.32624,0.32625 l -13.23876,0 c -0.17874,0 -0.32499,-0.1475 -0.32499,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.14626,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.325 l 0,21.985 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.635,0 c 0.17874,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.32499,-0.325 l 13.23876,0 c 0.17999,0 0.32624,0.14625 0.32624,0.325 l 0,9.75125 c 0,0.17875 0.145,0.325 0.325,0.325 l 3.63375,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63375,0 c -0.18,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z m -41.94975,-2.53537 c 1.88875,-1.515 4.375,-2.2825 7.3875,-2.2825 3.9875,0 7.04001,1.105 9.3875,3.5425 0.0888,0.0913 0.2,0.0175 0.37,-0.0412 l 3.31,-1.165 c 0.16875,-0.06 0.25,-0.17875 0.18375,-0.265 -3.04374,-3.9975 -7.5725,-5.9975 -13.25125,-5.9975 -3.945,0 -7.3025,1.0125 -9.98125,3.0125 -3.09625,2.3025 -4.66499,5.31125 -4.66499,8.94375 0,3.695 1.54875,6.7275 4.60249,9.0075 2.65751,1.97625 6.03751,2.9825 10.04375,2.9825 2.85375,0 5.33375,-0.4425 7.39501,-1.25375 3.42499,-1.345 5.62374,-4.14625 5.6875,-4.21875 0.0637,-0.0738 -0.0112,-0.205 -0.16876,-0.29 l -3.12124,-1.70375 c -0.15875,-0.085 -0.27126,-0.17625 -0.36251,-0.0738 -1.81124,2.035 -5.26625,3.7225 -9.21249,3.6175 -3.19876,-0.0875 -5.76751,-0.755 -7.635,-2.24 -1.85126,-1.47 -2.78751,-3.43125 -2.78751,-5.8275 0,-2.3125 0.94625,-4.24875 2.8175,-5.7475 m -7.60588,-5.182 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -22.65625,0 c -0.18,0 -0.32624,0.1475 -0.32624,0.32625 l 0,3.21375 c 0,0.18 0.14625,0.325 0.32624,0.325 l 8.86001,0 c 0.17875,0 0.32499,0.1475 0.32499,0.32625 l 0,18.11875 c 0,0.17875 0.14626,0.32625 0.325,0.32625 l 3.63375,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-18.11875 c 0,-0.17875 0.14626,-0.32625 0.325,-0.32625 l 8.8625,0 c 0.17875,0 0.325,-0.145 0.325,-0.325 l 0,-3.21375 z m -31.27712,13.68275 c 0.0738,1.9225 -0.6975,3.17375 -2.13375,4.04125 -1.32375,0.79875 -2.83749,1.33125 -5.92374,1.33125 -3.08376,0 -4.61251,-0.5325 -5.95376,-1.33125 -1.45875,-0.8675 -2.24375,-2.25 -2.165,-4.04125 l 0,-13.6825 c 0,-0.18 -0.1475,-0.32625 -0.325,-0.32625 l -3.6375,0 c -0.17875,0 -0.32375,0.14625 -0.32375,0.32625 l 0,14.56625 c -0.11625,2.53125 1.18876,4.655 3.53751,6.14625 2.52374,1.59 5.17249,2.26875 8.86749,2.26875 3.69625,0 6.3325,-0.68 8.80625,-2.26875 2.35,-1.47125 3.61376,-3.435 3.54001,-6.14625 l 0,-14.56625 c 0,-0.18 -0.14626,-0.32625 -0.32501,-0.32625 l -3.63874,0 c -0.17876,0 -0.325,0.14625 -0.325,0.32625 l 0,13.6825 z M 106.27963,17.35 c 0,0.17875 -0.14625,0.32625 -0.32499,0.32625 l -13.24001,0 c -0.17875,0 -0.325,-0.1475 -0.325,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.145,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,21.985 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.635,0 c 0.18,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.325,-0.325 l 13.24001,0 c 0.17874,0 0.32499,0.14625 0.32499,0.325 l 0,9.75125 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.63501,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63501,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z\" fill=\"#FFFFFF\"/>" +
            "<path d=\"m 71.649,41.26738 1.14626,0 0,-41.265 -1.14626,0 0,41.265 z\" fill=\"rgba(255,255,255,0.3)\"/>" +
            "<path d=\"m 27.15738,40.08775 c 2.0225,1.69 5.26,1.4575 7.27625,-0.5 L 54.28238,19.0065 c 1.30375,-1.5625 1.84875,-6.935 -5.055,-6.95125 -0.135,0 -16.035,0.006 -16.035,0.006 -1.23375,0 -3.09625,0.84375 -4.05875,1.845 l -4.0175,4.18 c -0.45375,0.4675 -0.57125,0.61 -0.485,0.80625 0.1425,0.15125 0.18125,0.12125 0.5925,0.12125 l 12.1325,0.006 c 4.02625,-0.085 4.255,0.20625 4.5225,0.8575 0.15625,0.38125 0.0588,1.24375 -0.975,2.3 l -7.87125,8.0075 c -0.67,0.6775 -1.605,1.06875 -2.57,1.06875 -0.90375,-10e-4 -1.76,-0.3325 -2.405,-0.93625 l -7.17125,-6.645 c -0.66875,-0.6225 -1.0575,-1.475 -1.095,-2.39875 -0.0337,-0.94375 0.3025,-1.84875 0.94625,-2.5375 l 8.33125,-8.95115 c 1.19875,-1.29 3.39375,-2.30125 4.995,-2.30125 l 18.0875,0.009 c 1.24875,0.002 3.15625,-0.795 4.16875,-1.74 l 5.32375,-4.96875 c 0.35125,-0.375 0.5475,-0.63 0.50625,-0.69875 C 62.09858,1e-4 61.97238,0.0126 61.58863,0.0138 L 29.75238,0 c -1.23,0 -3.0575,0.87125 -3.995,1.905 l -15.91,18.0475 c -0.8225,0.9075 -0.78,2.29875 0.09,3.1075 l 17.22,17.0275 z M 0.59375,12.0755 C 0.2,12.0765 0,12.0755 0,12.19175 0,12.358 0.0438,12.4305 0.51876,12.90425 l 4.88499,4.7425 c 0.81375,0.79 2.2175,0.71625 2.985,-0.15375 l 3.845,-4.355 c 0.54375,-0.6975 0.5,-0.765 0.45375,-0.8975 -0.0575,-0.165 -0.20375,-0.16 -0.62,-0.16 L 0.59375,12.0755 z\" fill=\"#E21C2A\"/>" +
            "</svg>" +
            "</div>" +

            /* Lock icon */
            "<div style=\"width:56px; height:56px; background:linear-gradient(135deg, #E21C2A 0%, #C41822 100%); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 8px 20px rgba(226,28,42,0.3);\">" +
            "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>" +
            "</div>" +

            /* Title */
            "<h2 style=\"font-size:24px; font-weight:700; color:#FFFFFF; line-height:1.3; margin:0 0 8px 0; position:relative; z-index:1; letter-spacing:-0.02em; font-family:'Inter',Arial,Helvetica,sans-serif;\">Réinitialisation de votre mot de passe</h2>" +
            "<p style=\"font-size:14px; font-weight:400; color:rgba(255,255,255,0.65); line-height:1.5; margin:0; position:relative; z-index:1; font-family:'Inter',Arial,Helvetica,sans-serif;\">Sécurité de votre compte Hutchinson</p>" +
            "</div>" +

            /* ── Body ── */
            "<div class=\"body-section\" style=\"padding:40px 48px;\">" +

            /* Greeting */
            "<p style=\"font-size:18px; font-weight:600; color:#142559; margin:0 0 6px 0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Bonjour " + user.getFirstName() + ",</p>" +

            /* Main text */
            "<p style=\"font-size:15px; font-weight:400; color:#4A5568; line-height:1.7; margin:0 0 16px 0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Vous avez demandé la réinitialisation du mot de passe associé à votre compte sur la plateforme de demandes Hutchinson.</p>" +

            "<p style=\"font-size:15px; font-weight:400; color:#4A5568; line-height:1.7; margin:0 0 0 0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Pour définir un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>" +

            /* Highlight box */
            "<div style=\"background:linear-gradient(135deg, #FFF5F5 0%, #FFFAFA 100%); border-left:4px solid #E21C2A; border-radius:0 10px 10px 0; padding:18px 22px; margin:28px 0;\">" +
            "<p style=\"font-size:14px; color:#4A5568; line-height:1.6; margin:0; font-family:'Inter',Arial,Helvetica,sans-serif;\"><strong style=\"color:#142559;\">Action requise :</strong> Ce lien vous redirigera vers une page sécurisée pour créer votre nouveau mot de passe.</p>" +
            "</div>" +

            /* CTA Button */
            "<div style=\"text-align:center; margin:36px 0 12px 0;\">" +
            "<a href='" + resetUrl + "' style=\"display:inline-block; background:linear-gradient(135deg, #E21C2A 0%, #C41822 100%); color:#FFFFFF !important; text-decoration:none; padding:16px 40px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.01em; box-shadow:0 4px 16px rgba(226,28,42,0.35), 0 1px 3px rgba(226,28,42,0.2); font-family:'Inter',Arial,Helvetica,sans-serif;\">Réinitialiser mon mot de passe</a>" +
            "</div>" +

            /* Fallback link */
            "<div style=\"text-align:center; margin:0 0 32px 0;\">" +
            "<p style=\"font-size:12px; color:#A0AEC0; word-break:break-all; line-height:1.5; margin:0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Si le bouton ne fonctionne pas, copiez ce lien :<br/><a href='" + resetUrl + "' style=\"color:#142559; text-decoration:underline;\">" + resetUrl + "</a></p>" +
            "</div>" +

            /* Divider */
            "<div style=\"height:1px; background:linear-gradient(90deg, transparent 0%, #E2E8F0 20%, #E2E8F0 80%, transparent 100%); margin:28px 0;\"></div>" +

            /* Info rows */
            "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">" +

            /* Clock row */
            "<tr><td style=\"padding-bottom:14px; vertical-align:top;\">" +
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>" +
            "<td width=\"32\" height=\"32\" style=\"background:#EBF4FF; border-radius:8px; text-align:center; vertical-align:middle; padding:0;\">" +
            "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#3182CE\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>" +
            "</td>" +
            "<td style=\"padding-left:14px; font-size:13.5px; color:#4A5568; line-height:1.5; font-family:'Inter',Arial,Helvetica,sans-serif;\"><strong style=\"color:#2D3748; font-weight:600;\">Durée de validité :</strong> 30 minutes à compter de la réception de cet email.</td>" +
            "</tr></table>" +
            "</td></tr>" +

            /* Shield row */
            "<tr><td style=\"padding-bottom:14px; vertical-align:top;\">" +
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>" +
            "<td width=\"32\" height=\"32\" style=\"background:#F0FFF4; border-radius:8px; text-align:center; vertical-align:middle; padding:0;\">" +
            "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#38A169\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>" +
            "</td>" +
            "<td style=\"padding-left:14px; font-size:13.5px; color:#4A5568; line-height:1.5; font-family:'Inter',Arial,Helvetica,sans-serif;\"><strong style=\"color:#2D3748; font-weight:600;\">Lien unique :</strong> Ce token ne peut être utilisé qu'une seule fois.</td>" +
            "</tr></table>" +
            "</td></tr>" +

            /* Alert row */
            "<tr><td style=\"vertical-align:top;\">" +
            "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>" +
            "<td width=\"32\" height=\"32\" style=\"background:#FFFBEB; border-radius:8px; text-align:center; vertical-align:middle; padding:0;\">" +
            "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#D69E2E\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg>" +
            "</td>" +
            "<td style=\"padding-left:14px; font-size:13.5px; color:#4A5568; line-height:1.5; font-family:'Inter',Arial,Helvetica,sans-serif;\"><strong style=\"color:#2D3748; font-weight:600;\">Pas vous ?</strong> Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre compte reste sécurisé.</td>" +
            "</tr></table>" +
            "</td></tr>" +

            "</table>" +

            /* Security notice */
            "<div style=\"background:#F7FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:18px 22px; margin-top:28px;\">" +
            "<p style=\"font-size:13px; color:#718096; line-height:1.6; margin:0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Hutchinson ne vous demandera <strong style=\"color:#4A5568;\">jamais</strong> votre mot de passe par email. Si vous recevez un email suspect, contactez immédiatement votre administrateur informatique.</p>" +
            "</div>" +

            "</div>" +

            /* ── Footer ── */
            "<div style=\"background:#F8FAFC; border-top:1px solid #EDF2F7; padding:28px 48px; text-align:center;\">" +

            /* Footer logo (smaller) */
            "<div style=\"margin-bottom:16px;\">" +
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1.2380214 -1.2380214 357.6729128 43.7434228\" width=\"120\" height=\"15\" preserveAspectRatio=\"xMidYMid meet\" aria-label=\"Hutchinson\" style=\"display:inline-block; opacity:0.5;\">" +
            "<path d=\"m 350.15339,11.80675 0,1.49625 0.685,0 c 0.39125,0 0.67499,-0.0563 0.85124,-0.17125 0.18251,-0.1175 0.27,-0.30375 0.27,-0.55375 0,-0.26625 -0.0913,-0.46 -0.28,-0.58625 -0.1875,-0.12375 -0.48124,-0.185 -0.88999,-0.185 l -0.63625,0 z m -1.04001,-0.64375 1.86375,0 c 0.6725,0 1.185,0.11 1.53125,0.3275 0.3475,0.21625 0.52124,0.54125 0.52124,0.96625 0,0.3475 -0.095,0.63625 -0.28125,0.86375 -0.1875,0.2275 -0.45125,0.3775 -0.79875,0.45 l 1.08,2.15875 -1.16124,0 -0.9625,-1.99 -0.7525,0 0,1.99 -1.04,0 0,-4.76625 z m 1.765,-1.14875 c -0.50126,0 -0.96375,0.0863 -1.39625,0.25875 -0.43251,0.17625 -0.8175,0.43375 -1.16251,0.77125 -0.35624,0.3575 -0.63375,0.7625 -0.82499,1.20375 -0.19251,0.445 -0.28751,0.905 -0.28751,1.38375 0,0.4775 0.0913,0.9325 0.27501,1.36625 0.17999,0.43125 0.44499,0.8225 0.78749,1.16625 0.35001,0.3475 0.7475,0.61625 1.18875,0.8025 0.445,0.18625 0.89625,0.2775 1.36251,0.2775 0.50374,0 0.98124,-0.0888 1.43375,-0.2675 0.45249,-0.17875 0.85999,-0.4425 1.21875,-0.78875 0.3475,-0.3325 0.61124,-0.71 0.79499,-1.14 0.19,-0.42875 0.28251,-0.88125 0.28251,-1.36 0,-0.5075 -0.0888,-0.9825 -0.26499,-1.4175 -0.17377,-0.43875 -0.43751,-0.83125 -0.78125,-1.17875 -0.36375,-0.35125 -0.76376,-0.62 -1.20751,-0.8025 -0.445,-0.1825 -0.91749,-0.275 -1.41875,-0.275 m -0.004,-0.63625 c 0.59249,0 1.15499,0.105 1.68125,0.32125 0.5275,0.2125 0.99875,0.52875 1.41001,0.9475 0.39875,0.3975 0.70875,0.85375 0.91625,1.36125 0.20999,0.50625 0.31499,1.0425 0.31499,1.61625 0,0.585 -0.10624,1.135 -0.3225,1.64875 -0.21625,0.5175 -0.52999,0.9675 -0.94375,1.36375 -0.42125,0.40375 -0.89374,0.7125 -1.41875,0.925 -0.52499,0.215 -1.06874,0.3225 -1.6375,0.3225 -0.57375,0 -1.12374,-0.11 -1.65125,-0.33125 -0.52749,-0.2225 -0.99624,-0.5375 -1.40875,-0.95125 -0.40875,-0.40625 -0.72,-0.865 -0.93249,-1.37375 -0.21626,-0.50875 -0.3225,-1.045 -0.3225,-1.60375 0,-0.5625 0.10999,-1.1075 0.33499,-1.6325 0.22375,-0.525 0.54625,-0.99375 0.96501,-1.4075 0.40625,-0.4 0.86249,-0.7 1.36999,-0.9025 0.50875,-0.205 1.05751,-0.30375 1.645,-0.30375\" fill=\"#142559\"/>" +
            "<path d=\"m 284.01238,20.36463 c -1.37749,-1.02 -3.51499,-1.72375 -6.36,-2.09625 -0.99375,-0.12375 -3.005,-0.28375 -6.14375,-0.48875 -2.0675,-0.12 -3.5725,-0.34 -4.47249,-0.655 -1.18127,-0.405 -1.755,-1.015 -1.755,-1.8625 0,-0.81625 0.54,-1.44875 1.65374,-1.9325 1.1725,-0.50875 2.90625,-0.765 5.145,-0.765 3.4925,0 8.19375,0.5975 12.20875,2.41875 0.115,0.0525 0.205,-0.0463 0.205,-0.225 l 0,-3.73 c 0,-0.18 0.0112,-0.31875 -0.085,-0.36375 -2.555,-1.1725 -8.19,-1.90625 -12.04875,-1.90625 -3.625,0 -6.48125,0.61875 -8.49,1.84125 -2.0525,1.24875 -3.0925,2.9825 -3.0925,5.14875 0,2.12125 0.93001,3.655 2.75751,4.55625 1.51625,0.745 4.16874,1.24625 7.87875,1.4925 4.1375,0.26125 6.69874,0.51375 7.62,0.75 1.68999,0.435 2.50749,1.2625 2.50749,2.52875 0,1.08875 -0.62624,1.9325 -1.91249,2.5775 -1.39876,0.685 -3.42875,1.07375 -5.97,1.035 -3.70501,-0.0588 -8.48375,-0.89375 -12.41501,-3.325 -0.12375,-0.0763 -0.22125,0.002 -0.22125,0.18125 l 0,3.4525 c 0,0.17875 -0.0163,0.33875 0.065,0.3675 0.04,0.015 4.135,3.095 12.54,3.095 3.97375,0 7.07501,-0.65875 9.21625,-1.95875 2.18625,-1.33375 3.2975,-3.23875 3.2975,-5.66875 0,-1.91625 -0.72125,-3.41875 -2.12875,-4.4675 M 339.17225,9.30675 c -0.17874,0 -0.32499,0.14625 -0.32499,0.32625 l 0.055,16.4325 c 10e-4,0.17875 -0.0925,0.21375 -0.20875,0.0763 L 324.78601,9.6493 c -0.11624,-0.13625 -0.22875,-0.27 -0.25125,-0.295 -0.0237,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37375,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.32625 l 0,21.98375 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.6375,0 c 0.17874,0 0.32499,-0.14625 0.32499,-0.325 l 0,-16.99875 c 0,-0.18 0.0962,-0.215 0.21251,-0.0788 l 14.69499,17.15625 c 0.11626,0.13625 0.35875,0.24625 0.5375,0.24625 l 3.61001,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.98375 c 0,-0.18 -0.14625,-0.32625 -0.325,-0.32625 l -3.63751,0 z m -29.84149,17.09938 c -1.84625,1.49375 -3.7775,2.25125 -6.875,2.25125 -3.115,0 -5.065,-0.75375 -6.92125,-2.23875 -1.83875,-1.4675 -2.77125,-3.42875 -2.77125,-5.82375 0,-2.315 0.95375,-4.2525 2.83375,-5.76375 1.8975,-1.52375 3.825,-2.3 6.85875,-2.3 2.77499,0 4.5525,0.68125 6.41,2.02 2.13875,1.53875 3.22375,3.57125 3.22375,6.04375 0,2.37625 -0.9275,4.3325 -2.75875,5.81125 m 2.53625,-14.75625 c -2.67875,-2.01875 -5.4625,-3.04375 -9.41125,-3.04375 -3.92125,0 -6.71875,1.02375 -9.4375,3.04375 -3.11625,2.32375 -4.695,5.3325 -4.695,8.945 0,3.67375 1.55874,6.695 4.6325,8.975 2.68124,2 5.4975,3.01125 9.5,3.01125 3.96375,0 6.76375,-1.0025 9.44,-2.98125 3.07375,-2.28125 4.63249,-5.3125 4.63249,-9.005 0,-3.6125 -1.56999,-6.62125 -4.66124,-8.945 M 253.125,26.06575 c 0,0.17875 -0.0925,0.2125 -0.20875,0.0762 L 239.005,9.64945 c -0.115,-0.13625 -0.22749,-0.27 -0.25,-0.295 -0.0238,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37251,0 c -0.17875,0 -0.32499,0.14625 -0.32499,0.32625 l 0,21.98375 c 0,0.17875 0.14625,0.325 0.32499,0.325 l 3.63875,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-17 c 0,-0.17875 0.095,-0.215 0.21125,-0.0775 l 14.69625,17.155 c 0.11625,0.1375 0.35875,0.2475 0.5375,0.2475 l 3.60625,0 c 0.17875,0 0.32625,-0.14625 0.32625,-0.325 l 0,-21.98375 c 0,-0.18 -0.1475,-0.32625 -0.32625,-0.32625 l -3.63875,0 c -0.17875,0 -0.325,0.14625 -0.32375,0.32625 l 0.0588,16.4325 z m -28.38462,5.551 c 0,0.17875 0.14625,0.32625 0.325,0.32625 l 3.63625,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-21.98375 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -3.63625,0 c -0.17875,0 -0.325,0.1475 -0.325,0.32625 l 0,21.98375 z M 215.79413,17.35 c 0,0.17875 -0.14625,0.32625 -0.32624,0.32625 l -13.23876,0 c -0.17874,0 -0.32499,-0.1475 -0.32499,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.14626,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.325 l 0,21.985 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.635,0 c 0.17874,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.32499,-0.325 l 13.23876,0 c 0.17999,0 0.32624,0.14625 0.32624,0.325 l 0,9.75125 c 0,0.17875 0.145,0.325 0.325,0.325 l 3.63375,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63375,0 c -0.18,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z m -41.94975,-2.53537 c 1.88875,-1.515 4.375,-2.2825 7.3875,-2.2825 3.9875,0 7.04001,1.105 9.3875,3.5425 0.0888,0.0913 0.2,0.0175 0.37,-0.0412 l 3.31,-1.165 c 0.16875,-0.06 0.25,-0.17875 0.18375,-0.265 -3.04374,-3.9975 -7.5725,-5.9975 -13.25125,-5.9975 -3.945,0 -7.3025,1.0125 -9.98125,3.0125 -3.09625,2.3025 -4.66499,5.31125 -4.66499,8.94375 0,3.695 1.54875,6.7275 4.60249,9.0075 2.65751,1.97625 6.03751,2.9825 10.04375,2.9825 2.85375,0 5.33375,-0.4425 7.39501,-1.25375 3.42499,-1.345 5.62374,-4.14625 5.6875,-4.21875 0.0637,-0.0738 -0.0112,-0.205 -0.16876,-0.29 l -3.12124,-1.70375 c -0.15875,-0.085 -0.27126,-0.17625 -0.36251,-0.0738 -1.81124,2.035 -5.26625,3.7225 -9.21249,3.6175 -3.19876,-0.0875 -5.76751,-0.755 -7.635,-2.24 -1.85126,-1.47 -2.78751,-3.43125 -2.78751,-5.8275 0,-2.3125 0.94625,-4.24875 2.8175,-5.7475 m -7.60588,-5.182 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -22.65625,0 c -0.18,0 -0.32624,0.1475 -0.32624,0.32625 l 0,3.21375 c 0,0.18 0.14625,0.325 0.32624,0.325 l 8.86001,0 c 0.17875,0 0.32499,0.1475 0.32499,0.32625 l 0,18.11875 c 0,0.17875 0.14626,0.32625 0.325,0.32625 l 3.63375,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-18.11875 c 0,-0.17875 0.14626,-0.32625 0.325,-0.32625 l 8.8625,0 c 0.17875,0 0.325,-0.145 0.325,-0.325 l 0,-3.21375 z m -31.27712,13.68275 c 0.0738,1.9225 -0.6975,3.17375 -2.13375,4.04125 -1.32375,0.79875 -2.83749,1.33125 -5.92374,1.33125 -3.08376,0 -4.61251,-0.5325 -5.95376,-1.33125 -1.45875,-0.8675 -2.24375,-2.25 -2.165,-4.04125 l 0,-13.6825 c 0,-0.18 -0.1475,-0.32625 -0.325,-0.32625 l -3.6375,0 c -0.17875,0 -0.32375,0.14625 -0.32375,0.32625 l 0,14.56625 c -0.11625,2.53125 1.18876,4.655 3.53751,6.14625 2.52374,1.59 5.17249,2.26875 8.86749,2.26875 3.69625,0 6.3325,-0.68 8.80625,-2.26875 2.35,-1.47125 3.61376,-3.435 3.54001,-6.14625 l 0,-14.56625 c 0,-0.18 -0.14626,-0.32625 -0.32501,-0.32625 l -3.63874,0 c -0.17876,0 -0.325,0.14625 -0.325,0.32625 l 0,13.6825 z M 106.27963,17.35 c 0,0.17875 -0.14625,0.32625 -0.32499,0.32625 l -13.24001,0 c -0.17875,0 -0.325,-0.1475 -0.325,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.145,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,21.985 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.635,0 c 0.18,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.325,-0.325 l 13.24001,0 c 0.17874,0 0.32499,0.14625 0.32499,0.325 l 0,9.75125 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.63501,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63501,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z\" fill=\"#142559\"/>" +
            "<path d=\"m 71.649,41.26738 1.14626,0 0,-41.265 -1.14626,0 0,41.265 z\" fill=\"#142559\"/>" +
            "<path d=\"m 27.15738,40.08775 c 2.0225,1.69 5.26,1.4575 7.27625,-0.5 L 54.28238,19.0065 c 1.30375,-1.5625 1.84875,-6.935 -5.055,-6.95125 -0.135,0 -16.035,0.006 -16.035,0.006 -1.23375,0 -3.09625,0.84375 -4.05875,1.845 l -4.0175,4.18 c -0.45375,0.4675 -0.57125,0.61 -0.485,0.80625 0.1425,0.15125 0.18125,0.12125 0.5925,0.12125 l 12.1325,0.006 c 4.02625,-0.085 4.255,0.20625 4.5225,0.8575 0.15625,0.38125 0.0588,1.24375 -0.975,2.3 l -7.87125,8.0075 c -0.67,0.6775 -1.605,1.06875 -2.57,1.06875 -0.90375,-10e-4 -1.76,-0.3325 -2.405,-0.93625 l -7.17125,-6.645 c -0.66875,-0.6225 -1.0575,-1.475 -1.095,-2.39875 -0.0337,-0.94375 0.3025,-1.84875 0.94625,-2.5375 l 8.33125,-8.95115 c 1.19875,-1.29 3.39375,-2.30125 4.995,-2.30125 l 18.0875,0.009 c 1.24875,0.002 3.15625,-0.795 4.16875,-1.74 l 5.32375,-4.96875 c 0.35125,-0.375 0.5475,-0.63 0.50625,-0.69875 C 62.09858,1e-4 61.97238,0.0126 61.58863,0.0138 L 29.75238,0 c -1.23,0 -3.0575,0.87125 -3.995,1.905 l -15.91,18.0475 c -0.8225,0.9075 -0.78,2.29875 0.09,3.1075 l 17.22,17.0275 z M 0.59375,12.0755 C 0.2,12.0765 0,12.0755 0,12.19175 0,12.358 0.0438,12.4305 0.51876,12.90425 l 4.88499,4.7425 c 0.81375,0.79 2.2175,0.71625 2.985,-0.15375 l 3.845,-4.355 c 0.54375,-0.6975 0.5,-0.765 0.45375,-0.8975 -0.0575,-0.165 -0.20375,-0.16 -0.62,-0.16 L 0.59375,12.0755 z\" fill=\"#E21C2A\"/>" +
            "</svg>" +
            "</div>" +

            /* Red accent line */
            "<div style=\"width:40px; height:2px; background:#E21C2A; margin:0 auto 16px auto; border-radius:2px; font-size:0; line-height:0;\">&nbsp;</div>" +

            /* Footer text */
            "<p style=\"font-size:12px; color:#A0AEC0; line-height:1.6; margin:0 0 4px 0; font-family:'Inter',Arial,Helvetica,sans-serif;\">© " + java.time.Year.now().getValue() + " Hutchinson – Plateforme de demandes internes</p>" +
            "<p style=\"font-size:12px; color:#A0AEC0; line-height:1.6; margin:0; font-family:'Inter',Arial,Helvetica,sans-serif;\">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>" +

            /* Legal */
            "<p style=\"font-size:11px; color:#CBD5E0; margin:12px 0 0 0; line-height:1.5; font-family:'Inter',Arial,Helvetica,sans-serif;\">Hutchinson SA — Responsable du traitement des données personnelles</p>" +

            "</div>" +

            "</div>" +
            "</td></tr></table>" +
            "</div>" +
            "</body></html>";

        emailService.sendHtmlEmail(email, "Réinitialisation de votre mot de passe — Hutchinson", htmlContent);

        System.out.println("=== LIEN DE RÉINITIALISATION : " + resetUrl);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide ou expiré"));
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Le token a expiré");
        }

        PasswordValidator.validate(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setFirstLogin(false);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUserTransactional(Long userId) {
        User toDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Soft delete : désactiver le compte
        toDelete.setActive(false);
        // Anonymiser les données personnelles
        toDelete.setEmail("deleted_" + toDelete.getEmail());
        toDelete.setFirstName("Compte");
        toDelete.setLastName("désactivé");
        // Ne pas toucher au mot de passe pour éviter les conflits
        userRepository.save(toDelete);
    }
}