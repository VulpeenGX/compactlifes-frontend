import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
  discount?: number; // descuento en porcentaje, si existe
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, AfterViewInit {
  wishlist: { [key: string]: boolean } = {}; // Usa 'key' como string

  toggleWishlist(productId: number) {
    const id = productId.toString(); // Convertir a string
    this.wishlist[id] = !this.wishlist[id]; // Alternar estado
  }

  isInWishlist(productId: number): boolean {
    return !!this.wishlist[productId.toString()]; // Convertir a string antes de buscar
  }


  // Productos originales (se actualizó la URL de la imagen para pruebas)
  products: Product[] = [
    { id: 1, title: 'Producto 1', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 2, title: 'Producto 2', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 3, title: 'Producto 3', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 4, title: 'Producto 4', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 },
    { id: 12, title: 'Producto 11', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 23, title: 'Producto 22', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 34, title: 'Producto 33', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 41, title: 'Producto 44', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 },
    { id: 17, title: 'Producto 15', price: 29.99, description: 'Descripción del producto 1', imageUrl: './assets/products/product.png', inStock: true, discount: 10 },
    { id: 29, title: 'Producto 26', price: 49.99, description: 'Descripción del producto 2', imageUrl: './assets/products/product.png', inStock: false },
    { id: 38, title: 'Producto 30', price: 19.99, description: 'Descripción del producto 3', imageUrl: './assets/products/product.png', inStock: true },
    { id: 40, title: 'Producto 47', price: 59.99, description: 'Descripción del producto 4', imageUrl: './assets/products/product.png', inStock: true, discount: 15 }
  ];

  // Arreglo para lograr el efecto infinito (se repite tres veces)
  displayProducts: Product[] = [];

  // Referencia al contenedor del carrusel para controlar el scroll y el efecto infinito
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  // Variables para la funcionalidad de "drag"
  isDown: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;

  // Ancho de una tarjeta y del grupo de productos originales (para reposicionar el scroll)
  cardWidth: number = 0;
  cloneWidth: number = 0;

  ngOnInit() {
    // Triplicamos el arreglo para lograr el efecto infinito
    this.displayProducts = [...this.products, ...this.products, ...this.products];
  }

  ngAfterViewInit() {
    // Esperamos a que se rendericen los elementos para obtener sus dimensiones
    setTimeout(() => {
      const container = this.carousel.nativeElement;
      const card = container.querySelector('.product-card');
      if (card) {
        this.cardWidth = card.clientWidth;
        // cloneWidth es el ancho total de una copia de la lista original
        this.cloneWidth = this.cardWidth * this.products.length;
        // Posicionamos el scroll para que inicie en la copia central
        container.scrollLeft = this.cloneWidth;
      }
    }, 0);
  }

  // Funciones para el arrastre con mouse
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
    const walk = (x - this.startX) * 2; // Factor para ajustar la velocidad
    this.carousel.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  // Función para reposicionar el scroll y lograr el efecto infinito
  onScroll() {
    const container = this.carousel.nativeElement;
    if (!this.cloneWidth) return;

    if (container.scrollLeft < this.cloneWidth * 0.5) {
      container.scrollLeft += this.cloneWidth;
    } else if (container.scrollLeft >= this.cloneWidth * 1.5) {
      container.scrollLeft -= this.cloneWidth;
    }
  }

  // Métodos simulados para las acciones de wishlist y carrito
  addToWishlist(product: Product) {
    console.log('Agregado a wishlist:', product);
    // Aquí iría la lógica real de wishlist
  }

  addToCart(product: Product) {
    console.log('Agregado al carrito:', product);
    // Aquí iría la lógica real del carrito
  }
}