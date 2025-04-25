import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Subscription } from 'rxjs';

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
  wishlist: { [key: string]: boolean } = {}; 
  private subscriptions: Subscription[] = [];

  toggleWishlist(productId: number) {
    const id = productId.toString(); 
    this.wishlist[id] = !this.wishlist[id]; 
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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.subscriptions.push(
      this.apiService.getProductsOffers().subscribe((data: any) => {
        this.products = data;
        this.displayProducts = this.products;
      })
    );
  }

  ngAfterViewInit() {
    if (this.products.length > 0) {
      // Initialize carousel properties
      const cards = this.carousel.nativeElement.getElementsByClassName('card');
      if (cards.length > 0) {
        this.cardWidth = cards[0].offsetWidth;
        this.cloneWidth = this.cardWidth * this.products.length;
        this.carousel.nativeElement.scrollLeft = this.cloneWidth;
      }
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
    // lógica de wishlist
  }

  addToCart(product: Product) {
    console.log('Agregado al carrito:', product);
    // lógica del carrito
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}