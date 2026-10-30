"use client";

import { useEffect, useState } from "react";
import { ErrorApi } from "@/lib/auth/cliente";
import CasillasCodigo, { codigoCompleto } from "./CasillasCodigo";

const ESPERA_REENVIO = 60;

/*
  Paso 2 de registro y recuperación: casillas del código, reenvío con
  cuenta regresiva y «Cambiar correo». `extra` agrega campos (la nueva
  contraseña al recuperar); sin ellos el código se confirma solo.
*/
export default function PasoCodigo({
  correo,
  correoConfigurado,
  autoConfirmar,
  extra,
  validarExtra,
  onVerificar,
  onReenviar,
  onCambiarCorreo,
}: {
  correo: string;
  correoConfigurado: boolean;
  autoConfirmar: boolean;
  extra?: React.ReactNode;
  validarExtra?: () => string | null;
  onVerificar: (codigo: string) => Promise<void>;
  onReenviar: () => Promise<void>;
  onCambiarCorreo: () => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [errorCodigo, setErrorCodigo] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [espera, setEspera] = useState(ESPERA_REENVIO);

  useEffect(() => {
    if (espera <= 0) {
      return;
    }

    const temporizador = setTimeout(() => setEspera(espera - 1), 1000);

    return () => clearTimeout(temporizador);
  }, [espera]);

  const verificar = async (valor: string) => {
    if (!codigoCompleto(valor) || verificando) {
      return;
    }

    const errorExtra = validarExtra?.() ?? null;

    if (errorExtra) {
      setError(errorExtra);
      return;
    }

    setVerificando(true);
    setError(null);
    setAviso(null);

    try {
      await onVerificar(valor);
    } catch (falla) {
      const mensaje =
        falla instanceof ErrorApi ? falla.message : "No se pudo verificar";

      setError(mensaje);

      /* Solo los errores del código pintan las casillas de rojo. */
      if (falla instanceof ErrorApi && /código/i.test(mensaje)) {
        setErrorCodigo((anterior) => anterior + 1);
      }
    } finally {
      setVerificando(false);
    }
  };

  const reenviar = async () => {
    setReenviando(true);
    setError(null);
    setAviso(null);

    try {
      await onReenviar();
      setCodigo("");
      setErrorCodigo(0);
      setAviso("Te enviamos un código nuevo.");
      setEspera(ESPERA_REENVIO);
    } catch (falla) {
      if (falla instanceof ErrorApi && typeof falla.datos.espera === "number") {
        setEspera(falla.datos.espera);
      }

      setError(
        falla instanceof ErrorApi ? falla.message : "No se pudo reenviar"
      );
    } finally {
      setReenviando(false);
    }
  };

  return (
    <form
      className="auth-form"
      onSubmit={(evento) => {
        evento.preventDefault();
        verificar(codigo);
      }}
    >
      <div className="auth-codigo-encabezado">
        <div className="auth-sobre" aria-hidden="true">
          ✉
        </div>

        <p className="auth-codigo-texto">
          Escribe el código que enviamos a {correo}
        </p>

        <p className="auth-nota">
          Vence en 15 minutos · Revisa también la carpeta de spam
        </p>
      </div>

      {!correoConfigurado && (
        <p className="auth-aviso">
          El envío de correos no está configurado en el servidor. Mientras
          tanto, el código aparece en la consola del servidor.
        </p>
      )}

      <CasillasCodigo
        valor={codigo}
        error={errorCodigo}
        deshabilitado={verificando}
        onCambio={(valor) => {
          setCodigo(valor);

          if (errorCodigo > 0) {
            setErrorCodigo(0);
            setError(null);
          }
        }}
        onCompleto={autoConfirmar ? verificar : undefined}
      />

      {extra}

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {aviso && (
        <p className="auth-exito" role="status">
          {aviso}
        </p>
      )}

      <button
        type="submit"
        className="auth-boton auth-boton-principal"
        disabled={!codigoCompleto(codigo) || verificando}
      >
        {verificando ? "Verificando…" : "Verificar"}
      </button>

      <div className="auth-codigo-acciones">
        {espera > 0 ? (
          <span className="auth-espera">Reenviar código en {espera} s</span>
        ) : (
          <span>
            ¿No te llegó?{" "}
            <button
              type="button"
              className="auth-boton auth-boton-texto"
              onClick={reenviar}
              disabled={reenviando}
            >
              {reenviando ? "Enviando…" : "Reenviar código"}
            </button>
          </span>
        )}

        <button
          type="button"
          className="auth-boton auth-boton-texto"
          onClick={onCambiarCorreo}
        >
          Cambiar correo
        </button>
      </div>
    </form>
  );
}
