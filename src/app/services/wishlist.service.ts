import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';

export interface WishlistItem {
  id: number;
  nombre?: string;
  precio?: number;
  descripcion?: string;
  imagen?: string;
  stock?: boolean;
  descuento?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'https://compactlifes-api.onrender.com/api/';
  private wishlistKey = 'compactlifes_wishlist';
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedWishlist = localStorage.getItem(this.wishlistKey);
    if (storedWishlist) {
      try {
        const items = JSON.parse(storedWishlist);
        this.wishlistSubject.next(items);
      } catch (e) {
        console.error('Error al cargar wishlist desde localStorage:', e);
        this.wishlistSubject.next([]);
      }
    }
  }

  private saveToLocalStorage(items: WishlistItem[]): void {
    localStorage.setItem(this.wishlistKey, JSON.stringify(items));
  }

  getWishlist(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  addToWishlist(product: WishlistItem): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.some(item => item.id === product.id)) {
      const newWishlist = [...currentWishlist, product];
      this.wishlistSubject.next(newWishlist);
      this.saveToLocalStorage(newWishlist);
      this.notificationService.showNotification(`${product.nombre} ha sido añadido a tu lista de deseos`, 'wishlist');
    }
  }

  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    const productToRemove = currentWishlist.find(item => item.id === productId);
    const newWishlist = currentWishlist.filter(item => item.id !== productId);
    this.wishlistSubject.next(newWishlist);
    this.saveToLocalStorage(newWishlist);
    
    if (productToRemove && productToRemove.nombre) {
      this.notificationService.showNotification(`${productToRemove.nombre} ha sido eliminado de tu lista de deseos`, 'wishlist');
    }
  }

  toggleWishlistItem(product: WishlistItem): void {
    const currentWishlist = this.wishlistSubject.value;
    const exists = currentWishlist.some(item => item.id === product.id);
    
    if (exists) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.value.some(item => item.id === productId);
  }

  // Método para sincronizar con el backend cuando el usuario inicia sesión
  syncWithBackend(userId: string): Observable<any> {
    const localWishlist = this.wishlistSubject.value;
    return this.http.post(`${this.apiUrl}wishlist/sync/${userId}`, { items: localWishlist });
  }

  // Método para cargar la wishlist del usuario desde el backend
  loadUserWishlist(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}wishlist/${userId}`);
  }

  // Método para combinar wishlist local con la del servidor
  mergeWishlists(serverWishlist: WishlistItem[]): void {
    const localWishlist = this.wishlistSubject.value;
    
    const mergedIds = new Set([...localWishlist, ...serverWishlist].map(item => item.id));
    const mergedWishlist: WishlistItem[] = [];
    
    mergedIds.forEach(id => {
      const serverItem = serverWishlist.find(item => item.id === id);
      const localItem = localWishlist.find(item => item.id === id);
      mergedWishlist.push(serverItem || localItem!);
    });
    
    this.wishlistSubject.next(mergedWishlist);
    this.saveToLocalStorage(mergedWishlist);
  }

  clearWishlist(): void {
    this.wishlistSubject.next([]);
    this.saveToLocalStorage([]);
    this.notificationService.showNotification('Tu lista de deseos ha sido vaciada', 'wishlist');
  }
}
