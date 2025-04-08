import { Component } from '@angular/core';
import { CollageImagesComponent } from '../collage-images/collage-images.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { Carousel2Component } from '../carousel2/carousel2.component';
import { BannerComponent } from '../banner/banner.component';
import { FaqComponent } from '../faq/faq.component';

@Component({
  selector: 'app-home-view-component',
  standalone: true,
  imports: [CollageImagesComponent, CarouselComponent, Carousel2Component, BannerComponent, FaqComponent],
  templateUrl: './home-view-component.component.html',
  styleUrl: './home-view-component.component.css'
})
export class HomeViewComponentComponent {

}
