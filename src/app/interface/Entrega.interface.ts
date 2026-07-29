export interface Entrega {
  id_entrega?: number;
  id_paciente?: number;
  Fechaentrega?: string;
  peso?: string;
  talla?: string;
  ta?: string;
  subtotal?: number;
  descuento?: number;
  totalapagar?: number;
  entregado?: boolean;
  nombres?: string;
  apellidos?: string;
  edad?: string;
}

export interface DetalleEntrega {
  id_detalle_entrega?: number;
  id_entrega?: number;
  id_medicamento?: number;
  id_inventario?: number;
  cantidadmedicamentos?: number;
  indicaciones?: string;
  medicinasinrg?: string;
  nombremedi?: string;
}
