import { twentyFetch } from "@/lib/api";

/* Las claves coinciden con los campos del objeto Evaluación en Twenty. */
export type Habilidad =
  | "saque"
  | "derecha"
  | "reves"
  | "volea"
  | "condicionFisica";

export const HABILIDADES: Habilidad[] = [
  "saque",
  "derecha",
  "reves",
  "volea",
  "condicionFisica",
];

export type Puntuaciones = Record<Habilidad, number>;

export type Evaluacion = {
  id: string;
  alumnoId: string;
  fecha: string;
  puntuaciones: Puntuaciones;
  observaciones: string;
};

type TwentyEvaluacion = {
  id: string;
  fecha: string | null;
  alumnoId: string | null;
  observaciones: string | null;
} & Record<Habilidad, number | null>;

function adaptarEvaluacion(
  evaluacion: TwentyEvaluacion
): Evaluacion | null {
  if (!evaluacion.alumnoId || !evaluacion.fecha) {
    return null;
  }

  const puntuaciones = Object.fromEntries(
    HABILIDADES.map((habilidad) => [
      habilidad,
      evaluacion[habilidad] ?? 0,
    ])
  ) as Puntuaciones;

  return {
    id: evaluacion.id,
    alumnoId: evaluacion.alumnoId,
    fecha: evaluacion.fecha,
    puntuaciones,
    observaciones: evaluacion.observaciones ?? "",
  };
}

export async function getEvaluaciones(): Promise<Evaluacion[]> {
  const result = await twentyFetch<{
    data: { evaluaciones: TwentyEvaluacion[] };
  }>("evaluaciones?limit=200&order_by=fecha[DescNullsLast]");

  return result.data.evaluaciones
    .map(adaptarEvaluacion)
    .filter((item): item is Evaluacion => item !== null);
}

export async function createEvaluacion(
  evaluacion: Omit<Evaluacion, "id">,
  nombreAlumno: string
): Promise<void> {
  await twentyFetch("evaluaciones", {
    method: "POST",
    body: {
      name: `${nombreAlumno} · ${evaluacion.fecha}`,
      alumnoId: evaluacion.alumnoId,
      fecha: evaluacion.fecha,
      observaciones: evaluacion.observaciones,
      ...evaluacion.puntuaciones,
    },
  });
}

export async function deleteEvaluacion(id: string): Promise<void> {
  await twentyFetch(`evaluaciones/${id}`, { method: "DELETE" });
}
