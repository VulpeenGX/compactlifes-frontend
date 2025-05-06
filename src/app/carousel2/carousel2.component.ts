import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
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
  isDragging: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private wishlistService: WishlistService,
    private cartService: CartService,
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
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // Método para carrito
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  initializeCarousel() {
    const container = this.carousel?.nativeElement;
    if (!container || this.products.length === 0) return;

    const card = container.querySelector('.product-card');
    if (card) {
      this.cardWidth = card.offsetWidth + 16; // Ancho + margen
      this.cloneWidth = this.cardWidth * this.products.length;
    }
  }

  ngAfterViewInit() {
    window.addEventListener('resize', () => {
      this.initializeCarousel();
    });
  }

  onMouseDown(e: MouseEvent) {
    this.isDown = true;
    this.isDragging = false;
    this.carousel.nativeElement.classList.add('grabbing');
    this.startX = e.pageX - this.carousel.nativeElement.offsetLeft;
    this.scrollLeft = this.carousel.nativeElement.scrollLeft;
  }

  onMouseLeave() {
    this.isDown = false;
    this.carousel.nativeElement.classList.remove('grabbing');
  }

  onMouseUp() {
    this.isDown = false;
    this.carousel.nativeElement.classList.remove('grabbing');
    
    // Si no hubo arrastre significativo, permitir clics en elementos
    if (!this.isDragging) {
      return;
    }
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    
    const x = e.pageX - this.carousel.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5; // Velocidad de desplazamiento
    
    if (Math.abs(walk) > 5) {
      this.isDragging = true;
    }
    
    this.carousel.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  onScroll() {
    // Simplificamos la lógica de scroll para evitar problemas
    // El scroll infinito puede causar problemas, así que lo eliminamos
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}