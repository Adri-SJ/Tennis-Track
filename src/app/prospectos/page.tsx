import AppLayout from "@/components/AppLayout";
import { getProspectos } from "@/lib/prospectos";
import ProspectosClient from "./ProspectosClient";

export default async function ProspectosPage() {
  const prospectos = await getProspectos();

  return (
    <AppLayout>
      <ProspectosClient prospectos={prospectos} />
    </AppLayout>
  );
}
