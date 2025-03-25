// personalizacionConfig.ts
export enum TipoProducto {
  Tipo1 = 1,  // Promo Tipo 1: 1 producto + 2 Toppings
  Tipo2 = 2,  // Tipo 2: 2 productos sin toppings
  Tipo3 = 3,  // Hamburguesas: Personalización completa (con extras)
  Tipo4 = 4,  // Sandwiches: aderezos, toppings y observaciones
  Tipo5 = 5,  // Para Acompañar: solo observaciones
  Tipo6 = 6,  // Minutas: solo observaciones
}

export const schemas: Record<TipoProducto, {
  description: string;
  schemaJson: string;
  allowedSections: string[];
}> = {
  [TipoProducto.Tipo1]: {
    description:
      "Promo Tipo 1: 1 producto + 2 toppings, permite personalización completa (con mayonesa, con queso, tipo de queso), aderezos, toppings y observaciones.",
    schemaJson: JSON.stringify(
      {
        personalizacion: {
          type: "object",
          properties: {
            conMayonesa: { type: "boolean" },
            conQueso: { type: "boolean" },
            tipoQueso: { type: "string" }
          }
        },
        toppings: { 
          max: 2, 
          type: "array", 
          itemType: "object",
          properties: {
            id: { type: "number" },
            nombre: { type: "string" },
            precio: { type: "number" }
          }
        },
        aderezos: { type: "array", itemType: "string" },
        observaciones: { type: "string" }
      },
      null,
      2
    ),
    allowedSections: ["personalizacion", "aderezos", "toppings", "observaciones"],
  },
  [TipoProducto.Tipo2]: {
    description:
      "Tipo 2: 2 productos sin toppings, con personalización y aderezos para cada subproducto, y observaciones.",
    schemaJson: JSON.stringify(
      {
        subproducto1: {
          personalizacion: {
            type: "object",
            properties: {
              conMayonesa: { type: "boolean" },
              conQueso: { type: "boolean" },
              tipoQueso: { type: "string" },
              aderezos: { type: "array", itemType: "string" },
              observaciones: { type: "string" }
            }
          }
        },
        subproducto2: {
          personalizacion: {
            type: "object",
            properties: {
              conMayonesa: { type: "boolean" },
              conQueso: { type: "boolean" },
              tipoQueso: { type: "string" },
              aderezos: { type: "array", itemType: "string" },
              observaciones: { type: "string" }
            }
          }
        }
      },
      null,
      2
    ),
    allowedSections: ["personalizacion", "aderezos", "observaciones"],
  },
  [TipoProducto.Tipo3]: {
    description:
      "Hamburguesas: Personalización completa, incluye mayonesa, queso, tipo de queso, aderezos, toppings, extras y observaciones.",
    schemaJson: JSON.stringify(
      {
        conMayonesa: { type: "boolean" },
        conQueso: { type: "boolean" },
        tipoQueso: { type: "string" },
        toppings: { 
          type: "array", 
          itemType: "object",
          properties: {
            id: { type: "number" },
            nombre: { type: "string" },
            precio: { type: "number" }
          }
        },
        aderezos: { type: "array", itemType: "string" },
        extras: { type: "array", itemType: "string" },
        observaciones: { type: "string" }
      },
      null,
      2
    ),
    allowedSections: ["personalizacion", "aderezos", "toppings", "extras", "observaciones"],
  },
  [TipoProducto.Tipo4]: {
    description:
      "Sandwiches: Permite aderezos, toppings y observaciones.",
    schemaJson: JSON.stringify(
      {
        aderezos: { type: "array", itemType: "string" },
        toppings: { 
          type: "array", 
          itemType: "object",
          properties: {
            id: { type: "number" },
            nombre: { type: "string" },
            precio: { type: "number" }
          }
        },
        observaciones: { type: "string" }
      },
      null,
      2
    ),
    allowedSections: ["aderezos", "toppings", "observaciones"],
  },
  [TipoProducto.Tipo5]: {
    description:
      "Para Acompañar: Solo permite observaciones.",
    schemaJson: JSON.stringify(
      {
        observaciones: { type: "string" }
      },
      null,
      2
    ),
    allowedSections: ["observaciones"],
  },
  [TipoProducto.Tipo6]: {
    description: "Minutas: Solo permite observaciones.",
    schemaJson: JSON.stringify(
      {
        observaciones: { type: "string" }
      },
      null,
      2
    ),
    allowedSections: ["observaciones"],
  },
};

export const personalizacionConfig = {
  TipoProducto,
  schemas,
};
