"use client";

import { useEffect } from "react";

/*
  Registra public/sw.js. Solo en producción: en desarrollo un service
  worker puede servir páginas viejas y confundir mientras se edita.
*/
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error) => {
          console.error("No se pudo registrar el service worker:", error);
        });
    }
  }, []);

  return null;
}
