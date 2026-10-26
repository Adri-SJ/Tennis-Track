"use client";

import { useActionState, useState } from "react";
import BotonesFormulario from "@/components/BotonesFormulario";
import {
  claseCampo,
  claseEtiqueta,
  estadoInicial,
  type EstadoFormulario,
} from "@/lib/formulario";
import type { Alumno } from "@/lib/types";

export default function AlumnoForm({
  action,
  alumno,
  cancelarHref,
  textoGuardar,
}: {
  action: (
    estadoPrevio: EstadoFormulario,
    formData: FormData
  ) => Promise<EstadoFormulario>;
  alumno?: Alumno;
  cancelarHref: string;
  textoGuardar: string;
}) {
  const [nombres, setNombres] = useState(alumno?.nombres ?? "");
  const [apellidos, setApellidos] = useState(alumno?.apellidos ?? "");
  const [edad, setEdad] = useState(alumno?.edad?.toString() ?? "");
  const [estatura, setEstatura] = useState(
    alumno?.estatura?.toString() ?? ""
  );
  const [manoHabil, setManoHabil] = useState<string>(
    alumno?.manoHabil ?? "Derecha"
  );
  const [estado, setEstado] = useState<string>(
    alumno?.estado ?? "Activo"
  );

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

        {/* NOMBRES */}
        <div>
          <label className={claseEtiqueta}>Nombre(s)</label>

          <input
            type="text"
            name="nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Ej. Oscar"
            required
            className={claseCampo}
          />
        </div>

        {/* APELLIDOS */}
        <div>
          <label className={claseEtiqueta}>Apellidos</label>

          <input
            type="text"
            name="apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            placeholder="Ej. Uao"
            required
            className={claseCampo}
          />
        </div>

        {/* EDAD */}
        <div>
          <label className={claseEtiqueta}>Edad</label>

          <input
            type="number"
            name="edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            placeholder="Ej. 21"
            min="1"
            required
            className={claseCampo}
          />
        </div>

        {/* ESTATURA */}
        <div>
          <label className={claseEtiqueta}>Estatura</label>

          <div className="relative">
            <input
              type="number"
              name="estatura"
              value={estatura}
              onChange={(e) => setEstatura(e.target.value)}
              placeholder="Ej. 170"
              min="1"
              required
              className={`${claseCampo} pr-12`}
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8c847d]">
              cm
            </span>
          </div>
        </div>

        {/* MANO HÁBIL */}
        <div>
          <label className={claseEtiqueta}>Mano hábil</label>

          <select
            name="manoHabil"
            value={manoHabil}
            onChange={(e) => setManoHabil(e.target.value)}
            className={claseCampo}
          >
            <option value="Derecha">Derecha</option>
            <option value="Izquierda">Izquierda</option>
          </select>
        </div>

        {/* ESTADO */}
        <div>
          <label className={claseEtiqueta}>Estado</label>

          <select
            name="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className={claseCampo}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo (baja)</option>
          </select>
        </div>

      </div>

      {/* NOTA */}
      {!alumno && (
        <div className="mt-6 rounded-xl bg-[#f6f4ee] p-4">
          <p className="text-sm font-semibold text-[#141113]">
            El grupo se asignará mediante una inscripción
          </p>

          <p className="mt-1 text-sm text-[#8c847d]">
            Primero registramos al alumno y después lo relacionamos con un grupo.
          </p>
        </div>
      )}

      <BotonesFormulario
        error={estadoFormulario.error}
        guardando={guardando}
        cancelarHref={cancelarHref}
        textoGuardar={textoGuardar}
      />
    </form>
  );
}
