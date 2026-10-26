import type {
  Alumno,
  DiaEntrenamiento,
  Grupo,
  Inscripcion,
  NivelGrupo,
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

  nivel:
    | "PRINCIPIANTE"
    | "INTERMEDIO"
    | "AVANZADO"
    | null;

  capacidadMaxima: number | null;
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
  endpoint: string,
  init: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
  } = {}
): Promise<T> {
  const response = await fetch(
    `${TWENTY_API_URL}/rest/${endpoint}`,
    {
      method: init.method ?? "GET",

      headers: {
        Authorization: `Bearer ${TWENTY_API_KEY}`,
        "Content-Type": "application/json",
      },

      body:
        init.body === undefined
          ? undefined
          : JSON.stringify(init.body),

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

    nombres: person.name?.firstName ?? "",

    apellidos: person.name?.lastName ?? "",

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
      person.estado === "BAJA"
        ? "Inactivo"
        : "Activo",
  };
}

const DIAS_DE_ENTRENAMIENTO: DiaEntrenamiento[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const NIVELES: Record<
  NonNullable<TwentyGrupo["nivel"]>,
  NivelGrupo
> = {
  PRINCIPIANTE: "Principiante",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

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

    diasDeEntrenamiento: (
      grupo.diasDeEntrenamiento ?? []
    ).filter((dia): dia is DiaEntrenamiento =>
      DIAS_DE_ENTRENAMIENTO.includes(
        dia as DiaEntrenamiento
      )
    ),

    horaInicio:
      grupo.horaDeInicio || "—",

    horaFin:
      grupo.horaDeFin || "—",

    nivel: grupo.nivel
      ? NIVELES[grupo.nivel]
      : null,

    capacidadMaxima:
      grupo.capacidadMaxima ?? null,

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

export type NuevoAlumno = {
  nombres: string;
  apellidos: string;
  edad: number;
  estatura: number;
  manoHabil: "Derecha" | "Izquierda";
  estado: "Activo" | "Inactivo";
};

type TwentyCreatePersonResponse = {
  data: {
    createPerson: TwentyPerson;
  };
};

type TwentyUpdatePersonResponse = {
  data: {
    updatePerson: TwentyPerson;
  };
};

function cuerpoAlumno(alumno: NuevoAlumno) {
  return {
    name: {
      firstName: alumno.nombres,
      lastName: alumno.apellidos,
    },

    edad: alumno.edad,

    estatura: alumno.estatura,

    manoHabil:
      alumno.manoHabil === "Izquierda"
        ? "IZQUIERDA"
        : "DERECHA",

    estado:
      alumno.estado === "Inactivo"
        ? "BAJA"
        : "ACTIVO",
  };
}

export async function createAlumno(
  alumno: NuevoAlumno
): Promise<Alumno> {
  const result =
    await twentyFetch<TwentyCreatePersonResponse>(
      "people",
      {
        method: "POST",
        body: cuerpoAlumno(alumno),
      }
    );

  return adaptarAlumno(
    result.data.createPerson
  );
}

export async function updateAlumno(
  id: string,
  alumno: NuevoAlumno
): Promise<Alumno> {
  const result =
    await twentyFetch<TwentyUpdatePersonResponse>(
      `people/${id}`,
      {
        method: "PATCH",
        body: cuerpoAlumno(alumno),
      }
    );

  return adaptarAlumno(
    result.data.updatePerson
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

export type NuevoGrupo = {
  nombre: string;
  dias: DiaEntrenamiento[];
  horaInicio: string;
  horaFin: string;
  nivel: NivelGrupo | null;
  capacidadMaxima: number | null;
  estado: "Activo" | "Inactivo";
};

type TwentyCreateGrupoResponse = {
  data: {
    createGrupo: TwentyGrupo;
  };
};

type TwentyUpdateGrupoResponse = {
  data: {
    updateGrupo: TwentyGrupo;
  };
};

function cuerpoGrupo(grupo: NuevoGrupo) {
  const nivel = Object.entries(NIVELES).find(
    ([, valor]) => valor === grupo.nivel
  )?.[0];

  return {
    name: grupo.nombre,

    diasDeEntrenamiento: grupo.dias,

    horaDeInicio: grupo.horaInicio,

    horaDeFin: grupo.horaFin,

    nivel: nivel ?? null,

    capacidadMaxima: grupo.capacidadMaxima,

    estado:
      grupo.estado === "Inactivo"
        ? "INACTIVO"
        : "ACTIVO",
  };
}

export async function createGrupo(
  grupo: NuevoGrupo
): Promise<Grupo> {
  const result =
    await twentyFetch<TwentyCreateGrupoResponse>(
      "grupos",
      {
        method: "POST",
        body: cuerpoGrupo(grupo),
      }
    );

  return adaptarGrupo(
    result.data.createGrupo
  );
}

export async function updateGrupo(
  id: string,
  grupo: NuevoGrupo
): Promise<Grupo> {
  const result =
    await twentyFetch<TwentyUpdateGrupoResponse>(
      `grupos/${id}`,
      {
        method: "PATCH",
        body: cuerpoGrupo(grupo),
      }
    );

  return adaptarGrupo(
    result.data.updateGrupo
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

export type NuevaInscripcion = {
  alumnoId: string;
  grupoId: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: "Activa" | "Inactiva";
};

export type CambiosInscripcion = Partial<
  Omit<NuevaInscripcion, "alumnoId" | "grupoId">
>;

type TwentyCreateInscripcionResponse = {
  data: {
    createInscripcion: TwentyInscripcion;
  };
};

/*
  El nombre sigue la convención que ya existe en Twenty:
  "Alumno · Grupo".
*/
export async function createInscripcion(
  inscripcion: NuevaInscripcion
): Promise<{ id: string }> {
  const [alumno, grupo] = await Promise.all([
    getAlumnoById(inscripcion.alumnoId),
    getGrupoById(inscripcion.grupoId),
  ]);

  if (!alumno || !grupo) {
    throw new Error(
      "El alumno o el grupo de la inscripción no existe."
    );
  }

  const result =
    await twentyFetch<TwentyCreateInscripcionResponse>(
      "inscripciones",
      {
        method: "POST",

        body: {
          name: `${alumno.nombre} · ${grupo.nombre}`,

          alumnoId: alumno.id,

          grupoId: grupo.id,

          fechaDeInicio: inscripcion.fechaInicio,

          fechaDeFin: inscripcion.fechaFin,

          estado:
            inscripcion.estado === "Inactiva"
              ? "INACTIVO"
              : "ACTIVO",
        },
      }
    );

  return {
    id: result.data.createInscripcion.id,
  };
}

export async function updateInscripcion(
  id: string,
  cambios: CambiosInscripcion
): Promise<void> {
  await twentyFetch(
    `inscripciones/${id}`,
    {
      method: "PATCH",

      body: {
        ...(cambios.fechaInicio !== undefined && {
          fechaDeInicio: cambios.fechaInicio,
        }),

        ...(cambios.fechaFin !== undefined && {
          fechaDeFin: cambios.fechaFin,
        }),

        ...(cambios.estado !== undefined && {
          estado:
            cambios.estado === "Inactiva"
              ? "INACTIVO"
              : "ACTIVO",
        }),
      },
    }
  );
}

/*
  Cambiar de grupo no modifica la inscripción anterior:
  la cierra (fecha de fin = día del cambio, estado
  INACTIVO) y crea una nueva. Así queda el historial
  de grupos del alumno.
*/
export async function cambiarGrupoDeAlumno(
  alumnoId: string,
  nuevoGrupoId: string,
  fechaCambio: string
): Promise<{ id: string }> {
  const inscripciones = await getInscripciones();

  const activas = inscripciones.filter(
    (inscripcion) =>
      inscripcion.estado === "Activa" &&
      inscripcion.alumnos.some(
        (alumno) => alumno.id === alumnoId
      )
  );

  await Promise.all(
    activas.map((inscripcion) =>
      updateInscripcion(inscripcion.id, {
        fechaFin: fechaCambio,
        estado: "Inactiva",
      })
    )
  );

  return createInscripcion({
    alumnoId,
    grupoId: nuevoGrupoId,
    fechaInicio: fechaCambio,
    fechaFin: null,
    estado: "Activa",
  });
}

export async function getInscripcionesDeAlumno(
  alumnoId: string
): Promise<Inscripcion[]> {
  const inscripciones =
    await getInscripciones();

  return inscripciones
    .filter((inscripcion) =>
      inscripcion.alumnos.some(
        (alumno) => alumno.id === alumnoId
      )
    )
    .sort((a, b) =>
      b.fechaInicio.localeCompare(a.fechaInicio)
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