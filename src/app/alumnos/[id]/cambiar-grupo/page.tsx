import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import CambiarGrupoForm from "@/components/CambiarGrupoForm";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import type { OpcionGrupo } from "@/components/InscripcionForm";
import { getAlumnoById, getGrupos, getInscripciones } from "@/lib/api";
import { cambiarDeGrupo } from "../../actions";

export const metadata: Metadata = {
  title: "Cambiar de grupo",
};

export default async function CambiarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [alumno, grupos, inscripciones] = await Promise.all([
    getAlumnoById(id),
    getGrupos(),
    getInscripciones(),
  ]);

  if (!alumno) {
    notFound();
  }

  const activas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const grupoActual =
    activas.find((inscripcion) =>
      inscripcion.alumnos.some((item) => item.id === alumno.id)
    )?.grupo ?? null;

  const opciones: OpcionGrupo[] = grupos
    .filter((grupo) => grupo.nombre && grupo.id !== grupoActual?.id)
    .map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      inscritos: activas.filter(
        (inscripcion) => inscripcion.grupo?.id === grupo.id
      ).length,
      capacidadMaxima: grupo.capacidadMaxima,
      activo: grupo.estado === "Activo",
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/alumnos/${alumno.id}`}
          volverTexto="Volver al alumno"
          etiqueta="Control"
          titulo="CAMBIAR DE GRUPO"
          descripcion={`Mueve a ${alumno.nombre} a otro grupo.`}
        />

        <CambiarGrupoForm
          action={cambiarDeGrupo.bind(null, alumno.id)}
          grupoActual={grupoActual?.nombre ?? null}
          grupos={opciones}
          cancelarHref={`/alumnos/${alumno.id}`}
        />
      </div>
    </AppLayout>
  );
}
