import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
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
    private apiService: ApiService,
    private wishlistService: WishlistService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.subscriptions.push(
      this.apiService.getProductsOffers().subscribe((data: any) => {
        this.products = data;
        // Clonamos los productos para el efecto infinito si es necesario o simplemente los asignamos
        // Si tu HTML ya maneja la clonación o no la necesitas, puedes usar:
        this.displayProducts = this.products;
        // Si necesitas clonar para el efecto infinito en el template:
        // this.displayProducts = [...this.products, ...this.products, ...this.products];

        // Asegurarse de que el DOM se actualice antes de inicializar
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
      // La notificación ahora se maneja dentro del servicio o donde sea más apropiado
      // Si necesitas la notificación aquí específicamente al añadir:
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

    const card = container.querySelector('.product-card'); // Asegúrate que la clase coincida con tu HTML
    if (card) {
      this.cardWidth = card.clientWidth; // O usa offsetWidth si clientWidth no es adecuado
      // Ajusta cloneWidth según cómo manejes el bucle infinito en el HTML
      // Si clonas los productos 3 veces en displayProducts:
      // this.cloneWidth = this.cardWidth * this.products.length;
      // container.scrollLeft = this.cloneWidth; // Posición inicial para el efecto infinito
      // Si no clonas en displayProducts y el HTML no lo hace, quizás no necesites cloneWidth
      this.cloneWidth = this.cardWidth * this.products.length; // Asumiendo que necesitas el cálculo para onScroll
      // Puede que no necesites establecer scrollLeft aquí si no clonas
    }
  }

  ngAfterViewInit() {
    // La inicialización ahora se llama después de cargar los productos en loadProducts
    // Puedes dejar esto vacío o usarlo para otra lógica post-renderizado si es necesario
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
    // Asegúrate que cloneWidth tenga un valor antes de usarlo
    if (!this.cloneWidth || this.products.length === 0) return;

    // La lógica de scroll infinito puede necesitar ajustes dependiendo de tu implementación HTML exacta
    // Este es un ejemplo común si has triplicado los items en displayProducts
    if (container.scrollLeft < this.cloneWidth * 0.5) { // Si el scroll está cerca del inicio de la segunda copia
      container.scrollLeft += this.cloneWidth; // Salta al inicio de la tercera copia (imperceptiblemente)
    } else if (container.scrollLeft >= this.cloneWidth * 1.5) { // Si el scroll está cerca del final de la segunda copia
      container.scrollLeft -= this.cloneWidth; // Salta al final de la primera copia (imperceptiblemente)
    }
  }

  // El método addToWishlist fue eliminado porque toggleWishlist ya hace el trabajo.

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}