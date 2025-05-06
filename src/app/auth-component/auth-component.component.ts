import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../services/auth.service';

// Validador personalizado para verificar que las contraseñas coincidan
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value 
    ? { 'passwordMismatch': true } 
    : null;
};

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
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  isRegisterMode = false;
  authForm!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.isRegisterMode = this.router.url.includes('register');
      this.initForm();
    });
  }

  initForm() {
    if (this.isRegisterMode) {
      this.authForm = this.formBuilder.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        direccion: ['', [Validators.required]],
        telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]]
      }, { validators: passwordMatchValidator });
    } else {
      this.authForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isRegisterMode) {
      const { nombre, apellido, email, password, confirmPassword, direccion, telefono } = this.authForm.value;
      
      this.authService.register(
        nombre, 
        apellido, 
        email, 
        password, 
        confirmPassword, 
        direccion, 
        telefono
      ).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          if (error.error && typeof error.error === 'object') {
            // Extraer mensajes de error del backend
            const errorMessages = [];
            for (const key in error.error) {
              if (error.error.hasOwnProperty(key)) {
                errorMessages.push(`${key}: ${error.error[key]}`);
              }
            }
            this.errorMessage = errorMessages.join(', ');
          } else {
            this.errorMessage = 'Error al registrar usuario. Por favor, inténtalo de nuevo.';
          }
        }
      });
    } else {
      const { email, password } = this.authForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
          }
        }
      });
    }
  }
}
