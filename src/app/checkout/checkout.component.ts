import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { Subscription } from 'rxjs';

interface User {
  name: string;
  email: string;
  address: string;
  phone: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoggedIn: boolean = false;
  formSubmitted: boolean = false;
  orderProcessing: boolean = false;
  orderCompleted: boolean = false;
  orderNumber: string = '';
  
  fieldTouched = {
    name: false,
    email: false,
    address: false,
    city: false,
    postalCode: false,
    phone: false,
    cardNumber: false,
    expiry: false,
    cvv: false,
    cardName: false,
    paypalPhone: false,
    bizumPhone: false
  };
  
  user: User = {
    name: '',
    email: '',
    address: '',
    phone: ''
  };
  
  shippingInfo = {
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  };
  
  cardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };
  
  paypalInfo = {
    phone: ''
  };
  
  bizumInfo = {
    phone: ''
  };
  
  paymentMethod: string = 'card';
  
  private subscriptions: Subscription[] = [];


  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.cartService.cart$.subscribe(items => {
        this.cartItems = items;
                if (items.length === 0) {
          this.router.navigate(['/cart']);
        }
      })
    );
    
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.user.name = user.nombre;
          this.user.email = user.email;
          this.user.address = user.direccion;
          this.user.phone = user.telefono;
          this.shippingInfo.name = user.nombre + ' ' + user.apellido;
          this.shippingInfo.email = user.email;
          this.shippingInfo.address = user.direccion;
          this.shippingInfo.phone = user.telefono;
        }
      })
    );
  }

  getTotal(): number {
    return this.cartService.getCartTotal();
  }
  
  getShippingCost(): number {
    return this.getTotal() < 300 ? 4.99 : 0;
  }
  
  getFinalTotal(): number {
    return this.getTotal() * 1.21 + this.getShippingCost();
  }

  getPrecioConDescuento(item: CartItem): number {
    if (!item.descuento || item.descuento <= 0) {
      return item.precio || 0;
    }
    return (item.precio || 0) - ((item.precio || 0) * (item.descuento || 0)) / 100;
  }

  getItemTotal(item: CartItem): number {
    return this.getPrecioConDescuento(item) * item.quantity;
  }

  getTotalAhorro(): number {
    return this.cartItems.reduce((total, item) => {
      const descuento = ((item.precio || 0) * (item.descuento || 0)) / 100;
      return total + (descuento * item.quantity);
    }, 0);
  }
  
  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Método para verificar si el formulario es válido sin necesidad de enviarlo
  isFormValid(): boolean {
    if (!this.shippingInfo.name || !this.shippingInfo.email || 
        !this.shippingInfo.address || !this.shippingInfo.city || 
        !this.shippingInfo.postalCode || !this.shippingInfo.phone) {
      return false;
    }
        if (!this.validatePostalCode(this.shippingInfo.postalCode)) {
      return false;
    }
        if (!this.validatePhoneNumber(this.shippingInfo.phone)) {
      return false;
    }
        if (this.paymentMethod === 'card') {
      if (!this.cardInfo.number || !this.cardInfo.expiry || 
          !this.cardInfo.cvv || !this.cardInfo.name) {
        return false;
      }
            if (!this.validateCreditCard(this.cardInfo.number)) {
        return false;
      }
            if (!this.validateExpiryDate(this.cardInfo.expiry)) {
        return false;
      }
            if (!this.validateCVV(this.cardInfo.cvv)) {
        return false;
      }
    }
        if (this.paymentMethod === 'paypal') {
      if (!this.paypalInfo.phone || !this.validatePhoneNumber(this.paypalInfo.phone)) {
        return false;
      }
    }
        if (this.paymentMethod === 'bizum') {
      if (!this.bizumInfo.phone || !this.validatePhoneNumber(this.bizumInfo.phone)) {
        return false;
      }
    }
    
    return true;
  }
  
  validatePostalCode(postalCode: string): boolean {
    const pattern = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
    return pattern.test(postalCode);
  }
  
  validatePhoneNumber(phone: string): boolean {
    const pattern = /^(?:\+34)?[6789]\d{8}$/;
    return pattern.test(phone);
  }
    validateCVV(cvv: string): boolean {
    const cvvRegex = /^[0-9]{3,4}$/;
    return cvvRegex.test(cvv);
  }
  
  validateExpiryDate(expiryDate: string): boolean {
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
      return false;
    }
        const [month, year] = expiryDate.split('/');
        const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);
        const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return false;
    }
    
    return true;
  }
  
  // Validación de tarjeta de crédito usando algoritmo Luhn
  validateCreditCard(cardNumber: string): boolean {
    const sanitizedNumber = cardNumber.replace(/[\s-]/g, '');
        if (!/^\d{13,19}$/.test(sanitizedNumber)) {
      return false;
    }
    
    // algoritmo de Luhn
    let sum = 0;
    let shouldDouble = false;
        for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitizedNumber.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
        return sum % 10 === 0;
  }

  validateField(fieldName: string): void {
    (this.fieldTouched as {[key: string]: boolean})[fieldName] = true;
    if (fieldName === 'paymentMethod') {
      if (this.paymentMethod === 'card') {
        this.fieldTouched.cardNumber = true;
        this.fieldTouched.expiry = true;
        this.fieldTouched.cvv = true;
        this.fieldTouched.cardName = true;
      } else if (this.paymentMethod === 'paypal') {
        this.fieldTouched.paypalPhone = true;
      } else if (this.paymentMethod === 'bizum') {
        this.fieldTouched.bizumPhone = true;
      }
    }
  }

  showFormErrors(): void {
    Object.keys(this.fieldTouched).forEach(key => {
      (this.fieldTouched as {[key: string]: boolean})[key] = true;
    });
        let errorMessage = 'Por favor, completa correctamente todos los campos obligatorios:\n';
    
    // Verificar campos de envío
    if (!this.shippingInfo.name) errorMessage += '- Nombre completo\n';
    if (!this.shippingInfo.email) errorMessage += '- Correo electrónico\n';
    if (!this.shippingInfo.address) errorMessage += '- Dirección completa\n';
    if (!this.shippingInfo.city) errorMessage += '- Ciudad\n';
    if (!this.shippingInfo.postalCode) errorMessage += '- Código postal\n';
    if (!this.shippingInfo.phone) errorMessage += '- Teléfono\n';
    if (this.shippingInfo.postalCode && !this.validatePostalCode(this.shippingInfo.postalCode)) 
      errorMessage += '- Código postal inválido\n';
    if (this.shippingInfo.phone && !this.validatePhoneNumber(this.shippingInfo.phone)) 
      errorMessage += '- Formato de teléfono inválido\n';
    
    // Verificar campos según método de pago
    if (this.paymentMethod === 'card') {
      if (!this.cardInfo.number) errorMessage += '- Número de tarjeta\n';
      if (!this.cardInfo.expiry) errorMessage += '- Fecha de expiración\n';
      if (!this.cardInfo.cvv) errorMessage += '- CVV\n';
      if (!this.cardInfo.name) errorMessage += '- Nombre en la tarjeta\n';
      if (this.cardInfo.number && !this.validateCreditCard(this.cardInfo.number)) 
        errorMessage += '- Número de tarjeta inválido\n';
      if (this.cardInfo.expiry && !this.validateExpiryDate(this.cardInfo.expiry)) 
        errorMessage += '- Fecha de expiración inválida\n';
      if (this.cardInfo.cvv && !this.validateCVV(this.cardInfo.cvv)) 
        errorMessage += '- CVV inválido\n';
    } else if (this.paymentMethod === 'paypal') {
      if (!this.paypalInfo.phone) errorMessage += '- Teléfono para PayPal\n';
      if (this.paypalInfo.phone && !this.validatePhoneNumber(this.paypalInfo.phone)) 
        errorMessage += '- Formato de teléfono para PayPal inválido\n';
    } else if (this.paymentMethod === 'bizum') {
      if (!this.bizumInfo.phone) errorMessage += '- Teléfono para Bizum\n';
      if (this.bizumInfo.phone && !this.validatePhoneNumber(this.bizumInfo.phone)) 
        errorMessage += '- Formato de teléfono para Bizum inválido\n';
    }
    
    alert(errorMessage);
        window.scrollTo(0, 0);
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      this.showFormErrors();
      return;
    }
    
    this.formSubmitted = true;
    this.orderProcessing = true;
    
    setTimeout(() => {
      this.orderProcessing = false;
      
      const order = {
        items: this.cartItems,
        shipping: this.shippingInfo,
        payment: {
          method: this.paymentMethod,
          cardInfo: this.paymentMethod === 'card' ? this.cardInfo : null
        },
        total: this.getFinalTotal(),
        date: new Date(),
        orderNumber: 'ORD-' + Math.floor(Math.random() * 1000000)
      };
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      this.orderNumber = order.orderNumber;
      this.orderCompleted = true;
      
      // Enviar correo electrónico de confirmación
      this.emailService.sendOrderConfirmation(order).subscribe({
        next: (response) => {
          console.log('Correo enviado con éxito', response);
          this.cartService.clearCart();
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 5000);
        },
        error: (error) => {
          console.error('Error al enviar el correo', error);
          
          alert('Se ha procesado tu pedido correctamente, pero ha habido un problema al enviar el correo de confirmación. Por favor, contacta con soporte@compactlifes.com si no recibes la confirmación en tu correo.');
          
          this.cartService.clearCart();
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 5000);
        }
      });
    }, 2000);
  }
}
