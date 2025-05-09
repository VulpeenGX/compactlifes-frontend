import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { WishlistService } from './wishlist.service';
import { CartService } from './cart.service';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  telefono: string;
  fecha_creacion: string;
  is_active: boolean;
}

interface AuthResponse {
  refresh: string;
  access: string;
  usuario: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
  private userKey = 'compactlifes_user';
  private tokenKey = 'compactlifes_token';
  private refreshTokenKey = 'compactlifes_refresh_token';
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
    const storedToken = localStorage.getItem(this.tokenKey);
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error al cargar usuario desde localStorage:', e);
        this.logout();
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

  private saveTokenToStorage(token: string | null): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private saveRefreshTokenToStorage(token: string | null): void {
    if (token) {
      localStorage.setItem(this.refreshTokenKey, token);
    } else {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, contraseña: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}usuarios/login/`, { email, contraseña }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.usuario);
        this.saveUserToStorage(response.usuario);
        this.saveTokenToStorage(response.access);
        this.saveRefreshTokenToStorage(response.refresh);
        
        // Sincronizar wishlist y carrito con el backend
        if (response.usuario && response.usuario.id) {
          this.syncUserData(response.usuario.id);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  register(nombre: string, apellido: string, email: string, contraseña: string, confirmar_contraseña: string, direccion: string, telefono: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}usuarios/registro/`, { 
      nombre, 
      apellido, 
      email, 
      contraseña, 
      confirmar_contraseña, 
      direccion, 
      telefono 
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.usuario);
        this.saveUserToStorage(response.usuario);
        this.saveTokenToStorage(response.access);
        this.saveRefreshTokenToStorage(response.refresh);
        
        // Sincronizar wishlist y carrito con el backend
        if (response.usuario && response.usuario.id) {
          this.syncUserData(response.usuario.id);
        }
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        throw error;
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }
    
    return this.http.post<{access: string}>(`${this.apiUrl}usuarios/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(response => {
        this.saveTokenToStorage(response.access);
      }),
      catchError(error => {
        console.error('Error al refrescar token:', error);
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.saveUserToStorage(null);
    this.saveTokenToStorage(null);
    this.saveRefreshTokenToStorage(null);
    // No limpiamos wishlist ni carrito para mantenerlos disponibles para el usuario anónimo
  }

  // Método para sincronizar wishlist y carrito cuando el usuario inicia sesión
  private syncUserData(userId: number): void {
    // Cargar wishlist del usuario desde el backend y combinarla con la local
    this.wishlistService.loadUserWishlist(userId.toString()).subscribe({
      next: serverWishlist => {
        this.wishlistService.mergeWishlists(serverWishlist);
        // Después de combinar, sincronizar la wishlist combinada con el backend
        this.wishlistService.syncWithBackend(userId.toString()).subscribe({
          error: err => console.error('Error al sincronizar wishlist con el backend:', err)
        });
      },
      error: error => console.error('Error al cargar wishlist del usuario:', error)
    });
    
    // Cargar carrito del usuario desde el backend y combinarlo con el local
    this.cartService.loadUserCart(userId.toString()).subscribe({
      next: serverCart => {
        this.cartService.mergeCarts(serverCart);
        // Después de combinar, sincronizar el carrito combinado con el backend
        this.cartService.syncWithBackend(userId.toString()).subscribe({
          error: err => console.error('Error al sincronizar carrito con el backend:', err)
        });
      },
      error: error => console.error('Error al cargar carrito del usuario:', error)
    });
  }

  updateUserData(userId: number, userData: {nombre: string, apellido: string, direccion: string, telefono: string}): Observable<any> {
    return this.http.put<{usuario: User, mensaje: string}>(`${this.apiUrl}usuarios/${userId}/actualizar/`, userData).pipe(
      tap(response => {
        // Actualizar el usuario en el BehaviorSubject y en localStorage
        this.currentUserSubject.next(response.usuario);
        this.saveUserToStorage(response.usuario);
      }),
      catchError(error => {
        console.error('Error al actualizar datos del usuario:', error);
        throw error;
      })
    );
  }
}
