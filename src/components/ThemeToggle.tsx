"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Tema = "sistema" | "claro" | "oscuro";

const CLAVE_TEMA = "tennistrack.tema";

const ICONO = { sistema: Monitor, claro: Sun, oscuro: Moon };

/*
  Script para <head>: aplica el tema guardado antes de pintar, así no
  parpadea. Sin elección guardada no pone data-theme y manda el sistema.
*/
export const scriptTema = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro"||t==="oscuro")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function aplicar(tema: Tema) {

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

const OPCIONES: { tema: Tema; nombre: string }[] = [
  { tema: "sistema", nombre: "Sistema" },
  { tema: "claro", nombre: "Claro" },
  { tema: "oscuro", nombre: "Oscuro" },
];

/* Selector de tema; solo vive en la página de Ajustes. */
export function SelectorTema() {
  const [tema, setTema] = useState<Tema>("sistema");

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");

    // eslint-disable-next-line react-hooks/set-state-in-effect -- data-theme solo existe en el navegador
    setTema(actual === "claro" || actual === "oscuro" ? actual : "sistema");
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
