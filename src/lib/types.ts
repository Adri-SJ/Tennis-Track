export type Alumno = {
  id: string;
  nombre: string;
  edad: number | null;
  estatura: number | null;
  manoHabil: "Derecha" | "Izquierda" | null;
  fechaDeNacimiento: string | null;
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
  nombre: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: "Activa" | "Inactiva";

  alumnos: Alumno[];

  grupo: Grupo | null;
};