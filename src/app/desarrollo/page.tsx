import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getAlumnos } from "@/lib/api";
import { alumnosPermitidos } from "@/lib/auth/alcance";
import { alcanceDePagina } from "@/lib/auth/servidor";
import { getEvaluaciones } from "@/lib/evaluaciones";
import DesarrolloClient from "./DesarrolloClient";

export const metadata: Metadata = {
  title: "Desarrollo deportivo",
};

export default async function DesarrolloPage() {
  const { grupos } = await alcanceDePagina("/desarrollo");

  const [alumnos, evaluaciones, visibles] = await Promise.all([
    getAlumnos(),
    getEvaluaciones(),
    alumnosPermitidos(grupos),
  ]);

  /* El entrenador solo ve y evalúa a los alumnos de sus grupos. */
  const puedeVer = (alumnoId: string) => !visibles || visibles.has(alumnoId);

  return (
    <AppLayout>
      <DesarrolloClient
        alumnos={alumnos.filter(
          (alumno) => alumno.nombre && puedeVer(alumno.id)
        )}
        evaluaciones={evaluaciones.filter((evaluacion) =>
          puedeVer(evaluacion.alumnoId)
        )}
      />
    </AppLayout>
  );
}
