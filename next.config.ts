import type { NextConfig } from "next";

const enDesarrollo = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* Genera .next/standalone para la imagen de Docker (ver Dockerfile). */
  output: "standalone",
  /* Solo en desarrollo: abrir el panel en 127.0.0.1 o por el túnel de VS Code. */
  allowedDevOrigins: ["127.0.0.1", "*.devtunnels.ms"],
  experimental: {
    serverActions: {
      /*
        El túnel de VS Code reenvía las peticiones con Origin
        «localhost:3000»; sin esto, Next rechaza los guardados.
        En producción no aplica: Caddy conserva el origen real.
      */
      allowedOrigins: enDesarrollo ? ["localhost:3000"] : [],
    },
  },
};

export default nextConfig;
