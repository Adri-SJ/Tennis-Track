
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { NOMBRE_ROL, puedeVer } from "@/lib/permisos";
import { useSesion } from "./auth/SesionProvider";
import {
  ajustes,
  itemActivo,
  nombreDe,
  paraRol,
  principales,
  secundarios,
  type ItemMenu,
} from "./navegacion";

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario } = useSesion();

  const grupos = [paraRol(usuario.rol, principales), paraRol(usuario.rol, secundarios)]
    .filter((items) => items.length > 0);
  const verAjustes = puedeVer(usuario.rol, ajustes.href);
  const ajustesActivo = itemActivo(pathname, ajustes);

  const enlace = (item: ItemMenu) => {
    const Icon = item.icon;
    const activo = itemActivo(pathname, item);

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
        <span>{nombreDe(item, usuario.rol)}</span>
      </Link>
    );
  };

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
        {grupos.map((items, indice) => (
          <div
            key={indice}
            className={`flex flex-col gap-1 ${
              indice > 0 ? "border-t border-borde pt-5" : ""
            }`}
          >
            {items.map(enlace)}
          </div>
        ))}
      </nav>

      {/* PARTE INFERIOR */}
      <div className="shrink-0 border-t border-borde px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-texto">
              {usuario.nombre}
            </p>

            <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-verde">
              {NOMBRE_ROL[usuario.rol]}
            </p>
          </div>

          {verAjustes && (
            <Link
              href={ajustes.href}
              aria-label="Ajustes"
              title="Ajustes"
              aria-current={ajustesActivo ? "page" : undefined}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                ajustesActivo
                  ? "bg-lima-suave text-verde-oscuro"
                  : "text-texto-2 hover:bg-fondo hover:text-texto"
              }`}
            >
              <Settings size={18} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
