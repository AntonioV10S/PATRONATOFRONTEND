export interface AntecedentePatologicoPersonal {
  id_patologico?: number;
  id_gineco?: number | null;
  infancia?: string;
  adolecencia?: string;
  adultez?: string;
  DBID?: boolean;
  HTA?: boolean;
  TbP?: boolean;
  DBI?: boolean;
  quirujircos?: string;
  alergias?: string;
  traumas?: string;
}

export interface AntecedenteGineco {
  id_gineco?: number;
  FUM?: string;
  FPP?: string;
  edad_gestional?: string;
  menarquia?: string;
  flujo_genital?: string;
  gestas?: string;
  partos?: string;
  cesareas?: string;
  abortos?: string;
}

export interface Familiar {
  id_familiar?: number;
  id_a_p_familiar?: number;
  nombres?: string;
  union?: string;
  vida?: boolean;
  causas?: string;
}

export interface Habito {
  id_habito?: number;
  alcohol?: string;
  tabaco?: string;
  drogas?: string;
  alimentacion?: string;
  diuresis?: string;
  somnia?: string;
}

export interface ExamenFisico {
  id_e_fisico?: number;
  cabeza?: string;
  cuello?: string;
  torax?: string;
  abdomen?: string;
  miembros_superiores?: string;
  miembros_inferiores?: string;
  region_genital?: string;
  region_anal?: string;
}

export interface ExamenOrganoSistema {
  id_sistema?: number;
  sistema_digestivo?: string;
  sistema_respiratorio?: string;
  sistema_cardiaco?: string;
  sistema_genitourinarion?: string;
  sistema_osteomuscular?: string;
  sistema_nervioso?: string;
}
