import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Package,
  PackageOpen,
  UserPlus,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { alcanceDePagina } from "@/lib/auth/servidor";
import { getAlumnos, getGrupos, getInscripciones } from "@/lib/api";
import { getAsistencias } from "@/lib/asistencias";
import { aMinutos, ahoraEnMexico, DIAS_CORTOS } from "@/lib/fecha";
import { getMateriales } from "@/lib/inventario";
import { getMensualidades } from "@/lib/pagos";
import { getProspectos } from "@/lib/prospectos";
import { getSolicitudes } from "@/lib/solicitudes";

/* Si una fuente falla, el resto del inicio se sigue mostrando. */
async function seguro<T>(promesa: Promise<T>, respaldo: T): Promise<T> {
  try {
    return await promesa;
  } catch (error) {
    console.error("Inicio: no se pudo cargar una sección", error);
    return respaldo;
  }
}

const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type EstadoClase = "en-curso" | "proxima" | "terminada";

const ETIQUETA_ESTADO: Record<EstadoClase, string> = {
  "en-curso": "En curso",
  proxima: "Próxima",
  terminada: "Terminada",
};

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`;

export default async function Home() {
  const { esAdmin } = await alcanceDePagina("/");

  /* El resumen es de toda la academia; el entrenador empieza en su lista. */
  if (!esAdmin) {
    redirect("/asistencia");
  }

  const ahora = ahoraEnMexico();

  const [
    alumnos,
    grupos,
    inscripciones,
    mensualidades,
    materiales,
    prospectos,
    solicitudes,
  ] = await Promise.all([
    getAlumnos(),
    getGrupos(),
    getInscripciones(),
    seguro(getMensualidades(), []),
    seguro(getMateriales(), []),
    seguro(getProspectos(), []),
    seguro(getSolicitudes(null), []),
  ]);

  /* ---------- Alumnos y grupos ---------- */

  const alumnosActivos = alumnos.filter((alumno) => alumno.estado === "Activo");
  const gruposActivos = grupos.filter((grupo) => grupo.estado === "Activo");

  const alumnosDeGrupo = new Map<string, Set<string>>();
  for (const inscripcion of inscripciones) {
    if (inscripcion.estado !== "Activa" || !inscripcion.grupo) continue;
    const ids = alumnosDeGrupo.get(inscripcion.grupo.id) ?? new Set<string>();
    inscripcion.alumnos.forEach((alumno) => ids.add(alumno.id));
    alumnosDeGrupo.set(inscripcion.grupo.id, ids);
  }
  const cantidadEn = (grupoId: string) => alumnosDeGrupo.get(grupoId)?.size ?? 0;

  const asignados = new Set(
    [...alumnosDeGrupo.values()].flatMap((ids) => [...ids])
  );
  const sinGrupo = alumnosActivos.filter((alumno) => !asignados.has(alumno.id));

  const ocupacion = gruposActivos
    .map((grupo) => ({
      grupo,
      alumnos: cantidadEn(grupo.id),
      cupo: grupo.capacidadMaxima,
    }))
    .sort((a, b) => b.alumnos - a.alumnos);

  const maximoBarra = Math.max(
    ...ocupacion.map((fila) => fila.cupo ?? fila.alumnos),
    1
  );
  const cupoTotal = ocupacion.reduce((total, fila) => total + (fila.cupo ?? 0), 0);
  const enGruposConCupo = ocupacion
    .filter((fila) => fila.cupo)
    .reduce((total, fila) => total + fila.alumnos, 0);
  const porcentajeOcupacion =
    cupoTotal > 0 ? Math.round((enGruposConCupo / cupoTotal) * 100) : null;

  /* ---------- Clases de hoy ---------- */

  const corto = DIAS_CORTOS[ahora.dia];
  const gruposHoy = gruposActivos
    .filter((grupo) => grupo.dias.split(" · ").includes(corto))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const listas = await Promise.all(
    gruposHoy.map((grupo) => seguro(getAsistencias(grupo.id, ahora.iso), []))
  );

  const clasesHoy = gruposHoy.map((grupo, indice) => {
    const inicio = aMinutos(grupo.horaInicio);
    const fin = aMinutos(grupo.horaFin);
    const estado: EstadoClase =
      ahora.minutos >= fin
        ? "terminada"
        : ahora.minutos >= inicio
          ? "en-curso"
          : "proxima";

    return {
      grupo,
      estado,
      alumnos: cantidadEn(grupo.id),
      marcados: listas[indice].length,
    };
  });

  /* ---------- Cobranza del mes ---------- */

  const mes = ahora.iso.slice(0, 7);
  const delMes = mensualidades.filter(
    (pago) => pago.periodo.startsWith(mes) && pago.estado !== "Cancelado"
  );
  const esperado = delMes.reduce((total, pago) => total + pago.monto, 0);
  const cobrado = delMes
    .filter((pago) => pago.estado === "Pagado")
    .reduce((total, pago) => total + pago.monto, 0);
  const porcentajeCobrado =
    esperado > 0 ? Math.round((cobrado / esperado) * 100) : null;

  const vencidos = mensualidades.filter((pago) => pago.estado === "Vencido");
  const montoVencido = vencidos.reduce((total, pago) => total + pago.monto, 0);

  /* ---------- Pendientes ---------- */

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "pendiente"
  );
  const stockBajo = materiales.filter(
    (material) => material.minimo > 0 && material.cantidad <= material.minimo
  );
  const prospectosNuevos = prospectos.filter(
    (prospecto) => prospecto.etapa === "Nuevo"
  );
  const enProceso = prospectos.filter((prospecto) =>
    ["Nuevo", "Contactado", "Clase de prueba"].includes(prospecto.etapa)
  );
  const clasesDePrueba = prospectos.filter(
    (prospecto) => prospecto.etapa === "Clase de prueba"
  ).length;

  const posibles: (Pendiente | false)[] = [
    vencidos.length > 0 && {
      icono: AlertTriangle,
      tono: "alerta",
      titulo: plural(vencidos.length, "pago vencido", "pagos vencidos"),
      detalle: `${moneda.format(montoVencido)} por cobrar`,
      href: "/pagos",
    },
    solicitudesPendientes.length > 0 && {
      icono: PackageOpen,
      tono: "aviso",
      titulo: plural(
        solicitudesPendientes.length,
        "solicitud de material",
        "solicitudes de material"
      ),
      detalle: "Esperan tu respuesta",
      href: "/inventario",
    },
    stockBajo.length > 0 && {
      icono: Package,
      tono: "aviso",
      titulo: `${plural(stockBajo.length, "material", "materiales")} con stock bajo`,
      detalle: stockBajo
        .slice(0, 3)
        .map((material) => material.nombre)
        .join(", "),
      href: "/inventario",
    },
    sinGrupo.length > 0 && {
      icono: UserRoundX,
      tono: "aviso",
      titulo: plural(sinGrupo.length, "alumno sin grupo", "alumnos sin grupo"),
      detalle: "Asígnalos a un grupo",
      href: "/alumnos",
    },
    prospectosNuevos.length > 0 && {
      icono: UserPlus,
      tono: "info",
      titulo: plural(prospectosNuevos.length, "prospecto nuevo", "prospectos nuevos"),
      detalle: "Sin contactar todavía",
      href: "/prospectos",
    },
  ];
  const pendientes = posibles.filter((item): item is Pendiente => Boolean(item));

  return (
    <AppLayout>
      <div className="px-4 py-5 md:px-8 md:py-6 lg:px-10">
        {/* ENCABEZADO */}
        <section className="mb-5">
          <h1 className="text-2xl font-black text-texto sm:text-3xl md:text-5xl">
            RESUMEN DEL DÍA
          </h1>
          <p className="mt-1 text-sm first-letter:uppercase text-texto-3 md:text-base">
            {ahora.fecha}
          </p>
        </section>

        {/* INDICADORES */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Indicador
            titulo="Alumnos activos"
            valor={`${alumnosActivos.length}`}
            detalle={`${alumnos.length} registrados`}
            href="/alumnos"
          />
          <Indicador
            titulo="Ocupación"
            valor={
              porcentajeOcupacion === null
                ? `${asignados.size}`
                : `${porcentajeOcupacion}%`
            }
            detalle={
              porcentajeOcupacion === null
                ? `alumnos en ${plural(gruposActivos.length, "grupo", "grupos")}`
                : `${enGruposConCupo} de ${cupoTotal} lugares`
            }
            href="/grupos"
            progreso={porcentajeOcupacion}
          />
          <Indicador
            titulo="Cobrado del mes"
            valor={moneda.format(cobrado)}
            detalle={
              porcentajeCobrado === null
                ? "Sin mensualidades este mes"
                : `${porcentajeCobrado}% de ${moneda.format(esperado)}`
            }
            href="/pagos"
            progreso={porcentajeCobrado}
          />
          <Indicador
            titulo="Prospectos"
            valor={`${enProceso.length}`}
            detalle={
              clasesDePrueba > 0
                ? `${clasesDePrueba} en clase de prueba`
                : "en proceso"
            }
            href="/prospectos"
          />
        </section>

        <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-5">
          {/* HOY EN LA CANCHA */}
          <div className="rounded-2xl border border-borde bg-superficie p-4 sm:p-6 xl:col-span-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black sm:text-xl">HOY EN LA CANCHA</h2>
              <Link
                href="/horario"
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-verde hover:text-verde-musgo"
              >
                <CalendarDays size={16} />
                Horario
              </Link>
            </div>

            {clasesHoy.length > 0 ? (
              <ul className="mt-2 divide-y divide-borde">
                {clasesHoy.map((clase) => (
                  <ClaseDeHoy key={clase.grupo.id} {...clase} fecha={ahora.iso} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-fondo p-4 text-sm text-texto-3">
                Hoy no hay clases programadas.
              </p>
            )}
          </div>

          {/* PENDIENTES */}
          <div className="rounded-2xl border border-borde bg-superficie p-4 sm:p-6 xl:col-span-2">
            <h2 className="text-lg font-black sm:text-xl">PENDIENTES</h2>

            {pendientes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {pendientes.map((pendiente) => (
                  <FilaPendiente key={pendiente.titulo} {...pendiente} />
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-lima-suave p-4 text-verde-oscuro">
                <CircleCheck size={20} className="shrink-0" />
                <p className="text-sm font-semibold">Todo al día.</p>
              </div>
            )}
          </div>
        </section>

        {/* OCUPACIÓN POR GRUPO */}
        <section className="mt-4 rounded-2xl border border-borde bg-superficie p-4 sm:mt-6 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black sm:text-xl">OCUPACIÓN POR GRUPO</h2>
            <Link
              href="/grupos"
              className="shrink-0 text-sm font-semibold text-verde hover:text-verde-musgo"
            >
              Ver grupos
            </Link>
          </div>

          {ocupacion.length > 0 ? (
            <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {ocupacion.map(({ grupo, alumnos: cantidad, cupo }) => (
                <BarraGrupo
                  key={grupo.id}
                  href={`/grupos/${grupo.id}`}
                  nombre={grupo.nombre}
                  cantidad={cantidad}
                  cupo={cupo}
                  maximo={maximoBarra}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-fondo p-4 text-sm text-texto-3">
              Todavía no hay grupos activos.
            </p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

/* ---------- Componentes ---------- */

function Indicador({
  titulo,
  valor,
  detalle,
  href,
  progreso,
}: {
  titulo: string;
  valor: string;
  detalle: string;
  href: string;
  progreso?: number | null;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-borde bg-superficie p-4 transition hover:border-[#cbd90a] sm:p-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-texto-suave sm:text-xs sm:tracking-[0.15em]">
        {titulo}
      </p>
      <p className="mt-1 truncate text-2xl font-black text-texto sm:mt-2 sm:text-4xl">
        {valor}
      </p>
      {typeof progreso === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hundido">
          <div
            className="h-full rounded-full bg-verde"
            style={{ width: `${Math.min(progreso, 100)}%` }}
          />
        </div>
      )}
      <p className="mt-1.5 text-xs text-texto-3 sm:text-sm">{detalle}</p>
    </Link>
  );
}

function ClaseDeHoy({
  grupo,
  estado,
  alumnos,
  marcados,
  fecha,
}: {
  grupo: { id: string; nombre: string; horaInicio: string; horaFin: string };
  estado: EstadoClase;
  alumnos: number;
  marcados: number;
  fecha: string;
}) {
  const listaCompleta = alumnos > 0 && marcados >= alumnos;

  return (
    <li className="flex items-center gap-3 py-4 sm:gap-4">
      <div className="w-14 shrink-0 sm:w-16">
        <p className="text-lg font-black leading-none sm:text-xl">
          {grupo.horaInicio}
        </p>
        <p className="mt-1 text-xs text-texto-suave">{grupo.horaFin}</p>
      </div>

      <div className="min-w-0 flex-1 border-l border-borde pl-3 sm:pl-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate font-bold">{grupo.nombre}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              estado === "en-curso"
                ? "bg-[#cbd90a] text-sobre-lima"
                : estado === "proxima"
                  ? "border border-borde text-texto-3"
                  : "bg-fondo text-texto-suave"
            }`}
          >
            {ETIQUETA_ESTADO[estado]}
          </span>
        </div>
        <p className="mt-1 text-sm text-texto-3">
          {plural(alumnos, "alumno", "alumnos")}
          {marcados > 0 && !listaCompleta && ` · ${marcados} marcados`}
        </p>
      </div>

      {listaCompleta ? (
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-verde">
          <CircleCheck size={16} />
          <span className="hidden sm:inline">Lista tomada</span>
        </span>
      ) : (
        <Link
          href={`/asistencia?grupo=${grupo.id}&fecha=${fecha}`}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            estado === "proxima"
              ? "border border-borde text-texto hover:bg-fondo"
              : "bg-boton text-sobre-boton hover:bg-boton-hover"
          }`}
        >
          <ClipboardCheck size={16} />
          Lista
        </Link>
      )}
    </li>
  );
}

type Pendiente = {
  icono: LucideIcon;
  tono: "alerta" | "aviso" | "info";
  titulo: string;
  detalle: string;
  href: string;
};

const COLOR_TONO: Record<Pendiente["tono"], string> = {
  alerta: "bg-peligro-suave text-peligro",
  aviso: "bg-lima-suave text-verde-oscuro",
  info: "bg-superficie text-texto-2",
};

function FilaPendiente({ icono: Icono, tono, titulo, detalle, href }: Pendiente) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl bg-fondo p-3 transition hover:bg-hundido"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${COLOR_TONO[tono]}`}
        >
          <Icono size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-texto">{titulo}</span>
          {detalle && (
            <span className="block truncate text-xs text-texto-3">{detalle}</span>
          )}
        </span>
        <ChevronRight size={16} className="shrink-0 text-texto-suave" />
      </Link>
    </li>
  );
}

function BarraGrupo({
  href,
  nombre,
  cantidad,
  cupo,
  maximo,
}: {
  href: string;
  nombre: string;
  cantidad: number;
  cupo: number | null;
  maximo: number;
}) {
  const lleno = cupo !== null && cupo > 0 && cantidad >= cupo;
  const proporcion = cupo ? cantidad / cupo : cantidad / maximo;

  return (
    <Link href={href} className="group block">
      <div className="mb-2 flex justify-between gap-4 text-sm">
        <span className="truncate font-semibold group-hover:text-verde">{nombre}</span>
        <span className={`shrink-0 ${lleno ? "font-bold text-peligro" : "text-texto-3"}`}>
          {cupo ? `${cantidad} / ${cupo}` : plural(cantidad, "alumno", "alumnos")}
          {lleno && " · lleno"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hundido">
        <div
          className={`h-full rounded-full ${lleno ? "bg-peligro" : "bg-verde"}`}
          style={{ width: `${Math.min(Math.round(proporcion * 100), 100)}%` }}
        />
      </div>
    </Link>
  );
}
