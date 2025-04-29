import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';

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
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoggedIn: boolean = false;
  user: User = {
    name: 'Usuario de Prueba',
    email: 'usuario@ejemplo.com',
    address: 'Calle Ejemplo 123',
    phone: '123456789',
    profileImage: './assets/icons/profile.svg'
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
    
    // Simulamos que el usuario está logueado para pruebas
    this.isLoggedIn = true;
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

  getShippingCost(): number {
    return this.getTotal() < 300 ? 4.99 : 0;
  }
  
  getFinalTotal(): number {
    return this.getTotal() + this.getShippingCost();
  }
}


