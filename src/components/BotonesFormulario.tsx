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
          className="mt-6 rounded-xl border border-[#f1c9c4] bg-[#fdf1ef] p-4 text-sm font-semibold text-[#9d3a2e]"
        >
          {error}
        </p>
      )}

      {/* BOTONES */}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelarHref}
          className="rounded-xl border border-[#e1dace] px-5 py-3 text-center text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={guardando}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#141113] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d] disabled:cursor-wait disabled:opacity-60"
        >
          <Save size={18} />
          {guardando ? "Guardando…" : textoGuardar}
        </button>
      </div>
    </>
  );
}
