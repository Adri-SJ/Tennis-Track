"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Modal, { claseCampoModal } from "@/components/Modal";
import { hoy } from "@/lib/formulario";
import type { Mensualidad, MetodoPago } from "@/lib/pagos";
import { guardarPago } from "./actions";

const METODOS: MetodoPago[] = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function PagoModal({
  mensualidad,
  onCerrar,
}: {
  mensualidad: Mensualidad;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [fecha, setFecha] = useState(hoy);
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [referencia, setReferencia] = useState("");

  const guardar = () => {
    setError("");

    startTransition(async () => {
      const resultado = await guardarPago(mensualidad.id, {
        fecha,
        metodo,
        referencia,
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
      etiqueta={mensualidad.alumno}
      titulo="REGISTRAR PAGO"
      onCerrar={onCerrar}
      pie={
        <>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-[#e1dace] px-5 py-3 text-sm font-bold text-[#6f6964]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] disabled:cursor-wait disabled:opacity-60"
          >
            <Check size={18} />
            {guardando ? "Guardando…" : "Registrar pago"}
          </button>
        </>
      }
    >
      <p className="rounded-xl bg-[#f6f4ee] p-3 text-sm text-[#6f6964]">
        {mensualidad.concepto}:{" "}
        <span className="font-black text-[#141113]">
          {formatoMoneda.format(mensualidad.monto)}
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pago-fecha" className="mb-2 block text-sm font-bold">
            Fecha de pago
          </label>
          <input
            id="pago-fecha"
            type="date"
            value={fecha}
            max={hoy()}
            onChange={(event) => setFecha(event.target.value)}
            className={claseCampoModal}
          />
        </div>

        <div>
          <label htmlFor="pago-metodo" className="mb-2 block text-sm font-bold">
            Método
          </label>
          <select
            id="pago-metodo"
            value={metodo}
            onChange={(event) => setMetodo(event.target.value as MetodoPago)}
            className={claseCampoModal}
          >
            {METODOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pago-referencia" className="mb-2 block text-sm font-bold">
          Referencia
        </label>
        <input
          id="pago-referencia"
          value={referencia}
          onChange={(event) => setReferencia(event.target.value)}
          placeholder="Opcional: folio, número de transferencia…"
          maxLength={120}
          className={claseCampoModal}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#fff0ed] p-3 text-sm font-bold text-[#b4493c]"
        >
          {error}
        </p>
      )}
    </Modal>
  );
}
