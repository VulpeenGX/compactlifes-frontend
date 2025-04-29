import { Routes } from '@angular/router';
import { HomeViewComponentComponent } from './home-view-component/home-view-component.component';
import { AuthComponentComponent } from './auth-component/auth-component.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CartComponent } from './cart/cart.component';
export const routes: Routes = [
    {path: '', component: HomeViewComponentComponent},
    {path: 'login', component: AuthComponentComponent},
    {path: 'register', component: AuthComponentComponent},
    {path: 'wishlist', component: WishlistComponent},
    {path: 'cart', component: CartComponent},

];


