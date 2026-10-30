import { headers } from "next/headers";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { usuarioDePagina } from "@/lib/auth/servidor";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";
import SesionProvider from "./auth/SesionProvider";

/*
  Marco de todas las páginas del panel. Verifica la sesión contra la
  base y si el rol puede ver la ruta (la pone el proxy en x-ruta).
*/
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ruta = (await headers()).get("x-ruta") ?? "/";
  const { usuario, permitido } = await usuarioDePagina(ruta);

  return (
    <SesionProvider
      usuario={{ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }}
    >
      <div className="min-h-screen bg-fondo">
        <Sidebar />

        <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
          <MobileHeader />

          {permitido ? children : <SinPermiso />}
        </main>

        <MobileNav />
      </div>
    </SesionProvider>
  );
}

function SinPermiso() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-borde bg-superficie p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-peligro-suave text-peligro-fuerte">
          <ShieldAlert size={26} />
        </div>

        <h1 className="mt-5 text-xl font-black text-texto">
          No tienes permiso para ver esta sección
        </h1>

        <p className="mt-2 text-sm text-texto-suave">
          Si necesitas acceso, pide a un administrador que cambie tu rol.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-boton px-5 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
