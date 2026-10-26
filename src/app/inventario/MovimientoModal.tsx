"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { hoy } from "@/lib/formulario";
import type { Material, TipoMovimiento } from "@/lib/inventario";
import { guardarMovimiento } from "./actions";
import Modal, { claseCampoModal } from "@/components/Modal";

const TIPOS: { tipo: TipoMovimiento; ayuda: string }[] = [
  { tipo: "Entrada", ayuda: "Compra o reposición (suma)" },
  { tipo: "Devolución", ayuda: "Regresa material prestado (suma)" },
  { tipo: "Salida", ayuda: "Uso o consumo (resta)" },
  { tipo: "Préstamo", ayuda: "Se presta a alguien (resta)" },
  { tipo: "Baja", ayuda: "Material dañado o perdido (resta)" },
];

export default function MovimientoModal({
  material,
  onCerrar,
}: {
  material: Material;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [tipo, setTipo] = useState<TipoMovimiento>("Entrada");
  const [cantidad, setCantidad] = useState("1");
  const [fecha, setFecha] = useState(hoy);
  const [nota, setNota] = useState("");

  const guardar = () => {
    setError("");

    startTransition(async () => {
      const resultado = await guardarMovimiento(material.id, {
        tipo,
        cantidad: Number(cantidad),
        fecha,
        nota,
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
      etiqueta={material.nombre}
      titulo="REGISTRAR MOVIMIENTO"
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
            {guardando ? "Guardando…" : "Registrar"}
          </button>
        </>
      }
    >
      <p className="rounded-xl bg-[#f6f4ee] p-3 text-sm text-[#6f6964]">
        Existencias actuales:{" "}
        <span className="font-black text-[#141113]">{material.cantidad}</span>
      </p>

      <div>
        <label htmlFor="movimiento-tipo" className="mb-2 block text-sm font-bold">
          Tipo de movimiento
        </label>
        <select
          id="movimiento-tipo"
          value={tipo}
          onChange={(event) => setTipo(event.target.value as TipoMovimiento)}
          className={claseCampoModal}
        >
          {TIPOS.map((item) => (
            <option key={item.tipo} value={item.tipo}>
              {item.tipo} · {item.ayuda}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="movimiento-cantidad" className="mb-2 block text-sm font-bold">
            Cantidad
          </label>
          <input
            id="movimiento-cantidad"
            type="number"
            min={1}
            value={cantidad}
            onChange={(event) => setCantidad(event.target.value)}
            className={claseCampoModal}
          />
        </div>

        <div>
          <label htmlFor="movimiento-fecha" className="mb-2 block text-sm font-bold">
            Fecha
          </label>
          <input
            id="movimiento-fecha"
            type="date"
            value={fecha}
            max={hoy()}
            onChange={(event) => setFecha(event.target.value)}
            className={claseCampoModal}
          />
        </div>
      </div>

      <div>
        <label htmlFor="movimiento-nota" className="mb-2 block text-sm font-bold">
          Nota
        </label>
        <input
          id="movimiento-nota"
          value={nota}
          onChange={(event) => setNota(event.target.value)}
          placeholder="Opcional"
          maxLength={300}
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
