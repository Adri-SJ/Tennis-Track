import AppLayout from "@/components/AppLayout";
import Link from "next/link";

import {
  getAlumnos,
  getGrupos,
  getInscripciones,
} from "@/lib/api";

export default async function Home() {
  const [alumnos, grupos, inscripciones] = await Promise.all([
    getAlumnos(),
    getGrupos(),
    getInscripciones(),
  ]);

  /* =========================================================
     MÉTRICAS
  ========================================================= */

  const alumnosActivos = alumnos.filter(
    (alumno) => alumno.estado === "Activo"
  );

  const gruposActivos = grupos.filter(
    (grupo) => grupo.estado === "Activo"
  );

  const inscripcionesActivas = inscripciones.filter(
    (inscripcion) => inscripcion.estado === "Activa"
  );

  const idsAlumnosAsignados = new Set(
    inscripcionesActivas.flatMap((inscripcion) =>
      inscripcion.alumnos.map((alumno) => alumno.id)
    )
  );

  const alumnosSinGrupo = alumnos.filter(
    (alumno) => !idsAlumnosAsignados.has(alumno.id)
  );

  /* =========================================================
     ALUMNOS POR GRUPO
  ========================================================= */

  const alumnosPorGrupo = grupos.map((grupo) => {
    const cantidad = inscripcionesActivas
      .filter(
        (inscripcion) =>
          inscripcion.grupo?.id === grupo.id
      )
      .reduce(
        (total, inscripcion) =>
          total + inscripcion.alumnos.length,
        0
      );

    return {
      grupo,
      cantidad,
    };
  });

  const maxAlumnosGrupo = Math.max(
    ...alumnosPorGrupo.map((item) => item.cantidad),
    alumnosSinGrupo.length,
    1
  );

  /* =========================================================
     MANO HÁBIL
  ========================================================= */

  const derechos = alumnos.filter(
    (alumno) => alumno.manoHabil === "Derecha"
  ).length;

  const izquierdos = alumnos.filter(
    (alumno) => alumno.manoHabil === "Izquierda"
  ).length;

  const conManoRegistrada = derechos + izquierdos;

  const porcentajeDerecha =
    conManoRegistrada > 0
      ? Math.round(
          (derechos / conManoRegistrada) * 100
        )
      : 0;

  const porcentajeIzquierda =
    conManoRegistrada > 0
      ? Math.round(
          (izquierdos / conManoRegistrada) * 100
        )
      : 0;

  /* =========================================================
     ENTRENAMIENTOS DE HOY
  ========================================================= */

  const dias = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];

  const nombresDias = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
  ];

  const hoy = new Date();

  const diaActual = dias[hoy.getDay()];
  const nombreDiaActual = nombresDias[hoy.getDay()];

  /*
    El tipo Grupo actualmente guarda "dias" ya formateado
    para la interfaz: Lun · Mar · Mié...

    Convertimos el día actual a esa misma abreviatura.
  */

  const abreviaturas: Record<string, string> = {
    DOMINGO: "Dom",
    LUNES: "Lun",
    MARTES: "Mar",
    MIERCOLES: "Mié",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sáb",
  };

  const gruposHoy = gruposActivos.filter((grupo) =>
    grupo.dias
      .split(" · ")
      .includes(abreviaturas[diaActual])
  );

  function cantidadAlumnosGrupo(grupoId: string) {
    return inscripcionesActivas
      .filter(
        (inscripcion) =>
          inscripcion.grupo?.id === grupoId
      )
      .reduce(
        (total, inscripcion) =>
          total + inscripcion.alumnos.length,
        0
      );
  }

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* HEADER */}
        <section className="mb-6 border-b border-[#e1dace] pb-5">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
                TennisTrack
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
                RESUMEN DEL DÍA
              </h1>

              <p className="mt-2 max-w-xl text-sm text-[#6f6964] md:text-base">
                Todo lo que pasa hoy en la academia, en una sola pantalla.
              </p>
            </div>

          </div>

          <div className="mt-4 flex items-center justify-between md:justify-end md:gap-4">

            <div className="rounded-full border border-[#e1dace] bg-white px-3 py-2 text-xs font-semibold md:text-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#98ad09]" />
              Datos en vivo
            </div>

          </div>
        </section>

        {/* MÉTRICAS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Alumnos activos"
            value={`${alumnosActivos.length}`}
            subtitle={`${alumnos.length} registrados en la academia`}
          />

          <MetricCard
            title="Grupos activos"
            value={`${gruposActivos.length}`}
            subtitle={`${grupos.length} grupos en total`}
          />

          <MetricCard
            title="Inscripciones activas"
            value={`${inscripcionesActivas.length}`}
            subtitle={`${inscripciones.length} registros en Twenty`}
          />

          <MetricCard
            title="Alumnos sin grupo"
            value={`${alumnosSinGrupo.length}`}
            subtitle={
              alumnosSinGrupo.length === 0
                ? "Todos tienen grupo asignado"
                : "Requieren asignación"
            }
          />

        </section>

        {/* INFORMACIÓN SECUNDARIA */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* ALUMNOS POR GRUPO */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-6">

            <h2 className="text-xl font-black">
              ALUMNOS POR GRUPO
            </h2>

            <div className="mt-6 space-y-5">

              {alumnosPorGrupo.map(({ grupo, cantidad }) => (
                <ProgressRow
                  key={grupo.id}
                  label={grupo.nombre}
                  value={`${cantidad} ${
                    cantidad === 1
                      ? "alumno"
                      : "alumnos"
                  }`}
                  width={`${Math.round(
                    (cantidad / maxAlumnosGrupo) * 100
                  )}%`}
                />
              ))}

              {alumnosSinGrupo.length > 0 && (
                <ProgressRow
                  label="Sin asignar"
                  value={`${alumnosSinGrupo.length} ${
                    alumnosSinGrupo.length === 1
                      ? "alumno"
                      : "alumnos"
                  }`}
                  width={`${Math.round(
                    (alumnosSinGrupo.length /
                      maxAlumnosGrupo) *
                      100
                  )}%`}
                />
              )}

            </div>
          </div>

          {/* MANO HÁBIL */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-6">

            <h2 className="text-xl font-black">
              MANO HÁBIL
            </h2>

            <div className="mt-6 space-y-5">

              <ProgressRow
                label="Derecha"
                value={`${derechos} alumnos · ${porcentajeDerecha}%`}
                width={`${porcentajeDerecha}%`}
              />

              <ProgressRow
                label="Izquierda"
                value={`${izquierdos} alumnos · ${porcentajeIzquierda}%`}
                width={`${porcentajeIzquierda}%`}
              />

            </div>

          </div>

        </section>

        {/* HOY */}
        <section className="mt-6 rounded-2xl border border-[#e1dace] bg-white p-6">

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-xl font-black">
              HOY EN LA CANCHA · {nombreDiaActual}
            </h2>

            <Link
              href="/horario"
              className="shrink-0 font-semibold text-[#7d9309] hover:text-[#5f6d14]"
            >
              Ver horario →
            </Link>

          </div>

          {gruposHoy.length > 0 ? (
            <div className="mt-5 divide-y divide-[#e1dace]">

              {gruposHoy.map((grupo) => (
                <TrainingRow
                  key={grupo.id}
                  time={`${grupo.horaInicio} – ${grupo.horaFin}`}
                  group={grupo.nombre}
                  students={`${cantidadAlumnosGrupo(
                    grupo.id
                  )} alumnos`}
                />
              ))}

            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-[#f6f4ee] p-4">

              <p className="text-sm font-semibold text-[#141113]">
                No hay entrenamientos programados hoy.
              </p>

              <p className="mt-1 text-sm text-[#8c847d]">
                No encontramos grupos activos que entrenen este día.
              </p>

            </div>
          )}

        </section>

      </div>
    </AppLayout>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e1dace] bg-white p-6">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c847d]">
        {title}
      </p>

      <p className="mt-2 text-5xl font-black text-[#141113]">
        {value}
      </p>

      <p className="mt-2 text-sm text-[#6f6964]">
        {subtitle}
      </p>

    </div>
  );
}

function ProgressRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between gap-4 text-sm">

        <span className="font-medium">
          {label}
        </span>

        <span className="text-right text-[#6f6964]">
          {value}
        </span>

      </div>

      <div className="h-2 rounded-full bg-[#ede9dc]">

        <div
          className="h-2 rounded-full bg-[#7d9309]"
          style={{ width }}
        />

      </div>

    </div>
  );
}

function TrainingRow({
  time,
  group,
  students,
}: {
  time: string;
  group: string;
  students: string;
}) {
  return (
    <div className="py-5">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xl font-black">
            {time}
          </p>

          <p className="mt-1 font-semibold">
            {group}
          </p>

          <p className="mt-1 text-sm text-[#6f6964]">
            {students}
          </p>
        </div>

        <span className="rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-[#7d9309]">
          ACTIVO
        </span>

      </div>

    </div>
  );
}