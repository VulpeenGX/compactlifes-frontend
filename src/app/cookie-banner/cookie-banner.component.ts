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
  showBanner = true; 

  constructor(private cookiesService: CookiesService) {}

  ngOnInit(): void {
    this.showBanner = !this.cookiesService.checkCookie('cookies_accepted');
  }

  acceptCookies(): void {
    this.cookiesService.setCookie('cookies_accepted', 'true', 365);
    this.showBanner = false;
  }

  rejectCookies(): void {
    this.cookiesService.setCookie('cookies_accepted', 'false', 365);
    this.cookiesService.deleteAllCookies();
    this.cookiesService.setCookie('cookies_accepted', 'false', 365);
    this.showBanner = false;
  }
}
