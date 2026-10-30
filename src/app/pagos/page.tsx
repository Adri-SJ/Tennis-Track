import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getAlumnos } from "@/lib/api";
import { getMensualidades } from "@/lib/pagos";
import PagosClient from "./PagosClient";

export const metadata: Metadata = {
  title: "Pagos",
};

export default async function PagosPage() {
  const [mensualidades, alumnos] = await Promise.all([
    getMensualidades(),
    getAlumnos(),
  ]);

  return (
    <AppLayout>
      <PagosClient
        mensualidades={mensualidades}
        alumnos={alumnos
          .filter((alumno) => alumno.nombre && alumno.estado === "Activo")
          .map((alumno) => ({ id: alumno.id, nombre: alumno.nombre }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))}
      />
    </AppLayout>
  );
}
