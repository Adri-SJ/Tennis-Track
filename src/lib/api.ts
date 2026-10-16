import type {
  Alumno,
  Grupo,
  Inscripcion,
} from "@/lib/types";

const TWENTY_API_URL = process.env.TWENTY_API_URL;
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!TWENTY_API_URL) {
  throw new Error("Falta TWENTY_API_URL en .env.local");
}

if (!TWENTY_API_KEY) {
  throw new Error("Falta TWENTY_API_KEY en .env.local");
}

/* =========================================================
   TIPOS INTERNOS DE TWENTY
========================================================= */

type TwentyPerson = {
  id: string;

  name: {
    firstName: string;
    lastName: string;
  };

  fechaDeNacimiento: string | null;
  edad: number | null;
  estatura: number | null;

  manoHabil:
    | "DERECHA"
    | "IZQUIERDA"
    | null;

  estado: string | null;
};

type TwentyGrupo = {
  id: string;
  name: string;

  diasDeEntrenamiento: string[];

  estado: string | null;

  horaDeInicio: string | null;
  horaDeFin: string | null;
};

/*
  Twenty puede devolver las relaciones expandidas como:
  - un arreglo
  - un solo objeto
  - null / undefined

  Por eso no asumimos directamente que alumno y grupo
  siempre serán arreglos.
*/
type TwentyInscripcion = {
  id: string;
  name: string;

  fechaDeInicio: string | null;
  fechaDeFin: string | null;

  estado: string | null;

  alumno?:
    | TwentyPerson[]
    | TwentyPerson
    | null;

  grupo?:
    | TwentyGrupo[]
    | TwentyGrupo
    | null;
};

type TwentyPeopleResponse = {
  data: {
    people: TwentyPerson[];
  };

  totalCount: number;
};

type TwentyGruposResponse = {
  data: {
    grupos: TwentyGrupo[];
  };

  totalCount: number;
};

type TwentyInscripcionesResponse = {
  data: {
    inscripciones: TwentyInscripcion[];
  };

  totalCount: number;
};

/* =========================================================
   FETCH GENERAL
========================================================= */

async function twentyFetch<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${TWENTY_API_URL}/rest/${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${TWENTY_API_KEY}`,
        "Content-Type": "application/json",
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Error en Twenty API (${response.status}): ${error}`
    );
  }

  return response.json();
}

/* =========================================================
   NORMALIZACIÓN DE RELACIONES
========================================================= */

function normalizarRelacion<T>(
  relacion: T | T[] | null | undefined
): T[] {
  if (!relacion) {
    return [];
  }

  if (Array.isArray(relacion)) {
    return relacion;
  }

  return [relacion];
}

/* =========================================================
   ADAPTADORES
========================================================= */

function adaptarAlumno(
  person: TwentyPerson
): Alumno {
  const nombre = [
    person.name?.firstName,
    person.name?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: person.id,

    nombre,

    edad: person.edad ?? null,

    estatura: person.estatura ?? null,

    manoHabil:
      person.manoHabil === "DERECHA"
        ? "Derecha"
        : person.manoHabil === "IZQUIERDA"
          ? "Izquierda"
          : null,

    fechaDeNacimiento:
      person.fechaDeNacimiento ?? null,

    estado:
      person.estado === "INACTIVO"
        ? "Inactivo"
        : "Activo",
  };
}

function adaptarDias(
  dias: string[]
): string {
  const nombres: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIERCOLES: "Mié",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sáb",
    DOMINGO: "Dom",
  };

  return dias
    .map((dia) => nombres[dia] ?? dia)
    .join(" · ");
}

function adaptarGrupo(
  grupo: TwentyGrupo
): Grupo {
  return {
    id: grupo.id,

    nombre: grupo.name,

    dias: adaptarDias(
      grupo.diasDeEntrenamiento ?? []
    ),

    horaInicio:
      grupo.horaDeInicio ?? "—",

    horaFin:
      grupo.horaDeFin ?? "—",

    estado:
      grupo.estado === "INACTIVO"
        ? "Inactivo"
        : "Activo",
  };
}

