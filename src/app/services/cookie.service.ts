import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {
  constructor(private cookieService: CookieService) {}

  setCookie(name: string, value: string, expirationDays: number = 30, path: string = '/'): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    this.cookieService.set(name, value, expirationDate, path);
  }

  getCookie(name: string): string {
    return this.cookieService.get(name);
  }

  checkCookie(name: string): boolean {
    return this.cookieService.check(name);
  }

  deleteCookie(name: string, path: string = '/'): void {
    this.cookieService.delete(name, path);
  }

  deleteAllCookies(path: string = '/'): void {
    this.cookieService.deleteAll(path);
  }
}
