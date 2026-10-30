import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getProspectos } from "@/lib/prospectos";
import ProspectosClient from "./ProspectosClient";

export const metadata: Metadata = {
  title: "Prospectos",
};

export default async function ProspectosPage() {
  const prospectos = await getProspectos();

  return (
    <AppLayout>
      <ProspectosClient prospectos={prospectos} />
    </AppLayout>
  );
}
