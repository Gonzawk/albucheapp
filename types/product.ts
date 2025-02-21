export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoria:string;
    aderezos: string[];  // Lista de aderezos sin costo adicional
    toppings: Record<string, number>;  // Objeto de toppings con su respectivo precio
  }