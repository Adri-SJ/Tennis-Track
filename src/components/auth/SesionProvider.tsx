"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, marcarSesion } from "@/lib/auth/cliente";
import type { Rol } from "@/lib/permisos";

export type UsuarioCliente = { id: number; nombre: string; rol: Rol };

type Sesion = { usuario: UsuarioCliente; salir: () => Promise<void> };

const ContextoSesion = createContext<Sesion | null>(null);

/* Igual que INACTIVIDAD_S del servidor (src/lib/auth/jwt.ts). */
const INACTIVIDAD_MS = 30 * 60 * 1000;

/* Cada cuánto, como máximo, la actividad renueva la cookie en el servidor. */
const LATIDO_MS = 5 * 60 * 1000;

/* La última actividad se comparte entre pestañas del mismo navegador. */
const CLAVE_ACTIVIDAD = "tennistrack.actividad";

const EVENTOS_ACTIVIDAD = ["pointerdown", "keydown", "wheel", "touchstart"];

function leerActividad(): number {
  try {
    return Number(localStorage.getItem(CLAVE_ACTIVIDAD)) || 0;
  } catch {
    return 0;
  }
}

function guardarActividad(momento: number): void {
  try {
    localStorage.setItem(CLAVE_ACTIVIDAD, String(momento));
  } catch {
    // Sin almacenamiento cada pestaña lleva su propia cuenta.
  }
}

export function useSesion(): Sesion {
  const sesion = useContext(ContextoSesion);

  if (!sesion) {
    throw new Error("useSesion debe usarse dentro de SesionProvider.");
  }

  return sesion;
}

export default function SesionProvider({
  usuario,
  children,
}: {
  usuario: UsuarioCliente;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    marcarSesion(true);

    const alExpirar = () => {
      marcarSesion(false);
      router.replace("/login");
    };

    window.addEventListener("sesion-expirada", alExpirar);

    return () => {
      marcarSesion(false);
      window.removeEventListener("sesion-expirada", alExpirar);
    };
  }, [router]);

  /*
    Cierre por inactividad: tras 30 minutos sin tocar la app (en
    ninguna pestaña) se cierra la sesión. Mientras hay actividad, un
    latido a /api/auth/yo mantiene viva la cookie en el servidor.
  */
  useEffect(() => {
    let ultimaActividad = Date.now();
    let ultimoLatido = Date.now();
    let cerrando = false;

    guardarActividad(ultimaActividad);

    const alActuar = () => {
      ultimaActividad = Date.now();
      guardarActividad(ultimaActividad);

      if (ultimaActividad - ultimoLatido > LATIDO_MS) {
        ultimoLatido = ultimaActividad;
        api("/api/auth/yo").catch(() => {
          // Un 401 aquí ya dispara «sesion-expirada».
        });
      }
    };

    const revisar = () => {
      const ultima = Math.max(ultimaActividad, leerActividad());

      if (cerrando || Date.now() - ultima < INACTIVIDAD_MS) {
        return;
      }

      cerrando = true;
      marcarSesion(false);
      api("/api/auth/salir", { method: "POST" })
        .catch(() => {})
        .finally(() => {
          router.replace("/login?motivo=inactividad");
          router.refresh();
        });
    };

    EVENTOS_ACTIVIDAD.forEach((evento) =>
      window.addEventListener(evento, alActuar, { passive: true })
    );
    document.addEventListener("visibilitychange", revisar);

    const intervalo = window.setInterval(revisar, 30 * 1000);

    return () => {
      EVENTOS_ACTIVIDAD.forEach((evento) =>
        window.removeEventListener(evento, alActuar)
      );
      document.removeEventListener("visibilitychange", revisar);
      window.clearInterval(intervalo);
    };
  }, [router]);

  const salir = useCallback(async () => {
    try {
      await api("/api/auth/salir", { method: "POST" });
    } finally {
      marcarSesion(false);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  return (
    <ContextoSesion.Provider value={{ usuario, salir }}>
      {children}
    </ContextoSesion.Provider>
  );
}
