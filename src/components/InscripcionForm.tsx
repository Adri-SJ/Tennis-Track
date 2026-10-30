"use client";

import { useActionState, useState } from "react";
import BotonesFormulario from "@/components/BotonesFormulario";
import {
  claseCampo,
  claseEtiqueta,
  estadoInicial,
  hoy,
  type EstadoFormulario,
} from "@/lib/formulario";
import type { Inscripcion } from "@/lib/types";

export type OpcionAlumno = {
  id: string;
  nombre: string;
  grupoActual: string | null;
};

export type OpcionGrupo = {
  id: string;
  nombre: string;
  inscritos: number;
  capacidadMaxima: number | null;
  activo: boolean;
};

function textoGrupo(grupo: OpcionGrupo) {
  const cupo =
    grupo.capacidadMaxima !== null
      ? `${grupo.inscritos}/${grupo.capacidadMaxima}`
      : `${grupo.inscritos} alumnos`;

  return `${grupo.nombre || "Sin nombre"} (${cupo}${
    grupo.activo ? "" : ", inactivo"
  })`;
}

export default function InscripcionForm({
  action,
  inscripcion,
  alumnos = [],
  grupos = [],
  alumnoInicial = "",
  grupoInicial = "",
  cancelarHref,
  textoGuardar,
}: {
  action: (
    estadoPrevio: EstadoFormulario,
    formData: FormData
  ) => Promise<EstadoFormulario>;
  inscripcion?: Inscripcion;
  alumnos?: OpcionAlumno[];
  grupos?: OpcionGrupo[];
  alumnoInicial?: string;
  grupoInicial?: string;
  cancelarHref: string;
  textoGuardar: string;
}) {
  const [alumnoId, setAlumnoId] = useState(alumnoInicial);
  const [grupoId, setGrupoId] = useState(grupoInicial);
  const [fechaInicio, setFechaInicio] = useState(
    inscripcion && inscripcion.fechaInicio !== "—"
      ? inscripcion.fechaInicio
      : hoy()
  );
  const [fechaFin, setFechaFin] = useState(inscripcion?.fechaFin ?? "");
  const [estado, setEstado] = useState<string>(
    inscripcion?.estado ?? "Activa"
  );

  const [estadoFormulario, formAction, guardando] = useActionState(
    action,
    estadoInicial
  );

  const alumnoElegido = alumnos.find((alumno) => alumno.id === alumnoId);

  return (
    <form
      action={formAction}
      className="max-w-4xl rounded-2xl border border-borde bg-superficie p-5 md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">

        {inscripcion ? (
          <>
            {/* ALUMNO Y GRUPO (SOLO LECTURA) */}
            <div>
              <p className={claseEtiqueta}>Alumno</p>
              <p className="rounded-xl bg-fondo px-4 py-3 text-sm font-semibold text-texto">
                {inscripcion.alumnos[0]?.nombre ?? "Sin alumno"}
              </p>
            </div>

            <div>
              <p className={claseEtiqueta}>Grupo</p>
              <p className="rounded-xl bg-fondo px-4 py-3 text-sm font-semibold text-texto">
                {inscripcion.grupo?.nombre ?? "Sin grupo"}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ALUMNO */}
            <div>
              <label className={claseEtiqueta}>Alumno</label>

              <select
                name="alumnoId"
                value={alumnoId}
                onChange={(e) => setAlumnoId(e.target.value)}
                required
                className={claseCampo}
              >
                <option value="">Elige un alumno</option>
                {alumnos.map((alumno) => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre}
                    {alumno.grupoActual ? ` (ya en ${alumno.grupoActual})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* GRUPO */}
            <div>
              <label className={claseEtiqueta}>Grupo</label>

              <select
                name="grupoId"
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
                required
                className={claseCampo}
              >
                <option value="">Elige un grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {textoGrupo(grupo)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* FECHA DE INICIO */}
        <div>
          <label className={claseEtiqueta}>Fecha de inicio</label>

          <input
            type="date"
            name="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className={claseCampo}
          />
        </div>

        {/* FECHA DE FIN */}
        <div>
          <label className={claseEtiqueta}>Fecha de fin (opcional)</label>

          <input
            type="date"
            name="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            min={fechaInicio}
            className={claseCampo}
          />
        </div>

        {/* ESTADO */}
        {inscripcion && (
          <div>
            <label className={claseEtiqueta}>Estado</label>

            <select
              name="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className={claseCampo}
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
        )}

      </div>

      {/* AVISO */}
      {alumnoElegido?.grupoActual && (
        <div className="mt-6 rounded-xl bg-fondo p-4">
          <p className="text-sm font-semibold text-texto">
            {alumnoElegido.nombre} ya está en {alumnoElegido.grupoActual}
          </p>

          <p className="mt-1 text-sm text-texto-suave">
            Para moverlo de grupo usa «Cambiar de grupo» en su perfil; así se conserva su historial.
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
