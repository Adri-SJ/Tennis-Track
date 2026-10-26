import AppLayout from "@/components/AppLayout";
import AlumnoForm from "@/components/AlumnoForm";
import EncabezadoFormulario from "@/components/EncabezadoFormulario";
import { crearAlumno } from "../actions";

export default function NuevoAlumnoPage() {
  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <EncabezadoFormulario
          volverHref="/alumnos"
          volverTexto="Volver a alumnos"
          etiqueta="Gestión"
          titulo="NUEVO ALUMNO"
          descripcion="Registra la información general del alumno."
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
