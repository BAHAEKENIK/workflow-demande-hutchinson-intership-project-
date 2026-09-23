import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="neo-notifications-container">
      <!-- Header -->
      <div class="neo-header">
        <div class="neo-header-left">
          <div class="neo-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div class="neo-header-text">
            <h2>{{ 'NOTIFICATIONS.TITLE' | translate }}</h2>
            <p class="neo-subtitle" *ngIf="totalItems > 0">{{ totalItems }} éléments</p>
          </div>
        </div>
        <button *ngIf="notifications.length > 0" class="neo-mark-all-btn" (click)="markAllAsRead()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="search-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [(ngModel)]="searchKeyword" (input)="applyFilters()" class="search-input" [placeholder]="'NOTIFICATIONS.SEARCH_PLACEHOLDER' | translate">
          <button *ngIf="searchKeyword" class="search-clear" (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filtres avancés : Statut + Dates + Presets -->
      <div class="filters-row">
        <!-- Filtre statut lecture -->
        <div class="filter-chip-group">
          <button class="filter-chip" [class.active]="filterReadStatus === 'all'" (click)="setStatusFilter('all')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="4"></rect>
              <line x1="9" y1="12" x2="15" y2="12"></line>
            </svg>
            {{ 'NOTIFICATIONS.FILTER_ALL' | translate }}
          </button>
          <button class="filter-chip" [class.active]="filterReadStatus === 'unread'" (click)="setStatusFilter('unread')">
            <span class="chip-dot unread-dot"></span>
            {{ 'NOTIFICATIONS.FILTER_UNREAD' | translate }}
          </button>
          <button class="filter-chip" [class.active]="filterReadStatus === 'read'" (click)="setStatusFilter('read')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ 'NOTIFICATIONS.FILTER_READ' | translate }}
          </button>
        </div>

        <!-- Séparateur -->
        <div class="filter-divider"></div>

        <!-- Presets date rapides -->
        <div class="filter-chip-group date-presets">
          <button class="filter-chip date-chip" [class.active]="datePreset === 'today'" (click)="setDatePreset('today')">
            {{ 'NOTIFICATIONS.DATE_TODAY' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'week'" (click)="setDatePreset('week')">
            {{ 'NOTIFICATIONS.DATE_THIS_WEEK' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'month'" (click)="setDatePreset('month')">
            {{ 'NOTIFICATIONS.DATE_THIS_MONTH' | translate }}
          </button>
          <button class="filter-chip date-chip" [class.active]="datePreset === 'custom'" (click)="openCustomDateRange()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ 'NOTIFICATIONS.DATE_CUSTOM' | translate }}
          </button>
        </div>

        <!-- Compteur -->
        <div class="filter-stats" *ngIf="totalItems > 0">
          <span class="stats-current">{{ paginatedNotifications.length }}</span>
          <span class="stats-sep">/</span>
          <span class="stats-total">{{ totalItems }}</span>
        </div>
      </div>

      <!-- Custom Date Range Panel -->
      <div class="date-range-panel" [class.open]="showCustomDateRange">
        <div class="date-range-inner">
          <div class="date-field">
            <label>{{ 'NOTIFICATIONS.DATE_FROM' | translate }}</label>
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
            <label>{{ 'NOTIFICATIONS.DATE_TO' | translate }}</label>
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
            {{ 'NOTIFICATIONS.DATE_APPLY' | translate }}
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
          {{ 'NOTIFICATIONS.ACTIVE_FILTERS' | translate }}
        </div>
        <div class="active-filter-tags">
          <span class="active-tag" *ngIf="filterReadStatus !== 'all'">
            {{ filterReadStatus === 'unread' ? ('NOTIFICATIONS.FILTER_UNREAD' | translate) : ('NOTIFICATIONS.FILTER_READ' | translate) }}
            <button class="tag-remove" (click)="setStatusFilter('all')">
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
          {{ 'NOTIFICATIONS.CLEAR_ALL' | translate }}
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredNotifications.length === 0" class="neo-empty-state">
        <div class="neo-empty-bell">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <p class="empty-main-text">{{ 'NOTIFICATIONS.EMPTY' | translate }}</p>
        <p class="empty-sub-text" *ngIf="hasActiveFilters()">{{ 'NOTIFICATIONS.EMPTY_FILTERED' | translate }}</p>
        <button class="empty-reset-btn" *ngIf="hasActiveFilters()" (click)="clearAllFilters()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          {{ 'NOTIFICATIONS.RESET_FILTERS' | translate }}
        </button>
      </div>

      <!-- Liste des notifications -->
      <div class="neo-list" [@listAnimation]="paginatedNotifications.length">
        <div *ngFor="let notif of paginatedNotifications; let i = index" class="neo-card" [class.unread]="!notif.read" [style.animation-delay]="i * 0.05 + 's'">
          <div class="neo-status-bar" [class.active]="!notif.read"></div>
          <div class="neo-content">
            <div class="neo-top-row">
              <div class="neo-title">{{ notif.title }}</div>
              <div class="neo-glow-dot" [class.hidden]="notif.read"></div>
            </div>
            <div class="neo-message">{{ notif.message }}</div>
            <div class="neo-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{{ notif.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              <span class="meta-relative" *ngIf="getRelativeDate(notif.createdAt)">{{ getRelativeDate(notif.createdAt) }}</span>
            </div>
          </div>
          <div class="neo-action">
            <a [routerLink]="notif.actionUrl" (click)="markAsRead(notif.id)" class="neo-action-link">
              {{ 'NOTIFICATIONS.VIEW' | translate }}
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
          {{ 'NOTIFICATIONS.PREVIOUS' | translate }}
        </button>
        <div class="page-numbers">
          <button *ngFor="let p of getPageNumbers()" class="page-num" [class.active]="p === currentPage" (click)="goToPage(p)">
            {{ p + 1 }}
          </button>
        </div>
        <span class="page-info">{{ 'NOTIFICATIONS.PAGE' | translate: { current: currentPage+1, total: totalPages } }}</span>
        <button class="btn-pagination" (click)="nextPage()" [disabled]="currentPage + 1 >= totalPages">
          {{ 'NOTIFICATIONS.NEXT' | translate }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       ULTRA PRO MAX DESIGN SYSTEM – NOTIFICATIONS WITH DATE FILTRATION
       ========================================================================== */
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Light mode variables */
    .neo-notifications-container {
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
      --unread-bg: rgba(31, 46, 90, 0.03);
      --unread-border: rgba(31, 46, 90, 0.1);
      --glow-color: rgba(31, 46, 90, 0.3);
      --chip-bg: rgba(31, 46, 90, 0.04);
      --chip-border: rgba(31, 46, 90, 0.08);
      --chip-active-bg: linear-gradient(135deg, #1F2E5A, #2a3f78);
      --chip-active-border: transparent;
      --chip-active-text: #ffffff;
      --chip-active-shadow: 0 4px 14px rgba(31, 46, 90, 0.3);
      --date-panel-bg: #ffffff;
      --date-panel-border: #e2e8f4;
      --date-input-bg: #f8fafc;
      --date-input-border: #e2e8f4;
      --date-input-focus: #1F2E5A;
      --active-tag-bg: rgba(31, 46, 90, 0.08);
      --active-tag-border: rgba(31, 46, 90, 0.15);
      --active-tag-text: #1F2E5A;
      --divider-color: #e2e8f4;
    }

    /* Dark mode variables */
    :host-context(.dark-theme) .neo-notifications-container {
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
      --unread-bg: rgba(226, 28, 42, 0.08);
      --unread-border: rgba(226, 28, 42, 0.15);
      --glow-color: rgba(226, 28, 42, 0.4);
      --chip-bg: rgba(255, 255, 255, 0.06);
      --chip-border: rgba(255, 255, 255, 0.1);
      --chip-active-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --chip-active-border: transparent;
      --chip-active-text: #ffffff;
      --chip-active-shadow: 0 4px 14px rgba(226, 28, 42, 0.4);
      --date-panel-bg: rgba(30, 41, 59, 0.98);
      --date-panel-border: rgba(255, 255, 255, 0.08);
      --date-input-bg: rgba(15, 23, 42, 0.8);
      --date-input-border: #475569;
      --date-input-focus: #E21C2A;
      --active-tag-bg: rgba(226, 28, 42, 0.12);
      --active-tag-border: rgba(226, 28, 42, 0.25);
      --active-tag-text: #f87171;
      --divider-color: #334155;
    }

    .neo-notifications-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 2rem;
      background: radial-gradient(circle at 10% 20%, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
      border-radius: 40px;
      transition: background 0.5s ease;
    }

    /* Header */
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
      box-shadow: 0 12px 24px -8px var(--glow-color);
      transition: transform 0.3s ease;
    }

    .neo-header-icon:hover {
      transform: scale(1.05) rotate(5deg);
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

    .neo-mark-all-btn {
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
    }

    .neo-mark-all-btn:hover {
      background: var(--accent-primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px var(--glow-color);
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
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--glow-color);
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
      background: var(--accent-primary);
      color: white;
      border-color: transparent;
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

    .filter-chip.active:hover {
      transform: translateY(-2px);
      box-shadow: var(--chip-active-shadow), 0 6px 20px var(--glow-color);
    }

    .chip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .unread-dot {
      background: var(--accent-secondary);
      box-shadow: 0 0 6px var(--glow-color);
      animation: pulse-chip-dot 2s infinite;
    }

    @keyframes pulse-chip-dot {
      0%, 100% { box-shadow: 0 0 4px var(--glow-color); }
      50% { box-shadow: 0 0 10px var(--glow-color); }
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
      box-shadow: 0 0 0 3px var(--glow-color);
    }

    /* Fix calendar icon color in Chrome/Edge */
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

    /* Empty state */
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

    .neo-empty-bell {
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
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }

    /* Notifications list */
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
    }

    .neo-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
      border-color: var(--accent-primary);
    }

    .neo-card.unread {
      background: var(--unread-bg);
      border-color: var(--unread-border);
    }

    .neo-status-bar {
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 4px;
      background: var(--border-light);
      border-radius: 0 8px 8px 0;
      transition: all 0.3s;
    }

    .neo-status-bar.active {
      background: var(--accent-gradient);
      box-shadow: 0 0 12px var(--glow-color);
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
    }

    .neo-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .neo-message {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .neo-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .meta-relative {
      color: var(--accent-primary);
      font-weight: 700;
      margin-left: 0.25rem;
      text-transform: none;
      font-size: 0.68rem;
    }

    :host-context(.dark-theme) .meta-relative {
      color: var(--accent-secondary);
    }

    .neo-glow-dot {
      width: 10px;
      height: 10px;
      background-color: var(--accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 0 0 var(--glow-color);
      animation: pulse-dot 2s infinite;
      flex-shrink: 0;
    }

    .neo-glow-dot.hidden {
      display: none;
    }

    @keyframes pulse-dot {
      0% { box-shadow: 0 0 0 0 var(--glow-color); }
      70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
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
    }

    .neo-action-link:hover {
      background: var(--accent-primary);
      color: white;
      transform: translateX(6px);
      box-shadow: 0 4px 12px var(--glow-color);
    }

    .neo-action-link svg {
      transition: transform 0.3s;
    }

    .neo-action-link:hover svg {
      transform: translateX(4px);
    }

    /* Pagination */
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
      box-shadow: 0 6px 14px var(--glow-color);
      border-color: transparent;
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

    /* Responsive */
    @media (max-width: 768px) {
      .neo-notifications-container {
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
      .neo-mark-all-btn {
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
    }

    /* Animations */
    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .neo-card {
      animation: fadeSlideUp 0.4s ease-out backwards;
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
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  paginatedNotifications: Notification[] = [];

  searchKeyword = '';
  filterReadStatus = 'all';
  itemsPerPage = 6;
  currentPage = 0;
  totalPages = 0;
  totalItems = 0;

  /* Date filter state */
  dateFrom = '';
  dateTo = '';
  datePreset = 'all';
  showCustomDateRange = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });
  }

  /* ===== Status filter ===== */
  setStatusFilter(status: string): void {
    this.filterReadStatus = status;
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
    /* Don't apply filters on every keystroke — wait for Apply */
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
    let filtered = [...this.notifications];

    /* Text search */
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(kw) ||
        n.message?.toLowerCase().includes(kw)
      );
    }

    /* Read status */
    if (this.filterReadStatus === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (this.filterReadStatus === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    /* Date range */
    if (this.dateFrom) {
      const from = this.parseDateToMidnight(this.dateFrom, true);
      filtered = filtered.filter(n => new Date(n.createdAt) >= from);
    }
    if (this.dateTo) {
      const to = this.parseDateToMidnight(this.dateTo, false);
      filtered = filtered.filter(n => new Date(n.createdAt) <= to);
    }

    this.filteredNotifications = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }
    if (this.totalPages === 0) {
      this.currentPage = 0;
    }
    this.updatePaginated();
  }

  updatePaginated(): void {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedNotifications = this.filteredNotifications.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginated();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.updatePaginated();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginated();
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

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error(err)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error(err)
    });
  }

  /* ===== Utility methods ===== */
  clearSearch(): void {
    this.searchKeyword = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchKeyword = '';
    this.filterReadStatus = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    this.datePreset = 'all';
    this.showCustomDateRange = false;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchKeyword.trim() !== '' ||
           this.filterReadStatus !== 'all' ||
           this.datePreset !== 'all';
  }

  getDatePresetLabel(preset: string): string {
    switch (preset) {
      case 'today': return 'Aujourd\'hui';
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