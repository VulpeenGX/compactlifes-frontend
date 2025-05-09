import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WishlistService, WishlistItem } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { Subscription, catchError, of } from 'rxjs';

interface ColorOption {
  color: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  stock: boolean;
  descuento?: number;
  categoria?: number;
  categoria_data?: any;
  estancia?: number;
  estancia_data?: any;
  quantity?: number;
  color?: string | ColorOption[];
  colores?: string[] | string;
  material?: string;
  materiales?: string[] | string;
  peso?: number;
  colores_formateados?: string;
  materiales_formateados?: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductComponent implements OnInit, OnDestroy {
  producto: Producto | null = null;
  cantidad: number = 1;
  productosRelacionados: Producto[] = [];
  cargando: boolean = false;
  error: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Obtener el ID del producto desde la URL
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const productId = params['id'];
        if (productId) {
          this.cargarProducto(Number(productId));
        } else {
          // Si no hay ID, cargar el primer producto como ejemplo
          this.cargando = true;
          this.apiService.getProducts().pipe(
            catchError(err => {
              this.error = 'Error al cargar productos: ' + err.message;
              return of([]);
            })
          ).subscribe((productos: any) => {
            this.cargando = false;
            if (productos && productos.length > 0) {
              this.producto = productos[0];
              this.cargarProductosRelacionados();
            }
          });
        }
      })
    );
  }

  cargarProducto(id: number) {
    this.cargando = true;
    this.error = null;
    
    this.apiService.getProductById(id).pipe(
      catchError(err => {
        this.error = 'Error al cargar el producto: ' + err.message;
        this.cargando = false;
        return of(null);
      })
    ).subscribe((producto: any) => {
      this.cargando = false;
      this.producto = producto;
      
      console.log('Producto cargado:', this.producto); // Añadir para depuración
      
      if (this.producto) {
        this.cargarProductosRelacionados();
      } else {
        this.error = 'Producto no encontrado';
        setTimeout(() => {
          this.router.navigate(['/product-listing']);
        }, 2000);
      }
    });
  }

  cargarProductosRelacionados() {
    if (!this.producto) return;
    
    // Usar el método específico para productos relacionados basado en categoría o estancia
    const filtroId = this.producto.categoria || this.producto.estancia;
    const tipoFiltro = this.producto.categoria ? 'categoria' : 'estancia';
    
    if (!filtroId) return;
    
    this.apiService.getProductosRelacionados(filtroId, this.producto.id).pipe(
      catchError(err => {
        console.error('Error al cargar productos relacionados:', err);
        return of([]);
      })
    ).subscribe((productos: any) => {
      this.productosRelacionados = productos;
      
      // Si hay menos de 10 productos relacionados, completar hasta 10 con productos adicionales
      if (this.productosRelacionados.length < 10) {
        this.completarProductosRelacionados();
      }
    });
  }
  
  completarProductosRelacionados() {
    // Obtener productos adicionales para completar hasta 10
    this.apiService.getProducts().pipe(
      catchError(err => {
        console.error('Error al cargar productos adicionales:', err);
        return of([]);
      })
    ).subscribe((productos: any) => {
      if (!productos || productos.length === 0) return;
      
      // Filtrar productos que no estén ya en productosRelacionados y que no sean el producto actual
      const productosDisponibles = productos.filter((p: Producto) => 
        p.id !== this.producto?.id && 
        !this.productosRelacionados.some(pr => pr.id === p.id)
      );
      
      // Seleccionar aleatoriamente hasta completar 10 productos en total
      const cantidadAdicional = Math.min(10 - this.productosRelacionados.length, productosDisponibles.length);
      
      if (cantidadAdicional > 0 && productosDisponibles.length > 0) {
        // Mezclar el array para obtener productos aleatorios
        this.shuffleArray(productosDisponibles);
        
        // Añadir los productos adicionales
        this.productosRelacionados = [
          ...this.productosRelacionados,
          ...productosDisponibles.slice(0, cantidadAdicional)
        ];
      }
    });
  }
  
  // Método para mezclar un array (algoritmo Fisher-Yates)
  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getColores(): string[] {
    if (!this.producto) return [];
    
    // Caso 1: Si hay una propiedad colores
    if (this.producto.colores) {
      // Si colores es un array, devolverlo directamente
      if (Array.isArray(this.producto.colores)) {
        return this.producto.colores;
      }
      
      // Si es un string, intentar parsearlo como JSON
      if (typeof this.producto.colores === 'string') {
        try {
          const coloresData = JSON.parse(this.producto.colores);
          if (Array.isArray(coloresData)) {
            // Extraer el valor "color" de cada objeto en el array si existe
            return coloresData.map(item => typeof item === 'object' && item.color ? item.color : item);
          }
          // Si es un objeto, intentar extraer la propiedad color
          if (typeof coloresData === 'object') {
            return Object.values(coloresData);
          }
          return [this.producto.colores];
        } catch (e) {
          // Si no es JSON válido, devolver como string normal
          return [this.producto.colores];
        }
      }
    }
    
    // Caso 2: Si hay una propiedad color directa
    if (this.producto.color) {
      // Si color es un array de objetos con propiedad color
      if (Array.isArray(this.producto.color)) {
        return this.producto.color.map((item: any) => 
          typeof item === 'object' && item.color ? item.color : item
        );
      }
      
      // Si color es un string
      if (typeof this.producto.color === 'string') {
        try {
          // Intentar parsear como JSON
          const colorData = JSON.parse(this.producto.color);
          if (Array.isArray(colorData)) {
            return colorData.map((item: any) => 
              typeof item === 'object' && item.color ? item.color : item
            );
          }
          return [this.producto.color];
        } catch (e) {
          // Si no es JSON válido, devolver como string normal
          return [this.producto.color];
        }
      }
    }
    
    return [];
  }

  getMateriales(): string[] {
    if (!this.producto) return [];
    
    // Caso 1: Si hay una propiedad materiales
    if (this.producto.materiales) {
      // Si materiales es un array, devolverlo directamente
      if (Array.isArray(this.producto.materiales)) {
        return this.producto.materiales;
      }
      
      // Si es un string, intentar parsearlo como JSON
      if (typeof this.producto.materiales === 'string') {
        try {
          const materialesData = JSON.parse(this.producto.materiales);
          if (Array.isArray(materialesData)) {
            // Extraer el valor "material" de cada objeto en el array si existe
            return materialesData.map(item => typeof item === 'object' && item.material ? item.material : item);
          }
          // Si es un objeto, intentar extraer valores
          if (typeof materialesData === 'object') {
            return Object.values(materialesData);
          }
          return [this.producto.materiales];
        } catch (e) {
          // Si no es JSON válido, devolver como string normal
          return [this.producto.materiales];
        }
      }
    }
    
    // Caso 2: Si hay una propiedad material directa
    if (this.producto.material) {
      // Si material es un array
      if (Array.isArray(this.producto.material)) {
        return this.producto.material.map((item: any) => 
          typeof item === 'object' && item.material ? item.material : item
        );
      }
      
      // Si material es un string
      if (typeof this.producto.material === 'string') {
        try {
          // Intentar parsear como JSON
          const materialData = JSON.parse(this.producto.material);
          if (Array.isArray(materialData)) {
            return materialData.map((item: any) => 
              typeof item === 'object' && item.material ? item.material : item
            );
          }
          return [this.producto.material];
        } catch (e) {
          // Si no es JSON válido, devolver como string normal
          return [this.producto.material];
        }
      }
    }
    
    return [];
  }

  getColoresFormateados(): string {
    const colores = this.getColores();
    if (colores.length === 0) return 'No especificado';
    return colores.join(', ');
  }

  getMaterialesFormateados(): string {
    const materiales = this.getMateriales();
    if (materiales.length === 0) return 'No especificado';
    return materiales.join(', ');
  }

  getPrecioConDescuento(producto: Producto): number {
    if (!producto.descuento) return producto.precio;
    return producto.precio * (1 - producto.descuento / 100);
  }

  aumentarCantidad() {
    this.cantidad++;
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  addToCart() {
    if (this.producto && this.producto.stock) {
      // Pasar el producto y la cantidad como parámetros separados
      this.cartService.addToCart(this.producto, this.cantidad);
      // Opcional: Mostrar alguna notificación de éxito
    }
  }

  addRelatedToCart(producto: Producto) {
    if (producto && producto.stock) {
      const productoConCantidad = {
        ...producto,
        quantity: 1
      };
      this.cartService.addToCart(productoConCantidad);
      // Opcional: Mostrar alguna notificación de éxito
    }
  }

  toggleWishlist() {
    if (this.producto) {
      this.wishlistService.toggleWishlistItem(this.producto as unknown as WishlistItem);
    }
  }

  toggleWishlistForRelated(producto: Producto) {
    if (producto) {
      this.wishlistService.toggleWishlistItem(producto as unknown as WishlistItem);
    }
  }

  isInWishlist(): boolean {
    return this.producto ? this.wishlistService.isInWishlist(this.producto.id) : false;
  }

  isProductInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
  }

  // Método para manejar errores de carga de imágenes
  handleImageError(event: any) {
    // Reemplazar con una imagen por defecto cuando hay error
    event.target.src = './assets/images/placeholder.jpg';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
