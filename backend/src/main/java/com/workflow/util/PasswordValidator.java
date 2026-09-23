package com.workflow.util;

import java.util.regex.Pattern;

public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^a-zA-Z0-9]");

    public static void validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins " + MIN_LENGTH + " caractères.");
        }
        if (!UPPER.matcher(password).find()) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins une majuscule.");
        }
        if (!LOWER.matcher(password).find()) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins une minuscule.");
        }
        if (!DIGIT.matcher(password).find()) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins un chiffre.");
        }
        if (!SPECIAL.matcher(password).find()) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins un caractère spécial (@, #, $, etc.).");
        }
    }
}