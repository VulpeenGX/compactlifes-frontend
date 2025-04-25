import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

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
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
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

  onSubmit(event: Event): void {
    event.preventDefault();
    // Aquí puedes agregar la lógica para manejar el envío del formulario
    console.log('Formulario enviado');
  }



}
