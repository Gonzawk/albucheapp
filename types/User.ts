export interface User {
    usuarioId: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    fechaRegistro: string;
    role: number; // Asegúrate de que este campo exista en el endpoint o ajusta según corresponda.
    roleName?: string;    // Nombre descriptivo del rol (opcional)
  }
  