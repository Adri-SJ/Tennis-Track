export type Alumno = {
  id: string;
  nombre: string;
  edad: number;
  estatura: number;
  manoHabil: "Derecha" | "Izquierda";
  estado: "Activo" | "Inactivo";
};

export type Grupo = {
  id: string;
  nombre: string;
  dias: string;
  horaInicio: string;
  horaFin: string;
  estado: "Activo" | "Inactivo";
};

export type Inscripcion = {
  id: string;
  alumnoId: string;
  grupoId: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: "Activa" | "Inactiva";
};

export const alumnos: Alumno[] = [
  {
    id: "1",
    nombre: "Oscar Uao",
    edad: 21,
    estatura: 170,
    manoHabil: "Izquierda",
    estado: "Activo",
  },
  {
    id: "2",
    nombre: "Marcelo Hernandez",
    edad: 20,
    estatura: 175,
    manoHabil: "Izquierda",
    estado: "Activo",
  },
  {
    id: "3",
    nombre: "Brian Chesky",
    edad: 15,
    estatura: 164,
    manoHabil: "Derecha",
    estado: "Activo",
  },
  {
    id: "4",
    nombre: "Dario Amodei",
    edad: 18,
    estatura: 170,
    manoHabil: "Derecha",
    estado: "Activo",
  },
  {
    id: "5",
    nombre: "Patrick Collison",
    edad: 10,
    estatura: 150,
    manoHabil: "Izquierda",
    estado: "Activo",
  },
  {
    id: "6",
    nombre: "Adrian",
    edad: 22,
    estatura: 180,
    manoHabil: "Izquierda",
    estado: "Activo",
  },
];

export const grupos: Grupo[] = [
  {
    id: "1",
    nombre: "Vespertino A",
    dias: "Lun · Mar · Jue · Vie",
    horaInicio: "16:30",
    horaFin: "18:30",
    estado: "Activo",
  },
  {
    id: "2",
    nombre: "Sabatino A",
    dias: "Sábado",
    horaInicio: "08:00",
    horaFin: "10:00",
    estado: "Activo",
  },
];

export const inscripciones: Inscripcion[] = [
  {
    id: "1",
    alumnoId: "1",
    grupoId: "1",
    fechaInicio: "01/09/2026",
    fechaFin: null,
    estado: "Activa",
  },
  {
    id: "2",
    alumnoId: "2",
    grupoId: "2",
    fechaInicio: "01/09/2026",
    fechaFin: null,
    estado: "Activa",
  },
  {
    id: "3",
    alumnoId: "5",
    grupoId: "1",
    fechaInicio: "15/08/2026",
    fechaFin: null,
    estado: "Activa",
  },
  {
    id: "4",
    alumnoId: "3",
    grupoId: "2",
    fechaInicio: "10/08/2026",
    fechaFin: null,
    estado: "Activa",
  },
  {
    id: "5",
    alumnoId: "6",
    grupoId: "1",
    fechaInicio: "20/08/2026",
    fechaFin: null,
    estado: "Activa",
  },
];

// -----------------------------
// HELPERS
// -----------------------------

export function getAlumnoById(id: string) {
  return alumnos.find((alumno) => alumno.id === id);
}

export function getGrupoById(id: string) {
  return grupos.find((grupo) => grupo.id === id);
}

export function getInscripcionById(id: string) {
  return inscripciones.find((inscripcion) => inscripcion.id === id);
}

export function getInscripcionActivaDeAlumno(alumnoId: string) {
  return inscripciones.find(
    (inscripcion) =>
      inscripcion.alumnoId === alumnoId &&
      inscripcion.estado === "Activa"
  );
}

export function getGrupoDeAlumno(alumnoId: string) {
  const inscripcion = getInscripcionActivaDeAlumno(alumnoId);

  if (!inscripcion) {
    return null;
  }

  return getGrupoById(inscripcion.grupoId) ?? null;
}

export function getAlumnosDeGrupo(grupoId: string) {
  const alumnosIds = inscripciones
    .filter(
      (inscripcion) =>
        inscripcion.grupoId === grupoId &&
        inscripcion.estado === "Activa"
    )
    .map((inscripcion) => inscripcion.alumnoId);

  return alumnos.filter((alumno) => alumnosIds.includes(alumno.id));
}

export function getCantidadAlumnosDeGrupo(grupoId: string) {
  return getAlumnosDeGrupo(grupoId).length;
}