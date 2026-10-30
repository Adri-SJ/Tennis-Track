import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getGrupos, getInscripciones } from "@/lib/api";
import { getAsistencias } from "@/lib/asistencias";
import { esFecha, hoy } from "@/lib/formulario";
import AsistenciaClient from "./AsistenciaClient";

export const metadata: Metadata = {
  title: "Asistencia",
};

export default async function AsistenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string; fecha?: string }>;
}) {
  const parametros = await searchParams;

  const [grupos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

  const gruposActivos = grupos.filter(
    (grupo) => grupo.estado === "Activo" && grupo.nombre
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

  const grupoId = alumnosPorGrupo.some(
    (grupo) => grupo.id === parametros.grupo
  )
    ? (parametros.grupo as string)
    : (alumnosPorGrupo[0]?.id ?? "");

  const fecha =
    parametros.fecha && esFecha(parametros.fecha)
      ? parametros.fecha
      : hoy();

  const guardadas = grupoId
    ? await getAsistencias(grupoId, fecha)
    : [];

  return (
    <AppLayout>
      <AsistenciaClient
        key={`${grupoId}:${fecha}`}
        grupos={alumnosPorGrupo}
        grupoId={grupoId}
        fecha={fecha}
        guardadas={Object.fromEntries(
          guardadas.map((item) => [item.alumnoId, item.estado])
        )}
      />
    </AppLayout>
  );
}
