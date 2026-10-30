"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Modal, { claseCampoModal } from "@/components/Modal";
import { hoy } from "@/lib/formulario";
import { crearMensualidad } from "./actions";

export default function MensualidadModal({
  alumnos,
  onCerrar,
}: {
  alumnos: { id: string; nombre: string }[];
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [alumnoId, setAlumnoId] = useState("");
  const [mes, setMes] = useState(() => hoy().slice(0, 7));
  const [monto, setMonto] = useState("");
  const [vencimiento, setVencimiento] = useState(
    () => `${hoy().slice(0, 7)}-05`
  );

  const guardar = () => {
    setError("");

    startTransition(async () => {
      const resultado = await crearMensualidad({
        alumnoId,
        periodo: `${mes}-01`,
        monto: Number(monto),
        vencimiento,
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      onCerrar();
      router.refresh();
    });
  };

  return (
    <Modal
      etiqueta="Pagos"
      titulo="NUEVA MENSUALIDAD"
      onCerrar={onCerrar}
      pie={
        <>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-borde px-5 py-3 text-sm font-bold text-texto-3"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-sobre-lima disabled:cursor-wait disabled:opacity-60"
          >
            <Check size={18} />
            {guardando ? "Guardando…" : "Guardar mensualidad"}
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="mensualidad-alumno" className="mb-2 block text-sm font-bold">
          Alumno
        </label>
        <select
          id="mensualidad-alumno"
          value={alumnoId}
          onChange={(event) => setAlumnoId(event.target.value)}
          className={claseCampoModal}
        >
          <option value="">Elige un alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mensualidad-mes" className="mb-2 block text-sm font-bold">
            Mes
          </label>
          <input
            id="mensualidad-mes"
            type="month"
            value={mes}
            onChange={(event) => setMes(event.target.value)}
            className={claseCampoModal}
          />
        </div>

        <div>
          <label htmlFor="mensualidad-monto" className="mb-2 block text-sm font-bold">
            Importe (MXN)
          </label>
          <input
            id="mensualidad-monto"
            type="number"
            min={1}
            step="0.01"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
            placeholder="Ej. 1200"
            className={claseCampoModal}
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensualidad-vencimiento" className="mb-2 block text-sm font-bold">
          Fecha de vencimiento
        </label>
        <input
          id="mensualidad-vencimiento"
          type="date"
          value={vencimiento}
          onChange={(event) => setVencimiento(event.target.value)}
          className={claseCampoModal}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-peligro-suave p-3 text-sm font-bold text-peligro"
        >
          {error}
        </p>
      )}
    </Modal>
  );
}
