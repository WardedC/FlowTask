import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LogginComponent } from './pages/loggin/loggin.component';

export const routes: Routes = [

    { path: '', component: HomeComponent },
    { path: 'login', component: LogginComponent },
    
];
