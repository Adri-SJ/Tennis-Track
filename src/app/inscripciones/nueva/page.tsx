import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import InscripcionForm, {
  type OpcionAlumno,
  type OpcionGrupo,
} from "@/components/InscripcionForm";
import { getAlumnos, getGrupos, getInscripciones } from "@/lib/api";
import { crearInscripcion } from "../actions";

export const metadata: Metadata = {
  title: "Nueva inscripción",
};

export default async function NuevaInscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ alumno?: string; grupo?: string }>;
}) {
  const { alumno: alumnoInicial = "", grupo: grupoInicial = "" } =
    await searchParams;

  const [alumnos, grupos, inscripciones] = await Promise.all([
    getAlumnos(),
    getGrupos(),
    getInscripciones(),
  ]);

  const activas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const opcionesAlumnos: OpcionAlumno[] = alumnos
    .map((alumno) => ({
      id: alumno.id,
      nombre: alumno.nombre,
      grupoActual:
        activas.find((inscripcion) =>
          inscripcion.alumnos.some((item) => item.id === alumno.id)
        )?.grupo?.nombre ?? null,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const opcionesGrupos: OpcionGrupo[] = grupos
    .filter((grupo) => grupo.nombre)
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

  const volverHref = alumnoInicial
    ? `/alumnos/${alumnoInicial}`
    : grupoInicial
      ? `/grupos/${grupoInicial}`
      : "/inscripciones";

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref={volverHref}
          volverTexto="Volver"
          titulo="NUEVA INSCRIPCIÓN"
        />

        <InscripcionForm
          action={crearInscripcion}
          alumnos={opcionesAlumnos}
          grupos={opcionesGrupos}
          alumnoInicial={alumnoInicial}
          grupoInicial={grupoInicial}
          cancelarHref={volverHref}
          textoGuardar="Guardar inscripción"
        />
      </div>
    </AppLayout>
  );
}
