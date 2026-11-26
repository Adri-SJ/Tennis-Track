import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EncabezadoFormulario({
  volverHref,
  volverTexto,
  titulo,
  descripcion,
}: {
  volverHref: string;
  volverTexto: string;
  titulo: string;
  /* Dato de contexto (por ejemplo, el nombre del alumno); sin texto genérico. */
  descripcion?: string;
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
        <h1 className="text-3xl font-black text-texto md:text-5xl">
          {titulo}
        </h1>

        {descripcion && (
          <p className="mt-2 text-sm text-texto-3 md:text-base">
            {descripcion}
          </p>
        )}
      </section>
    </>
  );
}
