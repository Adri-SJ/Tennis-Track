
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CircleCheck,
  Clock3,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpRight,
  X,
  CalendarDays,
  CreditCard,
  Banknote,
  Receipt,
  Info,
  TrendingUp,
  SlidersHorizontal,
  Ban,
} from "lucide-react";
import type { Mensualidad } from "@/lib/pagos";
import { anularMensualidad } from "./actions";
import MensualidadModal from "./MensualidadModal";
import PagoModal from "./PagoModal";

type EstadoPago = Mensualidad["estado"];
type MetodoPago = NonNullable<NonNullable<Mensualidad["pago"]>["metodo"]>;

type Pago = {
  id: string;
  alumno: string;
  concepto: string;
  monto: number;
  vencimiento: string;
  fechaPago: string | null;
  estado: EstadoPago;
  metodo: MetodoPago | null;
  referencia: string | null;
};

function aPago(mensualidad: Mensualidad): Pago {
  return {
    id: mensualidad.id,
    alumno: mensualidad.alumno,
    concepto: mensualidad.concepto,
    monto: mensualidad.monto,
    vencimiento: mensualidad.vencimiento,
    fechaPago: mensualidad.pago?.fecha ?? null,
    estado: mensualidad.estado,
    metodo: mensualidad.pago?.metodo ?? null,
    referencia: mensualidad.pago?.referencia || null,
  };
}

const estados = [
  "Todos",
  "Pagado",
  "Pendiente",
  "Vencido",
  "Cancelado",
] as const;

type FiltroEstado = (typeof estados)[number];

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function formatearFecha(fecha: string | null) {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
}

function estiloEstado(estado: EstadoPago) {
  if (estado === "Pagado") {
    return "border-[#b9ca75] bg-[#f0f5d8] text-[#657a0b]";
  }

  if (estado === "Pendiente") {
    return "border-[#e6c58d] bg-[#fff5df] text-[#a16a1b]";
  }

  if (estado === "Cancelado") {
    return "border-[#d8d0c4] bg-[#f6f4ee] text-[#8c847d]";
  }

  return "border-[#e6b1a9] bg-[#fff0ed] text-[#b4493c]";
}

function IconoMetodo({ metodo }: { metodo: MetodoPago | null }) {
  if (metodo === "Efectivo") return <Banknote size={18} />;
  if (metodo === "Tarjeta") return <CreditCard size={18} />;
  return <Wallet size={18} />;
}

