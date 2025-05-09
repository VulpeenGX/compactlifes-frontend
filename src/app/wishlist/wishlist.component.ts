import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

interface WishlistProduct {
  id: number;
  nombre?: string;
  precio?: number;
  descripcion?: string;
  imagen?: string;
  stock?: boolean;
  descuento?: number;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: WishlistProduct[] = [];
  isLoggedIn: boolean = false;
  user = {
    name: '',
    profileImage: './assets/images/profile.jpg'
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    public wishlistService: WishlistService,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios en la wishlist
    this.subscriptions.push(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlistItems = items;
      })
    );
    
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.user.name = user.nombre;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método para eliminar un producto de la wishlist
  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
  }

  // Método para añadir un producto al carrito
  addToCart(product: WishlistProduct): void {
    this.cartService.addToCart(product);
  }
  
  // Método faltante que se utiliza en la plantilla
  getPrecioConDescuento(product: WishlistProduct): number {
    if (!product.descuento || product.descuento <= 0) {
      return product.precio || 0;
    }
    return (product.precio || 0) - ((product.precio || 0) * (product.descuento || 0)) / 100;
  }
  
  // Método faltante que se utiliza en la plantilla
  goToProducts(): void {
    this.router.navigate(['/product-listing']);
  }

  // Método para navegar a la página principal
  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
