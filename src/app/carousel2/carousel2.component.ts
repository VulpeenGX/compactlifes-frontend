import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
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
  wishlist: { [key: string]: boolean } = {}; 
  private subscriptions: Subscription[] = [];
  
  constructor(private router: Router, private apiService: ApiService) {}

  toggleWishlist(productId: number) {
    const id = productId.toString(); 
  }

  isInWishlist(productId: number): boolean {
    return !!this.wishlist[productId.toString()]; 
  }

  products: Product[] = [];
  displayProducts: Product[] = [];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  isDown: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;

  cardWidth: number = 0;
  cloneWidth: number = 0;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.subscriptions.push(
      this.apiService.getProductsWithoutOffers().subscribe((data: any) => {
        this.products = data;
        this.displayProducts = this.products; // Mostrar solo los productos recibidos
        
        // Inicializar el carrusel después de cargar los productos
        setTimeout(() => {
          this.initializeCarousel();
        }, 0);
      })
    );
  }

  initializeCarousel() {
    const container = this.carousel?.nativeElement;
    if (!container) return;
    
    const card = container.querySelector('.product-card');
    if (card) {
      this.cardWidth = card.clientWidth;
      this.cloneWidth = this.cardWidth * this.products.length;
      container.scrollLeft = this.cloneWidth;
    }
  }

  ngAfterViewInit() {
    if (this.products.length > 0) {
      this.initializeCarousel();
    }
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
    if (!this.cloneWidth) return;

    if (container.scrollLeft < this.cloneWidth * 0.5) {
      container.scrollLeft += this.cloneWidth;
    } else if (container.scrollLeft >= this.cloneWidth * 1.5) {
      container.scrollLeft -= this.cloneWidth;
    }
  }

  addToWishlist(product: Product) {
    console.log('Agregado a wishlist:', product);
    //  lógica  de wishlist
  }

  addToCart(product: Product) {
    console.log('Agregado al carrito:', product);
    // lógica  del carrito
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}