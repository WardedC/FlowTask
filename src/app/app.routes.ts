import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LogginComponent } from './pages/loggin/loggin.component';
import { WorkspaceListComponent } from './pages/workspace-list/workspace-list.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, 
      children: [ 
        { path: '', component: WorkspaceListComponent },
        { path: 'workspaces/:id', component: WorkspaceComponent }
      ]
    },
    { path: 'login', component: LogginComponent },
    { path: '**', redirectTo: '/home' } // Wildcard route para páginas no encontradas
];
