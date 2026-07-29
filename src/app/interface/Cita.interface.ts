export interface Turno {
  id_turno?: number;
  id_rol?: number;
  hora?: string;
  amount?: number;
  estado?: boolean;
  rol?: { id_rol?: number; rol?: string };
}

export interface Cita {
  id_cita?: number;
  id_turno?: number;
  nombres?: string;
  cedula?: string;
  fecha?: string;
  estado?: number | string;
  abono?: boolean;
  turno?: Turno;
}
