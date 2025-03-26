import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  // Propiedad para manejar los elementos (si necesitas lógica adicional)
  paymentMethodsHidden: boolean = false;

  constructor() {}

  ngOnInit(): void {
  }

  togglePaymentMethods(): void {
    this.paymentMethodsHidden = !this.paymentMethodsHidden;
  }
}
