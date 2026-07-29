export interface Recaudacion {
  id_recaudacion?: number;
  id_paciente?: number;
  id_rol?: number;
  fecha?: string;
  valor?: string | number;
  exonera?: boolean;
  observaciones?: string;
  paciente?: any;
  rol?: { id_rol?: number; rol?: string };
}
