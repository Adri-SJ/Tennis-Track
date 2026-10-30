"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSesion } from "./auth/SesionProvider";
import { rutaActiva, seccionesPara } from "./navegacion";

export default function MobileHeader() {
  const pathname = usePathname();
  const { usuario, salir } = useSesion();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-borde bg-superficie px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
            className="rounded-lg p-2 hover:bg-fondo"
          >
            <Menu size={22} />
          </button>

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
        </div>

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

      {/* MENÚ LATERAL */}
      {menuAbierto && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-[#141113]/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="absolute bottom-0 left-0 top-0 flex w-72 max-w-[85vw] flex-col bg-superficie shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 pb-4 pt-5">
              <p className="text-lg font-black tracking-tight text-texto">
                TENNISTRACK
              </p>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setMenuAbierto(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-fondo text-texto"
              >
                <X size={20} />
              </button>
            </div>

            <nav
              aria-label="Menú móvil"
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
                      const activo = rutaActiva(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuAbierto(false)}
                          aria-current={activo ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                            activo
                              ? "bg-lima-suave font-bold text-verde-oscuro"
                              : "text-texto-2"
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
          </div>
        </div>
      )}
    </>
  );
}
