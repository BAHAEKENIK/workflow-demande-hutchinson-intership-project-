import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export interface Workflow {
  id: number;
  nom: string;
  type: string;
  actif: boolean;
  etapes?: any[];
  departmentIds?: number[];
}

export interface WorkflowCreate {
  nom: string;
  departmentIds: number[];
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWorkflows(type?: string): Observable<Workflow[]> {
    let url = `${this.apiUrl}/workflows`;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<Workflow[]>(url);
  }

  getActiveDemandeWorkflow(): Observable<Workflow> {
    return this.getWorkflows('DEMANDE').pipe(
      map(workflows => {
        if (workflows.length === 0) {
          throw new Error('Aucun workflow DEMANDE actif configuré');
        }
        return workflows[0];
      })
    );
  }

  getActiveSuppressionWorkflow(): Observable<Workflow> {
    return this.getWorkflows('SUPPRESSION').pipe(
      map(workflows => {
        if (workflows.length === 0) {
          throw new Error('Aucun workflow SUPPRESSION actif configuré');
        }
        return workflows[0];
      })
    );
  }

  createWorkflow(data: WorkflowCreate): Observable<Workflow> {
    return this.http.post<Workflow>(`${this.apiUrl}/workflows`, data);
  }

  createSuppressionWorkflow(data: WorkflowCreate): Observable<Workflow> {
    return this.http.post<Workflow>(`${this.apiUrl}/workflows/suppression`, data);
  }

  deleteWorkflow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/workflows/${id}`);
  }

  updateWorkflow(id: number, data: WorkflowCreate): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.apiUrl}/workflows/${id}`, data);
  }

  deleteWorkflowPermanently(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/workflows/permanent/${id}`);
  }

  getWorkflow(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/workflows/${id}`);
  }

  // ========== GESTION DU WORKFLOW PAR DÉFAUT ==========

  setDefaultWorkflow(id: number, type: string): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.apiUrl}/workflows/${id}/set-default?type=${type}`, {});
  }

  getDefaultWorkflow(type: string): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/workflows/default?type=${type}`);
  }
}