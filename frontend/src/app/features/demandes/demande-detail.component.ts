import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DemandeService, Demande } from '../../core/services/demande.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="demande">
      <h2>{{ 'DEMANDE_DETAIL.TITLE' | translate:{ id: demande.id, titre: demande.titre } }}</h2>
      
      <div class="detail-card">
        <h3>{{ 'DEMANDE_DETAIL.GENERAL_INFO' | translate }}</h3>
        <p><strong>{{ 'DEMANDE_DETAIL.DESCRIPTION' | translate }} :</strong> {{ demande.description || ('COMMON.NONE' | translate) }}</p>
        <p><strong>{{ 'DEMANDE_DETAIL.REQUESTER' | translate }} :</strong> {{ demande.demandeurNom }}</p>
        <p><strong>{{ 'DEMANDE_DETAIL.CREATOR' | translate }} :</strong> {{ demande.createurNom }}</p>
        <p><strong>{{ 'DEMANDE_DETAIL.WORKFLOW' | translate }} :</strong> {{ demande.workflowNom }}</p>
        <p><strong>{{ 'DEMANDE_DETAIL.GLOBAL_STATUS' | translate }} :</strong> <span [class]="'badge ' + demande.statut">{{ getStatusLabel(demande.statut) }}</span></p>
        <p><strong>{{ 'DEMANDE_DETAIL.CREATION_DATE' | translate }} :</strong> {{ demande.dateCreation | date:'dd/MM/yyyy HH:mm' }}</p>
      </div>

      <!-- Détails complets de la demande -->
      <div class="detail-section" *ngIf="demande.detail">
        <h3>{{ 'DEMANDE_DETAIL.REQUEST_DETAILS' | translate }}</h3>
        
        <div><strong>{{ 'DEMANDE_DETAIL.LOCATION' | translate }} :</strong> {{ demande.detail.localisation || ('COMMON.NONE' | translate) }}</div>
        <div><strong>{{ 'DEMANDE_DETAIL.RESPONSIBLE' | translate }} :</strong> {{ demande.detail.responsableNom || ('COMMON.NONE' | translate) }}</div>
        <div><strong>{{ 'DEMANDE_DETAIL.GENERAL_OBSERVATIONS' | translate }} :</strong> {{ demande.detail.observationsGenerales || ('COMMON.NONE' | translate) }}</div>
        
        <h4>{{ 'DEMANDE_DETAIL.SECTION_SERVICES' | translate }}</h4>
        <ul>
          <li>{{ 'DEMANDE_DETAIL.FURNITURE' | translate }} : {{ demande.detail.mobilier ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.MEAL_VOUCHER' | translate }} : {{ demande.detail.carteRestaurant ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.COFFEE_CARD' | translate }} : {{ demande.detail.carteCafe ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.INDOOR_PARKING' | translate }} : {{ demande.detail.parkingInterieur ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.LOCKER' | translate }} : {{ demande.detail.casier ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.COPY_PERMIT' | translate }} : {{ demande.detail.photocopiePermis ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.OTHER_SERVICES' | translate }} : {{ demande.detail.autreServicesGeneraux || ('COMMON.NONE' | translate) }}</li>
        </ul>

        <h4>{{ 'DEMANDE_DETAIL.SECTION_TELEPHONY' | translate }}</h4>
        <ul>
          <li>{{ 'DEMANDE_DETAIL.LANDLINE' | translate }} : {{ demande.detail.telephoneFixe ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.MOBILE_PHONE' | translate }} : {{ demande.detail.telephoneMobile ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.SMARTPHONE' | translate }} : {{ demande.detail.smartphoneMobile ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.LINE_TYPE' | translate }} : {{ demande.detail.typeLigne || ('COMMON.NONE' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.OTHER_TELEPHONY' | translate }} : {{ demande.detail.autreTelephonie || ('COMMON.NONE' | translate) }}</li>
        </ul>

        <h4>{{ 'DEMANDE_DETAIL.SECTION_COMPUTER' | translate }}</h4>
        <ul>
          <li>{{ 'DEMANDE_DETAIL.DESKTOP' | translate }} : {{ demande.detail.ordinateurBureau ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.LAPTOP' | translate }} : {{ demande.detail.ordinateurPortable ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.NOMAD_CARD' | translate }} : {{ demande.detail.carteNomade ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.EXTERNAL_CONNECTION' | translate }} : {{ demande.detail.connexionExterne ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.PVD_USER' | translate }} : {{ demande.detail.utilisateurPvd ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.OTHER_COMPUTER' | translate }} : {{ demande.detail.autreOrdinateur || ('COMMON.NONE' | translate) }}</li>
        </ul>

        <h4>{{ 'DEMANDE_DETAIL.SECTION_MAIL' | translate }}</h4>
        <ul>
          <li>{{ 'DEMANDE_DETAIL.OFFICE_365' | translate }} : {{ demande.detail.courrierOffice365 ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.OTHER_IT' | translate }} : {{ demande.detail.autreServiceIt || ('COMMON.NONE' | translate) }}</li>
        </ul>

        <!-- ========== ACCÈS PROGRAMMES (STRUCTURÉ) ========== -->
        <h4>{{ 'DEMANDE_DETAIL.SECTION_ACCESS_PROGRAMS' | translate }}</h4>

        <!-- Ciclo de Ventas -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.ciclos?.ventas">
          <div class="sub-header">
            <span class="sub-icon">💰</span>
            <span>{{ 'ACCES_PROGRAMAS.CICLO_VENTAS' | translate }}</span>
          </div>
          <ul>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.negociar">{{ 'ACCES_PROGRAMAS.NEGOCIAR' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.abrirNuevoCliente">{{ 'ACCES_PROGRAMAS.ABRIR_NUEVO_CLIENTE' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.procesarPedidos">{{ 'ACCES_PROGRAMAS.PROCESAR_PEDIDOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.prepararEnvios">{{ 'ACCES_PROGRAMAS.PREPARAR_ENVIOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.facturar">{{ 'ACCES_PROGRAMAS.FACTURAR' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.ventas.gestionarCobrosContabilizar">{{ 'ACCES_PROGRAMAS.GESTIONAR_COBROS_CONTABILIZAR' | translate }}</li>
          </ul>
        </div>

        <!-- Ciclo de Pagos -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.ciclos?.pagos">
          <div class="sub-header">
            <span class="sub-icon">💳</span>
            <span>{{ 'ACCES_PROGRAMAS.CICLO_PAGOS' | translate }}</span>
          </div>
          <ul>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.registroDetallesBancariosProv">{{ 'ACCES_PROGRAMAS.REGISTRO_DETALLES_BANCARIOS_PROV' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.aprobarPagoGastos">{{ 'ACCES_PROGRAMAS.APROBAR_PAGO_GASTOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.conciliacionFacturas">{{ 'ACCES_PROGRAMAS.CONCILIACION_FACTURAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.contabilizacionFacturas">{{ 'ACCES_PROGRAMAS.CONTABILIZACION_FACTURAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.prepararPagos">{{ 'ACCES_PROGRAMAS.PREPARAR_PAGOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.firmarPagos">{{ 'ACCES_PROGRAMAS.FIRMAR_PAGOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.pagos.conciliarCuentasBancarias">{{ 'ACCES_PROGRAMAS.CONCILIAR_CUENTAS_BANCARIAS' | translate }}</li>
          </ul>
        </div>

        <!-- Ciclo de RR HH -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.ciclos?.rrhh">
          <div class="sub-header">
            <span class="sub-icon">👥</span>
            <span>{{ 'ACCES_PROGRAMAS.CICLO_RRHH' | translate }}</span>
          </div>
          <ul>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.gestionarArchivosPersonal">{{ 'ACCES_PROGRAMAS.GESTIONAR_ARCHIVOS_PERSONAL' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.registrarDetallesBancariosPersonal">{{ 'ACCES_PROGRAMAS.REGISTRAR_DETALLES_BANCARIOS_PERSONAL' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.registrarAumentosSalarialesBonus">{{ 'ACCES_PROGRAMAS.REGISTRAR_AUMENTOS_SALARIALES_BONUS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.registrarHorasTrabajadas">{{ 'ACCES_PROGRAMAS.REGISTRAR_HORAS_TRABAJADAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.comprobarPrepararNominas">{{ 'ACCES_PROGRAMAS.COMPROBAR_PREPARAR_NOMINAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.aprobarNominas">{{ 'ACCES_PROGRAMAS.APROBAR_NOMINAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.firmarTransferenciasNominas">{{ 'ACCES_PROGRAMAS.FIRMAR_TRANSFERENCIAS_NOMINAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.rrhh.contabilizacionNominas">{{ 'ACCES_PROGRAMAS.CONTABILIZACION_NOMINAS' | translate }}</li>
          </ul>
        </div>

        <!-- Ciclo de Compras -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.ciclos?.compras">
          <div class="sub-header">
            <span class="sub-icon">🛒</span>
            <span>{{ 'ACCES_PROGRAMAS.CICLO_COMPRAS' | translate }}</span>
          </div>
          <ul>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.realizarSolicitudCompras">{{ 'ACCES_PROGRAMAS.REALIZAR_SOLICITUD_COMPRAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.aprobarSolicitudCompras">{{ 'ACCES_PROGRAMAS.APROBAR_SOLICITUD_COMPRAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.seleccionProveedor">{{ 'ACCES_PROGRAMAS.SELECCION_PROVEEDOR' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.abrirCuentaNuevaProveedor">{{ 'ACCES_PROGRAMAS.ABRIR_CUENTA_NUEVA_PROVEEDOR' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.firmarPedidosCompras">{{ 'ACCES_PROGRAMAS.FIRMAR_PEDIDOS_COMPRAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.recibirBienesServicios">{{ 'ACCES_PROGRAMAS.RECIBIR_BIENES_SERVICIOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.compras.aprobarFacturas">{{ 'ACCES_PROGRAMAS.APROBAR_FACTURAS' | translate }}</li>
          </ul>
        </div>

        <!-- Ciclo Inventarios -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.ciclos?.inventarios">
          <div class="sub-header">
            <span class="sub-icon">📦</span>
            <span>{{ 'ACCES_PROGRAMAS.CICLO_INVENTARIOS' | translate }}</span>
          </div>
          <ul>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.abrirNuevosInventariosAC">{{ 'ACCES_PROGRAMAS.ABRIR_NUEVOS_INVENTARIOS_AC' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.recibirMercanciasServicios">{{ 'ACCES_PROGRAMAS.RECIBIR_MERCANCIAS_SERVICIOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.gestionarStocks">{{ 'ACCES_PROGRAMAS.GESTIONAR_STOCKS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.eliminarExistenciasObsoletas">{{ 'ACCES_PROGRAMAS.ELIMINAR_EXISTENCIAS_OBSOLETAS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.hacerInventariosFisicos">{{ 'ACCES_PROGRAMAS.HACER_INVENTARIOS_FISICOS' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.aprobarAjustesInventario">{{ 'ACCES_PROGRAMAS.APROBAR_AJUSTES_INVENTARIO' | translate }}</li>
            <li *ngIf="demande.detail.accesProgrammes.ciclos.inventarios.gestionarCuentasInventarios">{{ 'ACCES_PROGRAMAS.GESTIONAR_CUENTAS_INVENTARIOS' | translate }}</li>
          </ul>
        </div>

        <!-- Aplicaciones -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.aplicaciones">
          <div class="sub-header">
            <span class="sub-icon">📱</span>
            <span>{{ 'ACCES_PROGRAMAS.APLICACIONES' | translate }}</span>
          </div>
          <ul>
            <li *ngFor="let appKey of getAplicacionesKeys()">
              {{ ('ACCES_PROGRAMAS.' + appKey.toUpperCase()) | translate }}
            </li>
          </ul>
        </div>

        <!-- SharePoint -->
        <div class="sub-block" *ngIf="demande.detail.accesProgrammes?.sharepoint?.activo">
          <div class="sub-header">
            <span class="sub-icon">📁</span>
            <span>{{ 'ACCES_PROGRAMAS.SHAREPOINT' | translate }}</span>
          </div>
          <div><strong>{{ 'ACCES_PROGRAMAS.SHAREPOINT_TIPO_ACCESO' | translate }} :</strong>
            {{ demande.detail.accesProgrammes.sharepoint.tipoAcceso === 'lectura' ? ('ACCES_PROGRAMAS.LECTURA' | translate) : ('ACCES_PROGRAMAS.ESCRITURA' | translate) }}
          </div>
        </div>
        <!-- ========== FIN ACCÈS PROGRAMMES ========== -->

        <h4>{{ 'DEMANDE_DETAIL.SECTION_BANK' | translate }}</h4>
        <ul>
          <li>{{ 'DEMANDE_DETAIL.THEMIS' | translate }} : {{ demande.detail.banqueThemis ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.HYPERVISION' | translate }} : {{ demande.detail.banqueHypervision ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.HELIOS' | translate }} : {{ demande.detail.banqueHelios ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.CAP' | translate }} : {{ demande.detail.banqueCap ? ('COMMON.YES' | translate) : ('COMMON.NO' | translate) }}</li>
          <li>{{ 'DEMANDE_DETAIL.OTHER_BANK' | translate }} : {{ demande.detail.autreBanque || ('COMMON.NONE' | translate) }}</li>
        </ul>

        <div><strong>{{ 'DEMANDE_DETAIL.OTHER_NEED' | translate }} :</strong> {{ demande.detail.autreBesoin || ('COMMON.NONE' | translate) }}</div>
      </div>

      <!-- Workflow visual (modifié selon la consigne) -->
      <div class="workflow-diagram">
  <h3>{{ 'DEMANDE_DETAIL.WORKFLOW_VISUAL' | translate }}</h3>
  <div class="steps-timeline">
    <div *ngFor="let etape of demande.etapes; let i = index" class="timeline-step">
      <div class="step-bullet">{{ i + 1 }}</div>
      <div class="step-info">
        <strong>
          {{ etape.nomValidateur }}
        </strong>
        <span class="step-status">{{ getStepStatusLabel(etape.statut) }}</span>
      </div>
    </div>
    <div *ngIf="!demande.etapes?.length" class="no-steps">{{ 'WORKFLOW.NO_STEPS' | translate }}</div>
  </div>
</div>

      <!-- Condition modifiée pour utiliser directement demande.userCanValidate -->
      <div *ngIf="demande.statut === 'PENDING' && demande.userCanValidate" class="validation-section">
        <h3>{{ 'DEMANDE_DETAIL.VALIDATION' | translate }}</h3>
        <textarea [(ngModel)]="commentaire" [placeholder]="'DEMANDE_DETAIL.COMMENT_PLACEHOLDER' | translate" rows="2"></textarea>
        <div>
          <button (click)="valider('APPROVE')">{{ 'DEMANDE_DETAIL.APPROVE_BUTTON' | translate }}</button>
          <button (click)="valider('REJECT')">{{ 'DEMANDE_DETAIL.REJECT_BUTTON' | translate }}</button>
        </div>
        <div *ngIf="validationMessage" class="info">{{ validationMessage }}</div>
      </div>

      <div class="historique">
        <h3>{{ 'DEMANDE_DETAIL.HISTORY' | translate }}</h3>
        <table *ngIf="historique.length > 0">
          <thead>
            <tr>
              <th>{{ 'DEMANDE_DETAIL.HISTORY_DATE' | translate }}</th>
              <th>{{ 'DEMANDE_DETAIL.HISTORY_USER' | translate }}</th>
              <th>{{ 'DEMANDE_DETAIL.HISTORY_ACTION' | translate }}</th>
              <th>{{ 'DEMANDE_DETAIL.HISTORY_COMMENT' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of historique">
              <td>{{ h.dateAction | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ h.utilisateurNom }}</td>
              <td>{{ getHistoryActionLabel(h.action) }}</td>
              <td>{{ h.commentaire }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="historique.length === 0">{{ 'DEMANDE_DETAIL.NO_HISTORY' | translate }}</p>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px; align-items: center;">
        <!-- ========== FIZZY DOWNLOAD BUTTON ========== -->
        <button class="fizzy-download-btn"
                [class.is-loading]="isExporting"
                [class.is-complete]="exportComplete"
                (click)="exportPdf()"
                [disabled]="isExporting || exportComplete">
          <span class="fizzy-particles">
            <i *ngFor="let p of exportParticles" class="fp" [style.--pi]="p"></i>
          </span>
          <span class="fizzy-text">{{ 'DEMANDE_DETAIL.EXPORT_PDF' | translate }}</span>
          <span class="fizzy-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </span>
          <span class="fizzy-spinner"></span>
          <span class="fizzy-check">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </button>
        <!-- ========== FIN FIZZY DOWNLOAD BUTTON ========== -->
        <button routerLink="/demandes">{{ 'DEMANDE_DETAIL.BACK_TO_LIST' | translate }}</button>
      </div>
    </div>
    <div *ngIf="!demande" class="loading">{{ 'DEMANDE_DETAIL.LOADING' | translate }}</div>
  `,
  styles: [`
    /* ========== ULTRA PRO MAX STYLES + DARK MODE ========== */
    :host {
      display: block;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 100vh;
      padding: 2rem 1rem;
      transition: background 0.3s;
    }

    :host-context(.dark-theme) {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }

    /* Variables clair (défaut) */
    :host {
      --bg-card: rgba(255, 255, 255, 0.96);
      --text-primary: #1e293b;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --border-light: rgba(31, 46, 90, 0.03);
      --shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.08);
      --shadow-hover: 0 20px 32px -12px rgba(31, 46, 90, 0.12);
      --heading-color: #1F2E5A;
      --subheading-color: #2c3f70;
      --badge-pending-bg: #fef3c7;
      --badge-pending-color: #b45309;
      --badge-approved-bg: #d1fae5;
      --badge-approved-color: #065f46;
      --badge-rejected-bg: #fee2e2;
      --badge-rejected-color: #b91c2c;
      --li-bg: #f8fafc;
      --li-border: #e2e8f0;
      --pre-bg: #f1f5f9;
      --step-bg: #f8fafc;
      --step-border: #e2e8f0;
      --step-number-bg: #cbd5e1;
      --step-number-color: #1e293b;
      --step-label-color: #334155;
      --step-completed-bg: linear-gradient(135deg, #d1fae5, #a7f3d0);
      --step-completed-border: #10b981;
      --step-current-bg: linear-gradient(135deg, #fff7ed, #ffedd5);
      --step-current-border: #f59e0b;
      --textarea-bg: white;
      --textarea-border: #e2e8f0;
      --info-bg: #e6f7e6;
      --info-color: #065f46;
      --table-header-bg: #f1f5f9;
      --table-border: #e2e8f0;
      --table-hover-bg: #f8fafc;
      --btn-secondary-bg: transparent;
      --btn-secondary-border: #cbd5e1;
      --btn-secondary-color: #1F2E5A;
    }

    /* Mode sombre */
    :host-context(.dark-theme) {
      --bg-card: rgba(30, 41, 59, 0.96);
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --border-light: rgba(255, 255, 255, 0.03);
      --shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.25);
      --shadow-hover: 0 20px 32px -12px rgba(0, 0, 0, 0.4);
      --heading-color: #e2e8f0;
      --subheading-color: #cbd5e1;
      --badge-pending-bg: #78350f;
      --badge-pending-color: #fbbf24;
      --badge-approved-bg: #14532d;
      --badge-approved-color: #4ade80;
      --badge-rejected-bg: #7f1d1d;
      --badge-rejected-color: #f87171;
      --li-bg: #1e293b;
      --li-border: #334155;
      --pre-bg: #0f172a;
      --step-bg: #1e293b;
      --step-border: #334155;
      --step-number-bg: #475569;
      --step-number-color: #e2e8f0;
      --step-label-color: #cbd5e1;
      --step-completed-bg: linear-gradient(135deg, #14532d, #0a3b1e);
      --step-completed-border: #4ade80;
      --step-current-bg: linear-gradient(135deg, #78350f, #451a03);
      --step-current-border: #f59e0b;
      --textarea-bg: #1e293b;
      --textarea-border: #475569;
      --info-bg: #064e3b;
      --info-color: #a7f3d0;
      --table-header-bg: #0f172a;
      --table-border: #334155;
      --table-hover-bg: #1e293b;
      --btn-secondary-bg: transparent;
      --btn-secondary-border: #475569;
      --btn-secondary-color: #e2e8f0;
    }

    /* Fade-in animation for all content */
    h2, .detail-card, .detail-section, .workflow-diagram, .validation-section, .historique {
      animation: fadeSlideUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }

    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Main heading */
    h2 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #1F2E5A 0%, #2c3f70 100%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 2rem;
      position: relative;
      display: inline-block;
    }
    :host-context(.dark-theme) h2 {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
      background-clip: text;
      -webkit-background-clip: text;
    }

    h2::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 70px;
      height: 3px;
      background: linear-gradient(90deg, #E21C2A, #1F2E5A);
      border-radius: 3px;
    }

    /* Card style for info blocks */
    .detail-card, .detail-section, .workflow-diagram, .validation-section, .historique {
      background: var(--bg-card);
      backdrop-filter: blur(2px);
      border-radius: 28px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-light);
      padding: 1.8rem 2rem;
      margin-bottom: 2rem;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    .detail-card:hover, .detail-section:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }

    /* Section headings */
    h3 {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--heading-color);
      margin-top: 0;
      margin-bottom: 1.2rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #E21C2A;
      display: inline-block;
    }

    h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.8rem 0;
      color: var(--subheading-color);
      border-left: 3px solid #E21C2A;
      padding-left: 0.75rem;
    }

    /* Text styles */
    p, div:not(.step) {
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--text-primary);
    }

    strong {
      color: var(--text-secondary);
      font-weight: 600;
    }

    /* Badge for global status */
    .badge {
      display: inline-block;
      padding: 0.2rem 0.7rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge.PENDING {
      background: var(--badge-pending-bg);
      color: var(--badge-pending-color);
    }
    .badge.APPROVED {
      background: var(--badge-approved-bg);
      color: var(--badge-approved-color);
    }
    .badge.REJECTED {
      background: var(--badge-rejected-bg);
      color: var(--badge-rejected-color);
    }

    /* Lists inside details */
    ul {
      list-style: none;
      padding-left: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin: 0.5rem 0 1rem;
    }
    li {
      background: var(--li-bg);
      padding: 0.3rem 1rem;
      border-radius: 40px;
      font-size: 0.85rem;
      color: var(--text-primary);
      border: 1px solid var(--li-border);
    }

    pre {
      background: var(--pre-bg);
      padding: 0.75rem;
      border-radius: 16px;
      font-size: 0.8rem;
      overflow-x: auto;
      color: var(--text-primary);
    }

    /* Styles pour les sous‑blocs (Accès Programmes) */
    .sub-block {
      margin-bottom: 1rem;
    }
    .sub-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--heading-color);
    }
    .sub-icon {
      font-size: 1.2rem;
    }

    /* Nouveau style pour la timeline (workflow visual) */
    .steps-timeline {
      margin-top: 0.8rem;
      background: var(--step-bg);
      border-radius: 20px;
      padding: 1rem;
    }

    .timeline-step {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.6rem 0;
      border-bottom: 1px dashed var(--step-border);
    }

    .timeline-step:last-child {
      border-bottom: none;
    }

    .step-bullet {
      width: 28px;
      height: 28px;
      background: var(--step-number-bg);
      color: var(--step-number-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.8rem;
    }

    .step-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .step-info strong {
      color: var(--text-primary);
    }

    .step-type-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 700;
    }
    .step-type-badge.local {
      background: #dcfce7;
      color: #15803d;
    }
    .step-type-badge.extern {
      background: #ffe4e2;
      color: #b91c2c;
    }
    :host-context(.dark-theme) .step-type-badge.local {
      background: #14532d;
      color: #4ade80;
    }
    :host-context(.dark-theme) .step-type-badge.extern {
      background: #7f1d1d;
      color: #f87171;
    }

    .step-status {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
    }

    .no-steps {
      text-align: center;
      color: var(--text-muted);
      padding: 1rem;
    }

    /* Validation section */
    .validation-section textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-family: inherit;
      background: var(--textarea-bg);
      border: 1px solid var(--textarea-border);
      border-radius: 20px;
      font-size: 0.9rem;
      resize: vertical;
      transition: all 0.2s;
      color: var(--text-primary);
    }
    .validation-section textarea:focus {
      outline: none;
      border-color: #1F2E5A;
      box-shadow: 0 0 0 3px rgba(31, 46, 90, 0.15);
    }
    :host-context(.dark-theme) .validation-section textarea:focus {
      border-color: #E21C2A;
      box-shadow: 0 0 0 3px rgba(226, 28, 42, 0.2);
    }
    .validation-section div {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .validation-section button {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      padding: 0.6rem 1.6rem;
      border-radius: 40px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    :host-context(.dark-theme) .validation-section button {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
    }
    .validation-section button:hover {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(226, 28, 42, 0.25);
    }
    .validation-section button:active {
      transform: translateY(1px);
    }
    .validation-section .info {
      margin-top: 1rem;
      padding: 0.7rem;
      background: var(--info-bg);
      border-left: 4px solid #10b981;
      border-radius: 16px;
      color: var(--info-color);
    }

    /* Historique table */
    .historique table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.85rem;
    }
    .historique th, .historique td {
      padding: 0.75rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid var(--table-border);
      color: var(--text-primary);
    }
    .historique th {
      font-weight: 700;
      color: var(--heading-color);
      background: var(--table-header-bg);
    }
    .historique tr:hover td {
      background: var(--table-hover-bg);
    }

    /* Action buttons at bottom */
    button {
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: none;
      padding: 0.6rem 1.6rem;
      border-radius: 40px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      font-size: 0.85rem;
    }
    :host-context(.dark-theme) button {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
    }
    button:hover {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(226, 28, 42, 0.2);
    }
    button[routerLink="/demandes"] {
      background: var(--btn-secondary-bg);
      color: var(--btn-secondary-color);
      border: 1px solid var(--btn-secondary-border);
    }
    button[routerLink="/demandes"]:hover {
      background: var(--table-hover-bg);
      border-color: var(--text-muted);
      transform: translateY(-1px);
      box-shadow: none;
    }

    /* Loading state */
    .loading {
      text-align: center;
      font-size: 1.2rem;
      color: var(--heading-color);
      padding: 3rem;
    }

    /* ============================================================
       ========== FIZZY DOWNLOAD BUTTON — FULL ANIMATION ==========
       ============================================================ */

    /* --- Particle setup via CSS custom properties --- */
    .fp {
      position: absolute;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
      will-change: transform, opacity;
      pointer-events: none;

      /* Each particle gets unique values from --pi (set via [style.--pi]="p") */
      --angle: calc(var(--pi) * 15deg);
      --dist:  calc(28px + var(--pi) * 2px);
      --ps:    calc(3px + var(--pi) * 0.3px);
      --pc:    hsl(calc(340 + var(--pi) * 8), 78%, 65%);
      --dur:   calc(0.65s + var(--pi) * 0.025s);
      --delay: calc(var(--pi) * 0.045s);

      width:  var(--ps);
      height: var(--ps);
      background: var(--pc);
      box-shadow: 0 0 6px 1px var(--pc);
    }

    /* --- Fallback for browsers without trig functions --- */
    @supports not (cos: 0deg) {
      .fp { display: none; }
    }

    /* --- HOVER: particles float outward continuously --- */
    .fizzy-download-btn:not(.is-loading):not(.is-complete):hover .fp {
      animation: fpFloat var(--dur) var(--delay) ease-out infinite;
    }

    @keyframes fpFloat {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
      }
      25% {
        opacity: 0.95;
      }
      100% {
        opacity: 0;
        transform:
          translate(
            calc(-50% + cos(var(--angle)) * var(--dist)),
            calc(-50% + sin(var(--angle)) * var(--dist))
          )
          scale(0.25);
      }
    }

    /* --- CLICK BURST: particles explode outward once --- */
    .fizzy-download-btn.is-loading .fp {
      animation: fpBurst 0.9s calc(var(--delay) * 0.6) ease-out forwards;
    }

    @keyframes fpBurst {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.2);
      }
      30% {
        opacity: 1;
        box-shadow: 0 0 14px 3px var(--pc);
      }
      100% {
        opacity: 0;
        transform:
          translate(
            calc(-50% + cos(var(--angle)) * calc(var(--dist) * 2.8)),
            calc(-50% + sin(var(--angle)) * calc(var(--dist) * 2.8))
          )
          scale(0);
      }
    }

    /* --- COMPLETE BURST: green particles explode --- */
    .fizzy-download-btn.is-complete .fp {
      --pc: hsl(calc(140 + var(--pi) * 5), 85%, 60%);
      animation: fpGreenBurst 0.7s calc(var(--delay) * 0.4) ease-out forwards;
    }

    @keyframes fpGreenBurst {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.4);
      }
      25% {
        opacity: 1;
        box-shadow: 0 0 16px 4px var(--pc);
      }
      100% {
        opacity: 0;
        transform:
          translate(
            calc(-50% + cos(var(--angle)) * calc(var(--dist) * 3.2)),
            calc(-50% + sin(var(--angle)) * calc(var(--dist) * 3.2))
          )
          scale(0);
      }
    }

    /* --- Main button container --- */
    .fizzy-download-btn {
      position: relative;
      overflow: visible;
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border: 2px solid rgba(255, 255, 255, 0.12);
      padding: 0.6rem 2rem 0.6rem 1.6rem;
      border-radius: 40px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition:
        background 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        min-width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0.45s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.2s ease;
      font-family: inherit;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 190px;
      height: 42px;
      justify-content: center;
      contain: layout style;
    }

    :host-context(.dark-theme) .fizzy-download-btn {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
      border-color: rgba(255, 255, 255, 0.08);
    }

    /* --- Particles wrapper --- */
    .fizzy-particles {
      position: absolute;
      inset: -20px;
      pointer-events: none;
      z-index: 0;
      overflow: visible;
    }

    /* --- Text label --- */
    .fizzy-text {
      position: relative;
      z-index: 1;
      white-space: nowrap;
      transition:
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        margin 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    /* --- Download arrow icon --- */
    .fizzy-arrow {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(6px) scale(0.7);
      transition:
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        margin 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      color: #00C4FF;
      overflow: hidden;
    }

    /* --- Spinner (loading state) --- */
    .fizzy-spinner {
      position: absolute;
      z-index: 1;
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.15);
      border-top-color: #00C4FF;
      border-right-color: #00C4FF;
      border-radius: 50%;
      opacity: 0;
      transform: scale(0.5);
      transition: opacity 0.25s, transform 0.25s;
    }

    /* --- Checkmark (complete state) --- */
    .fizzy-check {
      position: absolute;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0) rotate(-90deg);
      color: white;
      transition: none;
    }

    /* ===================== HOVER STATE ===================== */
    .fizzy-download-btn:not(.is-loading):not(.is-complete):hover {
      background: white;
      color: #1F2E5A;
      border-color: white;
      box-shadow:
        0 8px 30px -8px rgba(0, 196, 255, 0.35),
        0 0 0 1px rgba(0, 196, 255, 0.1);
      transform: translateY(-2px);
    }

    :host-context(.dark-theme) .fizzy-download-btn:not(.is-loading):not(.is-complete):hover {
      background: white;
      color: #E21C2A;
      box-shadow:
        0 8px 30px -8px rgba(226, 28, 42, 0.4),
        0 0 0 1px rgba(226, 28, 42, 0.15);
    }

    .fizzy-download-btn:not(.is-loading):not(.is-complete):hover .fizzy-text {
      transform: translateX(6px);
    }

    .fizzy-download-btn:not(.is-loading):not(.is-complete):hover .fizzy-arrow {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* ===================== LOADING STATE ===================== */
    .fizzy-download-btn.is-loading {
      width: 42px;
      min-width: 42px;
      padding: 0;
      background: linear-gradient(105deg, #1F2E5A, #2a3f78);
      border-color: rgba(255, 255, 255, 0.12);
      color: white;
      cursor: wait;
      transform: scale(1);
      box-shadow: 0 4px 20px -4px rgba(0, 196, 255, 0.3);
    }

    :host-context(.dark-theme) .fizzy-download-btn.is-loading {
      background: linear-gradient(105deg, #E21C2A, #b91c2c);
    }

    .fizzy-download-btn.is-loading .fizzy-text,
    .fizzy-download-btn.is-loading .fizzy-arrow {
      opacity: 0;
      width: 0;
      margin: 0;
      padding: 0;
      overflow: hidden;
      transform: translateY(6px) scale(0.7);
    }

    .fizzy-download-btn.is-loading .fizzy-spinner {
      opacity: 1;
      transform: scale(1);
      animation: fizzySpin 0.75s linear infinite;
    }

    @keyframes fizzySpin {
      to { transform: scale(1) rotate(360deg); }
    }

    /* ===================== COMPLETE STATE ===================== */
    .fizzy-download-btn.is-complete {
      width: 42px;
      min-width: 42px;
      padding: 0;
      background: linear-gradient(135deg, #059669, #10b981);
      border-color: transparent;
      color: white;
      cursor: default;
      transform: scale(1);
      box-shadow:
        0 4px 24px -4px rgba(16, 185, 129, 0.5),
        0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    .fizzy-download-btn.is-complete .fizzy-text,
    .fizzy-download-btn.is-complete .fizzy-arrow,
    .fizzy-download-btn.is-complete .fizzy-spinner {
      opacity: 0;
      width: 0;
      margin: 0;
      padding: 0;
      overflow: hidden;
      transform: scale(0.5);
    }

    .fizzy-download-btn.is-complete .fizzy-check {
      opacity: 1;
      animation: fizzyCheckPop 0.45s 0.08s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes fizzyCheckPop {
      0% {
        opacity: 0;
        transform: scale(0) rotate(-90deg);
      }
      60% {
        opacity: 1;
        transform: scale(1.25) rotate(5deg);
      }
      80% {
        transform: scale(0.95) rotate(-2deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }

    /* --- Pulsing glow ring on complete --- */
    .fizzy-download-btn.is-complete::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 40px;
      border: 2px solid rgba(16, 185, 129, 0.4);
      animation: fizzyPulseRing 1s 0.2s ease-out forwards;
      pointer-events: none;
    }

    @keyframes fizzyPulseRing {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.5);
      }
    }

    /* --- Disabled state (prevents double-click) --- */
    .fizzy-download-btn:disabled {
      cursor: wait;
    }

    /* ===================== RESPONSIVE ===================== */
    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }
      .detail-card, .detail-section, .workflow-diagram, .validation-section, .historique {
        padding: 1rem;
      }
      h2 {
        font-size: 1.6rem;
      }
      .step-info {
        flex-direction: column;
        align-items: flex-start;
      }
      .validation-section div {
        flex-direction: column;
      }
      button {
        width: 100%;
      }
      .fizzy-download-btn {
        min-width: unset;
        width: 100%;
      }
      .fizzy-download-btn.is-loading,
      .fizzy-download-btn.is-complete {
        width: 42px;
        min-width: 42px;
      }
    }
  `]
})
export class DemandeDetailComponent implements OnInit {
  demande: Demande | null = null;
  historique: any[] = [];
  commentaire = '';
  validationMessage = '';

  /* ===== Fizzy button state ===== */
  exportParticles = Array.from({ length: 24 }, (_, i) => i);
  isExporting = false;
  exportComplete = false;

  constructor(
    private route: ActivatedRoute,
    private demandeService: DemandeService,
    private router: Router,
    private translate: TranslateService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.demandeService.getDemande(id).subscribe({
        next: (data) => {
          this.demande = data;
        },
        error: (err) => console.error(err)
      });
      this.demandeService.getHistorique(id).subscribe({
        next: (data) => this.historique = data,
        error: (err) => console.error(err)
      });
    }
  }

  valider(action: string): void {
    if (action === 'REJECT' && !this.commentaire.trim()) {
      this.validationMessage = this.translate.instant('DEMANDE_DETAIL.COMMENT_REQUIRED');
      return;
    }
    this.demandeService.validerDemande({
      demandeId: this.demande!.id,
      action: action,
      commentaire: this.commentaire
    }).subscribe({
      next: () => {
        this.validationMessage = action === 'APPROVE' 
          ? this.translate.instant('DEMANDE_DETAIL.APPROVE_SUCCESS')
          : this.translate.instant('DEMANDE_DETAIL.REJECT_SUCCESS');
        setTimeout(() => {
          this.router.navigate(['/demandes']);
        }, 1000);
        this.commentaire = '';
      },
      error: (err) => {
        this.validationMessage = this.translate.instant('DEMANDE_DETAIL.ERROR_PREFIX') + (err.error?.message || err.message);
      }
    });
  }

  exportPdf(): void {
    if (this.isExporting || this.exportComplete) return;

    this.isExporting = true;
    const currentLang = this.translationService.getCurrentLang();
    console.log('Langue demandée pour le PDF :', currentLang);

    this.demandeService.exportPdf(this.demande!.id, false, currentLang).subscribe({
      next: (blob) => {
        /* Ensure the loading animation runs for at least 1.4s */
        setTimeout(() => {
          this.isExporting = false;
          this.exportComplete = true;

          /* After the checkmark animation finishes, trigger the actual download */
          setTimeout(() => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `demande_${this.demande!.id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            this.exportComplete = false;
          }, 850);
        }, 1400);
      },
      error: (err) => {
        this.isExporting = false;
        console.error('Erreur lors de l\'export PDF :', err);
      }
    });
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'PENDING': return this.translate.instant('DEMANDES_LIST.PENDING');
      case 'APPROVED': return this.translate.instant('DEMANDES_LIST.APPROVED');
      case 'REJECTED': return this.translate.instant('DEMANDES_LIST.REJECTED');
      default: return statut;
    }
  }

  getStepStatusLabel(statut: string): string {
    switch (statut) {
      case 'PENDING': return this.translate.instant('WORKFLOW.STEP_PENDING');
      case 'APPROVED': return this.translate.instant('WORKFLOW.STEP_APPROVED');
      case 'REJECTED': return this.translate.instant('WORKFLOW.STEP_REJECTED');
      default: return statut;
    }
  }

  getHistoryActionLabel(action: string): string {
    switch (action) {
      case 'APPROVE': return this.translate.instant('DEMANDE_DETAIL.HISTORY_ACTION_APPROVE');
      case 'REJECT': return this.translate.instant('DEMANDE_DETAIL.HISTORY_ACTION_REJECT');
      default: return action;
    }
  }

  getAplicacionesKeys(): string[] {
    if (this.demande?.detail?.accesProgrammes?.aplicaciones) {
      return Object.keys(this.demande.detail.accesProgrammes.aplicaciones).filter(
        key => this.demande!.detail.accesProgrammes.aplicaciones[key] === true
      );
    }
    return [];
  }
}