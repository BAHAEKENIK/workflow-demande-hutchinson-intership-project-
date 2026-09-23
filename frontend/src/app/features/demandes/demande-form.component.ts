import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, takeUntil, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DemandeService } from '../../core/services/demande.service';
import { UserService, User } from '../../core/services/user.service';
import { DepartmentService, Department } from '../../core/services/department.service';
import { WorkflowService, Workflow } from '../../core/services/workflow.service';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="form-container">
      <!-- Aurora Background -->
      <div class="bg-aurora">
        <div class="aurora-layer aurora-1"></div>
        <div class="aurora-layer aurora-2"></div>
        <div class="aurora-layer aurora-3"></div>
        <div class="aurora-layer aurora-4"></div>
      </div>
      <div class="bg-noise"></div>
      <div class="bg-grid"></div>

      <!-- Floating Particles -->
      <div class="particles">
        <div class="particle p1"></div>
        <div class="particle p2"></div>
        <div class="particle p3"></div>
        <div class="particle p4"></div>
        <div class="particle p5"></div>
        <div class="particle p6"></div>
        <div class="particle p7"></div>
        <div class="particle p8"></div>
      </div>

      <div class="form-content">
        <!-- Page header -->
        <div class="page-header">
          <div class="header-badge">
            <div class="header-icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div class="badge-pulse"></div>
          </div>
          <div class="header-text">
            <div class="header-eyebrow">
              <span class="eyebrow-dot"></span>
              Nouvelle Demande
            </div>
            <h2>{{ 'DEMANDE_FORM.TITLE' | translate }}</h2>
          </div>
        </div>

        <!-- ALERTE : Aucun workflow par défaut actif -->
        <div *ngIf="!defaultWorkflow" class="alert alert-danger">
  ⚠️ {{ 'WORKFLOW.NO_ACTIVE_DEFAULT' | translate }}
