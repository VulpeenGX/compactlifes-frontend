import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WishlistService } from './wishlist.service';
import { CartService } from './cart.service';

interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
  private userKey = 'compactlifes_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error al cargar usuario desde localStorage:', e);
        this.currentUserSubject.next(null);
      }
    }
  }

  private saveUserToStorage(user: User | null): void {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}auth/login`, { email, password }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
        
        // Sincronizar wishlist y carrito con el backend
        this.syncUserData(user.id);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}auth/register`, { username, email, password }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
        
        // Sincronizar wishlist y carrito con el backend
        this.syncUserData(user.id);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.saveUserToStorage(null);
    // No limpiamos wishlist ni carrito para mantenerlos disponibles para el usuario anónimo
  }

  // Método para sincronizar wishlist y carrito cuando el usuario inicia sesión
  private syncUserData(userId: string): void {
    // Cargar wishlist del usuario desde el backend y combinarla con la local
    this.wishlistService.loadUserWishlist(userId).subscribe(
      serverWishlist => {
        this.wishlistService.mergeWishlists(serverWishlist);
        // Después de combinar, sincronizar la wishlist combinada con el backend
        this.wishlistService.syncWithBackend(userId).subscribe();
      },
      error => console.error('Error al cargar wishlist del usuario:', error)
    );
    
    // Cargar carrito del usuario desde el backend y combinarlo con el local
    this.cartService.loadUserCart(userId).subscribe(
      serverCart => {
        this.cartService.mergeCarts(serverCart);
        // Después de combinar, sincronizar el carrito combinado con el backend
        this.cartService.syncWithBackend(userId).subscribe();
      },
      error => console.error('Error al cargar carrito del usuario:', error)
    );
  }
}
