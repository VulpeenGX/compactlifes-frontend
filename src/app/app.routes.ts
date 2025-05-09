import { Routes } from '@angular/router';
import { HomeViewComponentComponent } from './home-view-component/home-view-component.component';
import { AuthComponentComponent } from './auth-component/auth-component.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { AccountComponent } from './account/account.component';
import { ProductComponent } from './product/product.component';
export const routes: Routes = [
    {path: '', component: HomeViewComponentComponent},
    {path: 'login', component: AuthComponentComponent},
    {path: 'register', component: AuthComponentComponent},
    {path: 'wishlist', component: WishlistComponent},
    {path: 'cart', component: CartComponent},
    {path: 'checkout', component: CheckoutComponent},
    {path: 'product-listing', component: ProductListingComponent},
    {path: 'account', component: AccountComponent},
    {path: 'product', component: ProductComponent},
];


