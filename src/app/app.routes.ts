import { Routes } from '@angular/router';
import { HomeViewComponentComponent } from './home-view-component/home-view-component.component';
import { AuthComponentComponent } from './auth-component/auth-component.component';

export const routes: Routes = [
    {path: '', component: HomeViewComponentComponent},
    {path: 'login', component: AuthComponentComponent},
    {path: 'register', component: AuthComponentComponent},

];


