import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: number;
  departmentName?: string;
  firstLogin: boolean;
}

// Interface pour la réponse paginée (Spring Data Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, user);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  deleteUserTransactional(id: number): Observable<void> {
    return this.deleteUser(id);
  }

  getUsersPaginated(page: number, size: number, keyword?: string, role?: string): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (role) params = params.set('role', role);
    return this.http.get<Page<User>>(`${this.apiUrl}/users/paginated`, { params });
  }

  getUsersByDepartment(departmentId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/by-department/${departmentId}`);
  }

  getMyHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/me/history`);
  }

  getMyActionStats(): Observable<{ approved: number; rejected: number }> {
    return this.http.get<{ approved: number; rejected: number }>(`${this.apiUrl}/users/me/stats`);
  }

  bulkDeleteUsers(userIds: number[], commentaire: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/bulk-delete-request`, { userIds, commentaire });
  }

  requestDeleteUser(userId: number, commentaire: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/delete-request`, { commentaire });
  }
}