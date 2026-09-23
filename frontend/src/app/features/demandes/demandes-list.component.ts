import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemandeService, Demande, Page } from '../../core/services/demande.service';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="demandes-container">
      <!-- Animated Background Elements -->
      <div class="bg-grid"></div>
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="header-section">
        <div class="header-left">
          <div class="title-shimmer"></div>
          <h2>{{ 'DEMANDES_LIST.TITLE' | translate }}</h2>
          <div class="header-accent-bar"></div>
        </div>
        <div class="header-stats" *ngIf="stats">
          <span class="stat-badge pending anim-pop-1">
            <span class="stat-dot pending-dot"></span>
            {{ stats.pending }} {{ 'DEMANDES_LIST.PENDING' | translate }}
          </span>
          <span class="stat-badge approved anim-pop-2">
            <span class="stat-dot approved-dot"></span>
            {{ stats.approved }} {{ 'DEMANDES_LIST.APPROVED' | translate }}
          </span>
          <span class="stat-badge rejected anim-pop-3">
            <span class="stat-dot rejected-dot"></span>
            {{ stats.rejected }} {{ 'DEMANDES_LIST.REJECTED' | translate }}
          </span>
        </div>
      </div>

      <div class="filters-bar anim-slide-up">
        <div class="filter-group">
          <label>{{ 'DEMANDES_LIST.FILTER_STATUS' | translate }}</label>
          <div class="select-wrapper">
            <select [(ngModel)]="selectedStatut" (change)="loadDemandes(0)">
              <option value="">{{ 'DEMANDES_LIST.ALL' | translate }}</option>
              <option value="PENDING">{{ 'DEMANDES_LIST.PENDING' | translate }}</option>
              <option value="APPROVED">{{ 'DEMANDES_LIST.APPROVED' | translate }}</option>
              <option value="REJECTED">{{ 'DEMANDES_LIST.REJECTED' | translate }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>

        <div class="filter-group">
          <label>{{ 'DEMANDES_LIST.FILTER_MY_ACTIONS' | translate }}</label>
          <div class="select-wrapper">
            <select [(ngModel)]="selectedMyAction" (change)="loadDemandes(0)">
              <option value="">{{ 'DEMANDES_LIST.ALL' | translate }}</option>
              <option value="APPROVE">{{ 'DEMANDES_LIST.APPROVED_BY_ME' | translate }}</option>
              <option value="REJECT">{{ 'DEMANDES_LIST.REJECTED_BY_ME' | translate }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>

        <!-- NOUVEAU BOUTON AVEC ANIMATION FIZZY 3D + CURTAIN + BUBBLES -->
        <button routerLink="/demandes/new"
                class="btn-create"
                [style.--content]="'\\'' + ('DEMANDES_LIST.NEW_REQUEST' | translate) + '\\''">
          <span class="left"></span>
          <span class="btn-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"/>
            </svg>
            {{ 'DEMANDES_LIST.NEW_REQUEST' | translate }}
          </span>
          <span class="right"></span>
        </button>
      </div>

      <div class="table-wrapper anim-slide-up-delay">
        <div class="table-glow"></div>
        <table class="demandes-table">
          <thead>
            <tr>
              <th>{{ 'DEMANDES_LIST.TABLE.ID' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.TITLE' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.REQUESTER' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.CREATOR' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.STATUS' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.CREATION_DATE' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.PROGRESS' | translate }}</th>
              <th>{{ 'DEMANDES_LIST.TABLE.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let demande of demandes; let i = index" class="table-row-anim" [style.animation-delay]="i * 0.04 + 's'">
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.ID' | translate)">
                <span class="id-cell">#{{ demande.id }}</span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.TITLE' | translate)">
                <span class="title-cell">{{ demande.titre }}</span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.REQUESTER' | translate)">
                <span class="user-cell">
                  <span class="user-avatar-mini">{{ getInitials(demande.demandeurNom) }}</span>
                  {{ demande.demandeurNom }}
                </span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.CREATOR' | translate)">
                <span class="user-cell">
                  <span class="user-avatar-mini creator">{{ getInitials(demande.createurNom) }}</span>
                  {{ demande.createurNom }}
                </span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.STATUS' | translate)">
                <span [class]="'badge ' + demande.statut">
                  <span class="badge-dot"></span>
                  {{ getStatusLabel(demande.statut) }}
                </span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.CREATION_DATE' | translate)">
                <span class="date-cell">{{ demande.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
              </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.PROGRESS' | translate)" class="progress-cell">
                <div class="progress-wrapper">
                  <div class="progress-bar">
                    <div class="progress-fill" 
                         [style.width.%]="(demande.etapeCourante / demande.totalEtapes) * 100">
                      <div class="progress-glow"></div>
                    </div>
                  </div>
                  <span class="progress-text">{{ demande.etapeCourante }}/{{ demande.totalEtapes }}</span>
                </div>
                </td>
              <td [attr.data-label]="('DEMANDES_LIST.TABLE.ACTIONS' | translate)">
                <button class="btn-detail" [routerLink]="['/demandes', demande.id]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3H21V9M9 21H3V15M21 3L14 10M10 14L3 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ 'DEMANDES_LIST.VIEW_DETAILS' | translate }}
                </button>
                </td>
            </tr>
            <tr *ngIf="demandes.length === 0">
              <td colspan="8" class="empty-state">
                <div class="empty-orb"></div>
                <div class="empty-icon">📋</div>
                <p>{{ 'DEMANDES_LIST.EMPTY_TITLE' | translate }}</p>
                <button routerLink="/demandes/new" class="btn-create-small">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  </svg>
                  {{ 'DEMANDES_LIST.CREATE_REQUEST' | translate }}
                </button>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 0">
        <button class="page-btn page-btn-prev" (click)="previousPage()" [disabled]="currentPage === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ 'DEMANDES_LIST.PREVIOUS' | translate }}
        </button>
        <div class="page-indicators">
          <span class="page-current">{{ currentPage + 1 }}</span>
          <span class="page-separator">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </div>
        <button class="page-btn page-btn-next" (click)="nextPage()" [disabled]="currentPage + 1 >= totalPages">
          {{ 'DEMANDES_LIST.NEXT' | translate }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX DEMANDES LIST ========== */
    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.6); }
      60% { transform: scale(1.08); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes rowSlide {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes orbFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(15px, -20px) scale(1.05); }
      66% { transform: translate(-10px, 10px) scale(0.97); }
    }
    @keyframes gridFloat {
      0% { transform: translate(0, 0); }
      100% { transform: translate(40px, 40px); }
    }
    @keyframes dotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
    @keyframes progressShine {
      0% { left: -40%; }
      100% { left: 140%; }
    }
    @keyframes accentGrow {
      from { width: 0; opacity: 0; }
      to { width: 60px; opacity: 1; }
    }
    @keyframes emptyPulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }
    @keyframes bubbles {
      from { transform: translateY(0); }
      to { transform: translateY(-66.666%); }
    }
    
    /* === Variables clair (défaut) === */
    .demandes-container {
      --bg-container: rgba(255, 255, 255, 0.80);
      --border-header: rgba(31, 46, 90, 0.06);
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --bg-header: rgba(248, 250, 252, 0.9);
      --border-table: rgba(31, 46, 90, 0.05);
      --hover-row: rgba(31, 46, 90, 0.03);
      --shadow-card: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
      --btn-bg: rgba(255, 255, 255, 0.9);
      --btn-border: rgba(31, 46, 90, 0.1);
      --btn-color: #1F2E5A;
      --btn-hover-bg: #1F2E5A;
      --btn-hover-color: white;
      --progress-bg: rgba(31, 46, 90, 0.08);
      --progress-fill: linear-gradient(90deg, #1F2E5A, #2c3f70);
      --progress-glow: rgba(31, 46, 90, 0.3);
      --grid-opacity: 0.03;
      --orb-opacity: 0.06;
      --table-glow: rgba(31, 46, 90, 0.04);
      --badge-id-bg: rgba(31, 46, 90, 0.06);
      --badge-id-color: #1F2E5A;
      --avatar-bg: linear-gradient(135deg, #1F2E5A, #2c3f70);
      --avatar-creator-bg: linear-gradient(135deg, #64748b, #475569);
      --select-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }

    :host-context(.dark-theme) .demandes-container {
      --bg-container: rgba(30, 41, 59, 0.65);
      --border-header: rgba(255, 255, 255, 0.05);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --bg-header: rgba(15, 23, 42, 0.6);
      --border-table: rgba(255, 255, 255, 0.04);
      --hover-row: rgba(255, 255, 255, 0.03);
      --shadow-card: 0 20px 40px -12px rgba(0, 0, 0, 0.35);
      --btn-bg: rgba(30, 41, 59, 0.8);
      --btn-border: rgba(255, 255, 255, 0.08);
      --btn-color: #e2e8f0;
      --btn-hover-bg: #E21C2A;
      --btn-hover-color: white;
      --progress-bg: rgba(255, 255, 255, 0.08);
      --progress-fill: linear-gradient(90deg, #E21C2A, #f87171);
      --progress-glow: rgba(226, 28, 42, 0.4);
      --grid-opacity: 0.03;
      --orb-opacity: 0.1;
      --table-glow: rgba(226, 28, 42, 0.04);
      --badge-id-bg: rgba(255, 255, 255, 0.06);
      --badge-id-color: #cbd5e1;
      --avatar-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --avatar-creator-bg: linear-gradient(135deg, #475569, #334155);
      --select-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .demandes-container {
      max-width: 1440px;
      margin: 0 auto;
      background: var(--bg-container);
      border-radius: 36px;
      box-shadow: var(--shadow-card);
      padding: 2.5rem 2rem;
      transition: background 0.5s ease, box-shadow 0.5s ease;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-header);
      animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }

    /* ===== ANIMATED BACKGROUND ===== */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--border-table) 1px, transparent 1px),
        linear-gradient(90deg, var(--border-table) 1px, transparent 1px);
      background-size: 50px 50px;
      opacity: var(--grid-opacity);
      animation: gridFloat 30s linear infinite;
      pointer-events: none;
      border-radius: 36px;
    }

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: var(--orb-opacity);
      pointer-events: none;
      transition: opacity 0.5s ease;
    }
    .bg-orb-1 {
      width: 350px;
      height: 350px;
      background: #1F2E5A;
      top: -120px;
      right: -80px;
      animation: orbFloat 20s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 280px;
      height: 280px;
      background: #E21C2A;
      bottom: -80px;
      left: -60px;
      animation: orbFloat 24s ease-in-out infinite reverse;
    }

    /* ===== HEADER ===== */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.2rem;
      border-bottom: 1px solid var(--border-header);
      position: relative;
      z-index: 2;
      animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }

    .header-left {
      position: relative;
    }

    .title-shimmer {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: 4px;
      background: linear-gradient(90deg, transparent 30%, rgba(31,46,90,0.06) 50%, transparent 70%);
      background-size: 200% 100%;
      animation: shimmer 4s ease-in-out infinite;
      border-radius: 8px;
      pointer-events: none;
    }
    :host-context(.dark-theme) .title-shimmer {
      background: linear-gradient(90deg, transparent 30%, rgba(226,28,42,0.06) 50%, transparent 70%);
      background-size: 200% 100%;
    }

    h2 {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #1F2E5A 0%, #142559 50%, #E21C2A 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin: 0;
      position: relative;
      display: inline-block;
      line-height: 1.2;
    }
    :host-context(.dark-theme) h2 {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #f87171 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    .header-accent-bar {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #E21C2A, #1F2E5A, transparent);
      border-radius: 3px;
      margin-top: 0.6rem;
      animation: accentGrow 0.8s ease-out 0.3s both;
    }

    .header-stats {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .stat-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.35rem 0.9rem;
      border-radius: 40px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.3s ease;
      cursor: default;
      border: 1px solid transparent;
    }
    .stat-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px -4px rgba(0,0,0,0.1);
    }

    .stat-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      animation: dotPulse 2s ease-in-out infinite;
    }
    .pending-dot { background: #f59e0b; }
    .approved-dot { background: #22c55e; }
    .rejected-dot { background: #E21C2A; }

    .stat-badge.pending { background: #fffbeb; color: #92400e; border-color: rgba(245,158,11,0.2); }
    .stat-badge.approved { background: #ecfdf5; color: #065f46; border-color: rgba(34,197,94,0.2); }
    .stat-badge.rejected { background: #fef2f2; color: #991b1b; border-color: rgba(226,28,42,0.2); }

    :host-context(.dark-theme) .stat-badge.pending { background: rgba(120,53,15,0.4); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
    :host-context(.dark-theme) .stat-badge.approved { background: rgba(20,83,45,0.4); color: #4ade80; border-color: rgba(34,197,94,0.2); }
    :host-context(.dark-theme) .stat-badge.rejected { background: rgba(127,29,29,0.4); color: #f87171; border-color: rgba(226,28,42,0.2); }

    .anim-pop-1 { animation: popIn 0.5s ease-out 0.2s both; }
    .anim-pop-2 { animation: popIn 0.5s ease-out 0.3s both; }
    .anim-pop-3 { animation: popIn 0.5s ease-out 0.4s both; }

    /* ===== FILTERS BAR ===== */
    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1.2rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 2;
    }
    .anim-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.15s both; }
    .anim-slide-up-delay { animation: slideUp 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.3s both; }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .filter-group label {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: var(--text-muted);
    }

    .select-wrapper {
      position: relative;
    }
    .select-arrow {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      color: var(--text-muted);
      pointer-events: none;
      transition: transform 0.3s ease, color 0.3s ease;
    }
    .select-wrapper:hover .select-arrow {
      color: var(--btn-color);
      transform: translateY(-50%) rotate(180deg);
    }

    select {
      background: var(--btn-bg);
      border: 1px solid var(--btn-border);
      border-radius: 16px;
      padding: 0.65rem 2.5rem 0.65rem 1.2rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      outline: none;
      min-width: 200px;
      appearance: none;
      -webkit-appearance: none;
      box-shadow: var(--select-shadow);
      backdrop-filter: blur(8px);
    }
    select:hover {
      border-color: rgba(31,46,90,0.2);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    }
    :host-context(.dark-theme) select:hover {
      border-color: rgba(255,255,255,0.15);
    }
    select:focus {
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1), var(--select-shadow);
    }
    :host-context(.dark-theme) select:focus {
      border-color: #E21C2A;
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.15), var(--select-shadow);
    }

    /* ============================================================
       ========== FIZZY 3D CURTAIN + BUBBLES BUTTON (NEW) ==========
       ============================================================ */
    .btn-create {
      --text-color: #ffffff;
      --shadow-color: rgba(31,46,90,.35);
      --btn-color: #1F2E5A;
      --bg-color: transparent;

      position: relative;
      padding: 0.85rem 1.8rem;

      border: none;
      cursor: pointer;

      font-family: inherit;
      font-weight: 800;
      font-size: 0.85rem;

      color: var(--text-color);

      background: var(--btn-color);

      border-radius: 16px;
      overflow: hidden;

      box-shadow: var(--shadow-color) 2px 2px 22px;

      z-index: 0;

      transition: transform .3s ease,
                  box-shadow .3s ease;
    }

    .btn-create:hover {
      transform: translateY(-3px);
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: .5rem;
      position: relative;
      z-index: 3;
    }

    .btn-create:focus {
      outline: none;
    }

    .right::after,
    .btn-create::after {
      content: var(--content);

      display: block;
      position: absolute;

      white-space: nowrap;

      padding: 40px 40px;

      pointer-events: none;
    }

    .btn-create::after {
      font-weight: 200;

      top: -30px;
      left: -20px;

      color: rgba(255,255,255,.15);
    }

    .right,
    .left {
      position: absolute;

      width: 100%;
      height: 100%;

      top: 0;
    }

    .right {
      left: 66%;
    }

    .left {
      right: 66%;
    }

    .right::after {
      top: -30px;

      left: calc(-66% - 20px);

      background: rgba(255,255,255,.15);

      color: transparent;

      transition: transform .4s ease-out;

      transform: translate(0,-90%) rotate(0deg);
    }

    .btn-create:hover .right::after {
      transform: translate(0,-47%) rotate(0deg);
    }

    .btn-create .right:hover::after {
      transform: translate(0,-50%) rotate(-7deg);
    }

    .btn-create .left:hover ~ .right::after {
      transform: translate(0,-50%) rotate(7deg);
    }

    /* --- BUBBLES animation --- */
    .btn-create::before {
      content: '';

      pointer-events: none;

      opacity: .55;

      background:
        radial-gradient(circle at 20% 35%,
          transparent 0,
          transparent 2px,
          rgba(255,255,255,.9) 3px,
          rgba(255,255,255,.9) 4px,
          transparent 4px),

        radial-gradient(circle at 75% 44%,
          transparent 0,
          transparent 2px,
          rgba(255,255,255,.8) 3px,
          rgba(255,255,255,.8) 4px,
          transparent 4px),

        radial-gradient(circle at 46% 52%,
          transparent 0,
          transparent 4px,
          rgba(255,255,255,.9) 5px,
          rgba(255,255,255,.9) 6px,
          transparent 6px);

      width: 100%;
      height: 300%;

      top: 0;
      left: 0;

      position: absolute;

      animation: bubbles 5s linear infinite both;
    }

    /* Active state micro-interaction */
    .btn-create:active {
      transform: scale(0.98);
      transition: transform 0.05s ease;
    }

    /* Dark mode override for button */
    :host-context(.dark-theme) .btn-create {
      --btn-color: #E21C2A;
      --shadow-color: rgba(226,28,42,.4);
    }

    /* ========== END FIZZY BUTTON ========== */

    /* ===== TABLE ===== */
    .table-wrapper {
      overflow-x: auto;
      border-radius: 24px;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
      border: 1px solid var(--border-table);
      background: var(--bg-container);
      backdrop-filter: blur(8px);
    }

    .table-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(180deg, var(--table-glow), transparent);
      pointer-events: none;
      border-radius: 24px 24px 0 0;
    }

    .demandes-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      min-width: 850px;
      position: relative;
    }

    .demandes-table th {
      text-align: left;
      padding: 1rem 1rem;
      background: var(--bg-header);
      color: var(--text-secondary);
      font-weight: 800;
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid var(--border-table);
      position: sticky;
      top: 0;
      z-index: 5;
      backdrop-filter: blur(12px);
      transition: color 0.5s ease, background 0.5s ease;
    }
    .demandes-table th:first-child { border-radius: 24px 0 0 0; }
    .demandes-table th:last-child { border-radius: 0 24px 0 0; }

    .demandes-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--border-table);
      color: var(--text-primary);
      vertical-align: middle;
      transition: all 0.3s ease;
    }

    .demandes-table tbody tr {
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      position: relative;
    }

    .demandes-table tbody tr::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: linear-gradient(180deg, #1F2E5A, #E21C2A);
      transform: scaleY(0);
      transition: transform 0.3s ease;
      border-radius: 0 3px 3px 0;
    }
    :host-context(.dark-theme) .demandes-table tbody tr::after {
      background: linear-gradient(180deg, #E21C2A, #f87171);
    }

    .demandes-table tbody tr:hover {
      background: var(--hover-row);
    }
    .demandes-table tbody tr:hover::after {
      transform: scaleY(1);
    }

    .table-row-anim {
      animation: rowSlide 0.4s ease-out both;
    }

    /* ID Cell */
    .id-cell {
      font-weight: 800;
      font-size: 0.8rem;
      background: var(--badge-id-bg);
      padding: 0.2rem 0.6rem;
      border-radius: 8px;
      color: var(--badge-id-color);
      letter-spacing: -0.02em;
      transition: all 0.3s ease;
    }
    tr:hover .id-cell {
      background: rgba(31,46,90,0.1);
    }
    :host-context(.dark-theme) tr:hover .id-cell {
      background: rgba(255,255,255,0.08);
    }

    /* Title Cell */
    .title-cell {
      font-weight: 600;
      max-width: 200px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* User Cell */
    .user-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      font-size: 0.82rem;
    }
    .user-avatar-mini {
      width: 26px;
      height: 26px;
      border-radius: 10px;
      background: var(--avatar-bg);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      font-weight: 800;
      flex-shrink: 0;
      transition: transform 0.3s ease, background 0.5s ease;
    }
    tr:hover .user-avatar-mini {
      transform: scale(1.1);
    }
    .user-avatar-mini.creator {
      background: var(--avatar-creator-bg);
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.28rem 0.85rem;
      border-radius: 40px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      display: inline-block;
    }
    .badge.PENDING { 
      background: #fffbeb; 
      color: #92400e; 
      border: 1px solid rgba(245,158,11,0.2);
    }
    .badge.PENDING .badge-dot { background: #f59e0b; animation: dotPulse 2s infinite; }
    .badge.APPROVED { 
      background: #ecfdf5; 
      color: #065f46; 
      border: 1px solid rgba(34,197,94,0.2);
    }
    .badge.APPROVED .badge-dot { background: #22c55e; }
    .badge.REJECTED { 
      background: #fef2f2; 
      color: #991b1b; 
      border: 1px solid rgba(226,28,42,0.2);
    }
    .badge.REJECTED .badge-dot { background: #E21C2A; }

    :host-context(.dark-theme) .badge.PENDING { background: rgba(120,53,15,0.35); color: #fbbf24; border-color: rgba(245,158,11,0.15); }
    :host-context(.dark-theme) .badge.APPROVED { background: rgba(20,83,45,0.35); color: #4ade80; border-color: rgba(34,197,94,0.15); }
    :host-context(.dark-theme) .badge.REJECTED { background: rgba(127,29,29,0.35); color: #f87171; border-color: rgba(226,28,42,0.15); }

    .badge:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px -2px rgba(0,0,0,0.1);
    }

    /* Date Cell */
    .date-cell {
      font-size: 0.78rem;
      color: var(--text-secondary);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    /* Progress */
    .progress-cell { min-width: 130px; }
    .progress-wrapper {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .progress-bar {
      flex: 1;
      height: 7px;
      background: var(--progress-bg);
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      transition: background 0.5s ease;
    }
    .progress-fill {
      height: 100%;
      background: var(--progress-fill);
      border-radius: 20px;
      transition: width 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1), background 0.5s ease;
      position: relative;
      overflow: hidden;
    }
    .progress-glow {
      position: absolute;
      top: 0;
      left: -40%;
      width: 40%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: progressShine 2.5s ease-in-out infinite;
    }
    .progress-text {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-secondary);
      min-width: 32px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* Detail Button */
    .btn-detail {
      background: transparent;
      border: 1px solid var(--btn-border);
      padding: 0.35rem 1rem;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--btn-color);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .btn-detail svg {
      transition: transform 0.3s ease;
    }
    .btn-detail:hover {
      background: var(--btn-hover-bg);
      border-color: var(--btn-hover-bg);
      color: var(--btn-hover-color);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px -4px rgba(31,46,90,0.2);
    }
    :host-context(.dark-theme) .btn-detail:hover {
      box-shadow: 0 6px 16px -4px rgba(226,28,42,0.25);
    }
    .btn-detail:hover svg {
      transform: scale(1.2);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem !important;
    }
    .empty-orb {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(31,46,90,0.06), rgba(226,28,42,0.06));
      margin: 0 auto 1.5rem;
      animation: emptyPulse 3s ease-in-out infinite;
    }
    :host-context(.dark-theme) .empty-orb {
      background: linear-gradient(135deg, rgba(226,28,42,0.1), rgba(248,113,113,0.08));
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.8rem;
      display: block;
    }
    .empty-state p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1.2rem;
      font-weight: 500;
    }
    .btn-create-small {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      padding: 0.5rem 1.4rem;
      border-radius: 14px;
      font-size: 0.82rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 4px 12px rgba(31,46,90,0.2);
    }
    .btn-create-small:hover {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 20px rgba(226,28,42,0.25);
    }

    /* ===== PAGINATION ===== */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.2rem;
      margin-top: 1.5rem;
      position: relative;
      z-index: 2;
    }
    .page-btn {
      background: var(--btn-bg);
      border: 1px solid var(--btn-border);
      padding: 0.5rem 1.3rem;
      border-radius: 14px;
      font-weight: 700;
      font-size: 0.8rem;
      color: var(--btn-color);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      backdrop-filter: blur(8px);
    }
    .page-btn:hover:not(:disabled) {
      background: var(--btn-hover-bg);
      border-color: var(--btn-hover-bg);
      color: var(--btn-hover-color);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px -4px rgba(31,46,90,0.2);
    }
    :host-context(.dark-theme) .page-btn:hover:not(:disabled) {
      box-shadow: 0 6px 16px -4px rgba(226,28,42,0.25);
    }
    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none !important;
    }
    .page-btn svg {
      transition: transform 0.3s ease;
    }
    .page-btn:hover:not(:disabled) svg {
      transform: translateX(-2px);
    }
    .page-btn-next:hover:not(:disabled) svg {
      transform: translateX(2px);
    }

    .page-indicators {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
    }
    .page-current {
      font-size: 1.1rem;
      color: var(--text-primary);
      font-weight: 900;
      background: var(--badge-id-bg);
      padding: 0.25rem 0.7rem;
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    .page-separator {
      color: var(--text-muted);
      font-weight: 400;
    }
    .page-total {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .demandes-container {
        padding: 1.5rem 1rem;
        border-radius: 28px;
      }
      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-group select {
        width: 100%;
        min-width: unset;
      }
      .btn-create {
        justify-content: center;
      }
      .demandes-table th, .demandes-table td {
        padding: 0.7rem 0.7rem;
      }
    }

    @media (max-width: 640px) {
      .demandes-container {
        padding: 1rem 0.75rem;
        border-radius: 20px;
      }
      h2 { font-size: 1.5rem; }
      .header-stats { gap: 0.4rem; }
      .stat-badge { font-size: 0.65rem; padding: 0.25rem 0.6rem; }
      .bg-orb { display: none; }
      .pagination { gap: 0.6rem; }
      .page-btn { padding: 0.4rem 0.9rem; font-size: 0.75rem; }
    }
  `]
})
export class DemandesListComponent implements OnInit {
  demandes: Demande[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  selectedStatut: string = '';
  selectedMyAction: string = '';
  stats: { pending: number; approved: number; rejected: number } | null = null;

  constructor(
    private demandeService: DemandeService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const statutParam = params['statut'];
      const myActionParam = params['myAction'];
      if (statutParam && (statutParam === 'PENDING' || statutParam === 'APPROVED' || statutParam === 'REJECTED')) {
        this.selectedStatut = statutParam;
        this.selectedMyAction = '';
      } else if (myActionParam && (myActionParam === 'APPROVE' || myActionParam === 'REJECT')) {
        this.selectedMyAction = myActionParam;
        this.selectedStatut = '';
      }
      this.loadDemandes(0);
    });
    this.loadStats();
  }

  loadDemandes(page: number): void {
    this.currentPage = page;
    const statutParam = this.selectedStatut === '' ? undefined : this.selectedStatut;
    const myActionParam = this.selectedMyAction === '' ? undefined : this.selectedMyAction;

    this.demandeService.getDemandes(page, this.pageSize, statutParam, myActionParam).subscribe({
      next: (pageData: Page<Demande>) => {
        this.demandes = pageData.content;
        this.totalPages = pageData.totalPages;
      },
      error: (err) => console.error('Erreur chargement demandes', err)
    });
  }

  loadStats(): void {
    this.demandeService.getStats?.().subscribe({
      next: (stats) => this.stats = stats,
      error: () => this.stats = null
    });
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadDemandes(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.loadDemandes(this.currentPage - 1);
    }
  }

  getStatutClass(statut: string): string {
    return statut;
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'PENDING': return this.translate.instant('DEMANDES_LIST.PENDING');
      case 'APPROVED': return this.translate.instant('DEMANDES_LIST.APPROVED');
      case 'REJECTED': return this.translate.instant('DEMANDES_LIST.REJECTED');
      default: return statut;
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}