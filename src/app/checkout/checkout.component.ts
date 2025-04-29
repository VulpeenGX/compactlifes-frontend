import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

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
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoggedIn: boolean = false;
  formSubmitted: boolean = false;
  orderProcessing: boolean = false;
  
  // Objeto para rastrear qué campos han sido tocados
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
    name: 'Usuario de Prueba',
    email: 'usuario@ejemplo.com',
    address: 'Calle Ejemplo 123',
    phone: '123456789'
  };
  
  // Datos del formulario
  shippingInfo = {
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  };
  
  // Información de la tarjeta
  cardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };
  
  // Información de PayPal
  paypalInfo = {
    phone: ''
  };
  
  // Información de Bizum
  bizumInfo = {
    phone: ''
  };
  
  paymentMethod: string = 'card';

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      
      // Si el carrito está vacío, redirigir al carrito
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
    
    // Simulamos que el usuario está logueado para pruebas
    this.isLoggedIn = true;
    
    // Si el usuario está logueado, prellenamos los datos
    if (this.isLoggedIn) {
      this.shippingInfo.name = this.user.name;
      this.shippingInfo.email = this.user.email;
      this.shippingInfo.address = this.user.address;
      this.shippingInfo.phone = this.user.phone;
    }
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
    // Verificar campos obligatorios de envío
    if (!this.shippingInfo.name || !this.shippingInfo.email || 
        !this.shippingInfo.address || !this.shippingInfo.city || 
        !this.shippingInfo.postalCode || !this.shippingInfo.phone) {
      return false;
    }
    
    // Verificar formato de código postal
    if (!this.validatePostalCode(this.shippingInfo.postalCode)) {
      return false;
    }
    
    // Verificar formato de teléfono
    if (!this.validatePhoneNumber(this.shippingInfo.phone)) {
      return false;
    }
    
    // Verificar campos de tarjeta si el método de pago es tarjeta
    if (this.paymentMethod === 'card') {
      if (!this.cardInfo.number || !this.cardInfo.expiry || 
          !this.cardInfo.cvv || !this.cardInfo.name) {
        return false;
      }
      
      // Verificar número de tarjeta con algoritmo Luhn
      if (!this.validateCreditCard(this.cardInfo.number)) {
        return false;
      }
      
      // Verificar formato y vigencia de fecha de expiración
      if (!this.validateExpiryDate(this.cardInfo.expiry)) {
        return false;
      }
      
      // Verificar formato de CVV
      if (!this.validateCVV(this.cardInfo.cvv)) {
        return false;
      }
    }
    
    // Verificar teléfono para PayPal
    if (this.paymentMethod === 'paypal') {
      if (!this.paypalInfo.phone || !this.validatePhoneNumber(this.paypalInfo.phone)) {
        return false;
      }
    }
    
    // Verificar teléfono para Bizum
    if (this.paymentMethod === 'bizum') {
      if (!this.bizumInfo.phone || !this.validatePhoneNumber(this.bizumInfo.phone)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Validación de código postal español (01000 a 52999)
  validatePostalCode(postalCode: string): boolean {
    const pattern = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
    return pattern.test(postalCode);
  }
  
  // Validación de número de teléfono español
  validatePhoneNumber(phone: string): boolean {
    const pattern = /^(?:\+34)?[6789]\d{8}$/;
    return pattern.test(phone);
  }
  
  // Validación de CVV (3 o 4 dígitos)
  validateCVV(cvv: string): boolean {
    const cvvRegex = /^[0-9]{3,4}$/;
    return cvvRegex.test(cvv);
  }
  
  // Validación de fecha de expiración (formato MM/AA y que no esté caducada)
  validateExpiryDate(expiryDate: string): boolean {
    // Verificar formato MM/AA
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
      return false;
    }
    
    // Extraer mes y año
    const [month, year] = expiryDate.split('/');
    
    // Convertir a fecha (20 indica 2000+)
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);
    
    // Obtener fecha actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11
    const currentYear = currentDate.getFullYear();
    
    // Verificar que la fecha no esté caducada
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return false;
    }
    
    return true;
  }
  
  // Validación de tarjeta de crédito usando algoritmo Luhn
  validateCreditCard(cardNumber: string): boolean {
    // Eliminar espacios y guiones
    const sanitizedNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Verificar que solo contiene dígitos y tiene longitud válida (13-19 dígitos)
    if (!/^\d{13,19}$/.test(sanitizedNumber)) {
      return false;
    }
    
    // Implementación del algoritmo de Luhn
    let sum = 0;
    let shouldDouble = false;
    
    // Recorrer el número de derecha a izquierda
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
    
    // El número es válido si la suma es múltiplo de 10
    return sum % 10 === 0;
  }

  // Método para marcar un campo como tocado
  validateField(fieldName: string): void {
    // Marcar el campo como tocado
    (this.fieldTouched as {[key: string]: boolean})[fieldName] = true;
    
    // Si el campo es de método de pago, validar campos relacionados
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

  // Método para mostrar errores cuando se hace clic en el botón deshabilitado
  showFormErrors(): void {
    // Marcar todos los campos como tocados para mostrar todos los errores
    Object.keys(this.fieldTouched).forEach(key => {
      (this.fieldTouched as {[key: string]: boolean})[key] = true;
    });
    
    // Mostrar un mensaje de alerta con los errores
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
    
    // Hacer scroll hacia arriba para mostrar los errores
    window.scrollTo(0, 0);
  }

  placeOrder(): void {
    // Si el formulario no es válido, mostrar errores y salir
    if (!this.isFormValid()) {
      this.showFormErrors();
      return;
    }
    
    this.formSubmitted = true;
    this.orderProcessing = true;
    
    // Simulamos un proceso de pago
    setTimeout(() => {
      // Aquí iría la lógica para procesar el pedido
      this.orderProcessing = false;
      
      // Crear objeto de pedido
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
      
      // Guardar el pedido en localStorage para simular una base de datos
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Limpiar el carrito
      this.cartService.clearCart();
      
      // Mostrar mensaje de éxito
      alert('¡Pedido realizado con éxito! Tu número de pedido es: ' + order.orderNumber);
      
      // Redirigir a la página de confirmación (se podría implementar en el futuro)
      this.router.navigate(['/']);
    }, 2000);
  }
}
