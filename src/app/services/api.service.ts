import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

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

  getProductById(id: number) {
    const endpointUrl: string = this.apiUrl + `productos/${id}/`;
    return this.http.get(endpointUrl).pipe(
      map((response: any) => {
        console.log('Respuesta API producto:', response); // Añadir para depuración
        return response;
      })
    );
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
  
  getProductosRelacionados(categoriaId: number, productoId: number) {
    return this.getProductosPorCategoria(categoriaId).pipe(
      map((productos: Object) => (productos as any[]).filter(p => p.id !== productoId).slice(0, 4))
    );
  }
  
  getProductosPorEstancia(estanciaId: number) {
    const endpointUrl: string = this.apiUrl + `productos/por-estancia/${estanciaId}/`;
    return this.http.get(endpointUrl);
  }
  
  buscarProductos(texto: string) {
    const endpointUrl: string = this.apiUrl + `productos/buscar/${texto}/`;
    return this.http.get(endpointUrl);
  }
  
  getProductosDestacados() {
    const endpointUrl: string = this.apiUrl + 'productos/destacados/';
    return this.http.get(endpointUrl);
  }
}