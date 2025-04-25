import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { Subscription } from 'rxjs';

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
  wishlist: WishlistProduct[] = [];
  wishlistItems: WishlistProduct[] = []; // Añadido para compatibilidad con la plantilla
  isLoggedIn: boolean = false;
  user = {
    name: 'Usuario',
    profileImage: './assets/images/profile.jpg'
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios en la wishlist
    this.subscriptions.push(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlist = items;
        this.wishlistItems = items; // Sincronizar ambas propiedades
      })
    );
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
}
