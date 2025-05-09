import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface User {
  name: string;
  email: string;
  address: string;
  phone: string;
  profileImage?: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoggedIn: boolean = false;
  user: User = {
    name: '',
    email: '',
    address: '',
    phone: '',
    profileImage: './assets/icons/profile.svg'
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
      })
    );
    
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.user.name = user.nombre;
          this.user.email = user.email;
          this.user.address = user.direccion;
          this.user.phone = user.telefono;
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item.id);
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    this.cartService.updateQuantity(item.id, newQuantity);
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  getTotal(): number {
    return this.cartService.getCartTotal();
  }
  
  getShippingCost(): number {
    return this.getTotal() < 300 ? 4.99 : 0;
  }
  
  getFinalTotal(): number {
    return this.getTotal() * 1.21 + this.getShippingCost();
  }
  
  getPrecioConDescuento(item: CartItem): number {
    if (!item.descuento || item.descuento <= 0) {
      return item.precio || 0;
    }
    return (item.precio || 0) - ((item.precio || 0) * (item.descuento || 0)) / 100;
  }
  
  getTotalAhorro(): number {
    return this.cartItems.reduce((total, item) => {
      const descuento = ((item.precio || 0) * (item.descuento || 0)) / 100;
      return total + (descuento * item.quantity);
    }, 0);
  }
  
  goToProducts(): void {
    this.router.navigate(['/product-listing']);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
  }
}


