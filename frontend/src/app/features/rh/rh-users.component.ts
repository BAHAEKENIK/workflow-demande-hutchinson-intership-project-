import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserService, User, Page } from '../../core/services/user.service';

@Component({
  selector: 'app-rh-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="rh-users-container" [class.dark-theme]="isDarkMode">
      <!-- Animated background gradient -->
      <div class="animated-bg"></div>

      <!-- Header avec effet glass et animation -->
      <div class="page-header glass-card">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 class="page-title">{{ 'RH_USERS.TITLE' | translate }}</h1>
              <p class="page-subtitle">{{ 'RH_USERS.SUBTITLE' | translate }}</p>
            </div>
          </div>
          <div class="stats-badge" *ngIf="totalElements > 0">
            <span class="stat-number">{{ totalElements }}</span>
            <span class="stat-label">{{ 'RH_USERS.TOTAL_USERS' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Barre de recherche et filtre avec animations -->
      <div class="search-filter-section">
        <div class="search-wrapper glass-card">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            [placeholder]="'USERS.SEARCH_PLACEHOLDER' | translate"
            [(ngModel)]="searchKeyword"
            (input)="applyFilters()"
            class="search-input"
          >
          <button class="clear-search" *ngIf="searchKeyword" (click)="searchKeyword='';applyFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="filter-wrapper glass-card">
          <select [(ngModel)]="selectedRole" (change)="applyFilters()" class="role-filter">
            <option value="">{{ 'USERS.FILTER_ALL_ROLES' | translate }}</option>
            <option value="ADMIN">{{ 'USERS.ROLE_ADMIN' | translate }}</option>
            <option value="CHEF_DEPT">{{ 'USERS.ROLE_CHEF' | translate }}</option>
            <option value="EMPLOYEE">{{ 'USERS.ROLE_EMPLOYEE' | translate }}</option>
          </select>
        </div>
      </div>

      <!-- Tableau utilisateurs avec effet de verre -->
      <div class="table-wrapper glass-card">
        <div class="table-scroll">
          <table class="users-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <div class="checkbox-custom">
                    <input type="checkbox" [checked]="isAllSelected()" (change)="toggleAll()" id="selectAll">
                    <label for="selectAll"></label>
                  </div>
                </th>
                <th class="sortable" (click)="sortBy('id')">
                  ID
                  <span class="sort-icon" *ngIf="sortField === 'id'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="sortable" (click)="sortBy('firstName')">
                  {{ 'USERS.TABLE.FULL_NAME' | translate }}
                  <span class="sort-icon" *ngIf="sortField === 'firstName'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="sortable" (click)="sortBy('email')">
                  {{ 'USERS.TABLE.EMAIL' | translate }}
                  <span class="sort-icon" *ngIf="sortField === 'email'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th>{{ 'USERS.TABLE.ROLE' | translate }}</th>
                <th>{{ 'USERS.TABLE.DEPARTMENT' | translate }}</th>
                <th class="actions-col">{{ 'USERS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of pageUsers; let i = index" [class.row-odd]="i % 2 === 1">
                <td class="checkbox-col">
                  <div class="checkbox-custom">
                    <input type="checkbox" [checked]="isSelected(u.id)" (change)="toggleSelection(u.id)" [id]="'chk'+u.id">
                    <label [for]="'chk'+u.id"></label>
                  </div>
                </td>
                <td class="id-cell">#{{ u.id }}</td>
                <td class="name-cell">
                  <div class="user-avatar" [style.background]="getAvatarColor(u)">
                    {{ getInitials(u) }}
                  </div>
                  <div class="user-name-info">
                    <span class="full-name">{{ u.firstName }} {{ u.lastName }}</span>
                    <span class="user-username">{{ u.username }}</span>
                  </div>
                </td>
                <td class="email-cell">
                  <a href="mailto:{{ u.email }}" class="email-link">{{ u.email }}</a>
                </td>
                <td>
                  <span class="role-badge"
                        [class.role-admin]="u.role === 'ADMIN'"
                        [class.role-chef]="u.role === 'CHEF_DEPT'"
                        [class.role-employee]="u.role === 'EMPLOYEE'">
                    <span class="role-dot"></span>
                    {{ getRoleLabel(u.role) }}
                  </span>
                </td>
                <td>
                  <span class="dept-badge" *ngIf="u.departmentName; else noDept">
                    {{ u.departmentName }}
                  </span>
                  <ng-template #noDept>
                    <span class="dept-empty">—</span>
                  </ng-template>
                </td>
                <td class="actions-cell">
                  <button class="btn-delete" (click)="openDeleteModal(u.id, u.firstName + ' ' + u.lastName)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
                    </svg>
                    <span>{{ 'USERS.DELETE_REQUEST' | translate }}</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="loading" class="loading-row">
                <td colspan="7">
                  <div class="spinner-container">
                    <div class="spinner"></div>
                    <span>{{ 'COMMON.LOADING' | translate }}</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading && pageUsers.length === 0">
                <td colspan="7" class="empty-row">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <p>{{ 'USERS.EMPTY' | translate }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar glass-card" *ngIf="totalPages > 0">
        <div class="pagination-info-left">
          <span>{{ 'PAGINATION.SHOWING' | translate }} {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} {{ 'PAGINATION.OF' | translate }} {{ totalElements }} {{ 'USERS.USERS_COUNT' | translate }}</span>
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" (click)="firstPage()" [disabled]="currentPage === 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 18L12 12L18 6M12 18L6 12L12 6"/>
            </svg>
          </button>
          <button class="pagination-btn" (click)="prevPage()" [disabled]="currentPage === 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span class="pagination-info">{{ 'PAGINATION.PAGE' | translate }} {{ currentPage+1 }} / {{ totalPages }}</span>
          <button class="pagination-btn" (click)="nextPage()" [disabled]="currentPage+1 >= totalPages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <button class="pagination-btn" (click)="lastPage()" [disabled]="currentPage+1 >= totalPages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6L12 12L6 18M12 6L18 12L12 18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Barre d'action groupée -->
      <div class="bulk-bar glass-card" *ngIf="selectedUserIds.size > 0">
        <div class="bulk-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 12v8H4v-8M12 2v12m-3-3l3 3 3-3"/>
          </svg>
          <span>{{ 'RH_USERS.BULK_SELECTED' | translate: { count: selectedUserIds.size } }}</span>
        </div>
        <div class="bulk-actions">
          <button class="btn-bulk" (click)="openBulkDeleteModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
            </svg>
            {{ 'RH_USERS.BULK_DELETE' | translate }}
          </button>
          <button class="btn-clear-selection" (click)="clearSelection()">
            {{ 'RH_USERS.CLEAR_SELECTION' | translate }}
          </button>
        </div>
      </div>

      <!-- ====== MODAL SUPPRESSION SIMPLE ====== -->
      <div class="modal-overlay" *ngIf="deleteModalOpen" (click)="closeDeleteModal()">
        <div class="modal-card glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-icon modal-icon-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2>{{ 'RH_USERS.DELETE_MODAL_TITLE' | translate }}</h2>
            <button class="modal-close" (click)="closeDeleteModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-message" [innerHTML]="'RH_USERS.DELETE_MODAL_MESSAGE' | translate: { name: deleteUserName }"></p>
            <div class="form-group">
              <label>{{ 'RH_USERS.DELETE_COMMENT_LABEL' | translate }} <span class="required">*</span></label>
              <textarea
                [(ngModel)]="deleteComment"
                [placeholder]="'RH_USERS.DELETE_COMMENT_PLACEHOLDER' | translate"
                rows="4"
                class="form-control"
                [class.error-border]="deleteError"
              ></textarea>
              <div class="error" *ngIf="deleteError">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
                {{ deleteError }}
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeDeleteModal()">{{ 'COMMON.CANCEL' | translate }}</button>
            <button class="btn-danger" (click)="confirmDelete()" [disabled]="deleting">
              <span *ngIf="!deleting">{{ 'RH_USERS.CONFIRM_DELETE' | translate }}</span>
              <span *ngIf="deleting" class="btn-spinner"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- ====== MODAL SUPPRESSION GROUPÉE ====== -->
      <div class="modal-overlay" *ngIf="bulkModalOpen" (click)="closeBulkDeleteModal()">
        <div class="modal-card glass-card modal-large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-icon modal-icon-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 7l-1 14H6L5 7M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M3 7h18"/>
              </svg>
            </div>
            <h2>{{ 'RH_USERS.BULK_DELETE_MODAL_TITLE' | translate }}</h2>
            <button class="modal-close" (click)="closeBulkDeleteModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="bulk-preview">
              <p class="modal-message" [innerHTML]="'RH_USERS.BULK_DELETE_MESSAGE' | translate: { count: selectedUserIds.size }"></p>
              <div class="selected-users-list">
                <div class="selected-user-item" *ngFor="let u of selectedUsersPreview">
                  <div class="user-avatar-small" [style.background]="getAvatarColor(u)">{{ getInitials(u) }}</div>
                  <span class="selected-user-name">{{ u.firstName }} {{ u.lastName }}</span>
                  <span class="user-email-small">{{ u.email }}</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>{{ 'RH_USERS.DELETE_COMMENT_LABEL' | translate }} <span class="required">*</span></label>
              <textarea
                [(ngModel)]="bulkComment"
                [placeholder]="'RH_USERS.BULK_COMMENT_PLACEHOLDER' | translate"
                rows="4"
                class="form-control"
                [class.error-border]="bulkError"
              ></textarea>
              <div class="error" *ngIf="bulkError">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
                {{ bulkError }}
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeBulkDeleteModal()">{{ 'COMMON.CANCEL' | translate }}</button>
            <button class="btn-danger" (click)="confirmBulkDelete()" [disabled]="bulkDeleting">
              <span *ngIf="!bulkDeleting">{{ 'RH_USERS.CONFIRM_BULK_DELETE' | translate }}</span>
              <span *ngIf="bulkDeleting" class="btn-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       ULTRA PRO MAX STYLES - RH USERS COMPONENT
       Glassmorphism + Dark/Light Themes + Animations
       Well-structured, production-ready
    ============================================ */

    /* ---------- CSS CUSTOM PROPERTIES ---------- */
    :host {
      display: block;
      width: 100%;
    }

    .rh-users-container {
      position: relative;
      padding: 2rem;
      min-height: 100vh;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

      /* Light theme (default) */
      --bg-gradient: linear-gradient(145deg, #f8fafc 0%, #eef2ff 100%);
      --glass-bg: rgba(255, 255, 255, 0.75);
      --glass-border: rgba(255, 255, 255, 0.4);
      --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --border-light: rgba(203, 213, 225, 0.5);
      --card-bg: rgba(255, 255, 255, 0.85);
      --hover-bg: rgba(102, 126, 234, 0.05);
      --input-bg: rgba(255, 255, 255, 0.9);
      --input-border: #e2e8f0;
      --input-focus: #667eea;
      --table-header-bg: rgba(102, 126, 234, 0.08);
      --table-row-hover: rgba(102, 126, 234, 0.04);
      --badge-admin: linear-gradient(135deg, #1F2E5A, #2c3f70);
      --badge-chef: linear-gradient(135deg, #f59e0b, #d97706);
      --badge-employee: linear-gradient(135deg, #6b7280, #4b5563);
      --dept-bg: #eef2ff;
      --dept-color: #1F2E5A;
      --danger: #E21C2A;
      --danger-hover: #b91c2c;
      --danger-soft: rgba(226, 28, 42, 0.1);
      --danger-glow: rgba(226, 28, 42, 0.25);
      --success: #10b981;
      --modal-bg: rgba(255, 255, 255, 0.98);
      --modal-border: #e2e8f0;
      --scrollbar-track: #f1f5f9;
      --scrollbar-thumb: #cbd5e1;
      --animated-bg-1: rgba(102, 126, 234, 0.08);
      --animated-bg-2: rgba(245, 87, 108, 0.06);
      --row-odd-bg: rgba(0, 0, 0, 0.01);
    }

    /* ---------- DARK THEME OVERRIDES ---------- */
    .rh-users-container.dark-theme {
      --bg-gradient: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
      --glass-bg: rgba(15, 23, 42, 0.75);
      --glass-border: rgba(255, 255, 255, 0.1);
      --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border-light: rgba(51, 65, 85, 0.5);
      --card-bg: rgba(30, 41, 59, 0.85);
      --hover-bg: rgba(102, 126, 234, 0.1);
      --input-bg: rgba(30, 41, 59, 0.9);
      --input-border: #334155;
      --input-focus: #818cf8;
      --table-header-bg: rgba(102, 126, 234, 0.12);
      --table-row-hover: rgba(102, 126, 234, 0.06);
      --badge-admin: linear-gradient(135deg, #475569, #334155);
      --badge-chef: linear-gradient(135deg, #d97706, #b45309);
      --badge-employee: linear-gradient(135deg, #4b5563, #374151);
      --dept-bg: #1e293b;
      --dept-color: #cbd5e1;
      --danger: #f87171;
      --danger-hover: #ef4444;
      --danger-soft: rgba(248, 113, 113, 0.15);
      --danger-glow: rgba(248, 113, 113, 0.3);
      --modal-bg: rgba(30, 41, 59, 0.98);
      --modal-border: #334155;
      --scrollbar-track: #1e293b;
      --scrollbar-thumb: #475569;
      --animated-bg-1: rgba(102, 126, 234, 0.06);
      --animated-bg-2: rgba(245, 87, 108, 0.04);
      --row-odd-bg: rgba(255, 255, 255, 0.01);
    }

    /* ---------- ANIMATED BACKGROUND ---------- */
    .animated-bg {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      background:
        radial-gradient(circle at 20% 50%, var(--animated-bg-1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, var(--animated-bg-2) 0%, transparent 50%),
        radial-gradient(circle at 60% 20%, rgba(79, 172, 254, 0.04) 0%, transparent 40%);
      animation: bgPulse 8s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes bgPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
    }

    /* ---------- GLASS CARD BASE ---------- */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 32px;
      box-shadow: var(--glass-shadow);
      transition: all 0.3s ease;
    }

    .glass-card:hover {
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.13);
    }

    .dark-theme .glass-card:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    }

    /* ---------- PAGE HEADER ---------- */
    .page-header {
      margin-bottom: 2rem;
      padding: 1.5rem 2rem;
      animation: slideDown 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      animation: iconFloat 3s ease-in-out infinite;
    }

    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--text-primary), #667eea);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.02em;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .stats-badge {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1));
      border-radius: 60px;
      padding: 0.5rem 1.2rem;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      border: 1px solid rgba(102, 126, 234, 0.15);
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ---------- SEARCH & FILTER ---------- */
    .search-filter-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      animation: slideDown 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.1s both;
    }

    .search-wrapper {
      flex: 2;
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      min-width: 200px;
      transition: all 0.3s;
    }

    .search-wrapper:focus-within {
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-secondary);
      pointer-events: none;
      transition: color 0.2s;
    }

    .search-wrapper:focus-within .search-icon {
      color: var(--input-focus);
    }

    .search-input {
      width: 100%;
      padding: 0.85rem 2.5rem 0.85rem 2.5rem;
      background: transparent;
      border: none;
      font-size: 0.95rem;
      color: var(--text-primary);
      outline: none;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .clear-search {
      position: absolute;
      right: 1rem;
      background: var(--danger-soft);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--danger);
      transition: all 0.2s;
    }

    .clear-search:hover {
      background: var(--danger);
      color: white;
      transform: rotate(90deg);
    }

    .filter-wrapper {
      min-width: 200px;
      padding: 0.2rem 0.5rem;
      transition: all 0.3s;
    }

    .filter-wrapper:focus-within {
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    .role-filter {
      width: 100%;
      padding: 0.7rem 1rem;
      background: transparent;
      border: none;
      font-size: 0.9rem;
      color: var(--text-primary);
      cursor: pointer;
      outline: none;
      font-family: inherit;
    }

    .role-filter option {
      background: var(--modal-bg);
      color: var(--text-primary);
    }

    /* ---------- TABLE ---------- */
    .table-wrapper {
      overflow: hidden;
      border-radius: 32px;
      margin-bottom: 1.5rem;
      animation: slideDown 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.2s both;
    }

    .table-scroll {
      overflow-x: auto;
      max-height: 70vh;
      scrollbar-width: thin;
    }

    .users-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.9rem;
    }

    .users-table thead tr {
      background: var(--table-header-bg);
    }

    .users-table th {
      padding: 1rem 1.2rem;
      text-align: left;
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 2;
      background: var(--table-header-bg);
    }

    .sortable {
      cursor: pointer;
      transition: color 0.2s;
      user-select: none;
    }

    .sortable:hover {
      color: var(--input-focus);
    }

    .sort-icon {
      margin-left: 0.25rem;
      font-size: 0.7rem;
    }

    .users-table td {
      padding: 1rem 1.2rem;
      border-bottom: 1px solid var(--border-light);
      color: var(--text-primary);
      transition: background 0.2s;
    }

    .users-table tbody tr {
      transition: all 0.2s ease;
    }

    .users-table tbody tr:hover td {
      background: var(--table-row-hover);
    }

    .row-odd td {
      background: var(--row-odd-bg);
    }

    .users-table tbody tr:hover td {
      background: var(--table-row-hover);
    }

    /* ---------- CHECKBOX ---------- */
    .checkbox-col {
      width: 40px;
      text-align: center;
    }

    .checkbox-custom {
      display: inline-block;
      position: relative;
    }

    .checkbox-custom input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkbox-custom label {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      background: var(--input-bg);
    }

    .checkbox-custom label:hover {
      border-color: var(--input-focus);
    }

    .checkbox-custom input:checked + label {
      background: #667eea;
      border-color: #667eea;
    }

    .dark-theme .checkbox-custom input:checked + label {
      background: #818cf8;
      border-color: #818cf8;
    }

    .checkbox-custom input:checked + label::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* ---------- AVATAR & NAME ---------- */
    .name-cell {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .users-table tbody tr:hover .user-avatar {
      transform: scale(1.08);
    }

    .user-name-info {
      display: flex;
      flex-direction: column;
    }

    .full-name {
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .user-username {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    /* ---------- EMAIL ---------- */
    .email-cell {
      max-width: 220px;
    }

    .email-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      max-width: 100%;
    }

    .email-link:hover {
      color: var(--input-focus);
      text-decoration: underline;
    }

    /* ---------- ID CELL ---------- */
    .id-cell {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-variant-numeric: tabular-nums;
    }

    /* ---------- ROLE BADGES ---------- */
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      border-radius: 60px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: white;
      white-space: nowrap;
    }

    .role-dot {
      width: 6px;
      height: 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.7);
    }

    .role-admin {
      background: var(--badge-admin);
      box-shadow: 0 2px 8px rgba(31, 46, 90, 0.3);
    }

    .role-chef {
      background: var(--badge-chef);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }

    .role-employee {
      background: var(--badge-employee);
      box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
    }

    /* ---------- DEPARTMENT ---------- */
    .dept-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--dept-bg);
      color: var(--dept-color);
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .dept-empty {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    /* ---------- DELETE BUTTON ---------- */
    .actions-cell {
      white-space: nowrap;
    }

    .btn-delete {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--danger-soft);
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 40px;
      color: var(--danger);
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.25s;
      font-family: inherit;
    }

    .btn-delete:hover {
      background: var(--danger);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px var(--danger-glow);
    }

    .btn-delete:active {
      transform: translateY(0);
    }

    .btn-delete svg {
      stroke: currentColor;
    }

    /* ---------- PAGINATION ---------- */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
      animation: slideDown 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.3s both;
    }

    .pagination-info-left {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .pagination-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--border-light);
      width: 36px;
      height: 36px;
      border-radius: 40px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #667eea;
      border-color: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .dark-theme .pagination-btn:hover:not(:disabled) {
      background: #818cf8;
      border-color: #818cf8;
    }

    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pagination-info {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0 0.5rem;
    }

    /* ---------- BULK BAR ---------- */
    .bulk-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 1.5rem;
      margin-top: 1rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.05));
      border-left: 4px solid #667eea;
      animation: slideInUp 0.4s ease;
    }

    .dark-theme .bulk-bar {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08));
    }

    .bulk-info {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .bulk-info svg {
      color: #667eea;
    }

    .bulk-actions {
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
    }

    .btn-bulk {
      background: linear-gradient(135deg, #dc2626, #b91c2c);
      border: none;
      padding: 0.5rem 1.2rem;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: inherit;
    }

    .btn-bulk:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(220, 38, 38, 0.3);
    }

    .btn-clear-selection {
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.5rem 1rem;
      border-radius: 40px;
      color: var(--text-secondary);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      font-size: 0.8rem;
    }

    .btn-clear-selection:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }

    /* ============================================
       MODALS - ULTRA PRO MAX
    ============================================ */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1200;
      animation: fadeIn 0.25s ease;
      padding: 1rem;
    }

    .modal-card {
      width: 100%;
      max-width: 520px;
      border-radius: 40px;
      overflow: hidden;
      animation: scaleIn 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      background: var(--modal-bg);
      border: 1px solid var(--modal-border);
    }

    .modal-large {
      max-width: 660px;
    }

    /* ---------- MODAL HEADER ---------- */
    .modal-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.8rem;
      border-bottom: 1px solid var(--modal-border);
      background: var(--hover-bg);
    }

    .modal-header-icon {
      width: 48px;
      height: 48px;
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon-danger {
      background: var(--danger-soft);
      color: var(--danger);
      box-shadow: 0 4px 12px var(--danger-glow);
      animation: iconPulse 2s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { box-shadow: 0 4px 12px var(--danger-glow); }
      50% { box-shadow: 0 4px 20px var(--danger-glow); }
    }

    .modal-header h2 {
      flex: 1;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .modal-close {
      background: var(--hover-bg);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 36px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-close:hover {
      background: var(--danger-soft);
      color: var(--danger);
      transform: rotate(90deg);
    }

    /* ---------- MODAL BODY ---------- */
    .modal-body {
      padding: 1.8rem;
    }

    .modal-message {
      color: var(--text-primary);
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }

    /* Style for the <strong> rendered via [innerHTML] */
    .modal-message ::ng-deep strong {
      color: var(--danger);
      font-weight: 700;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1.2rem;
      width: 100%;
    }

    .form-group label {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .required {
      color: var(--danger);
      font-weight: 700;
    }

    .form-control {
      width: 100%;
      min-height: 120px;
      padding: 1rem 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 20px;
      font-size: 0.95rem;
      color: var(--text-primary);
      font-family: inherit;
      resize: none;
      transition: all 0.2s;
      outline: none;
      box-sizing: border-box;
      line-height: 1.6;
      text-align: left;
    }

    .form-control::placeholder {
      color: #94a3b8;
      padding-top: 2px;
    }

    .form-control:focus {
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .error-border {
      border-color: var(--danger) !important;
      box-shadow: 0 0 0 3px var(--danger-soft) !important;
    }

    .error {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--danger);
      font-size: 0.75rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }

    /* ---------- BULK PREVIEW ---------- */
    .bulk-preview {
      margin-bottom: 0.5rem;
    }

    .selected-users-list {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 1rem;
      padding: 0.5rem;
      background: var(--hover-bg);
      border-radius: 20px;
      border: 1px solid var(--border-light);
    }

    .selected-user-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.5rem 0.5rem;
      border-bottom: 1px solid var(--border-light);
      transition: background 0.15s;
    }

    .selected-user-item:last-child {
      border-bottom: none;
    }

    .selected-user-item:hover {
      background: var(--table-row-hover);
      border-radius: 12px;
    }

    .selected-user-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .user-avatar-small {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-email-small {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-left: auto;
      white-space: nowrap;
    }

    /* ---------- MODAL ACTIONS ---------- */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.2rem 1.8rem;
      border-top: 1px solid var(--modal-border);
      background: var(--hover-bg);
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border-light);
      padding: 0.6rem 1.2rem;
      border-radius: 40px;
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      font-size: 0.9rem;
    }

    .btn-secondary:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
      border-color: var(--text-secondary);
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--danger), var(--danger-hover));
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 40px;
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: inherit;
      font-size: 0.9rem;
    }

    .btn-danger:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px var(--danger-glow);
      filter: brightness(1.05);
    }

    .btn-danger:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.6s linear infinite;
    }

    /* ---------- LOADING & EMPTY STATES ---------- */
    .loading-row td {
      text-align: center;
      padding: 3rem;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-light);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .empty-row {
      text-align: center;
      padding: 3rem !important;
      color: var(--text-muted);
    }

    .empty-row svg {
      margin-bottom: 1rem;
      stroke: var(--text-muted);
      opacity: 0.5;
    }

    .empty-row p {
      font-size: 0.95rem;
    }

    /* ============================================
       KEYFRAME ANIMATIONS
    ============================================ */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* ============================================
       SCROLLBAR
    ============================================ */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #667eea;
    }

    /* ============================================
       RESPONSIVE
    ============================================ */
    @media (max-width: 768px) {
      .rh-users-container {
        padding: 1rem;
      }

      .page-header {
        padding: 1rem;
      }

      .title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .page-title {
        font-size: 1.4rem;
      }

      .search-filter-section {
        flex-direction: column;
      }

      .stats-badge {
        width: 100%;
        justify-content: center;
      }

      .bulk-bar {
        flex-direction: column;
        text-align: center;
        gap: 0.8rem;
      }

      .bulk-actions {
        width: 100%;
        justify-content: center;
      }

      .pagination-bar {
        flex-direction: column;
      }

      .pagination-controls {
        order: -1;
      }

      .modal-card {
        width: 95%;
        margin: 0.5rem;
        border-radius: 28px;
      }

      .modal-header {
        padding: 1rem 1.2rem;
      }

      .modal-body {
        padding: 1.2rem;
      }

      .modal-actions {
        padding: 1rem 1.2rem;
        flex-direction: column;
      }

      .btn-secondary,
      .btn-danger {
        width: 100%;
        justify-content: center;
      }

      .users-table th,
      .users-table td {
        padding: 0.75rem 0.8rem;
      }

      .btn-delete span {
        display: none;
      }

      .btn-delete {
        padding: 0.4rem;
        border-radius: 50%;
      }

      .icon-wrapper {
        width: 44px;
        height: 44px;
      }

      .stat-number {
        font-size: 1.4rem;
      }

      .modal-header h2 {
        font-size: 1.1rem;
      }
    }

    @media (max-width: 480px) {
      .rh-users-container {
        padding: 0.5rem;
      }

      .page-title {
        font-size: 1.2rem;
      }

      .glass-card {
        border-radius: 24px;
      }

      .table-wrapper {
        border-radius: 24px;
      }

      .modal-card {
        border-radius: 24px;
      }
    }
  `]
})
export class RhUsersComponent implements OnInit, OnDestroy {
  pageUsers: User[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  searchKeyword = '';
  selectedRole = '';
  loading = false;
  isDarkMode = false;

  // Sorting
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedUserIds: Set<number> = new Set();
  deleteModalOpen = false;
  deleteUserId: number | null = null;
  deleteUserName = '';
  deleteComment = '';
  deleteError = '';
  deleting = false;

  bulkModalOpen = false;
  bulkComment = '';
  bulkError = '';
  bulkDeleting = false;
  selectedUsersPreview: User[] = [];

  Math = Math;

  private themeObserver: MutationObserver | null = null;

  constructor(
    private userService: UserService,
    private translate: TranslateService
  ) {
    this.isDarkMode = document.documentElement.classList.contains('dark-theme');

    this.themeObserver = new MutationObserver(() => {
      this.isDarkMode = document.documentElement.classList.contains('dark-theme');
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.userService
      .getUsersPaginated(this.currentPage, this.pageSize, this.searchKeyword, this.selectedRole)
      .subscribe({
        next: (page: Page<User>) => {
          this.pageUsers = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.selectedUserIds.clear();
    this.loadUsers();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortUsers();
  }

  private sortUsers(): void {
    this.pageUsers.sort((a, b) => {
      let valA: any, valB: any;
      switch (this.sortField) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'firstName':
          valA = `${a.firstName} ${a.lastName}`;
          valB = `${b.firstName} ${b.lastName}`;
          break;
        case 'email':
          valA = a.email;
          valB = b.email;
          break;
        default:
          return 0;
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  firstPage(): void {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadUsers();
    }
  }

  lastPage(): void {
    if (this.currentPage + 1 !== this.totalPages) {
      this.currentPage = this.totalPages - 1;
      this.loadUsers();
    }
  }

  toggleSelection(id: number): void {
    if (this.selectedUserIds.has(id)) {
      this.selectedUserIds.delete(id);
    } else {
      this.selectedUserIds.add(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedUserIds.has(id);
  }

  isAllSelected(): boolean {
    return (
      this.pageUsers.length > 0 &&
      this.pageUsers.every((u) => this.selectedUserIds.has(u.id))
    );
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.pageUsers.forEach((u) => this.selectedUserIds.delete(u.id));
    } else {
      this.pageUsers.forEach((u) => this.selectedUserIds.add(u.id));
    }
  }

  clearSelection(): void {
    this.selectedUserIds.clear();
  }

  /* ---------- SINGLE DELETE ---------- */
  openDeleteModal(id: number, name: string): void {
    this.deleteUserId = id;
    this.deleteUserName = name;
    this.deleteComment = '';
    this.deleteError = '';
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.deleteUserId = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.deleteComment.trim()) {
      this.deleteError = this.translate.instant('RH_USERS.COMMENT_REQUIRED');
      return;
    }
    this.deleting = true;
    this.userService.requestDeleteUser(this.deleteUserId!, this.deleteComment).subscribe({
      next: () => {
        this.deleting = false;
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError =
          err.error?.message || this.translate.instant('RH_USERS.DELETE_REQUEST_ERROR');
      }
    });
  }

  /* ---------- BULK DELETE ---------- */
  openBulkDeleteModal(): void {
    if (this.selectedUserIds.size === 0) return;
    this.selectedUsersPreview = this.pageUsers.filter((u) =>
      this.selectedUserIds.has(u.id)
    );
    this.bulkComment = '';
    this.bulkError = '';
    this.bulkModalOpen = true;
  }

  closeBulkDeleteModal(): void {
    this.bulkModalOpen = false;
    this.selectedUsersPreview = [];
    this.bulkError = '';
  }

  confirmBulkDelete(): void {
    if (!this.bulkComment.trim()) {
      this.bulkError = this.translate.instant('RH_USERS.COMMENT_REQUIRED');
      return;
    }
    this.bulkDeleting = true;
    this.userService
      .bulkDeleteUsers(Array.from(this.selectedUserIds), this.bulkComment)
      .subscribe({
        next: () => {
          this.bulkDeleting = false;
          this.closeBulkDeleteModal();
          this.selectedUserIds.clear();
          this.loadUsers();
        },
        error: (err) => {
          this.bulkDeleting = false;
          this.bulkError =
            err.error?.message || this.translate.instant('RH_USERS.BULK_DELETE_ERROR');
        }
      });
  }

  /* ---------- HELPERS ---------- */
  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return this.translate.instant('USERS.ROLE_ADMIN');
      case 'CHEF_DEPT':
        return this.translate.instant('USERS.ROLE_CHEF');
      case 'EMPLOYEE':
        return this.translate.instant('USERS.ROLE_EMPLOYEE');
      default:
        return role;
    }
  }

  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  getAvatarColor(user: User): string {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      'linear-gradient(135deg, #89f7fe, #66a6ff)'
    ];
    return colors[user.id % colors.length];
  }
}