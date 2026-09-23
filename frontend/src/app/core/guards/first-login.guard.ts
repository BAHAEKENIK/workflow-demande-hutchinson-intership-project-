import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirstLoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate() {
    if (!this.authService.isAuthenticated()) {
      return true;
    }
    // return this.userService.getProfile().pipe(
    //   map(user => {
    //     if (user.firstLogin) {
    //       this.router.navigate(['/change-password']);
    //       return false;
    //     }
    //     return true;
    //   }),
    //   catchError(() => {
    //     // En cas d'erreur, on laisse passer (redirection login déjà gérée)
    //     return of(true);
    //   })
    // );
    return true;
  }
}
