import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../middleware/auth.service';
import { LayoutService } from '../../../layout/service/app.layout.service';
import { environment } from '../../../../environments/enviroments';

import { MessageService, Message } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Se reutiliza "username" como nombre de campo del formulario (ya existente en el
  // HTML), pero su contenido real es el correo institucional.
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loading: boolean = false;

  msgs: Message[] = [];

  constructor(
    public layoutService: LayoutService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(loginForm: any): void {
    this.msgs = [];

    if (!loginForm.valid) {
      return;
    }

    this.loading = true;

    this.http.post<any>(`${environment.baseUrl}/cuentas/login`, {
      correo: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.code === '201' && res.token && res.result && res.result[0]) {
          const datos = res.result[0];
          this.authService.login(res.token, {
            id_cuenta: datos.id_cuenta,
            nombres: datos.nombres,
            correo: datos.correo,
            rol: datos.role?.rol ?? ''
          });
          this.router.navigate(['/']);
        } else {
          this.msgs = [{ severity: 'error', summary: '', detail: res.mensaje || 'No se pudo iniciar sesión.' }];
        }
      },
      error: (error) => {
        this.loading = false;
        const detalle = error.error?.mensaje || 'Correo o contraseña incorrectos.';
        this.msgs = [{ severity: 'error', summary: '', detail: detalle }];
      }
    });
  }
}
