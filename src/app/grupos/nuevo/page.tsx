import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import GrupoForm from "@/components/GrupoForm";
import { crearGrupo } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo grupo",
};

export default function NuevoGrupoPage() {
  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref="/grupos"
          volverTexto="Volver a grupos"
          titulo="NUEVO GRUPO"
        />

        <GrupoForm
          action={crearGrupo}
          cancelarHref="/grupos"
          textoGuardar="Guardar grupo"
        />
      </div>
    </AppLayout>
  );
}
