"use client";

import { X } from "lucide-react";

export const claseCampoModal =
  "w-full rounded-xl border border-borde bg-fondo px-4 py-3 text-sm outline-none focus:border-verde";

export default function Modal({
  etiqueta,
  titulo,
  onCerrar,
  children,
  pie,
}: {
  etiqueta: string;
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
  pie?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/50 p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-superficie shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between bg-fondo p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-verde">
              {etiqueta}
            </p>

            <h2
              id="titulo-modal"
              className="mt-2 text-2xl font-black text-texto"
            >
              {titulo}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="rounded-full bg-superficie p-2 text-texto"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">{children}</div>

        {pie && (
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-borde p-5 sm:flex-row sm:justify-end">
            {pie}
          </div>
        )}
      </div>
    </div>
  );
}
