import { twentyFetch } from "@/lib/api";

export type EstadoAsistencia =
  | "Presente"
  | "Ausente"
  | "Justificada"
  | "Retardo";

export type AsistenciaGuardada = {
  id: string;
  alumnoId: string;
  estado: EstadoAsistencia;
};

type TwentyEstadoAsistencia =
  | "PRESENTE"
  | "AUSENTE"
  | "JUSTIFICADA"
  | "RETARDO";

type TwentyAsistencia = {
  id: string;
  alumnoId: string | null;
  estado: TwentyEstadoAsistencia | null;
};

const A_TWENTY: Record<EstadoAsistencia, TwentyEstadoAsistencia> = {
  Presente: "PRESENTE",
  Ausente: "AUSENTE",
  Justificada: "JUSTIFICADA",
  Retardo: "RETARDO",
};

const DESDE_TWENTY: Record<TwentyEstadoAsistencia, EstadoAsistencia> = {
  PRESENTE: "Presente",
  AUSENTE: "Ausente",
  JUSTIFICADA: "Justificada",
  RETARDO: "Retardo",
};

export const ESTADOS_ASISTENCIA = Object.keys(A_TWENTY) as EstadoAsistencia[];

export async function getAsistencias(
  grupoId: string,
  fecha: string
): Promise<AsistenciaGuardada[]> {
  const filtro = encodeURIComponent(
    `and(grupoId[eq]:"${grupoId}",fecha[eq]:"${fecha}")`
  );

  const result = await twentyFetch<{
    data: { asistencias: TwentyAsistencia[] };
  }>(`asistencias?limit=200&filter=${filtro}`);

  return result.data.asistencias
    .filter((item) => item.alumnoId && item.estado)
    .map((item) => ({
      id: item.id,
      alumnoId: item.alumnoId as string,
      estado: DESDE_TWENTY[item.estado as TwentyEstadoAsistencia],
    }));
}

/*
  Guarda el pase de lista de un grupo en una fecha:
  crea las marcas nuevas, actualiza las que cambiaron y
  borra las que se quitaron. Un registro por alumno y día.
*/
export async function guardarAsistencias({
  grupoId,
  fecha,
  marcas,
  nombres,
}: {
  grupoId: string;
  fecha: string;
  marcas: Record<string, EstadoAsistencia | null>;
  nombres: Record<string, string>;
}): Promise<void> {
  const guardadas = await getAsistencias(grupoId, fecha);

  const porAlumno = new Map(
    guardadas.map((item) => [item.alumnoId, item])
  );

  const operaciones = Object.entries(marcas).map(
    ([alumnoId, estado]) => {
      const actual = porAlumno.get(alumnoId);

      if (!estado) {
        return actual
          ? twentyFetch(`asistencias/${actual.id}`, { method: "DELETE" })
          : null;
      }

      if (actual) {
        return actual.estado === estado
          ? null
          : twentyFetch(`asistencias/${actual.id}`, {
              method: "PATCH",
              body: { estado: A_TWENTY[estado] },
            });
      }

      return twentyFetch("asistencias", {
        method: "POST",
        body: {
          name: `${nombres[alumnoId] ?? "Alumno"} · ${fecha}`,
          fecha,
          estado: A_TWENTY[estado],
          alumnoId,
          grupoId,
        },
      });
    }
  );

  await Promise.all(operaciones);
}
