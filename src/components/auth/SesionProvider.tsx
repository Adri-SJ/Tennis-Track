"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, marcarSesion } from "@/lib/auth/cliente";
import type { Rol } from "@/lib/permisos";

export type UsuarioCliente = { id: number; nombre: string; rol: Rol };

type Sesion = { usuario: UsuarioCliente; salir: () => Promise<void> };

const ContextoSesion = createContext<Sesion | null>(null);

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
