import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  firstLogin: boolean;        // Modification: added firstLogin field
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private firstLoginKey = 'first_login';   // Optional: key to store firstLogin flag

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        // Optionnel : stocker firstLogin (ex: localStorage)
        localStorage.setItem(this.firstLoginKey, String(response.firstLogin));
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.firstLoginKey);  // Clean up firstLogin flag on logout
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Optional helper to get firstLogin status
  getFirstLogin(): boolean {
    const value = localStorage.getItem(this.firstLoginKey);
    return value === 'true';
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, request);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }
}