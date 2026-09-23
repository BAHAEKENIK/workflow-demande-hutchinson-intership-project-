import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('fr');
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.useLanguage(savedLang);
  }

  useLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'fr';
  }
}