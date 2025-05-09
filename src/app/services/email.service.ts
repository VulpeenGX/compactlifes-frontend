import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // URL del backend que manejará el envío de correos
  private apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  
  // ID de servicio y plantilla de EmailJS
  private serviceId = 'service_hkp1zea'; // Reemplazar con tu ID de servicio
  private templateId = 'template_r3wlcuw'; // Reemplazar con tu ID de plantilla
  private userId = 'R2wMGaN5EQnOgQITm'; // Reemplazar con tu ID de usuario

  constructor(private http: HttpClient) { }

  /**
   * Envía un correo electrónico de confirmación de pedido
   * @param orderData Datos del pedido
   * @returns Observable con la respuesta del servidor
   */
  sendOrderConfirmation(orderData: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const emailData = {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.userId,
      template_params: {
        to_email: orderData.shipping.email,
        to_name: orderData.shipping.name,
        order_number: orderData.orderNumber,
        order_date: new Date(orderData.date).toLocaleDateString('es-ES'),
        order_total: orderData.total.toFixed(2) + ' €',
        shipping_address: `${orderData.shipping.address}, ${orderData.shipping.city}, ${orderData.shipping.postalCode}`,
        payment_method: this.getPaymentMethodName(orderData.payment.method),
        items: this.formatOrderItems(orderData.items),
        support_email: 'soporte@compactlifes.com',
        website_url: 'https://compactlifes.com'
      }
    };

    // Modificar para aceptar respuesta de texto en lugar de JSON
    return this.http.post(this.apiUrl, emailData, { 
      headers,
      responseType: 'text' // Cambiar el tipo de respuesta a texto
    });
  }

  /**
   * Formatea los elementos del pedido para la plantilla de correo
   * @param items Elementos del pedido
   * @returns Cadena HTML con los elementos formateados
   */
  private formatOrderItems(items: any[]): string {
    let itemsHtml = '';
    
    items.forEach(item => {
      const precio = item.descuento ? 
        (item.precio - (item.precio * item.descuento / 100)).toFixed(2) : 
        item.precio.toFixed(2);
      
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${item.imagen}" alt="${item.nombre}" style="width: 50px; height: 50px; object-fit: cover;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${precio} €</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${(precio * item.quantity).toFixed(2)} €</td>
        </tr>
      `;
    });
    
    return itemsHtml;
  }

  /**
   * Obtiene el nombre del método de pago
   * @param method Código del método de pago
   * @returns Nombre del método de pago
   */
  private getPaymentMethodName(method: string): string {
    switch (method) {
      case 'card': return 'Tarjeta de crédito/débito';
      case 'paypal': return 'PayPal';
      case 'bizum': return 'Bizum';
      default: return 'Desconocido';
    }
  }
}
