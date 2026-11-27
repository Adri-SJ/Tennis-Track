"use client";

import { useEffect } from "react";
import Link from "next/link";

/* Falla inesperada al cargar una página (por ejemplo, el CRM no responde). */
export default function ErrorDePagina({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-fondo px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-superficie p-6 text-center shadow-sm sm:p-8">
        <p className="text-[11px] font-bold tracking-[0.1em] text-peligro sm:text-xs">
          ALGO SALIÓ MAL
        </p>
        <h1 className="mt-2 text-2xl font-black text-texto sm:text-3xl">
          No se pudo cargar la página
        </h1>
        <p className="mt-3 text-sm text-texto-suave">
          Revisa tu conexión e inténtalo de nuevo. Si sigue pasando, avisa
          al administrador.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-xl bg-boton px-5 py-3 text-sm font-bold text-sobre-boton"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-xl bg-hundido px-5 py-3 text-sm font-bold text-texto"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
