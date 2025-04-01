import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  brand: string;
  description: string;
  price: number;
  actualPrice: number;
  image: string;
  discount: number;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent {
  products: Product[] = [
    {
      id: 1,
      brand: "Brand A",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
    {
      id: 2,
      brand: "Brand B",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
    {
      id: 3,
      brand: "Brand A",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
    {
      id: 4,
      brand: "Brand B",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
    {
      id: 5,
      brand: "Brand A",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
    {
      id: 6,
      brand: "Brand B",
      description: "A short line about the cloth..",
      price: 20,
      actualPrice: 40,
      image: "./assets/products/product.png",
      discount: 50,
    },
  ];

}
