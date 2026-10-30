import Link from "next/link";
import { Save } from "lucide-react";

export default function BotonesFormulario({
  error,
  guardando,
  cancelarHref,
  textoGuardar,
}: {
  error: string | null;
  guardando: boolean;
  cancelarHref: string;
  textoGuardar: string;
}) {
  return (
    <>
      {/* ERROR */}
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-borde-peligro bg-peligro-suave p-4 text-sm font-semibold text-peligro-fuerte"
        >
          {error}
        </p>
      )}

      {/* BOTONES */}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelarHref}
          className="rounded-xl border border-borde px-5 py-3 text-center text-sm font-semibold text-texto transition hover:bg-fondo"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center justify-center gap-2 rounded-xl bg-boton px-5 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover disabled:cursor-wait disabled:opacity-60"
        >
          <Save size={18} />
          {guardando ? "Guardando…" : textoGuardar}
        </button>
      </div>
    </>
  );
}
