import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import AlumnoForm from "@/components/AlumnoForm";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import { getAlumnoById } from "@/lib/api";
import { actualizarAlumno } from "../../actions";

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
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/alumnos/${alumno.id}`}
          volverTexto="Volver al alumno"
          etiqueta="Gestión"
          titulo="EDITAR ALUMNO"
          descripcion={`Actualiza la información de ${alumno.nombre}.`}
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
