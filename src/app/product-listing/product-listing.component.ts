import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { NotificationService } from '../services/notification.service';
import { Subscription, forkJoin } from 'rxjs';
import { Router } from '@angular/router';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Estancia {
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
  estancia?: number;
  estancia_data?: Estancia;
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
  selectedEstancias: number[] = [];
  priceRange: { min: number, max: number } = { min: 0, max: 1000 };
  minPossiblePrice: number = 0;
  maxPossiblePrice: number = 1000;
  showOnlyInStock: boolean = false;
  showOnlyDiscounted: boolean = false;
  sortOption: string = 'default';
  availableCategories: Categoria[] = [];
  availableEstancias: Estancia[] = [];
  private subscriptions: Subscription[] = [];
  showFilters: boolean = false;
  filtroNombre: string = '';

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.selectedCategories = [];
        this.selectedEstancias = [];
        this.filtroNombre = '';
        
        if (params['categoria']) {
          const categoriaId = Number(params['categoria']);
          this.selectedCategories = [categoriaId];
        }
        
        if (params['estancia']) {
          const estanciaId = Number(params['estancia']);
          this.selectedEstancias = [estanciaId];
        }
        
        if (params['nombre']) {
          this.filtroNombre = params['nombre'];
        }
        
        this.loadData();
      })
    );
  }

  loadData(): void {
    const products$ = this.apiService.getProducts();
    const categories$ = this.apiService.getCategorias();
    const estancias$ = this.apiService.getEstancias();
    
    this.subscriptions.push(
      forkJoin([products$, categories$, estancias$]).subscribe(([productsData, categoriesData, estanciasData]: [any, any, any]) => {
        this.allProducts = productsData;
        this.availableCategories = categoriesData;
        this.availableEstancias = estanciasData;
        this.setPriceRange();
        this.updateFilterNames();
        this.applyFilters();
      })
    );
  }

  updateFilterNames(): void {
    this.filtroNombre = '';
    const filtrosSeleccionados: string[] = [];
    if (this.selectedCategories.length > 0) {
      this.selectedCategories.forEach(categoriaId => {
        const categoria = this.availableCategories.find(cat => cat.id === categoriaId);
        if (categoria) {
          filtrosSeleccionados.push(categoria.nombre);
        }
      });
    }
    
    if (this.selectedEstancias.length > 0) {
      this.selectedEstancias.forEach(estanciaId => {
        const estancia = this.availableEstancias.find(est => est.id === estanciaId);
        if (estancia) {
          filtrosSeleccionados.push(estancia.nombre);
        }
      });
    }
    
    if (filtrosSeleccionados.length === 1) {
      this.filtroNombre = filtrosSeleccionados[0];
    } else if (filtrosSeleccionados.length > 1) {
      this.filtroNombre = `${filtrosSeleccionados[0]} + ${filtrosSeleccionados.length - 1} más`;
    }
  }


  toggleEstanciaFilter(estanciaId: number): void {
    const index = this.selectedEstancias.indexOf(estanciaId);
    if (index === -1) {
      this.selectedEstancias.push(estanciaId);
      
      if (!this.filtroNombre) {
        const estancia = this.availableEstancias.find(est => est.id === estanciaId);
        if (estancia) {
          this.filtroNombre = estancia.nombre;
        }
      }
    } else {
      this.selectedEstancias.splice(index, 1);
      
      if (this.selectedEstancias.length === 0) {
        this.filtroNombre = '';
      }
    }
    this.applyFilters();
  }

  setPriceRange(): void {
    if (this.allProducts.length > 0) {
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
      
      if (!this.filtroNombre) {
        const categoria = this.availableCategories.find(cat => cat.id === categoryId);
        if (categoria) {
          this.filtroNombre = categoria.nombre;
        }
      }
    } else {
      this.selectedCategories.splice(index, 1);
      
      if (this.selectedCategories.length === 0) {
        this.filtroNombre = '';
      }
    }
    this.applyFilters();
  }


  applyFilters(): void {
    let filtered = [...this.allProducts];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.nombre.toLowerCase().includes(term) || 
        product.descripcion.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        product.categoria && this.selectedCategories.includes(product.categoria)
      );
    }
    
    if (this.selectedEstancias.length > 0) {
      filtered = filtered.filter(product => 
        product.estancia !== undefined && product.estancia !== null && 
        this.selectedEstancias.includes(product.estancia)
      );
    }
    
    filtered = filtered.filter(product => 
      product.precio >= this.priceRange.min && 
      product.precio <= this.priceRange.max
    );
    
    if (this.showOnlyInStock) {
      filtered = filtered.filter(product => product.stock);
    }
    
    if (this.showOnlyDiscounted) {
      filtered = filtered.filter(product => product.descuento && product.descuento > 0);
    }
    
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
    this.selectedEstancias = [];
    this.priceRange.min = this.minPossiblePrice;
    this.priceRange.max = this.maxPossiblePrice;
    this.showOnlyInStock = false;
    this.showOnlyDiscounted = false;
    this.sortOption = 'default';
    this.filtroNombre = '';
    this.applyFilters();
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

  // Método para obtener el nombre de la estancia por su ID
  getEstanciaName(estanciaId: number): string {
    // Verificamos si estanciaId es un número (incluyendo 0)
    if (estanciaId !== undefined && estanciaId !== null) {
      const estancia = this.availableEstancias.find(est => est.id === estanciaId);
      return estancia ? estancia.nombre : 'Sin estancia';
    }
    return 'Sin estancia';
  }

  showCategorySection: boolean = true;
  showEstanciaSection: boolean = false;
  showPriceSection: boolean = true;
  showOptionsSection: boolean = false;

  toggleCategorySection(): void {
    this.showCategorySection = !this.showCategorySection;
  }
  
  toggleEstanciaSection(): void {
    this.showEstanciaSection = !this.showEstanciaSection;
  }
  
  togglePriceSection(): void {
    this.showPriceSection = !this.showPriceSection;
  }
  
  toggleOptionsSection(): void {
    this.showOptionsSection = !this.showOptionsSection;
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product'], { 
      queryParams: { id: productId }
    }).then(() => {
      // Hacer scroll al inicio de la página
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
