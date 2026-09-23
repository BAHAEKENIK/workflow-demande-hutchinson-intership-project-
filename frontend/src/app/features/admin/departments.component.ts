import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DepartmentService, Department } from '../../core/services/department.service';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="admin-departments">
      <div class="page-header">
        <div>
          <h2>{{ 'DEPARTMENTS.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'DEPARTMENTS.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn-primary" (click)="editDepartment(null)">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 4v12M4 10h12" stroke-linecap="round"/>
          </svg>
          {{ 'DEPARTMENTS.NEW_BUTTON' | translate }}
        </button>
      </div>

      <div class="table-card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>{{ 'DEPARTMENTS.TABLE.ID' | translate }}</th>
                <th>{{ 'DEPARTMENTS.TABLE.NAME' | translate }}</th>
                <th>{{ 'DEPARTMENTS.TABLE.TYPE' | translate }}</th>
                <th>{{ 'DEPARTMENTS.TABLE.CHEF' | translate }}</th>
                <th>{{ 'DEPARTMENTS.TABLE.SECOND_CHEF' | translate }}</th>
                <th>{{ 'DEPARTMENTS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of departments">
                <td class="id-cell">#{{ d.id }}</td>
                <td class="name-cell">{{ d.name }}</td>
                <td>
                  <span class="badge" [class.local]="d.local" [class.extern]="!d.local">
                    {{ d.local ? ('DEPARTMENTS.TYPE_LOCAL' | translate) : ('DEPARTMENTS.TYPE_EXTERN' | translate) }}
                  </span>
                </td>
                <td class="chef-cell">{{ d.chefName || ('DEPARTMENTS.NONE' | translate) }}</td>
                <td class="chef-cell">{{ d.secondChefName || ('DEPARTMENTS.NONE' | translate) }}</td>
                <td class="actions-cell">
                  <button class="btn-icon edit" (click)="editDepartment(d)" title="{{ 'DEPARTMENTS.EDIT_TITLE' | translate }}">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M11.5 3.5L16.5 8.5M4 14L3 17L6 16L15 7L13 5L4 14Z"/>
                    </svg>
                  </button>
                  <button class="btn-icon delete" (click)="confirmDelete(d.id)" title="{{ 'DEPARTMENTS.DELETE_TITLE' | translate }}">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M4 5h12M8 8v5M12 8v5M6 3h8l1 2H5L6 3Z" stroke-linecap="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="departments.length === 0">
                <td colspan="6" class="empty-row">{{ 'DEPARTMENTS.EMPTY' | translate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal d'édition / création -->
      <div class="modal-overlay" *ngIf="editingDept">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ editingDept.id ? ('DEPARTMENTS.MODAL_EDIT_TITLE' | translate) : ('DEPARTMENTS.MODAL_CREATE_TITLE' | translate) }}</h3>
            <button class="close-btn" (click)="cancelEdit()">✕</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>{{ 'DEPARTMENTS.MODAL_NAME_LABEL' | translate }}</label>
              <input type="text" [(ngModel)]="editingDept.name" [disabled]="!!editingDept.id" placeholder="ex: Support Technique">
              <span class="hint" *ngIf="editingDept.id">{{ 'DEPARTMENTS.MODAL_NAME_HINT' | translate }}</span>
            </div>
            <div class="input-group">
              <label>{{ 'DEPARTMENTS.MODAL_TYPE_LABEL' | translate }}</label>
              <select [(ngModel)]="editingDept.local">
                <option [ngValue]="true">{{ 'DEPARTMENTS.TYPE_LOCAL_OPTION' | translate }}</option>
                <option [ngValue]="false">{{ 'DEPARTMENTS.TYPE_EXTERN_OPTION' | translate }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>{{ 'DEPARTMENTS.MODAL_CHEF_LABEL' | translate }}</label>
              <select [(ngModel)]="editingDept.chefId">
                <option [ngValue]="undefined">{{ 'DEPARTMENTS.NONE' | translate }}</option>
                <option *ngFor="let u of users" [ngValue]="u.id">
                  {{ u.firstName }} {{ u.lastName }} ({{ u.role === 'ADMIN' ? ('DEPARTMENTS.ADMIN_BADGE' | translate) : ('DEPARTMENTS.USER_BADGE' | translate) }})
                </option>
              </select>
            </div>
            <div class="input-group" *ngIf="editingDept.local === false">
              <label>{{ 'DEPARTMENTS.MODAL_SECOND_CHEF_LABEL' | translate }}</label>
              <select [(ngModel)]="editingDept.secondChefId">
                <option [ngValue]="undefined">{{ 'DEPARTMENTS.NONE' | translate }}</option>
                <option *ngFor="let u of users" [ngValue]="u.id">
                  {{ u.firstName }} {{ u.lastName }} ({{ u.role === 'ADMIN' ? ('DEPARTMENTS.ADMIN_BADGE' | translate) : ('DEPARTMENTS.USER_BADGE' | translate) }})
                </option>
              </select>
            </div>
            <div class="alert-error" *ngIf="errorMsg">
              <span class="error-icon">⚠️</span> {{ errorMsg }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="cancelEdit()">{{ 'DEPARTMENTS.MODAL_CANCEL' | translate }}</button>
            <button class="btn-primary" (click)="saveDepartment()">{{ 'DEPARTMENTS.MODAL_SAVE' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation suppression -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-card confirm-modal">
          <div class="modal-header">
            <h3>{{ 'DEPARTMENTS.DELETE_CONFIRM_TITLE' | translate }}</h3>
            <button class="close-btn" (click)="closeDeleteModal()">✕</button>
          </div>
          <div class="modal-body">
            <p>{{ 'DEPARTMENTS.DELETE_CONFIRM_MESSAGE' | translate }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeDeleteModal()">{{ 'DEPARTMENTS.DELETE_CANCEL' | translate }}</button>
            <button class="btn-primary delete-confirm-btn" (click)="executeDelete()">{{ 'DEPARTMENTS.DELETE_CONFIRM' | translate }}</button>
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
    :host {
      --bg-gradient-start: #f8fafc;
      --bg-gradient-end: #f1f5f9;
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --text-muted: #5b6e8c;
      --border-light: rgba(31, 46, 90, 0.1);
      --thead-bg: rgba(31, 46, 90, 0.03);
      --thead-color: #1F2E5A;
      --td-border: rgba(203, 213, 225, 0.3);
      --hover-bg: rgba(31, 46, 90, 0.02);
      --badge-local-bg: #dcfce7;
      --badge-local-color: #15803d;
      --badge-extern-bg: #ffe4e2;
      --badge-extern-color: #b91c2c;
      --table-card-bg: rgba(255, 255, 255, 0.85);
      --table-card-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.05);
      --modal-bg: rgba(255, 255, 255, 0.98);
      --modal-header-bg: #f8fafc;
      --modal-border: #e2e8f0;
      --input-bg: white;
      --input-border: #e2e8f0;
      --input-disabled-bg: #f1f5f9;
      --alert-error-bg: #fff5f5;
      --alert-error-color: #b91c2c;
      --btn-secondary-border: #cbd5e1;
      --btn-secondary-color: #334155;
      --btn-secondary-hover-bg: #f1f5f9;
      --btn-primary-bg: linear-gradient(135deg, #1F2E5A, #2a3f78);
      --btn-primary-hover-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --empty-row-color: #94a3b8;
      --id-cell-color: #1F2E5A;
      --name-cell-color: #0f172a;
      --chef-cell-color: #5b6e8c;
      --edit-icon-color: #1F2E5A;
      --delete-icon-color: #E21C2A;
    }

    /* Mode sombre (activé par .dark-theme sur un parent) */
    :host-context(.dark-theme) {
      --bg-gradient-start: #0f172a;
      --bg-gradient-end: #1e293b;
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --border-light: rgba(255, 255, 255, 0.08);
      --thead-bg: rgba(255, 255, 255, 0.04);
      --thead-color: #e2e8f0;
      --td-border: rgba(255, 255, 255, 0.08);
      --hover-bg: rgba(255, 255, 255, 0.02);
      --badge-local-bg: #14532d;
      --badge-local-color: #4ade80;
      --badge-extern-bg: #7f1d1d;
      --badge-extern-color: #f87171;
      --table-card-bg: rgba(30, 41, 59, 0.85);
      --table-card-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.25);
      --modal-bg: rgba(30, 41, 59, 0.98);
      --modal-header-bg: #1e293b;
      --modal-border: #334155;
      --input-bg: #0f172a;
      --input-border: #334155;
      --input-disabled-bg: #1e293b;
      --alert-error-bg: #450a0a;
      --alert-error-color: #f87171;
      --btn-secondary-border: #475569;
      --btn-secondary-color: #e2e8f0;
      --btn-secondary-hover-bg: #334155;
      --btn-primary-bg: linear-gradient(135deg, #E21C2A, #b91c2c);
      --btn-primary-hover-bg: linear-gradient(135deg, #b91c2c, #991b2b);
      --empty-row-color: #64748b;
      --id-cell-color: #e2e8f0;
      --name-cell-color: #f1f5f9;
      --chef-cell-color: #94a3b8;
      --edit-icon-color: #e2e8f0;
      --delete-icon-color: #f87171;
    }

    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 10% 20%, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
      transition: background 0.3s;
    }

    .admin-departments {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Page header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1F2E5A 0%, #2c3f70 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.5px;
      margin-bottom: 0.25rem;
    }
    :host-context(.dark-theme) h2 {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    .subtitle {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
    }

    /* Primary button */
    .btn-primary {
      background: var(--btn-primary-bg);
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
      background: var(--btn-primary-hover-bg);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(226, 28, 42, 0.3);
    }

    /* Table card */
    .table-card {
      background: var(--table-card-bg);
      backdrop-filter: blur(12px);
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: var(--table-card-shadow);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .table-card:hover {
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.15);
    }

    .table-responsive {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th {
      text-align: left;
      padding: 1.2rem 1.2rem;
      background: var(--thead-bg);
      font-weight: 700;
      color: var(--thead-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.8rem;
      border-bottom: 1px solid var(--border-light);
    }

    td {
      padding: 1rem 1.2rem;
      border-bottom: 1px solid var(--td-border);
      vertical-align: middle;
      color: var(--text-primary);
    }

    tr:hover td {
      background: var(--hover-bg);
    }

    .id-cell {
      font-weight: 700;
      color: var(--id-cell-color);
      font-family: monospace;
    }

    .name-cell {
      font-weight: 600;
      color: var(--name-cell-color);
    }

    .chef-cell {
      color: var(--chef-cell-color);
    }

    /* Badge type */
    .badge {
      display: inline-block;
      padding: 0.25rem 0.8rem;
      border-radius: 40px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .badge.local {
      background: var(--badge-local-bg);
      color: var(--badge-local-color);
      box-shadow: 0 0 0 1px;
    }
    .badge.extern {
      background: var(--badge-extern-bg);
      color: var(--badge-extern-color);
      box-shadow: 0 0 0 1px;
    }

    .empty-row {
      text-align: center;
      padding: 2.5rem;
      color: var(--empty-row-color);
      font-style: italic;
    }

    /* Action buttons */
    .actions-cell {
      white-space: nowrap;
      width: 80px;
    }

    .btn-icon {
      background: transparent;
      border: none;
      padding: 6px;
      margin: 0 4px;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon.edit {
      color: var(--edit-icon-color);
    }
    .btn-icon.edit:hover {
      background: rgba(31, 46, 90, 0.1);
      transform: scale(1.05);
    }
    .btn-icon.delete {
      color: var(--delete-icon-color);
    }
    .btn-icon.delete:hover {
      background: rgba(226, 28, 42, 0.1);
      transform: scale(1.05);
    }
    :host-context(.dark-theme) .btn-icon.edit:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    :host-context(.dark-theme) .btn-icon.delete:hover {
      background: rgba(248, 113, 113, 0.2);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
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
      max-width: 560px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    .confirm-modal .modal-card {
      max-width: 480px;
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem 1.5rem;
      background: var(--modal-header-bg);
      border-bottom: 1px solid var(--modal-border);
    }

    .modal-header h3 {
      font-size: 1.3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin: 0;
    }
    :host-context(.dark-theme) .modal-header h3 {
      background: linear-gradient(135deg, #e2e8f0, #f87171);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .close-btn:hover {
      color: #E21C2A;
    }

    .modal-body {
      padding: 1.8rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--thead-color);
      letter-spacing: 0.3px;
    }

    .input-group input, .input-group select {
      padding: 12px 14px;
      font-size: 0.9rem;
      border: 1.5px solid var(--input-border);
      border-radius: 16px;
      transition: all 0.2s;
      background: var(--input-bg);
      color: var(--text-primary);
      font-family: inherit;
    }

    .input-group input:focus, .input-group select:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.1);
    }
    :host-context(.dark-theme) .input-group input:focus,
    :host-context(.dark-theme) .input-group select:focus {
      border-color: #E21C2A;
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }

    .input-group input:disabled {
      background: var(--input-disabled-bg);
      color: var(--text-muted);
    }

    .hint {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .alert-error {
      background: var(--alert-error-bg);
      border-left: 4px solid #E21C2A;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.8rem;
      color: var(--alert-error-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem 1.5rem;
      background: var(--modal-bg);
      border-top: 1px solid var(--modal-border);
    }

    .btn-secondary {
      background: transparent;
      border: 1.5px solid var(--btn-secondary-border);
      padding: 0.6rem 1.3rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--btn-secondary-color);
    }

    .btn-secondary:hover {
      background: var(--btn-secondary-hover-bg);
      border-color: var(--text-muted);
    }

    .delete-confirm-btn {
      background: #E21C2A;
    }
    .delete-confirm-btn:hover {
      background: #b91c2c;
      box-shadow: 0 8px 20px rgba(226, 28, 42, 0.3);
    }

    /* Responsive */
    @media (max-width: 800px) {
      .admin-departments {
        padding: 1rem;
      }
      th, td {
        padding: 0.75rem;
      }
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .modal-card {
        width: 95%;
      }
      .actions-cell {
        white-space: nowrap;
      }
    }
  `]
})
export class AdminDepartmentsComponent implements OnInit {
  departments: Department[] = [];
  users: User[] = [];
  editingDept: Partial<Department> | null = null;
  errorMsg = '';
  showDeleteModal = false;
  departmentToDelete: number | null = null;

  constructor(
    private deptService: DepartmentService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.userService.getAllUsers().subscribe(u => this.users = u);
  }

  loadDepartments() {
    this.deptService.getDepartments().subscribe(d => this.departments = d);
  }

  editDepartment(d: Department | null) {
    this.editingDept = d ? { ...d } : { name: '', local: true, chefId: undefined, secondChefId: undefined };
    this.errorMsg = '';
  }

  cancelEdit() {
    this.editingDept = null;
    this.errorMsg = '';
  }

  saveDepartment() {
    if (this.editingDept!.id) {
      this.deptService.updateDepartment(this.editingDept!.id!, this.editingDept!).subscribe({
        next: () => {
          this.loadDepartments();
          this.cancelEdit();
        },
        error: e => this.errorMsg = e.error?.message || 'Erreur lors de la mise à jour'
      });
    } else {
      this.deptService.createDepartment(this.editingDept!).subscribe({
        next: () => {
          this.loadDepartments();
          this.cancelEdit();
        },
        error: e => this.errorMsg = e.error?.message || 'Erreur lors de la création'
      });
    }
  }

  confirmDelete(id: number) {
    this.departmentToDelete = id;
    this.showDeleteModal = true;
  }

  executeDelete() {
    if (this.departmentToDelete !== null) {
      this.deptService.deleteDepartment(this.departmentToDelete).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeDeleteModal();
        },
        error: e => this.errorMsg = e.error?.message || 'Erreur lors de la désactivation'
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.departmentToDelete = null;
  }
}