import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EncabezadoFormulario({
  volverHref,
  volverTexto,
  etiqueta,
  titulo,
  descripcion,
}: {
  volverHref: string;
  volverTexto: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <>
      {/* VOLVER */}
      <Link
        href={volverHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309] transition hover:text-[#5f6d14]"
      >
        <ArrowLeft size={18} />
        {volverTexto}
      </Link>

      {/* ENCABEZADO */}
      <section className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
          {etiqueta}
        </p>

        <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
          {titulo}
        </h1>

        <p className="mt-2 text-sm text-[#6f6964] md:text-base">
          {descripcion}
        </p>
      </section>
    </>
  );
}
