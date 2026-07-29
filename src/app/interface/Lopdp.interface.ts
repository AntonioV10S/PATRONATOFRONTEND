export interface IncidenteSeguridad {
  id_incidente?: number;
  fecha_incidente?: string;
  tipo?: string;
  descripcion?: string;
  datos_afectados?: string;
  accion_tomada?: string;
  notificado_autoridad?: boolean;
  fecha_notificacion?: string;
  notificado_titulares?: boolean;
  estado?: string;
  cuenta?: { nombres?: string };
}

export interface SolicitudArco {
  id_solicitud?: number;
  id_paciente?: number;
  tipo_solicitud?: string;
  descripcion?: string;
  fecha_solicitud?: string;
  estado?: string;
  resolucion?: string;
  fecha_resolucion?: string;
  paciente?: { nombres?: string; apellidos?: string };
  cuenta?: { nombres?: string };
}
