import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  stock: boolean;
  descuento?: number; 
}

@Component({
  selector: 'app-carousel2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel2.component.html',
  styleUrls: ['./carousel2.component.css']
})
export class Carousel2Component implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  products: Product[] = [];
  displayProducts: Product[] = [];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;
  isDown: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;
  cardWidth: number = 0;
  cloneWidth: number = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.subscriptions.push(
      this.apiService.getProductsWithoutOffers().subscribe((data: any) => {
        this.products = data;
        this.displayProducts = this.products;
        
        setTimeout(() => {
          this.initializeCarousel();
        }, 0);
      })
    );
  }

  // Métodos para wishlist
  toggleWishlist(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlistItem(product as WishlistItem);
      if (this.isInWishlist(productId)) {
        this.notificationService.showNotification(`${product.nombre} ha sido añadido a la wishlist`, 'wishlist'); // Cambiado a tipo 'wishlist'
      } else {
         // Opcional: Notificación al quitar
         this.notificationService.showNotification(`${product.nombre} ha sido eliminado de la wishlist`, 'info'); // Descomentado y tipo 'info' (o 'deleted' si lo prefieres)
      }
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // Método para carrito
  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notificationService.showNotification(`${product.nombre} ha sido añadido al carrito`, 'cart'); // Cambiado a tipo 'cart'
  }

  initializeCarousel() {
    const container = this.carousel?.nativeElement;
    if (!container || this.products.length === 0) return;

    const card = container.querySelector('.product-card'); // Asegúrate que la clase coincida
    if (card) {
      this.cardWidth = card.clientWidth;
      // Ajusta cloneWidth según cómo manejes el bucle infinito en el HTML
      this.cloneWidth = this.cardWidth * this.products.length;
      // Puede que no necesites establecer scrollLeft aquí si no clonas
      // container.scrollLeft = this.cloneWidth; // Posición inicial si clonas 3 veces
    }
  }

  ngAfterViewInit() {
    // La inicialización se llama después de cargar los productos en loadProducts
  }

  onMouseDown(e: MouseEvent) {
    this.isDown = true;
    this.startX = e.pageX - this.carousel.nativeElement.offsetLeft;
    this.scrollLeft = this.carousel.nativeElement.scrollLeft;
  }

  onMouseLeave() {
    this.isDown = false;
  }

  onMouseUp() {
    this.isDown = false;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.carousel.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2; 
    this.carousel.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  onScroll() {
    const container = this.carousel.nativeElement;
    if (!this.cloneWidth || this.products.length === 0) return;

    // Lógica de scroll infinito (ajustar si es necesario)
    if (container.scrollLeft < this.cloneWidth * 0.5) {
      container.scrollLeft += this.cloneWidth;
    } else if (container.scrollLeft >= this.cloneWidth * 1.5) {
      container.scrollLeft -= this.cloneWidth;
    }
  }

  // El método addToWishlist fue eliminado porque toggleWishlist ya hace el trabajo.

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}