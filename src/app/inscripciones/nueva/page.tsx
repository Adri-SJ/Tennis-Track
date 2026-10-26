import AppLayout from "@/components/AppLayout";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import InscripcionForm, {
  type OpcionAlumno,
  type OpcionGrupo,
} from "@/components/InscripcionForm";
import { getAlumnos, getGrupos, getInscripciones } from "@/lib/api";
import { crearInscripcion } from "../actions";

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
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref={volverHref}
          volverTexto="Volver"
          etiqueta="Control"
          titulo="NUEVA INSCRIPCIÓN"
          descripcion="Asigna un alumno a un grupo."
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
