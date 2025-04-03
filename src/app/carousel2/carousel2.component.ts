import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
  discount?: number; 
}

@Component({
  selector: 'app-carousel2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel2.component.html',
  styleUrls: ['./carousel2.component.css']
})
export class Carousel2Component implements OnInit, AfterViewInit {
  wishlist: { [key: string]: boolean } = {}; 

  toggleWishlist(productId: number) {
    const id = productId.toString(); 
  }

  isInWishlist(productId: number): boolean {
    return !!this.wishlist[productId.toString()]; 
  }

  products: Product[] = [
    { id: 1, title: 'Producto 1', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 2, title: 'Producto 2', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 3, title: 'Producto 3', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 4, title: 'Producto 4', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 },
    { id: 1, title: 'Producto 11', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 2, title: 'Producto 22', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 3, title: 'Producto 33', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 4, title: 'Producto 44', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 },
    { id: 1, title: 'Producto 15', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 2, title: 'Producto 26', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 3, title: 'Producto 30', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 4, title: 'Producto 47', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 }
  ];

  displayProducts: Product[] = [];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  isDown: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;

  cardWidth: number = 0;
  cloneWidth: number = 0;

  ngOnInit() {
    this.displayProducts = [...this.products, ...this.products, ...this.products];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.carousel.nativeElement;
      const card = container.querySelector('.product-card');
      if (card) {
        this.cardWidth = card.clientWidth;
        this.cloneWidth = this.cardWidth * this.products.length;
        container.scrollLeft = this.cloneWidth;
      }
    }, 0);
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
}