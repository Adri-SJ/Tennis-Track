import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import AlumnoForm from "@/components/AlumnoForm";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import { crearAlumno } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo alumno",
};

export default function NuevoAlumnoPage() {
  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        <EncabezadoFormulario
          volverHref="/alumnos"
          volverTexto="Volver a alumnos"
          titulo="NUEVO ALUMNO"
        />

        <AlumnoForm
          action={crearAlumno}
          cancelarHref="/alumnos"
          textoGuardar="Guardar alumno"
        />
      </div>
    </AppLayout>
  );
}
