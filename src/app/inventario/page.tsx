import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { alcanceDePagina } from "@/lib/auth/servidor";
import { getMateriales, getMovimientos } from "@/lib/inventario";
import { getSolicitudes } from "@/lib/solicitudes";
import InventarioClient from "./InventarioClient";

export const metadata: Metadata = {
  title: "Inventario",
};

export default async function InventarioPage() {
  const { usuario, esAdmin } = await alcanceDePagina("/inventario");

  const [materiales, movimientos, solicitudes] = await Promise.all([
    getMateriales(),
    getMovimientos(),
    getSolicitudes(esAdmin ? null : usuario.id),
  ]);

  return (
    <AppLayout>
      <InventarioClient
        materiales={materiales}
        movimientos={movimientos}
        solicitudes={solicitudes}
        esAdmin={esAdmin}
      />
    </AppLayout>
  );
}
