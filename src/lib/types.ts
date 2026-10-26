export type Alumno = {
  id: string;
  nombre: string;
  nombres: string;
  apellidos: string;
  edad: number | null;
  estatura: number | null;
  manoHabil: "Derecha" | "Izquierda" | null;
  fechaDeNacimiento: string | null;
  estado: "Activo" | "Inactivo";
};

export type DiaEntrenamiento =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

export type NivelGrupo =
  | "Principiante"
  | "Intermedio"
  | "Avanzado";

export type Grupo = {
  id: string;
  nombre: string;
  dias: string;
  diasDeEntrenamiento: DiaEntrenamiento[];
  horaInicio: string;
  horaFin: string;
  nivel: NivelGrupo | null;
  capacidadMaxima: number | null;
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
