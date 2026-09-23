package com.workflow.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    private static final String FROM_EMAIL = "noreply@hutchinson.com";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String text) {
        if (!emailEnabled) {
            logger.info("Email désactivé – envoi simulé à {}", to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Échec envoi email simple à {} : {}", to, e.getMessage(), e);
            // Ne pas propager l'exception – on continue le traitement métier
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!emailEnabled) {
            logger.info("Email désactivé – envoi simulé à {}", to);
            return;
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            logger.error("Échec envoi email HTML à {} : {}", to, e.getMessage(), e);
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        if (!emailEnabled) {
            logger.info("Email désactivé – envoi simulé avec pièce jointe à {}", to);
            return;
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setFrom(FROM_EMAIL);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(filename, new ByteArrayResource(attachment));
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            logger.error("Échec envoi email avec pièce jointe à {} : {}", to, e.getMessage(), e);
        }
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}