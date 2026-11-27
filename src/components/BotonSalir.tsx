"use client";

import { LogOut } from "lucide-react";
import { useSesion } from "./auth/SesionProvider";

export default function BotonSalir() {
  const { salir } = useSesion();

  return (
    <button
      type="button"
      onClick={salir}
      className="flex items-center gap-2 rounded-xl bg-peligro-suave px-4 py-2.5 text-sm font-bold text-peligro"
    >
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}