</div>

        <form [formGroup]="demandeForm" (ngSubmit)="onSubmit()" class="demande-form">

          <!-- ====== SECTION 1: General Info ====== -->
          <div class="form-section" style="--delay: 0.05s">
            <div class="section-header">
              <div class="section-number">01</div>
              <div class="section-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <span class="section-title">{{ 'DEMANDE_FORM.GENERAL_INFO' | translate }}</span>
              <div class="section-line"></div>
            </div>
            <div class="section-body">
              <div class="field-group">
                <label class="field-label">{{ 'DEMANDE_FORM.TITLE_LABEL' | translate }} <span class="required"></span></label>
                <input type="text" formControlName="titre" class="field-input" [class.field-error]="demandeForm.get('titre')?.invalid && demandeForm.get('titre')?.touched" [placeholder]="'DEMANDE_FORM.TITLE_PLACEHOLDER' | translate">
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'DEMANDE_FORM.DESCRIPTION_LABEL' | translate }}</label>
                <textarea rows="3" formControlName="description" class="field-input field-textarea" [placeholder]="'DEMANDE_FORM.DESC_PLACEHOLDER' | translate"></textarea>
              </div>
              <div style="display: flex; gap: 10px; align-items: center; margin-top: 0.5rem;">
                <!-- Bouton affiché uniquement si un workflow par défaut existe -->
                <button *ngIf="defaultWorkflow" type="button" class="btn-workflow" (click)="openWorkflowModal()">
                  <span class="btn-workflow-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
                      <path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.VIEW_WORKFLOW' | translate }}
                  <span class="btn-workflow-arrow">→</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ====== SECTION 1bis: Localisation & Responsable ====== -->
          <div class="form-section" style="--delay: 0.08s">
            <div class="section-header">
              <div class="section-number">02</div>
              <div class="section-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span class="section-title">{{ 'DEMANDE_FORM.SECTION_LOCATION' | translate }}</span>
              <div class="section-line"></div>
            </div>
            <div class="section-body">
              <div class="field-row">
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.LOCATION' | translate }}</label>
                  <input type="text" formControlName="localisation" class="field-input" [placeholder]="'DEMANDE_FORM.LOCATION_PLACEHOLDER' | translate">
                </div>
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.RESPONSIBLE_NAME' | translate }}</label>
                  <input type="text" formControlName="responsableNom" class="field-input" [placeholder]="'DEMANDE_FORM.RESPONSIBLE_PLACEHOLDER' | translate">
                </div>
              </div>
              <div class="field-group field-group-compact">
                <label class="field-label">{{ 'DEMANDE_FORM.GENERAL_OBSERVATIONS' | translate }}</label>
                <textarea rows="2" formControlName="observationsGenerales" class="field-input field-textarea" [placeholder]="'DEMANDE_FORM.OBSERVATIONS_PLACEHOLDER' | translate"></textarea>
              </div>
            </div>
          </div>

          <!-- ====== SECTION 2: Extra Steps ====== -->
          <div class="form-section" style="--delay: 0.1s">
            <div class="section-header">
              <div class="section-number">03</div>
              <div class="section-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="18" r="3"/>
                  <circle cx="6" cy="6" r="3"/>
                  <path d="M13 6h3a2 2 0 0 1 2 2v7"/>
                  <path d="M6 9v12"/>
                </svg>
              </div>
              <span class="section-title">{{ 'DEMANDE_FORM.EXTRA_STEPS' | translate }}</span>
              <div class="section-line"></div>
            </div>
            <div class="section-body">
              <div class="supp-columns">
                <div class="supp-column">
                  <div class="supp-col-header">
                    <span class="supp-col-dot local"></span>
                    <h4>{{ 'DEMANDE_FORM.LOCAL_DEPTS' | translate }}</h4>
                  </div>
                  <div class="supp-list">
                    <div *ngFor="let dept of departementsLocaux" class="supp-item">
                      <label class="checkbox-label">
                        <input type="checkbox" [checked]="selectedLocauxIds.includes(dept.id)" (change)="toggleLocal(dept.id)">
                        <span class="checkmark"></span>
                        <span class="supp-item-name">{{ dept.name }}</span>
                      </label>
                    </div>
                    <div *ngIf="departementsLocaux.length === 0" class="supp-empty">Aucun département local</div>
                  </div>
                </div>
                <div class="supp-divider"></div>
                <div class="supp-column">
                  <div class="supp-col-header">
                    <span class="supp-col-dot extern"></span>
                    <h4>{{ 'DEMANDE_FORM.EXTERNAL_DEPTS' | translate }}</h4>
                  </div>
                  <div class="supp-list">
                    <div *ngFor="let dept of departementsExternes" class="supp-item">
                      <label class="checkbox-label">
                        <input type="checkbox" [checked]="selectedExternesIds.includes(dept.id)" (change)="toggleExternal(dept.id)">
                        <span class="checkmark"></span>
                        <span class="supp-item-name">{{ dept.name }}</span>
                      </label>
                    </div>
                    <div *ngIf="departementsExternes.length === 0" class="supp-empty">Aucun département externe</div>
                  </div>
                </div>
              </div>

              <!-- Ordered list -->
              <div *ngIf="getOrderedSupplementaires().length > 0" class="order-section">
                <div class="order-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  <span>{{ 'DEMANDE_FORM.EXTRA_ORDER' | translate }}</span>
                  <span class="order-count">{{ getOrderedSupplementaires().length }}</span>
                </div>
                <div class="order-list">
                  <div *ngFor="let dept of getOrderedSupplementaires(); let i = index" class="order-item">
                    <span class="order-rank">{{ i + 1 }}</span>
                    <span class="order-name">{{ dept.name }}</span>
                    <span class="order-badge" [class.local]="dept.local" [class.extern]="!dept.local">
                      {{ dept.local ? 'T/' : 'Z/' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ====== SECTION 3: Requester ====== -->
          <div class="form-section" style="--delay: 0.15s">
            <div class="section-header">
              <div class="section-number">04</div>
              <div class="section-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span class="section-title">{{ 'DEMANDE_FORM.REQUESTER' | translate }}</span>
              <div class="section-line"></div>
            </div>
            <div class="section-body">
              <div class="radio-group">
                <label class="radio-card" [class.selected]="demandeForm.get('demandeurMode')?.value === 'existing'">
                  <input type="radio" value="existing" formControlName="demandeurMode" class="radio-hidden">
                  <span class="radio-indicator">
                    <span class="radio-dot"></span>
                  </span>
                  <div class="radio-content">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{{ 'DEMANDE_FORM.EXISTING_EMPLOYEE' | translate }}</span>
                  </div>
                </label>
                <label class="radio-card" [class.selected]="demandeForm.get('demandeurMode')?.value === 'new'">
                  <input type="radio" value="new" formControlName="demandeurMode" class="radio-hidden">
                  <span class="radio-indicator">
                    <span class="radio-dot"></span>
                  </span>
                  <div class="radio-content">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    <span>{{ 'DEMANDE_FORM.NEW_EMPLOYEE' | translate }}</span>
                  </div>
                </label>
              </div>

              <!-- Existing employee -->
              <div class="mode-panel" [class.open]="demandeForm.get('demandeurMode')?.value === 'existing'">
                <div class="field-group">
                  <label class="field-label">{{ 'DEMANDE_FORM.SELECT_EMPLOYEE' | translate }}</label>
                  <div class="select-wrap">
                    <select formControlName="demandeurId" class="field-input field-select">
                      <option [ngValue]="null">{{ 'COMMON.CHOOSE' | translate }}</option>
                      <option *ngFor="let emp of employees" [ngValue]="emp.id">
                        {{ emp.firstName }} {{ emp.lastName }} ({{ emp.email }})
                      </option>
                    </select>
                    <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
                <button type="button" class="btn-reset" *ngIf="showResetButton" (click)="resetFormDetails()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  {{ 'DEMANDE_FORM.RESET_DETAILS' | translate }}
                </button>
              </div>

              <!-- New employee -->
              <div class="mode-panel" [class.open]="demandeForm.get('demandeurMode')?.value === 'new'">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">{{ 'COMMON.FIRSTNAME' | translate }}</label>
                    <input type="text" formControlName="newDemandeurPrenom" class="field-input" [placeholder]="'DEMANDE_FORM.FIRSTNAME_PLACEHOLDER' | translate">
                  </div>
                  <div class="field-group">
                    <label class="field-label">{{ 'COMMON.LASTNAME' | translate }}</label>
                    <input type="text" formControlName="newDemandeurNom" class="field-input" [placeholder]="'DEMANDE_FORM.LASTNAME_PLACEHOLDER' | translate">
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">
                    {{ 'COMMON.EMAIL' | translate }}
                    <span class="optional-badge">({{ 'COMMON.OPTIONAL' | translate }})</span>
                  </label>
                  <input type="email" formControlName="newDemandeurEmail" class="field-input" [placeholder]="'DEMANDE_FORM.EMAIL_PLACEHOLDER' | translate">
                </div>
              </div>
            </div>
          </div>

          <!-- ====== SECTION 4: Request Details (with simplified telephony) ====== -->
          <div class="form-section" style="--delay: 0.2s">
            <div class="section-header">
              <div class="section-number">05</div>
              <div class="section-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <span class="section-title">{{ 'DEMANDE_FORM.REQUEST_DETAILS' | translate }}</span>
              <div class="section-line"></div>
            </div>
            <div class="section-body">

              <!-- Services Généraux -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 3 20 16 16 11 16 8"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_SERVICES' | translate }}
                </h4>
                <div class="checks-grid">
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="mobilier"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.FURNITURE' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="carteRestaurant"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.MEAL_VOUCHER' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="carteCafe"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.COFFEE_CARD' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="parkingInterieur"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.INDOOR_PARKING' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="casier"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.LOCKER' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="photocopiePermis"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.COPY_PERMIT' | translate }}</label>
                </div>
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.OTHER_SERVICES' | translate }}</label>
                  <input type="text" formControlName="autreServicesGeneraux" class="field-input" [placeholder]="'DEMANDE_FORM.OTHER_SERVICES_PLACEHOLDER' | translate">
                </div>
              </div>

              <!-- Téléphonie (simplified) -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_TELEPHONY' | translate }}
                </h4>
                <div class="checks-grid">
                  <label class="check-label">
                    <span class="check-box">
                      <input type="checkbox" formControlName="telephoneMobile">
                      <span class="check-mark"></span>
                    </span>
                    {{ 'DEMANDE_FORM.MOBILE_PHONE' | translate }}
                  </label>
                </div>
                <!-- Sélecteur d’heures conditionnel -->
                <div class="field-group field-group-compact" *ngIf="demandeForm.get('telephoneMobile')?.value" style="margin-top: 12px;">
                  <label class="field-label">{{ 'DEMANDE_FORM.LINE_TYPE' | translate }}</label>
                  <select formControlName="typeLigne" class="field-input field-select">
                    <option value="">{{ 'COMMON.CHOOSE' | translate }}</option>
                    <option value="6h">6h</option>
                    <option value="15h">15h</option>
                    <option value="22h">22h</option>
                  </select>
                </div>
                <!-- Champ "Autre téléphonie" conservé -->
                <div class="field-group field-group-compact" style="margin-top: 12px;">
                  <label class="field-label">{{ 'DEMANDE_FORM.OTHER_TELEPHONY' | translate }}</label>
                  <input type="text" formControlName="autreTelephonie" class="field-input" [placeholder]="'DEMANDE_FORM.OTHER_PLACEHOLDER' | translate">
                </div>
              </div>

              <!-- Informatique -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_COMPUTER' | translate }}
                </h4>
                <div class="checks-grid">
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="ordinateurBureau"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.DESKTOP' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="ordinateurPortable"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.LAPTOP' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="carteNomade"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.NOMAD_CARD' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="connexionExterne"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.EXTERNAL_CONNECTION' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="utilisateurPvd"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.PVD_USER' | translate }}</label>
                </div>
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.OTHER_COMPUTER' | translate }}</label>
                  <input type="text" formControlName="autreOrdinateur" class="field-input" [placeholder]="'DEMANDE_FORM.OTHER_PLACEHOLDER' | translate">
                </div>
              </div>

              <!-- Messagerie -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_MAIL' | translate }}
                </h4>
                <div class="checks-grid">
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="courrierOffice365"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.OFFICE_365' | translate }}</label>
                </div>
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.OTHER_IT' | translate }}</label>
                  <input type="text" formControlName="autreServiceIt" class="field-input" [placeholder]="'DEMANDE_FORM.OTHER_PLACEHOLDER' | translate">
                </div>
              </div>

              <!-- ================= ACCÈS PROGRAMMES ================= -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  {{ 'ACCES_PROGRAMAS.TITLE' | translate }}
                </h4>

                <!-- Aplicaciones -->
                <div class="sub-block">
                  <div class="sub-header">
                    <span class="sub-icon">📱</span>
                    <span>{{ 'ACCES_PROGRAMAS.APLICACIONES' | translate }}</span>
                  </div>
                  <div class="checks-grid">
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.macpac')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.MACPAC' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.sacha')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.SACHA' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.kp')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.KP' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.biff')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.BIFF' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.bifc')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.BIFC' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.facfix')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.FACFIX' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.prodstar')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.PRODSTAR' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.web_clients')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.WEB_CLIENTS' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.d_desel')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.D_DESEL' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.ppm')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.PPM' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.cdp_std')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.CDP_STD' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.cdp_sct')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.CDP_SCT' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.sap_fi_co')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.SAP_FI_CO' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.webproc')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.WEBPROC' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.banca_online')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.BANCA_ONLINE' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.thehmis')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.THEHMIS' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.helios')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.HELIOS' | translate }}</label>
                    <label class="check-label"><span class="check-box"><input type="checkbox" [formControl]="getAccesControl('aplicaciones.cap')"><span class="check-mark"></span></span>{{ 'ACCES_PROGRAMAS.CAP' | translate }}</label>
                  </div>
                </div>

                <!-- SharePoint Tanger -->
                <div class="sub-block">
                  <div class="sub-header">
                    <span class="sub-icon">📁</span>
                    <span>{{ 'ACCES_PROGRAMAS.SHAREPOINT_TANGER' | translate }}</span>
                  </div>
                  <div class="checkbox-item">
                    <label class="check-label">
                      <span class="check-box"><input type="checkbox" formControlName="sharepointTanger"><span class="check-mark"></span></span>
                      {{ 'ACCES_PROGRAMAS.SHAREPOINT_TANGER_ACTIVO' | translate }}
                    </label>
                  </div>
                </div>

                <!-- SharePoint Couradir -->
                <div class="sub-block">
                  <div class="sub-header">
                    <span class="sub-icon">📁</span>
                    <span>{{ 'ACCES_PROGRAMAS.SHAREPOINT_COURADIR' | translate }}</span>
                  </div>
                  <div class="checkbox-item">
                    <label class="check-label">
                      <span class="check-box"><input type="checkbox" formControlName="sharepointCouradir"><span class="check-mark"></span></span>
                      {{ 'ACCES_PROGRAMAS.SHAREPOINT_COURADIR_ACTIVO' | translate }}
                    </label>
                  </div>
                </div>
              </div>
              <!-- ================= END ACCÈS PROGRAMMES ================= -->

              <!-- Banque -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_BANK' | translate }}
                </h4>
                <div class="checks-grid">
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="banqueThemis"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.THEMIS' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="banqueHypervision"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.HYPERVISION' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="banqueHelios"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.HELIOS' | translate }}</label>
                  <label class="check-label"><span class="check-box"><input type="checkbox" formControlName="banqueCap"><span class="check-mark"></span></span>{{ 'DEMANDE_FORM.CAP' | translate }}</label>
                </div>
                <div class="field-group field-group-compact">
                  <label class="field-label">{{ 'DEMANDE_FORM.OTHER_BANK' | translate }}</label>
                  <input type="text" formControlName="autreBanque" class="field-input" [placeholder]="'DEMANDE_FORM.OTHER_PLACEHOLDER' | translate">
                </div>
              </div>

              <!-- Autre besoins -->
              <div class="detail-block">
                <h4 class="detail-block-title">
                  <span class="detail-block-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  {{ 'DEMANDE_FORM.SECTION_OTHER' | translate }}
                </h4>
                <div class="field-group field-group-compact">
                  <textarea rows="2" formControlName="autreBesoin" class="field-input field-textarea" [placeholder]="'DEMANDE_FORM.OTHER_NEEDS_PLACEHOLDER' | translate"></textarea>
                </div>
              </div>

            </div>
          </div>

          <!-- ====== ACTIONS ====== -->
          <div class="form-actions" style="--delay: 0.25s">
            <button type="button" class="btn-cancel" routerLink="/demandes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              {{ 'COMMON.CANCEL' | translate }}
            </button>
            <button type="submit" class="btn-submit" [disabled]="demandeForm.invalid || !defaultWorkflow">
              <span class="btn-submit-content">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                {{ 'DEMANDE_FORM.SUBMIT' | translate }}
              </span>
              <span class="btn-submit-shimmer"></span>
              <span class="btn-submit-glow"></span>
            </button>
          </div>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="error-toast">
            <div class="error-toast-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <span>{{ errorMessage }}</span>
          </div>

        </form>
      </div>
    </div>

    <!-- ====== ULTRA PRO MAX WORKFLOW MODAL ====== -->
    <div class="wf-overlay" *ngIf="showWorkflowModal" (click)="closeWorkflowModal()">
      <div class="wf-backdrop-blur"></div>
      <div class="wf-modal" (click)="$event.stopPropagation()">
        <div class="wf-modal-bg-pattern"></div>
        <div class="wf-glow wf-glow-1"></div>
        <div class="wf-glow wf-glow-2"></div>

        <!-- Modal Header -->
        <div class="wf-header">
          <div class="wf-header-left">
            <div class="wf-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
                <path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>
              </svg>
            </div>
            <div>
              <h3>{{ 'WORKFLOW.DETAILS_TITLE' | translate }}</h3>
              <p class="wf-header-sub">Parcours de validation par défaut</p>
            </div>
          </div>
          <button class="wf-close" (click)="closeWorkflowModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="wf-body" *ngIf="defaultWorkflow">
          <!-- Info Cards Row -->
          <div class="wf-info-row">
            <div class="wf-info-card">
              <span class="wf-info-label">{{ 'WORKFLOW.NAME' | translate }}</span>
              <span class="wf-info-value">{{ defaultWorkflow.nom }}</span>
            </div>
            <div class="wf-info-card">
              <span class="wf-info-label">{{ 'WORKFLOW.TYPE' | translate }}</span>
              <span class="wf-info-value">
                <span class="wf-type-badge" [class.standard]="defaultWorkflow.type === 'DEFAULT'" [class.custom]="defaultWorkflow.type !== 'DEFAULT'">
                  <span class="wf-type-dot"></span>
                  {{ defaultWorkflow.type === 'DEFAULT' ? ('WORKFLOW.TYPE_STANDARD' | translate) : ('WORKFLOW.TYPE_CUSTOM' | translate) }}
                </span>
              </span>
            </div>
            <div class="wf-info-card">
              <span class="wf-info-label">{{ 'WORKFLOW.STATUS' | translate }}</span>
              <span class="wf-info-value">
                <span class="wf-status-chip" [class.active]="defaultWorkflow.actif" [class.inactive]="!defaultWorkflow.actif">
                  <span class="wf-status-dot"></span>
                  {{ defaultWorkflow.actif ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
                </span>
              </span>
            </div>
          </div>

          <!-- ALERTE : workflow inactif -->
          <div *ngIf="!defaultWorkflow.actif" class="alert alert-warning" style="margin-bottom: 1.5rem; background: #fff3cd; border-left: 4px solid #ffc107; padding: 0.75rem 1rem; border-radius: 12px;">
  ⚠️ {{ 'WORKFLOW.WARNING_INACTIVE_DEFAULT' | translate }}
</div>

          <!-- Steps Timeline -->
          <div class="wf-steps-section">
            <div class="wf-steps-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{{ 'WORKFLOW.VALIDATION_ORDER' | translate }}</span>
              <span class="wf-steps-count" *ngIf="defaultWorkflow.etapes?.length">{{ defaultWorkflow.etapes?.length }} étapes</span>
            </div>

            <div class="wf-timeline" *ngIf="defaultWorkflow.etapes?.length; else noSteps">
              <div class="wf-timeline-track">
                <div class="wf-timeline-progress" [style.width.%]="100"></div>
              </div>
              <div *ngFor="let etape of defaultWorkflow.etapes; let i = index; let last = last" class="wf-timeline-node" [style.animation-delay]="i * 0.1 + 's'">
                <div class="wf-node-bullet">
                  <span class="wf-node-num">{{ i + 1 }}</span>
                  <div class="wf-node-ring"></div>
                </div>
                <div class="wf-node-card">
                  <div class="wf-node-card-header">
                    <strong class="wf-node-dept">{{ etape.department?.name || 'Département' }}</strong>
                    <span class="wf-node-status">{{ etape.statut }}</span>
                  </div>
                  <div class="wf-node-connector" *ngIf="!last">
                    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                      <path d="M6 0 L6 14 M2 10 L6 14 L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noSteps>
              <div class="wf-no-steps">
                <div class="wf-no-steps-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <span>{{ 'WORKFLOW.NO_STEPS' | translate }}</span>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="wf-footer">
          <button class="wf-btn-close" (click)="closeWorkflowModal()">
            {{ 'COMMON.CLOSE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX DEMANDE FORM STYLES ========== */
    /* (Les styles sont inchangés par rapport à votre code actuel) */
    /* Pour des raisons de lisibilité, les styles CSS complets sont conservés */
    .form-container {
      --bg-page: #f4f6fb;
      --bg-card: rgba(255, 255, 255, 0.72);
      --bg-card-hover: rgba(255, 255, 255, 0.85);
      --bg-card-solid: #ffffff;
      --bg-inset: #f7f8fc;
      --bg-input: #ffffff;
      --bg-input-hover: #fcfcfe;
      --text-primary: #0c1222;
      --text-secondary: #4a5568;
      --text-muted: #a0aec0;
      --text-inverse: #ffffff;
      --border-default: #e2e8f4;
      --border-subtle: #eef0f7;
      --border-focus: #1a2744;
      --brand: #1a2744;
      --brand-light: #253656;
      --brand-dark: #0f1a30;
      --accent: #dc2626;
      --accent-hover: #b91c1c;
      --accent-glow: rgba(220, 38, 38, 0.12);
      --sh-xs: 0 1px 2px rgba(10, 18, 40, 0.04);
      --sh-sm: 0 2px 8px rgba(10, 18, 40, 0.05), 0 1px 2px rgba(10, 18, 40, 0.03);
      --sh-md: 0 4px 16px rgba(10, 18, 40, 0.06), 0 1px 4px rgba(10, 18, 40, 0.04);
      --sh-lg: 0 8px 32px rgba(10, 18, 40, 0.07), 0 2px 8px rgba(10, 18, 40, 0.04);
      --sh-xl: 0 16px 48px rgba(10, 18, 40, 0.09), 0 4px 12px rgba(10, 18, 40, 0.05);
      --sh-section: 0 1px 3px rgba(10, 18, 40, 0.03), 0 6px 20px rgba(10, 18, 40, 0.04);
      --sh-section-hover: 0 2px 6px rgba(10, 18, 40, 0.04), 0 10px 30px rgba(10, 18, 40, 0.06);
      --sh-input: 0 0 0 3.5px rgba(26, 39, 68, 0.1);
      --sh-btn: 0 2px 8px rgba(26, 39, 68, 0.2), 0 8px 24px rgba(26, 39, 68, 0.08);
      --sh-btn-hover: 0 4px 12px rgba(26, 39, 68, 0.25), 0 12px 36px rgba(26, 39, 68, 0.12);
      --err-bg: #fef2f2;
      --err-border: #fca5a5;
      --err-color: #dc2626;
      --err-sh: 0 4px 20px rgba(220, 38, 38, 0.1);
      --chk-bg: #ffffff;
      --chk-border: #cbd5e0;
      --chk-active-bg: var(--brand);
      --chk-active-border: var(--brand);
      --badge-local-bg: rgba(26, 39, 68, 0.07);
      --badge-local-color: #1a2744;
      --badge-extern-bg: rgba(220, 38, 38, 0.07);
      --badge-extern-color: #dc2626;
      --detail-bg: var(--bg-inset);
      --detail-border: var(--border-subtle);
      --dot-local: #1a2744;
      --dot-extern: #dc2626;
      --grad-brand: linear-gradient(135deg, #0f1a30 0%, #1a2744 40%, #253656 100%);
      --grad-accent: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      --grad-section-hdr: linear-gradient(135deg, rgba(26, 39, 68, 0.025) 0%, transparent 100%);
      --aurora-1: rgba(26, 39, 68, 0.07);
      --aurora-2: rgba(220, 38, 38, 0.045);
      --aurora-3: rgba(59, 130, 246, 0.035);
      --aurora-4: rgba(139, 92, 246, 0.025);
      --grid-c: rgba(26, 39, 68, 0.02);
      --noise-opacity: 0.018;
      --wf-bg: #ffffff;
      --wf-bg-gradient: linear-gradient(165deg, #f8f9fe 0%, #ffffff 40%, #f9fafb 100%);
      --wf-glow-1: rgba(26, 39, 68, 0.08);
      --wf-glow-2: rgba(220, 38, 38, 0.06);
      --wf-border: rgba(226, 232, 244, 0.6);
    }
    :host-context(.dark-theme) .form-container {
      --bg-page: #050a16;
      --bg-card: rgba(13, 20, 38, 0.65);
      --bg-card-hover: rgba(13, 20, 38, 0.8);
      --bg-card-solid: #0d1426;
      --bg-inset: #0a1020;
      --bg-input: #0c1324;
      --bg-input-hover: #101a30;
      --text-primary: #eef2f9;
      --text-secondary: #8896b0;
      --text-muted: #3d4f6e;
      --text-inverse: #0c1222;
      --border-default: #182240;
      --border-subtle: #121c36;
      --border-focus: #dc2626;
      --brand: #dc2626;
      --brand-light: #ef4444;
      --brand-dark: #b91c1c;
      --accent: #dc2626;
      --accent-hover: #ef4444;
      --accent-glow: rgba(220, 38, 38, 0.18);
      --sh-xs: 0 1px 2px rgba(0, 0, 0, 0.25);
      --sh-sm: 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
      --sh-md: 0 4px 16px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.25);
      --sh-lg: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25);
      --sh-xl: 0 16px 48px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.3);
      --sh-section: 0 1px 3px rgba(0, 0, 0, 0.25), 0 6px 20px rgba(0, 0, 0, 0.2);
      --sh-section-hover: 0 2px 6px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.25);
      --sh-input: 0 0 0 3.5px rgba(220, 38, 38, 0.15);
      --sh-btn: 0 2px 8px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(220, 38, 38, 0.12);
      --sh-btn-hover: 0 4px 12px rgba(0, 0, 0, 0.4), 0 12px 36px rgba(220, 38, 38, 0.18);
      --err-bg: rgba(127, 29, 29, 0.25);
      --err-border: rgba(239, 68, 68, 0.25);
      --err-color: #f87171;
      --err-sh: 0 4px 20px rgba(220, 38, 38, 0.12);
      --chk-bg: #0c1324;
      --chk-border: #253656;
      --chk-active-bg: #dc2626;
      --chk-active-border: #dc2626;
      --badge-local-bg: rgba(136, 150, 176, 0.1);
      --badge-local-color: #c0ccdf;
      --badge-extern-bg: rgba(220, 38, 38, 0.1);
      --badge-extern-color: #f87171;
      --detail-bg: #0a1020;
      --detail-border: #121c36;
      --dot-local: #8896b0;
      --dot-extern: #f87171;
      --grad-brand: linear-gradient(135deg, #dc2626 0%, #ef4444 40%, #f87171 100%);
      --grad-accent: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      --grad-section-hdr: linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, transparent 100%);
      --aurora-1: rgba(220, 38, 38, 0.04);
      --aurora-2: rgba(26, 39, 68, 0.035);
      --aurora-3: rgba(59, 130, 246, 0.02);
      --aurora-4: rgba(139, 92, 246, 0.015);
      --grid-c: rgba(255, 255, 255, 0.012);
      --noise-opacity: 0.03;
      --wf-bg: #0d1426;
      --wf-bg-gradient: linear-gradient(165deg, #111d36 0%, #0d1426 40%, #0f1828 100%);
      --wf-glow-1: rgba(220, 38, 38, 0.06);
      --wf-glow-2: rgba(26, 39, 68, 0.05);
      --wf-border: rgba(24, 34, 64, 0.6);
    }
    /* Les animations clés et tous les styles restants sont exactement identiques à votre code */
    /* (Je les conserve tels quels pour la cohérence) */
    @keyframes containerIn { from { opacity: 0; transform: translateY(28px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes sectionIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes headerIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes auroraDrift1 { 0%,100% { transform: translate(0,0) rotate(0deg) scale(1); } 25% { transform: translate(60px,-40px) rotate(3deg) scale(1.08); } 50% { transform: translate(-30px,30px) rotate(-2deg) scale(0.95); } 75% { transform: translate(40px,20px) rotate(1deg) scale(1.03); } }
    @keyframes auroraDrift2 { 0%,100% { transform: translate(0,0) rotate(0deg) scale(1); } 25% { transform: translate(-50px,40px) rotate(-3deg) scale(1.06); } 50% { transform: translate(40px,-20px) rotate(2deg) scale(0.97); } 75% { transform: translate(-20px,-30px) rotate(-1deg) scale(1.04); } }
    @keyframes auroraDrift3 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(35px,25px) scale(1.05); } 66% { transform: translate(-25px,-15px) scale(0.98); } }
    @keyframes auroraDrift4 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-40px,35px) rotate(5deg); } }
    @keyframes particleFloat { 0%,100% { transform: translate(0,0) scale(1); opacity:0.4; } 25% { transform: translate(15px,-25px) scale(1.2); opacity:0.8; } 50% { transform: translate(-10px,-40px) scale(0.8); opacity:0.6; } 75% { transform: translate(20px,-15px) scale(1.1); opacity:0.9; } }
    @keyframes pulseRing { 0% { transform: scale(1); opacity:0.6; } 100% { transform: scale(2.2); opacity:0; } }
    @keyframes badgePulse { 0%,100% { box-shadow:0 0 0 0 rgba(26,39,68,0.2); } 50% { box-shadow:0 0 0 10px transparent; } }
    @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(240%); } }
    @keyframes glowPulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
    @keyframes errorSlide { from { opacity:0; transform: translateY(-12px) scale(0.95); } to { opacity:1; transform: translateY(0) scale(1); } }
    @keyframes itemIn { from { opacity:0; transform: translateX(-8px) scale(0.97); } to { opacity:1; transform: translateX(0) scale(1); } }
    @keyframes wfOverlayIn { from { opacity:0; } to { opacity:1; } }
    @keyframes wfModalIn { from { opacity:0; transform: translateY(32px) scale(0.95); } to { opacity:1; transform: translateY(0) scale(1); } }
    @keyframes wfNodeIn { from { opacity:0; transform: translateX(-20px) scale(0.9); } to { opacity:1; transform: translateX(0) scale(1); } }
    @keyframes wfGlowDrift { 0%,100% { transform: translate(0,0) scale(1); opacity:0.5; } 50% { transform: translate(20px,-10px) scale(1.1); opacity:0.8; } }
    @keyframes wfRingPulse { 0%,100% { transform: scale(1); opacity:0.3; } 50% { transform: scale(1.5); opacity:0; } }
    @keyframes progressGrow { from { width:0%; } to { width:100%; } }
    .form-container { position: relative; min-height: 100vh; background: var(--bg-page); overflow-x: hidden; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--text-primary); line-height: 1.5; -webkit-font-smoothing: antialiased; }
    .bg-aurora { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .aurora-layer { position: absolute; border-radius: 50%; filter: blur(100px); will-change: transform; }
    .aurora-1 { width: 600px; height:600px; background: var(--aurora-1); top:-15%; left:-8%; animation: auroraDrift1 24s ease-in-out infinite; }
    .aurora-2 { width: 500px; height:500px; background: var(--aurora-2); bottom:-10%; right:-8%; animation: auroraDrift2 28s ease-in-out infinite; }
    .aurora-3 { width: 400px; height:400px; background: var(--aurora-3); top:35%; left:55%; animation: auroraDrift3 20s ease-in-out infinite; }
    .aurora-4 { width: 350px; height:350px; background: var(--aurora-4); top:60%; left:15%; animation: auroraDrift4 22s ease-in-out infinite; }
    .bg-noise { position: fixed; inset:0; pointer-events:none; z-index:0; opacity: var(--noise-opacity); background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-repeat: repeat; background-size: 180px 180px; }
    .bg-grid { position: fixed; inset:0; pointer-events:none; z-index:0; background-image: linear-gradient(var(--grid-c) 1px, transparent 1px), linear-gradient(90deg, var(--grid-c) 1px, transparent 1px); background-size: 72px 72px; mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%); }
    .particles { position: fixed; inset:0; pointer-events:none; z-index:0; }
    .particle { position: absolute; width:4px; height:4px; border-radius:50%; background: var(--brand); opacity:0.3; }
    .p1 { top:12%; left:18%; animation: particleFloat 12s ease-in-out infinite; }
    .p2 { top:25%; left:75%; animation: particleFloat 15s ease-in-out infinite; animation-delay:-2s; width:3px; height:3px; }
    .p3 { top:45%; left:42%; animation: particleFloat 10s ease-in-out infinite; animation-delay:-4s; width:5px; height:5px; }
    .p4 { top:65%; left:85%; animation: particleFloat 14s ease-in-out infinite; animation-delay:-1s; }
    .p5 { top:78%; left:22%; animation: particleFloat 11s ease-in-out infinite; animation-delay:-3s; width:3px; height:3px; }
    .p6 { top:35%; left:60%; animation: particleFloat 13s ease-in-out infinite; animation-delay:-5s; width:6px; height:6px; opacity:0.15; }
    .p7 { top:88%; left:55%; animation: particleFloat 16s ease-in-out infinite; animation-delay:-6s; }
    .p8 { top:8%; left:50%; animation: particleFloat 9s ease-in-out infinite; animation-delay:-7s; width:3px; height:3px; }
    .form-content { position: relative; z-index:1; max-width: 840px; margin:0 auto; padding: 2.75rem 2rem 5rem; animation: containerIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .page-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2.75rem; padding-bottom: 2.25rem; border-bottom: 1px solid var(--border-subtle); animation: headerIn 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay:0.05s; }
    .header-badge { position: relative; flex-shrink:0; }
    .header-icon-wrap { width:54px; height:54px; background: var(--grad-brand); color: var(--text-inverse); border-radius:16px; display:flex; align-items:center; justify-content:center; box-shadow: var(--sh-md); animation: badgePulse 3.5s ease-in-out infinite; }
    .badge-pulse { position: absolute; inset:-4px; border-radius:20px; border:2px solid var(--brand); opacity:0; animation: pulseRing 2.5s ease-out infinite; pointer-events:none; }
    .header-eyebrow { display: flex; align-items: center; gap:0.4rem; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color: var(--text-muted); margin-bottom:0.35rem; }
    .eyebrow-dot { width:6px; height:6px; border-radius:50%; background: var(--accent); animation: glowPulse 2s ease-in-out infinite; }
    .header-text h2 { font-size:1.75rem; font-weight:800; letter-spacing:-0.5px; color: var(--text-primary); line-height:1.15; }
    .form-section { background: var(--bg-card); backdrop-filter: blur(20px) saturate(1.3); border-radius:22px; border:1px solid var(--border-subtle); box-shadow: var(--sh-section); margin-bottom:1.35rem; overflow:hidden; animation: sectionIn 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: var(--delay); transition: box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease; }
    .form-section:hover { box-shadow: var(--sh-section-hover); background: var(--bg-card-hover); border-color: var(--border-default); }
    .section-header { display: flex; align-items: center; gap:0.7rem; padding:1rem 1.5rem; background: var(--grad-section-hdr); border-bottom:1px solid var(--border-subtle); }
    .section-number { font-size:0.68rem; font-weight:800; color: var(--text-muted); letter-spacing:0.5px; opacity:0.6; font-variant-numeric: tabular-nums; }
    .section-icon { width:32px; height:32px; background: var(--bg-inset); border:1px solid var(--border-default); border-radius:9px; display:flex; align-items:center; justify-content:center; color: var(--brand); flex-shrink:0; }
    .section-title { font-size:0.88rem; font-weight:700; color: var(--text-primary); letter-spacing:-0.1px; white-space:nowrap; }
    .section-line { flex:1; height:1px; background: linear-gradient(90deg, var(--border-subtle), transparent 80%); margin-left:0.5rem; }
    .section-body { padding:1.5rem 1.5rem 1.65rem; }
    .field-group { margin-bottom:1.15rem; }
    .field-group:last-child { margin-bottom:0; }
    .field-group-compact { margin-bottom:0.85rem; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.15rem; }
    .field-label { display:block; font-size:0.72rem; font-weight:700; color: var(--text-secondary); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:0.4rem; }
    .required { color: var(--accent); font-weight:900; margin-left:1px; }
    .field-input { width:100%; max-width:100%; padding:0.72rem 1rem; border:1.5px solid var(--border-default); border-radius:13px; background: var(--bg-input); color: var(--text-primary); font-family:inherit; font-size:0.875rem; font-weight:450; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); outline:none; box-sizing:border-box; display:block; }
    .field-input::placeholder { color: var(--text-muted); font-weight:400; }
    .field-input:hover { border-color: var(--text-muted); background: var(--bg-input-hover); }
    .field-input:focus { border-color: var(--border-focus); box-shadow: var(--sh-input); background: var(--bg-input); }
    .field-input.field-error { border-color: var(--err-border); box-shadow:0 0 0 3.5px rgba(220,38,38,0.08); }
    .field-textarea { resize:vertical; min-height:64px; line-height:1.55; }
    .select-wrap { position:relative; }
    .field-select { appearance: none; -webkit-appearance: none; padding-right:2.5rem; cursor:pointer; }
    .select-arrow { position:absolute; right:14px; top:50%; transform:translateY(-50%); stroke: var(--text-muted); pointer-events:none; transition: all 0.25s ease; }
    .select-wrap:hover .select-arrow, .select-wrap:focus-within .select-arrow { stroke: var(--brand); transform: translateY(-50%) rotate(180deg); }
    .checks-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(195px, 1fr)); gap:0.35rem; margin-bottom:1rem; }
    .check-label { display:flex; align-items:center; gap:0.55rem; font-size:0.84rem; font-weight:500; color: var(--text-primary); cursor:pointer; padding:0.45rem 0.6rem; border-radius:10px; transition: background 0.18s ease; user-select:none; }
    .check-label:hover { background: var(--bg-inset); }
    .check-box { position:relative; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
    .check-box input { position:absolute; opacity:0; width:0; height:0; }
    .check-mark { width:18px; height:18px; border:2px solid var(--chk-border); border-radius:5px; background: var(--chk-bg); transition: all 0.2s cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; justify-content:center; }
    .check-mark::after { content:''; width:5px; height:9px; border:solid transparent; border-width:0 2px 2px 0; transform:rotate(45deg) scale(0); transition: all 0.15s cubic-bezier(0.16,1,0.3,1); margin-top:-2px; }
    .check-box input:checked + .check-mark { background: var(--chk-active-bg); border-color: var(--chk-active-border); box-shadow: 0 1px 6px rgba(26,39,68,0.15); }
    .check-box input:checked + .check-mark::after { border-color: var(--text-inverse); transform: rotate(45deg) scale(1); }
    .radio-group { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.25rem; }
    .radio-card { display:flex; align-items:center; gap:0.7rem; padding:0.85rem 1rem; border:1.5px solid var(--border-default); border-radius:14px; cursor:pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); background: var(--bg-input); user-select:none; position:relative; overflow:hidden; }
    .radio-card::before { content:''; position:absolute; inset:0; background: var(--grad-brand); opacity:0; transition: opacity 0.3s ease; }
    .radio-card:hover { border-color: var(--text-muted); background: var(--bg-input-hover); }
    .radio-card.selected { border-color: var(--chk-active-border); box-shadow: 0 0 0 3px rgba(26,39,68,0.1); }
    .radio-card.selected::before { opacity:0.04; }
    .radio-hidden { position:absolute; opacity:0; width:0; height:0; }
    .radio-indicator { width:20px; height:20px; border:2px solid var(--chk-border); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); background: var(--chk-bg); position:relative; z-index:1; }
    .radio-dot { width:10px; height:10px; border-radius:50%; background:transparent; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); transform:scale(0); }
    .radio-card.selected .radio-indicator { border-color: var(--chk-active-border); background: var(--chk-active-bg); }
    .radio-card.selected .radio-dot { background: var(--text-inverse); transform:scale(1); }
    .radio-content { display:flex; align-items:center; gap:0.55rem; color: var(--text-primary); font-size:0.84rem; font-weight:550; position:relative; z-index:1; }
    .radio-content svg { color: var(--text-muted); flex-shrink:0; transition: color 0.2s ease; }
    .radio-card.selected .radio-content svg { color: var(--chk-active-bg); }
    .mode-panel { display:grid; grid-template-rows:0fr; transition: grid-template-rows 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease; opacity:0; }
    .mode-panel.open { grid-template-rows:1fr; opacity:1; }
    .mode-panel > * { overflow:hidden; }
    .supp-columns { display:grid; grid-template-columns:1fr auto 1fr; gap:1.25rem; }
    .supp-divider { width:1px; background: linear-gradient(to bottom, transparent, var(--border-default), transparent); align-self:stretch; }
    .supp-col-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; }
    .supp-col-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .supp-col-dot.local { background: var(--dot-local); box-shadow:0 0 8px color-mix(in srgb, var(--dot-local) 50%, transparent); }
    .supp-col-dot.extern { background: var(--dot-extern); box-shadow:0 0 8px color-mix(in srgb, var(--dot-extern) 50%, transparent); }
    .supp-col-header h4 { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color: var(--text-secondary); }
    .supp-list { display:flex; flex-direction:column; gap:0.25rem; }
    .supp-item { padding:0.45rem 0.65rem; border-radius:10px; transition: background 0.18s ease; animation: itemIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .supp-item:hover { background: var(--bg-inset); }
    .checkbox-label { display:flex; align-items:center; gap:0.55rem; cursor:pointer; font-size:0.84rem; font-weight:500; color: var(--text-primary); }
    .checkbox-label input { position:absolute; opacity:0; width:0; height:0; }
    .checkmark { width:18px; height:18px; border:2px solid var(--chk-border); border-radius:5px; background: var(--chk-bg); display:inline-block; position:relative; flex-shrink:0; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
    .checkbox-label input:checked + .checkmark { background: var(--chk-active-bg); border-color: var(--chk-active-border); box-shadow: 0 1px 4px rgba(26,39,68,0.15); }
    .checkbox-label input:checked + .checkmark::after { content:''; position:absolute; left:5px; top:1px; width:5px; height:10px; border: solid var(--text-inverse); border-width:0 2px 2px 0; transform:rotate(45deg); }
    .supp-item-name { font-size:0.84rem; font-weight:500; color: var(--text-primary); }
    .supp-empty { font-size:0.78rem; color: var(--text-muted); font-style:italic; padding:0.5rem 0.65rem; }
    .order-section { margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid var(--border-subtle); }
    .order-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.7rem; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color: var(--text-secondary); }
    .order-count { background: var(--brand); color: var(--text-inverse); font-size:0.65rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:6px; margin-left:0.2rem; }
    .order-list { display:flex; flex-direction:column; gap:0.35rem; }
    .order-item { display:flex; align-items:center; gap:0.65rem; padding:0.55rem 0.75rem; background: var(--bg-inset); border:1px solid var(--border-subtle); border-radius:12px; animation: itemIn 0.3s cubic-bezier(0.16,1,0.3,1) both; transition: all 0.2s ease; }
    .order-item:hover { border-color: var(--border-default); transform:translateX(2px); }
    .order-rank { width:26px; height:26px; background: var(--grad-brand); color: var(--text-inverse); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; flex-shrink:0; font-variant-numeric: tabular-nums; }
    .order-name { flex:1; font-size:0.84rem; font-weight:600; color: var(--text-primary); }
    .order-badge { font-size:0.65rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:6px; letter-spacing:0.3px; flex-shrink:0; }
    .order-badge.local { background: var(--badge-local-bg); color: var(--badge-local-color); }
    .order-badge.extern { background: var(--badge-extern-bg); color: var(--badge-extern-color); }
    .detail-block { padding:1.1rem 1.15rem; background: var(--detail-bg); border:1px solid var(--detail-border); border-radius:15px; margin-bottom:0.85rem; transition: border-color 0.25s ease, box-shadow 0.25s ease; }
    .detail-block:last-child { margin-bottom:0; }
    .detail-block:hover { border-color: var(--border-default); box-shadow: var(--sh-xs); }
    .detail-block-title { display:flex; align-items:center; gap:0.5rem; font-size:0.76rem; font-weight:700; color: var(--text-primary); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.8rem; }
    .detail-block-icon { width:28px; height:28px; background: var(--bg-input); border:1px solid var(--border-default); border-radius:8px; display:flex; align-items:center; justify-content:center; color: var(--text-muted); flex-shrink:0; }
    .sub-block { margin-bottom:1.25rem; }
    .sub-block:last-child { margin-bottom:0; }
    .sub-header { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:700; color: var(--text-primary); margin-bottom:0.6rem; padding-left:0.25rem; }
    .sub-icon { font-size:1.1rem; }
    .checkbox-item { margin-top:0.5rem; }
    .btn-workflow { display:inline-flex; align-items:center; gap:0.55rem; padding:0.6rem 1.15rem; border:1.5px solid var(--border-default); border-radius:12px; background: var(--bg-input); color: var(--text-primary); font-weight:600; font-size:0.84rem; cursor:pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); font-family:inherit; }
    .btn-workflow-icon { display:flex; color: var(--brand); }
    .btn-workflow-arrow { color: var(--text-muted); transition: transform 0.2s ease, color 0.2s ease; font-size:1rem; }
    .btn-workflow:hover { border-color: var(--brand); background: var(--bg-input-hover); transform: translateY(-1px); box-shadow: var(--sh-sm); }
    .btn-workflow:hover .btn-workflow-arrow { transform: translateX(3px); color: var(--brand); }
    .btn-reset { display:inline-flex; align-items:center; gap:0.45rem; padding:0.5rem 0.9rem; border:1.5px dashed var(--border-default); border-radius:10px; background:transparent; color: var(--text-secondary); font-family:inherit; font-size:0.8rem; font-weight:600; cursor:pointer; transition: all 0.2s ease; margin-top:0.5rem; }
    .btn-reset:hover { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 4%, transparent); }
    .form-actions { display:flex; justify-content:flex-end; gap:0.85rem; margin-top:2rem; padding-top:1.5rem; animation: sectionIn 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: var(--delay); }
    .btn-cancel { display:inline-flex; align-items:center; gap:0.5rem; padding:0.72rem 1.5rem; border:1.5px solid var(--border-default); border-radius:14px; background: var(--bg-input); color: var(--text-secondary); font-family:inherit; font-size:0.88rem; font-weight:600; cursor:pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
    .btn-cancel:hover { border-color: var(--text-muted); color: var(--text-primary); background: var(--bg-input-hover); transform: translateY(-1px); box-shadow: var(--sh-sm); }
    .btn-submit { position:relative; display:inline-flex; align-items:center; overflow:hidden; border:none; padding:0.78rem 2.2rem; border-radius:14px; background: var(--grad-brand); color: var(--text-inverse); font-family:inherit; font-size:0.88rem; font-weight:700; cursor:pointer; box-shadow: var(--sh-btn); transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
    .btn-submit::before { content:''; position:absolute; inset:0; background: var(--grad-accent); opacity:0; transition: opacity 0.3s ease; }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--sh-btn-hover); }
    .btn-submit:hover:not(:disabled)::before { opacity:1; }
    .btn-submit:active:not(:disabled) { transform: translateY(0); box-shadow: var(--sh-btn); }
    .btn-submit:disabled { opacity:0.4; cursor:not-allowed; filter:grayscale(0.3); }
    .btn-submit-content { position:relative; z-index:1; display:inline-flex; align-items:center; gap:0.55rem; }
    .btn-submit-shimmer { position:absolute; top:0; left:0; width:35%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shimmer 4s ease-in-out infinite; z-index:2; pointer-events:none; }
    .btn-submit-glow { position:absolute; inset:-2px; border-radius:16px; background: var(--grad-brand); filter:blur(16px); opacity:0; z-index:-1; transition: opacity 0.3s ease; pointer-events:none; }
    .btn-submit:hover:not(:disabled) .btn-submit-glow { opacity:0.3; }
    .error-toast { display:flex; align-items:center; gap:0.7rem; padding:0.85rem 1.1rem; margin-top:1.25rem; background: var(--err-bg); border:1px solid var(--err-border); border-radius:14px; color: var(--err-color); font-size:0.86rem; font-weight:550; box-shadow: var(--err-sh); animation: errorSlide 0.35s cubic-bezier(0.16,1,0.3,1) both; }
    .error-toast-icon { width:34px; height:34px; border-radius:9px; background: color-mix(in srgb, var(--err-color) 8%, transparent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .alert { padding: 0.75rem 1rem; border-radius: 14px; margin-bottom: 1.25rem; font-size: 0.85rem; font-weight: 500; }
    .alert-danger { background: #fef2f2; border-left: 4px solid #dc2626; color: #b91c1c; }
    .alert-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e; }
    :host-context(.dark-theme) .alert-danger { background: rgba(127,29,29,0.3); color: #f87171; border-left-color: #f87171; }
    :host-context(.dark-theme) .alert-warning { background: rgba(120,53,15,0.3); color: #fbbf24; border-left-color: #fbbf24; }
    .wf-overlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; animation: wfOverlayIn 0.25s ease both; }
    .wf-backdrop-blur { position:absolute; inset:0; background: rgba(5,10,22,0.6); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); }
    .wf-modal { position: relative; z-index: 1; background: #ffffff; border-radius: 28px; width: 92%; max-width: 660px; max-height: 88vh; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(226, 232, 244, 0.8); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: wfModalIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
    :host-context(.dark-theme) .wf-modal { background: #0d1426; background: linear-gradient(165deg, #111d36 0%, #0d1426 40%, #0f1828 100%); border: 1px solid rgba(24, 34, 64, 0.6); box-shadow: 0 0 0 1px rgba(255,255,255,0.05), var(--sh-xl), 0 0 80px rgba(26,39,68,0.08); }
    .wf-modal-bg-pattern { position:absolute; inset:0; pointer-events:none; z-index:0; }
    .wf-glow { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
    .wf-glow-1 { width:350px; height:350px; background: var(--wf-glow-1); top:-120px; right:-80px; animation: wfGlowDrift 12s ease-in-out infinite; }
    .wf-glow-2 { width:300px; height:300px; background: var(--wf-glow-2); bottom:-100px; left:-60px; animation: wfGlowDrift 14s ease-in-out infinite; animation-delay:-4s; }
    .wf-header { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; padding: 1.75rem 2rem 1.5rem; border-bottom: 1px solid #eef0f7; background: #ffffff; }
    :host-context(.dark-theme) .wf-header { background: rgba(255,255,255,0.05); border-bottom-color: var(--border-subtle); }
    .wf-header-left { display: flex; align-items: flex-start; gap: 1rem; }
    .wf-header-icon { width: 48px; height: 48px; background: var(--grad-brand); color: var(--text-inverse); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--sh-md); }
    .wf-header h3 { font-size: 1.25rem; font-weight: 800; color: #0c1222; letter-spacing: -0.3px; line-height: 1.2; }
    :host-context(.dark-theme) .wf-header h3 { color: #f1f5f9; }
    .wf-header-sub { font-size: 0.8rem; color: #4a5568; font-weight: 450; margin-top: 0.2rem; }
    :host-context(.dark-theme) .wf-header-sub { color: #94a3b8; }
    .wf-close { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1.5px solid #e2e8f4; border-radius: 10px; background: #ffffff; color: #64748b; cursor: pointer; transition: all 0.25s ease; flex-shrink: 0; }
    :host-context(.dark-theme) .wf-close { background: #0c1324; border-color: #182240; color: #94a3b8; }
    .wf-close:hover { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 5%, transparent); transform: rotate(90deg); }
    .wf-body { position: relative; z-index: 1; padding: 1.75rem 2rem; overflow-y: auto; flex: 1; background: #ffffff; }
    :host-context(.dark-theme) .wf-body { background: transparent; }
    .wf-body::-webkit-scrollbar { width: 5px; }
    .wf-body::-webkit-scrollbar-track { background: #f1f5f9; }
    :host-context(.dark-theme) .wf-body::-webkit-scrollbar-track { background: #1e293b; }
    .wf-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    :host-context(.dark-theme) .wf-body::-webkit-scrollbar-thumb { background: #334155; }
    .wf-info-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.85rem; margin-bottom: 2rem; }
    .wf-info-card { padding: 1rem 1.1rem; background: #f8fafc; border: 1px solid #eef0f7; border-radius: 16px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    :host-context(.dark-theme) .wf-info-card { background: #0a1020; border-color: #121c36; }
    .wf-info-card:hover { border-color: #e2e8f4; box-shadow: var(--sh-xs); }
    :host-context(.dark-theme) .wf-info-card:hover { border-color: #182240; }
    .wf-info-label { display: block; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #64748b; margin-bottom: 0.45rem; }
    :host-context(.dark-theme) .wf-info-label { color: #8896b0; }
    .wf-info-value { display: block; font-size: 0.88rem; font-weight: 600; color: #0c1222; }
    :host-context(.dark-theme) .wf-info-value { color: #eef2f9; }
    .wf-type-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.78rem; font-weight: 700; }
    .wf-type-badge.standard { background: rgba(16,185,129,0.08); color: #059669; }
    .wf-type-badge.custom { background: rgba(139,92,246,0.08); color: #7c3aed; }
    .wf-type-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .wf-status-chip { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.78rem; font-weight: 700; }
    .wf-status-chip.active { background: rgba(16,185,129,0.08); color: #059669; }
    .wf-status-chip.inactive { background: rgba(156,163,175,0.08); color: #6b7280; }
    .wf-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .wf-status-chip.active .wf-status-dot { animation: glowPulse 2s ease-in-out infinite; }
    .wf-steps-section { margin-top: 0.5rem; }
    .wf-steps-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; }
    :host-context(.dark-theme) .wf-steps-header { color: #8896b0; }
    .wf-steps-count { font-size: 0.65rem; font-weight: 800; padding: 0.12rem 0.45rem; border-radius: 6px; background: var(--brand); color: white; margin-left: 0.2rem; }
    .wf-timeline { position: relative; padding-left: 2rem; }
    .wf-timeline-track { position: absolute; left: 17px; top: 0; bottom: 0; width: 2px; background: #eef0f7; border-radius: 2px; overflow: hidden; }
    :host-context(.dark-theme) .wf-timeline-track { background: #121c36; }
    .wf-timeline-progress { height: 100%; background: var(--grad-brand); border-radius: 2px; animation: progressGrow 1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.3s; }
    .wf-timeline-node { position: relative; margin-bottom: 0.85rem; animation: wfNodeIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
    .wf-timeline-node:last-child { margin-bottom: 0; }
    .wf-node-bullet { position: absolute; left: -2rem; top: 0.15rem; width: 36px; height: 36px; background: var(--grad-brand); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; z-index: 1; box-shadow: var(--sh-sm); }
    .wf-node-num { font-size: 0.72rem; font-weight: 800; font-variant-numeric: tabular-nums; position: relative; z-index: 1; }
    .wf-node-ring { position: absolute; inset: -3px; border-radius: 15px; border: 2px solid var(--brand); opacity: 0; animation: wfRingPulse 2.5s ease-out infinite; animation-delay: 0.5s; }
    .wf-node-card { margin-left: 0.25rem; }
    .wf-node-card-header { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 1rem; background: #f8fafc; border: 1px solid #eef0f7; border-radius: 14px; transition: all 0.2s ease; }
    :host-context(.dark-theme) .wf-node-card-header { background: #0a1020; border-color: #121c36; }
    .wf-node-card-header:hover { border-color: #e2e8f4; box-shadow: var(--sh-xs); }
    :host-context(.dark-theme) .wf-node-card-header:hover { border-color: #182240; }
    .wf-node-dept { font-size: 0.88rem; font-weight: 700; color: #0c1222; letter-spacing: -0.1px; }
    :host-context(.dark-theme) .wf-node-dept { color: #eef2f9; }
    .wf-node-status { font-size: 0.68rem; font-weight: 650; padding: 0.2rem 0.6rem; border-radius: 8px; background: #ffffff; border: 1px solid #eef0f7; color: #64748b; text-transform: capitalize; }
    :host-context(.dark-theme) .wf-node-status { background: #0c1324; border-color: #182240; color: #8896b0; }
    .wf-node-connector { display: flex; justify-content: center; padding: 0.15rem 0; color: #64748b; opacity: 0.4; }
    .wf-no-steps { display: flex; flex-direction: column; align-items: center; gap: 0.85rem; padding: 3rem 2rem; background: #f8fafc; border: 1px dashed #e2e8f4; border-radius: 20px; color: #64748b; font-size: 0.88rem; font-weight: 500; }
    :host-context(.dark-theme) .wf-no-steps { background: #0a1020; border-color: #182240; color: #8896b0; }
    .wf-no-steps-icon { color: #64748b; opacity: 0.5; }
    .wf-footer { position: relative; z-index: 1; padding: 1.25rem 2rem 1.75rem; display: flex; justify-content: flex-end; border-top: 1px solid #eef0f7; background: #ffffff; }
    :host-context(.dark-theme) .wf-footer { background: rgba(255,255,255,0.05); border-top-color: var(--border-subtle); }
    .wf-btn-close { padding: 0.6rem 1.8rem; border: 1.5px solid #e2e8f4; border-radius: 12px; background: #ffffff; color: #4a5568; font-family: inherit; font-size: 0.85rem; font-weight: 650; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
    :host-context(.dark-theme) .wf-btn-close { background: #0c1324; border-color: #182240; color: #8896b0; }
    .wf-btn-close:hover { border-color: var(--brand); color: #1a2744; background: #fcfcfe; transform: translateY(-1px); box-shadow: var(--sh-sm); }
    :host-context(.dark-theme) .wf-btn-close:hover { border-color: #E21C2A; color: #eef2f9; background: #101a30; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
    @media (max-width: 1024px) {
      .form-content { padding: 2rem 1.5rem 4rem; }
      .header-text h2 { font-size: 1.55rem; }
      .wf-info-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .form-content { padding: 1.25rem 1rem 3rem; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 0.85rem; }
      .supp-columns { grid-template-columns: 1fr; }
      .supp-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--border-default), transparent); }
      .radio-group { grid-template-columns: 1fr; }
      .field-row { grid-template-columns: 1fr; }
      .form-actions { flex-direction: column-reverse; }
      .btn-cancel, .btn-submit { width: 100%; justify-content: center; }
      .checks-grid { grid-template-columns: 1fr; }
      .wf-modal { width: 96%; border-radius: 22px; }
      .wf-header { padding: 1.25rem 1.5rem 1.15rem; }
      .wf-body { padding: 1.25rem 1.5rem; }
      .wf-footer { padding: 1rem 1.5rem 1.25rem; }
      .wf-info-row { grid-template-columns: 1fr; gap: 0.65rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-delay: 0ms !important; transition-duration: 0.01ms !important; }
    }
  `]
})
export class DemandeFormComponent implements OnInit, OnDestroy {
  demandeForm: FormGroup;
  employees: User[] = [];
  currentUserDeptId?: number;
  errorMessage = '';
  showResetButton = false;

  departementsLocaux: Department[] = [];
  departementsExternes: Department[] = [];
  selectedLocauxIds: number[] = [];
  selectedExternesIds: number[] = [];

  defaultWorkflow: Workflow | null = null;
  showWorkflowModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private userService: UserService,
    private departmentService: DepartmentService,
    private workflowService: WorkflowService,
    private router: Router
  ) {
    const accesProgrammesGroup = this.fb.group({
      aplicaciones: this.fb.group({
        macpac: [false], sacha: [false], kp: [false], biff: [false], bifc: [false],
        facfix: [false], prodstar: [false], web_clients: [false], d_desel: [false],
        ppm: [false], cdp_std: [false], cdp_sct: [false], sap_fi_co: [false],
        webproc: [false], banca_online: [false], thehmis: [false], helios: [false], cap: [false]
      }),
      sharepointTanger: [false],
      sharepointCouradir: [false]
    });

    this.demandeForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      demandeurMode: ['existing'],
      demandeurId: [null],
      newDemandeurNom: [''],
      newDemandeurPrenom: [''],
      newDemandeurEmail: [''],
      etapesSupplementairesIds: [[]],
      localisation: [''],
      responsableNom: [''],
      observationsGenerales: [''],
      mobilier: [false],
      carteRestaurant: [false],
      carteCafe: [false],
      parkingInterieur: [false],
      casier: [false],
      photocopiePermis: [false],
      autreServicesGeneraux: [''],
      telephoneMobile: [false],
      typeLigne: [''],
      autreTelephonie: [''],
      ordinateurBureau: [false],
      ordinateurPortable: [false],
      carteNomade: [false],
      connexionExterne: [false],
      utilisateurPvd: [false],
      autreOrdinateur: [''],
      courrierOffice365: [false],
      autreServiceIt: [''],
      accesProgrammes: accesProgrammesGroup,
      banqueThemis: [false],
      banqueHypervision: [false],
      banqueHelios: [false],
      banqueCap: [false],
      autreBanque: [''],
      autreBesoin: ['']
    });
  }

  getAccesControl(path: string): FormControl {
    return this.demandeForm.get(`accesProgrammes.${path}`) as FormControl;
  }

  ngOnInit(): void {
    // Chargement du workflow par défaut (actif uniquement)
    this.workflowService.getDefaultWorkflow('DEMANDE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wf) => {
          this.defaultWorkflow = wf;
          // Si le workflow est inactif, afficher un message d'erreur (le bouton est déjà désactivé)
          if (!wf.actif) {
            this.errorMessage = 'Le workflow par défaut est inactif. Veuillez contacter l’administrateur.';
          }
        },
        error: (err) => {
          console.error('Aucun workflow par défaut actif', err);
          this.defaultWorkflow = null;
          this.errorMessage = 'Aucun workflow actif configuré. Veuillez contacter l’administrateur.';
        }
      });

    this.departmentService.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (depts) => {
          this.departementsLocaux = depts.filter(d => d.local === true);
          this.departementsExternes = depts.filter(d => d.local !== true);
        },
        error: (err) => console.error('Erreur chargement départements', err)
      });

    this.userService.getProfile()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(user => {
          this.currentUserDeptId = user.departmentId;
          if (this.currentUserDeptId) {
            return this.userService.getUsersByDepartment(this.currentUserDeptId);
          }
          return of([]);
        }),
        catchError(() => of([]))
      )
      .subscribe(employees => this.employees = employees);

    this.demandeForm.get('demandeurMode')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        if (mode === 'new') {
          this.showResetButton = false;
          this.resetFormDetails();
        } else {
          this.showResetButton = !!this.demandeForm.get('demandeurId')?.value;
        }
      });

    this.demandeForm.get('demandeurId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(employeeId => {
        if (employeeId) {
          this.showResetButton = true;
          this.onEmployeeChange(employeeId);
        } else {
          this.showResetButton = false;
          this.resetFormDetails();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEmployeeChange(employeeId: number): void {
    if (!employeeId) return;
    this.demandeService.getLastDemandeByEmployeeId(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lastDemande) => {
          if (lastDemande && lastDemande.detail) {
            this.prefillFormWithLastDemande(lastDemande);
          } else {
            this.resetFormDetails();
          }
        },
        error: () => this.resetFormDetails()
      });
  }

  private prefillFormWithLastDemande(demande: any): void {
    const detail = demande.detail || {};
    this.demandeForm.patchValue({
      localisation: detail.localisation || '',
      responsableNom: detail.responsableNom || '',
      observationsGenerales: detail.observationsGenerales || '',
      mobilier: detail.mobilier || false,
      carteRestaurant: detail.carteRestaurant || false,
      carteCafe: detail.carteCafe || false,
      parkingInterieur: detail.parkingInterieur || false,
      casier: detail.casier || false,
      photocopiePermis: detail.photocopiePermis || false,
      autreServicesGeneraux: detail.autreServicesGeneraux || '',
      telephoneMobile: detail.telephoneMobile || false,
      typeLigne: detail.typeLigne || '',
      autreTelephonie: detail.autreTelephonie || '',
      ordinateurBureau: detail.ordinateurBureau || false,
      ordinateurPortable: detail.ordinateurPortable || false,
      carteNomade: detail.carteNomade || false,
      connexionExterne: detail.connexionExterne || false,
      utilisateurPvd: detail.utilisateurPvd || false,
      autreOrdinateur: detail.autreOrdinateur || '',
      courrierOffice365: detail.courrierOffice365 || false,
      autreServiceIt: detail.autreServiceIt || '',
      banqueThemis: detail.banqueThemis || false,
      banqueHypervision: detail.banqueHypervision || false,
      banqueHelios: detail.banqueHelios || false,
      banqueCap: detail.banqueCap || false,
      autreBanque: detail.autreBanque || '',
      autreBesoin: detail.autreBesoin || ''
    });
    if (detail.accesProgrammes && typeof detail.accesProgrammes === 'object') {
      const accPatch: any = {};
      if (detail.accesProgrammes.aplicaciones) accPatch.aplicaciones = detail.accesProgrammes.aplicaciones;
      if (detail.accesProgrammes.sharepointTanger !== undefined) accPatch.sharepointTanger = detail.accesProgrammes.sharepointTanger;
      if (detail.accesProgrammes.sharepointCouradir !== undefined) accPatch.sharepointCouradir = detail.accesProgrammes.sharepointCouradir;
      this.demandeForm.get('accesProgrammes')?.patchValue(accPatch);
    }
  }

  resetFormDetails(): void {
    this.demandeForm.patchValue({
      localisation: '', responsableNom: '', observationsGenerales: '',
      mobilier: false, carteRestaurant: false, carteCafe: false,
      parkingInterieur: false, casier: false, photocopiePermis: false,
      autreServicesGeneraux: '', telephoneMobile: false, typeLigne: '', autreTelephonie: '',
      ordinateurBureau: false, ordinateurPortable: false, carteNomade: false,
      connexionExterne: false, utilisateurPvd: false, autreOrdinateur: '',
      courrierOffice365: false, autreServiceIt: '',
      banqueThemis: false, banqueHypervision: false, banqueHelios: false,
      banqueCap: false, autreBanque: '', autreBesoin: ''
    });
    const resetAcces = {
      aplicaciones: {
        macpac: false, sacha: false, kp: false, biff: false, bifc: false,
        facfix: false, prodstar: false, web_clients: false, d_desel: false,
        ppm: false, cdp_std: false, cdp_sct: false, sap_fi_co: false,
        webproc: false, banca_online: false, thehmis: false, helios: false, cap: false
      },
      sharepointTanger: false,
      sharepointCouradir: false
    };
    this.demandeForm.get('accesProgrammes')?.patchValue(resetAcces);
  }

  toggleLocal(deptId: number): void {
    const index = this.selectedLocauxIds.indexOf(deptId);
    if (index === -1) this.selectedLocauxIds.push(deptId);
    else this.selectedLocauxIds.splice(index, 1);
    this.updateSupplementaireIds();
  }

  toggleExternal(deptId: number): void {
    const index = this.selectedExternesIds.indexOf(deptId);
    if (index === -1) this.selectedExternesIds.push(deptId);
    else this.selectedExternesIds.splice(index, 1);
    this.updateSupplementaireIds();
  }

  getOrderedSupplementaires(): Department[] {
    const locaux = this.selectedLocauxIds.map(id => this.departementsLocaux.find(d => d.id === id)).filter(d => d) as Department[];
    const externes = this.selectedExternesIds.map(id => this.departementsExternes.find(d => d.id === id)).filter(d => d) as Department[];
    return [...locaux, ...externes];
  }

  private updateSupplementaireIds(): void {
    const ids = this.getOrderedSupplementaires().map(d => d.id);
    this.demandeForm.patchValue({ etapesSupplementairesIds: ids });
  }

  openWorkflowModal(): void {
    // Recharge le workflow par défaut si nécessaire (au cas où il aurait changé)
    if (!this.defaultWorkflow) {
      this.workflowService.getDefaultWorkflow('DEMANDE')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (wf) => {
            this.defaultWorkflow = wf;
            this.showWorkflowModal = true;
          },
          error: () => {
            this.showWorkflowModal = true; // affiche la modale sans données
          }
        });
    } else {
      this.showWorkflowModal = true;
    }
  }

  closeWorkflowModal(): void {
    this.showWorkflowModal = false;
  }

  onSubmit(): void {
    if (this.demandeForm.invalid || !this.defaultWorkflow) return;
    const formValue = this.demandeForm.value;
    const payload: any = {
      titre: formValue.titre,
      description: formValue.description,
      etapesSupplementairesIds: formValue.etapesSupplementairesIds || [],
      detail: {}
    };
    if (formValue.demandeurMode === 'existing') payload.demandeurId = formValue.demandeurId;
    else {
      payload.newDemandeurNom = formValue.newDemandeurNom;
      payload.newDemandeurPrenom = formValue.newDemandeurPrenom;
      payload.newDemandeurEmail = formValue.newDemandeurEmail;
    }
    const detailFields = [
      'localisation', 'responsableNom', 'observationsGenerales',
      'mobilier', 'carteRestaurant', 'carteCafe', 'parkingInterieur',
      'casier', 'photocopiePermis', 'autreServicesGeneraux',
      'telephoneMobile', 'typeLigne', 'autreTelephonie',
      'ordinateurBureau', 'ordinateurPortable',
      'carteNomade', 'connexionExterne', 'utilisateurPvd', 'autreOrdinateur',
      'courrierOffice365', 'autreServiceIt',
      'banqueThemis', 'banqueHypervision', 'banqueHelios', 'banqueCap',
      'autreBanque', 'autreBesoin'
    ];
    detailFields.forEach(field => { payload.detail[field] = formValue[field]; });
    payload.detail.accesProgrammes = formValue.accesProgrammes;
    this.demandeService.createDemande(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/demandes']),
        error: (err) => this.errorMessage = err.error?.message || 'Erreur lors de la création'
      });
  }
}