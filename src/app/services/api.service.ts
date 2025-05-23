import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para obtener el token del almacenamiento local
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Métodos para autenticación
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/token/`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register/`, userData);
  }

  // Métodos para productos
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/productos/`, { headers: this.getAuthHeaders() });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/productos/${id}/`, { headers: this.getAuthHeaders() });
  }

  getProductsOffers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/productos/ofertas/`, { headers: this.getAuthHeaders() });
  }

  getProductsWithoutOffers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/productos/sin-ofertas/`, { headers: this.getAuthHeaders() });
  }

  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/categorias/`, { headers: this.getAuthHeaders() });
  }

  getEstancias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/estancias/`, { headers: this.getAuthHeaders() });
  }

  getProductosRelacionados(filtroId: number, productoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/productos/relacionados/${filtroId}/${productoId}/`, { headers: this.getAuthHeaders() });
  }
}