import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserService, User } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="profile-wrapper">
      <!-- Animated background -->
      <div class="bg-mesh"></div>
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>

      <div class="profile-card">
        <!-- Card shine -->
        <div class="card-shine"></div>

        <!-- Header with avatar / brand icon -->
        <div class="profile-header anim-fade-1">
          <div class="avatar-container">
            <div class="avatar-ring"></div>
            <div class="avatar-ring-2"></div>
            <div class="avatar">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" stroke-linecap="round" />
              </svg>
            </div>
            <div class="avatar-glow"></div>
          </div>
          <h2>{{ 'PROFILE.TITLE' | translate }}</h2>
          <p class="subtitle">{{ 'PROFILE.SUBTITLE' | translate }}</p>
          <div class="brand-divider">
            <div class="divider-dot"></div>
            <div class="divider-line-accent"></div>
            <div class="divider-dot"></div>
          </div>
        </div>

        <!-- Profile update form -->
        <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form anim-fade-2">
          <div class="form-row">
            <div class="input-group">
              <label for="firstName">
                <span class="label-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                </span>
                {{ 'PROFILE.FIRSTNAME_LABEL' | translate }}
              </label>
              <div class="input-wrapper">
                <input id="firstName" type="text" formControlName="firstName" [placeholder]="'PROFILE.FIRSTNAME_PLACEHOLDER' | translate">
                <div class="input-focus-line"></div>
              </div>
            </div>
            <div class="input-group">
              <label for="lastName">
                <span class="label-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                </span>
                {{ 'PROFILE.LASTNAME_LABEL' | translate }}
              </label>
              <div class="input-wrapper">
                <input id="lastName" type="text" formControlName="lastName" [placeholder]="'PROFILE.LASTNAME_PLACEHOLDER' | translate">
                <div class="input-focus-line"></div>
              </div>
            </div>
          </div>

          <div class="input-group">
            <label for="email">
              <span class="label-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M22 7L12 14 2 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </span>
              {{ 'PROFILE.EMAIL_LABEL' | translate }}
            </label>
            <div class="input-wrapper">
              <input id="email" type="email" formControlName="email" [placeholder]="'PROFILE.EMAIL_PLACEHOLDER' | translate">
              <div class="input-focus-line"></div>
            </div>
            <span class="error-msg" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
              <span class="error-shake">⚠️</span> {{ 'PROFILE.EMAIL_ERROR' | translate }}
            </span>
          </div>

          <button type="submit" class="btn-primary" [disabled]="profileForm.invalid">
            <span class="btn-text">{{ 'PROFILE.SAVE_BUTTON' | translate }}</span>
            <span class="btn-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" class="btn-icon">
                <path d="M20 6L9 17L4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="btn-shine"></span>
          </button>
        </form>

        <!-- Divider -->
        <div class="section-divider anim-fade-3">
          <span class="divider-line"></span>
          <span class="divider-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            {{ 'PROFILE.SECURITY_SECTION' | translate }}
          </span>
          <span class="divider-line"></span>
        </div>

        <!-- Password change form -->
        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="password-form anim-fade-4">
          <div class="input-group" *ngIf="!user?.firstLogin">
            <label for="oldPassword">
              <span class="label-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                </svg>
              </span>
              {{ 'PROFILE.OLD_PASSWORD_LABEL' | translate }}
            </label>
            <div class="input-wrapper password-wrapper">
              <input
                id="oldPassword"
                [type]="showOldPassword ? 'text' : 'password'"
                formControlName="oldPassword"
                [placeholder]="'PROFILE.OLD_PASSWORD_PLACEHOLDER' | translate"
                autocomplete="current-password"
              />
              <div class="input-focus-line"></div>
              <button type="button" class="toggle-pwd" (click)="toggleOldPasswordVisibility()">
                <span [class.hidden-eye]="!showOldPassword" [class.visible-eye]="showOldPassword">
                  {{ showOldPassword ? '🙈' : '👁️' }}
                </span>
              </button>
            </div>
          </div>

          <div class="input-group">
            <label for="newPassword">
              <span class="label-icon">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                </svg>
              </span>
              {{ 'PROFILE.NEW_PASSWORD_LABEL' | translate }}
            </label>
            <div class="input-wrapper password-wrapper">
              <input
                id="newPassword"
                [type]="showNewPassword ? 'text' : 'password'"
                formControlName="newPassword"
                [placeholder]="'PROFILE.NEW_PASSWORD_PLACEHOLDER' | translate"
                autocomplete="new-password"
              />
              <div class="input-focus-line"></div>
              <button type="button" class="toggle-pwd" (click)="toggleNewPasswordVisibility()">
                <span [class.hidden-eye]="!showNewPassword" [class.visible-eye]="showNewPassword">
                  {{ showNewPassword ? '🙈' : '👁️' }}
                </span>
              </button>
            </div>
            <!-- Force meter -->
            <div *ngIf="passwordForm.get('newPassword')?.value" class="strength-meter">
              <div class="strength-track">
                <div class="strength-fill" [class]="getPasswordStrengthClass()"></div>
                <div class="strength-glow" [class]="getPasswordStrengthClass()"></div>
              </div>
              <span class="strength-text" [class]="getPasswordStrengthClass()">{{ getPasswordStrengthText() }}</span>
            </div>
          </div>

          <button type="submit" class="btn-secondary" [disabled]="passwordForm.invalid">
            <span class="btn-text">{{ 'PROFILE.CHANGE_PASSWORD_BUTTON' | translate }}</span>
            <span class="btn-icon-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" class="btn-icon">
                <path d="M12 4v12m0 0l-3-3m3 3l3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="btn-shine"></span>
          </button>
        </form>

        <!-- Global message -->
        <div *ngIf="message" class="alert" [class.alert-success]="!message.includes('Erreur') && !message.includes('erreur')" [class.alert-error]="message.includes('Erreur') || message.includes('erreur')">
          <span class="alert-pulse"></span>
          <span class="alert-icon">{{ message.includes('Erreur') ? '⚠️' : '✓' }}</span>
          <span class="alert-text">{{ message }}</span>
          <button class="alert-close" (click)="message = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX PROFILE ========== */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.15); opacity: 0; }
    }
    @keyframes ringRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }
    @keyframes orbFloat1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -30px) scale(1.08); }
      66% { transform: translate(-15px, 15px) scale(0.95); }
    }
    @keyframes orbFloat2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-25px, -20px) scale(1.1); }
    }
    @keyframes orbFloat3 {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(15px, 20px); }
      66% { transform: translate(-20px, -10px); }
    }
    @keyframes meshFloat {
      0% { transform: translate(0, 0); }
      100% { transform: translate(40px, 40px); }
    }
    @keyframes dividerGrow {
      from { width: 0; opacity: 0; }
      to { width: 50px; opacity: 1; }
    }
    @keyframes cardShine {
      0% { transform: translateX(-100%) rotate(15deg); }
      100% { transform: translateX(200%) rotate(15deg); }
    }
    @keyframes errorShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(2px); }
    }
    @keyframes alertSlide {
      from { opacity: 0; transform: translateY(-12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes strengthGlow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .anim-fade-1 { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.05s both; }
    .anim-fade-2 { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.15s both; }
    .anim-fade-3 { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.25s both; }
    .anim-fade-4 { animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.35s both; }

    /* === Variables clair (défaut) === */
    .profile-wrapper {
      --card-bg: rgba(255, 255, 255, 0.78);
      --card-border: rgba(31, 46, 90, 0.06);
      --text-primary: #0f172a;
      --text-secondary: #5b6e8c;
      --text-muted: #94a3b8;
      --input-bg: rgba(255, 255, 255, 0.9);
      --input-border: rgba(31, 46, 90, 0.1);
      --input-focus-border: #1F2E5A;
      --input-focus-ring: rgba(31, 46, 90, 0.08);
      --input-color: #0f172a;
      --label-color: #475569;
      --label-icon-color: #94a3b8;
      --divider-line-color: rgba(31, 46, 90, 0.06);
      --divider-text-color: #8596b0;
      --error-color: #E21C2A;
      --error-bg: rgba(226, 28, 42, 0.04);
      --shadow-card: 0 24px 48px -12px rgba(0, 0, 0, 0.08);
      --shadow-hover: 0 32px 64px -16px rgba(31, 46, 90, 0.12);
      --orb-opacity: 0.06;
      --mesh-opacity: 0.025;
      --avatar-gradient: linear-gradient(135deg, #1F2E5A, #2c3f70);
      --avatar-shadow: rgba(31, 46, 90, 0.25);
      --avatar-ring-color: rgba(31, 46, 90, 0.15);
      --toggle-hover-bg: rgba(31, 46, 90, 0.06);
      --strength-track-bg: rgba(31, 46, 90, 0.06);
    }

    :host-context(.dark-theme) .profile-wrapper {
      --card-bg: rgba(30, 41, 59, 0.6);
      --card-border: rgba(255, 255, 255, 0.05);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --input-bg: rgba(15, 23, 42, 0.6);
      --input-border: rgba(255, 255, 255, 0.08);
      --input-focus-border: #E21C2A;
      --input-focus-ring: rgba(226, 28, 42, 0.1);
      --input-color: #f1f5f9;
      --label-color: #94a3b8;
      --label-icon-color: #64748b;
      --divider-line-color: rgba(255, 255, 255, 0.05);
      --divider-text-color: #64748b;
      --error-color: #f87171;
      --error-bg: rgba(248, 113, 113, 0.06);
      --shadow-card: 0 24px 48px -12px rgba(0, 0, 0, 0.35);
      --shadow-hover: 0 32px 64px -16px rgba(0, 0, 0, 0.45);
      --orb-opacity: 0.1;
      --mesh-opacity: 0.03;
      --avatar-gradient: linear-gradient(135deg, #E21C2A, #b91c2c);
      --avatar-shadow: rgba(226, 28, 42, 0.3);
      --avatar-ring-color: rgba(226, 28, 42, 0.2);
      --toggle-hover-bg: rgba(255, 255, 255, 0.06);
      --strength-track-bg: rgba(255, 255, 255, 0.06);
    }

    .profile-wrapper {
      max-width: 680px;
      margin: 2rem auto;
      padding: 0 1rem;
      position: relative;
    }

    /* ===== ANIMATED BACKGROUND ===== */
    .bg-mesh {
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(var(--divider-line-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--divider-line-color) 1px, transparent 1px);
      background-size: 50px 50px;
      opacity: var(--mesh-opacity);
      animation: meshFloat 25s linear infinite;
      pointer-events: none;
      z-index: 0;
    }

    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: var(--orb-opacity);
      pointer-events: none;
      z-index: 0;
      transition: opacity 0.5s ease;
    }
    .bg-orb-1 {
      width: 300px; height: 300px;
      background: #1F2E5A;
      top: -80px; right: -60px;
      animation: orbFloat1 18s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 250px; height: 250px;
      background: #E21C2A;
      bottom: -60px; left: -40px;
      animation: orbFloat2 22s ease-in-out infinite;
    }
    .bg-orb-3 {
      width: 200px; height: 200px;
      background: #22c55e;
      top: 50%; left: 60%;
      animation: orbFloat3 16s ease-in-out infinite;
    }

    /* ===== CARD ===== */
    .profile-card {
      background: var(--card-bg);
      backdrop-filter: blur(20px) saturate(180%);
      border-radius: 36px;
      padding: 2.5rem 2.5rem 2rem;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--card-border);
      transition: all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    .profile-card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }

    .card-shine {
      position: absolute;
      top: 0;
      left: -150%;
      width: 80%;
      height: 100%;
      background: linear-gradient(
        105deg,
        transparent 40%,
        rgba(255, 255, 255, 0.04) 45%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.04) 55%,
        transparent 60%
      );
      pointer-events: none;
      z-index: 0;
    }
    .profile-card:hover .card-shine {
      animation: cardShine 1s ease forwards;
    }

    /* ===== HEADER ===== */
    .profile-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 1;
    }

    .avatar-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.2rem;
    }

    .avatar {
      width: 76px;
      height: 76px;
      background: var(--avatar-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 24px var(--avatar-shadow);
      position: relative;
      z-index: 3;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }
    .profile-header:hover .avatar {
      transform: scale(1.06);
    }
    .avatar svg { color: white; width: 36px; height: 36px; }

    .avatar-ring {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 2px solid var(--avatar-ring-color);
      animation: ringPulse 3s ease-in-out infinite;
      z-index: 2;
    }
    .avatar-ring-2 {
      position: absolute;
      inset: -16px;
      border-radius: 50%;
      border: 1px dashed var(--avatar-ring-color);
      animation: ringRotate 20s linear infinite;
      z-index: 1;
      opacity: 0.5;
    }
    .avatar-glow {
      position: absolute;
      inset: -20px;
      border-radius: 50%;
      background: var(--avatar-ring-color);
      filter: blur(20px);
      animation: glowPulse 4s ease-in-out infinite;
      z-index: 0;
    }

    h2 {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #1F2E5A 0%, #142559 50%, #E21C2A 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 0.3rem;
      line-height: 1.2;
    }
    :host-context(.dark-theme) h2 {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #f87171 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    .subtitle {
      font-size: 0.88rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .brand-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 1rem;
    }
    .divider-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #E21C2A;
      opacity: 0.6;
    }
    .divider-line-accent {
      height: 2px;
      width: 50px;
      background: linear-gradient(90deg, #1F2E5A, #E21C2A);
      border-radius: 2px;
      animation: dividerGrow 0.8s ease-out 0.4s both;
    }

    /* ===== FORMS ===== */
    .profile-form, .password-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .form-row {
      display: flex;
      gap: 1.2rem;
    }
    .form-row .input-group { flex: 1; }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-group label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--label-color);
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .label-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 8px;
      background: var(--input-border);
      transition: all 0.3s ease;
    }
    .label-icon svg { color: var(--label-icon-color); transition: color 0.3s ease; }
    .input-group:focus-within .label-icon {
      background: var(--input-focus-border);
    }
    .input-group:focus-within .label-icon svg {
      color: white;
    }

    .input-wrapper {
      position: relative;
      width: 100%;
    }

    .input-group input {
      width: 100%;
      padding: 13px 16px;
      font-size: 0.88rem;
      font-weight: 500;
      background: var(--input-bg);
      border: 1.5px solid var(--input-border);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      color: var(--input-color);
      outline: none;
      backdrop-filter: blur(4px);
    }
    .input-group input::placeholder {
      color: var(--text-muted);
      font-weight: 400;
    }
    .input-group input:focus {
      border-color: var(--input-focus-border);
      box-shadow: 0 0 0 4px var(--input-focus-ring), 0 4px 16px rgba(0,0,0,0.04);
      transform: translateY(-1px);
    }

    .input-focus-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: var(--input-focus-border);
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      transform: translateX(-50%);
    }
    .input-group input:focus ~ .input-focus-line {
      width: 60%;
    }

    /* Password wrapper */
    .password-wrapper input {
      padding-right: 48px;
    }

    .toggle-pwd {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1.15rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 2;
    }
    .toggle-pwd:hover {
      background: var(--toggle-hover-bg);
      transform: translateY(-50%) scale(1.1);
    }
    .hidden-eye { transition: transform 0.3s ease; display: inline-block; }
    .visible-eye { transition: transform 0.3s ease; display: inline-block; transform: scale(1.1); }

    .error-msg {
      font-size: 0.7rem;
      color: var(--error-color);
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      margin-top: 2px;
      padding: 4px 10px;
      background: var(--error-bg);
      border-radius: 10px;
      border: 1px solid rgba(226, 28, 42, 0.08);
    }
    .error-shake {
      display: inline-block;
      animation: errorShake 0.5s ease;
    }

    /* ===== STRENGTH METER ===== */
    .strength-meter {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .strength-track {
      flex: 1;
      height: 6px;
      border-radius: 10px;
      background: var(--strength-track-bg);
      position: relative;
      overflow: hidden;
    }
    .strength-fill {
      height: 100%;
      border-radius: 10px;
      transition: all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      width: 0%;
    }
    .strength-fill.weak { width: 33%; background: linear-gradient(90deg, #E21C2A, #f87171); }
    .strength-fill.medium { width: 66%; background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .strength-fill.strong { width: 100%; background: linear-gradient(90deg, #10b981, #34d399); }

    .strength-glow {
      position: absolute;
      top: -2px;
      right: -4px;
      width: 16px;
      height: 10px;
      border-radius: 50%;
      filter: blur(4px);
      opacity: 0;
      transition: all 0.5s ease;
    }
    .strength-glow.weak { background: #E21C2A; opacity: 0.6; animation: strengthGlow 2s infinite; }
    .strength-glow.medium { background: #f59e0b; opacity: 0.6; animation: strengthGlow 2s infinite; }
    .strength-glow.strong { background: #10b981; opacity: 0.6; animation: strengthGlow 2s infinite; }

    .strength-text {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 55px;
      text-align: right;
      color: var(--text-muted);
      transition: color 0.3s ease;
    }
    .strength-text.weak { color: #E21C2A; }
    .strength-text.medium { color: #f59e0b; }
    .strength-text.strong { color: #10b981; }

    /* ===== BUTTONS ===== */
    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 14px 24px;
      font-size: 0.88rem;
      font-weight: 800;
      border: none;
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      position: relative;
      overflow: hidden;
      letter-spacing: 0.2px;
    }

    .btn-primary {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      color: white;
      box-shadow: 0 6px 16px rgba(31, 46, 90, 0.25);
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 28px rgba(226, 28, 42, 0.3);
    }
    .btn-primary:active:not(:disabled) {
      transform: translateY(-1px) scale(0.99);
    }

    .btn-secondary {
      background: var(--input-border);
      color: var(--text-primary);
      border: 1.5px solid var(--input-border);
    }
    .btn-secondary:hover:not(:disabled) {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border-color: transparent;
      color: white;
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 28px rgba(31, 46, 90, 0.25);
    }
    :host-context(.dark-theme) .btn-secondary:hover:not(:disabled) {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      box-shadow: 0 12px 28px rgba(226, 28, 42, 0.25);
    }
    .btn-secondary:active:not(:disabled) {
      transform: translateY(-1px) scale(0.99);
    }

    .btn-primary:disabled, .btn-secondary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    .btn-icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: rgba(255,255,255,0.12);
      transition: all 0.3s ease;
    }
    .btn-secondary .btn-icon-wrap {
      background: rgba(255,255,255,0.08);
    }
    .btn-icon {
      transition: transform 0.3s ease;
    }
    .btn-primary:hover:not(:disabled) .btn-icon,
    .btn-secondary:hover:not(:disabled) .btn-icon {
      transform: translateX(3px);
    }
    .btn-primary:hover:not(:disabled) .btn-icon-wrap,
    .btn-secondary:hover:not(:disabled) .btn-icon-wrap {
      background: rgba(255,255,255,0.2);
    }

    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
      pointer-events: none;
    }
    .btn-primary:hover:not(:disabled) .btn-shine,
    .btn-secondary:hover:not(:disabled) .btn-shine {
      animation: cardShine 0.8s ease forwards;
    }

    /* ===== DIVIDER ===== */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 2.5rem 0 2rem;
      position: relative;
      z-index: 1;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--divider-line-color), transparent);
    }
    .divider-text {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--divider-text-color);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
    .divider-text svg {
      color: var(--divider-text-color);
      opacity: 0.7;
    }

    /* ===== ALERT ===== */
    .alert {
      margin-top: 2rem;
      padding: 14px 18px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.84rem;
      font-weight: 600;
      animation: alertSlide 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    .alert-pulse {
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      animation: pulseDot 2s ease-in-out infinite;
    }
    .alert-success {
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.15);
      color: #166534;
    }
    .alert-success .alert-pulse { background: #22c55e; }
    :host-context(.dark-theme) .alert-success {
      background: rgba(20, 83, 45, 0.3);
      border-color: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    .alert-error {
      background: rgba(226, 28, 42, 0.06);
      border: 1px solid rgba(226, 28, 42, 0.12);
      color: #991b1b;
    }
    .alert-error .alert-pulse { background: #E21C2A; }
    :host-context(.dark-theme) .alert-error {
      background: rgba(127, 29, 29, 0.3);
      border-color: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .alert-icon { font-size: 1rem; flex-shrink: 0; }
    .alert-text { flex: 1; }

    .alert-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .alert-close:hover {
      opacity: 1;
      background: rgba(0,0,0,0.06);
    }
    :host-context(.dark-theme) .alert-close:hover {
      background: rgba(255,255,255,0.06);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 640px) {
      .profile-card {
        padding: 1.8rem 1.5rem 1.5rem;
        border-radius: 28px;
      }
      h2 { font-size: 1.6rem; }
      .form-row {
        flex-direction: column;
        gap: 1.2rem;
      }
      .avatar { width: 64px; height: 64px; }
      .avatar svg { width: 30px; height: 30px; }
      .bg-orb { display: none; }
    }

    @media (max-width: 400px) {
      .profile-wrapper { padding: 0 0.5rem; }
      .profile-card { padding: 1.5rem 1.2rem; border-radius: 24px; }
      h2 { font-size: 1.4rem; }
    }
  `]
})
export class ProfilComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  message = '';

  showOldPassword = false;
  showNewPassword = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]]
    });
    this.passwordForm = this.fb.group({
      oldPassword: [''],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.user = u;
        this.profileForm.patchValue(u);
      },
      error: () => this.message = this.translate.instant('PROFILE.LOAD_ERROR')
    });
  }

  updateProfile() {
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => this.message = this.translate.instant('PROFILE.UPDATE_SUCCESS'),
      error: () => this.message = this.translate.instant('PROFILE.UPDATE_ERROR')
    });
  }

  changePassword() {
    const req: any = { newPassword: this.passwordForm.value.newPassword };
    if (!this.user?.firstLogin) req.oldPassword = this.passwordForm.value.oldPassword;
    this.authService.changePassword(req).subscribe({
      next: () => {
        this.message = this.translate.instant('PROFILE.PASSWORD_CHANGED');
        this.passwordForm.reset();
      },
      error: (err) => this.message = err.error?.message || this.translate.instant('PROFILE.PASSWORD_ERROR')
    });
  }

  toggleOldPasswordVisibility(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  getPasswordStrengthClass(): string {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    const strength = this.checkStrength(pwd);
    if (strength === 'weak') return 'weak';
    if (strength === 'medium') return 'medium';
    if (strength === 'strong') return 'strong';
    return '';
  }

  getPasswordStrengthText(): string {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    const strength = this.checkStrength(pwd);
    if (strength === 'weak') return this.translate.instant('PROFILE.STRENGTH_WEAK');
    if (strength === 'medium') return this.translate.instant('PROFILE.STRENGTH_MEDIUM');
    if (strength === 'strong') return this.translate.instant('PROFILE.STRENGTH_STRONG');
    return '';
  }

  private checkStrength(pwd: string): 'weak' | 'medium' | 'strong' {
    if (!pwd) return 'weak';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
}