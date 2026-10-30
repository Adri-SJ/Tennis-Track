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
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-verde transition hover:text-verde-musgo"
      >
        <ArrowLeft size={18} />
        {volverTexto}
      </Link>

      {/* ENCABEZADO */}
      <section className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
          {etiqueta}
        </p>

        <h1 className="mt-1 text-3xl font-black text-texto md:text-5xl">
          {titulo}
        </h1>

        <p className="mt-2 text-sm text-texto-3 md:text-base">
          {descripcion}
        </p>
      </section>
    </>
  );
}
