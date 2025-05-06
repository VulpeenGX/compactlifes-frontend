import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface User {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  gender: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  user: User = {
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthday: '1990-01-01',
    gender: 'male'
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          // Actualizar los datos del usuario desde el backend
          this.user.name = `${user.nombre} ${user.apellido}`;
          this.user.firstName = user.nombre;
          this.user.lastName = user.apellido;
          this.user.email = user.email;
          this.user.phone = user.telefono;
          this.user.address = user.direccion;
        } else {
          // Si no hay usuario autenticado, redirigir al login
          this.router.navigate(['/login']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  saveChanges(): void {
    // Aquí se implementaría la lógica para guardar los cambios
    // Por ahora solo mostramos un mensaje
    console.log('Guardando cambios:', this.user);
    alert('Información actualizada correctamente');
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
