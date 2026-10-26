"use client";

import { useActionState, useState } from "react";
import BotonesFormulario from "@/components/BotonesFormulario";
import type { OpcionGrupo } from "@/components/InscripcionForm";
import {
  claseCampo,
  claseEtiqueta,
  estadoInicial,
  hoy,
  type EstadoFormulario,
} from "@/lib/formulario";

export default function CambiarGrupoForm({
  action,
  grupoActual,
  grupos,
  cancelarHref,
}: {
  action: (
    estadoPrevio: EstadoFormulario,
    formData: FormData
  ) => Promise<EstadoFormulario>;
  grupoActual: string | null;
  grupos: OpcionGrupo[];
  cancelarHref: string;
}) {
  const [grupoId, setGrupoId] = useState("");
  const [fecha, setFecha] = useState(hoy);

  const [estadoFormulario, formAction, guardando] = useActionState(
    action,
    estadoInicial
  );

  return (
    <form
      action={formAction}
      className="max-w-4xl rounded-2xl border border-[#e1dace] bg-white p-5 md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">

        {/* GRUPO ACTUAL */}
        <div className="md:col-span-2">
          <p className={claseEtiqueta}>Grupo actual</p>
          <p className="rounded-xl bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-[#141113]">
            {grupoActual ?? "Sin grupo"}
          </p>
        </div>

        {/* GRUPO NUEVO */}
        <div>
          <label className={claseEtiqueta}>Grupo nuevo</label>

          <select
            name="grupoId"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            required
            className={claseCampo}
          >
            <option value="">Elige un grupo</option>
            {grupos.map((grupo) => {
              const lleno =
                grupo.capacidadMaxima !== null &&
                grupo.inscritos >= grupo.capacidadMaxima;

              return (
                <option
                  key={grupo.id}
                  value={grupo.id}
                  disabled={lleno || !grupo.activo}
                >
                  {grupo.nombre}
                  {grupo.capacidadMaxima !== null
                    ? ` (${grupo.inscritos}/${grupo.capacidadMaxima})`
                    : ` (${grupo.inscritos} alumnos)`}
                  {lleno ? " · lleno" : ""}
                  {!grupo.activo ? " · inactivo" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* FECHA */}
        <div>
          <label className={claseEtiqueta}>Fecha del cambio</label>

          <input
            type="date"
            name="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className={claseCampo}
          />
        </div>

      </div>

      {/* NOTA */}
      <div className="mt-6 rounded-xl bg-[#f6f4ee] p-4">
        <p className="text-sm font-semibold text-[#141113]">
          Se conserva el historial
        </p>

        <p className="mt-1 text-sm text-[#8c847d]">
          La inscripción actual se cierra con esta fecha y se crea una nueva en el grupo elegido.
        </p>
      </div>

      <BotonesFormulario
        error={estadoFormulario.error}
        guardando={guardando}
        cancelarHref={cancelarHref}
        textoGuardar="Cambiar de grupo"
      />
    </form>
  );
}
