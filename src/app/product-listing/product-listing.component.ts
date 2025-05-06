import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { NotificationService } from '../services/notification.service';
import { Subscription, forkJoin } from 'rxjs';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Product {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  stock: boolean;
  descuento?: number;
  categoria?: number;
  categoria_data?: Categoria;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent implements OnInit, OnDestroy {
  // Productos
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedCategories: number[] = [];
  priceRange: { min: number, max: number } = { min: 0, max: 1000 };
  minPossiblePrice: number = 0;
  maxPossiblePrice: number = 1000;
  showOnlyInStock: boolean = false;
  showOnlyDiscounted: boolean = false;
  
  // Ordenamiento
  sortOption: string = 'default';
  
  // Categorías disponibles
  availableCategories: Categoria[] = [];
  
  // Suscripciones
  private subscriptions: Subscription[] = [];
  
  // Estado del filtro lateral en móvil
  showFilters: boolean = false;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Cargar productos y categorías simultáneamente
    const products$ = this.apiService.getProducts();
    const categories$ = this.apiService.getCategorias(); // Cambiado de getCategoriasConProductos a getCategorias
    
    this.subscriptions.push(
      forkJoin([products$, categories$]).subscribe(([productsData, categoriesData]: [any, any]) => {
        this.allProducts = productsData;
        this.availableCategories = categoriesData;
        
        // Establecer rango de precios basado en los productos
        this.setPriceRange();
        
        // Aplicar filtros iniciales
        this.applyFilters();
      })
    );
  }

  setPriceRange(): void {
    if (this.allProducts.length > 0) {
      // Usar precios sin descuento
      const prices = this.allProducts.map(p => p.precio);
      this.minPossiblePrice = Math.min(...prices);
      this.maxPossiblePrice = Math.max(...prices);
      this.priceRange.min = this.minPossiblePrice;
      this.priceRange.max = this.maxPossiblePrice;
    }
  }

  toggleCategoryFilter(categoryId: number): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index === -1) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(term) || 
        product.descripcion.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por categorías seleccionadas
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        product.categoria && this.selectedCategories.includes(product.categoria)
      );
    }
    
    // Filtrar por rango de precio (sin considerar descuentos)
    filtered = filtered.filter(product => 
      product.precio >= this.priceRange.min && 
      product.precio <= this.priceRange.max
    );
    
    // Filtrar por stock
    if (this.showOnlyInStock) {
      filtered = filtered.filter(product => product.stock);
    }
    
    // Filtrar por descuento
    if (this.showOnlyDiscounted) {
      filtered = filtered.filter(product => product.descuento && product.descuento > 0);
    }
    
    // Aplicar ordenamiento
    this.applySorting(filtered);
  }

  applySorting(products: Product[]): void {
    switch (this.sortOption) {
      case 'price-asc':
        this.filteredProducts = products.sort((a, b) => this.getPrecioConDescuento(a) - this.getPrecioConDescuento(b));
        break;
      case 'price-desc':
        this.filteredProducts = products.sort((a, b) => this.getPrecioConDescuento(b) - this.getPrecioConDescuento(a));
        break;
      case 'name-asc':
        this.filteredProducts = products.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'name-desc':
        this.filteredProducts = products.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'discount':
        this.filteredProducts = products.sort((a, b) => (b.descuento || 0) - (a.descuento || 0));
        break;
      default:
        this.filteredProducts = products;
    }
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.showOnlyInStock = false;
    this.showOnlyDiscounted = false;
    this.sortOption = 'default';
    
    // Restablecer el rango de precios a los valores originales
    if (this.allProducts.length > 0) {
      const prices = this.allProducts.map(p => p.precio);
      this.priceRange.min = Math.min(...prices);
      this.priceRange.max = Math.max(...prices);
    } else {
      this.priceRange.min = 0;
      this.priceRange.max = 1000;
    }
    
    this.applyFilters();
    this.notificationService.showNotification('Filtros restablecidos', 'info');
  }

  toggleFiltersVisibility(): void {
    this.showFilters = !this.showFilters;
  }

  // Métodos para wishlist
  toggleWishlist(product: Product): void {
    this.wishlistService.toggleWishlistItem(product as WishlistItem);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // Métodos para carrito
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  // Método para calcular precio con descuento
  getPrecioConDescuento(product: Product): number {
    if (!product.descuento || product.descuento <= 0) {
      return product.precio;
    }
    return product.precio - (product.precio * product.descuento / 100);
  }

  // Método para obtener el nombre de la categoría por su ID
  getCategoryName(categoryId: number): string {
    const category = this.availableCategories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
