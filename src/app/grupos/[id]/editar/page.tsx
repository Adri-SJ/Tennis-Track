import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import GrupoForm from "@/components/GrupoForm";
import { getGrupoById } from "@/lib/api";
import { actualizarGrupo } from "../../actions";

export const metadata: Metadata = {
  title: "Editar grupo",
};

export default async function EditarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const grupo = await getGrupoById(id);

  if (!grupo) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref={`/grupos/${grupo.id}`}
          volverTexto="Volver al grupo"
          titulo="EDITAR GRUPO"
          descripcion={grupo.nombre || undefined}
        />

        <GrupoForm
          action={actualizarGrupo.bind(null, grupo.id)}
          grupo={grupo}
          cancelarHref={`/grupos/${grupo.id}`}
          textoGuardar="Guardar cambios"
        />
      </div>
    </AppLayout>
  );
}
