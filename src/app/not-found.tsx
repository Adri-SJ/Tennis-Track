import Link from "next/link";

export const metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <main className="flex flex-1 items-center justify-center bg-fondo px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-superficie p-6 text-center shadow-sm sm:p-8">
        <p className="text-[11px] font-bold tracking-[0.1em] text-verde sm:text-xs">
          ERROR 404
        </p>
        <h1 className="mt-2 text-2xl font-black text-texto sm:text-3xl">
          Esta página no existe
        </h1>
        <p className="mt-3 text-sm text-texto-suave">
          Puede que la dirección esté mal escrita o que la página se haya
          movido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-boton px-5 py-3 text-sm font-bold text-sobre-boton"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