export default function PagosClient({
  mensualidades,
  alumnos,
}: {
  mensualidades: Mensualidad[];
  alumnos: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [cancelando, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<FiltroEstado>("Todos");
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(
    null
  );
  const [formulario, setFormulario] = useState<
    "mensualidad" | "pago" | null
  >(null);

  const pagos = useMemo(() => mensualidades.map(aPago), [mensualidades]);

  // Las canceladas no cuentan en los importes.
  const vigentes = pagos.filter((pago) => pago.estado !== "Cancelado");

  // Se busca por id para mostrar los datos actualizados.
  const pagoSeleccionado =
    pagos.find((pago) => pago.id === seleccionadoId) ?? null;

  const mensualidadSeleccionada =
    mensualidades.find((item) => item.id === seleccionadoId) ?? null;

  const setPagoSeleccionado = (pago: Pago | null) =>
    setSeleccionadoId(pago?.id ?? null);

  const cancelar = (id: string) => {
    if (!window.confirm("¿Cancelar esta mensualidad? Ya no se cobrará.")) {
      return;
    }

    startTransition(async () => {
      const resultado = await anularMensualidad(id);

      if (resultado.error) {
        window.alert(resultado.error);
        return;
      }

      router.refresh();
    });
  };

  const totalRecaudado = vigentes
    .filter((pago) => pago.estado === "Pagado")
    .reduce((total, pago) => total + pago.monto, 0);

  const totalPendiente = vigentes
    .filter((pago) => pago.estado !== "Pagado")
    .reduce((total, pago) => total + pago.monto, 0);

  const pagosVencidos = vigentes.filter(
    (pago) => pago.estado === "Vencido"
  ).length;

  const pagosRealizados = vigentes.filter(
    (pago) => pago.estado === "Pagado"
  ).length;

  const montoTotal = vigentes.reduce(
    (total, pago) => total + pago.monto,
    0
  );

  const porcentajeCobrado =
    montoTotal > 0
      ? Math.round((totalRecaudado / montoTotal) * 100)
      : 0;

  const pagosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pagos.filter((pago) => {
      const coincideBusqueda =
        pago.alumno.toLowerCase().includes(texto) ||
        pago.concepto.toLowerCase().includes(texto) ||
        (pago.referencia ?? "").toLowerCase().includes(texto);

      const coincideEstado =
        estado === "Todos" || pago.estado === estado;

      return coincideBusqueda && coincideEstado;
    });
  }, [pagos, busqueda, estado]);

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">

      {/* ENCABEZADO */}
      <section className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
            PAGOS
          </h1>

          <p className="mt-2 text-sm text-[#6f6964] md:text-base">
            Control de mensualidades, cobros y adeudos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormulario("mensualidad")}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#cbd90a] px-5 py-3 text-sm font-black text-[#32390d] transition hover:bg-[#dce855]"
        >
          <Plus size={18} />
          Nueva mensualidad
        </button>
      </section>

      {/* INDICADORES */}
      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            titulo: "Recaudado",
            valor: formatoMoneda.format(totalRecaudado),
            icono: Wallet,
            color: "text-[#7d9309]",
          },
          {
            titulo: "Por cobrar",
            valor: formatoMoneda.format(totalPendiente),
            icono: Clock3,
            color: "text-[#141113]",
          },
          {
            titulo: "Pagos realizados",
            valor: pagosRealizados,
            icono: CircleCheck,
            color: "text-[#141113]",
          },
          {
            titulo: "Pagos vencidos",
            valor: pagosVencidos,
            icono: AlertTriangle,
            color: "text-[#b4493c]",
          },
        ].map((indicador) => {
          const Icono = indicador.icono;

          return (
            <div
              key={indicador.titulo}
              className="rounded-2xl border border-[#e1dace] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                  {indicador.titulo}
                </p>
                <Icono size={18} className="shrink-0 text-[#7d9309]" />
              </div>

              <p
                className={`mt-3 break-words text-2xl font-black md:text-3xl ${indicador.color}`}
              >
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>

      {/* PROGRESO DE COBRANZA */}
      <section className="mb-7 rounded-2xl bg-[#32390d] p-6 text-white md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#dce6a1]">
              <TrendingUp size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.15em]">
                Resumen financiero
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              Cobranza registrada
            </h2>

            <p className="mt-2 text-sm text-[#d1d5ba]">
              Porcentaje del importe registrado que ya fue pagado
              (sin contar mensualidades canceladas).
            </p>
          </div>

          <p className="text-4xl font-black text-[#eef310] md:text-5xl">
            {porcentajeCobrado}%
          </p>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#cbd90a] transition-all"
            style={{ width: `${porcentajeCobrado}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-[#d1d5ba]">
          <span>
            Cobrado: {formatoMoneda.format(totalRecaudado)}
          </span>
          <span>
            Total registrado: {formatoMoneda.format(montoTotal)}
          </span>
        </div>
      </section>

      {/* TABLA DE PAGOS */}
      <section className="overflow-hidden rounded-2xl border border-[#e1dace] bg-white">
        <div className="border-b border-[#e1dace] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                Registro financiero
              </p>

              <h2 className="mt-1 text-xl font-black text-[#141113]">
                Mensualidades y cobros
              </h2>
            </div>

            <span className="w-fit rounded-full border border-[#e1dace] px-3 py-1 text-xs font-bold text-[#8c847d]">
              {pagosFiltrados.length} resultados
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c847d]"
              />

              <input
                type="search"
                placeholder="Buscar alumno, concepto o referencia..."
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm text-[#141113] outline-none focus:border-[#7d9309]"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c847d]"
              />

              <select
                aria-label="Filtrar por estado"
                value={estado}
                onChange={(event) =>
                  setEstado(event.target.value as FiltroEstado)
                }
                className="w-full rounded-xl border border-[#e1dace] bg-[#f6f4ee] py-3 pl-11 pr-4 text-sm font-semibold text-[#141113] outline-none focus:border-[#7d9309]"
              >
                {estados.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todos"
                      ? "Todos los estados"
                      : item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-[#f6f4ee]">
              <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                <th className="px-6 py-4">Alumno</th>
                <th className="px-4 py-4">Concepto</th>
                <th className="px-4 py-4">Importe</th>
                <th className="px-4 py-4">Vencimiento</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eee9df]">
              {pagosFiltrados.map((pago) => (
                <tr
                  key={pago.id}
                  className="transition hover:bg-[#fdfcf9]"
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#141113]">
                      {pago.alumno}
                    </p>
                    {pago.metodo && (
                      <p className="mt-1 text-xs text-[#8c847d]">
                        {pago.metodo}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-5 text-sm text-[#6f6964]">
                    {pago.concepto}
                  </td>

                  <td className="px-4 py-5 font-black text-[#141113]">
                    {formatoMoneda.format(pago.monto)}
                  </td>

                  <td className="px-4 py-5 text-sm text-[#6f6964]">
                    {formatearFecha(pago.vencimiento)}
                  </td>

                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${estiloEstado(
                        pago.estado
                      )}`}
                    >
                      {pago.estado}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => setPagoSeleccionado(pago)}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#7d9309] hover:text-[#52620a]"
                    >
                      Ver
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MÓVIL */}
        <div className="divide-y divide-[#eee9df] md:hidden">
          {pagosFiltrados.map((pago) => (
            <div key={pago.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#141113]">
                    {pago.alumno}
                  </p>
                  <p className="mt-1 text-xs text-[#8c847d]">
                    {pago.concepto}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${estiloEstado(
                    pago.estado
                  )}`}
                >
                  {pago.estado}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f6f4ee] p-3">
                <div>
                  <p className="text-xs text-[#8c847d]">
                    Importe
                  </p>
                  <p className="mt-1 text-lg font-black text-[#141113]">
                    {formatoMoneda.format(pago.monto)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#8c847d]">
                    Vencimiento
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#141113]">
                    {formatearFecha(pago.vencimiento)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPagoSeleccionado(pago)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#7d9309]"
              >
                Ver detalle
                <ArrowUpRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {pagosFiltrados.length === 0 && (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Search size={34} className="text-[#a8b65a]" />
            <h3 className="mt-4 font-black text-[#141113]">
              No encontramos pagos
            </h3>
            <p className="mt-2 text-sm text-[#8c847d]">
              Prueba con otro alumno o cambia el filtro.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setEstado("Todos");
              }}
              className="mt-4 text-sm font-bold text-[#7d9309]"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[#e1dace] bg-[#fdfcf9] px-5 py-4 text-xs text-[#8c847d]">
          <Info size={15} className="shrink-0" />
          Mensualidades y pagos guardados en Twenty. Una
          mensualidad pendiente se marca como vencida al pasar
          su fecha de vencimiento.
        </div>
      </section>

      {/* MODAL DE DETALLE */}
      {pagoSeleccionado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#141113]/50 p-4">
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={() => setPagoSeleccionado(null)}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-pago"
            className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between bg-[#f6f4ee] p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7d9309]">
                  Detalle de movimiento
                </p>

                <h2
                  id="titulo-pago"
                  className="mt-2 text-2xl font-black text-[#141113]"
                >
                  {pagoSeleccionado.alumno}
                </h2>

                <p className="mt-1 text-sm text-[#8c847d]">
                  {pagoSeleccionado.concepto}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setPagoSeleccionado(null)}
                className="rounded-full bg-white p-2 text-[#141113]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-[#32390d] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#dce6a1]">
                  Importe de mensualidad
                </p>

                <p className="mt-2 text-3xl font-black">
                  {formatoMoneda.format(pagoSeleccionado.monto)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8c847d]">
                  Estado
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${estiloEstado(
                    pagoSeleccionado.estado
                  )}`}
                >
                  {pagoSeleccionado.estado}
                </span>
              </div>

              {[
                {
                  titulo: "Concepto",
                  valor: pagoSeleccionado.concepto,
                  icono: Receipt,
                },
                {
                  titulo: "Vencimiento",
                  valor: formatearFecha(pagoSeleccionado.vencimiento),
                  icono: CalendarDays,
                },
                {
                  titulo: "Fecha de pago",
                  valor: formatearFecha(pagoSeleccionado.fechaPago),
                  icono: CircleCheck,
                },
                {
                  titulo: "Método de pago",
                  valor: pagoSeleccionado.metodo ?? "Sin registrar",
                  icono: CreditCard,
                },
                {
                  titulo: "Referencia",
                  valor: pagoSeleccionado.referencia ?? "—",
                  icono: Receipt,
                },
              ].map((campo) => {
                const Icono = campo.icono;

                return (
                  <div
                    key={campo.titulo}
                    className="flex items-start justify-between gap-4 border-b border-[#eee9df] pb-3"
                  >
                    <span className="flex items-center gap-2 text-sm text-[#8c847d]">
                      <Icono size={15} />
                      {campo.titulo}
                    </span>

                    <span className="max-w-[60%] text-right text-sm font-bold text-[#141113]">
                      {campo.valor}
                    </span>
                  </div>
                );
              })}

              {pagoSeleccionado.metodo && (
                <div className="flex items-center gap-3 rounded-xl bg-[#f0f5d8] p-4 text-sm font-semibold text-[#657a0b]">
                  <IconoMetodo metodo={pagoSeleccionado.metodo} />
                  Pago registrado mediante{" "}
                  {pagoSeleccionado.metodo.toLowerCase()}.
                </div>
              )}

              {(pagoSeleccionado.estado === "Pendiente" ||
                pagoSeleccionado.estado === "Vencido") && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setFormulario("pago")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#141113] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d]"
                  >
                    <CircleCheck size={16} />
                    Registrar pago
                  </button>

                  <button
                    type="button"
                    onClick={() => cancelar(pagoSeleccionado.id)}
                    disabled={cancelando}
                    className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-[#b4493c] disabled:opacity-60"
                  >
                    <Ban size={16} />
                    Cancelar mensualidad
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {formulario === "mensualidad" && (
        <MensualidadModal
          alumnos={alumnos}
          onCerrar={() => setFormulario(null)}
        />
      )}

      {formulario === "pago" && mensualidadSeleccionada && (
        <PagoModal
          mensualidad={mensualidadSeleccionada}
          onCerrar={() => setFormulario(null)}
        />
      )}
    </div>
  );
}
