export interface Pedido {
    id: number;
    orden: string;
    estado: string;
    fechaCreacion: string; // en formato ISO (string) o Date, según prefieras
    fechaFinalizacion?: string | null;
  }
  