export type EstadoFormulario = {
  error: string | null;
};

export const estadoInicial: EstadoFormulario = { error: null };

export const claseCampo =
  "w-full rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#7d9309]";

export const claseEtiqueta =
  "mb-2 block text-sm font-semibold text-[#141113]";

/* Fecha de hoy en formato YYYY-MM-DD, en hora local. */
export function hoy(): string {
  const ahora = new Date();

  return new Date(
    ahora.getTime() - ahora.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

export function esFecha(valor: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor);
}
