export interface Persona {
  id: string;
  nombre: string;
  avatar?: string;
  color?: string;
}

export interface GastoMensual {
  id: string;
  descripcion: string;
  monto: number;
  categoria?: string;
  pagadoPor: string;
  participantes: string[];
  fecha: string;
  timestamp?: number;
}

export interface GastoSalida {
  id: string;
  descripcion: string;
  monto: number;
  categoria?: string;
  pagadoPor?: string; // Optional: who covered the bill initially or shared
  personas: string[];
  fecha: string;
  timestamp?: number;
}

export interface Deuda {
  de: string;
  para: string;
  monto: number;
}

export type TabType = 'mensual' | 'salida' | 'ruleta' | 'cuentas';

export type ModoRuleta = 'pagador' | 'castigo' | 'personalizado';

export interface PresetCategoria {
  id: string;
  nombre: string;
  icono: string;
  sugerenciaMonto?: number;
}
