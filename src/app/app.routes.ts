import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { KanbanBoard } from './components/kanban-board/kanban-board';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'board', component: KanbanBoard },
  { path: '**', redirectTo: '/login' }
];
