import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-component',
  standalone: true,
  templateUrl: './auth-component.component.html',
  styleUrls: ['./auth-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AuthComponentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isRegisterMode = false;

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.isRegisterMode = this.router.url.includes('register');
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit(event: Event) {
    event.preventDefault(); // para que no recargue la página
    if (this.isRegisterMode) {
      console.log('Registrando...');
    } else {
      console.log('Iniciando sesión...');
    }
  }
}
