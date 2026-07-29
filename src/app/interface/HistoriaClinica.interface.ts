export interface Enfermedad {
  id_enfermedad?: number;
  enfermedad?: string;
  tipo_enfermedad?: string;
  codigo_cie?: string;
}

export interface HistoriaClinicaMG {
  id_historia_mg?: number;
  id_paciente?: number;
  id_enfermedad?: number;
  id_cuenta_auditoria?: number;
  fecha?: string;
  tipo_atencion?: string;
  condicion_diagnostico?: string;
  lugar_atencion?: string;
  certificado?: boolean;
  edad?: string;
  firma_ecdsa?: string;
  hash_integridad?: string;
  paciente?: any;
  enfermedad?: Enfermedad;
  // Solo presente al pedir el detalle (obtenerHistoria) — es el contenido
  // descifrado en tiempo real con la llave privada institucional.
  datos_sensibles?: {
    motivo?: string;
    diagnostico?: string;
    plan_terapeutico?: string;
    fecha_atencion?: string;
  };
}

// Datos que se envían al crear una consulta. llavePrivadaPem viaja UNA sola
// vez en esta petición (por HTTPS) y nunca se guarda en el servidor.
export interface NuevaHistoriaClinicaMG {
  id_paciente: number;
  id_enfermedad: number;
  motivo: string;
  diagnostico: string;
  plan_terapeutico: string;
  lugar_atencion: string;
  certificado: boolean;
  edad: string;
  tipo_atencion: string;
  condicion_diagnostico: string;
  grupo_atencion: string;
  llavePrivadaPem: string;
}
