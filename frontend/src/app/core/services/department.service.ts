import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Department {
  id: number;
  name: string;
  chefId?: number;
  chefName?: string;
  local?: boolean;          // true = interne (T/), false = externe (Z/)
  secondChefId?: number;
  secondChefName?: string;
}

export interface GroupedDepartments {
  locaux: Department[];   // départements internes
  externes: Department[]; // départements externes
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  // ✅ Nouvelle méthode pour obtenir les départements groupés (locaux / externes)
  getDepartmentsGrouped(): Observable<GroupedDepartments> {
    return this.http.get<GroupedDepartments>(`${this.apiUrl}/departments/grouped`);
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(dept: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, dept);
  }

  updateDepartment(id: number, dept: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${id}`, dept);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
  }
}