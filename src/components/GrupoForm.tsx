"use client";

import { useActionState, useState } from "react";
import BotonesFormulario from "@/components/BotonesFormulario";
import {
  claseCampo,
  claseEtiqueta,
  estadoInicial,
  type EstadoFormulario,
} from "@/lib/formulario";
import type { DiaEntrenamiento, Grupo } from "@/lib/types";

const DIAS: { valor: DiaEntrenamiento; etiqueta: string }[] = [
  { valor: "LUNES", etiqueta: "Lun" },
  { valor: "MARTES", etiqueta: "Mar" },
  { valor: "MIERCOLES", etiqueta: "Mié" },
  { valor: "JUEVES", etiqueta: "Jue" },
  { valor: "VIERNES", etiqueta: "Vie" },
  { valor: "SABADO", etiqueta: "Sáb" },
];

export default function GrupoForm({
  action,
  grupo,
  cancelarHref,
  textoGuardar,
}: {
  action: (
    estadoPrevio: EstadoFormulario,
    formData: FormData
  ) => Promise<EstadoFormulario>;
  grupo?: Grupo;
  cancelarHref: string;
  textoGuardar: string;
}) {
  const [nombre, setNombre] = useState(grupo?.nombre ?? "");
  const [dias, setDias] = useState<DiaEntrenamiento[]>(
    grupo?.diasDeEntrenamiento ?? []
  );
  const [horaInicio, setHoraInicio] = useState(
    grupo && grupo.horaInicio !== "—" ? grupo.horaInicio : ""
  );
  const [horaFin, setHoraFin] = useState(
    grupo && grupo.horaFin !== "—" ? grupo.horaFin : ""
  );
  const [nivel, setNivel] = useState<string>(grupo?.nivel ?? "");
  const [capacidad, setCapacidad] = useState(
    grupo?.capacidadMaxima?.toString() ?? ""
  );
  const [estado, setEstado] = useState<string>(
    grupo?.estado ?? "Activo"
  );

  const [estadoFormulario, formAction, guardando] = useActionState(
    action,
    estadoInicial
  );

  const alternarDia = (dia: DiaEntrenamiento) =>
    setDias((actuales) =>
      actuales.includes(dia)
        ? actuales.filter((item) => item !== dia)
        : [...actuales, dia]
    );

  return (
    <form
      action={formAction}
      className="max-w-4xl rounded-2xl border border-[#e1dace] bg-white p-5 md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">

        {/* NOMBRE */}
        <div className="md:col-span-2">
          <label className={claseEtiqueta}>Nombre del grupo</label>

          <input
            type="text"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Principiantes tarde"
            required
            className={claseCampo}
          />
        </div>

        {/* DÍAS */}
        <fieldset className="md:col-span-2">
          <legend className={claseEtiqueta}>Días de entrenamiento</legend>

          <div className="flex flex-wrap gap-2">
            {DIAS.map((dia) => {
              const elegido = dias.includes(dia.valor);

              return (
                <label
                  key={dia.valor}
                  className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    elegido
                      ? "border-[#7d9309] bg-[#cbd90a] text-[#32390d]"
                      : "border-[#e1dace] bg-white text-[#6f6964] hover:bg-[#f6f4ee]"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="dias"
                    value={dia.valor}
                    checked={elegido}
                    onChange={() => alternarDia(dia.valor)}
                    className="sr-only"
                  />
                  {dia.etiqueta}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* HORA DE INICIO */}
        <div>
          <label className={claseEtiqueta}>Hora de inicio</label>

          <input
            type="time"
            name="horaInicio"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className={claseCampo}
          />
        </div>

        {/* HORA DE FIN */}
        <div>
          <label className={claseEtiqueta}>Hora de fin</label>

          <input
            type="time"
            name="horaFin"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
            className={claseCampo}
          />
        </div>

        {/* NIVEL */}
        <div>
          <label className={claseEtiqueta}>Nivel</label>

          <select
            name="nivel"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className={claseCampo}
          >
            <option value="">Sin definir</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        {/* CAPACIDAD */}
        <div>
          <label className={claseEtiqueta}>Capacidad máxima</label>

          <input
            type="number"
            name="capacidadMaxima"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            placeholder="Sin límite"
            min="1"
            className={claseCampo}
          />
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
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

      </div>

      <BotonesFormulario
        error={estadoFormulario.error}
        guardando={guardando}
        cancelarHref={cancelarHref}
        textoGuardar={textoGuardar}
      />
    </form>
  );
}
