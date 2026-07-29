export interface Paciente {
  id_paciente?: number;
  id_patologico?: number;
  id_e_fisico?: number;
  id_e_organo_sistema?: number;
  id_e_complementario?: number;
  id_habito?: number;
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  edad?: string;
  sexo?: string;
  gad?: boolean;
  ocupacion?: string;
  residencia?: string;
  procedencia?: string;
  estado_civil?: string;
  raza?: string;
  religion?: string;
  fecha_nacimiento?: string;
  nivel_instruccion?: string;
  grupo_a_prioritaria?: string; // nombre real de la columna (lo que devuelve el backend al leer)
  telefono?: string;
  email?: string;
  fecha_registro?: string;
  // LOPDP: consentimiento informado
  consentimiento_datos?: boolean;
  fecha_consentimiento?: string;
  // Antecedentes anidados, presentes al pedir el detalle del paciente (GET /pacientes/:id)
  habitos?: any[];
  familiares?: any[];
  examen_organo_sistemas?: any[];
  examen_fisicos?: any[];
  examene_complementarios?: any[];
  antecedentes_patologicos_personales?: any[];
}
