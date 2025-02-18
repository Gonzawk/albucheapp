import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */images: {
    domains: ["i.ibb.co"], // Agrega ibb.co a la lista de dominios permitidos
  },
};

export default nextConfig;
