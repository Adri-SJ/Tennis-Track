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
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref="/grupos"
          volverTexto="Volver a grupos"
          etiqueta="Gestión"
          titulo="NUEVO GRUPO"
          descripcion="Define los días, el horario y el cupo del grupo."
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
