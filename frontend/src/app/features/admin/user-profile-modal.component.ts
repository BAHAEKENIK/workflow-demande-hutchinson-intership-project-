import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../core/services/user.service';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-card glass-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            <span class="header-icon">👤</span> Profil utilisateur
          </h2>
          <button class="btn-close" (click)="close()">✕</button>
        </div>

        <div class="modal-body">
          <div class="profile-header">
            <div class="profile-avatar">
              <span class="avatar">{{ getInitials() }}</span>
            </div>
            <div class="profile-name">
              <h3 class="fullname">{{ user?.firstName }} {{ user?.lastName }}</h3>
              <span class="user-role-badge" [class.role-admin]="user?.role === 'ADMIN'" 
                                            [class.role-chef]="user?.role === 'CHEF_DEPT'"
                                            [class.role-directeur]="user?.role === 'DIRECTEUR'">
                {{ getRoleLabel() }}
              </span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-icon">🆔</span>
              <div class="info-content">
                <label>ID utilisateur</label>
                <p>{{ user?.id }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">👤</span>
              <div class="info-content">
                <label>Nom d'utilisateur</label>
                <p>{{ user?.username }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">📧</span>
              <div class="info-content">
                <label>Email</label>
                <p>{{ user?.email }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🏢</span>
              <div class="info-content">
                <label>Département</label>
                <p>{{ user?.departmentName || '—' }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">🔐</span>
              <div class="info-content">
                <label>Première connexion</label>
                <p>{{ user?.firstLogin ? 'Oui' : 'Non' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" (click)="close()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Fermer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO STYLES ========== */
    :host {
      display: block;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px) saturate(180%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      width: 90%;
      max-width: 560px;
      border-radius: 40px;
      overflow: hidden;
      animation: slideUp 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      transition: transform 0.2s;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(0px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(31, 46, 90, 0.08);
    }

    /* Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.4rem 1.8rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 1px solid rgba(31, 46, 90, 0.1);
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .header-icon {
      font-size: 1.6rem;
    }

    .btn-close {
      background: rgba(0, 0, 0, 0.05);
      border: none;
      font-size: 1.3rem;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 60px;
    }

    .btn-close:hover {
      background: rgba(226, 28, 42, 0.1);
      color: #E21C2A;
      transform: scale(1.05);
    }

    /* Body */
    .modal-body {
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #fefaf5, #fff);
      padding: 1.2rem;
      border-radius: 32px;
      border: 1px solid rgba(31, 46, 90, 0.06);
    }

    .profile-avatar {
      flex-shrink: 0;
    }

    .avatar {
      display: flex;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1F2E5A, #2c3f70);
      background-size: 200% 200%;
      color: white;
      font-size: 2rem;
      font-weight: 800;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      text-transform: uppercase;
      box-shadow: 0 10px 20px -5px rgba(31, 46, 90, 0.3);
      transition: transform 0.3s ease;
    }

    .avatar:hover {
      transform: scale(1.02);
    }

    .profile-name {
      flex: 1;
    }

    .fullname {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.3rem;
      letter-spacing: -0.2px;
    }

    .user-role-badge {
      display: inline-block;
      padding: 0.3rem 1rem;
      border-radius: 60px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-admin {
      background: linear-gradient(135deg, #1F2E5A, #2c3f70);
      color: white;
    }

    .role-chef {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .role-directeur {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    /* Info grid */
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.7rem 1rem;
      background: #f8fafc;
      border-radius: 20px;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .info-item:hover {
      background: #ffffff;
      border-color: #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      transform: translateX(4px);
    }

    .info-icon {
      font-size: 1.4rem;
      width: 36px;
      text-align: center;
    }

    .info-content {
      flex: 1;
    }

    .info-content label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.4px;
      display: block;
      margin-bottom: 0.2rem;
    }

    .info-content p {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      word-break: break-word;
    }

    /* Footer */
    .modal-footer {
      padding: 1.2rem 2rem 1.8rem;
      border-top: 1px solid rgba(203, 213, 225, 0.4);
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      padding: 0.7rem 1.6rem;
      border-radius: 60px;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.25s;
      box-shadow: 0 2px 6px rgba(31, 46, 90, 0.2);
    }

    .btn-primary svg {
      stroke: white;
    }

    .btn-primary:hover {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(226, 28, 42, 0.3);
    }

    /* Responsive */
    @media (max-width: 500px) {
      .modal-body {
        padding: 1.2rem;
      }
      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 0.8rem;
      }
      .info-item {
        padding: 0.5rem 0.8rem;
      }
      .info-icon {
        font-size: 1.2rem;
        width: 28px;
      }
      .modal-header h2 {
        font-size: 1.2rem;
      }
      .avatar {
        width: 64px;
        height: 64px;
        font-size: 1.6rem;
      }
    }
  `]
})
export class UserProfileModalComponent {
  @Input() user: User | null = null;
  @Input() close: () => void = () => {};

  getInitials(): string {
    if (!this.user) return '?';
    const first = this.user.firstName?.[0] || '';
    const last = this.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || this.user.username?.[0]?.toUpperCase() || 'U';
  }

  getRoleLabel(): string {
    if (!this.user) return '';
    switch (this.user.role) {
      case 'ADMIN': return 'Administrateur';
      case 'CHEF_DEPT': return 'Chef de département';
      case 'DIRECTEUR': return 'Directeur';
      default: return this.user.role;
    }
  }
}