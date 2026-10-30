import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getAlumnos } from "@/lib/api";
import { getEvaluaciones } from "@/lib/evaluaciones";
import DesarrolloClient from "./DesarrolloClient";

export const metadata: Metadata = {
  title: "Desarrollo deportivo",
};

export default async function DesarrolloPage() {
  const [alumnos, evaluaciones] = await Promise.all([
    getAlumnos(),
    getEvaluaciones(),
  ]);

  return (
    <AppLayout>
      <DesarrolloClient
        alumnos={alumnos.filter((alumno) => alumno.nombre)}
        evaluaciones={evaluaciones}
      />
    </AppLayout>
  );
}
