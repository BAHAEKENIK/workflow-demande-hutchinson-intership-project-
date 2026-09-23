import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="reset-container">
      <!-- Fond avec image en ligne, flou léger mais identifiable -->
      <div class="bg-blur" style="background-image: url('/hutchinson.jpeg');"></div>
      <div class="bg-overlay"></div>
      <div class="animated-gradient"></div>
      
      <!-- Orbes flottants -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      
      <div class="reset-card">
        <!-- Brand hint avec icône verrou -->
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round"/>
          </svg>
        </div>
        
        <h2>{{ 'RESET_PASSWORD.TITLE' | translate }}</h2>
        <p class="subtitle">{{ 'RESET_PASSWORD.SUBTITLE' | translate }}</p>
        
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" novalidate>
          <!-- Nouveau mot de passe -->
          <div class="input-group" [class.focused]="newPwdFocused">
            <label for="newPassword">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              {{ 'RESET_PASSWORD.NEW_PASSWORD_LABEL' | translate }}
            </label>
            <div class="password-wrapper">
              <input
                id="newPassword"
                [type]="showNewPassword ? 'text' : 'password'"
                formControlName="newPassword"
                [placeholder]="'RESET_PASSWORD.PASSWORD_PLACEHOLDER' | translate"
                (focus)="newPwdFocused = true"
                (blur)="newPwdFocused = false"
                autocomplete="new-password"
              />
              <button type="button" class="toggle-pwd" (click)="showNewPassword = !showNewPassword" [attr.title]="showNewPassword ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!showNewPassword" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
                </svg>
                <svg *ngIf="showNewPassword" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M2 12 L22 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>
                </svg>
              </button>
            </div>
            <!-- Force meter -->
            <div class="strength-meter" *ngIf="resetForm.get('newPassword')?.value">
              <div class="strength-bar-container">
                <div class="strength-bar" [class]="getPasswordStrengthClass()"></div>
              </div>
              <span class="strength-text">{{ getPasswordStrengthText() }}</span>
            </div>
            <div class="error-msg" *ngIf="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched">
              <span *ngIf="resetForm.get('newPassword')?.errors?.['required']">⚠️ {{ 'RESET_PASSWORD.PASSWORD_REQUIRED' | translate }}</span>
              <span *ngIf="resetForm.get('newPassword')?.errors?.['minlength']">⚠️ {{ 'RESET_PASSWORD.PASSWORD_MINLENGTH' | translate }}</span>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="input-group" [class.focused]="confirmPwdFocused">
            <label for="confirmPassword">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              {{ 'RESET_PASSWORD.CONFIRM_LABEL' | translate }}
            </label>
            <div class="password-wrapper">
              <input
                id="confirmPassword"
                [type]="showConfirmPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                [placeholder]="'RESET_PASSWORD.PASSWORD_PLACEHOLDER' | translate"
                (focus)="confirmPwdFocused = true"
                (blur)="confirmPwdFocused = false"
                autocomplete="new-password"
              />
              <button type="button" class="toggle-pwd" (click)="showConfirmPassword = !showConfirmPassword" [attr.title]="showConfirmPassword ? 'Masquer' : 'Afficher'">
                <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
                </svg>
                <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M2 12 L22 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>
                </svg>
              </button>
            </div>
            <div class="error-msg" *ngIf="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
              ⚠️ {{ 'RESET_PASSWORD.PASSWORD_MISMATCH' | translate }}
            </div>
          </div>

          <!-- Messages -->
          <div class="alert-success" *ngIf="message">
            <span class="alert-icon">✓</span> {{ message }}
          </div>
          <div class="alert-error" *ngIf="errorMessage">
            <span class="alert-icon">⛔</span> {{ errorMessage }}
          </div>

          <!-- Submit button -->
          <button type="submit" class="submit-btn" [disabled]="resetForm.invalid || isSubmitting">
            <span class="btn-text">{{ isSubmitting ? ('RESET_PASSWORD.SUBMITTING' | translate) : ('RESET_PASSWORD.SUBMIT_BUTTON' | translate) }}</span>
            <span class="btn-icon" *ngIf="!isSubmitting">→</span>
            <div class="loader" *ngIf="isSubmitting"></div>
          </button>

          <a routerLink="/login" class="back-link">← {{ 'RESET_PASSWORD.BACK_TO_LOGIN' | translate }}</a>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO RESET PASSWORD STYLES ========== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      min-height: 100vh;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
    }

    .reset-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      z-index: 2;
    }

    /* ===== FOND AVEC IMAGE HUTCHINSON (flou maîtrisé) ===== */
    .bg-blur {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-size: cover;
      background-position: center 30%;
      filter: blur(6px) brightness(0.85);
      transform: scale(1.05);
      z-index: 0;
    }

    .bg-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 20%, rgba(31, 46, 90, 0.4), rgba(0, 0, 0, 0.5));
      z-index: 1;
    }

    .animated-gradient {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(125deg, rgba(226, 28, 42, 0.12), rgba(31, 46, 90, 0.08));
      z-index: 1;
      animation: shiftGradient 14s infinite alternate ease-in-out;
    }

    @keyframes shiftGradient {
      0% { background-position: 0% 30%; opacity: 0.6; }
      100% { background-position: 100% 70%; opacity: 1; }
    }

    /* Orbes flottants (position fixe pour fond) */
    .orb {
      position: fixed;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(226, 28, 42, 0.2), rgba(31, 46, 90, 0.05));
      filter: blur(55px);
      pointer-events: none;
      z-index: 1;
      animation: float 20s infinite alternate ease-in-out;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      top: -150px;
      right: -100px;
    }

    .orb-2 {
      width: 500px;
      height: 500px;
      bottom: -200px;
      left: -150px;
      animation-delay: -6s;
    }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      100% { transform: translate(40px, -50px) scale(1.2); opacity: 0.7; }
    }

    /* Carte glassmorphique */
    .reset-card {
      position: relative;
      z-index: 10;
      max-width: 520px;
      width: 100%;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(24px);
      border-radius: 2.5rem;
      padding: 2rem 2rem 2.2rem;
      box-shadow: 0 30px 55px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
      border: 1px solid rgba(255, 255, 255, 0.8);
      transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.3s;
      animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .reset-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 40px 65px -15px rgba(31, 46, 90, 0.25);
    }

    .brand-icon {
      text-align: center;
      margin-bottom: 1rem;
    }

    .brand-icon svg {
      stroke: #1F2E5A;
      background: rgba(31, 46, 90, 0.1);
      padding: 10px;
      border-radius: 60px;
      width: 54px;
      height: 54px;
      backdrop-filter: blur(4px);
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #1F2E5A 0%, #2c3f70 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      font-size: 0.85rem;
      color: #5b6e8c;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    /* Input groups */
    .input-group {
      margin-bottom: 1.4rem;
    }

    .input-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #4a5b6e;
      margin-bottom: 8px;
      transition: color 0.2s, transform 0.1s;
    }

    .input-group.focused label {
      color: #E21C2A;
      transform: translateX(3px);
    }

    .password-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      padding: 14px 18px;
      font-size: 0.95rem;
      background: #FFFFFF;
      border: 1.5px solid #e9edf2;
      border-radius: 18px;
      outline: none;
      transition: all 0.25s ease;
      color: #1e293b;
      font-weight: 500;
    }

    input:focus {
      border-color: #1F2E5A;
      box-shadow: 0 0 0 4px rgba(31, 46, 90, 0.12);
    }

    .toggle-pwd {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 40px;
      transition: background 0.2s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
    }

    .toggle-pwd:hover {
      background: #f0f3f8;
      transform: translateY(-50%) scale(1.05);
      color: #E21C2A;
    }

    /* Force meter */
    .strength-meter {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .strength-bar-container {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .strength-bar {
      height: 100%;
      width: 0%;
      transition: width 0.3s ease, background 0.3s;
    }

    .strength-bar.weak {
      width: 33%;
      background: #E21C2A;
    }
    .strength-bar.medium {
      width: 66%;
      background: #f59e0b;
    }
    .strength-bar.strong {
      width: 100%;
      background: #10b981;
    }

    .strength-text {
      font-size: 0.7rem;
      font-weight: 600;
      min-width: 50px;
      text-align: right;
      color: #334155;
    }

    .error-msg {
      font-size: 0.7rem;
      color: #E21C2A;
      margin-top: 6px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: shake 0.25s ease;
    }

    @keyframes shake {
      0%,100%{ transform: translateX(0); }
      25%{ transform: translateX(-4px); }
      75%{ transform: translateX(4px); }
    }

    /* Alerts */
    .alert-success, .alert-error {
      margin: 1rem 0;
      padding: 0.75rem 1rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      animation: fadeSlide 0.3s;
    }

    .alert-success {
      background: #e6f7e6;
      border-left: 5px solid #2e7d32;
      color: #1e5420;
    }

    .alert-error {
      background: #fff5f5;
      border-left: 5px solid #E21C2A;
      color: #b91c2c;
    }

    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .alert-icon {
      font-size: 1rem;
    }

    /* Submit button */
    .submit-btn {
      width: 100%;
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      border-radius: 60px;
      padding: 14px;
      color: white;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 10px 22px rgba(31, 46, 90, 0.35);
      position: relative;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transition: left 0.55s ease;
    }

    .submit-btn:hover:not(:disabled)::before {
      left: 100%;
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-2px);
      box-shadow: 0 16px 28px rgba(226, 28, 42, 0.4);
    }

    .submit-btn:active {
      transform: translateY(1px);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .btn-icon {
      transition: transform 0.2s;
    }
    .submit-btn:hover:not(:disabled) .btn-icon {
      transform: translateX(5px);
    }

    .loader {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 1.5rem;
      text-align: center;
      width: 100%;
      justify-content: center;
      color: #1F2E5A;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #E21C2A;
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 520px) {
      .reset-card {
        padding: 1.5rem;
      }
      h2 {
        font-size: 1.5rem;
      }
      input, .submit-btn {
        padding: 12px 16px;
      }
      .strength-meter {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .strength-text {
        text-align: left;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token = '';
  message = '';
  errorMessage = '';
  isSubmitting = false;

  // UI helpers
  newPwdFocused = false;
  confirmPwdFocused = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = this.translate.instant('RESET_PASSWORD.MISSING_TOKEN');
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPwd = group.get('newPassword')?.value;
    const confirmPwd = group.get('confirmPassword')?.value;
    return newPwd === confirmPwd ? null : { mismatch: true };
  }

  getPasswordStrengthClass(): string {
    const pwd = this.resetForm.get('newPassword')?.value || '';
    const strength = this.checkStrength(pwd);
    if (strength === 'weak') return 'weak';
    if (strength === 'medium') return 'medium';
    if (strength === 'strong') return 'strong';
    return '';
  }

  getPasswordStrengthText(): string {
    const pwd = this.resetForm.get('newPassword')?.value || '';
    const strength = this.checkStrength(pwd);
    if (strength === 'weak') return this.translate.instant('RESET_PASSWORD.STRENGTH_WEAK');
    if (strength === 'medium') return this.translate.instant('RESET_PASSWORD.STRENGTH_MEDIUM');
    if (strength === 'strong') return this.translate.instant('RESET_PASSWORD.STRENGTH_STRONG');
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

  onSubmit(): void {
    if (this.resetForm.invalid || this.isSubmitting || !this.token) {
      if (this.resetForm.invalid) {
        this.resetForm.markAllAsTouched();
      }
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.message = '';

    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: () => {
        this.message = this.translate.instant('RESET_PASSWORD.SUCCESS_MESSAGE');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || this.translate.instant('RESET_PASSWORD.ERROR_MESSAGE');
      }
    });
  }
}