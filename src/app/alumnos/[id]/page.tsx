import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  ArrowLeft,
  Ruler,
  Hand,
  UsersRound,
  CalendarDays,
  UserRound,
  Pencil,
  ArrowLeftRight,
  Plus,
  History,
} from "lucide-react";

import {
  getAlumnoById,
  getGrupoDeAlumno,
  getInscripcionActivaDeAlumno,
  getInscripcionesDeAlumno,
} from "@/lib/api";

export default async function AlumnoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const alumno = await getAlumnoById(id);

  if (!alumno) {
    return (
      <AppLayout>
        <div className="px-5 py-6 md:px-8 lg:px-10">
          <Link
            href="/alumnos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
          >
            <ArrowLeft size={18} />
            Volver a alumnos
          </Link>

          <p className="mt-6 font-semibold text-[#141113]">
            Alumno no encontrado.
          </p>
        </div>
      </AppLayout>
    );
  }

  const [grupo, inscripcion, historial] = await Promise.all([
    getGrupoDeAlumno(alumno.id),
    getInscripcionActivaDeAlumno(alumno.id),
    getInscripcionesDeAlumno(alumno.id),
  ]);

  const iniciales = alumno.nombre
    .split(" ")
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2);

  const edad =
    alumno.edad !== null
      ? `${alumno.edad} años`
      : "No registrada";

  const estatura =
    alumno.estatura !== null
      ? `${alumno.estatura} cm`
      : "No registrada";

  const manoHabil =
    alumno.manoHabil ?? "No registrada";

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* VOLVER */}
        <Link
          href="/alumnos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309] transition hover:text-[#5f6d14]"
        >
          <ArrowLeft size={18} />
          Volver a alumnos
        </Link>

        {/* PERFIL */}
        <section className="rounded-2xl border border-[#e1dace] bg-white p-5 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#cbd90a] text-xl font-black text-[#32390d] md:h-20 md:w-20 md:text-2xl">
                {iniciales}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
                  Alumno
                </p>

                <h1 className="mt-1 text-2xl font-black text-[#141113] md:text-4xl">
                  {alumno.nombre}
                </h1>

                <p className="mt-1 text-sm text-[#6f6964]">
                  {grupo?.nombre ?? "Sin grupo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full border border-[#98ad09] px-4 py-2 text-xs font-bold text-[#7d9309]">
                {alumno.estado}
              </span>

              <Link
                href={`/alumnos/${alumno.id}/editar`}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e1dace] px-4 py-2 text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
              >
                <Pencil size={16} />
                Editar
              </Link>
            </div>

          </div>
        </section>

        {/* DATOS RÁPIDOS */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <InfoCard
            icon={<UserRound size={19} />}
            label="Edad"
            value={edad}
          />

          <InfoCard
            icon={<Ruler size={19} />}
            label="Estatura"
            value={estatura}
          />

          <InfoCard
            icon={<Hand size={19} />}
            label="Mano hábil"
            value={manoHabil}
          />

          <InfoCard
            icon={<UsersRound size={19} />}
            label="Grupo"
            value={grupo?.nombre ?? "Sin grupo"}
          />

        </section>

        {/* INFORMACIÓN */}
        <section className="mt-5 grid gap-5 xl:grid-cols-2">

          {/* INFORMACIÓN GENERAL */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
            <h2 className="text-lg font-black text-[#141113]">
              INFORMACIÓN GENERAL
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Nombre"
                value={alumno.nombre}
              />

              <InfoRow
                label="Edad"
                value={edad}
              />

              <InfoRow
                label="Estatura"
                value={estatura}
              />

              <InfoRow
                label="Mano hábil"
                value={manoHabil}
              />

              <InfoRow
                label="Estado"
                value={alumno.estado}
              />
            </div>
          </div>

          {/* INSCRIPCIÓN */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CalendarDays
                size={20}
                className="text-[#7d9309]"
              />

              <h2 className="text-lg font-black text-[#141113]">
                INSCRIPCIÓN ACTUAL
              </h2>
            </div>

            {inscripcion && grupo ? (
              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Grupo"
                  value={grupo.nombre}
                />

                <InfoRow
                  label="Fecha de inicio"
                  value={inscripcion.fechaInicio}
                />

                <InfoRow
                  label="Fecha de fin"
                  value={inscripcion.fechaFin ?? "—"}
                />

                <InfoRow
                  label="Estado"
                  value={inscripcion.estado}
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/grupos/${grupo.id}`}
                    className="inline-flex rounded-xl bg-[#141113] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d]"
                  >
                    Ver grupo
                  </Link>

                  <Link
                    href={`/alumnos/${alumno.id}/cambiar-grupo`}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e1dace] px-4 py-3 text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
                  >
                    <ArrowLeftRight size={16} />
                    Cambiar de grupo
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f6f4ee] p-4">
                <p className="text-sm font-semibold text-[#141113]">
                  Sin inscripción activa
                </p>

                <p className="mt-1 text-sm text-[#8c847d]">
                  Este alumno no está asignado actualmente a ningún grupo.
                </p>

                <Link
                  href={`/inscripciones/nueva?alumno=${alumno.id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#141113] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#32390d]"
                >
                  <Plus size={16} />
                  Inscribir a un grupo
                </Link>
              </div>
            )}
          </div>

        </section>

        {/* HISTORIAL */}
        <section className="mt-5 rounded-2xl border border-[#e1dace] bg-white p-5 md:p-6">
          <div className="flex items-center gap-2">
            <History
              size={20}
              className="text-[#7d9309]"
            />

            <h2 className="text-lg font-black text-[#141113]">
              HISTORIAL DE GRUPOS
            </h2>
          </div>

          {historial.length > 0 ? (
            <ul className="mt-5 divide-y divide-[#e1dace]">
              {historial.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/inscripciones/${item.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition hover:text-[#7d9309]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#141113]">
                        {item.grupo?.nombre ?? "Sin grupo"}
                      </p>

                      <p className="text-xs text-[#8c847d]">
                        {item.fechaInicio} → {item.fechaFin ?? "actual"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.estado === "Activa"
                          ? "bg-[#eef3c4] text-[#5f6d14]"
                          : "bg-[#f6f4ee] text-[#8c847d]"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-[#8c847d]">
              Todavía no tiene inscripciones.
            </p>
          )}
        </section>

      </div>
    </AppLayout>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e1dace] bg-white p-4 md:p-5">
      <div className="flex items-center gap-2 text-[#7d9309]">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-3 font-black text-[#141113] md:text-lg">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#e1dace] pb-3">
      <span className="text-sm text-[#6f6964]">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-[#141113]">
        {value}
      </span>
    </div>
  );
}