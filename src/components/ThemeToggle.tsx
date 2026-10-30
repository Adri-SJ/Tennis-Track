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
