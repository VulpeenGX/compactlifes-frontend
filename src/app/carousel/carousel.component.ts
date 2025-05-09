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
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
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
    private apiService: ApiService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.subscriptions.push(
      this.apiService.getProductsOffers().subscribe((data: any) => {
        this.products = data;
        this.displayProducts = this.products;
        
        setTimeout(() => {
          this.initializeCarousel();
        }, 0);
      })
    );
  }

  toggleWishlist(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.wishlistService.toggleWishlistItem(product as WishlistItem);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  initializeCarousel() {
    const container = this.carousel?.nativeElement;
    if (!container || this.products.length === 0) return;

    const card = container.querySelector('.product-card');
    if (card) {
      this.cardWidth = card.offsetWidth + 16; 
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
  }
}