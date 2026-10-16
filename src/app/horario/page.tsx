
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  UsersRound,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { getGrupos, getInscripciones } from "@/lib/api";

const diasSemana = [
  { nombre: "Lunes", corto: "Lun" },
  { nombre: "Martes", corto: "Mar" },
  { nombre: "Miércoles", corto: "Mié" },
  { nombre: "Jueves", corto: "Jue" },
  { nombre: "Viernes", corto: "Vie" },
  { nombre: "Sábado", corto: "Sáb" },
  { nombre: "Domingo", corto: "Dom" },
];

export default async function HorarioPage() {
  const [grupos, inscripciones] = await Promise.all([
    getGrupos(),
    getInscripciones(),
  ]);

  const gruposActivos = grupos.filter(
    (grupo) => grupo.estado === "Activo"
  );

  const inscripcionesActivas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const cantidadAlumnos = (grupoId: string) => {
    const ids = inscripcionesActivas
      .filter((inscripcion) => inscripcion.grupo?.id === grupoId)
      .flatMap((inscripcion) =>
        inscripcion.alumnos.map((alumno) => alumno.id)
      );

    return new Set(ids).size;
  };

  const gruposPorDia = (dia: string) =>
    gruposActivos
      .filter((grupo) =>
        grupo.dias.split(" · ").includes(dia)
      )
      .sort((a, b) =>
        a.horaInicio.localeCompare(b.horaInicio)
      );

  const sesionesSemanales = gruposActivos.reduce(
    (total, grupo) =>
      total +
      grupo.dias.split(" · ").filter(Boolean).length,
    0
  );

  const hoy = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    timeZone: "America/Mexico_City",
  })
    .format(new Date())
    .toLowerCase();

  const diaActual = diasSemana.find(
    (dia) => dia.nombre.toLowerCase() === hoy
  )?.corto;

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* ENCABEZADO */}
        <section className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
              Organización
            </p>

            <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
              HORARIO SEMANAL
            </h1>

            <p className="mt-2 text-sm text-[#6f6964] md:text-base">
              Consulta los entrenamientos programados por grupo.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-[#e1dace] bg-white px-4 py-3 text-sm font-semibold text-[#32390d]">
            <CalendarDays size={18} />
            Semana habitual
          </div>
        </section>

        {/* INDICADORES */}
        <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e1dace] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c847d]">
              Grupos activos
            </p>
            <p className="mt-2 text-3xl font-black text-[#141113]">
              {gruposActivos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1dace] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c847d]">
              Sesiones semanales
            </p>
            <p className="mt-2 text-3xl font-black text-[#141113]">
              {sesionesSemanales}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl bg-[#32390d] p-5 text-white lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#d5de91]">
              Entrenamientos hoy
            </p>
            <p className="mt-2 text-3xl font-black">
              {diaActual
                ? gruposPorDia(diaActual).length
                : 0}
            </p>
          </div>
        </section>

        {/* TITULO DEL CALENDARIO */}
        <section className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7d9309]">
              Calendario
            </p>
            <h2 className="mt-1 text-xl font-black text-[#141113]">
              Distribución de entrenamientos
            </h2>
          </div>

          <span className="hidden text-xs text-[#8c847d] sm:block">
            Horarios registrados en Twenty
          </span>
        </section>

        {/* CALENDARIO DESKTOP */}
        <section className="hidden overflow-hidden rounded-2xl border border-[#e1dace] bg-white lg:block">
          <div className="grid grid-cols-7 divide-x divide-[#e1dace]">
            {diasSemana.map((dia) => {
              const sesiones = gruposPorDia(dia.corto);
              const esHoy = dia.corto === diaActual;

              return (
                <div key={dia.corto} className="min-w-0">
                  <div
                    className={`border-b border-[#e1dace] px-3 py-4 ${
                      esHoy
                        ? "bg-[#eaf0c5]"
                        : "bg-[#f6f4ee]"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8c847d]">
                      {dia.corto}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#141113]">
                      {dia.nombre}
                    </p>

                    {esHoy && (
                      <span className="mt-2 inline-block rounded-full bg-[#7d9309] px-2 py-1 text-[10px] font-bold text-white">
                        HOY
                      </span>
                    )}
                  </div>

                  <div className="min-h-[330px] space-y-3 p-2">
                    {sesiones.length === 0 ? (
                      <p className="pt-6 text-center text-xs text-[#aaa39c]">
                        Sin clases
                      </p>
                    ) : (
                      sesiones.map((grupo) => (
                        <Link
                          key={grupo.id}
                          href={`/grupos/${grupo.id}`}
                          className="block rounded-xl border border-[#dce5a8] bg-[#f2f5dc] p-3 transition hover:border-[#7d9309] hover:bg-[#eaf0c5]"
                        >
                          <div className="mb-3 h-1 w-8 rounded-full bg-[#7d9309]" />

                          <p className="break-words text-xs font-black leading-snug text-[#32390d]">
                            {grupo.nombre}
                          </p>

                          <div className="mt-3 flex items-start gap-1 text-[11px] text-[#5f6d14]">
                            <Clock3 size={12} className="mt-0.5 shrink-0" />
                            <span>
                              {grupo.horaInicio} - {grupo.horaFin}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#5f6d14]">
                            <UsersRound size={12} />
                            {cantidadAlumnos(grupo.id)} alumnos
                          </div>

                          <div className="mt-3 flex justify-end">
                            <ArrowUpRight size={15} className="text-[#7d9309]" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CALENDARIO TABLET Y MÓVIL */}
        <section className="grid gap-4 sm:grid-cols-2 lg:hidden">
          {diasSemana.map((dia) => {
            const sesiones = gruposPorDia(dia.corto);
            const esHoy = dia.corto === diaActual;

            return (
              <div
                key={dia.corto}
                className={`overflow-hidden rounded-2xl border ${
                  esHoy
                    ? "border-[#98ad09]"
                    : "border-[#e1dace]"
                } bg-white`}
              >
                <div
                  className={`flex items-center justify-between border-b border-[#e1dace] px-4 py-4 ${
                    esHoy ? "bg-[#eaf0c5]" : "bg-[#f6f4ee]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#32390d] text-xs font-black text-[#eef310]">
                      {dia.corto}
                    </div>

                    <div>
                      <h3 className="font-black text-[#141113]">
                        {dia.nombre}
                      </h3>
                      <p className="text-xs text-[#8c847d]">
                        {sesiones.length}{" "}
                        {sesiones.length === 1
                          ? "entrenamiento"
                          : "entrenamientos"}
                      </p>
                    </div>
                  </div>

                  {esHoy && (
                    <span className="rounded-full bg-[#7d9309] px-3 py-1 text-xs font-bold text-white">
                      HOY
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  {sesiones.length === 0 ? (
                    <p className="py-4 text-center text-sm text-[#8c847d]">
                      No hay entrenamientos programados.
                    </p>
                  ) : (
                    sesiones.map((grupo) => (
                      <Link
                        key={grupo.id}
                        href={`/grupos/${grupo.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#e1dace] p-4 transition hover:border-[#98ad09] hover:bg-[#f9faef]"
                      >
                        <div>
                          <p className="font-bold text-[#141113]">
                            {grupo.nombre}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#6f6964]">
                            <span className="flex items-center gap-1">
                              <Clock3 size={14} />
                              {grupo.horaInicio} - {grupo.horaFin}
                            </span>

                            <span className="flex items-center gap-1">
                              <UsersRound size={14} />
                              {cantidadAlumnos(grupo.id)} alumnos
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          size={18}
                          className="shrink-0 text-[#7d9309]"
                        />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* NOTA INFERIOR */}
        <section className="mt-6 rounded-2xl border border-[#e1dace] bg-white p-5">
          <div className="flex items-start gap-3">
            <CalendarDays
              size={20}
              className="mt-0.5 shrink-0 text-[#7d9309]"
            />

            <div>
              <p className="font-bold text-[#141113]">
                Horario recurrente
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#6f6964]">
                Este calendario representa los días y horarios
                habituales de cada grupo. Los cambios de horario
                se gestionarán desde el módulo de Grupos.
              </p>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
