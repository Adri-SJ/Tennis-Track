import type { MetadataRoute } from "next";

/* Manifiesto de la PWA: permite instalar el panel en el celular. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TennisTrack",
    short_name: "TennisTrack",
    description: "Panel de administración de la academia de tenis",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#141113",
    theme_color: "#141113",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Asistencia", url: "/asistencia" },
      { name: "Alumnos", url: "/alumnos" },
      { name: "Inventario", url: "/inventario" },
    ],
  };
}
