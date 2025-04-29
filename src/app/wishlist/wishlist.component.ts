import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';

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
  wishlistItems: WishlistProduct[] = []; // Usamos solo esta variable para simplificar
  isLoggedIn: boolean = true; // Cambiado a false para probar ambos estados
  user = {
    name: 'Usuario',
    profileImage: './assets/images/profile.jpg'
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    public wishlistService: WishlistService, // Cambiado a público para acceso desde la plantilla
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios en la wishlist
    this.subscriptions.push(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlistItems = items; // Solo actualizamos wishlistItems
      })
    );
  }

  ngOnDestroy() {
    // Limpiar suscripciones
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

  // Método para navegar a la página principal
  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Método para calcular el precio con descuento
  getPrecioConDescuento(product: WishlistProduct): number {
    if (!product.descuento || product.descuento <= 0) {
      return product.precio || 0;
    }
    return (product.precio || 0) - ((product.precio || 0) * (product.descuento || 0)) / 100;
  }
  
  // Método para calcular el ahorro
  getAhorro(product: WishlistProduct): number {
    if (!product.descuento || product.descuento <= 0) {
      return 0;
    }
    return ((product.precio || 0) * (product.descuento || 0)) / 100;
  }
}
