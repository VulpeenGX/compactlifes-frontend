import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api/'

  constructor(private http: HttpClient) {
  }

  getProducts() {
    const endpointUrl: string = this.apiUrl + 'productos/';
    return this.http.get(endpointUrl);
  }

  getProductsOffers() {
    const endpointUrl: string = this.apiUrl + 'productos/ofertas/';
    return this.http.get(endpointUrl);
  }

  getProductsWithoutOffers() {
    const endpointUrl: string = this.apiUrl + 'productos/sin-ofertas/';
    return this.http.get(endpointUrl);
  }
  
  // Nuevos métodos para categorías
  getCategorias() {
    const endpointUrl: string = this.apiUrl + 'categorias/';
    return this.http.get(endpointUrl);
  }
  
  getCategoriasConProductos() {
    const endpointUrl: string = this.apiUrl + 'categorias/con_productos/';
    return this.http.get(endpointUrl);
  }
  
  getProductosPorCategoria(categoriaId: number) {
    const endpointUrl: string = this.apiUrl + `categorias/${categoriaId}/productos/`;
    return this.http.get(endpointUrl);
  }

  getEstancias() {
    const endpointUrl: string = this.apiUrl + 'estancias/';
    return this.http.get(endpointUrl);
  }
}