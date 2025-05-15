import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';

interface Elemento {
  titulo: string;
  imagen: string;
  enlace: string;
  tipo?: string;
  id?: number;
}

interface MenuItem {
  nombre: string;
  icono: string;
  elementos: Elemento[];
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  stock: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeTab: string = 'Productos';
  wishlistCount: number = 0;
  cartCount: number = 0;
  isLoggedIn: boolean = false;
  userName: string = '';
  private subscriptions: Subscription[] = [];
  searchTerm: string = '';
  searchResults: Producto[] = [];
  showResults: boolean = false;
  
  menuItems: MenuItem[] = [
    {
      nombre: 'Productos',
      icono: './assets/icons/orders.svg',
      elementos: [
        { titulo: 'Novedades', imagen: './assets/images/novedades.png', enlace: 'product-listing', tipo: 'categoria', id: 0 },
        { titulo: 'Almacenamiento', imagen: './assets/images/estante.png', enlace: 'product-listing', tipo: 'categoria', id: 1 },
        { titulo: 'Mobiliario multifuncional', imagen: './assets/images/mob-funcional.png', enlace: 'product-listing', tipo: 'categoria', id: 2 },
        { titulo: 'Cocinas optimizadas', imagen: './assets/images/ollas.png', enlace: 'product-listing', tipo: 'categoria', id: 3 },
        { titulo: 'Espacios exteriores', imagen: './assets/images/jardin.png', enlace: 'product-listing', tipo: 'categoria', id: 4 },
        { titulo: 'Camas y colchones', imagen: './assets/images/camas-colchones.png', enlace: 'product-listing', tipo: 'categoria', id: 5 },
        { titulo: 'Decoración funcional', imagen: './assets/images/decoracion.png', enlace: 'product-listing', tipo: 'categoria', id: 6 },
        { titulo: 'Familias y niños', imagen: './assets/images/family.png', enlace: 'product-listing', tipo: 'categoria', id: 7 }
      ]
    },
    {
      nombre: 'Estancias',
      icono: './assets/icons/home.svg',
      elementos: [
        { titulo: 'Dormitorio', imagen: './assets/images/dormitorio.png', enlace: 'product-listing', tipo: 'estancia', id: 0},
        { titulo: 'Salón', imagen: './assets/images/salon.png', enlace: 'product-listing', tipo: 'estancia', id: 1 },
        { titulo: 'Cocina', imagen: './assets/images/cocina.jpg', enlace: 'product-listing', tipo: 'estancia', id: 2 },
        { titulo: 'Baño', imagen: './assets/images/baño.jpg', enlace: 'product-listing', tipo: 'estancia', id: 3 },
        { titulo: 'Trastero y garaje', imagen: './assets/images/garaje.jpg', enlace: 'product-listing', tipo: 'estancia', id: 4 },
        { titulo: 'Jardín o terraza', imagen: './assets/images/terraza.jpg', enlace: 'product-listing', tipo: 'estancia', id: 5 },
        { titulo: 'Estudio y gaming', imagen: './assets/images/estudio.jpg', enlace: 'product-listing', tipo: 'estancia', id: 6 },
        { titulo: 'Infantil y juvenil', imagen: './assets/images/juvenil.jpg', enlace: 'product-listing', tipo: 'estancia', id: 7 }
      ]
    },
    {
      nombre: 'Servicios',
      icono: './assets/icons/sms.svg',
      elementos: [
        { titulo: 'Todos nuestros servicios', imagen: '', enlace: '404' },
        { titulo: 'Seguimiento de tu pedido', imagen: '', enlace: '404' },
        { titulo: 'Diseño de interiores', imagen: '', enlace: '404' },
        { titulo: 'Financiación', imagen: '', enlace: '404' },
        { titulo: 'Instalación', imagen: '', enlace: '404' },
        { titulo: 'Mercado circular', imagen: '', enlace: '404' },
        { titulo: 'Ofertas exclusivas', imagen: '', enlace: '404' },
        { titulo: 'Revende tus muebles', imagen: '', enlace: '404' },
        { titulo: 'Compra por telefono', imagen: '', enlace: '404' },
        { titulo: 'CompactLifes, Innovación en cada rincón', imagen: '', enlace: '404' },
      ],
    }
  ];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}

  get elementosActivos(): Elemento[] {
    return this.menuItems.find(item => item.nombre === this.activeTab)?.elementos || [];
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  dividirEnGrupos(elementos: Elemento[], cantidadPorGrupo: number): Elemento[][] {
    const grupos: Elemento[][] = [];
    for (let i = 0; i < elementos.length; i += cantidadPorGrupo) {
      grupos.push(elementos.slice(i, i + cantidadPorGrupo));
    }
    return grupos;
  }

  obtenerElementosAgrupados(): any[][] {
    const elementos = this.elementosActivos;
    const grupos: any[][] = [];
    const elementosPorGrupo = Math.ceil(elementos.length / 4);
  
    for (let i = 0; i < 4; i++) {
      grupos.push(elementos.slice(i * elementosPorGrupo, (i + 1) * elementosPorGrupo));
    }
  
    return grupos;
  }

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.userName = user.nombre;
        }
      })
    );

    // Suscribirse a los cambios en el carrito y wishlist
    this.subscriptions.push(
      this.wishlistService.wishlist$.subscribe(items => {
        this.wishlistCount = items.length;
      }),
      this.cartService.cart$.subscribe(items => {
        this.cartCount = items.length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToProductListing(elemento: Elemento): void {
    if (elemento.enlace === 'product-listing' && elemento.tipo && elemento.id) {
      this.router.navigate(['/product-listing'], { 
        queryParams: { 
          [elemento.tipo]: elemento.id,
          nombre: elemento.titulo
        } 
      });
    } else {
      this.router.navigate([elemento.enlace]);
    }
  }

  searchProducts(): void {
    if (this.searchTerm.trim() === '') {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.apiService.getProducts().subscribe((productos: any) => {
      this.searchResults = productos.filter((producto: Producto) => 
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).slice(0, 5); 
      
      this.showResults = this.searchResults.length > 0;
    });
  }

  // Función para navegar al producto seleccionado
  navigateToProduct(productId: number): void {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
    this.searchTerm = '';
    this.showResults = false;
  }

  // Función para cerrar los resultados de búsqueda cuando se hace clic fuera
  closeSearchResults(): void {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }
}
