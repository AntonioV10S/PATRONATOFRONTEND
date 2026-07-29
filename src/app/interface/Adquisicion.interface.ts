export interface Adquisicion {
  id_adquisicion?: number;
  numeroadqui?: string;
  precioadqui?: number;
  descripcionadqui?: string;
  documento?: string | null;
  fechaadqui?: string;
  fecharegadqui?: string;
  tipoadqui?: boolean;
  estadoadqui?: boolean;
}

export interface DetalleAdquisicion {
  id_detalle_adquisicion?: number;
  id_adquisicion?: number;
  id_medicamento?: number;
  cantidadmedicamentos?: number;
  codigodebarra?: string;
  valoruni?: number;
  fechacre?: string;
  fechaexp?: string;
  fechareg?: string;
  estado?: boolean;
  nombre_medicamento?: string;
}
