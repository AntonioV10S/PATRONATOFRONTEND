import { Injectable } from '@angular/core';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

export interface UsuarioSesion {
  id_cuenta: number;
  nombres: string;
  correo: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(token: string, usuario: UsuarioSesion): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getUsuario(): UsuarioSesion | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getRol(): string | null {
    return this.getUsuario()?.rol ?? null;
  }
}
