import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import InscripcionForm from "@/components/InscripcionForm";
import { getInscripcionById } from "@/lib/api";
import { actualizarInscripcion } from "../../actions";

export const metadata: Metadata = {
  title: "Editar inscripción",
};

export default async function EditarInscripcionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const inscripcion = await getInscripcionById(id);

  if (!inscripcion) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/inscripciones/${inscripcion.id}`}
          volverTexto="Volver a la inscripción"
          titulo="EDITAR INSCRIPCIÓN"
        />

        <InscripcionForm
          action={actualizarInscripcion.bind(null, inscripcion.id)}
          inscripcion={inscripcion}
          cancelarHref={`/inscripciones/${inscripcion.id}`}
          textoGuardar="Guardar cambios"
        />
      </div>
    </AppLayout>
  );
}
