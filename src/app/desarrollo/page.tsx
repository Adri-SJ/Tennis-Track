
import AppLayout from "@/components/AppLayout";
import { getAlumnos } from "@/lib/api";
import DesarrolloClient from "./DesarrolloClient";

export default async function DesarrolloPage() {
  const alumnos = await getAlumnos();

  return (
    <AppLayout>
      <DesarrolloClient alumnos={alumnos} />
    </AppLayout>
  );
}
