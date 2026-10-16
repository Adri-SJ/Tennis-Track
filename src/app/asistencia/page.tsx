
import AppLayout from "@/components/AppLayout";
import { getGrupos, getInscripciones } from "@/lib/api";
import AsistenciaClient from "./AsistenciaClient";

export default async function AsistenciaPage() {
  const [grupos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

  const gruposActivos = grupos.filter(
    (grupo) => grupo.estado === "Activo"
  );

  const inscripcionesActivas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const alumnosPorGrupo = gruposActivos.map((grupo) => {
    const alumnos = inscripcionesActivas
      .filter((inscripcion) => inscripcion.grupo?.id === grupo.id)
      .flatMap((inscripcion) => inscripcion.alumnos);

    const alumnosUnicos = Array.from(
      new Map(alumnos.map((alumno) => [alumno.id, alumno])).values()
    );

    return {
      ...grupo,
      alumnos: alumnosUnicos,
    };
  });

  return (
    <AppLayout>
      <AsistenciaClient grupos={alumnosPorGrupo} />
    </AppLayout>
  );
}
