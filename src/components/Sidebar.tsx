
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NOMBRE_ROL } from "@/lib/permisos";
import ThemeToggle from "./ThemeToggle";
import { useSesion } from "./auth/SesionProvider";
import { rutaActiva, seccionesPara } from "./navegacion";

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario, salir } = useSesion();

  const estaActivo = (href: string) => rutaActiva(pathname, href);

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-borde bg-superficie lg:flex">

      {/* LOGO */}
      <div className="shrink-0 px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full border-2 border-borde-logo bg-[#cbd90a]" />

          <div>
            <h1 className="text-xl font-black tracking-tight text-texto">
              TENNISTRACK
            </h1>
            <p className="text-xs tracking-[0.2em] text-texto-suave">
              ACADEMIA
            </p>
          </div>
        </Link>
      </div>

      {/* MENÚ DESPLAZABLE */}
      <nav
        aria-label="Navegación principal"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5"
      >
        {seccionesPara(usuario.rol).map((seccion) => (
          <div key={seccion.titulo}>
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-texto-tenue">
              {seccion.titulo}
            </p>

            <div className="flex flex-col gap-1">
              {seccion.items.map((item) => {
                const Icon = item.icon;
                const activo = estaActivo(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      activo
                        ? "bg-lima-suave font-bold text-verde-oscuro"
                        : "text-texto-2 hover:bg-fondo hover:text-texto"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* PARTE INFERIOR */}
      <div className="shrink-0 border-t border-borde px-5 py-4">
        <p className="truncate font-semibold text-texto">
          {usuario.nombre}
        </p>

        <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-verde">
          {NOMBRE_ROL[usuario.rol]}
        </p>

        <ThemeToggle
          conTexto
          className="mt-4 flex items-center gap-3 text-sm text-texto-2 transition hover:text-texto"
        />

        <button
          type="button"
          onClick={salir}
          className="mt-3 flex items-center gap-3 text-sm text-texto-2 transition hover:text-texto"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
