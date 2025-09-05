import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { KanbanBoard } from './components/kanban-board/kanban-board';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/board', 
    pathMatch: 'full'
  },
  { 
    path: 'login', 
    component: Login,
    canActivate: [noAuthGuard]
  },
  { 
    path: 'board', 
    component: KanbanBoard,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/board' }
];
