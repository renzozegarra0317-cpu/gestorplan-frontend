export interface TrabajadorPlanilla {
  id: number;
  nombres: string;
  cargo: string;
  sueldoBruto: number;
  descuentos: number;
  aportes: number;
  sueldoNeto: number;
}

export interface Planilla {
  id: number;
  periodo: string;
  tipo: string;
  responsable: string;
  fecha: string;
  estado: "Abierta" | "Aprobada" | "Cerrada";
  trabajadores: TrabajadorPlanilla[];
}