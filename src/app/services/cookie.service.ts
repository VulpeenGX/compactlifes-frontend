import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {
  constructor(private cookieService: CookieService) {}

  // Establecer una cookie
  setCookie(name: string, value: string, expirationDays: number = 30, path: string = '/'): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    this.cookieService.set(name, value, expirationDate, path);
  }

  // Obtener el valor de una cookie
  getCookie(name: string): string {
    return this.cookieService.get(name);
  }

  // Verificar si existe una cookie
  checkCookie(name: string): boolean {
    return this.cookieService.check(name);
  }

  // Eliminar una cookie específica
  deleteCookie(name: string, path: string = '/'): void {
    this.cookieService.delete(name, path);
  }

  // Eliminar todas las cookies
  deleteAllCookies(path: string = '/'): void {
    this.cookieService.deleteAll(path);
  }
}
