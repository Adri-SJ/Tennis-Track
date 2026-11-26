import Link from "next/link";

export type Pestana = { nombre: string; href: string };

/* Vistas hermanas de una misma sección (p. ej. Lista / Horario). */
export default function Pestanas({
  pestanas,
  activa,
}: {
  pestanas: Pestana[];
  activa: string;
}) {
  if (pestanas.length < 2) return null;

  return (
    <nav
      aria-label="Vistas de la sección"
      className="mb-5 inline-flex rounded-xl border border-borde bg-superficie p-1"
    >
      {pestanas.map((pestana) => {
        const esActiva = pestana.href === activa;

        return (
          <Link
            key={pestana.href}
            href={pestana.href}
            aria-current={esActiva ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              esActiva
                ? "bg-boton text-sobre-boton"
                : "text-texto-3 hover:text-texto"
            }`}
          >
            {pestana.nombre}
          </Link>
        );
      })}
    </nav>
  );
}

export const PESTANAS_GRUPOS: Pestana[] = [
  { nombre: "Lista", href: "/grupos" },
  { nombre: "Horario", href: "/horario" },
];

export const PESTANAS_ALUMNOS: Pestana[] = [
  { nombre: "Alumnos", href: "/alumnos" },
  { nombre: "Inscripciones", href: "/inscripciones" },
];
