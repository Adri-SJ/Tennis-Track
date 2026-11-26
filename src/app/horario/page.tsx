import type { Metadata } from "next";

import AppLayout from "@/components/AppLayout";
import { alcanceDePagina } from "@/lib/auth/servidor";
import { getGrupos, getInscripciones } from "@/lib/api";
import { ahoraEnMexico, DIAS_CORTOS } from "@/lib/fecha";
import HorarioClient, { type Sesion } from "./HorarioClient";

export const metadata: Metadata = {
  title: "Horario semanal",
};

const CORTOS = DIAS_CORTOS;

export default async function HorarioPage() {
  const { grupos: permitidos } = await alcanceDePagina("/horario");

  const [todos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

  const grupos = (
    permitidos ? todos.filter((grupo) => permitidos.has(grupo.id)) : todos
  ).filter((grupo) => grupo.estado === "Activo");

  const alumnosPorGrupo = new Map<string, Set<string>>();

  for (const inscripcion of inscripciones) {
    if (inscripcion.estado !== "Activa" || !inscripcion.grupo) {
      continue;
    }

    const ids = alumnosPorGrupo.get(inscripcion.grupo.id) ?? new Set();

    inscripcion.alumnos.forEach((alumno) => ids.add(alumno.id));
    alumnosPorGrupo.set(inscripcion.grupo.id, ids);
  }

  /* Una lista por día, ordenada por hora de inicio. */
  const semana: Sesion[][] = CORTOS.map((corto) =>
    grupos
      .filter((grupo) => grupo.dias.split(" · ").includes(corto))
      .map((grupo) => ({
        grupoId: grupo.id,
        nombre: grupo.nombre,
        horaInicio: grupo.horaInicio,
        horaFin: grupo.horaFin,
        nivel: grupo.nivel,
        alumnos: alumnosPorGrupo.get(grupo.id)?.size ?? 0,
        capacidad: grupo.capacidadMaxima,
      }))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  );

  const ahora = ahoraEnMexico();

  return (
    <AppLayout>
      <HorarioClient
        semana={semana}
        totalGrupos={grupos.length}
        hoy={ahora.dia}
        minutosAhora={ahora.minutos}
        fechaHoy={ahora.fecha}
      />
    </AppLayout>
  );
}
