import { Component, OnInit, OnDestroy, LOCALE_ID, ChangeDetectorRef, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemandeService } from '../../core/services/demande.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router'; // ← Import ajouté

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard-container">
      <!-- Animated Background Orbs -->
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-mesh"></div>

      <div class="dashboard-header">
        <div class="header-left">
          <div class="title-glow"></div>
          <h1 class="dashboard-title">{{ 'DASHBOARD.TITLE' | translate }}</h1>
          <p class="dashboard-subtitle">{{ 'DASHBOARD.SUBTITLE' | translate }}</p>
          <div class="header-accent-line"></div>
        </div>
        <div class="header-right">
          <div class="date-badge">
            <span class="date-pulse"></span>
            <span class="date-icon">📅</span>
            <span class="date-text">{{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <div class="metrics-grid">
        <!-- Carte En attente -->
        <div class="metric-card pending-card anim-delay-1" (click)="goToDemandesWithStatut('PENDING')">
          <div class="card-shine"></div>
          <div class="metric-glow pending-glow"></div>
          <div class="metric-border-gradient pending-border"></div>
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="icon-ring"></div>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ 'DASHBOARD.PENDING' | translate }}</span>
            <div class="metric-value">{{ stats.pending }}</div>
            <div class="metric-trend"><span class="trend-badge">{{ 'DASHBOARD.PENDING_TREND' | translate }}</span></div>
          </div>
          <div class="metric-bg-icon">⏳</div>
        </div>

        <!-- Carte Approuvées -->
        <div class="metric-card approved-card anim-delay-2" (click)="goToDemandesWithStatut('APPROVED')">
          <div class="card-shine"></div>
          <div class="metric-glow approved-glow"></div>
          <div class="metric-border-gradient approved-border"></div>
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div class="icon-ring"></div>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ 'DASHBOARD.APPROVED' | translate }}</span>
            <div class="metric-value">{{ stats.approved }}</div>
            <div class="metric-trend"><span class="trend-badge success">{{ 'DASHBOARD.APPROVED_TREND' | translate }}</span></div>
          </div>
          <div class="metric-bg-icon">✓</div>
        </div>

        <!-- Carte Rejetées -->
        <div class="metric-card rejected-card anim-delay-3" (click)="goToDemandesWithStatut('REJECTED')">
          <div class="card-shine"></div>
          <div class="metric-glow rejected-glow"></div>
          <div class="metric-border-gradient rejected-border"></div>
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div class="icon-ring"></div>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ 'DASHBOARD.REJECTED' | translate }}</span>
            <div class="metric-value">{{ stats.rejected }}</div>
            <div class="metric-trend"><span class="trend-badge rejected">{{ 'DASHBOARD.REJECTED_TREND' | translate }}</span></div>
          </div>
          <div class="metric-bg-icon">✕</div>
        </div>

        <!-- Carte Total (sans navigation) -->
        <div class="metric-card total-card anim-delay-4">
          <div class="card-shine"></div>
          <div class="metric-glow total-glow"></div>
          <div class="metric-border-gradient total-border"></div>
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12H15M12 9V15M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="icon-ring"></div>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ 'DASHBOARD.TOTAL' | translate }}</span>
            <div class="metric-value">{{ totalDemandes }}</div>
            <div class="metric-trend"><span class="trend-badge">{{ 'DASHBOARD.TOTAL_TREND' | translate }}</span></div>
          </div>
          <div class="metric-bg-icon">Σ</div>
        </div>

        <!-- Carte personnelle (Approuvées par moi) -->
        <div class="metric-card personal-card anim-delay-5" (click)="goToDemandesWithMyAction('APPROVE')">
          <div class="card-shine"></div>
          <div class="metric-glow personal-glow"></div>
          <div class="metric-border-gradient personal-border"></div>
          <div class="metric-icon personal-icon">
            <span>✅</span>
            <div class="icon-ring"></div>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ 'DASHBOARD.APPROVED_BY_ME' | translate }}</span>
            <div class="metric-value">{{ myStats.approved }}</div>
            <div class="metric-trend"><span class="trend-badge personal-badge">{{ 'DASHBOARD.MY_ACTIONS' | translate }}</span></div>
          </div>
          <div class="metric-bg-icon">★</div>
        </div>
      </div>

      <div class="dashboard-charts">
        <div class="chart-row two-columns">
          <div class="chart-card anim-delay-6">
            <div class="chart-shine"></div>
            <div class="chart-card-header">
              <div class="chart-title-accent"></div>
              <h3 class="chart-card-title">{{ 'DASHBOARD.STATUS_DISTRIBUTION' | translate }}</h3>
              <p class="chart-card-subtitle">{{ 'DASHBOARD.VALIDATION_BAROMETER' | translate }}</p>
            </div>
            <div class="chart-body" *ngIf="barChartData.length">
              <ngx-charts-bar-vertical
                [view]="chartView"
                [results]="barChartData"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [xAxisLabel]="axisLabels.xAxis"
                [yAxisLabel]="axisLabels.yAxis"
                [scheme]="colorScheme"
                [gradient]="true"
                [showGridLines]="true"
                [roundEdges]="true"
                [animations]="true">
              </ngx-charts-bar-vertical>
            </div>
            <div class="empty-chart" *ngIf="!barChartData.length">
              <div class="loading-orb"></div>
              {{ 'DASHBOARD.LOADING' | translate }}
            </div>
          </div>
          <div class="chart-card anim-delay-7">
            <div class="chart-shine"></div>
            <div class="chart-card-header">
              <div class="chart-title-accent accent-red"></div>
              <h3 class="chart-card-title">{{ 'DASHBOARD.CIRCULAR_CHART' | translate }}</h3>
              <p class="chart-card-subtitle">{{ 'DASHBOARD.STATUS_SHARES' | translate }}</p>
            </div>
            <div class="chart-body" *ngIf="donutData.length">
              <ngx-charts-pie-chart
                [view]="chartView"
                [results]="donutData"
                [scheme]="colorScheme"
                [gradient]="true"
                [labels]="true"
                [doughnut]="true"
                [arcWidth]="0.4"
                [animations]="true">
              </ngx-charts-pie-chart>
            </div>
            <div class="empty-chart" *ngIf="!donutData.length">
              <div class="loading-orb"></div>
              {{ 'DASHBOARD.LOADING' | translate }}
            </div>
          </div>
        </div>
        <div class="chart-row full-width">
          <div class="chart-card chart-card-full anim-delay-8">
            <div class="chart-shine"></div>
            <div class="chart-card-header">
              <div class="chart-title-accent accent-green"></div>
              <h3 class="chart-card-title">{{ 'DASHBOARD.MY_VALIDATIONS' | translate }}</h3>
              <p class="chart-card-subtitle">{{ 'DASHBOARD.MY_VALIDATIONS_SUBTITLE' | translate }}</p>
            </div>
            <div class="chart-body" *ngIf="personalChartData.length">
              <ngx-charts-pie-chart
                [view]="chartView"
                [results]="personalChartData"
                [scheme]="personalColorScheme"
                [gradient]="true"
                [labels]="true"
                [doughnut]="false"
                [animations]="true">
              </ngx-charts-pie-chart>
            </div>
            <div class="empty-chart" *ngIf="!personalChartData.length">
              <div class="loading-orb"></div>
              <p>{{ 'DASHBOARD.LOADING_PERSONAL' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX DASHBOARD ========== */

    .dashboard-container {
      --bg-container: radial-gradient(circle at 10% 20%, #f8fafc 0%, #eef2f6 100%);
      --card-bg: rgba(255, 255, 255, 0.72);
      --chart-card-bg: rgba(255, 255, 255, 0.78);
      --border-light: rgba(31, 46, 90, 0.07);
      --text-primary: #0f172a;
      --text-secondary: #5b6e8c;
      --text-muted: #9aa9bf;
      --divider-color: rgba(31, 46, 90, 0.06);
      --shadow-sm: 0 8px 20px rgba(0,0,0,0.02);
      --shadow-md: 0 12px 30px rgba(0,0,0,0.04);
      --shadow-hover: 0 24px 48px -12px rgba(31,46,90,0.12);
      --orb-opacity: 0.07;
      --mesh-opacity: 0.03;
      --glow-blue: rgba(31, 46, 90, 0.15);
      --glow-green: rgba(34, 197, 94, 0.12);
      --glow-red: rgba(226, 28, 42, 0.10);
      --glow-amber: rgba(245, 158, 11, 0.10);
      --glow-slate: rgba(100, 116, 139, 0.08);
    }

    :host-context(.dark-theme) .dashboard-container {
      --bg-container: radial-gradient(circle at 10% 20%, #0f172a 0%, #1e293b 100%);
      --card-bg: rgba(30, 41, 59, 0.55);
      --chart-card-bg: rgba(30, 41, 59, 0.50);
      --border-light: rgba(255, 255, 255, 0.06);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --divider-color: rgba(255, 255, 255, 0.04);
      --shadow-sm: 0 8px 20px rgba(0,0,0,0.2);
      --shadow-md: 0 12px 30px rgba(0,0,0,0.25);
      --shadow-hover: 0 24px 48px -12px rgba(0,0,0,0.4);
      --orb-opacity: 0.12;
      --mesh-opacity: 0.04;
      --glow-blue: rgba(31, 46, 90, 0.4);
      --glow-green: rgba(34, 197, 94, 0.3);
      --glow-red: rgba(226, 28, 42, 0.3);
      --glow-amber: rgba(245, 158, 11, 0.25);
      --glow-slate: rgba(100, 116, 139, 0.2);
    }

    .dashboard-container {
      padding: 2.5rem;
      max-width: 1440px;
      margin: 0 auto;
      background: var(--bg-container);
      border-radius: 48px;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
      transition: background 0.5s ease, box-shadow 0.5s ease;
      position: relative;
      overflow: hidden;
    }

    /* ===== ANIMATED BACKGROUND ===== */
    .bg-mesh {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--border-light) 1px, transparent 1px),
        linear-gradient(90deg, var(--border-light) 1px, transparent 1px);
      background-size: 60px 60px;
      opacity: var(--mesh-opacity);
      animation: meshFloat 20s linear infinite;
      pointer-events: none;
      border-radius: 48px;
    }
    @keyframes meshFloat {
      0% { transform: translate(0, 0); }
      100% { transform: translate(60px, 60px); }
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
      width: 400px;
      height: 400px;
      background: #1F2E5A;
      top: -100px;
      right: -80px;
      animation: orbFloat1 18s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 300px;
      height: 300px;
      background: #E21C2A;
      bottom: -50px;
      left: -60px;
      animation: orbFloat2 22s ease-in-out infinite;
    }
    .bg-orb-3 {
      width: 250px;
      height: 250px;
      background: #22c55e;
      top: 50%;
      left: 40%;
      animation: orbFloat3 16s ease-in-out infinite;
    }
    @keyframes orbFloat1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-40px, 30px) scale(1.1); }
      66% { transform: translate(20px, -20px) scale(0.95); }
    }
    @keyframes orbFloat2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -40px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    @keyframes orbFloat3 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-30px, -30px) scale(1.15); }
    }

    /* ===== HEADER ===== */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlideRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
      position: relative;
      z-index: 2;
      animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }

    .header-left {
      position: relative;
    }
    .title-glow {
      position: absolute;
      top: -20px;
      left: -20px;
      width: 200px;
      height: 80px;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      filter: blur(40px);
      opacity: 0.15;
      border-radius: 50%;
      pointer-events: none;
    }
    :host-context(.dark-theme) .title-glow {
      opacity: 0.25;
    }
    .header-accent-line {
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #1F2E5A, #E21C2A, transparent);
      border-radius: 4px;
      margin-top: 0.75rem;
      animation: accentGrow 1s ease-out 0.3s both;
    }
    @keyframes accentGrow {
      from { width: 0; opacity: 0; }
      to { width: 80px; opacity: 1; }
    }

    .dashboard-title {
      font-size: 2.4rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #1F2E5A 0%, #142559 40%, #E21C2A 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin: 0;
      position: relative;
      line-height: 1.15;
    }
    :host-context(.dark-theme) .dashboard-title {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 40%, #f87171 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    .dashboard-subtitle {
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 0.35rem;
      font-size: 0.95rem;
    }

    .date-badge {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      padding: 0.6rem 1.4rem;
      border-radius: 60px;
      display: flex;
      align-items: center;
      gap: 0.7rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;
    }
    .date-badge:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .date-pulse {
      position: absolute;
      top: 50%;
      left: 12px;
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      transform: translateY(-50%);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
      70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .date-icon { font-size: 1.1rem; }
    .date-text {
      font-weight: 700;
      color: #1F2E5A;
      text-transform: capitalize;
      font-size: 0.85rem;
    }
    :host-context(.dark-theme) .date-text {
      color: #e2e8f0;
    }

    /* ===== METRICS GRID ===== */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      position: relative;
      z-index: 2;
    }

    /* Staggered animations */
    .anim-delay-1 { animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.1s both; }
    .anim-delay-2 { animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.18s both; }
    .anim-delay-3 { animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.26s both; }
    .anim-delay-4 { animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.34s both; }
    .anim-delay-5 { animation: cardEnter 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.42s both; }
    .anim-delay-6 { animation: cardEnter 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.5s both; }
    .anim-delay-7 { animation: cardEnter 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.58s both; }
    .anim-delay-8 { animation: cardEnter 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) 0.66s both; }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    /* ===== METRIC CARD ===== */
    .metric-card {
      background: var(--card-bg);
      border-radius: 28px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(16px);
      cursor: pointer; /* ← Ajouté pour indiquer la cliquabilité */
    }

    /* Animated gradient border on hover */
    .metric-border-gradient {
      position: absolute;
      inset: 0;
      border-radius: 28px;
      padding: 1.5px;
      background: linear-gradient(135deg, transparent 30%, #1F2E5A 50%, #E21C2A 70%, transparent 100%);
      background-size: 300% 300%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      animation: borderShift 4s linear infinite;
    }
    @keyframes borderShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .metric-card:hover .metric-border-gradient {
      opacity: 1;
    }
    .pending-border {
      background: linear-gradient(135deg, transparent 30%, #1F2E5A 50%, #3b5998 70%, transparent 100%) !important;
      background-size: 300% 300% !important;
    }
    .approved-border {
      background: linear-gradient(135deg, transparent 30%, #22c55e 50%, #86efac 70%, transparent 100%) !important;
      background-size: 300% 300% !important;
    }
    .rejected-border {
      background: linear-gradient(135deg, transparent 30%, #E21C2A 50%, #f87171 70%, transparent 100%) !important;
      background-size: 300% 300% !important;
    }
    .total-border {
      background: linear-gradient(135deg, transparent 30%, #64748b 50%, #94a3b8 70%, transparent 100%) !important;
      background-size: 300% 300% !important;
    }
    .personal-border {
      background: linear-gradient(135deg, transparent 30%, #f59e0b 50%, #fbbf24 70%, transparent 100%) !important;
      background-size: 300% 300% !important;
    }

    /* Card shine effect on hover */
    .card-shine {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 40%,
        rgba(255, 255, 255, 0.06) 45%,
        rgba(255, 255, 255, 0.12) 50%,
        rgba(255, 255, 255, 0.06) 55%,
        transparent 60%
      );
      transform: translateX(-100%);
      transition: none;
      pointer-events: none;
    }
    .metric-card:hover .card-shine {
      animation: shineSlide 0.8s ease forwards;
    }
    @keyframes shineSlide {
      from { transform: translateX(-100%); }
      to { transform: translateX(100%); }
    }

    /* Glow behind card on hover */
    .metric-glow {
      position: absolute;
      bottom: -20px;
      right: -20px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }
    .metric-card:hover .metric-glow { opacity: 1; }
    .pending-glow { background: var(--glow-blue); }
    .approved-glow { background: var(--glow-green); }
    .rejected-glow { background: var(--glow-red); }
    .total-glow { background: var(--glow-slate); }
    .personal-glow { background: var(--glow-amber); }

    .metric-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: var(--shadow-hover);
      border-color: transparent;
    }
    :host-context(.dark-theme) .metric-card:hover {
      border-color: transparent;
    }

    /* Background icon (large watermark) */
    .metric-bg-icon {
      position: absolute;
      right: -5px;
      bottom: -10px;
      font-size: 5rem;
      font-weight: 900;
      opacity: 0.03;
      pointer-events: none;
      transition: opacity 0.4s ease;
      line-height: 1;
    }
    .metric-card:hover .metric-bg-icon {
      opacity: 0.07;
    }
    :host-context(.dark-theme) .metric-bg-icon {
      opacity: 0.04;
    }
    :host-context(.dark-theme) .metric-card:hover .metric-bg-icon {
      opacity: 0.08;
    }

    /* Icon container */
    .metric-icon {
      width: 56px;
      height: 56px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }
    .metric-icon svg { width: 26px; height: 26px; }
    .metric-card:hover .metric-icon {
      transform: scale(1.08) rotate(-3deg);
    }

    /* Animated ring around icon */
    .icon-ring {
      position: absolute;
      inset: -4px;
      border-radius: 24px;
      border: 2px solid transparent;
      opacity: 0;
      transition: all 0.4s ease;
    }
    .metric-card:hover .icon-ring {
      opacity: 1;
      animation: ringPulse 1.5s ease-in-out infinite;
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.08); opacity: 0.2; }
    }
    .pending-card .icon-ring { border-color: #1F2E5A; }
    .approved-card .icon-ring { border-color: #22c55e; }
    .rejected-card .icon-ring { border-color: #E21C2A; }
    .total-card .icon-ring { border-color: #64748b; }
    .personal-card .icon-ring { border-color: #f59e0b; }

    .personal-icon {
      font-size: 28px;
      background: rgba(245,158,11,0.12);
      color: #f59e0b;
    }
    .pending-card .metric-icon { background: rgba(31,46,90,0.10); color: #1F2E5A; }
    .approved-card .metric-icon { background: rgba(34,197,94,0.10); color: #22c55e; }
    .rejected-card .metric-icon { background: rgba(226,28,42,0.10); color: #E21C2A; }
    .total-card .metric-icon { background: rgba(100,116,139,0.10); color: #5b6e8c; }
    .personal-card .metric-icon { background: rgba(245,158,11,0.10); color: #f59e0b; }

    :host-context(.dark-theme) .pending-card .metric-icon { background: rgba(99,130,204,0.15); color: #8ba3d9; }
    :host-context(.dark-theme) .approved-card .metric-icon { background: rgba(34,197,94,0.15); color: #4ade80; }
    :host-context(.dark-theme) .rejected-card .metric-icon { background: rgba(226,28,42,0.15); color: #f87171; }
    :host-context(.dark-theme) .total-card .metric-icon { background: rgba(148,163,184,0.12); color: #94a3b8; }
    :host-context(.dark-theme) .personal-card .metric-icon { background: rgba(245,158,11,0.15); color: #fbbf24; }

    .metric-content { flex: 1; min-width: 0; }
    .metric-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      display: block;
    }
    .metric-value {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--text-primary);
      line-height: 1.1;
      margin-top: 0.2rem;
      letter-spacing: -0.02em;
    }
    .metric-trend { margin-top: 0.4rem; }
    .trend-badge {
      font-size: 0.62rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 30px;
      background: #f1f5f9;
      color: #334155;
      display: inline-block;
      letter-spacing: 0.02em;
      transition: all 0.3s ease;
    }
    :host-context(.dark-theme) .trend-badge {
      background: rgba(255,255,255,0.08);
      color: #cbd5e1;
    }
    .trend-badge.success { background: #dcfce7; color: #166534; }
    :host-context(.dark-theme) .trend-badge.success { background: #14532d; color: #4ade80; }
    .trend-badge.rejected { background: #fee2e2; color: #991b1b; }
    :host-context(.dark-theme) .trend-badge.rejected { background: #7f1d1d; color: #f87171; }
    .personal-badge { background: #fef3c7; color: #92400e; }
    :host-context(.dark-theme) .personal-badge { background: #78350f; color: #fbbf24; }

    /* ===== CHARTS SECTION ===== */
    .dashboard-charts {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-top: 0.5rem;
      position: relative;
      z-index: 2;
    }
    .chart-row.two-columns {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    .chart-row.full-width { display: block; }

    .chart-card {
      background: var(--chart-card-bg);
      border-radius: 32px;
      padding: 1.8rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-light);
      transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(16px);
    }

    /* Chart card shine */
    .chart-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.04) 50%,
        transparent 100%
      );
      pointer-events: none;
      transition: none;
    }
    .chart-card:hover .chart-shine {
      animation: chartShine 1.2s ease forwards;
    }
    @keyframes chartShine {
      from { left: -100%; }
      to { left: 200%; }
    }

    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: rgba(31,46,90,0.12);
    }
    :host-context(.dark-theme) .chart-card:hover {
      border-color: rgba(255,255,255,0.12);
    }

    .chart-card-header {
      margin-bottom: 1.2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--divider-color);
      position: relative;
    }
    .chart-title-accent {
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #1F2E5A, transparent);
      border-radius: 3px;
    }
    .chart-title-accent.accent-red {
      background: linear-gradient(90deg, #E21C2A, transparent);
    }
    .chart-title-accent.accent-green {
      background: linear-gradient(90deg, #22c55e, transparent);
    }
    .chart-card-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 0.2rem 0;
      letter-spacing: -0.01em;
    }
    .chart-card-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin: 0;
      font-weight: 500;
    }
    .chart-body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 380px;
    }
    .empty-chart {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Creative loading orb */
    .loading-orb {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      position: relative;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      animation: orbLoad 1.5s ease-in-out infinite;
    }
    :host-context(.dark-theme) .loading-orb {
      background: linear-gradient(135deg, #E21C2A, #f87171);
    }
    .loading-orb::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: #1F2E5A;
      border-right-color: #E21C2A;
      animation: orbRingSpin 1.5s linear infinite;
    }
    @keyframes orbLoad {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(0.85); }
    }
    @keyframes orbRingSpin {
      to { transform: rotate(360deg); }
    }

    /* ===== NGX-CHARTS DARK MODE OVERRIDES – ALL TEXT WHITE ===== */
    :host-context(.dark-theme) .dashboard-container .ngx-charts {
      color: #f1f5f9;
    }
    /* All text elements inside charts forced to white */
    :host-context(.dark-theme) .dashboard-container .ngx-charts text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .axis .tick line,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .axis .axis-label,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .axis text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .tick text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .label,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .legend-label-text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .pie-label text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .pie-label .label-text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .bar-label text,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .tooltip-content,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .tooltip-caret,
    :host-context(.dark-theme) .dashboard-container .ngx-charts .legend-title-text {
      fill: #ffffff !important;
      stroke: #ffffff !important;
      color: #ffffff !important;
    }
    :host-context(.dark-theme) .dashboard-container .ngx-charts .gridline-path {
      stroke: rgba(255, 255, 255, 0.12) !important;
    }
    /* Tooltip background (light) – optional, but we keep readable */
    :host-context(.dark-theme) .dashboard-container .ngx-charts .tooltip-anchor {
      fill: #ffffff;
    }
    :host-context(.dark-theme) .dashboard-container .ngx-charts-tooltip {
      background: #1e293b !important;
      color: #f1f5f9 !important;
      border: 1px solid #475569 !important;
    }
    :host-context(.dark-theme) .dashboard-container .ngx-charts-tooltip .tooltip-label {
      color: #f1f5f9 !important;
    }
    /* Legend text inside items */
    :host-context(.dark-theme) .dashboard-container .ngx-charts .legend-label-text {
      color: #ffffff !important;
    }
    /* X and Y axis values */
    :host-context(.dark-theme) ::ng-deep .ngx-charts .axis text {
      fill: #ffffff !important;
    }

    /* Axis titles (Status, Count) */
    :host-context(.dark-theme) ::ng-deep .ngx-charts .axis-label {
      fill: #ffffff !important;
    }

    /* Legend text */
    :host-context(.dark-theme) ::ng-deep .ngx-charts .legend-label-text {
      fill: #ffffff !important;
      color: #ffffff !important;
    }

    /* Pie chart labels */
    :host-context(.dark-theme) ::ng-deep .ngx-charts .pie-label text {
      fill: #ffffff !important;
    }

    /* Grid lines */
    :host-context(.dark-theme) ::ng-deep .ngx-charts .gridline-path {
      stroke: rgba(255,255,255,0.15) !important;
    }
        /* ===== FORCE ALL CHART TEXT TO WHITE IN DARK MODE ===== */
    :host-context(.dark-theme) ::ng-deep .ngx-charts text {
      fill: #ffffff !important;
    }

    :host-context(.dark-theme) ::ng-deep .ngx-charts .pie-label text {
      fill: #ffffff !important;
    }

    :host-context(.dark-theme) ::ng-deep .ngx-charts .pie-label {
      fill: #ffffff !important;
      color: #ffffff !important;
    }

    :host-context(.dark-theme) ::ng-deep .ngx-charts .arc-label {
      fill: #ffffff !important;
    }

    :host-context(.dark-theme) ::ng-deep .ngx-charts .chart-legend .legend-label-text {
      fill: #ffffff !important;
      color: #ffffff !important;
    }

    :host-context(.dark-theme) ::ng-deep .ngx-charts .axis-label,
    :host-context(.dark-theme) ::ng-deep .ngx-charts .tick text,
    :host-context(.dark-theme) ::ng-deep .ngx-charts .label {
      fill: #ffffff !important;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .chart-row.two-columns { grid-template-columns: 1fr; gap: 1.5rem; }
      .chart-body { min-height: 320px; }
    }
    @media (max-width: 768px) {
      .dashboard-container { padding: 1.2rem; border-radius: 32px; }
      .metrics-grid { grid-template-columns: 1fr; gap: 1rem; }
      .metric-card { padding: 1.1rem; }
      .metric-value { font-size: 1.8rem; }
      .chart-body { min-height: 280px; }
      .dashboard-title { font-size: 1.8rem; }
      .bg-orb { display: none; }
    }
    @media (max-width: 480px) {
      .dashboard-container { padding: 1rem; border-radius: 24px; }
      .dashboard-title { font-size: 1.5rem; }
      .date-badge { padding: 0.4rem 1rem; }
      .chart-body { min-height: 240px; }
      .metric-bg-icon { font-size: 3.5rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = { pending: 0, approved: 0, rejected: 0 };
  totalDemandes = 0;
  barChartData: { name: string; value: number }[] = [];
  donutData: { name: string; value: number }[] = [];
  personalChartData: { name: string; value: number }[] = [];
  myStats = { approved: 0, rejected: 0 };
  currentDate = new Date();
  formattedDate = '';

  colorScheme = { domain: ['#1F2E5A', '#22c55e', '#E21C2A'] } as any;
  personalColorScheme = { domain: ['#22c55e', '#E21C2A'] } as any;

  chartView: [number, number] = [540, 360];
  axisLabels = { xAxis: '', yAxis: '' };

  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private demandeService: DemandeService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private router: Router // ← Injection du Router
  ) {}

  ngOnInit(): void {
    this.setChartDimensions();
    this.initResizeObserver();
    this.updateFormattedDate();
    this.updateAxisLabels();
    this.loadStats();
    this.loadPersonalStats();

    this.translate.onLangChange.subscribe(() => {
      this.updateFormattedDate();
      this.updateAxisLabels();
      this.updateChartLabels();
      this.updatePersonalChartLabels();
      this.cdr.detectChanges();
    });
  }

  private updateFormattedDate(): void {
    const lang = this.translate.currentLang || 'fr';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    this.formattedDate = new Intl.DateTimeFormat(lang, options).format(this.currentDate);
  }

  private updateAxisLabels(): void {
    this.axisLabels = {
      xAxis: this.translate.instant('COMMON.STATUS'),
      yAxis: this.translate.instant('COMMON.COUNT')
    };
  }

  private loadStats(): void {
    this.demandeService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.totalDemandes = this.stats.pending + this.stats.approved + this.stats.rejected;
        this.updateChartLabels();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur stats globales', err)
    });
  }

  private loadPersonalStats(): void {
    this.userService.getMyActionStats().subscribe({
      next: (data) => {
        this.myStats = data;
        this.updatePersonalChartLabels();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur stats personnelles', err)
    });
  }

  private updateChartLabels(): void {
    const translations = {
      pending: this.translate.instant('DASHBOARD.CHART_PENDING'),
      approved: this.translate.instant('DASHBOARD.CHART_APPROVED'),
      rejected: this.translate.instant('DASHBOARD.CHART_REJECTED')
    };
    this.barChartData = [
      { name: translations.pending, value: this.stats.pending },
      { name: translations.approved, value: this.stats.approved },
      { name: translations.rejected, value: this.stats.rejected }
    ];
    this.donutData = [...this.barChartData];
  }

  private updatePersonalChartLabels(): void {
    this.personalChartData = [
      { name: this.translate.instant('DASHBOARD.PERSONAL_APPROVED'), value: this.myStats.approved },
      { name: this.translate.instant('DASHBOARD.PERSONAL_REJECTED'), value: this.myStats.rejected }
    ];
  }

  // ========== MÉTHODES DE NAVIGATION ==========
  goToDemandesWithStatut(statut: string): void {
    this.router.navigate(['/demandes'], { queryParams: { statut } });
  }

  goToDemandesWithMyAction(myAction: string): void {
    this.router.navigate(['/demandes'], { queryParams: { myAction } });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private setChartDimensions(): void {
    const width = window.innerWidth;
    if (width < 640) this.chartView = [300, 220];
    else if (width < 1024) this.chartView = [420, 280];
    else this.chartView = [540, 360];
  }

  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.setChartDimensions();
      this.cdr.detectChanges();
    });
    this.resizeObserver.observe(document.body);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setChartDimensions();
    this.cdr.detectChanges();
  }
}