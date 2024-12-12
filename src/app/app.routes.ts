import { Routes } from '@angular/router';
import {authenticationGuard} from "./iam/services/authentication.guard";
import {MainLayoutComponent} from "./shared/components/main-layout/main-layout.component";

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authenticationGuard],
    children: [
      {
        path: '',
        title: 'boards',
        loadComponent: () => import('./board/pages/boards/boards.component').then(m => m.BoardsComponent)
      },
      {
        path: 'boards/:id',
        title: 'board',
        loadComponent: () => import('./board/pages/board/board.component').then(m => m.BoardComponent)
      }
    ]
  },
  {
    path: 'login',
    title: 'login',
    loadComponent: () => import('./iam/pages/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: 'register',
    title: 'register',
    loadComponent: () => import('./iam/pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
  },
  {
    path : '**',
    title: 'not-found',
    loadComponent: () => import('./public/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
