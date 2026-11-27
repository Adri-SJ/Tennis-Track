"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { useSesion } from "./auth/SesionProvider";
import { esAdministrador } from "@/lib/permisos";
import {
  ajustes,
  itemActivo,
  nombreDe,
  paraRol,
  principales as menuPrincipal,
  secundarios,
  type ItemMenu,
} from "./navegacion";

/* Orden de la barra inferior: lo de todos los días primero. */
const BARRA = {
  admin: ["/", "/alumnos", "/grupos", "/asistencia"],
  entrenador: ["/asistencia", "/grupos", "/alumnos"],
};

export default function MobileNav() {
  const pathname = usePathname();
  const { usuario } = useSesion();
  const disponibles = paraRol(usuario.rol, [
    ...menuPrincipal,
    ...secundarios,
    ajustes,
  ]);
  const enBarra = BARRA[esAdministrador(usuario.rol) ? "admin" : "entrenador"];
  const principales = enBarra
    .map((href) => disponibles.find((item) => item.href === href))
    .filter((item): item is ItemMenu => Boolean(item));
  const otros = disponibles.filter((item) => !enBarra.includes(item.href));
  const [menuAbierto, setMenuAbierto] = useState(false);

  const estaActivo = (item: ItemMenu) => itemActivo(pathname, item);

  const otroModuloActivo = otros.some(estaActivo);

  return (
    <>
      {/* PANEL MÁS */}
      {menuAbierto && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-[#141113]/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Más módulos"
            className="absolute bottom-0 left-0 right-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-superficie px-5 pb-8 pt-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-texto">
                  MÁS
                </h2>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setMenuAbierto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-fondo text-texto"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {otros.map((item) => {
                const Icon = item.icon;
                const activo = estaActivo(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAbierto(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-4 transition ${
                      activo
                        ? "bg-lima-suave text-verde-oscuro"
                        : "bg-fondo text-texto"
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />

                    <span className="flex-1 text-sm font-bold">
                      {nombreDe(item, usuario.rol)}
                    </span>

                    <ChevronRight
                      size={17}
                      className="text-texto-suave"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-borde bg-superficie px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden"
      >
        {principales.map((item) => {
          const Icon = item.icon;
          const activo = estaActivo(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuAbierto(false)}
              aria-current={activo ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 ${
                activo
                  ? "font-bold text-verde"
                  : "text-texto-suave"
              }`}
            >
              <Icon size={22} />
              <span className="text-xs">{nombreDe(item, usuario.rol)}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMenuAbierto((anterior) => !anterior)}
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? "Cerrar más módulos" : "Abrir más módulos"}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 ${
            menuAbierto || otroModuloActivo
              ? "font-bold text-verde"
              : "text-texto-suave"
          }`}
        >
          {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          <span className="text-xs">Más</span>
        </button>
      </nav>
    </>
  );
}
