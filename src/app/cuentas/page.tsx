import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import BotonSalir from "@/components/BotonSalir";
import { SelectorTema } from "@/components/ThemeToggle";
import { usuarioDePagina } from "@/lib/auth/servidor";
import { esAdministrador, NOMBRE_ROL } from "@/lib/permisos";
import CuentasClient from "./CuentasClient";

export const metadata: Metadata = {
  title: "Ajustes",
};

/* Tema y sesión para todos; la gestión de cuentas, solo para administradores. */
export default async function AjustesPage() {
  const { usuario } = await usuarioDePagina("/cuentas");

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <h1 className="mb-5 text-2xl font-black tracking-tight text-texto sm:text-3xl md:text-5xl">
          AJUSTES
        </h1>

        <section className="rounded-2xl border border-borde bg-superficie p-4 sm:p-6 lg:max-w-xl">
          <h2 className="text-lg font-black text-texto sm:text-xl">
            APARIENCIA
          </h2>
          <p className="mb-4 mt-1 text-sm text-texto-suave">
            &quot;Sistema&quot; sigue el modo claro u oscuro de tu dispositivo.
          </p>
          <SelectorTema />
        </section>

        {esAdministrador(usuario.rol) && <CuentasClient />}

        {/* Al final de la página, para no cerrar sesión por accidente. */}
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-borde bg-superficie p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-texto sm:text-xl">
              MI SESIÓN
            </h2>
            <p className="mt-1 text-sm text-texto-suave">
              {usuario.nombre} · {NOMBRE_ROL[usuario.rol]}
            </p>
          </div>
          <BotonSalir />
        </section>
      </div>
    </AppLayout>
  );
}
