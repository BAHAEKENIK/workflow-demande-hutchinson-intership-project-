import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserService, User, Page } from '../../core/services/user.service';
import { DepartmentService, Department } from '../../core/services/department.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="admin-users-container">
      <!-- Header with title and actions -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ 'USERS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'USERS.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary btn-new" (click)="editUser(null)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
            </svg>
            {{ 'USERS.NEW_BUTTON' | translate }}
          </button>
        </div>
      </div>

      <!-- Search and filter bar -->
      <div class="search-filter-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" [placeholder]="'USERS.SEARCH_PLACEHOLDER' | translate" [(ngModel)]="searchKeyword" (input)="applyFilters()" class="search-input">
        </div>
        <div class="filter-wrapper">
          <select [(ngModel)]="selectedRole" (change)="applyFilters()" class="role-filter">
            <option value="">{{ 'USERS.FILTER_ALL_ROLES' | translate }}</option>
            <option value="ADMIN">{{ 'USERS.ROLE_ADMIN' | translate }}</option>
            <option value="CHEF_DEPT">{{ 'USERS.ROLE_CHEF' | translate }}</option>
            <option value="EMPLOYEE">{{ 'USERS.ROLE_EMPLOYEE' | translate }}</option>
          </select>
        </div>
        <div class="filter-stats" *ngIf="totalElements > 0">
          <span>{{ pageUsers.length }} / {{ totalElements }} {{ 'USERS.USERS_COUNT' | translate }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>{{ 'USERS.TABLE.ID' | translate }}</th>
              <th>{{ 'USERS.TABLE.FULL_NAME' | translate }}</th>
              <th>{{ 'USERS.TABLE.EMAIL' | translate }}</th>
              <th>{{ 'USERS.TABLE.ROLE' | translate }}</th>
              <th>{{ 'USERS.TABLE.DEPARTMENT' | translate }}</th>
              <th class="actions-col">{{ 'USERS.TABLE.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of pageUsers">
              <td class="id-cell">#{{ u.id }}</td>
              <td class="name-cell">
                <span class="user-avatar">{{ getInitials(u) }}</span>
                {{ u.firstName }} {{ u.lastName }}
              </td>
              <td class="email-cell">{{ u.email }}</td>
              <td class="role-cell">
                <span class="role-badge" [class.role-admin]="u.role === 'ADMIN'" 
                                          [class.role-chef]="u.role === 'CHEF_DEPT'"
                                          [class.role-employee]="u.role === 'EMPLOYEE'">
                  {{ getRoleLabel(u.role) }}
                </span>
              </td>
              <td class="dept-cell">
                <span class="dept-tag">{{ u.departmentName || ('USERS.MODAL_NO_DEPARTMENT' | translate) }}</span>
              </td>
              <td class="actions-cell">
                <button class="btn-icon btn-view" (click)="viewUser(u)" title="{{ 'DEPARTMENTS.VIEW_TITLE' | translate }}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="btn-icon btn-edit" (click)="editUser(u)" title="{{ 'DEPARTMENTS.EDIT_TITLE' | translate }}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="pageUsers.length === 0">
              <td colspan="6" class="empty-row">{{ 'USERS.EMPTY' | translate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar" *ngIf="totalPages > 0">
        <button class="btn-pagination" (click)="prevPage()" [disabled]="currentPage === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ 'USERS.PAGINATION_PREV' | translate }}
        </button>
        <span class="page-info">{{ 'USERS.PAGINATION_PAGE' | translate: { current: currentPage+1, total: totalPages } }}</span>
        <button class="btn-pagination" (click)="nextPage()" [disabled]="currentPage + 1 >= totalPages">
          {{ 'USERS.PAGINATION_NEXT' | translate }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Edit/Create Modal -->
      <div class="modal-overlay" *ngIf="editingUser" (click)="cancelEdit()">
        <div class="modal-card glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ (editingUser.id ? 'USERS.MODAL_EDIT_TITLE' : 'USERS.MODAL_CREATE_TITLE') | translate }}</h2>
            <button class="btn-close" (click)="cancelEdit()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ 'USERS.MODAL_USERNAME' | translate }}</label>
                <input type="text" [(ngModel)]="editingUser.username" class="form-control" placeholder="username">
              </div>
              <div class="form-group">
                <label>{{ 'USERS.MODAL_FIRSTNAME' | translate }}</label>
                <input type="text" [(ngModel)]="editingUser.firstName" class="form-control" placeholder="Prénom">
              </div>
              <div class="form-group">
                <label>{{ 'USERS.MODAL_LASTNAME' | translate }}</label>
                <input type="text" [(ngModel)]="editingUser.lastName" class="form-control" placeholder="Nom">
              </div>
              <div class="form-group">
                <label>{{ 'USERS.MODAL_EMAIL' | translate }}</label>
                <input type="email" [(ngModel)]="editingUser.email" class="form-control" placeholder="prenom.nom@hutchinson.com">
              </div>
              <div class="form-group">
                <label>{{ 'USERS.MODAL_ROLE' | translate }}</label>
                <select [(ngModel)]="editingUser.role" class="form-control">
                  <option value="ADMIN">{{ 'USERS.ROLE_ADMIN' | translate }}</option>
                  <option value="CHEF_DEPT">{{ 'USERS.ROLE_CHEF' | translate }}</option>
                  <option value="EMPLOYEE">{{ 'USERS.ROLE_EMPLOYEE' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ 'USERS.MODAL_DEPARTMENT' | translate }}</label>
                <select [(ngModel)]="editingUser.departmentId" class="form-control">
                  <option [ngValue]="undefined">{{ 'USERS.MODAL_NO_DEPARTMENT' | translate }}</option>
                  <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
                </select>
              </div>
            </div>
            <div class="error-message" *ngIf="errorMsg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {{ errorMsg }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="cancelEdit()">{{ 'USERS.MODAL_CANCEL' | translate }}</button>
            <button class="btn-primary" (click)="saveUser()">{{ 'USERS.MODAL_SAVE' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- View Modal -->
      <div class="modal-overlay" *ngIf="viewingUser" (click)="closeViewModal()">
        <div class="modal-card glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ 'USERS.VIEW_TITLE' | translate }}</h2>
            <button class="btn-close" (click)="closeViewModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="view-detail-grid">
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_USERNAME' | translate }}</label>
                <p>{{ viewingUser.username }}</p>
              </div>
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_FIRSTNAME' | translate }}</label>
                <p>{{ viewingUser.firstName }}</p>
              </div>
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_LASTNAME' | translate }}</label>
                <p>{{ viewingUser.lastName }}</p>
              </div>
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_EMAIL' | translate }}</label>
                <p>{{ viewingUser.email }}</p>
              </div>
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_ROLE' | translate }}</label>
                <p><span class="role-badge" [class.role-admin]="viewingUser.role === 'ADMIN'" 
                                              [class.role-chef]="viewingUser.role === 'CHEF_DEPT'"
                                              [class.role-employee]="viewingUser.role === 'EMPLOYEE'">
                  {{ getRoleLabel(viewingUser.role) }}
                </span></p>
              </div>
              <div class="detail-item">
                <label>{{ 'USERS.MODAL_DEPARTMENT' | translate }}</label>
                <p>{{ viewingUser.departmentName || ('USERS.MODAL_NO_DEPARTMENT' | translate) }}</p>
              </div>
              <div class="detail-item full-width">
                <label>{{ 'USERS.MODAL_ID' | translate }}</label>
                <p class="mono">#{{ viewingUser.id }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" (click)="closeViewModal()">{{ 'USERS.MODAL_CLOSE' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX STYLES + DARK MODE ========== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Mode clair (défaut) */
    .admin-users-container {
      --bg-container: #f8fafc;
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --border-light: #e2e8f0;
      --card-bg: rgba(255, 255, 255, 0.75);
      --thead-bg: rgba(31, 46, 90, 0.04);
      --thead-border: rgba(31, 46, 90, 0.1);
      --table-border: rgba(203, 213, 225, 0.4);
      --hover-bg: rgba(31, 46, 90, 0.02);
      --avatar-bg: linear-gradient(135deg, #1F2E5A, #2c3f70);
      --role-admin: linear-gradient(135deg, #1F2E5A, #2c3f70);
      --role-chef: linear-gradient(135deg, #f59e0b, #d97706);
      --role-employee: linear-gradient(135deg, #6b7280, #4b5563);
      --dept-tag-bg: #eef2ff;
      --dept-tag-color: #1F2E5A;
      --btn-primary-bg: linear-gradient(105deg, #1F2E5A, #2a3f78);
      --btn-pagination-bg: white;
      --btn-pagination-border: #e2e8f0;
      --btn-pagination-color: #1F2E5A;
      --btn-pagination-hover-bg: #1F2E5A;
      --page-info-bg: rgba(31, 46, 90, 0.05);
      --modal-bg: white;
      --modal-border: #e2e8f0;
      --modal-header-bg: linear-gradient(135deg, #1F2E5A, #E21C2A);
      --form-control-bg: #fff;
      --form-control-border: #e2e8f0;
      --error-bg: #fef2f2;
      --error-border: #E21C2A;
      --error-color: #b91c2c;
      --detail-item-bg: #f8fafc;
      --detail-item-color: #1e293b;
      --btn-secondary-bg: #f1f5f9;
      --btn-secondary-color: #334155;
      --btn-secondary-hover-bg: #e2e8f0;
      --icon-stroke: #64748b;
      --filter-stats-bg: #eef2ff;
      --filter-stats-color: #1F2E5A;
    }

    /* Mode sombre */
    :host-context(.dark-theme) .admin-users-container {
      --bg-container: #0f172a;
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      --border-light: #334155;
      --card-bg: rgba(30, 41, 59, 0.75);
      --thead-bg: rgba(255, 255, 255, 0.04);
      --thead-border: rgba(255, 255, 255, 0.08);
      --table-border: rgba(255, 255, 255, 0.08);
      --hover-bg: rgba(255, 255, 255, 0.02);
      --avatar-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --role-admin: linear-gradient(135deg, #475569, #334155);
      --role-chef: linear-gradient(135deg, #d97706, #b45309);
      --role-employee: linear-gradient(135deg, #4b5563, #374151);
      --dept-tag-bg: #334155;
      --dept-tag-color: #e2e8f0;
      --btn-primary-bg: linear-gradient(105deg, #E21C2A, #b91c2c);
      --btn-pagination-bg: #1e293b;
      --btn-pagination-border: #475569;
      --btn-pagination-color: #e2e8f0;
      --btn-pagination-hover-bg: #E21C2A;
      --page-info-bg: rgba(255, 255, 255, 0.05);
      --modal-bg: #1e293b;
      --modal-border: #334155;
      --modal-header-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --form-control-bg: #0f172a;
      --form-control-border: #334155;
      --error-bg: #450a0a;
      --error-border: #E21C2A;
      --error-color: #f87171;
      --detail-item-bg: #0f172a;
      --detail-item-color: #f1f5f9;
      --btn-secondary-bg: #334155;
      --btn-secondary-color: #e2e8f0;
      --btn-secondary-hover-bg: #475569;
      --icon-stroke: #94a3b8;
      --filter-stats-bg: #1e293b;
      --filter-stats-color: #e2e8f0;
    }

    .admin-users-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-primary);
      animation: fadeInUp 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      background: var(--bg-container);
      padding: 2rem;
      border-radius: 32px;
      transition: background 0.3s, color 0.3s;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
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
    :host-context(.dark-theme) .page-title {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Search & filter bar */
    .search-filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.8rem;
      align-items: center;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      min-width: 200px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      stroke: var(--icon-stroke);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid var(--border-light);
      border-radius: 60px;
      font-size: 0.9rem;
      background: var(--form-control-bg);
      color: var(--text-primary);
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }
    :host-context(.dark-theme) .search-input:focus {
      border-color: #E21C2A;
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }

    .filter-wrapper {
      min-width: 180px;
    }

    .role-filter {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-light);
      border-radius: 60px;
      background: var(--form-control-bg);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .role-filter:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }

    .filter-stats {
      background: var(--filter-stats-bg);
      padding: 0.4rem 1rem;
      border-radius: 60px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--filter-stats-color);
      white-space: nowrap;
    }

    /* Primary button */
    .btn-primary {
      background: var(--btn-primary-bg);
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(31, 46, 90, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(226, 28, 42, 0.25);
    }

    /* Table wrapper */
    .table-wrapper {
      background: var(--card-bg);
      backdrop-filter: blur(8px);
      border-radius: 24px;
      padding: 0.1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
      overflow-x: auto;
      margin-bottom: 1.5rem;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      border-radius: 24px;
      overflow: hidden;
    }

    .users-table thead tr {
      background: var(--thead-bg);
      border-bottom: 1px solid var(--thead-border);
    }

    .users-table th {
      text-align: left;
      padding: 1rem 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .users-table td {
      padding: 1rem 1.2rem;
      border-bottom: 1px solid var(--table-border);
      vertical-align: middle;
      color: var(--text-primary);
    }

    .users-table tbody tr:hover {
      background: var(--hover-bg);
      transition: background 0.2s;
    }

    .id-cell {
      font-weight: 600;
      color: var(--text-muted);
      font-family: monospace;
    }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-weight: 600;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: var(--avatar-bg);
      color: white;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .email-cell {
      color: var(--text-secondary);
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .role-admin {
      background: var(--role-admin);
      color: white;
    }
    .role-chef {
      background: var(--role-chef);
      color: white;
    }
    .role-employee {
      background: var(--role-employee);
      color: white;
    }

    .dept-tag {
      background: var(--dept-tag-bg);
      color: var(--dept-tag-color);
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon svg {
      stroke: var(--icon-stroke);
      transition: stroke 0.2s;
    }

    .btn-view:hover {
      background: rgba(31, 46, 90, 0.1);
    }
    .btn-view:hover svg {
      stroke: #1F2E5A;
    }
    :host-context(.dark-theme) .btn-view:hover svg {
      stroke: #E21C2A;
    }

    .btn-edit:hover {
      background: rgba(245, 158, 11, 0.1);
    }
    .btn-edit:hover svg {
      stroke: #d97706;
    }

    .empty-row {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Pagination bar */
    .pagination-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 1rem;
      padding: 0.5rem;
    }

    .btn-pagination {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--btn-pagination-bg);
      border: 1px solid var(--btn-pagination-border);
      padding: 0.5rem 1.2rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--btn-pagination-color);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-pagination:hover:not(:disabled) {
      background: var(--btn-pagination-hover-bg);
      color: white;
      border-color: var(--btn-pagination-hover-bg);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(31, 46, 90, 0.2);
    }

    .btn-pagination:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 0.9rem;
      font-weight: 600;
      background: var(--page-info-bg);
      padding: 0.4rem 1rem;
      border-radius: 60px;
      color: var(--text-primary);
    }

    /* Modal commun */
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

    .modal-card {
      background: var(--modal-bg);
      border-radius: 32px;
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      border: 1px solid var(--modal-border);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .glass-card {
      background: var(--modal-bg);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--modal-border);
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      background: var(--modal-header-bg);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: color 0.2s;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 40px;
    }

    .btn-close:hover {
      color: #E21C2A;
      background: var(--btn-secondary-hover-bg);
    }

    .modal-body {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
      letter-spacing: 0.3px;
    }

    .form-control, textarea.form-control {
      padding: 0.7rem 1rem;
      border: 1px solid var(--form-control-border);
      border-radius: 14px;
      font-size: 0.9rem;
      transition: all 0.2s;
      background: var(--form-control-bg);
      color: var(--text-primary);
      font-family: inherit;
    }

    .form-control:focus, textarea.form-control:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }
    :host-context(.dark-theme) .form-control:focus,
    :host-context(.dark-theme) textarea.form-control:focus {
      border-color: #E21C2A;
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }

    select.form-control {
      cursor: pointer;
    }

    .error-message {
      margin-top: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--error-bg);
      border-left: 4px solid var(--error-border);
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--error-color);
      font-size: 0.85rem;
      font-weight: 500;
    }

    .view-detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.2rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .detail-item.full-width {
      grid-column: span 2;
    }

    .detail-item label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .detail-item p {
      font-size: 1rem;
      font-weight: 600;
      color: var(--detail-item-color);
      background: var(--detail-item-bg);
      padding: 0.5rem 0.8rem;
      border-radius: 12px;
      word-break: break-word;
    }

    .detail-item .mono {
      font-family: monospace;
    }

    .modal-footer {
      padding: 1.25rem 2rem;
      border-top: 1px solid var(--modal-border);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-secondary {
      background: var(--btn-secondary-bg);
      border: none;
      padding: 0.6rem 1.3rem;
      border-radius: 40px;
      font-weight: 600;
      color: var(--btn-secondary-color);
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: var(--btn-secondary-hover-bg);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .admin-users-container {
        padding: 1rem;
      }
      .page-title {
        font-size: 1.5rem;
      }
      .form-grid, .view-detail-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .detail-item.full-width {
        grid-column: span 1;
      }
      .modal-body {
        padding: 1.5rem;
      }
      .users-table th, .users-table td {
        padding: 0.8rem;
      }
      .actions-cell {
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .search-filter-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-stats {
        text-align: center;
      }
      .pagination-bar {
        gap: 1rem;
        flex-wrap: wrap;
      }
      .btn-pagination {
        padding: 0.4rem 1rem;
      }
      .header-actions {
        width: 100%;
        justify-content: stretch;
      }
      .btn-primary {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  // Données paginées
  pageUsers: User[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;

  // Filtres
  searchKeyword = '';
  selectedRole = '';

  // Autres données
  departments: Department[] = [];
  editingUser: Partial<User> | null = null;
  viewingUser: User | null = null;
  errorMsg = '';

  constructor(
    private userService: UserService,
    private deptService: DepartmentService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsersPage();
    this.deptService.getDepartments().subscribe(d => this.departments = d);
  }

  loadUsersPage(): void {
    this.userService.getUsersPaginated(this.currentPage, this.pageSize, this.searchKeyword, this.selectedRole).subscribe({
      next: (page: Page<User>) => {
        this.pageUsers = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
      },
      error: () => this.errorMsg = 'Erreur chargement utilisateurs'
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsersPage();
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadUsersPage();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsersPage();
    }
  }

  viewUser(user: User): void {
    this.viewingUser = user;
  }

  closeViewModal(): void {
    this.viewingUser = null;
  }

  editUser(u: User | null): void {
    this.errorMsg = '';
    this.editingUser = u
      ? { ...u }
      : {
          username: '',
          firstName: '',
          lastName: '',
          email: '',
          role: 'CHEF_DEPT',
          departmentId: undefined
        };
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.errorMsg = '';
  }

  saveUser(): void {
    if (!this.editingUser) return;
    this.errorMsg = '';

    if (!this.editingUser.username?.trim()) {
      this.errorMsg = "Le nom d'utilisateur est obligatoire.";
      return;
    }

    if (this.editingUser.id) {
      this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
        next: () => {
          this.loadUsersPage();
          this.cancelEdit();
        },
        error: e => this.errorMsg = e.error?.message || 'Erreur lors de la mise à jour'
      });
    } else {
      this.userService.createUser(this.editingUser).subscribe({
        next: () => {
          this.loadUsersPage();
          this.cancelEdit();
        },
        error: e => this.errorMsg = e.error?.message || 'Erreur lors de la création'
      });
    }
  }

  getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return this.translate.instant('USERS.ROLE_ADMIN');
      case 'CHEF_DEPT': return this.translate.instant('USERS.ROLE_CHEF');
      case 'EMPLOYEE': return this.translate.instant('USERS.ROLE_EMPLOYEE');
      default: return role;
    }
  }
}