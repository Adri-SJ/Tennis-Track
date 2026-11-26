export const ZONA = "America/Mexico_City";

/* Lunes = 0 … Domingo = 6; coinciden con las abreviaturas de grupo.dias. */
export const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/* Día de la semana (0 = lunes), minutos del día y fechas en la hora de México. */
export function ahoraEnMexico(): {
  dia: number;
  minutos: number;
  fecha: string;
  iso: string;
} {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);

  const valor = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  const semana = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return {
    dia: Math.max(0, semana.indexOf(valor("weekday"))),
    minutos: Number(valor("hour")) * 60 + Number(valor("minute")),
    fecha: new Intl.DateTimeFormat("es-MX", {
      timeZone: ZONA,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(ahora),
    /* en-CA da el formato YYYY-MM-DD. */
    iso: new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(ahora),
  };
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
