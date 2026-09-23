import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../core/services/translation.service';
import { UserService, User } from '../core/services/user.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  template: `
    <div class="app-wrapper" [class.dark-theme]="isDarkMode">
      <!-- Top Navigation Bar -->
      <header class="top-navbar glass-effect">
        <div class="navbar-container">
          <!-- Left Section: Hamburger + Logo -->
          <div class="navbar-left">
            <button class="hamburger-btn" (click)="toggleSidebar()" [class.active]="sidebarOpen" aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <div class="brand-wrapper">
              <div class="logo-container">
                <svg
                  class="hutchinson-logo"
                  viewBox="0 0 357.6729128 43.7434228"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
                  <path
                    d="m 71.649,41.26738 1.14626,0 0,-41.265 -1.14626,0 0,41.265 z"
                    fill="#142559"
                  />
                  <path
                    d="m 27.15738,40.08775 c 2.0225,1.69 5.26,1.4575 7.27625,-0.5 L 54.28238,19.0065 c 1.30375,-1.5625 1.84875,-6.935 -5.055,-6.95125 -0.135,0 -16.035,0.006 -16.035,0.006 -1.23375,0 -3.09625,0.84375 -4.05875,1.845 l -4.0175,4.18 c -0.45375,0.4675 -0.57125,0.61 -0.485,0.80625 0.1425,0.15125 0.18125,0.12125 0.5925,0.12125 l 12.1325,0.006 c 4.02625,-0.085 4.255,0.20625 4.5225,0.8575 0.15625,0.38125 0.0588,1.24375 -0.975,2.3 l -7.87125,8.0075 c -0.67,0.6775 -1.605,1.06875 -2.57,1.06875 -0.90375,-10e-4 -1.76,-0.3325 -2.405,-0.93625 l -7.17125,-6.645 c -0.66875,-0.6225 -1.0575,-1.475 -1.095,-2.39875 -0.0337,-0.94375 0.3025,-1.84875 0.94625,-2.5375 l 8.33125,-8.95115 c 1.19875,-1.29 3.39375,-2.30125 4.995,-2.30125 l 18.0875,0.009 c 1.24875,0.002 3.15625,-0.795 4.16875,-1.74 l 5.32375,-4.96875 c 0.35125,-0.375 0.5475,-0.63 0.50625,-0.69875 C 62.09858,1e-4 61.97238,0.0126 61.58863,0.0138 L 29.75238,0 c -1.23,0 -3.0575,0.87125 -3.995,1.905 l -15.91,18.0475 c -0.8225,0.9075 -0.78,2.29875 0.09,3.1075 l 17.22,17.0275 z M 0.59375,12.0755 C 0.2,12.0765 0,12.0755 0,12.19175 0,12.358 0.0438,12.4305 0.51876,12.90425 l 4.88499,4.7425 c 0.81375,0.79 2.2175,0.71625 2.985,-0.15375 l 3.845,-4.355 c 0.54375,-0.6975 0.5,-0.765 0.45375,-0.8975 -0.0575,-0.165 -0.20375,-0.16 -0.62,-0.16 L 0.59375,12.0755 z"
                    fill="#E00025"
                  />
                </svg>
              </div>
              <div class="brand-text-group">
                <span class="spv-badge">Entreprise</span>
              </div>
            </div>
          </div>

          <!-- Right Section: Language Switcher + Theme Toggle + Notifications + User Dropdown -->
          <div class="navbar-right">
            <div class="lang-switcher premium-lang">
              <button class="lang-btn" [class.active]="currentLang === 'fr'" (click)="changeLanguage('fr')">
                <img src="/assets/flags/fr.svg" alt="Français" width="24" height="18">
              </button>
              <button class="lang-btn" [class.active]="currentLang === 'en'" (click)="changeLanguage('en')">
                <img src="/assets/flags/gb.svg" alt="English" width="24" height="18">
              </button>
              <button class="lang-btn" [class.active]="currentLang === 'es'" (click)="changeLanguage('es')">
                <img src="/assets/flags/es.svg" alt="Español" width="24" height="18">
              </button>
            </div>

            <!-- Sun/Moon Day/Night Toggle -->
            <span class="switch-shadow">
              <button
                type="button"
                class="switch"
                [class.is-active]="isDarkMode"
                (click)="toggleTheme()"
                aria-label="Toggle dark mode"
              >
                <img class="switch__cloud --2" src="https://assets.codepen.io/58281/cloud-1.svg" />
                <img class="switch__cloud --1" src="https://assets.codepen.io/58281/cloud-2.svg" />
                <div class="switch__inner">
                  <div class="switch-globe">
                    <img class="switch-globe__moon" src="https://assets.codepen.io/58281/moon_1.png" />
                    <div class="switch-globe__circle"></div>
                  </div>
                  <img class="switch__stars" src="https://assets.codepen.io/58281/stars.svg" />
                </div>
              </button>
            </span>

            <!-- Notifications Bell -->
            <a routerLink="/notifications" class="notification-bell" (click)="closeDropdown()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </a>

            <div class="user-menu" #userMenu>
              <button class="user-trigger" (click)="toggleDropdown($event)" [class.dropdown-open]="dropdownOpen">
                <div class="user-avatar" [class.admin-avatar]="isAdmin">
                  {{ userInitials }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user ? (user.firstName + ' ' + user.lastName) : ('NAV.GUEST' | translate) }}</span>
                  <span class="user-role" *ngIf="isAdmin">{{ 'NAV.ADMIN' | translate }}</span>
                  <span class="user-role user-role-user" *ngIf="!isAdmin">{{ 'NAV.USER' | translate }}</span>
                </div>
                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div class="dropdown-menu" *ngIf="dropdownOpen">
                <div class="dropdown-header">
                  <div class="dropdown-avatar" [class.admin-avatar]="isAdmin">
                    {{ userInitials }}
                  </div>
                  <div class="dropdown-user-info">
                    <div class="dropdown-fullname">{{ user?.firstName }} {{ user?.lastName }}</div>
                    <div class="dropdown-email">{{ user?.email }}</div>
                    <div class="dropdown-department" *ngIf="user?.departmentName">
                      {{ user?.departmentName }}
                    </div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/profil" class="dropdown-item" (click)="closeDropdown()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ 'NAV.MY_PROFILE' | translate }}
                </a>
                <a routerLink="/historique" class="dropdown-item" (click)="closeDropdown()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  {{ 'NAV.HISTORIQUE' | translate }}
                </a>
                <div class="dropdown-divider"></div>
                
                <!-- PROFESSIONAL LOGOUT BUTTON (replaced animated version) -->
                <button class="dropdown-item" (click)="logout()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {{ 'NAV.LOGOUT' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Layout: Sidebar + Content -->
      <div class="main-layout">
        <aside class="sidebar" [class.sidebar-open]="sidebarOpen" [class.sidebar-mobile-open]="sidebarOpen && isMobileView">
          <div class="sidebar-menu">
            <div class="sidebar-nav">
              <a routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebarOnMobile()">
                <span class="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H10V10H4V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 4H20V10H14V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 14H10V20H4V14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 14H20V20H14V14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>{{ 'NAV.DASHBOARD' | translate }}</span>
              </a>
              <a routerLink="/demandes" routerLinkActive="active-link" (click)="closeSidebarOnMobile()">
                <span class="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 7H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 17H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </span>
                <span>{{ 'NAV.DEMANDES' | translate }}</span>
              </a>
              <a routerLink="/profil" routerLinkActive="active-link" (click)="closeSidebarOnMobile()">
                <span class="menu-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>{{ 'NAV.PROFIL' | translate }}</span>
              </a>
              
              <ng-container *ngIf="isAdmin">
                <div class="sidebar-divider"></div>
                <a routerLink="/admin/users" routerLinkActive="active-link" class="admin-menu-item" (click)="closeSidebarOnMobile()">
                  <span class="menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 16.8 15.2 15 13 15H5C2.8 15 1 16.8 1 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M23 21V19C22.6 16.8 20.8 15 18.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 3.13C17.5 3.73 18.5 5.32 18 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>{{ 'NAV.USERS' | translate }}</span>
                </a>
                <a routerLink="/admin/departments" routerLinkActive="active-link" class="admin-menu-item" (click)="closeSidebarOnMobile()">
                  <span class="menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 4V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M16 4V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M8 16H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <span>{{ 'NAV.DEPARTMENTS' | translate }}</span>
                </a>
                <a routerLink="/admin/workflows" routerLinkActive="active-link" class="admin-menu-item" (click)="closeSidebarOnMobile()">
                  <span class="menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 6V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="18" r="2" stroke="currentColor" stroke-width="1.5"/>
                      <circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                      <circle cx="6" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M8 7L10 8M16 10L14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M12 14L12 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <span>{{ 'NAV.WORKFLOWS' | translate }}</span>
                </a>
                <a routerLink="/admin/delete-workflows" routerLinkActive="active-link" class="admin-menu-item" (click)="closeSidebarOnMobile()">
                  <span class="menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </span>
                  <span>{{ 'NAV.DELETE_WORKFLOWS' | translate }}</span>
                </a>
              </ng-container>

              <!-- RH Users Section (visible only for CHEF_DEPT of RH department) -->
              <ng-container *ngIf="isRh">
                <div class="sidebar-divider" *ngIf="!isAdmin"></div>
                <a routerLink="/rh/users" routerLinkActive="active-link" class="admin-menu-item" (click)="closeSidebarOnMobile()">
                  <span class="menu-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                    </svg>
                  </span>
                  <span>{{ 'NAV.RH_USERS' | translate }}</span>
                </a>
              </ng-container>
            </div>
          </div>
        </aside>

        <div class="sidebar-backdrop" *ngIf="sidebarOpen && isMobileView" (click)="toggleSidebar()"></div>

        <main class="content-area">
          <div class="content-card">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <footer class="glass-footer">
        <div class="footer-content">
          <span>{{ 'FOOTER.COPYRIGHT' | translate: { year: currentYear } }}</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX STYLES + DARK MODE ========== */
    :root {
      --bg-gradient-start: #f8fafc;
      --bg-gradient-end: #eef2f6;
      --primary-bg-white: rgba(255, 255, 255, 0.96);
      --card-bg: rgba(255, 255, 255, 0.75);
      --footer-bg: rgba(255, 255, 255, 0.88);
      --text-primary: #1e293b;
      --text-secondary: #5b6e8c;
      --sidebar-bg: rgba(255, 255, 255, 0.96);
      --border-light: rgba(31, 46, 90, 0.1);
      --dropdown-bg: rgba(255, 255, 255, 0.98);
      --nav-bg: rgba(255, 255, 255, 0.92);
      --scrollbar-track: #ecf3f9;
      --scrollbar-thumb: #1F2E5A;
      --notification-bg: rgba(31, 46, 90, 0.08);
      --notification-hover: rgba(31, 46, 90, 0.15);
      --notification-badge-bg: #E21C2A;
      --notification-badge-text: #ffffff;
      --logout-door-color: #64748b;
      --logout-doorway-color: #94a3b8;
      --logout-figure-color: #1e293b;
      --logout-text-color: #E21C2A;
    }

    .dark-theme {
      --bg-gradient-start: #0f172a;
      --bg-gradient-end: #1e293b;
      --primary-bg-white: rgba(15, 23, 42, 0.96);
      --card-bg: rgba(30, 41, 59, 0.75);
      --footer-bg: rgba(15, 23, 42, 0.88);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --sidebar-bg: rgba(15, 23, 42, 0.96);
      --border-light: rgba(255, 255, 255, 0.08);
      --dropdown-bg: rgba(30, 41, 59, 0.98);
      --nav-bg: rgba(15, 23, 42, 0.92);
      --scrollbar-track: #1e293b;
      --scrollbar-thumb: #E21C2A;
      --notification-bg: rgba(255, 255, 255, 0.08);
      --notification-hover: rgba(255, 255, 255, 0.15);
      --notification-badge-bg: #f87171;
      --notification-badge-text: #0f172a;
      --logout-door-color: #e2e8f0;
      --logout-doorway-color: #475569;
      --logout-figure-color: #f1f5f9;
      --logout-text-color: #f87171;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .app-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 10% 20%, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
      display: flex;
      flex-direction: column;
      transition: background 0.5s ease, color 0.5s ease;
      position: relative;
    }

    /* ===== TOP NAVBAR ===== */
    .top-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--nav-bg);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border-light);
      box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.08);
      transition: background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
    }

    .navbar-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    /* Hamburger */
    .hamburger-btn {
      background: transparent;
      border: none;
      width: 40px;
      height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      background: rgba(31, 46, 90, 0.04);
    }
    .dark-theme .hamburger-btn {
      background: rgba(255, 255, 255, 0.08);
    }
    .hamburger-btn:hover {
      background: rgba(31, 46, 90, 0.1);
      transform: scale(0.98);
    }
    .dark-theme .hamburger-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .hamburger-btn span {
      display: block;
      width: 22px;
      height: 2px;
      background: #1F2E5A;
      border-radius: 4px;
      transition: all 0.25s ease;
    }
    .dark-theme .hamburger-btn span {
      background: #e2e8f0;
    }
    .hamburger-btn.active span:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }
    .hamburger-btn.active span:nth-child(2) {
      opacity: 0;
      transform: translateX(-8px);
    }
    .hamburger-btn.active span:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }

    /* Brand */
    .brand-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-container {
      line-height: 0;
      position: relative;
      overflow: hidden;
    }
    .hutchinson-logo {
      height: 34px;
      width: auto;
      transition: filter 0.5s ease;
      animation: logoReveal 1.5s ease-out forwards;
    }
    .dark-theme .hutchinson-logo path[fill="#142559"] {
      fill: #cbd5e1;
    }
    .dark-theme .hutchinson-logo path[fill="#E00025"] {
      fill: #f87171;
    }
    .brand-text-group {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .spv-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: linear-gradient(135deg, #E21C2A, #b91c2c);
      color: white;
      padding: 0.2rem 0.65rem;
      border-radius: 40px;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      animation: badgePop 0.5s ease-out 0.8s both;
    }

    /* Right Side */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    /* Language Switcher */
    .premium-lang {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(4px);
      border-radius: 60px;
      padding: 0.25rem 0.6rem;
      border: 1px solid var(--border-light);
      transition: background 0.5s ease, border-color 0.5s ease;
    }
    .dark-theme .premium-lang {
      background: rgba(0,0,0,0.3);
    }
    .lang-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 40px;
      transition: all 0.2s;
      opacity: 0.6;
    }
    .lang-btn.active {
      opacity: 1;
      background: rgba(31,46,90,0.1);
      transform: scale(1.05);
    }
    .dark-theme .lang-btn.active {
      background: rgba(255,255,255,0.15);
    }
    .lang-btn:hover {
      opacity: 1;
      transform: translateY(-1px);
    }

    /* ===== SUN/MOON DAY/NIGHT TOGGLE ===== */
    .switch-shadow {
      display: inline-block;
      border-radius: 999px;
      box-shadow: 2px 4px 12px -2px rgba(0, 0, 0, 0.25);
      flex-shrink: 0;
      transition: box-shadow 0.5s ease;
    }
    .dark-theme .switch-shadow {
      box-shadow: 2px 4px 16px -2px rgba(0, 0, 0, 0.5);
    }

    .switch {
      --font-size: 3.1px;
      --height: 10em;
      --width: 24em;
      --margin: 0.5em;
      --color-night: rgba(15, 64, 91, 1);
      --color-day: rgba(91, 169, 211, 1);
      --color-sun: rgba(246, 211, 90, 1);
      --ease: cubic-bezier(0.770, 0.000, 0.175, 1.000);
      --duration: 0.85s;

      outline: 0;
      background: transparent;
      border: 0;
      appearance: none;
      -webkit-appearance: none;
      box-shadow: none;
      cursor: pointer;

      font-size: var(--font-size);
      position: relative;
      width: var(--width);
      height: var(--height);
      border-radius: 999px;
      background-color: var(--color-day);
      overflow: hidden;
      z-index: 2;
      display: block;
      padding: 0;
    }

    .switch::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-night);
      transition: opacity var(--duration) var(--ease);
      opacity: 0;
      z-index: 1;
      border-radius: 999px;
    }

    .switch.is-active::after {
      opacity: 1;
    }

    .switch__inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      transform-origin: right;
      transform: translate3d(calc(var(--width) - var(--height)), 0, 0);
      transition: transform var(--duration) var(--ease);
      z-index: 2;
    }

    .switch.is-active .switch__inner {
      transform: translate3d(0, 0, 0);
    }

    .switch-globe {
      --size: calc(var(--height) - (var(--margin) * 2));
      position: relative;
      height: var(--size);
      width: var(--size);
      margin: var(--margin) 0 0 var(--margin);
      border-radius: 999px;
      background-color: var(--color-sun);
      transform: rotate(90deg);
      transition: transform var(--duration) var(--ease);
      z-index: 1;
    }

    .switch.is-active .switch-globe {
      transform: rotate(0deg);
    }

    .switch-globe__circle {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 100%;
      border-radius: 999px;
      background-color: var(--color-day);
      transform: translate3d(50%, 0, 0);
      transition: transform var(--duration) var(--ease), background-color var(--duration) var(--ease);
    }

    .switch.is-active .switch-globe__circle {
      background-color: var(--color-night);
      transform: translate3d(-10%, 0, 0);
    }

    .switch-globe__moon {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 999px;
      object-fit: cover;
      transform: scaleX(-1);
      opacity: 0;
      transition: opacity var(--duration) var(--ease);
    }

    .switch.is-active .switch-globe__moon {
      opacity: 1;
    }

    .switch__stars {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      object-fit: contain;
      object-position: right;
      transform-origin: right;
      transform: scale(0.25);
      transition: transform var(--duration) var(--ease);
      z-index: 2;
    }

    .switch.is-active .switch__stars {
      transform: scale(0.9);
    }

    .switch__cloud {
      position: absolute;
      transition: transform var(--duration) var(--ease);
      width: auto;
      bottom: 0;
      z-index: 3;
    }

    .switch__cloud.--1 {
      left: 0;
      height: 65%;
    }

    .switch.is-active .switch__cloud.--1 {
      transform: translate3d(-26em, 5em, 0);
    }

    .switch__cloud.--2 {
      left: 3em;
      height: 50%;
    }

    .switch.is-active .switch__cloud.--2 {
      transform: translate3d(-22em, 10em, 0);
    }

    /* Toggle hover micro-interaction */
    .switch:hover {
      filter: brightness(1.08);
    }
    .switch:active {
      filter: brightness(0.95);
    }
    /* ===== END SUN/MOON TOGGLE ===== */

    /* Notification Bell */
    .notification-bell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 44px;
      background: var(--notification-bg);
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(4px);
    }
    .notification-bell:hover {
      background: var(--notification-hover);
      transform: scale(1.05);
    }
    .notification-bell svg {
      transition: transform 0.3s ease;
    }
    .notification-bell:hover svg {
      transform: scale(1.1);
    }
    .notification-badge {
      position: absolute;
      top: 5px;
      right: 5px;
      min-width: 18px;
      height: 18px;
      border-radius: 18px;
      background: var(--notification-badge-bg);
      color: var(--notification-badge-text);
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 8px rgba(226, 28, 42, 0.3);
      animation: badgeBounce 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes badgeBounce {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* User Dropdown */
    .user-menu { position: relative; }
    .user-trigger {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      border: 1px solid var(--border-light);
      padding: 0.3rem 1rem 0.3rem 0.5rem;
      border-radius: 60px;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .dark-theme .user-trigger {
      background: rgba(30, 41, 59, 0.8);
      color: var(--text-primary);
    }
    .user-trigger:hover {
      border-color: #1F2E5A;
      box-shadow: 0 6px 14px rgba(31,46,90,0.1);
      transform: translateY(-1px);
    }
    .dark-theme .user-trigger:hover {
      border-color: #E21C2A;
    }
    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1F2E5A, #2c3f70);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      transition: transform 0.3s ease;
    }
    .user-trigger:hover .user-avatar {
      transform: scale(1.05);
    }
    .user-avatar.admin-avatar {
      background: linear-gradient(135deg, #E21C2A, #b91c2c);
    }
    .user-info { display: flex; flex-direction: column; line-height: 1.3; }
    .user-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
    .user-role {
      font-size: 0.65rem;
      font-weight: 600;
      background: rgba(31,46,90,0.1);
      padding: 0.1rem 0.5rem;
      border-radius: 20px;
      color: #1F2E5A;
    }
    .dark-theme .user-role { background: rgba(255,255,255,0.1); color: #e2e8f0; }
    .chevron-icon { transition: transform 0.3s ease; color: #64748b; }
    .user-trigger.dropdown-open .chevron-icon { transform: rotate(180deg); color: #1F2E5A; }
    .dark-theme .user-trigger.dropdown-open .chevron-icon { color: #E21C2A; }

    /* Dropdown Menu */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 320px;
      background: #ffffff;
      backdrop-filter: none;
      border-radius: 24px;
      box-shadow: 0 20px 35px -12px rgba(0,0,0,0.2), 0 0 0 1px var(--border-light);
      animation: slideDown 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      z-index: 200;
      overflow: hidden;
    }
    .dark-theme .dropdown-menu {
      background: rgba(30, 41, 59, 0.98);
      backdrop-filter: blur(16px);
    }
    .dropdown-header {
      padding: 1.2rem;
      display: flex;
      gap: 1rem;
      background: #f8fafc;
      border-radius: 24px 24px 0 0;
    }
    .dark-theme .dropdown-header {
      background: rgba(30,41,59,0.8);
    }
    .dropdown-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1F2E5A, #2c3f70);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.2rem;
    }
    .dropdown-avatar.admin-avatar {
      background: linear-gradient(135deg, #E21C2A, #b91c2c);
    }
    .dropdown-user-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .dropdown-fullname {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dropdown-email {
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dropdown-department {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-top: 0.15rem;
    }
    .dropdown-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, var(--border-light), transparent);
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem 1.2rem;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.2s;
      cursor: pointer;
      font-weight: 500;
      position: relative;
      overflow: hidden;
      background: none;
      border: none;
      width: 100%;
      font-size: inherit;
      font-family: inherit;
    }
    .dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: #E21C2A;
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }
    .dropdown-item:hover::before {
      transform: scaleY(1);
    }
    .dropdown-item:hover {
      background: rgba(31,46,90,0.05);
      padding-left: 1.5rem;
    }
    .dark-theme .dropdown-item:hover { background: rgba(255,255,255,0.05); }

    /* Professional logout button - no animation, standard styling (uses .dropdown-item) */
    /* No extra styles needed, inherits from .dropdown-item */

    /* Sidebar */
    .main-layout { display: flex; flex: 1; position: relative; }
    .sidebar {
      width: 0px;
      overflow: hidden;
      background: var(--sidebar-bg);
      backdrop-filter: blur(28px);
      border-right: 1px solid var(--border-light);
      transition: width 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), background 0.5s ease, border-color 0.5s ease;
      height: calc(100vh - 70px);
      position: sticky;
      top: 70px;
      z-index: 90;
      box-shadow: 4px 0 20px rgba(0,0,0,0.02);
    }
    .sidebar.sidebar-open { width: 280px; }
    .sidebar-menu {
      width: 280px;
      padding: 1.5rem 1rem;
      height: 100%;
      overflow-y: auto;
    }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.2rem;
      border-radius: 18px;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      position: relative;
      overflow: hidden;
    }
    .sidebar-nav a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: #E21C2A;
      transform: scaleY(0);
      transition: transform 0.3s ease;
      border-radius: 0 4px 4px 0;
    }
    .sidebar-nav a:hover::before {
      transform: scaleY(0.5);
    }
    .sidebar-nav a.active-link::before {
      transform: scaleY(1);
      background: white;
    }
    .dark-theme .sidebar-nav a.active-link::before {
      background: white;
    }
    .sidebar-nav a:hover {
      background: rgba(31,46,90,0.08);
      transform: translateX(6px);
      color: #1F2E5A;
    }
    .dark-theme .sidebar-nav a:hover {
      background: rgba(255,255,255,0.08);
      color: #e2e8f0;
    }
    .sidebar-nav a.active-link {
      background: linear-gradient(115deg, #1F2E5A, #142559);
      color: white;
      box-shadow: 0 8px 18px rgba(31,46,90,0.25);
      transform: translateX(4px);
    }
    .dark-theme .sidebar-nav a.active-link {
      background: linear-gradient(115deg, #E21C2A, #b91c2c);
    }
    .admin-menu-item.active-link {
      background: linear-gradient(115deg, #E21C2A, #b91c2c) !important;
    }
    .menu-icon {
      width: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }
    .sidebar-nav a:hover .menu-icon {
      transform: scale(1.1);
    }
    .menu-icon svg { stroke: currentColor; transition: all 0.2s; }
    .sidebar-nav a.active-link .menu-icon svg { stroke: white; filter: brightness(0) invert(1); }
    .sidebar-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, var(--border-light), transparent);
      margin: 0.8rem 0;
    }

    /* Backdrop */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(3px);
      z-index: 80;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Content Area */
    .content-area { flex: 1; padding: 2rem; transition: margin 0.3s ease; }
    .content-card {
      background: var(--card-bg);
      backdrop-filter: blur(2px);
      border-radius: 32px;
      padding: 0.5rem;
      min-height: 70vh;
      box-shadow: 0 8px 24px -8px rgba(0,0,0,0.06);
      transition: all 0.5s ease;
    }

    /* Footer */
    .glass-footer {
      background: var(--footer-bg);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--border-light);
      padding: 1rem 2rem;
      margin-top: auto;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.5s ease;
    }
    .footer-content {
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.8rem;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .navbar-container { padding: 0.75rem 1.2rem; }
      .user-info { display: none; }
      .user-trigger { padding: 0.3rem; }
      .user-avatar { width: 34px; height: 34px; font-size: 0.8rem; }
      .sidebar {
        position: fixed;
        top: 0;
        left: -300px;
        height: 100vh;
        transition: left 0.3s ease, background 0.5s ease;
        width: 280px !important;
        z-index: 200;
        background: var(--sidebar-bg);
        box-shadow: 12px 0 40px rgba(0,0,0,0.2);
      }
      .sidebar.sidebar-open { left: 0; }
      .sidebar-backdrop { display: block; }
      .content-area { padding: 1rem; }
      .content-card { border-radius: 24px; }
      .dropdown-menu {
        right: -60px;
        width: 280px;
      }
    }
    @media (max-width: 640px) {
      .hamburger-btn { width: 36px; height: 36px; }
      .spv-badge { font-size: 0.55rem; padding: 0.1rem 0.5rem; }
      .hutchinson-logo { height: 26px; }
      .premium-lang .lang-btn img { width: 20px; height: auto; }
      .footer-content { flex-direction: column; gap: 0.3rem; }
      .notification-bell {
        width: 38px;
        height: 38px;
      }
      .notification-bell svg {
        width: 18px;
        height: 18px;
      }
      .notification-badge {
        min-width: 16px;
        height: 16px;
        font-size: 0.6rem;
      }
      .switch {
        --font-size: 2.6px;
      }
      .dropdown-menu {
        right: -100px;
        width: 260px;
      }
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--scrollbar-track); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 10px; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Logo Animation */
    @keyframes logoReveal {
      0% {
        opacity: 0;
        transform: translateX(-20px);
        filter: blur(4px);
      }
      40% {
        opacity: 0.7;
        filter: blur(1px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
        filter: blur(0);
      }
    }

    /* Badge Animation */
    @keyframes badgePop {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      70% {
        transform: scale(1.1);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  isAdmin = false;
  isRh = false; // new property for RH department manager
  user: User | null = null;
  dropdownOpen = false;
  sidebarOpen = true;
  isMobileView = false;
  displayName = '';
  userInitials = '';
  currentYear = new Date().getFullYear();
  currentLang = 'fr';
  isDarkMode = false;
  unreadCount = 0;
  private pollInterval: any;

  @ViewChild('userMenu') userMenuRef!: ElementRef;

  constructor(
    private userService: UserService,
    private router: Router,
    private translationService: TranslationService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {
    this.currentLang = translationService.getCurrentLang();
    translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  ngOnInit(): void {
    this.checkScreenWidth();
    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.isAdmin = user.role === 'ADMIN';
        // Determine if user is manager of RH department
        this.isRh = user.role === 'CHEF_DEPT' && user.departmentName === 'RH';
        this.displayName = user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.username;
        this.userInitials = this.getInitials(user);
      },
      error: () => {
        this.isAdmin = false;
        this.isRh = false;
        this.user = null;
        this.displayName = 'Invité';
        this.userInitials = '?';
      }
    });
    
    this.loadUnreadCount();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount = count,
      error: (err) => console.error(err)
    });
  }

  startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  private getInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen && this.isMobileView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebarOnMobile(): void {
    if (this.isMobileView) {
      this.sidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  changeLanguage(lang: string): void {
    this.translationService.useLanguage(lang);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenWidth();
  }

  checkScreenWidth(): void {
    this.isMobileView = window.innerWidth <= 900;
    if (!this.isMobileView) {
      this.sidebarOpen = true;
      document.body.style.overflow = '';
    } else {
      this.sidebarOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.dropdownOpen && this.userMenuRef && !this.userMenuRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
    if (this.isMobileView && this.sidebarOpen && !(event.target as HTMLElement).closest('.sidebar') && !(event.target as HTMLElement).closest('.hamburger-btn')) {
      this.closeSidebarOnMobile();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.dropdownOpen) this.closeDropdown();
    if (this.isMobileView && this.sidebarOpen) this.closeSidebarOnMobile();
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}