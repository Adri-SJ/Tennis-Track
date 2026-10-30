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
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/inscripciones/${inscripcion.id}`}
          volverTexto="Volver a la inscripción"
          etiqueta="Control"
          titulo="EDITAR INSCRIPCIÓN"
          descripcion="Corrige las fechas o el estado. Para mover al alumno de grupo usa «Cambiar de grupo» en su perfil."
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
