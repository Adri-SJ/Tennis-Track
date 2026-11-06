"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { Material } from "@/lib/inventario";
import { solicitarMaterial } from "./actions";
import Modal, { claseCampoModal } from "@/components/Modal";

export default function SolicitudModal({
  material,
  onCerrar,
}: {
  material: Material;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [nota, setNota] = useState("");

  const enviar = () => {
    setError("");

    startTransition(async () => {
      const resultado = await solicitarMaterial(
        material.id,
        Number(cantidad),
        nota
      );

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      router.refresh();
      onCerrar();
    });
  };

  return (
    <Modal
      etiqueta="Inventario"
      titulo="Solicitar material"
      onCerrar={onCerrar}
      pie={
        <>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-borde px-5 py-3 text-sm font-semibold text-texto transition hover:bg-fondo"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={enviar}
            disabled={enviando}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-boton px-5 py-3 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover disabled:cursor-wait disabled:opacity-60"
          >
            <Send size={16} />
            {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        </>
      }
    >
      <p className="text-sm text-texto-3">
        {material.nombre} · {material.cantidad} disponibles
      </p>

      <label className="block text-sm font-semibold text-texto">
        Cantidad
        <input
          type="number"
          min={1}
          max={material.cantidad}
          value={cantidad}
          onChange={(evento) => setCantidad(evento.target.value)}
          className={`mt-2 ${claseCampoModal}`}
        />
      </label>

      <label className="block text-sm font-semibold text-texto">
        Nota (opcional)
        <textarea
          rows={3}
          value={nota}
          onChange={(evento) => setNota(evento.target.value)}
          placeholder="Para qué clase lo necesitas"
          className={`mt-2 ${claseCampoModal}`}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-peligro-fuerte">
          {error}
        </p>
      )}
    </Modal>
  );
}
