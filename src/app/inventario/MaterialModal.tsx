"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type {
  Categoria,
  Condicion,
  DatosMaterial,
  Material,
} from "@/lib/inventario";
import { guardarMaterial } from "./actions";
import Modal, { claseCampoModal } from "@/components/Modal";

export const CATEGORIAS: Categoria[] = [
  "Pelotas",
  "Raquetas",
  "Conos",
  "Redes",
  "Entrenamiento",
  "Otro",
];

const CONDICIONES: Condicion[] = ["Bueno", "Desgastado", "Dañado"];

export default function MaterialModal({
  material,
  onCerrar,
}: {
  material: Material | null;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState(material?.nombre ?? "");
  const [categoria, setCategoria] = useState<Categoria>(
    material?.categoria ?? "Pelotas"
  );
  const [cantidad, setCantidad] = useState(
    material?.cantidad.toString() ?? "0"
  );
  const [minimo, setMinimo] = useState(material?.minimo.toString() ?? "0");
  const [ubicacion, setUbicacion] = useState(material?.ubicacion ?? "");
  const [condicion, setCondicion] = useState<string>(
    material?.condicion ?? "Bueno"
  );

  const guardar = () => {
    setError("");

    const datos: DatosMaterial = {
      nombre,
      categoria,
      cantidad: Number(cantidad),
      minimo: Number(minimo),
      ubicacion,
      condicion: (condicion || null) as Condicion | null,
    };

    startTransition(async () => {
      const resultado = await guardarMaterial(material?.id ?? null, datos);

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
      etiqueta="Inventario"
      titulo={material ? "EDITAR MATERIAL" : "NUEVO MATERIAL"}
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
            {guardando ? "Guardando…" : "Guardar material"}
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="material-nombre" className="mb-2 block text-sm font-bold">
          Nombre *
        </label>
        <input
          id="material-nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej. Pelotas de entrenamiento"
          maxLength={120}
          className={claseCampoModal}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="material-categoria" className="mb-2 block text-sm font-bold">
            Categoría
          </label>
          <select
            id="material-categoria"
            value={categoria}
            onChange={(event) => setCategoria(event.target.value as Categoria)}
            className={claseCampoModal}
          >
            {CATEGORIAS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="material-condicion" className="mb-2 block text-sm font-bold">
            Condición
          </label>
          <select
            id="material-condicion"
            value={condicion}
            onChange={(event) => setCondicion(event.target.value)}
            className={claseCampoModal}
          >
            {CONDICIONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="material-cantidad" className="mb-2 block text-sm font-bold">
            Existencias
          </label>
          <input
            id="material-cantidad"
            type="number"
            min={0}
            value={cantidad}
            onChange={(event) => setCantidad(event.target.value)}
            disabled={material !== null}
            className={`${claseCampoModal} disabled:opacity-60`}
          />
          {material && (
            <p className="mt-1 text-xs text-texto-suave">
              Se ajustan registrando un movimiento.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="material-minimo" className="mb-2 block text-sm font-bold">
            Mínimo
          </label>
          <input
            id="material-minimo"
            type="number"
            min={0}
            value={minimo}
            onChange={(event) => setMinimo(event.target.value)}
            className={claseCampoModal}
          />
        </div>
      </div>

      <div>
        <label htmlFor="material-ubicacion" className="mb-2 block text-sm font-bold">
          Ubicación
        </label>
        <input
          id="material-ubicacion"
          value={ubicacion}
          onChange={(event) => setUbicacion(event.target.value)}
          placeholder="Ej. Bodega principal"
          maxLength={120}
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
