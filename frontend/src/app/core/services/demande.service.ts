import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Demande {
  id: number;
  titre: string;
  description: string;
  demandeurId: number;
  demandeurNom: string;
  createurNom: string;
  workflowNom: string;
  statut: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  dateCreation: string;
  etapeCourante: number;
  totalEtapes: number;
  detail?: any;
  etapes: Array<{
    ordre: number;
    nomValidateur: string;
    statut: string;
  }>;
  userCanValidate?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDemandes(page: number = 0, size: number = 10, statut?: string, myAction?: string): Observable<Page<Demande>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    if (myAction) params = params.set('myAction', myAction);
    return this.http.get<Page<Demande>>(`${this.apiUrl}/demandes`, { params });
  }

  getDemande(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/demandes/${id}`);
  }

  createDemande(demande: any): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/demandes`, demande);
  }

  validerDemande(validation: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes/valider`, validation);
  }

  getDiagramme(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/demandes/${id}/diagramme`);
  }

  // ✅ Correction définitive : utilisation de HttpParams pour un encodage fiable
  exportPdf(id: number, full: boolean = false, lang: string = 'fr'): Observable<Blob> {
    const params = new HttpParams()
      .set('full', full.toString())
      .set('lang', lang);
    const url = `${this.apiUrl}/demandes/${id}/export-pdf`;
    return this.http.get(url, { params, responseType: 'blob' });
  }

  getHistorique(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/demandes/${id}/historique`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/demandes/stats`);
  }

  /**
   * Returns data for the radar chart.
   * Replace with real endpoint when available.
   * Expected format: Array of { name: string, series: Array<{ name: string, value: number }> }
   */
  getRadarData(): Observable<any[]> {
    // 🔁 TODO: replace with actual API call
    // return this.http.get<any[]>(`${this.apiUrl}/demandes/radar-stats`);

    // 🧪 Mock data (ultra‑pro demo)
    const mockRadarData = [
      {
        name: 'Services généraux',
        series: [
          { name: 'Mobilier', value: 12 },
          { name: 'Parking', value: 8 },
          { name: 'Carte resto', value: 15 },
          { name: 'Casier', value: 5 }
        ]
      },
      {
        name: 'Téléphonie',
        series: [
          { name: 'Fixe', value: 9 },
          { name: 'Mobile', value: 14 },
          { name: 'Smartphone', value: 11 }
        ]
      },
      {
        name: 'Informatique',
        series: [
          { name: 'PC Bureau', value: 18 },
          { name: 'PC Portable', value: 22 },
          { name: 'Carte nomade', value: 7 }
        ]
      },
      {
        name: 'Accès & Banque',
        series: [
          { name: 'Accès serveur', value: 6 },
          { name: 'Banque Themis', value: 4 },
          { name: 'Autre banque', value: 3 }
        ]
      }
    ];
    return of(mockRadarData);
  }

  // ✅ Nouvelle méthode : récupérer la dernière demande d'un employé
  getLastDemandeByEmployeeId(employeeId: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/demandes/employee/${employeeId}/last`);
  }
}