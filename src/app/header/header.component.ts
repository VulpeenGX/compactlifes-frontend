import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface Elemento {
  titulo: string;
  imagen: string;
  enlace: string;
}

interface MenuItem {
  nombre: string;
  icono: string;
  elementos: Elemento[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeTab: string = 'Productos';
  wishlistCount: number = 0;
  cartCount: number = 0;
  isLoggedIn: boolean = false;
  private subscriptions: Subscription[] = [];
  menuItems: MenuItem[] = [
    {
      nombre: 'Productos',
      icono: './assets/icons/orders.svg',
      elementos: [
        { titulo: 'Novedades', imagen: './assets/images/novedades.png', enlace: '#' },
        { titulo: 'Almacenamiento', imagen: './assets/images/estante.png', enlace: '#' },
        { titulo: 'Mobiliario multifuncional', imagen: './assets/images/mob-funcional.png', enlace: '#' },
        { titulo: 'Cocinas optimizadas', imagen: './assets/images/ollas.png', enlace: '#' },
        { titulo: 'Espacios exteriores', imagen: './assets/images/jardin.png', enlace: '#' },
        { titulo: 'Camas y colchones', imagen: './assets/images/camas-colchones.png', enlace: '#' },
        { titulo: 'Decoración funcional', imagen: './assets/images/decoracion.png', enlace: '#' },
        { titulo: 'Familias y niños', imagen: './assets/images/family.png', enlace: '#' }
      ]
    },
    {
      nombre: 'Estancias',
      icono: './assets/icons/home.svg',
      elementos: [
        { titulo: 'Dormitorio', imagen: './assets/images/dormitorio.png', enlace: '#' },
        { titulo: 'Salón', imagen: './assets/images/salon.png', enlace: '#' },
        { titulo: 'Cocina', imagen: './assets/images/cocina.jpg', enlace: '#' },
        { titulo: 'Baño', imagen: './assets/images/baño.jpg', enlace: '#' },
        { titulo: 'Trastero y garaje', imagen: './assets/images/garaje.jpg', enlace: '#' },
        { titulo: 'Jardín o terraza', imagen: './assets/images/terraza.jpg', enlace: '#' },
        { titulo: 'Estudio y gaming', imagen: './assets/images/estudio.jpg', enlace: '#' },
        { titulo: 'Infantil y juvenil', imagen: './assets/images/juvenil.jpg', enlace: '#' }
      ]
    },
    {
      nombre: 'Servicios',
      icono: './assets/icons/sms.svg',
      elementos: [
        { titulo: 'Todos nuestros servicios', imagen: '', enlace: '#' },
        { titulo: 'Seguimiento de tu pedido', imagen: '', enlace: '#' },
        { titulo: 'Diseño de interiores', imagen: '', enlace: '#' },
        { titulo: 'Financiación', imagen: '', enlace: '#' },
        { titulo: 'Instalación', imagen: '', enlace: '#' },
        { titulo: 'Mercado circular', imagen: '', enlace: '#' },
        { titulo: 'Ofertas exclusivas', imagen: '', enlace: '#' },
        { titulo: 'Revende tus muebles', imagen: '', enlace: '#' },
        { titulo: 'Compra por telefono', imagen: '', enlace: '#' },
        { titulo: 'CompactLifes, Innovación en cada rincón', imagen: '', enlace: '#' },
      ],
    }
  ];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService
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

  ngOnInit() {
    // Suscribirse a cambios en la wishlist
    this.subscriptions.push(
      this.wishlistService.wishlist$.subscribe(wishlist => {
        this.wishlistCount = wishlist.length;
      })
    );

    // Suscribirse a cambios en el carrito
    this.subscriptions.push(
      this.cartService.cart$.subscribe(cart => {
        this.cartCount = this.cartService.getCartItemCount();
      })
    );

    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
