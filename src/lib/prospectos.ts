import { twentyFetch } from "@/lib/api";

export type Etapa =
  | "Nuevo"
  | "Contactado"
  | "Clase de prueba"
  | "Inscrito"
  | "Perdido";

export type Origen =
  | "Instagram"
  | "Facebook"
  | "Recomendación"
  | "Publicidad"
  | "Otro";

export type Prospecto = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  origen: Origen;
  etapa: Etapa;
  /* Fecha en que se registró en Twenty (solo lectura). */
  fechaContacto: string;
  fechaClaseMuestra: string;
  alumnoId: string | null;
};

export type DatosProspecto = Omit<
  Prospecto,
  "id" | "fechaContacto" | "alumnoId"
>;

const ETAPAS: Record<string, Etapa> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  CLASE_MUESTRA: "Clase de prueba",
  INSCRITO: "Inscrito",
  PERDIDO: "Perdido",
};

const ORIGENES: Record<string, Origen> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  RECOMENDACION: "Recomendación",
  PUBLICIDAD: "Publicidad",
  OTRO: "Otro",
};

const aTwenty = <T extends string>(
  mapa: Record<string, T>,
  valor: T
) => Object.keys(mapa).find((clave) => mapa[clave] === valor) ?? null;

export const LISTA_ETAPAS = Object.values(ETAPAS);
export const LISTA_ORIGENES = Object.values(ORIGENES);

type TwentyProspecto = {
  id: string;
  name: string | null;
  telefono: { primaryPhoneNumber: string | null } | null;
  email: { primaryEmail: string | null } | null;
  origen: string | null;
  etapa: string | null;
  fechaClaseMuestra: string | null;
  alumnoId: string | null;
  createdAt: string;
};

function adaptarProspecto(prospecto: TwentyProspecto): Prospecto {
  return {
    id: prospecto.id,
    nombre: prospecto.name ?? "",
    telefono: prospecto.telefono?.primaryPhoneNumber ?? "",
    correo: prospecto.email?.primaryEmail ?? "",
    origen: ORIGENES[prospecto.origen ?? ""] ?? "Otro",
    etapa: ETAPAS[prospecto.etapa ?? ""] ?? "Nuevo",
    fechaContacto: prospecto.createdAt.slice(0, 10),
    fechaClaseMuestra: prospecto.fechaClaseMuestra ?? "",
    alumnoId: prospecto.alumnoId,
  };
}

function cuerpoProspecto(datos: Partial<DatosProspecto>) {
  return {
    ...(datos.nombre !== undefined && { name: datos.nombre }),
    ...(datos.telefono !== undefined && {
      telefono: {
        primaryPhoneNumber: datos.telefono,
        primaryPhoneCountryCode: "MX",
        primaryPhoneCallingCode: "+52",
      },
    }),
    ...(datos.correo !== undefined && {
      email: { primaryEmail: datos.correo },
    }),
    ...(datos.origen !== undefined && {
      origen: aTwenty(ORIGENES, datos.origen),
    }),
    ...(datos.etapa !== undefined && {
      etapa: aTwenty(ETAPAS, datos.etapa),
    }),
    ...(datos.fechaClaseMuestra !== undefined && {
      fechaClaseMuestra: datos.fechaClaseMuestra || null,
    }),
  };
}

export async function getProspectos(): Promise<Prospecto[]> {
  const result = await twentyFetch<{
    data: { prospectos: TwentyProspecto[] };
  }>("prospectos?limit=200&order_by=createdAt[DescNullsLast]");

  return result.data.prospectos
    .filter((prospecto) => prospecto.name)
    .map(adaptarProspecto);
}

export async function createProspecto(
  datos: DatosProspecto
): Promise<void> {
  await twentyFetch("prospectos", {
    method: "POST",
    body: cuerpoProspecto(datos),
  });
}

export async function updateProspecto(
  id: string,
  datos: Partial<DatosProspecto> & { alumnoId?: string }
): Promise<void> {
  await twentyFetch(`prospectos/${id}`, {
    method: "PATCH",
    body: {
      ...cuerpoProspecto(datos),
      ...(datos.alumnoId !== undefined && { alumnoId: datos.alumnoId }),
    },
  });
}

export async function deleteProspecto(id: string): Promise<void> {
  await twentyFetch(`prospectos/${id}`, { method: "DELETE" });
}

/*
  Crea el alumno a partir del prospecto: el primer nombre
  va a firstName y el resto a lastName. Edad y estatura
  se completan después en el formulario del alumno.
*/
export async function convertirProspectoEnAlumno(
  prospecto: Prospecto
): Promise<string> {
  const [nombres, ...resto] = prospecto.nombre.trim().split(/\s+/);

  const result = await twentyFetch<{
    data: { createPerson: { id: string } };
  }>("people", {
    method: "POST",
    body: {
      name: { firstName: nombres, lastName: resto.join(" ") },
      estado: "ACTIVO",
      ...(prospecto.telefono && {
        phones: {
          primaryPhoneNumber: prospecto.telefono,
          primaryPhoneCountryCode: "MX",
          primaryPhoneCallingCode: "+52",
        },
      }),
      ...(prospecto.correo && {
        emails: { primaryEmail: prospecto.correo },
      }),
    },
  });

  const alumnoId = result.data.createPerson.id;

  await updateProspecto(prospecto.id, { etapa: "Inscrito", alumnoId });

  return alumnoId;
}
