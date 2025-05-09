import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookiesService } from '../services/cookie.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.css']
})
export class CookieBannerComponent implements OnInit {
  showBanner = true; // Mostrar por defecto

  constructor(private cookiesService: CookiesService) {}

  ngOnInit(): void {
    // Mostrar el banner siempre al inicio, a menos que ya haya aceptado las cookies
    this.showBanner = !this.cookiesService.checkCookie('cookies_accepted');
  }

  acceptCookies(): void {
    // Guardar el consentimiento por 1 año
    this.cookiesService.setCookie('cookies_accepted', 'true', 365);
    this.showBanner = false;
  }

  rejectCookies(): void {
    // Guardar la preferencia de rechazo
    this.cookiesService.setCookie('cookies_accepted', 'false', 365);
    // Eliminar todas las cookies no esenciales
    this.cookiesService.deleteAllCookies();
    // Mantener solo las cookies esenciales
    this.cookiesService.setCookie('cookies_accepted', 'false', 365);
    this.showBanner = false;
  }
}
