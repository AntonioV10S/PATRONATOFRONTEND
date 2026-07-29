export interface Rol {
  id_rol?: number;
  rol?: string;
  estado?: boolean;
  atencion?: boolean;
  atiende_medico?: boolean;
}

export interface Cuenta {
  id_cuenta?: number;
  id_rol?: number;
  nombres?: string;
  correo?: string;
  password?: string;
  imagen?: string;
  estado?: boolean;
  role?: Rol;
}
