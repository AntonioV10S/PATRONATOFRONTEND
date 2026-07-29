export interface CategoriaMedicamento {
  id_categoriamedicamento?: number;
  tipo?: string;
  estado?: boolean;
}

export interface Laboratorio {
  id_laboratorio?: number;
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
}

export interface Medicamento {
  id_medicamento?: number;
  id_categoriamedicamento?: number;
  id_laboratorio?: number;
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
  nombre_laboratorio?: string;
  tipo_medicamentos?: string;
}

export interface Inventario {
  id_inventario?: number;
  id_medicamento?: number;
  existencias?: number;
  fechacre?: string;
  fechaexp?: string;
  fechareg?: string;
  valoruni?: number;
  codigodebarra?: string;
  estado?: boolean;
  nombre_medicamento?: string;
}
