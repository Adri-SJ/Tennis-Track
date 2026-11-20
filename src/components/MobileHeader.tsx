"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSesion } from "./auth/SesionProvider";

/* En móvil la navegación vive en la barra inferior (MobileNav). */
export default function MobileHeader() {
  const { salir } = useSesion();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-borde bg-superficie px-4 py-3 lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-borde-logo bg-[#cbd90a]" />

        <div>
          <h1 className="text-sm font-black tracking-tight">
            TENNISTRACK
          </h1>

          <p className="text-[10px] tracking-[0.18em] text-texto-suave">
            ACADEMIA
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle className="rounded-lg p-2 text-texto-2 hover:bg-fondo" />

        <button
          type="button"
          onClick={salir}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="rounded-lg p-2 text-texto-2 hover:bg-fondo"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
