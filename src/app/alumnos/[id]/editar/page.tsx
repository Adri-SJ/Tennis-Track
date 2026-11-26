import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import AlumnoForm from "@/components/AlumnoForm";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import { getAlumnoById } from "@/lib/api";
import { actualizarAlumno } from "../../actions";

export const metadata: Metadata = {
  title: "Editar alumno",
};

export default async function EditarAlumnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const alumno = await getAlumnoById(id);

  if (!alumno) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/alumnos/${alumno.id}`}
          volverTexto="Volver al alumno"
          titulo="EDITAR ALUMNO"
          descripcion={alumno.nombre}
        />

        <AlumnoForm
          action={actualizarAlumno.bind(null, alumno.id)}
          alumno={alumno}
          cancelarHref={`/alumnos/${alumno.id}`}
          textoGuardar="Guardar cambios"
        />
      </div>
    </AppLayout>
  );
}
