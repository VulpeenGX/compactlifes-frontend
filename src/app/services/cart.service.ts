import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

export interface CartItem {
  id: number;
  nombre?: string;
  precio?: number;
  descripcion?: string;
  imagen?: string;
  stock?: boolean;
  descuento?: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
  private cartKey = 'compactlifes_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  public cartItems$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedCart = localStorage.getItem(this.cartKey);
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        this.cartSubject.next(items);
      } catch (e) {
        console.error('Error al cargar carrito desde localStorage:', e);
        this.cartSubject.next([]);
      }
    }
  }

  private saveToLocalStorage(items: CartItem[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }

  getCart(): CartItem[] {
    return this.cartSubject.value;
  }

  addToCart(product: any, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Si el producto ya está en el carrito, aumentar la cantidad
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
      this.cartSubject.next(updatedCart);
      this.saveToLocalStorage(updatedCart);
      this.notificationService.showNotification(`Se ha sumado ${product.nombre} a tu carrito`, 'cart');
    } else {
      // Si es un producto nuevo, añadirlo al carrito
      const cartItem: CartItem = {
        ...product,
        quantity: quantity
      };
      const newCart = [...currentCart, cartItem];
      this.cartSubject.next(newCart);
      this.saveToLocalStorage(newCart);
      this.notificationService.showNotification(`${product.nombre} ha sido añadido a tu carrito`, 'cart');
    }
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    const productToRemove = currentCart.find(item => item.id === productId);
    const newCart = currentCart.filter(item => item.id !== productId);
    this.cartSubject.next(newCart);
    this.saveToLocalStorage(newCart);
    
    if (productToRemove && productToRemove.nombre) {
      this.notificationService.showNotification(`${productToRemove.nombre} ha sido eliminado de tu carrito`, 'cart');
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const currentCart = this.cartSubject.value;
    const updatedCart = currentCart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    
    this.cartSubject.next(updatedCart);
    this.saveToLocalStorage(updatedCart);
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((total, item) => {
      const price = item.precio || 0;
      const discount = item.descuento || 0;
      const discountedPrice = price - (price * discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cartSubject.value.reduce((count, item) => count + item.quantity, 0);
  }

  // Método para sincronizar con el backend cuando el usuario inicia sesión
  syncWithBackend(userId: string): Observable<any> {
    const localCart = this.cartSubject.value;
    return this.http.post(`${this.apiUrl}cart/sync/${userId}`, { items: localCart });
  }

  // Método para cargar el carrito del usuario desde el backend
  loadUserCart(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}cart/${userId}`);
  }

  // Método para combinar carrito local con el del servidor
  mergeCarts(serverCart: CartItem[]): void {
    const localCart = this.cartSubject.value;
    
    // Crear un mapa para combinar cantidades
    const mergedCartMap = new Map<number, CartItem>();
    
    // Añadir items del carrito local
    localCart.forEach(item => {
      mergedCartMap.set(item.id, { ...item });
    });
    
    // Combinar con items del servidor (prevalece la mayor cantidad)
    serverCart.forEach(serverItem => {
      const localItem = mergedCartMap.get(serverItem.id);
      if (localItem) {
        // Si el item existe en ambos, mantener la mayor cantidad
        mergedCartMap.set(serverItem.id, {
          ...serverItem,
          quantity: Math.max(localItem.quantity, serverItem.quantity)
        });
      } else {
        // Si solo existe en el servidor, añadirlo
        mergedCartMap.set(serverItem.id, { ...serverItem });
      }
    });
    
    const mergedCart = Array.from(mergedCartMap.values());
    this.cartSubject.next(mergedCart);
    this.saveToLocalStorage(mergedCart);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.saveToLocalStorage([]);
    this.notificationService.showNotification('Tu carrito ha sido vaciado', 'cart');
  }
}
