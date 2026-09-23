import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { FirstLoginGuard } from './core/guards/first-login.guard';
import { RhUsersComponent } from './features/rh/rh-users.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'change-password', loadComponent: () => import('./features/auth/change-password.component').then(m => m.ChangePasswordComponent), canActivate: [AuthGuard, FirstLoginGuard] },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'demandes/new', loadComponent: () => import('./features/demandes/demande-form.component').then(m => m.DemandeFormComponent) },
      { path: 'demandes/:id', loadComponent: () => import('./features/demandes/demande-detail.component').then(m => m.DemandeDetailComponent) },
      { path: 'demandes', loadComponent: () => import('./features/demandes/demandes-list.component').then(m => m.DemandesListComponent) },
      { path: 'profil', loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent) },
      { path: 'historique', loadComponent: () => import('./features/historique/historique.component').then(m => m.HistoriqueComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [AuthGuard] },
      { path: 'admin/users', loadComponent: () => import('./features/admin/users.component').then(m => m.AdminUsersComponent) },
      { path: 'admin/departments', loadComponent: () => import('./features/admin/departments.component').then(m => m.AdminDepartmentsComponent) },
      { path: 'admin/workflows', loadComponent: () => import('./features/admin/workflows.component').then(m => m.AdminWorkflowsComponent) },
      // Route pour les workflows de suppression
      { path: 'admin/delete-workflows', loadComponent: () => import('./features/admin/workflows.component').then(m => m.AdminWorkflowsComponent), data: { type: 'delete' } },
      // ✅ Nouvelle route pour le responsable RH (CHEF_DEPT du département RH)
      { path: 'rh/users', component: RhUsersComponent, canActivate: [AuthGuard], data: { roles: ['CHEF_DEPT'] } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];