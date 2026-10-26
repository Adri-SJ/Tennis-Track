import { getAlumnos, getInscripcionActivaDeAlumno, twentyFetch } from "@/lib/api";
import { hoy } from "@/lib/formulario";

export type EstadoMensualidad =
  | "Pagado"
  | "Pendiente"
  | "Vencido"
  | "Cancelado";

export type MetodoPago = "Efectivo" | "Transferencia" | "Tarjeta" | "Otro";

export type Mensualidad = {
  id: string;
  alumnoId: string;
  alumno: string;
  concepto: string;
  periodo: string;
  monto: number;
  vencimiento: string;
  estado: EstadoMensualidad;
  pago: {
    fecha: string | null;
    metodo: MetodoPago | null;
    referencia: string;
  } | null;
};

export type NuevaMensualidad = {
  alumnoId: string;
  /* Primer día del mes, YYYY-MM-01. */
  periodo: string;
  monto: number;
  vencimiento: string;
};

export type NuevoPago = {
  fecha: string;
  metodo: MetodoPago;
  referencia: string;
};

const METODOS: Record<string, MetodoPago> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export const LISTA_METODOS = Object.values(METODOS);

type Moneda = { amountMicros: number | null; currencyCode: string | null };

type TwentyMensualidad = {
  id: string;
  name: string | null;
  periodo: string | null;
  monto: Moneda | null;
  fechaDeVencimiento: string | null;
  estado: string | null;
  alumnoId: string | null;
};

type TwentyPago = {
  id: string;
  mensualidadId: string | null;
  fechaDePago: string | null;
  metodo: string | null;
  referencia: string | null;
  createdAt: string;
};

const aMoneda = (monto: number): Moneda => ({
  amountMicros: Math.round(monto * 1_000_000),
  currencyCode: "MXN",
});

const formatoMes = new Intl.DateTimeFormat("es-MX", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function conceptoDePeriodo(periodo: string): string {
  return `Mensualidad ${formatoMes.format(new Date(`${periodo}T12:00:00Z`))}`;
}

/*
  Una mensualidad PENDIENTE cuya fecha de vencimiento ya
  pasó se muestra como vencida.
*/
function estadoMensualidad(
  estado: string | null,
  vencimiento: string
): EstadoMensualidad {
  if (estado === "PAGADA") return "Pagado";
  if (estado === "CANCELADA") return "Cancelado";
  if (estado === "VENCIDA") return "Vencido";

  return vencimiento && vencimiento < hoy() ? "Vencido" : "Pendiente";
}

export async function getMensualidades(): Promise<Mensualidad[]> {
  const [mensualidades, pagos, alumnos] = await Promise.all([
    twentyFetch<{ data: { mensualidades: TwentyMensualidad[] } }>(
      "mensualidades?limit=200&order_by=fechaDeVencimiento[DescNullsLast]"
    ),
    twentyFetch<{ data: { pagos: TwentyPago[] } }>(
      "pagos?limit=200&order_by=createdAt[DescNullsLast]"
    ),
    getAlumnos(),
  ]);

  const nombres = new Map(alumnos.map((alumno) => [alumno.id, alumno.nombre]));

  return mensualidades.data.mensualidades
    .filter((item) => item.alumnoId && item.periodo)
    .map((item) => {
      const vencimiento = item.fechaDeVencimiento ?? "";
      const pago = pagos.data.pagos.find(
        (registro) => registro.mensualidadId === item.id
      );

      return {
        id: item.id,
        alumnoId: item.alumnoId as string,
        alumno: nombres.get(item.alumnoId as string) ?? "Alumno eliminado",
        concepto: conceptoDePeriodo(item.periodo as string),
        periodo: item.periodo as string,
        monto: (item.monto?.amountMicros ?? 0) / 1_000_000,
        vencimiento,
        estado: estadoMensualidad(item.estado, vencimiento),
        pago: pago
          ? {
              fecha: pago.fechaDePago,
              metodo: METODOS[pago.metodo ?? ""] ?? null,
              referencia: pago.referencia ?? "",
            }
          : null,
      };
    });
}

export async function createMensualidad(
  datos: NuevaMensualidad
): Promise<void> {
  const [alumnos, inscripcion] = await Promise.all([
    getAlumnos(),
    getInscripcionActivaDeAlumno(datos.alumnoId),
  ]);

  const alumno = alumnos.find((item) => item.id === datos.alumnoId);

  if (!alumno) {
    throw new Error("El alumno no existe.");
  }

  await twentyFetch("mensualidades", {
    method: "POST",
    body: {
      name: `${alumno.nombre} · ${conceptoDePeriodo(datos.periodo)}`,
      alumnoId: alumno.id,
      inscripcionId: inscripcion?.id ?? null,
      periodo: datos.periodo,
      monto: aMoneda(datos.monto),
      fechaDeVencimiento: datos.vencimiento,
      estado: "PENDIENTE",
    },
  });
}

/* Registra el pago completo de la mensualidad y la marca como pagada. */
export async function registrarPago(
  mensualidad: Mensualidad,
  pago: NuevoPago
): Promise<void> {
  await twentyFetch("pagos", {
    method: "POST",
    body: {
      name: `${mensualidad.alumno} · ${mensualidad.concepto}`,
      alumnoId: mensualidad.alumnoId,
      mensualidadId: mensualidad.id,
      monto: aMoneda(mensualidad.monto),
      fechaDePago: pago.fecha,
      metodo: Object.keys(METODOS).find(
        (clave) => METODOS[clave] === pago.metodo
      ),
      referencia: pago.referencia,
    },
  });

  await twentyFetch(`mensualidades/${mensualidad.id}`, {
    method: "PATCH",
    body: { estado: "PAGADA" },
  });
}

export async function cancelarMensualidad(id: string): Promise<void> {
  await twentyFetch(`mensualidades/${id}`, {
    method: "PATCH",
    body: { estado: "CANCELADA" },
  });
}
