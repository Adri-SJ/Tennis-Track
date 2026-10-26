"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { crearAlumno, type EstadoFormulario } from "./actions";

const estadoInicial: EstadoFormulario = { error: null };

export default function NuevoAlumnoPage() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [edad, setEdad] = useState("");
  const [estatura, setEstatura] = useState("");
  const [manoHabil, setManoHabil] = useState("Derecha");
  const [estado, setEstado] = useState("Activo");

  const [estadoFormulario, formAction, guardando] = useActionState(
    crearAlumno,
    estadoInicial
  );

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* VOLVER */}
        <Link
          href="/alumnos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309] transition hover:text-[#5f6d14]"
        >
          <ArrowLeft size={18} />
          Volver a alumnos
        </Link>

        {/* ENCABEZADO */}
        <section className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
            Gestión
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
            NUEVO ALUMNO
          </h1>

          <p className="mt-2 text-sm text-[#6f6964] md:text-base">
            Registra la información general del alumno.
          </p>
        </section>

        {/* FORMULARIO */}
        <form
          action={formAction}
          className="max-w-4xl rounded-2xl border border-[#e1dace] bg-white p-5 md:p-7"
        >

          <div className="grid gap-5 md:grid-cols-2">

            {/* NOMBRES */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Nombre(s)
              </label>

              <input
                type="text"
                name="nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Oscar"
                required
                className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]"
              />
            </div>

            {/* APELLIDOS */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Apellidos
              </label>

              <input
                type="text"
                name="apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Uao"
                required
                className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]"
              />
            </div>

            {/* EDAD */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Edad
              </label>

              <input
                type="number"
                name="edad"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                placeholder="Ej. 21"
                min="1"
                required
                className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]"
              />
            </div>

            {/* ESTATURA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Estatura
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="estatura"
                  value={estatura}
                  onChange={(e) => setEstatura(e.target.value)}
                  placeholder="Ej. 170"
                  min="1"
                  required
                  className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#7d9309]"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8c847d]">
                  cm
                </span>
              </div>
            </div>

            {/* MANO HÁBIL */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Mano hábil
              </label>

              <select
                name="manoHabil"
                value={manoHabil}
                onChange={(e) => setManoHabil(e.target.value)}
                className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]"
              >
                <option value="Derecha">Derecha</option>
                <option value="Izquierda">Izquierda</option>
              </select>
            </div>

            {/* ESTADO */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#141113]">
                Estado
              </label>

              <select
                name="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

          </div>

          {/* NOTA */}
          <div className="mt-6 rounded-xl bg-[#f6f4ee] p-4">
            <p className="text-sm font-semibold text-[#141113]">
              El grupo se asignará mediante una inscripción
            </p>

            <p className="mt-1 text-sm text-[#8c847d]">
              Primero registramos al alumno y después lo relacionamos con un grupo.
            </p>
          </div>

          {/* ERROR */}
          {estadoFormulario.error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-[#f1c9c4] bg-[#fdf1ef] p-4 text-sm font-semibold text-[#9d3a2e]"
            >
              {estadoFormulario.error}
            </p>
          )}

          {/* BOTONES */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/alumnos"
              className="rounded-xl border border-[#e1dace] px-5 py-3 text-center text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#141113] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d] disabled:cursor-wait disabled:opacity-60"
            >
              <Save size={18} />
              {guardando ? "Guardando…" : "Guardar alumno"}
            </button>

          </div>

        </form>

      </div>
    </AppLayout>
  );
}