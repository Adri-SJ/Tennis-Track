"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Tema = "sistema" | "claro" | "oscuro";

const CLAVE_TEMA = "tennistrack.tema";

const SIGUIENTE: Record<Tema, Tema> = {
  sistema: "claro",
  claro: "oscuro",
  oscuro: "sistema",
};

const ETIQUETA: Record<Tema, string> = {
  sistema: "Tema del sistema",
  claro: "Tema claro",
  oscuro: "Tema oscuro",
};

const ICONO = { sistema: Monitor, claro: Sun, oscuro: Moon };

/*
  Script para <head>: aplica el tema guardado antes de pintar, así no
  parpadea. Sin elección guardada no pone data-theme y manda el sistema.
*/
export const scriptTema = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro"||t==="oscuro")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/* Avisa a los demás selectores de tema (encabezado, barra, Ajustes). */
const EVENTO_TEMA = "tennistrack:tema";

function aplicar(tema: Tema) {
  window.dispatchEvent(new CustomEvent<Tema>(EVENTO_TEMA, { detail: tema }));

  if (tema === "sistema") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", tema);
  }

  try {
    if (tema === "sistema") {
      localStorage.removeItem(CLAVE_TEMA);
    } else {
      localStorage.setItem(CLAVE_TEMA, tema);
    }
  } catch {
    // Sin almacenamiento el tema dura hasta recargar.
  }
}

function escucharTema(alCambiar: (tema: Tema) => void): () => void {
  const manejar = (evento: Event) =>
    alCambiar((evento as CustomEvent<Tema>).detail);

  window.addEventListener(EVENTO_TEMA, manejar);

  return () => window.removeEventListener(EVENTO_TEMA, manejar);
}

/* Cambia entre sistema → claro → oscuro. */
export default function ThemeToggle({
  conTexto = false,
  className = "",
}: {
  conTexto?: boolean;
  className?: string;
}) {
  const [tema, setTema] = useState<Tema>("sistema");

  /* El tema real solo se conoce en el navegador (lo puso el script). */
  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");

    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-theme solo existe en el navegador
    setTema(actual === "claro" || actual === "oscuro" ? actual : "sistema");

    return escucharTema(setTema);
  }, []);

  const Icono = ICONO[tema];

  return (
    <button
      type="button"
      onClick={() => {
        const nuevo = SIGUIENTE[tema];

        aplicar(nuevo);
        setTema(nuevo);
      }}
      aria-label={`${ETIQUETA[tema]}. Cambiar a ${ETIQUETA[SIGUIENTE[tema]].toLowerCase()}`}
      title={ETIQUETA[tema]}
      className={className}
    >
      <Icono size={conTexto ? 18 : 20} />
      {conTexto && ETIQUETA[tema]}
    </button>
  );
}

const OPCIONES: { tema: Tema; nombre: string }[] = [
  { tema: "sistema", nombre: "Sistema" },
  { tema: "claro", nombre: "Claro" },
  { tema: "oscuro", nombre: "Oscuro" },
];

/* Las tres opciones a la vista, para la página de Ajustes. */
export function SelectorTema() {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");

    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-theme solo existe en el navegador
    setTema(actual === "claro" || actual === "oscuro" ? actual : "sistema");

    return escucharTema(setTema);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="grid grid-cols-3 gap-1 rounded-xl bg-hundido p-1"
    >
      {OPCIONES.map((opcion) => {
        const Icono = ICONO[opcion.tema];
        const activo = tema === opcion.tema;

        return (
          <button
            key={opcion.tema}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => {
              aplicar(opcion.tema);
              setTema(opcion.tema);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              activo
                ? "bg-superficie text-texto shadow-sm"
                : "text-texto-suave hover:text-texto"
            }`}
          >
            <Icono size={16} />
            {opcion.nombre}
          </button>
        );
      })}
    </div>
  );
}
