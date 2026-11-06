"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardList, X } from "lucide-react";
import type { EstadoSolicitud, Solicitud } from "@/lib/solicitudes";
import { decidirSolicitud } from "./actions";

const ESTILO: Record<EstadoSolicitud, string> = {
  pendiente: "bg-alerta-suave text-alerta",
  aprobada: "bg-lima-suave text-verde-oscuro",
  rechazada: "bg-peligro-suave text-peligro-fuerte",
};

const ETIQUETA: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export default function SolicitudesMaterial({
  solicitudes,
  esAdmin,
}: {
  solicitudes: Solicitud[];
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [ocupado, startTransition] = useTransition();
  const [error, setError] = useState("");

  const decidir = (id: number, aprobar: boolean) => {
    setError("");

    startTransition(async () => {
      const resultado = await decidirSolicitud(id, aprobar);

      if (resultado.error) {
        setError(resultado.error);
      }

      router.refresh();
    });
  };

  if (solicitudes.length === 0 && esAdmin) {
    return null;
  }

  return (
    <section className="mb-7 rounded-2xl border border-borde bg-superficie p-5 md:p-6">
      <h2 className="flex items-center gap-2 text-lg font-black text-texto">
        <ClipboardList size={20} className="text-verde" />
        {esAdmin ? "SOLICITUDES DE MATERIAL" : "MIS SOLICITUDES"}
      </h2>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-peligro-fuerte">
          {error}
        </p>
      )}

      {solicitudes.length === 0 ? (
        <p className="mt-3 text-sm text-texto-suave">
          Para pedir material, abre un artículo del catálogo y elige
          «Solicitar material».
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-borde">
          {solicitudes.map((solicitud) => (
            <li
              key={solicitud.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-texto">
                  {solicitud.cantidad} × {solicitud.material}
                </p>

                <p className="text-xs text-texto-suave">
                  {esAdmin && `${solicitud.entrenador} · `}
                  {new Date(solicitud.creadaEn).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                  {solicitud.nota && ` · ${solicitud.nota}`}
                </p>
              </div>

              {esAdmin && solicitud.estado === "pendiente" ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => decidir(solicitud.id, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-boton px-4 py-2 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover disabled:opacity-60"
                  >
                    <Check size={16} />
                    Aprobar
                  </button>

                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => decidir(solicitud.id, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-borde px-4 py-2 text-sm font-semibold text-peligro-fuerte transition hover:bg-peligro-suave disabled:opacity-60"
                  >
                    <X size={16} />
                    Rechazar
                  </button>
                </div>
              ) : (
                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${ESTILO[solicitud.estado]}`}
                >
                  {ETIQUETA[solicitud.estado]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
