import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="neo-historique-container">
      <!-- Header -->
      <div class="neo-header">
        <div class="neo-header-left">
          <div class="neo-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="neo-header-text">
            <h2>{{ 'HISTORIQUE.TITLE' | translate }}</h2>
            <p class="neo-subtitle" *ngIf="totalItems > 0">{{ totalItems }} éléments</p>
          </div>
        </div>
        <button *ngIf="hasActiveFilters()" class="neo-clear-all-header-btn" (click)="clearAllFilters()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          {{ 'HISTORIQUE.RESET_FILTERS' | translate }}
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [(ngModel)]="searchKeyword" (input)="applyFilters()" class="search-input" [placeholder]="'HISTORIQUE.SEARCH_PLACEHOLDER' | translate">
          <button *ngIf="searchKeyword" class="search-clear" (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filtres avancés : Action + Dates + Presets -->
      <div class="filters-row">
        <!-- Filtre type action -->
        <div class="filter-chip-group">
          <button class="filter-chip" [class.active]="filterAction === ''" (click)="setActionFilter('')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="4"></rect>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
            {{ 'HISTORIQUE.FILTER_ALL' | translate }}
          </button>
          <button class="filter-chip" [class.active]="filterAction === 'APPROVE'" (click)="setActionFilter('APPROVE')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ 'HISTORIQUE.APPROVED' | translate }}
          </button>
          <button class="filter-chip" [class.active]="filterAction === 'REJECT'" (click)="setActionFilter('REJECT')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            {{ 'HISTORIQUE.REJECTED' | translate }}
          </button>
        </div>

        <!-- Séparateur -->
        <div class="filter-divider"></div>

        <!-- Presets date rapides -->
        <div class="filter-chip-group date-presets">
          <button class="filter-chip date-chip" [class.active]="datePreset === 'today'" (click)="setDatePreset('today')">
            {{ 'HISTORIQUE.DATE_TODAY' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'week'" (click)="setDatePreset('week')">
            {{ 'HISTORIQUE.DATE_THIS_WEEK' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'month'" (click)="setDatePreset('month')">
            {{ 'HISTORIQUE.DATE_THIS_MONTH' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'custom'" (click)="openCustomDateRange()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ 'HISTORIQUE.DATE_CUSTOM' | translate }}
          </button>
        </div>

        <!-- Compteur -->
        <div class="filter-stats" *ngIf="totalItems > 0">
          <span class="stats-current">{{ paginatedActions.length }}</span>
          <span class="stats-sep">/</span>
          <span class="stats-total">{{ totalItems }}</span>
        </div>
      </div>

      <!-- Custom Date Range Panel -->
      <div class="date-range-panel" [class.open]="showCustomDateRange">
        <div class="date-range-inner">
          <div class="date-field">
            <label>{{ 'HISTORIQUE.DATE_FROM' | translate }}</label>
            <div class="date-input-wrapper">
              <svg class="date-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="3"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input type="date" [(ngModel)]="dateFrom" (change)="onCustomDateChange()" class="date-input">
            </div>
          </div>
          <div class="date-arrow-sep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <div class="date-field">
            <label>{{ 'HISTORIQUE.DATE_TO' | translate }}</label>
            <div class="date-input-wrapper">
              <svg class="date-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="3"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input type="date" [(ngModel)]="dateTo" (change)="onCustomDateChange()" class="date-input">
            </div>
          </div>
          <button class="date-apply-btn" (click)="applyCustomDateRange()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ 'HISTORIQUE.DATE_APPLY' | translate }}
          </button>
          <button class="date-clear-btn" (click)="clearDateFilter()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Active filters summary bar -->
      <div class="active-filters-bar" *ngIf="hasActiveFilters()">
        <div class="active-filters-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          {{ 'HISTORIQUE.ACTIVE_FILTERS' | translate }}
        </div>
        <div class="active-filter-tags">
          <span class="active-tag" *ngIf="filterAction !== ''">
            {{ filterAction === 'APPROVE' ? ('HISTORIQUE.APPROVED' | translate) : ('HISTORIQUE.REJECTED' | translate) }}
            <button class="tag-remove" (click)="setActionFilter('')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
          <span class="active-tag" *ngIf="datePreset !== 'all' && datePreset !== 'custom'">
            {{ getDatePresetLabel(datePreset) }}
            <button class="tag-remove" (click)="clearDateFilter()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
          <span class="active-tag" *ngIf="datePreset === 'custom' && (dateFrom || dateTo)">
            {{ dateFrom || '...' }} → {{ dateTo || '...' }}
            <button class="tag-remove" (click)="clearDateFilter()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
          <span class="active-tag" *ngIf="searchKeyword.trim()">
            "{{ searchKeyword }}"
            <button class="tag-remove" (click)="clearSearch()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        </div>
        <button class="clear-all-btn" (click)="clearAllFilters()">
          {{ 'HISTORIQUE.CLEAR_ALL' | translate }}
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredActions.length === 0" class="neo-empty-state">
        <div class="neo-empty-clock">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <p class="empty-main-text">{{ 'HISTORIQUE.EMPTY' | translate }}</p>
        <p class="empty-sub-text" *ngIf="hasActiveFilters()">{{ 'HISTORIQUE.EMPTY_FILTERED' | translate }}</p>
        <button class="empty-reset-btn" *ngIf="hasActiveFilters()" (click)="clearAllFilters()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          {{ 'HISTORIQUE.RESET_FILTERS' | translate }}
        </button>
      </div>

      <!-- Liste des actions -->
      <div class="neo-list" [@listAnimation]="paginatedActions.length">
        <div *ngFor="let action of paginatedActions; let i = index" class="neo-card" [class.approve]="action.action === 'APPROVE'" [class.reject]="action.action === 'REJECT'" [style.animation-delay]="i * 0.05 + 's'">
          <div class="neo-status-bar" [class.approve-bar]="action.action === 'APPROVE'" [class.reject-bar]="action.action === 'REJECT'"></div>
          <div class="neo-content">
            <div class="neo-top-row">
              <div class="neo-date-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ action.dateAction | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="meta-relative" *ngIf="getRelativeDate(action.dateAction)">{{ getRelativeDate(action.dateAction) }}</span>
              </div>
              <div class="neo-action-badge" [class.approve-badge]="action.action === 'APPROVE'" [class.reject-badge]="action.action === 'REJECT'">
                <svg *ngIf="action.action === 'APPROVE'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg *ngIf="action.action === 'REJECT'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                {{ (action.action === 'APPROVE' ? 'HISTORIQUE.APPROVED' : 'HISTORIQUE.REJECTED') | translate }}
              </div>
            </div>
            <div class="neo-demande-info">
              <span class="demande-id">{{ 'HISTORIQUE.REQUEST_NUMBER' | translate:{ id: action.demandeId } }}</span>
              <span class="demande-sep">–</span>
              <span class="demande-title">{{ action.demandeTitre }}</span>
            </div>
            <div class="neo-comment" *ngIf="action.commentaire">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{{ action.commentaire }}</span>
            </div>
          </div>
          <div class="neo-action">
            <a [routerLink]="['/demandes', action.demandeId]" class="neo-action-link">
              {{ 'HISTORIQUE.VIEW_REQUEST' | translate }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar" *ngIf="totalPages > 0">
        <button class="btn-pagination" (click)="prevPage()" [disabled]="currentPage === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ 'HISTORIQUE.PREVIOUS' | translate }}
        </button>
        <div class="page-numbers">
          <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">
            {{ p + 1 }}
          </button>
        </div>
        <span class="page-info">{{ 'HISTORIQUE.PAGE' | translate: { current: currentPage+1, total: totalPages } }}</span>
        <button class="btn-pagination" (click)="nextPage()" [disabled]="currentPage + 1 >= totalPages">
          {{ 'HISTORIQUE.NEXT' | translate }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       ULTRA PRO MAX DESIGN SYSTEM – HISTORIQUE WITH DATE FILTRATION
       ========================================================================== */
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Light mode variables */
    .neo-historique-container {
      --bg-gradient-start: #f8fafc;
      --bg-gradient-end: #eef2f6;
      --card-bg: #ffffff;
      --card-border: #eef0f7;
      --text-primary: #0c1222;
      --text-secondary: #4a5568;
      --text-muted: #94a3b8;
      --icon-stroke: #64748b;
      --border-light: #e2e8f4;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.05);
      --shadow-hover: 0 12px 28px -8px rgba(31, 46, 90, 0.12);
      --accent-gradient: linear-gradient(135deg, #1F2E5A, #E21C2A);
      --accent-primary: #1F2E5A;
      --accent-secondary: #E21C2A;
      --approve-color: #15803d;
      --approve-bg: rgba(21, 128, 61, 0.06);
      --approve-border: rgba(21, 128, 61, 0.15);
      --approve-glow: rgba(21, 128, 61, 0.3);
      --reject-color: #b91c2c;
      --reject-bg: rgba(185, 28, 44, 0.06);
      --reject-border: rgba(185, 28, 44, 0.15);
      --reject-glow: rgba(185, 28, 44, 0.3);
      --default-bar: var(--border-light);
      --chip-bg: rgba(31, 46, 90, 0.04);
      --chip-border: rgba(31, 46, 90, 0.08);
      --chip-active-bg: linear-gradient(135deg, #1F2E5A, #2a3f78);
      --chip-active-border: transparent;
      --chip-active-text: #ffffff;
      --chip-active-shadow: 0 4px 14px rgba(31, 46, 90, 0.3);
      --chip-approve-active-bg: linear-gradient(135deg, #15803d, #16a34a);
      --chip-approve-active-shadow: 0 4px 14px rgba(21, 128, 61, 0.35);
      --chip-reject-active-bg: linear-gradient(135deg, #b91c2c, #dc2626);
      --chip-reject-active-shadow: 0 4px 14px rgba(185, 28, 44, 0.35);
      --date-panel-bg: #ffffff;
      --date-panel-border: #e2e8f4;
      --date-input-bg: #f8fafc;
      --date-input-border: #e2e8f4;
      --date-input-focus: #1F2E5A;
      --active-tag-bg: rgba(31, 46, 90, 0.08);
      --active-tag-border: rgba(31, 46, 90, 0.15);
      --active-tag-text: #1F2E5A;
      --divider-color: #e2e8f4;
      --comment-bg: rgba(31, 46, 90, 0.03);
      --comment-border: rgba(31, 46, 90, 0.08);
      --date-badge-bg: rgba(0, 0, 0, 0.03);
      --meta-relative-color: #1F2E5A;
    }

    /* Dark mode variables */
    :host-context(.dark-theme) .neo-historique-container {
      --bg-gradient-start: #0f172a;
      --bg-gradient-end: #1e293b;
      --card-bg: rgba(30, 41, 59, 0.96);
      --card-border: rgba(255, 255, 255, 0.06);
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      --icon-stroke: #94a3b8;
      --border-light: #334155;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
      --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25);
      --shadow-hover: 0 16px 32px -12px rgba(0, 0, 0, 0.4);
      --accent-gradient: linear-gradient(135deg, #E21C2A, #f87171);
      --accent-primary: #E21C2A;
      --accent-secondary: #f87171;
      --approve-color: #4ade80;
      --approve-bg: rgba(74, 222, 128, 0.08);
      --approve-border: rgba(74, 222, 128, 0.18);
      --approve-glow: rgba(74, 222, 128, 0.35);
      --reject-color: #f87171;
      --reject-bg: rgba(248, 113, 113, 0.08);
      --reject-border: rgba(248, 113, 113, 0.18);
      --reject-glow: rgba(248, 113, 113, 0.35);
      --default-bar: var(--border-light);
      --chip-bg: rgba(255, 255, 255, 0.06);
      --chip-border: rgba(255, 255, 255, 0.1);
      --chip-active-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --chip-active-border: transparent;
      --chip-active-text: #ffffff;
      --chip-active-shadow: 0 4px 14px rgba(226, 28, 42, 0.4);
      --chip-approve-active-bg: linear-gradient(135deg, #16a34a, #15803d);
      --chip-approve-active-shadow: 0 4px 14px rgba(74, 222, 128, 0.35);
      --chip-reject-active-bg: linear-gradient(135deg, #dc2626, #b91c2c);
      --chip-reject-active-shadow: 0 4px 14px rgba(248, 113, 113, 0.35);
      --date-panel-bg: rgba(30, 41, 59, 0.98);
      --date-panel-border: rgba(255, 255, 255, 0.08);
      --date-input-bg: rgba(15, 23, 42, 0.8);
      --date-input-border: #475569;
      --date-input-focus: #E21C2A;
      --active-tag-bg: rgba(226, 28, 42, 0.12);
      --active-tag-border: rgba(226, 28, 42, 0.25);
      --active-tag-text: #f87171;
      --divider-color: #334155;
      --comment-bg: rgba(255, 255, 255, 0.04);
      --comment-border: rgba(255, 255, 255, 0.08);
      --date-badge-bg: rgba(255, 255, 255, 0.05);
      --meta-relative-color: #E21C2A;
    }

    .neo-historique-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 2rem;
      background: radial-gradient(circle at 10% 20%, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
      border-radius: 40px;
      transition: background 0.5s ease;
    }

    /* ===== HEADER ===== */
    .neo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .neo-header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .neo-header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: var(--accent-gradient);
      border-radius: 20px;
      color: white;
      box-shadow: 0 12px 24px -8px rgba(31, 46, 90, 0.3);
      transition: transform 0.3s ease;
    }

    :host-context(.dark-theme) .neo-header-icon {
      box-shadow: 0 12px 24px -8px rgba(226, 28, 42, 0.3);
    }

    .neo-header-icon:hover {
      transform: scale(1.05) rotate(-5deg);
    }

    .neo-header-text h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      background: var(--accent-gradient);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.5px;
    }

    .neo-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .neo-clear-all-header-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 1.5rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 60px;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      backdrop-filter: blur(8px);
      font-family: inherit;
    }

    .neo-clear-all-header-btn:hover {
      background: var(--accent-secondary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px var(--reject-glow);
      border-color: transparent;
    }

    /* ===== SEARCH ROW ===== */
    .search-row {
      margin-bottom: 1rem;
    }

    .search-input-wrapper {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      stroke: var(--icon-stroke);
      pointer-events: none;
      transition: stroke 0.3s;
    }

    .search-input {
      width: 90%;
      padding: 0.85rem 3rem 0.85rem 3rem;
      border: 1.5px solid var(--border-light);
      border-radius: 60px;
      font-size: 0.9rem;
      background: var(--card-bg);
      color: var(--text-primary);
      transition: all 0.3s;
      font-weight: 500;
      font-family: inherit;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.12);
    }

    :host-context(.dark-theme) .search-input:focus {
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }

    .search-input:focus ~ .search-icon {
      stroke: var(--accent-primary);
    }

    .search-clear {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--chip-bg);
      border: 1px solid var(--chip-border);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.2s;
      padding: 0;
    }

    .search-clear:hover {
      background: var(--accent-secondary);
      color: white;
      border-color: transparent;
      transform: translateY(-50%) scale(1.1);
    }

    /* ===== FILTERS ROW ===== */
    .filters-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-chip-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      background: var(--chip-bg);
      border: 1.5px solid var(--chip-border);
      border-radius: 40px;
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      white-space: nowrap;
      font-family: inherit;
    }

    .filter-chip:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }

    .filter-chip.active {
      background: var(--chip-active-bg);
      border-color: var(--chip-active-border);
      color: var(--chip-active-text);
      box-shadow: var(--chip-active-shadow);
      transform: translateY(-1px);
    }

    /* Approve chip override */
    .filter-chip.active:nth-child(2) {
      background: var(--chip-approve-active-bg);
      box-shadow: var(--chip-approve-active-shadow);
    }

    /* Reject chip override */
    .filter-chip.active:nth-child(3) {
      background: var(--chip-reject-active-bg);
      box-shadow: var(--chip-reject-active-shadow);
    }

    .filter-chip.active:hover {
      transform: translateY(-2px);
    }

    .date-chip svg {
      opacity: 0.7;
    }

    .filter-chip.active .date-chip svg {
      opacity: 1;
    }

    .filter-divider {
      width: 1px;
      height: 28px;
      background: var(--divider-color);
      border-radius: 2px;
      flex-shrink: 0;
    }

    .filter-stats {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: var(--card-bg);
      backdrop-filter: blur(4px);
      padding: 0.45rem 1rem;
      border-radius: 60px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid var(--card-border);
      white-space: nowrap;
      margin-left: auto;
    }

    .stats-current {
      color: var(--accent-primary);
      font-size: 0.9rem;
    }

    .stats-sep {
      color: var(--text-muted);
    }

    .stats-total {
      color: var(--text-muted);
    }

    /* ===== DATE RANGE PANEL ===== */
    .date-range-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.4s ease;
      opacity: 0;
      margin-bottom: 0;
    }

    .date-range-panel.open {
      max-height: 120px;
      opacity: 1;
      margin-bottom: 1rem;
    }

    .date-range-inner {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem;
      background: var(--date-panel-bg);
      border: 1.5px solid var(--date-panel-border);
      border-radius: 24px;
      box-shadow: var(--shadow-md);
      flex-wrap: wrap;
    }

    .date-field {
      flex: 1;
      min-width: 160px;
    }

    .date-field label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }

    .date-input-wrapper {
      position: relative;
    }

    .date-field-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      stroke: var(--icon-stroke);
      pointer-events: none;
      z-index: 2;
    }

    .date-input {
      width: 100%;
      padding: 0.6rem 0.8rem 0.6rem 2.4rem;
      border: 1.5px solid var(--date-input-border);
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: 500;
      background: var(--date-input-bg);
      color: var(--text-primary);
      font-family: inherit;
      transition: all 0.25s;
      cursor: pointer;
    }

    .date-input:focus {
      outline: none;
      border-color: var(--date-input-focus);
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }

    :host-context(.dark-theme) .date-input:focus {
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }

    .date-input::-webkit-calendar-picker-indicator {
      filter: opacity(0.5);
      cursor: pointer;
    }

    :host-context(.dark-theme) .date-input::-webkit-calendar-picker-indicator {
      filter: invert(1) opacity(0.5);
    }

    .date-arrow-sep {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      padding-bottom: 2px;
      flex-shrink: 0;
    }

    .date-apply-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
      background: var(--chip-active-bg);
      border: none;
      border-radius: 16px;
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s;
      font-family: inherit;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .date-apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--chip-active-shadow);
    }

    .date-clear-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--chip-bg);
      border: 1.5px solid var(--chip-border);
      border-radius: 12px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      padding: 0;
    }

    .date-clear-btn:hover {
      background: var(--accent-secondary);
      color: white;
      border-color: transparent;
      transform: scale(1.05);
    }

    /* ===== ACTIVE FILTERS BAR ===== */
    .active-filters-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      background: var(--chip-bg);
      border: 1px solid var(--chip-border);
      border-radius: 20px;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .active-filters-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .active-filter-tags {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      flex: 1;
    }

    .active-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      background: var(--active-tag-bg);
      border: 1px solid var(--active-tag-border);
      border-radius: 30px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--active-tag-text);
      animation: tagPop 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    @keyframes tagPop {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    .tag-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      color: var(--active-tag-text);
      opacity: 0.6;
      padding: 0;
      transition: all 0.2s;
    }

    .tag-remove:hover {
      opacity: 1;
      background: var(--accent-secondary);
      color: white;
    }

    .clear-all-btn {
      background: transparent;
      border: none;
      color: var(--accent-secondary);
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: inherit;
    }

    .clear-all-btn:hover {
      background: rgba(226, 28, 42, 0.08);
    }

    /* ===== EMPTY STATE ===== */
    .neo-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: var(--card-bg);
      border-radius: 32px;
      border: 1px dashed var(--card-border);
      backdrop-filter: blur(4px);
    }

    .neo-empty-clock {
      color: var(--text-muted);
      opacity: 0.5;
      margin-bottom: 1rem;
      animation: float 6s ease-in-out infinite;
    }

    .empty-main-text {
      color: var(--text-muted);
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .empty-sub-text {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      margin: 0.5rem 0 0;
      opacity: 0.7;
    }

    .empty-reset-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
      padding: 0.6rem 1.4rem;
      background: var(--chip-active-bg);
      border: none;
      border-radius: 60px;
      color: white;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      font-family: inherit;
    }

    .empty-reset-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--chip-active-shadow);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(3deg); }
      75% { transform: translateY(-4px) rotate(-2deg); }
    }

    /* ===== LIST ===== */
    .neo-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .neo-card {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--card-bg);
      backdrop-filter: blur(8px);
      border: 1px solid var(--card-border);
      border-radius: 28px;
      padding: 1.5rem;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: var(--shadow-sm);
      animation: fadeSlideUp 0.4s ease-out backwards;
    }

    .neo-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
    }

    .neo-card.approve {
      background: var(--approve-bg);
      border-color: var(--approve-border);
    }

    .neo-card.approve:hover {
      border-color: var(--approve-color);
      box-shadow: 0 12px 28px -8px var(--approve-glow);
    }

    .neo-card.reject {
      background: var(--reject-bg);
      border-color: var(--reject-border);
    }

    .neo-card.reject:hover {
      border-color: var(--reject-color);
      box-shadow: 0 12px 28px -8px var(--reject-glow);
    }

    .neo-status-bar {
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 4px;
      background: var(--default-bar);
      border-radius: 0 8px 8px 0;
      transition: all 0.3s;
    }

    .neo-status-bar.approve-bar {
      background: linear-gradient(180deg, #15803d, #22c55e);
      box-shadow: 0 0 12px var(--approve-glow);
    }

    .neo-status-bar.reject-bar {
      background: linear-gradient(180deg, #b91c2c, #ef4444);
      box-shadow: 0 0 12px var(--reject-glow);
    }

    .neo-content {
      flex: 1;
      padding-left: 1.5rem;
    }

    .neo-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .neo-date-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      background: var(--date-badge-bg);
      padding: 0.3rem 0.8rem;
      border-radius: 30px;
    }

    .meta-relative {
      color: var(--meta-relative-color);
      font-weight: 700;
      text-transform: none;
      font-size: 0.68rem;
      margin-left: 0.15rem;
    }

    .neo-action-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.68rem;
      letter-spacing: 0.8px;
      padding: 0.3rem 0.9rem;
      border-radius: 30px;
      transition: all 0.3s;
    }

    .neo-action-badge.approve-badge {
      color: var(--approve-color);
      background: var(--approve-bg);
      border: 1px solid var(--approve-border);
    }

    .neo-action-badge.reject-badge {
      color: var(--reject-color);
      background: var(--reject-bg);
      border: 1px solid var(--reject-border);
    }

    .neo-demande-info {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .demande-id {
      font-weight: 800;
      color: var(--accent-primary);
      font-size: 0.85rem;
    }

    :host-context(.dark-theme) .demande-id {
      color: var(--accent-secondary);
    }

    .demande-sep {
      color: var(--text-muted);
      font-weight: 300;
    }

    .demande-title {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .neo-comment {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.75rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: var(--comment-bg);
      padding: 0.65rem 1rem;
      border-radius: 18px;
      border: 1px solid var(--comment-border);
      line-height: 1.5;
      transition: all 0.2s;
    }

    .neo-comment svg {
      flex-shrink: 0;
      margin-top: 2px;
      stroke: var(--icon-stroke);
    }

    .neo-action {
      margin-left: 1rem;
      flex-shrink: 0;
    }

    .neo-action-link {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 1.4rem;
      background: rgba(31, 46, 90, 0.05);
      border-radius: 60px;
      color: var(--accent-primary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    :host-context(.dark-theme) .neo-action-link {
      background: rgba(226, 28, 42, 0.12);
      color: var(--accent-secondary);
    }

    .neo-action-link:hover {
      background: var(--accent-primary);
      color: white;
      transform: translateX(6px);
      box-shadow: 0 4px 12px rgba(31, 46, 90, 0.3);
    }

    :host-context(.dark-theme) .neo-action-link:hover {
      background: var(--accent-secondary);
      box-shadow: 0 4px 12px rgba(226, 28, 42, 0.4);
    }

    .neo-action-link svg {
      transition: transform 0.3s;
    }

    .neo-action-link:hover svg {
      transform: translateX(4px);
    }

    /* ===== PAGINATION ===== */
    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2.5rem;
      padding: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-pagination {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border-light);
      padding: 0.6rem 1.4rem;
      border-radius: 60px;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.25s;
      font-family: inherit;
    }

    .btn-pagination:hover:not(:disabled) {
      background: var(--accent-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(31, 46, 90, 0.3);
      border-color: transparent;
    }

    :host-context(.dark-theme) .btn-pagination:hover:not(:disabled) {
      background: var(--accent-secondary);
      box-shadow: 0 6px 14px rgba(226, 28, 42, 0.4);
    }

    .btn-pagination:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.3rem;
    }

    .page-num {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--card-bg);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      padding: 0;
    }

    .page-num:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      transform: translateY(-1px);
    }

    .page-num.active {
      background: var(--chip-active-bg);
      border-color: var(--chip-active-border);
      color: white;
      box-shadow: var(--chip-active-shadow);
    }

    .page-info {
      font-size: 0.85rem;
      font-weight: 700;
      background: var(--card-bg);
      padding: 0.5rem 1.2rem;
      border-radius: 60px;
      color: var(--text-primary);
      border: 1px solid var(--border-light);
    }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .neo-historique-container {
        padding: 1rem;
        border-radius: 24px;
      }
      .filters-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .filter-divider {
        width: 100%;
        height: 1px;
      }
      .filter-stats {
        margin-left: 0;
        align-self: flex-end;
      }
      .date-range-inner {
        flex-direction: column;
        align-items: stretch;
      }
      .date-arrow-sep {
        transform: rotate(90deg);
        align-self: center;
        padding: 0;
      }
      .date-field {
        min-width: unset;
      }
      .date-apply-btn,
      .date-clear-btn {
        align-self: center;
      }
      .neo-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .neo-action {
        margin-left: 0;
        width: 100%;
      }
      .neo-action-link {
        justify-content: center;
        width: 100%;
      }
      .neo-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .neo-clear-all-header-btn {
        align-self: stretch;
        justify-content: center;
      }
      .active-filters-bar {
        flex-direction: column;
        align-items: flex-start;
      }
      .clear-all-btn {
        align-self: flex-end;
      }
      .page-numbers {
        display: none;
      }
      .neo-demande-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
      .demande-sep {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .neo-card,
      .search-input,
      .btn-pagination,
      .neo-action-link,
      .filter-chip,
      .neo-empty-clock {
        transition: none;
        animation: none;
      }
    }

    /* ===== CUSTOM SCROLLBAR ===== */
    ::-webkit-scrollbar {
      width: 5px;
    }
    ::-webkit-scrollbar-track {
      background: #eef2f6;
      border-radius: 10px;
    }
    :host-context(.dark-theme) ::-webkit-scrollbar-track {
      background: #1e293b;
    }
    ::-webkit-scrollbar-thumb {
      background: #1F2E5A;
      border-radius: 10px;
    }
    :host-context(.dark-theme) ::-webkit-scrollbar-thumb {
      background: #E21C2A;
    }
  `],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px) scale(0.98)' })
        ], { optional: true }),
        query(':enter', [
          stagger('60ms', [
            animate('450ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HistoriqueComponent implements OnInit {
  actions: any[] = [];
  filteredActions: any[] = [];
  paginatedActions: any[] = [];

  searchKeyword = '';
  filterAction = '';
  itemsPerPage = 6;
  currentPage = 0;
  totalPages = 0;
  totalItems = 0;

  /* Date filter state */
  dateFrom = '';
  dateTo = '';
  datePreset = 'all';
  showCustomDateRange = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.userService.getMyHistory().subscribe({
      next: (data) => {
        this.actions = data;
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  /* ===== Action filter ===== */
  setActionFilter(action: string): void {
    this.filterAction = action;
    this.applyFilters();
  }

  /* ===== Date presets ===== */
  setDatePreset(preset: string): void {
    if (this.datePreset === preset && preset !== 'custom') {
      this.clearDateFilter();
      return;
    }

    this.datePreset = preset;
    this.showCustomDateRange = false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        this.dateFrom = this.formatDateForInput(today);
        this.dateTo = this.formatDateForInput(today);
        break;
      case 'week': {
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        this.dateFrom = this.formatDateForInput(monday);
        this.dateTo = this.formatDateForInput(sunday);
        break;
      }
      case 'month': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        this.dateFrom = this.formatDateForInput(firstDay);
        this.dateTo = this.formatDateForInput(lastDay);
        break;
      }
      case 'custom':
        this.showCustomDateRange = true;
        return;
      default:
        this.dateFrom = '';
        this.dateTo = '';
        break;
    }

    this.applyFilters();
  }

  openCustomDateRange(): void {
    if (this.datePreset === 'custom' && this.showCustomDateRange) {
      this.showCustomDateRange = false;
      if (!this.dateFrom && !this.dateTo) {
        this.datePreset = 'all';
      }
      return;
    }

    this.datePreset = 'custom';
    this.showCustomDateRange = true;
  }

  onCustomDateChange(): void {
    /* Don't apply filters on every change — wait for Apply */
  }

  applyCustomDateRange(): void {
    if (!this.dateFrom && !this.dateTo) {
      this.clearDateFilter();
      return;
    }
    this.datePreset = 'custom';
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.datePreset = 'all';
    this.showCustomDateRange = false;
    this.applyFilters();
  }

  /* ===== Core filter logic ===== */
  applyFilters(): void {
    let filtered = [...this.actions];

    /* Text search */
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(a =>
        a.demandeTitre?.toLowerCase().includes(kw) ||
        a.commentaire?.toLowerCase().includes(kw) ||
        String(a.demandeId)?.toLowerCase().includes(kw)
      );
    }

    /* Action type */
    if (this.filterAction) {
      filtered = filtered.filter(a => a.action === this.filterAction);
    }

    /* Date range */
    if (this.dateFrom) {
      const from = this.parseDateToMidnight(this.dateFrom, true);
      filtered = filtered.filter(a => new Date(a.dateAction) >= from);
    }
    if (this.dateTo) {
      const to = this.parseDateToMidnight(this.dateTo, false);
      filtered = filtered.filter(a => new Date(a.dateAction) <= to);
    }

    this.filteredActions = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }
    if (this.totalPages === 0) {
      this.currentPage = 0;
    }
    this.updatePaginatedActions();
  }

  updatePaginatedActions(): void {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedActions = this.filteredActions.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedActions();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedActions();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedActions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /* ===== Utility methods ===== */
  clearSearch(): void {
    this.searchKeyword = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchKeyword = '';
    this.filterAction = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.datePreset = 'all';
    this.showCustomDateRange = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchKeyword.trim() !== '' ||
           this.filterAction !== '' ||
           this.datePreset !== 'all';
  }

  getDatePresetLabel(preset: string): string {
    switch (preset) {
      case 'today': return "Aujourd'hui";
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return preset;
    }
  }

  getRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return '';
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parseDateToMidnight(dateStr: string, isStart: boolean): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (isStart) {
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    } else {
      return new Date(y, m - 1, d, 23, 59, 59, 999);
    }
  }
}