# CompactLifes Frontend

Este proyecto es el frontend de la aplicación web CompactLifes, una tienda en línea especializada en muebles y accesorios para espacios reducidos. Desarrollado con Angular 19.2.0, ofrece una interfaz de usuario moderna y responsive.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/user/repo/actions) [![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT) [![Version](https://img.shields.io/badge/version-1.0.0-orange)](https://example.com)

## Requisitos Previos
- Node.js (versión 16.x o superior)
- npm (versión 8.x o superior)
- Angular CLI (versión 19.2.0)

## Instalación
1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   ```
2. Navega al directorio del proyecto:
   ```
   cd Frontend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Ejecución
### Servidor de desarrollo
   ```
   ng serve
   ```
Navega a [http://localhost:4200/](http://localhost:4200/) para ver la aplicación en funcionamiento.

### Compilación para producción
   ```
   ng build --prod
   ```
Los archivos compilados se almacenarán en el directorio dist/.

## Estructura del Proyecto
El proyecto sigue la estructura estándar de Angular con los siguientes componentes principales:

- account: Gestión de la cuenta de usuario
- auth-component: Componentes de autenticación (login/registro)
- banner: Banners promocionales
- carousel/carousel2: Carruseles de productos destacados
- cart: Gestión del carrito de compras
- checkout: Proceso de pago
- collage-images: Galería de imágenes
- faq: Preguntas frecuentes
- footer: Pie de página
- header: Cabecera de la aplicación
- home-view-component: Vista principal de la página de inicio
- interceptors: Interceptores HTTP para autenticación
- notification: Sistema de notificaciones
- page404: Página de error 404
- product/product-listing: Visualización de productos
- services: Servicios para la comunicación con el backend
- wishlist: Lista de deseos

## Pruebas
   ```
   ng test
   ```

## Contribución
Para contribuir al proyecto, por favor sigue estos pasos:

1. Crea una rama para tu funcionalidad ( `git checkout -b feature/nueva-funcionalidad` )
2. Realiza tus cambios.
3. Haz commit de tus cambios ( `git commit -m 'Añadir nueva funcionalidad'` )
4. Sube tus cambios a la rama ( `git push origin feature/nueva-funcionalidad` )
5. Abre un Pull Request.

## Características
- Interfaz de usuario moderna y receptiva.
- Gestión completa de cuentas de usuario.
- Sistema de autenticación (login y registro).
- Funcionalidad de carrito de compras.
- Opción de lista de deseos.

## Preguntas Frecuentes
1. **¿Cuál es la versión mínima de Node.js necesaria?**  
   La versión mínima es 16.x.
2. **¿Cómo puedo contribuir al proyecto?**  
   Por favor, sigue las instrucciones en la sección de contribución.

## Soporte
Si tienes preguntas o necesitas ayuda, por favor contacta a nuestro equipo de soporte a través de [Contacto](mailto:support@compactlifes.com).
