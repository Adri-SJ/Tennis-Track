"use client";

import { useEffect, useRef } from "react";

export const LARGO_CODIGO = 6;

const VACIO = " ".repeat(LARGO_CODIGO);

/* Código completo: seis dígitos sin huecos. */
export function codigoCompleto(codigo: string): boolean {
  return /^\d{6}$/.test(codigo);
}

/*
  Seis casillas para el código. `valor` tiene siempre 6 caracteres
  (un espacio = casilla vacía) y se lleva también en un ref, para que
  escribir rápido no pierda dígitos entre renders. `error` sube en
  cada fallo: pinta las casillas de rojo y las sacude.
*/
export default function CasillasCodigo({
  valor,
  onCambio,
  onCompleto,
  error,
  deshabilitado,
}: {
  valor: string;
  onCambio: (codigo: string) => void;
  onCompleto?: (codigo: string) => void;
  error: number;
  deshabilitado?: boolean;
}) {
  const grupo = useRef<HTMLDivElement>(null);
  const casillas = useRef<(HTMLInputElement | null)[]>([]);
  const actual = useRef((valor || VACIO).split(""));

  /* Si el padre limpia el código (reenviar, cambiar correo), se reinicia. */
  useEffect(() => {
    if (valor.trim() === "") {
      actual.current = VACIO.split("");
      casillas.current[0]?.focus();
    }
  }, [valor]);

  useEffect(() => {
    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (error > 0 && !reducido) {
      grupo.current?.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 300 }
      );
    }
  }, [error]);

  const publicar = () => {
    const codigo = actual.current.join("");

    onCambio(codigo);

    if (codigoCompleto(codigo)) {
      onCompleto?.(codigo);
    }
  };

  const enfocar = (indice: number) => {
    const destino = Math.max(0, Math.min(LARGO_CODIGO - 1, indice));

    casillas.current[destino]?.focus();
  };

  const llenarDesde = (indice: number, digitos: string) => {
    const caben = digitos.slice(0, LARGO_CODIGO - indice).split("");

    caben.forEach((digito, desplazamiento) => {
      actual.current[indice + desplazamiento] = digito;
    });

    publicar();
    enfocar(indice + caben.length);
  };

  const alEscribir = (indice: number, texto: string) => {
    let digitos = texto.replace(/\D/g, "");

    if (!digitos) {
      return;
    }

    /* Casilla con dígito y sin seleccionar: se queda el que se tecleó. */
    const anterior = actual.current[indice].trim();

    if (anterior && digitos.length === 2) {
      digitos = digitos.replace(anterior, "") || anterior;
    }

    llenarDesde(indice, digitos);
  };

  const alTeclear = (
    indice: number,
    evento: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (evento.key === "Backspace") {
      evento.preventDefault();

      if (actual.current[indice].trim()) {
        actual.current[indice] = " ";
        publicar();
      } else if (indice > 0) {
        actual.current[indice - 1] = " ";
        publicar();
        enfocar(indice - 1);
      }
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      enfocar(indice - 1);
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault();
      enfocar(indice + 1);
    }
  };

  const alPegar = (
    indice: number,
    evento: React.ClipboardEvent<HTMLInputElement>
  ) => {
    evento.preventDefault();

    const digitos = evento.clipboardData.getData("text").replace(/\D/g, "");

    if (digitos) {
      llenarDesde(digitos.length >= LARGO_CODIGO ? 0 : indice, digitos);
    }
  };

  return (
    <div
      ref={grupo}
      className={`auth-casillas${error > 0 ? " auth-casillas-error" : ""}`}
      role="group"
      aria-label="Código de 6 dígitos"
    >
      {Array.from({ length: LARGO_CODIGO }, (_, indice) => (
        <input
          key={indice}
          ref={(elemento) => {
            casillas.current[indice] = elemento;
          }}
          className="auth-casilla"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={indice === 0 ? "one-time-code" : "off"}
          maxLength={indice === 0 ? LARGO_CODIGO : 2}
          aria-label={`Dígito ${indice + 1} de ${LARGO_CODIGO}`}
          aria-invalid={error > 0}
          disabled={deshabilitado}
          value={(valor[indice] ?? "").trim()}
          onChange={(evento) => alEscribir(indice, evento.target.value)}
          onKeyDown={(evento) => alTeclear(indice, evento)}
          onPaste={(evento) => alPegar(indice, evento)}
          onFocus={(evento) => evento.target.select()}
        />
      ))}
    </div>
  );
}
