export type EstadoFormulario = {
  error: string | null;
};

export const estadoInicial: EstadoFormulario = { error: null };

export const claseCampo =
  "w-full rounded-xl border border-borde bg-superficie px-4 py-3 text-sm outline-none transition focus:border-verde";

export const claseEtiqueta =
  "mb-2 block text-sm font-semibold text-texto";

/*
  Fecha de hoy (YYYY-MM-DD) en la hora de México. El servidor corre en
  UTC: con la hora local, después de las 6 p.m. ya sería mañana.
*/
export function hoy(): string {
  /* en-CA da el formato YYYY-MM-DD. */
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
  }).format(new Date());
}

export function esFecha(valor: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor);
}