function adaptarInscripcion(
  inscripcion: TwentyInscripcion
): Inscripcion {
  const alumnosTwenty =
    normalizarRelacion(inscripcion.alumno);

  const gruposTwenty =
    normalizarRelacion(inscripcion.grupo);

  return {
    id: inscripcion.id,

    nombre: inscripcion.name,

    fechaInicio:
      inscripcion.fechaDeInicio ?? "—",

    fechaFin:
      inscripcion.fechaDeFin ?? null,

    estado:
      inscripcion.estado === "INACTIVO"
        ? "Inactiva"
        : "Activa",

    alumnos:
      alumnosTwenty.map(adaptarAlumno),

    grupo:
      gruposTwenty.length > 0
        ? adaptarGrupo(gruposTwenty[0])
        : null,
  };
}

/* =========================================================
   ALUMNOS
========================================================= */

export async function getAlumnos(): Promise<
  Alumno[]
> {
  const result =
    await twentyFetch<TwentyPeopleResponse>(
      "people"
    );

  return result.data.people.map(
    adaptarAlumno
  );
}

export async function getAlumnoById(
  id: string
): Promise<Alumno | null> {
  const alumnos = await getAlumnos();

  return (
    alumnos.find(
      (alumno) => alumno.id === id
    ) ?? null
  );
}

/* =========================================================
   GRUPOS
========================================================= */

export async function getGrupos(): Promise<
  Grupo[]
> {
  const result =
    await twentyFetch<TwentyGruposResponse>(
      "grupos"
    );

  return result.data.grupos.map(
    adaptarGrupo
  );
}

export async function getGrupoById(
  id: string
): Promise<Grupo | null> {
  const grupos = await getGrupos();

  return (
    grupos.find(
      (grupo) => grupo.id === id
    ) ?? null
  );
}

/* =========================================================
   INSCRIPCIONES
========================================================= */

export async function getInscripciones(): Promise<
  Inscripcion[]
> {
  const result =
    await twentyFetch<TwentyInscripcionesResponse>(
      "inscripciones?depth=1"
    );

  return result.data.inscripciones.map(
    adaptarInscripcion
  );
}

export async function getInscripcionById(
  id: string
): Promise<Inscripcion | null> {
  const inscripciones =
    await getInscripciones();

  return (
    inscripciones.find(
      (inscripcion) =>
        inscripcion.id === id
    ) ?? null
  );
}

/* =========================================================
   RELACIONES
========================================================= */

export async function getInscripcionActivaDeAlumno(
  alumnoId: string
): Promise<Inscripcion | null> {
  const inscripciones =
    await getInscripciones();

  return (
    inscripciones.find(
      (inscripcion) =>
        inscripcion.estado === "Activa" &&
        inscripcion.alumnos.some(
          (alumno) =>
            alumno.id === alumnoId
        )
    ) ?? null
  );
}

export async function getGrupoDeAlumno(
  alumnoId: string
): Promise<Grupo | null> {
  const inscripcion =
    await getInscripcionActivaDeAlumno(
      alumnoId
    );

  return inscripcion?.grupo ?? null;
}

export async function getAlumnosDeGrupo(
  grupoId: string
): Promise<Alumno[]> {
  const inscripciones =
    await getInscripciones();

  return inscripciones
    .filter(
      (inscripcion) =>
        inscripcion.estado === "Activa" &&
        inscripcion.grupo?.id === grupoId
    )
    .flatMap(
      (inscripcion) =>
        inscripcion.alumnos
    );
}

export async function getCantidadAlumnosDeGrupo(
  grupoId: string
): Promise<number> {
  const alumnos =
    await getAlumnosDeGrupo(grupoId);

  return alumnos.length;
}