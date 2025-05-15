import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  
  private serviceId = 'service_hkp1zea'; 
  private templateId = 'template_r3wlcuw'; 
  private userId = 'R2wMGaN5EQnOgQITm'; 
  private baseUrl = 'https://compactlifes.netlify.app'; // URL base para imágenes absolutas

  constructor(private http: HttpClient) { }

  /**
   * Envía un correo electrónico de confirmación de pedido
   * @param orderData Datos del pedido
   * @returns Observable con la respuesta del servidor
   */
  sendOrderConfirmation(orderData: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    // Asegurarse de que el total sea un número antes de usar toFixed
    const total = typeof orderData.total === 'number' ? 
      orderData.total.toFixed(2) + ' €' : 
      orderData.total + ' €';
    
    // Verificar que el email sea válido
    const email = orderData.shipping.email || '';
    console.log('Email de destino:', email);
    
    if (!email || !email.includes('@')) {
      console.error('Email de destino inválido:', email);
      return new Observable(observer => {
        observer.error('Email de destino inválido');
        observer.complete();
      });
    }
    
    // Crear objeto de datos simplificado para EmailJS
    const emailData = {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.userId,
      template_params: {
        to_name: orderData.shipping.name,
        to_email: email,
        order_number: orderData.orderNumber,
        order_date: new Date(orderData.date).toLocaleDateString('es-ES'),
        order_total: total,
        payment_method: this.getPaymentMethodName(orderData.payment.method),
        shipping_address: `${orderData.shipping.address}, ${orderData.shipping.city}, ${orderData.shipping.postalCode}`,
        items: this.formatOrderItems(orderData.items),
        support_email: 'soporte@compactlifes.com',
        website_url: this.baseUrl.replace(/[`'"]/g, '').trim() // Asegurarse de eliminar backticks
      }
    };

    console.log('Enviando datos a EmailJS:', JSON.stringify(emailData));

    // Enviar solicitud a EmailJS
    return this.http.post(this.apiUrl, emailData, { 
      headers,
      responseType: 'text' 
    });
  }

  /**
   * Formatea los elementos del pedido para la plantilla de correo
   * @param items Elementos del pedido
   * @returns Cadena HTML con los elementos formateados
   */
  private formatOrderItems(items: any[]): string {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return '<tr><td colspan="4">No hay productos en este pedido</td></tr>';
    }
    
    let itemsHtml = '';
    
    items.forEach(item => {
      try {
        // Convertir precio a número usando parseFloat para mayor seguridad
        const itemPrecio = parseFloat(String(item.precio)) || 0;
        const descuento = parseFloat(String(item.descuento)) || 0;
        
        const precio = descuento > 0 ? 
          (itemPrecio - (itemPrecio * descuento / 100)).toFixed(2) : 
          itemPrecio.toFixed(2);
        
        // Crear fila de tabla HTML para el producto (sin imagen)
        itemsHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${precio} €</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${(parseFloat(precio) * item.quantity).toFixed(2)} €</td>
          </tr>
        `;
      } catch (error) {
        console.error('Error al formatear producto:', item, error);
        itemsHtml += `
          <tr>
            <td colspan="4" style="padding: 10px; border-bottom: 1px solid #eee; color: #ff0000;">
              Error al procesar este producto
            </td>
          </tr>
        `;
      }
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
