import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowService, Workflow, WorkflowCreate } from '../../core/services/workflow.service';
import { DepartmentService, Department } from '../../core/services/department.service';

@Component({
  selector: 'app-admin-workflows',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="workflows-container">
      <!-- Header -->
      <div class="page-header">
        <div class="title-section">
          <h1 class="page-title">{{ 'WORKFLOW.PAGE_TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'WORKFLOW.PAGE_SUBTITLE' | translate }}</p>
        </div>
        <button class="btn-primary" (click)="showCreateForm()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
          {{ 'WORKFLOW.NEW_BUTTON' | translate }}
        </button>
      </div>

      <!-- Table Glass Card -->
      <div class="table-glass">
        <div class="table-responsive">
          <table class="workflows-table">
            <thead>
              <tr>
                <th>{{ 'WORKFLOW.TABLE.ID' | translate }}</th>
                <th>{{ 'WORKFLOW.TABLE.NAME' | translate }}</th>
                <th>{{ 'WORKFLOW.TABLE.TYPE' | translate }}</th>
                <th>{{ 'WORKFLOW.TABLE.STEPS' | translate }}</th>
                <th>{{ 'WORKFLOW.TABLE.STATUS' | translate }}</th>
                <th class="actions-header">{{ 'WORKFLOW.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let wf of workflows">
                <td class="id-cell">#{{ wf.id }}</td>
                <td class="name-cell">
                  <span class="workflow-icon">⚙️</span>
                  {{ wf.nom }}
                  <span *ngIf="wf.id === defaultWorkflowId" class="default-star" title="Workflow par défaut">⭐</span>
                </td>
                <td>
                  <span class="type-badge" [class.default-type]="wf.type === 'DEMANDE'" [class.custom-type]="wf.type !== 'DEMANDE'">
                    {{ wf.type === 'DEMANDE' ? ('WORKFLOW.TYPE_STANDARD' | translate) : ('WORKFLOW.TYPE_CUSTOM' | translate) }}
                  </span>
                </td>
                <td class="steps-cell">
                  <span class="steps-count">{{ wf.etapes?.length || 0 }}</span> {{ 'WORKFLOW.STEPS_COUNT' | translate }}
                </td>
                <td>
                  <span class="status-indicator" [class.active]="wf.actif" [class.inactive]="!wf.actif">
                    {{ wf.actif ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <!-- Bouton Définir par défaut (uniquement pour les workflows actifs et non déjà par défaut) -->
                  <button *ngIf="wf.actif && wf.id !== defaultWorkflowId" 
                          class="action-btn default-btn" 
                          (click)="confirmSetDefault(wf)" 
                          title="Définir comme workflow par défaut">
                    ⭐
                  </button>
                  <!-- Badge si c'est le workflow par défaut -->
                  <span *ngIf="wf.id === defaultWorkflowId" class="default-badge">⭐ Par défaut</span>

                  <button class="action-btn view-btn" (click)="viewWorkflow(wf)" title="{{ 'WORKFLOW.VIEW_TITLE' | translate }}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"/>
                    </svg>
                  </button>
                  <button class="action-btn edit-btn" (click)="editWorkflow(wf)" title="{{ 'WORKFLOW.EDIT_TITLE' | translate }}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3l4 4L7 21H3v-4L17 3z"/>
                    </svg>
                  </button>
                  <!-- Bouton Désactiver (anciennement Supprimer) -->
                  <button class="action-btn delete-btn" (click)="confirmToggle(wf)" title="{{ 'WORKFLOW.DEACTIVATE_TITLE' | translate }}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="workflows.length === 0">
                <td colspan="6" class="empty-row">{{ 'WORKFLOW.EMPTY' | translate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Modal -->
      <div class="modal-overlay" *ngIf="viewingWorkflow" (click)="closeViewModal()">
        <div class="modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><span class="modal-icon">📋</span> {{ 'WORKFLOW.DETAILS_TITLE' | translate }}</h3>
            <button class="close-btn" (click)="closeViewModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">{{ 'WORKFLOW.NAME' | translate }}</span>
              <span class="detail-value">{{ viewingWorkflow.nom }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ 'WORKFLOW.TYPE' | translate }}</span>
              <span class="detail-value">{{ viewingWorkflow.type === 'DEMANDE' ? ('WORKFLOW.TYPE_STANDARD' | translate) : ('WORKFLOW.TYPE_CUSTOM' | translate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ 'WORKFLOW.STATUS' | translate }}</span>
              <span class="detail-value status-text" [class.active-text]="viewingWorkflow.actif">
                {{ viewingWorkflow.actif ? ('COMMON.ACTIVE' | translate) : ('COMMON.INACTIVE' | translate) }}
              </span>
            </div>
            <div class="detail-steps">
              <span class="detail-label">{{ 'WORKFLOW.VALIDATION_ORDER' | translate }}</span>
              <div class="steps-timeline">
                <div *ngFor="let etape of viewingWorkflow.etapes; let i = index" class="timeline-step">
                  <div class="step-bullet">{{ i + 1 }}</div>
                  <div class="step-info">
                    <strong>
                      {{ etape.department?.name || 'Département' }}
                      <span class="step-type-badge" [class.local]="etape.department?.local === true" [class.extern]="etape.department?.local === false">
                        {{ etape.department?.local === true ? 'T/' : 'Z/' }}
                      </span>
                    </strong>
                    <span class="step-status">{{ etape.statut }}</span>
                  </div>
                </div>
                <div *ngIf="!viewingWorkflow.etapes?.length" class="no-steps">{{ 'WORKFLOW.NO_STEPS' | translate }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeViewModal()">{{ 'COMMON.CLOSE' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal-overlay" *ngIf="creating" (click)="cancelCreate()">
        <div class="modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>
              <span class="modal-icon">{{ editingWorkflow ? '✏️' : '✨' }}</span>
              {{ editingWorkflow ? ('WORKFLOW.MODAL_EDIT_TITLE' | translate) : ('WORKFLOW.MODAL_CREATE_TITLE' | translate) }}
            </h3>
            <button class="close-btn" (click)="cancelCreate()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>{{ 'WORKFLOW.NAME_LABEL' | translate }}</label>
              <input type="text" [(ngModel)]="newWorkflowName" placeholder="ex: Validation RH puis Direction" class="form-control">
            </div>
            <div class="form-group">
              <label>{{ 'WORKFLOW.ORDER_LABEL' | translate }}</label>
              <div class="steps-list">
                <div *ngFor="let deptId of selectedDepartments; let i = index" class="step-item">
                  <div class="step-index">{{ i + 1 }}</div>
                  <div class="step-select">
                    <select [(ngModel)]="selectedDepartments[i]" class="form-select">
                      <option *ngFor="let d of departments" [value]="d.id">
                        {{ d.name }}
                        <span class="dept-badge" [class.local]="d.local === true" [class.extern]="d.local === false">
                          {{ d.local === true ? 'T/' : 'Z/' }}
                        </span>
                      </option>
                    </select>
                  </div>
                  <button type="button" class="remove-step" (click)="removeDepartment(i)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button type="button" class="btn-add-step" (click)="addDepartment()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                {{ 'WORKFLOW.ADD_STEP' | translate }}
              </button>
            </div>
            <div class="error-message" *ngIf="errorMsg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/>
              </svg>
              {{ errorMsg }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="cancelCreate()">{{ 'COMMON.CANCEL' | translate }}</button>
            <button class="btn-primary" (click)="saveWorkflow()">{{ editingWorkflow ? ('WORKFLOW.UPDATE_BUTTON' | translate) : ('WORKFLOW.CREATE_BUTTON' | translate) }}</button>
          </div>
        </div>
      </div>

      <!-- Deactivate Confirmation Modal (supprime l'ancienne modale de suppression définitive) -->
      <div class="modal-overlay" *ngIf="toggleConfirmWorkflow" (click)="cancelToggle()">
        <div class="modal-card confirm-modal glass-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon-wrapper warning">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="confirm-content">
            <h3>{{ 'WORKFLOW.DEACTIVATE_CONFIRM_TITLE' | translate }}</h3>
            <p class="confirm-main-message">
              {{ 'WORKFLOW.DEACTIVATE_CONFIRM_MESSAGE' | translate }}
              <strong class="confirm-highlight">"{{ toggleConfirmWorkflow.nom }}"</strong> ?
            </p>
            <p class="confirm-sub-message" *ngIf="toggleConfirmWorkflow.id === defaultWorkflowId">
              ⚠️ {{ 'WORKFLOW.DEACTIVATE_DEFAULT_WARNING' | translate }}
            </p>
          </div>
          <div class="confirm-actions">
            <button class="btn-secondary" (click)="cancelToggle()">{{ 'WORKFLOW.DEACTIVATE_CANCEL_BUTTON' | translate }}</button>
            <button class="btn-warning" (click)="executeToggle()" [disabled]="toggleLoading">
              <span *ngIf="!toggleLoading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                {{ 'WORKFLOW.DEACTIVATE_CONFIRM_BUTTON' | translate }}
              </span>
              <span *ngIf="toggleLoading" class="btn-loading">
                <span class="spinner-small"></span>
                {{ 'USERS.BULK_DELETING' | translate }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Set Default Confirmation Modal -->
      <div class="modal-overlay" *ngIf="setDefaultConfirmWorkflow" (click)="cancelSetDefault()">
        <div class="modal-card confirm-modal glass-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon-wrapper info">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="confirm-content">
            <h3>{{ 'WORKFLOW.SET_DEFAULT_CONFIRM_TITLE' | translate }}</h3>
            <p class="confirm-main-message">
              {{ 'WORKFLOW.SET_DEFAULT_CONFIRM_MESSAGE' | translate }}
              <strong class="confirm-highlight">"{{ setDefaultConfirmWorkflow.nom }}"</strong>
              {{ 'WORKFLOW.SET_DEFAULT_CONFIRM_SUBMESSAGE' | translate }}
            </p>
          </div>
          <div class="confirm-actions">
            <button class="btn-secondary" (click)="cancelSetDefault()">{{ 'WORKFLOW.SET_DEFAULT_CANCEL_BUTTON' | translate }}</button>
            <button class="btn-info" (click)="executeSetDefault()" [disabled]="setDefaultLoading">
              <span *ngIf="!setDefaultLoading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {{ 'WORKFLOW.SET_DEFAULT_CONFIRM_BUTTON' | translate }}
              </span>
              <span *ngIf="setDefaultLoading" class="btn-loading">
                <span class="spinner-small"></span>
                {{ 'USERS.BULK_DELETING' | translate }}
              </span>
            </button>
          </div>
          <div class="confirm-feedback" *ngIf="setDefaultFeedback">
            <div class="feedback-message" [class.error]="setDefaultFeedback.type === 'error'" [class.success]="setDefaultFeedback.type === 'success'">
              <svg *ngIf="setDefaultFeedback.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <svg *ngIf="setDefaultFeedback.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ setDefaultFeedback.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div class="toast-container" [class.show]="toast.show" [class.toast-success]="toast.type === 'success'" [class.toast-error]="toast.type === 'error'" [class.toast-warning]="toast.type === 'warning'">
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg *ngIf="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="hideToast()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX WORKFLOW STYLES ========== */
    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .workflows-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .title-section {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1F2E5A 0%, #2c3f70 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.5px;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      color: #64748b;
      font-weight: 500;
      font-size: 0.9rem;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #1F2E5A, #2a3f78);
      border: none;
      padding: 0.7rem 1.6rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 4px 12px rgba(31, 46, 90, 0.2);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #E21C2A, #b91c2c);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(226, 28, 42, 0.3);
    }

    .btn-secondary {
      background: #f1f5f9;
      border: none;
      padding: 0.6rem 1.3rem;
      border-radius: 60px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: #334155;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }

    /* Glass Table */
    .table-glass {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(31, 46, 90, 0.05);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .workflows-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .workflows-table th {
      text-align: left;
      padding: 1.2rem 1.2rem;
      background: rgba(31, 46, 90, 0.03);
      font-weight: 700;
      color: #1F2E5A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.8rem;
      border-bottom: 1px solid rgba(31, 46, 90, 0.1);
    }

    .workflows-table td {
      padding: 1rem 1.2rem;
      border-bottom: 1px solid rgba(203, 213, 225, 0.3);
      vertical-align: middle;
    }

    .workflows-table tr:hover td {
      background: rgba(31, 46, 90, 0.02);
    }

    .id-cell {
      font-weight: 700;
      color: #1F2E5A;
      font-family: monospace;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 600;
      color: #0f172a;
    }

    .workflow-icon {
      font-size: 1.2rem;
    }

    .default-star {
      font-size: 0.9rem;
      margin-left: 6px;
      color: #f59e0b;
      filter: drop-shadow(0 0 2px rgba(245,158,11,0.3));
    }

    .type-badge {
      display: inline-block;
      padding: 0.25rem 0.8rem;
      border-radius: 40px;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .default-type {
      background: #e2e8f0;
      color: #475569;
    }

    .custom-type {
      background: linear-gradient(135deg, #e0f2fe, #bae6fd);
      color: #0369a1;
    }

    .steps-count {
      font-weight: 800;
      color: #1F2E5A;
      margin-right: 4px;
    }

    .status-indicator {
      display: inline-block;
      padding: 0.25rem 0.9rem;
      border-radius: 60px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-indicator.active {
      background: #dcfce7;
      color: #15803d;
      box-shadow: 0 0 0 1px #bbf7d0;
    }

    .status-indicator.inactive {
      background: #ffe4e2;
      color: #b91c2c;
      box-shadow: 0 0 0 1px #fecaca;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .action-btn {
      background: transparent;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .default-btn {
      font-size: 1rem;
      color: #f59e0b;
      background: rgba(245,158,11,0.1);
      width: auto;
      padding: 0 0.6rem;
    }
    .default-btn:hover {
      background: rgba(245,158,11,0.25);
      transform: scale(1.05);
    }

    .default-badge {
      background: #fef3c7;
      color: #92400e;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 40px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      border: 1px solid #fde68a;
    }

    .action-btn svg {
      stroke: #64748b;
      transition: stroke 0.2s;
    }

    .view-btn:hover {
      background: rgba(31, 46, 90, 0.1);
    }

    .view-btn:hover svg {
      stroke: #1F2E5A;
    }

    .edit-btn:hover {
      background: rgba(245, 158, 11, 0.1);
    }

    .edit-btn:hover svg {
      stroke: #d97706;
    }

    .delete-btn:hover {
      background: rgba(226, 28, 42, 0.1);
    }

    .delete-btn:hover svg {
      stroke: #E21C2A;
    }

    .empty-row {
      text-align: center;
      padding: 2.5rem;
      color: #94a3b8;
      font-style: italic;
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .glass-modal {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 32px;
      backdrop-filter: blur(4px);
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 620px;
      max-height: 85vh;
      overflow-y: auto;
      animation: slideUp 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #eef2f6;
    }

    .modal-header h3 {
      font-size: 1.35rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .modal-icon {
      margin-right: 8px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #E21C2A;
    }

    .modal-body {
      padding: 2rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-label {
      font-weight: 700;
      color: #1e293b;
    }

    .detail-value {
      color: #334155;
      font-weight: 500;
    }

    .active-text {
      color: #15803d;
      font-weight: 700;
    }

    .detail-steps {
      margin-top: 1.5rem;
    }

    .steps-timeline {
      margin-top: 0.8rem;
      background: #f9fafb;
      border-radius: 20px;
      padding: 1rem;
    }

    .timeline-step {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.6rem 0;
      border-bottom: 1px dashed #e2e8f0;
    }

    .step-bullet {
      width: 28px;
      height: 28px;
      background: #1F2E5A;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.8rem;
    }

    .step-info strong {
      color: #0f172a;
    }

    .step-status {
      margin-left: 0.5rem;
      font-size: 0.7rem;
      background: #e2e8f0;
      padding: 0.1rem 0.4rem;
      border-radius: 30px;
    }

    .no-steps {
      padding: 1rem;
      text-align: center;
      color: #94a3b8;
    }

    /* Form inside modal */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      font-weight: 700;
      font-size: 0.85rem;
      color: #1F2E5A;
      display: block;
      margin-bottom: 0.5rem;
    }

    .form-control, .form-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .form-control:focus, .form-select:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      max-height: 260px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      padding: 0.5rem 1rem;
      border-radius: 60px;
      border: 1px solid #eef2f6;
    }

    .step-index {
      width: 28px;
      height: 28px;
      background: #1F2E5A20;
      color: #1F2E5A;
      font-weight: 800;
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-select {
      flex: 1;
    }

    .remove-step {
      background: none;
      border: none;
      cursor: pointer;
      color: #E21C2A;
      padding: 4px;
      border-radius: 30px;
      display: flex;
      align-items: center;
    }

    .remove-step:hover {
      background: #fff0ef;
    }

    .btn-add-step {
      background: transparent;
      border: 1px dashed #1F2E5A;
      border-radius: 60px;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #1F2E5A;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-add-step:hover {
      background: #eef2ff;
      border-style: solid;
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.7rem 1rem;
      background: #fef2f2;
      border-left: 4px solid #E21C2A;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #b91c2c;
      font-weight: 500;
      font-size: 0.8rem;
    }

    .modal-footer {
      padding: 1.2rem 2rem 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    /* Badges */
    .dept-badge, .step-type-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 700;
    }
    .dept-badge.local, .step-type-badge.local {
      background: #dcfce7;
      color: #15803d;
    }
    .dept-badge.extern, .step-type-badge.extern {
      background: #ffe4e2;
      color: #b91c2c;
    }

    /* ========== CONFIRMATION MODAL STYLES ========== */
    .confirm-modal {
      max-width: 460px;
      padding: 2.5rem 2rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.2rem;
    }

    .confirm-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .confirm-icon-wrapper.danger {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      color: #E21C2A;
      box-shadow: 0 8px 24px rgba(226, 28, 42, 0.15);
    }

    .confirm-icon-wrapper.warning {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      color: #d97706;
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.15);
    }

    .confirm-icon-wrapper.info {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      color: #2563eb;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
    }

    .confirm-content {
      width: 100%;
    }

    .confirm-content h3 {
      font-size: 1.3rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.6rem;
      background: none;
      -webkit-background-clip: unset;
      background-clip: unset;
      color: #0f172a;
    }

    .confirm-main-message {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.6;
    }

    .confirm-highlight {
      color: #1F2E5A;
      font-weight: 700;
    }

    .confirm-sub-message {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #E21C2A;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirm-actions {
      display: flex;
      gap: 0.8rem;
      width: 100%;
      margin-top: 0.5rem;
    }

    .confirm-actions .btn-secondary {
      flex: 1;
      text-align: center;
      padding: 0.75rem 1rem;
    }

    .btn-danger {
      flex: 1;
      background: linear-gradient(135deg, #E21C2A, #b91c2c);
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 4px 12px rgba(226, 28, 42, 0.25);
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #c01824, #991b1b);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(226, 28, 42, 0.35);
    }

    .btn-danger:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-warning {
      flex: 1;
      background: linear-gradient(135deg, #d97706, #b45309);
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
    }

    .btn-warning:hover:not(:disabled) {
      background: linear-gradient(135deg, #b45309, #92400e);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(217, 119, 6, 0.35);
    }

    .btn-warning:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-info {
      flex: 1;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .btn-info:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
    }

    .btn-info:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-loading {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .confirm-feedback {
      width: 100%;
    }

    .feedback-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.65rem 1rem;
      border-radius: 14px;
      font-size: 0.82rem;
      font-weight: 600;
      animation: fadeIn 0.3s ease;
    }

    .feedback-message.error {
      background: #fef2f2;
      color: #b91c2c;
      border: 1px solid #fecaca;
    }

    .feedback-message.success {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    /* ========== TOAST NOTIFICATION ========== */
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1rem 1.5rem;
      border-radius: 20px;
      font-size: 0.88rem;
      font-weight: 600;
      z-index: 3000;
      transform: translateY(120%);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      max-width: 420px;
    }

    .toast-container.show {
      transform: translateY(0);
      opacity: 1;
    }

    .toast-container.toast-success {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .toast-container.toast-error {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      color: #b91c2c;
      border: 1px solid #fecaca;
    }

    .toast-container.toast-warning {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
    }

    .toast-message {
      flex: 1;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
      padding: 2px;
      color: inherit;
    }

    .toast-close:hover {
      opacity: 1;
    }

    /* Responsive */
    @media (max-width: 800px) {
      .workflows-container {
        padding: 1rem;
      }
      .actions-cell {
        flex-wrap: wrap;
      }
      .modal-card {
        width: 95%;
      }
      .confirm-modal {
        width: 95%;
        padding: 2rem 1.2rem 1.5rem;
      }
      .page-title {
        font-size: 1.5rem;
      }
      .toast-container {
        left: 1rem;
        right: 1rem;
        bottom: 1rem;
        max-width: none;
      }
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #ecf3f9;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #1F2E5A;
      border-radius: 10px;
    }
  `]
})
export class AdminWorkflowsComponent implements OnInit {
  workflows: Workflow[] = [];
  departments: Department[] = [];
  workflowType: string | null = null;
  defaultWorkflowId: number | null = null;

  creating = false;
  editingWorkflow: Workflow | null = null;
  viewingWorkflow: Workflow | null = null;

  // Toggle (deactivation) confirmation
  toggleConfirmWorkflow: Workflow | null = null;
  toggleLoading = false;

  // Set default confirmation
  setDefaultConfirmWorkflow: Workflow | null = null;
  setDefaultLoading = false;
  setDefaultFeedback: { type: 'error' | 'success'; message: string } | null = null;

  // Toast
  toast: { show: boolean; message: string; type: 'success' | 'error' | 'warning' } = {
    show: false,
    message: '',
    type: 'success'
  };
  private toastTimeout: any;

  newWorkflowName = '';
  selectedDepartments: number[] = [];
  errorMsg = '';

  constructor(
    private workflowService: WorkflowService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.workflowType = data['type'] === 'delete' ? 'SUPPRESSION' : 'DEMANDE';
      this.loadWorkflows();
    });
    this.departmentService.getDepartments().subscribe({
      next: (data) => this.departments = data,
      error: () => console.error('Erreur chargement départements')
    });
  }

  loadWorkflows(): void {
    this.workflowService.getWorkflows(this.workflowType ?? undefined).subscribe({
      next: (data) => {
        this.workflows = data.filter(wf => !wf.nom.startsWith('Composé:'));
        if (this.workflowType) {
          this.workflowService.getDefaultWorkflow(this.workflowType).subscribe({
            next: (wf) => this.defaultWorkflowId = wf.id,
            error: () => this.defaultWorkflowId = null
          });
        }
      },
      error: () => this.errorMsg = 'Impossible de charger les workflows'
    });
  }

  // ========== TOAST ==========
  showToast(translationKey: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    const translatedMessage = this.translateService.instant(translationKey);
    this.toast = { show: true, message: translatedMessage, type };
    this.toastTimeout = setTimeout(() => {
      this.toast.show = false;
    }, 4000);
  }

  hideToast(): void {
    this.toast.show = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ========== DEACTIVATE CONFIRMATION ==========
  confirmToggle(wf: Workflow): void {
    // Vérifie si le workflow est déjà inactif
    if (!wf.actif) {
      this.showToast('WORKFLOW.ALREADY_INACTIVE', 'warning');
      return;
    }
    this.toggleConfirmWorkflow = wf;
    this.toggleLoading = false;
  }

  cancelToggle(): void {
    this.toggleConfirmWorkflow = null;
    this.toggleLoading = false;
  }

  executeToggle(): void {
    if (!this.toggleConfirmWorkflow) return;
    this.toggleLoading = true;
    this.workflowService.deleteWorkflow(this.toggleConfirmWorkflow.id).subscribe({
      next: () => {
        this.toggleLoading = false;
        this.toggleConfirmWorkflow = null;
        this.loadWorkflows();
        this.showToast('WORKFLOW.DEACTIVATE_SUCCESS', 'success');
      },
      error: (err) => {
        this.toggleLoading = false;
        this.toggleConfirmWorkflow = null;
        const serverMessage = err.error?.message;
        const translatedError = serverMessage || this.translateService.instant('WORKFLOW.DEACTIVATE_ERROR');
        this.showToast(translatedError, 'error');
      }
    });
  }

  // ========== SET DEFAULT CONFIRMATION ==========
  confirmSetDefault(wf: Workflow): void {
    this.setDefaultConfirmWorkflow = wf;
    this.setDefaultLoading = false;
    this.setDefaultFeedback = null;
  }

  cancelSetDefault(): void {
    this.setDefaultConfirmWorkflow = null;
    this.setDefaultLoading = false;
    this.setDefaultFeedback = null;
  }

  executeSetDefault(): void {
    if (!this.setDefaultConfirmWorkflow || !this.workflowType) return;
    this.setDefaultLoading = true;
    this.setDefaultFeedback = null;
    this.workflowService.setDefaultWorkflow(this.setDefaultConfirmWorkflow.id, this.setDefaultConfirmWorkflow.type).subscribe({
      next: () => {
        this.setDefaultLoading = false;
        this.defaultWorkflowId = this.setDefaultConfirmWorkflow!.id;
        this.setDefaultConfirmWorkflow = null;
        this.setDefaultFeedback = null;
        this.showToast('WORKFLOW.SET_DEFAULT_SUCCESS', 'success');
      },
      error: (err) => {
        this.setDefaultLoading = false;
        const serverMessage = err.error?.message;
        const translatedError = serverMessage || this.translateService.instant('WORKFLOW.SET_DEFAULT_ERROR');
        this.setDefaultFeedback = {
          type: 'error',
          message: translatedError
        };
      }
    });
  }

  // ========== VIEW ==========
  viewWorkflow(wf: Workflow): void {
    this.viewingWorkflow = wf;
  }

  closeViewModal(): void {
    this.viewingWorkflow = null;
  }

  // ========== EDIT ==========
  editWorkflow(wf: Workflow): void {
    this.editingWorkflow = { ...wf };
    this.newWorkflowName = wf.nom;
    this.selectedDepartments = wf.etapes?.map(e => e.department?.id).filter(id => id != null) || [];
    this.creating = true;
    this.errorMsg = '';
  }

  // ========== CREATE ==========
  showCreateForm(): void {
    this.creating = true;
    this.editingWorkflow = null;
    this.newWorkflowName = '';
    this.selectedDepartments = [];
    if (this.departments.length) this.addDepartment();
    this.errorMsg = '';
  }

  cancelCreate(): void {
    this.creating = false;
    this.editingWorkflow = null;
    this.errorMsg = '';
  }

  addDepartment(): void {
    if (this.departments.length) {
      this.selectedDepartments.push(this.departments[0].id);
    }
  }

  removeDepartment(index: number): void {
    this.selectedDepartments.splice(index, 1);
  }

  saveWorkflow(): void {
    if (!this.newWorkflowName.trim()) {
      this.errorMsg = 'Veuillez saisir un nom pour le workflow';
      return;
    }
    if (this.selectedDepartments.length === 0) {
      this.errorMsg = 'Ajoutez au moins un département (étape de validation)';
      return;
    }

    const data: WorkflowCreate = {
      nom: this.newWorkflowName,
      departmentIds: this.selectedDepartments
    };

    let request;
    if (this.editingWorkflow) {
      request = this.workflowService.updateWorkflow(this.editingWorkflow.id, data);
    } else {
      if (this.workflowType === 'SUPPRESSION') {
        request = this.workflowService.createSuppressionWorkflow(data);
      } else {
        request = this.workflowService.createWorkflow(data);
      }
    }

    request.subscribe({
      next: () => {
        this.loadWorkflows();
        this.cancelCreate();
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erreur lors de l\'enregistrement';
      }
    });
  }
}