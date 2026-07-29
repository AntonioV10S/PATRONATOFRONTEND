export interface Diagnostico {
  id_diagnostico?: number;
  diagnostico?: string;
  codigo_cie?: string;
}

export interface Tratamiento {
  id_tratamiento?: number;
  estimulacion_temprana?: string | null;
  magnetoterapia?: string | null;
  electroestimulacion?: string | null;
  ultrasonido?: string | null;
  C_Q_C_O_H?: string | null;
  masaje?: string | null;
  ejercicios_pasivos_resistidos?: string | null;
  laser?: string | null;
  otros?: string | null;
}

export interface HistoriaClinicaRF {
  id_rf?: number;
  id_paciente?: number;
  id_tratamiento?: number;
  id_diagnostico?: number;
  id_cuenta_auditoria?: number;
  lugar_atencion?: string;
  certificado?: boolean;
  fecha?: string;
  edad?: string;
  firma_ecdsa?: string;
  hash_integridad?: string;
  paciente?: any;
  diagnostico?: Diagnostico;
  tratamientos?: Tratamiento;
  datos_sensibles?: {
    motivo_consulta?: string;
    anamnesis?: string;
    receta?: string;
    fecha_atencion?: string;
  };
}

export interface NuevaHistoriaClinicaRF {
  id_paciente: number;
  id_tratamiento: number;
  id_diagnostico: number;
  lugar_atencion: string;
  certificado: boolean;
  motivo_consulta: string;
  anamnesis: string;
  receta: string;
  fecha: string;
  edad: string;
  grupo_atencion: string;
  llavePrivadaPem: string;
}
