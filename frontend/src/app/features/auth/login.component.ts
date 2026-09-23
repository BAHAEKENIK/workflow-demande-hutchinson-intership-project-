import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe, LoaderComponent],
  template: `
    <div class="login-container">
      <!-- Fond avec image en ligne, flou maîtrisé -->
      <div class="bg-blur" style="background-image: url('/hutchinson.jpeg');"></div>
      <div class="bg-overlay"></div>
      <div class="animated-gradient"></div>

      <!-- Loader ultra pro max -->
      <app-loader *ngIf="showLoader" (completed)="onLoaderComplete()"></app-loader>

      <div class="login-card" *ngIf="!showLoader">
        <!-- Orbes flottants -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <!-- Marque Hutchinson (SVG) -->
        <div class="brand">
          <div class="logo-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-1.2380214 -1.2380214 357.6729128 43.7434228"
              class="logo"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Hutchinson"
            >
              <path
                d="m 350.15339,11.80675 0,1.49625 0.685,0 c 0.39125,0 0.67499,-0.0563 0.85124,-0.17125 0.18251,-0.1175 0.27,-0.30375 0.27,-0.55375 0,-0.26625 -0.0913,-0.46 -0.28,-0.58625 -0.1875,-0.12375 -0.48124,-0.185 -0.88999,-0.185 l -0.63625,0 z m -1.04001,-0.64375 1.86375,0 c 0.6725,0 1.185,0.11 1.53125,0.3275 0.3475,0.21625 0.52124,0.54125 0.52124,0.96625 0,0.3475 -0.095,0.63625 -0.28125,0.86375 -0.1875,0.2275 -0.45125,0.3775 -0.79875,0.45 l 1.08,2.15875 -1.16124,0 -0.9625,-1.99 -0.7525,0 0,1.99 -1.04,0 0,-4.76625 z m 1.765,-1.14875 c -0.50126,0 -0.96375,0.0863 -1.39625,0.25875 -0.43251,0.17625 -0.8175,0.43375 -1.16251,0.77125 -0.35624,0.3575 -0.63375,0.7625 -0.82499,1.20375 -0.19251,0.445 -0.28751,0.905 -0.28751,1.38375 0,0.4775 0.0913,0.9325 0.27501,1.36625 0.17999,0.43125 0.44499,0.8225 0.78749,1.16625 0.35001,0.3475 0.7475,0.61625 1.18875,0.8025 0.445,0.18625 0.89625,0.2775 1.36251,0.2775 0.50374,0 0.98124,-0.0888 1.43375,-0.2675 0.45249,-0.17875 0.85999,-0.4425 1.21875,-0.78875 0.3475,-0.3325 0.61124,-0.71 0.79499,-1.14 0.19,-0.42875 0.28251,-0.88125 0.28251,-1.36 0,-0.5075 -0.0888,-0.9825 -0.26499,-1.4175 -0.17377,-0.43875 -0.43751,-0.83125 -0.78125,-1.17875 -0.36375,-0.35125 -0.76376,-0.62 -1.20751,-0.8025 -0.445,-0.1825 -0.91749,-0.275 -1.41875,-0.275 m -0.004,-0.63625 c 0.59249,0 1.15499,0.105 1.68125,0.32125 0.5275,0.2125 0.99875,0.52875 1.41001,0.9475 0.39875,0.3975 0.70875,0.85375 0.91625,1.36125 0.20999,0.50625 0.31499,1.0425 0.31499,1.61625 0,0.585 -0.10624,1.135 -0.3225,1.64875 -0.21625,0.5175 -0.52999,0.9675 -0.94375,1.36375 -0.42125,0.40375 -0.89374,0.7125 -1.41875,0.925 -0.52499,0.215 -1.06874,0.3225 -1.6375,0.3225 -0.57375,0 -1.12374,-0.11 -1.65125,-0.33125 -0.52749,-0.2225 -0.99624,-0.5375 -1.40875,-0.95125 -0.40875,-0.40625 -0.72,-0.865 -0.93249,-1.37375 -0.21626,-0.50875 -0.3225,-1.045 -0.3225,-1.60375 0,-0.5625 0.10999,-1.1075 0.33499,-1.6325 0.22375,-0.525 0.54625,-0.99375 0.96501,-1.4075 0.40625,-0.4 0.86249,-0.7 1.36999,-0.9025 0.50875,-0.205 1.05751,-0.30375 1.645,-0.30375"
                fill="#142559"
              />
              <path
                d="m 284.01238,20.36463 c -1.37749,-1.02 -3.51499,-1.72375 -6.36,-2.09625 -0.99375,-0.12375 -3.005,-0.28375 -6.14375,-0.48875 -2.0675,-0.12 -3.5725,-0.34 -4.47249,-0.655 -1.18127,-0.405 -1.755,-1.015 -1.755,-1.8625 0,-0.81625 0.54,-1.44875 1.65374,-1.9325 1.1725,-0.50875 2.90625,-0.765 5.145,-0.765 3.4925,0 8.19375,0.5975 12.20875,2.41875 0.115,0.0525 0.205,-0.0463 0.205,-0.225 l 0,-3.73 c 0,-0.18 0.0112,-0.31875 -0.085,-0.36375 -2.555,-1.1725 -8.19,-1.90625 -12.04875,-1.90625 -3.625,0 -6.48125,0.61875 -8.49,1.84125 -2.0525,1.24875 -3.0925,2.9825 -3.0925,5.14875 0,2.12125 0.93001,3.655 2.75751,4.55625 1.51625,0.745 4.16874,1.24625 7.87875,1.4925 4.1375,0.26125 6.69874,0.51375 7.62,0.75 1.68999,0.435 2.50749,1.2625 2.50749,2.52875 0,1.08875 -0.62624,1.9325 -1.91249,2.5775 -1.39876,0.685 -3.42875,1.07375 -5.97,1.035 -3.70501,-0.0588 -8.48375,-0.89375 -12.41501,-3.325 -0.12375,-0.0763 -0.22125,0.002 -0.22125,0.18125 l 0,3.4525 c 0,0.17875 -0.0163,0.33875 0.065,0.3675 0.04,0.015 4.135,3.095 12.54,3.095 3.97375,0 7.07501,-0.65875 9.21625,-1.95875 2.18625,-1.33375 3.2975,-3.23875 3.2975,-5.66875 0,-1.91625 -0.72125,-3.41875 -2.12875,-4.4675 M 339.17225,9.30675 c -0.17874,0 -0.32499,0.14625 -0.32499,0.32625 l 0.055,16.4325 c 10e-4,0.17875 -0.0925,0.21375 -0.20875,0.0763 L 324.78601,9.6493 c -0.11624,-0.13625 -0.22875,-0.27 -0.25125,-0.295 -0.0237,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37375,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.32625 l 0,21.98375 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.6375,0 c 0.17874,0 0.32499,-0.14625 0.32499,-0.325 l 0,-16.99875 c 0,-0.18 0.0962,-0.215 0.21251,-0.0788 l 14.69499,17.15625 c 0.11626,0.13625 0.35875,0.24625 0.5375,0.24625 l 3.61001,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.98375 c 0,-0.18 -0.14625,-0.32625 -0.325,-0.32625 l -3.63751,0 z m -29.84149,17.09938 c -1.84625,1.49375 -3.7775,2.25125 -6.875,2.25125 -3.115,0 -5.065,-0.75375 -6.92125,-2.23875 -1.83875,-1.4675 -2.77125,-3.42875 -2.77125,-5.82375 0,-2.315 0.95375,-4.2525 2.83375,-5.76375 1.8975,-1.52375 3.825,-2.3 6.85875,-2.3 2.77499,0 4.5525,0.68125 6.41,2.02 2.13875,1.53875 3.22375,3.57125 3.22375,6.04375 0,2.37625 -0.9275,4.3325 -2.75875,5.81125 m 2.53625,-14.75625 c -2.67875,-2.01875 -5.4625,-3.04375 -9.41125,-3.04375 -3.92125,0 -6.71875,1.02375 -9.4375,3.04375 -3.11625,2.32375 -4.695,5.3325 -4.695,8.945 0,3.67375 1.55874,6.695 4.6325,8.975 2.68124,2 5.4975,3.01125 9.5,3.01125 3.96375,0 6.76375,-1.0025 9.44,-2.98125 3.07375,-2.28125 4.63249,-5.3125 4.63249,-9.005 0,-3.6125 -1.56999,-6.62125 -4.66124,-8.945 M 253.125,26.06575 c 0,0.17875 -0.0925,0.2125 -0.20875,0.0762 L 239.005,9.64945 c -0.115,-0.13625 -0.22749,-0.27 -0.25,-0.295 -0.0238,-0.0263 -0.18875,-0.0475 -0.36874,-0.0475 l -4.37251,0 c -0.17875,0 -0.32499,0.14625 -0.32499,0.32625 l 0,21.98375 c 0,0.17875 0.14625,0.325 0.32499,0.325 l 3.63875,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-17 c 0,-0.17875 0.095,-0.215 0.21125,-0.0775 l 14.69625,17.155 c 0.11625,0.1375 0.35875,0.2475 0.5375,0.2475 l 3.60625,0 c 0.17875,0 0.32625,-0.14625 0.32625,-0.325 l 0,-21.98375 c 0,-0.18 -0.1475,-0.32625 -0.32625,-0.32625 l -3.63875,0 c -0.17875,0 -0.325,0.14625 -0.32375,0.32625 l 0.0588,16.4325 z m -28.38462,5.551 c 0,0.17875 0.14625,0.32625 0.325,0.32625 l 3.63625,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-21.98375 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -3.63625,0 c -0.17875,0 -0.325,0.1475 -0.325,0.32625 l 0,21.98375 z M 215.79413,17.35 c 0,0.17875 -0.14625,0.32625 -0.32624,0.32625 l -13.23876,0 c -0.17874,0 -0.32499,-0.1475 -0.32499,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.14626,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.32625,0.14625 -0.32625,0.325 l 0,21.985 c 0,0.17875 0.1475,0.325 0.32625,0.325 l 3.635,0 c 0.17874,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.32499,-0.325 l 13.23876,0 c 0.17999,0 0.32624,0.14625 0.32624,0.325 l 0,9.75125 c 0,0.17875 0.145,0.325 0.325,0.325 l 3.63375,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63375,0 c -0.18,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z m -41.94975,-2.53537 c 1.88875,-1.515 4.375,-2.2825 7.3875,-2.2825 3.9875,0 7.04001,1.105 9.3875,3.5425 0.0888,0.0913 0.2,0.0175 0.37,-0.0412 l 3.31,-1.165 c 0.16875,-0.06 0.25,-0.17875 0.18375,-0.265 -3.04374,-3.9975 -7.5725,-5.9975 -13.25125,-5.9975 -3.945,0 -7.3025,1.0125 -9.98125,3.0125 -3.09625,2.3025 -4.66499,5.31125 -4.66499,8.94375 0,3.695 1.54875,6.7275 4.60249,9.0075 2.65751,1.97625 6.03751,2.9825 10.04375,2.9825 2.85375,0 5.33375,-0.4425 7.39501,-1.25375 3.42499,-1.345 5.62374,-4.14625 5.6875,-4.21875 0.0637,-0.0738 -0.0112,-0.205 -0.16876,-0.29 l -3.12124,-1.70375 c -0.15875,-0.085 -0.27126,-0.17625 -0.36251,-0.0738 -1.81124,2.035 -5.26625,3.7225 -9.21249,3.6175 -3.19876,-0.0875 -5.76751,-0.755 -7.635,-2.24 -1.85126,-1.47 -2.78751,-3.43125 -2.78751,-5.8275 0,-2.3125 0.94625,-4.24875 2.8175,-5.7475 m -7.60588,-5.182 c 0,-0.17875 -0.14625,-0.32625 -0.325,-0.32625 l -22.65625,0 c -0.18,0 -0.32624,0.1475 -0.32624,0.32625 l 0,3.21375 c 0,0.18 0.14625,0.325 0.32624,0.325 l 8.86001,0 c 0.17875,0 0.32499,0.1475 0.32499,0.32625 l 0,18.11875 c 0,0.17875 0.14626,0.32625 0.325,0.32625 l 3.63375,0 c 0.17875,0 0.325,-0.1475 0.325,-0.32625 l 0,-18.11875 c 0,-0.17875 0.14626,-0.32625 0.325,-0.32625 l 8.8625,0 c 0.17875,0 0.325,-0.145 0.325,-0.325 l 0,-3.21375 z m -31.27712,13.68275 c 0.0738,1.9225 -0.6975,3.17375 -2.13375,4.04125 -1.32375,0.79875 -2.83749,1.33125 -5.92374,1.33125 -3.08376,0 -4.61251,-0.5325 -5.95376,-1.33125 -1.45875,-0.8675 -2.24375,-2.25 -2.165,-4.04125 l 0,-13.6825 c 0,-0.18 -0.1475,-0.32625 -0.325,-0.32625 l -3.6375,0 c -0.17875,0 -0.32375,0.14625 -0.32375,0.32625 l 0,14.56625 c -0.11625,2.53125 1.18876,4.655 3.53751,6.14625 2.52374,1.59 5.17249,2.26875 8.86749,2.26875 3.69625,0 6.3325,-0.68 8.80625,-2.26875 2.35,-1.47125 3.61376,-3.435 3.54001,-6.14625 l 0,-14.56625 c 0,-0.18 -0.14626,-0.32625 -0.32501,-0.32625 l -3.63874,0 c -0.17876,0 -0.325,0.14625 -0.325,0.32625 l 0,13.6825 z M 106.27963,17.35 c 0,0.17875 -0.14625,0.32625 -0.32499,0.32625 l -13.24001,0 c -0.17875,0 -0.325,-0.1475 -0.325,-0.32625 l 0,-7.7175 c 0,-0.17875 -0.145,-0.325 -0.325,-0.325 l -3.635,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,21.985 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.635,0 c 0.18,0 0.325,-0.14625 0.325,-0.325 l 0,-9.75125 c 0,-0.17875 0.14625,-0.325 0.325,-0.325 l 13.24001,0 c 0.17874,0 0.32499,0.14625 0.32499,0.325 l 0,9.75125 c 0,0.17875 0.14625,0.325 0.325,0.325 l 3.63501,0 c 0.17875,0 0.325,-0.14625 0.325,-0.325 l 0,-21.985 c 0,-0.17875 -0.14625,-0.325 -0.325,-0.325 l -3.63501,0 c -0.17875,0 -0.325,0.14625 -0.325,0.325 l 0,7.7175 z"
                fill="#142559"
              />
              <path d="m 71.649,41.26738 1.14626,0 0,-41.265 -1.14626,0 0,41.265 z" fill="#142559" />
              <path
                d="m 27.15738,40.08775 c 2.0225,1.69 5.26,1.4575 7.27625,-0.5 L 54.28238,19.0065 c 1.30375,-1.5625 1.84875,-6.935 -5.055,-6.95125 -0.135,0 -16.035,0.006 -16.035,0.006 -1.23375,0 -3.09625,0.84375 -4.05875,1.845 l -4.0175,4.18 c -0.45375,0.4675 -0.57125,0.61 -0.485,0.80625 0.1425,0.15125 0.18125,0.12125 0.5925,0.12125 l 12.1325,0.006 c 4.02625,-0.085 4.255,0.20625 4.5225,0.8575 0.15625,0.38125 0.0588,1.24375 -0.975,2.3 l -7.87125,8.0075 c -0.67,0.6775 -1.605,1.06875 -2.57,1.06875 -0.90375,-10e-4 -1.76,-0.3325 -2.405,-0.93625 l -7.17125,-6.645 c -0.66875,-0.6225 -1.0575,-1.475 -1.095,-2.39875 -0.0337,-0.94375 0.3025,-1.84875 0.94625,-2.5375 l 8.33125,-8.95115 c 1.19875,-1.29 3.39375,-2.30125 4.995,-2.30125 l 18.0875,0.009 c 1.24875,0.002 3.15625,-0.795 4.16875,-1.74 l 5.32375,-4.96875 c 0.35125,-0.375 0.5475,-0.63 0.50625,-0.69875 C 62.09858,1e-4 61.97238,0.0126 61.58863,0.0138 L 29.75238,0 c -1.23,0 -3.0575,0.87125 -3.995,1.905 l -15.91,18.0475 c -0.8225,0.9075 -0.78,2.29875 0.09,3.1075 l 17.22,17.0275 z M 0.59375,12.0755 C 0.2,12.0765 0,12.0755 0,12.19175 0,12.358 0.0438,12.4305 0.51876,12.90425 l 4.88499,4.7425 c 0.81375,0.79 2.2175,0.71625 2.985,-0.15375 l 3.845,-4.355 c 0.54375,-0.6975 0.5,-0.765 0.45375,-0.8975 -0.0575,-0.165 -0.20375,-0.16 -0.62,-0.16 L 0.59375,12.0755 z"
                fill="#E21C2A"
              />
            </svg>
          </div>
          <div class="brand-divider"></div>
          <p class="tagline">{{ 'LOGIN.TAGLINE' | translate }}</p>
        </div>

        <!-- Formulaire de connexion -->
        <div class="form-container">
          <h2 class="form-title">{{ 'LOGIN.TITLE' | translate }}</h2>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <!-- Identifiant -->
            <div class="input-group" [class.focused]="usernameFocused">
              <label for="username">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
                {{ 'LOGIN.USERNAME_LABEL' | translate }}
              </label>
              <input
                id="username"
                type="text"
                formControlName="username"
                [placeholder]="'LOGIN.USERNAME_PLACEHOLDER' | translate"
                (focus)="usernameFocused = true"
                (blur)="usernameFocused = false"
                autocomplete="username"
              />
              <span class="error-msg" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                ⚠️ {{ 'LOGIN.USERNAME_REQUIRED' | translate }}
              </span>
            </div>

            <!-- Mot de passe (avec bouton créatif SVG cadenas) -->
            <div class="input-group" [class.focused]="passwordFocused">
              <label for="password">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                  <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                </svg>
                {{ 'LOGIN.PASSWORD_LABEL' | translate }}
              </label>
              <div class="password-wrapper">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  [placeholder]="'LOGIN.PASSWORD_PLACEHOLDER' | translate"
                  (focus)="passwordFocused = true"
                  (blur)="passwordFocused = false"
                  autocomplete="current-password"
                />
                <!-- Bouton créatif : cadenas ouvert/fermé (SVG) -->
                <button type="button" class="toggle-pwd" (click)="showPassword = !showPassword" [attr.title]="showPassword ? 'Masquer' : 'Afficher'">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" width="18" height="18">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                    <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" width="18" height="18">
                    <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                    <path d="M12 13V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M2 12 L22 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.5"/>
                  </svg>
                </button>
              </div>
              <span class="error-msg" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                ⚠️ {{ 'LOGIN.PASSWORD_REQUIRED' | translate }}
              </span>
            </div>

            <div class="forgot-row">
              <a routerLink="/forgot-password" class="forgot-link">{{ 'LOGIN.FORGOT_PASSWORD' | translate }}</a>
            </div>

            <!-- Message d'erreur (traduit) -->
            <div class="alert-error" *ngIf="errorMessage">
              <span class="error-icon">⛔</span> {{ errorMessage | translate }}
            </div>

            <!-- Bouton de connexion -->
            <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || isSubmitting">
              <span class="btn-text">{{ isSubmitting ? ('LOGIN.LOGGING_IN' | translate) : ('LOGIN.LOGIN_BUTTON' | translate) }}</span>
              <span class="btn-icon" *ngIf="!isSubmitting">→</span>
              <div class="loader" *ngIf="isSubmitting"></div>
            </button>
          </form>

          <!-- Footer -->
          <div class="footer-note">
            <span class="dot"></span> {{ 'LOGIN.FOOTER_TEXT' | translate }}    © {{ currentYear }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== ULTRA PRO MAX STYLES ===== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .login-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .bg-blur {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center 30%;
      filter: blur(6px) brightness(0.85);
      transform: scale(1.05);
      z-index: 0;
      transition: filter 0.3s ease;
    }

    .bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 20%, rgba(31, 46, 90, 0.4), rgba(0, 0, 0, 0.5));
      z-index: 1;
    }

    .animated-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(125deg, rgba(226, 28, 42, 0.15) 0%, rgba(31, 46, 90, 0.1) 100%);
      z-index: 1;
      animation: shiftGradient 14s infinite alternate ease-in-out;
    }

    @keyframes shiftGradient {
      0% { background-position: 0% 30%; opacity: 0.6; }
      100% { background-position: 100% 70%; opacity: 1; }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(226, 28, 42, 0.25), rgba(31, 46, 90, 0.08));
      filter: blur(55px);
      z-index: 1;
      pointer-events: none;
      animation: float 20s infinite alternate ease-in-out;
    }

    .orb-1 {
      width: 340px;
      height: 340px;
      top: -120px;
      left: -120px;
    }

    .orb-2 {
      width: 460px;
      height: 460px;
      bottom: -180px;
      right: -140px;
      animation-delay: -6s;
    }

    .orb-3 {
      width: 280px;
      height: 280px;
      top: 35%;
      right: 15%;
      animation-duration: 24s;
      animation-delay: -3s;
    }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      100% { transform: translate(40px, -50px) scale(1.15); opacity: 0.7; }
    }

    .login-card {
      position: relative;
      z-index: 10;
      width: 90%;
      max-width: 500px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(24px);
      border-radius: 2.5rem;
      padding: 2.2rem 2.2rem 2.2rem;
      box-shadow: 0 30px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.7) inset;
      border: 1px solid rgba(255, 255, 255, 0.8);
      transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.3s ease;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 35px 55px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
    }

    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-wrapper {
      max-width: 300px;
      margin: 0 auto 0.8rem;
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1));
      transition: filter 0.3s, transform 0.2s;
    }

    .logo-wrapper:hover {
      filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.15));
      transform: scale(1.01);
    }

    .logo {
      width: 100%;
      height: auto;
      display: block;
    }

    .brand-divider {
      width: 70px;
      height: 3px;
      background: linear-gradient(90deg, #E21C2A, #1F2E5A);
      margin: 1rem auto 0.6rem;
      border-radius: 4px;
      animation: expandWidth 0.7s ease-out;
    }

    @keyframes expandWidth {
      from { width: 0; opacity: 0; }
      to { width: 70px; opacity: 1; }
    }

    .tagline {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #1F2E5A, #E21C2A);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .form-container {
      margin-top: 0.5rem;
    }

    .form-title {
      font-size: 1.85rem;
      font-weight: 700;
      background: linear-gradient(125deg, #1F2E5A, #142559);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      text-align: center;
      margin-bottom: 2rem;
      letter-spacing: -0.5px;
    }

    .input-group {
      margin-bottom: 1.6rem;
      position: relative;
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

    .input-group input {
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

    .input-group input:focus {
      border-color: #1F2E5A;
      box-shadow: 0 0 0 4px rgba(31, 46, 90, 0.15);
      background: #FFFFFF;
    }

    .password-wrapper {
      position: relative;
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

    .error-msg {
      display: block;
      font-size: 0.7rem;
      color: #E21C2A;
      margin-top: 6px;
      font-weight: 600;
      animation: shake 0.3s ease;
    }

    @keyframes shake {
      0%,100%{ transform: translateX(0); }
      25%{ transform: translateX(-5px); }
      75%{ transform: translateX(5px); }
    }

    .forgot-row {
      text-align: right;
      margin-bottom: 1.6rem;
    }

    .forgot-link {
      font-size: 0.8rem;
      color: #1F2E5A;
      text-decoration: none;
      font-weight: 600;
      position: relative;
      transition: color 0.2s;
    }

    .forgot-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: #E21C2A;
      transition: width 0.25s ease;
    }

    .forgot-link:hover {
      color: #E21C2A;
    }

    .forgot-link:hover::after {
      width: 100%;
    }

    .alert-error {
      background: #fff3f3;
      border-left: 5px solid #E21C2A;
      padding: 12px 18px;
      border-radius: 16px;
      font-size: 0.8rem;
      color: #b91c2c;
      margin-bottom: 1.6rem;
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(4px);
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      border-radius: 50px;
      padding: 14px;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      box-shadow: 0 10px 22px rgba(31, 46, 90, 0.35);
      position: relative;
      overflow: hidden;
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

    .submit-btn:hover::before {
      left: 100%;
    }

    .submit-btn:hover {
      transform: translateY(-3px);
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      box-shadow: 0 16px 28px rgba(226, 28, 42, 0.4);
    }

    .submit-btn:active {
      transform: translateY(1px);
      transition: 0.05s;
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      filter: grayscale(0.05);
    }

    .btn-text {
      letter-spacing: 0.8px;
    }

    .btn-icon {
      font-size: 1.3rem;
      transition: transform 0.2s;
    }

    .submit-btn:hover .btn-icon {
      transform: translateX(5px);
    }

    .loader {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .footer-note {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.7rem;
      color: #6c7a8f;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-weight: 500;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 50%;
    }

    @media (max-width: 560px) {
      .login-card {
        padding: 1.5rem;
        max-width: 94%;
      }
      .form-title {
        font-size: 1.5rem;
      }
      .logo-wrapper {
        max-width: 240px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  showPassword = false;
  usernameFocused = false;
  passwordFocused = false;
  isSubmitting = false;
  currentYear = new Date().getFullYear();
  showLoader = false;

  private loginSuccess = false;
  private loaderCompleted = false;
  private lastResponse: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.showLoader = true;
      this.loginSuccess = false;
      this.loaderCompleted = false;
      this.lastResponse = null;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          this.lastResponse = response;
          this.loginSuccess = true;
          if (this.loaderCompleted) {
            this.redirectAfterLogin(response);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showLoader = false;
          this.errorMessage = err.status === 0 ? 'LOGIN.ERROR_SERVER' : 'LOGIN.ERROR_INVALID_CREDENTIALS';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onLoaderComplete(): void {
    this.loaderCompleted = true;
    if (this.loginSuccess && this.lastResponse) {
      this.redirectAfterLogin(this.lastResponse);
    }
  }

  private redirectAfterLogin(response: any): void {
    if (response?.firstLogin) {
      this.router.navigate(['/change-password']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}