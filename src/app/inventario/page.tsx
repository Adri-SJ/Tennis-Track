import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getMateriales, getMovimientos } from "@/lib/inventario";
import InventarioClient from "./InventarioClient";

export const metadata: Metadata = {
  title: "Inventario",
};

export default async function InventarioPage() {
  const [materiales, movimientos] = await Promise.all([
    getMateriales(),
    getMovimientos(),
  ]);

  return (
    <AppLayout>
      <InventarioClient
        materiales={materiales}
        movimientos={movimientos}
      />
    </AppLayout>
  );
}
