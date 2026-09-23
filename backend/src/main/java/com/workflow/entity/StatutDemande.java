package com.workflow.entity;

public enum StatutDemande {
    PENDING,      // en attente de validation
    APPROVED,     // approuvée (toutes étapes validées)
    REJECTED,     // rejetée (stop workflow)
    CANCELLED     // annulée par demandeur
}