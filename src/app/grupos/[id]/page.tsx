import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Users,
  ArrowRight,
  Pencil,
  Plus,
} from "lucide-react";

import {
  getGrupoById,
  getAlumnosDeGrupo,
} from "@/lib/api";

export default async function GrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [grupo, alumnosDelGrupo] = await Promise.all([
    getGrupoById(id),
    getAlumnosDeGrupo(id),
  ]);

  if (!grupo) {
    return (
      <AppLayout>
        <div className="px-5 py-6 md:px-8 lg:px-10">

          <Link
            href="/grupos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309]"
          >
            <ArrowLeft size={18} />
            Volver a grupos
          </Link>

          <p className="mt-6 font-semibold text-[#141113]">
            Grupo no encontrado.
          </p>

        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-5 py-6 md:px-8 lg:px-10">

        {/* VOLVER */}
        <Link
          href="/grupos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7d9309] transition hover:text-[#5f6d14]"
        >
          <ArrowLeft size={18} />
          Volver a grupos
        </Link>

        {/* CABECERA */}
        <section className="rounded-2xl border border-[#e1dace] bg-white p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d9309]">
                Grupo
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#141113] md:text-5xl">
                {grupo.nombre}
              </h1>

              <p className="mt-2 text-sm text-[#6f6964] md:text-base">
                Información general y alumnos inscritos en el grupo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="w-fit rounded-full border border-[#98ad09] px-4 py-2 text-xs font-bold text-[#7d9309]">
                {grupo.estado}
              </span>

              <Link
                href={`/grupos/${grupo.id}/editar`}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e1dace] px-4 py-2 text-sm font-semibold text-[#141113] transition hover:bg-[#f6f4ee]"
              >
                <Pencil size={16} />
                Editar
              </Link>

              <Link
                href={`/inscripciones/nueva?grupo=${grupo.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#141113] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#32390d]"
              >
                <Plus size={16} />
                Inscribir alumno
              </Link>
            </div>

          </div>

        </section>

        {/* MÉTRICAS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <InfoCard
            icon={<Users size={20} />}
            label="Alumnos inscritos"
            value={
              grupo.capacidadMaxima !== null
                ? `${alumnosDelGrupo.length} / ${grupo.capacidadMaxima}`
                : `${alumnosDelGrupo.length}`
            }
          />

          <InfoCard
            icon={<CalendarDays size={20} />}
            label="Días de entrenamiento"
            value={grupo.dias}
          />

          <InfoCard
            icon={<Clock3 size={20} />}
            label="Horario"
            value={`${grupo.horaInicio} – ${grupo.horaFin}`}
          />

        </section>

        {/* CONTENIDO */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_2fr]">

          {/* INFORMACIÓN DEL GRUPO */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-6">

            <h2 className="text-xl font-black text-[#141113]">
              INFORMACIÓN DEL GRUPO
            </h2>

            <div className="mt-5 space-y-4">

              <InfoRow
                label="Nombre"
                value={grupo.nombre}
              />

              <InfoRow
                label="Días"
                value={grupo.dias}
              />

              <InfoRow
                label="Hora de inicio"
                value={grupo.horaInicio}
              />

              <InfoRow
                label="Hora de fin"
                value={grupo.horaFin}
              />

              <InfoRow
                label="Nivel"
                value={grupo.nivel ?? "Sin definir"}
              />


              <InfoRow
                label="Capacidad máxima"
                value={
                  grupo.capacidadMaxima !== null
                    ? `${grupo.capacidadMaxima} alumnos`
                    : "Sin límite"
                }
              />


              <InfoRow
                label="Estado"
                value={grupo.estado}
              />

            </div>

          </div>

          {/* ALUMNOS INSCRITOS */}
          <div className="rounded-2xl border border-[#e1dace] bg-white p-6">

            <div>
              <h2 className="text-xl font-black text-[#141113]">
                ALUMNOS INSCRITOS
              </h2>

              <p className="mt-1 text-sm text-[#6f6964]">
                {alumnosDelGrupo.length} alumnos actualmente en este grupo.
              </p>
            </div>

            {alumnosDelGrupo.length > 0 ? (
              <div className="mt-5 divide-y divide-[#e1dace]">

                {alumnosDelGrupo.map((alumno) => (
                  <Link
                    key={alumno.id}
                    href={`/alumnos/${alumno.id}`}
                    className="group flex items-center justify-between gap-4 py-4 transition hover:bg-[#fbfaf7]"
                  >

                    <div className="flex items-center gap-3">

                      {/* AVATAR */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#cbd90a] font-black text-[#32390d]">
                        {alumno.nombre
                          .split(" ")
                          .map((parte) => parte[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      {/* DATOS */}
                      <div>
                        <p className="font-semibold text-[#141113]">
                          {alumno.nombre}
                        </p>

                        <p className="text-sm text-[#6f6964]">
                          {alumno.edad !== null
                            ? `${alumno.edad} años`
                            : "Edad no registrada"}
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <span className="hidden rounded-full border border-[#98ad09] px-3 py-1 text-xs font-bold text-[#7d9309] sm:block">
                        {alumno.estado}
                      </span>

                      <ArrowRight
                        size={18}
                        className="text-[#8c847d] transition group-hover:translate-x-1 group-hover:text-[#7d9309]"
                      />

                    </div>

                  </Link>
                ))}

              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f6f4ee] p-4">

                <p className="text-sm font-semibold text-[#141113]">
                  Sin alumnos inscritos
                </p>

                <p className="mt-1 text-sm text-[#8c847d]">
                  Este grupo todavía no tiene inscripciones activas.
                </p>

              </div>
            )}

          </div>

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
    <div className="rounded-2xl border border-[#e1dace] bg-white p-5">

      <div className="flex items-center gap-2 text-[#7d9309]">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.15em]">
          {label}
        </p>
      </div>

      <p className="mt-3 text-lg font-black text-[#141113]">
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
    <div className="flex items-start justify-between gap-6 border-b border-[#e1dace] pb-3">

      <span className="text-sm text-[#6f6964]">
        {label}
      </span>

      <span className="text-right font-semibold text-[#141113]">
        {value}
      </span>

    </div>
  );
}