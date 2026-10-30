"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LogoTennisTrack from "@/components/auth/LogoTennisTrack";
import PasoCodigo from "@/components/auth/PasoCodigo";
import {
  ErrorApi,
  api,
  correoGuardado,
  guardarCorreo,
} from "@/lib/auth/cliente";

type Modo = "ingresar" | "registro" | "recuperar";

type RespuestaEnvio = { ok: boolean; correo_configurado: boolean };

function mensajeDe(falla: unknown): string {
  return falla instanceof ErrorApi ? falla.message : "Algo salió mal";
}

/* Una sola pantalla con tres modos; la URL no cambia. */
export default function PantallaAcceso({ desde }: { desde: string }) {
  const [modo, setModo] = useState<Modo>("ingresar");

  const titulo = {
    ingresar: "BIENVENIDO",
    registro: "CREAR CUENTA",
    recuperar: "RECUPERAR CONTRASEÑA",
  }[modo];

  return (
    <main className="auth">
      <ThemeToggle className="auth-boton auth-tema" />

      <section className="auth-tarjeta">
        <LogoTennisTrack className="auth-logo" />

        <h1 className="auth-titulo">{titulo}</h1>

        {modo === "ingresar" && (
          <Ingresar desde={desde} onOlvide={() => setModo("recuperar")} />
        )}
        {modo === "registro" && (
          <CrearCuenta onIrAIngresar={() => setModo("ingresar")} />
        )}
        {modo === "recuperar" && (
          <Recuperar onIrAIngresar={() => setModo("ingresar")} />
        )}

        <div className="auth-pie">
          {modo === "ingresar" ? (
            <>
              ¿No tienes cuenta?
              <button
                type="button"
                className="auth-boton auth-boton-texto"
                onClick={() => setModo("registro")}
              >
                Crear cuenta
              </button>
            </>
          ) : (
            <>
              {modo === "registro" ? "¿Ya tienes cuenta?" : "¿La recordaste?"}
              <button
                type="button"
                className="auth-boton auth-boton-texto"
                onClick={() => setModo("ingresar")}
              >
                Ingresar
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

/* INGRESAR */

function Ingresar({
  desde,
  onOlvide,
}: {
  desde: string;
  onOlvide: () => void;
}) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const campoCorreo = useRef<HTMLInputElement>(null);
  const campoPassword = useRef<HTMLInputElement>(null);

  /* Recuerda el último correo; si ya hay uno, el foco va a la contraseña. */
  useEffect(() => {
    const guardado = correoGuardado();

    if (guardado) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el navegador
      setCorreo(guardado);
      campoPassword.current?.focus();
    } else {
      campoCorreo.current?.focus();
    }
  }, []);

  const ingresar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEntrando(true);
    setError(null);

    try {
      await api("/api/auth/login", { method: "POST", body: { correo, password } });
      guardarCorreo(correo.trim().toLowerCase());
      router.replace(desde);
      router.refresh();
    } catch (falla) {
      setError(mensajeDe(falla));
      setPassword("");
      campoPassword.current?.focus();
      setEntrando(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={ingresar}>
      <label className="auth-campo">
        Correo
        <input
          ref={campoCorreo}
          className="auth-input"
          type="email"
          autoComplete="username"
          required
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
      </label>

      <label className="auth-campo">
        Contraseña
        <input
          ref={campoPassword}
          className="auth-input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
        />
      </label>

      <button
        type="button"
        className="auth-boton auth-boton-texto auth-olvide"
        onClick={onOlvide}
      >
        ¿Olvidaste tu contraseña?
      </button>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="auth-boton auth-boton-principal"
        disabled={entrando}
      >
        {entrando ? "Entrando…" : "Ingresar"}
      </button>
    </form>
  );
}

/* CREAR CUENTA */

function CrearCuenta({ onIrAIngresar }: { onIrAIngresar: () => void }) {
  const [paso, setPaso] = useState<"datos" | "codigo" | "listo">("datos");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [repetida, setRepetida] = useState("");
  const [correoConfigurado, setCorreoConfigurado] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviarCodigo = async () => {
    const respuesta = await api<RespuestaEnvio>("/api/auth/registro", {
      method: "POST",
      body: { nombre, correo, password },
    });

    setCorreoConfigurado(respuesta.correo_configurado);
  };

  const continuar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);

    if (password !== repetida) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);

    try {
      await enviarCodigo();
      setPaso("codigo");
    } catch (falla) {
      setError(mensajeDe(falla));
    } finally {
      setEnviando(false);
    }
  };

  if (paso === "listo") {
    return (
      <div className="auth-form auth-centrado">
        <p className="auth-exito">Cuenta creada</p>
        <p className="auth-nota">
          Un administrador debe aprobar tu cuenta y asignarte un rol antes de
          que puedas ingresar.
        </p>
        <button
          type="button"
          className="auth-boton auth-boton-principal"
          onClick={() => {
            guardarCorreo(correo.trim().toLowerCase());
            onIrAIngresar();
          }}
        >
          Ir a ingresar
        </button>
      </div>
    );
  }

  if (paso === "codigo") {
    return (
      <PasoCodigo
        correo={correo.trim().toLowerCase()}
        correoConfigurado={correoConfigurado}
        autoConfirmar
        onVerificar={async (codigo) => {
          await api("/api/auth/registro/confirmar", {
            method: "POST",
            body: { correo, codigo },
          });
          setPaso("listo");
        }}
        onReenviar={enviarCodigo}
        onCambiarCorreo={() => setPaso("datos")}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={continuar}>
      <label className="auth-campo">
        Nombre completo
        <input
          className="auth-input"
          autoComplete="name"
          required
          autoFocus
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
        />
      </label>

      <label className="auth-campo">
        Correo
        <input
          className="auth-input"
          type="email"
          autoComplete="email"
          required
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
      </label>

      <label className="auth-campo">
        <span>
          Contraseña <span className="auth-ayuda">· mínimo 8 caracteres</span>
        </span>
        <input
          className="auth-input"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
        />
      </label>

      <label className="auth-campo">
        Repite la contraseña
        <input
          className="auth-input"
          type="password"
          autoComplete="new-password"
          required
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
        />
      </label>

      <p className="auth-nota">
        Te enviaremos un código a tu correo para confirmarlo. Se necesita
        internet.
      </p>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="auth-boton auth-boton-principal"
        disabled={enviando}
      >
        {enviando ? "Enviando código…" : "Continuar"}
      </button>
    </form>
  );
}

/* RECUPERAR CONTRASEÑA */

function Recuperar({ onIrAIngresar }: { onIrAIngresar: () => void }) {
  const [paso, setPaso] = useState<"correo" | "codigo" | "listo">("correo");
  const [correo, setCorreo] = useState(correoGuardado);
  const [password, setPassword] = useState("");
  const [repetida, setRepetida] = useState("");
  const [correoConfigurado, setCorreoConfigurado] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviarCodigo = async () => {
    const respuesta = await api<RespuestaEnvio>("/api/auth/recuperar", {
      method: "POST",
      body: { correo },
    });

    setCorreoConfigurado(respuesta.correo_configurado);
  };

  const continuar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await enviarCodigo();
      setPaso("codigo");
    } catch (falla) {
      setError(mensajeDe(falla));
    } finally {
      setEnviando(false);
    }
  };

  if (paso === "listo") {
    return (
      <div className="auth-form auth-centrado">
        <p className="auth-exito">Contraseña actualizada</p>
        <p className="auth-nota">Ya puedes ingresar con tu nueva contraseña.</p>
        <button
          type="button"
          className="auth-boton auth-boton-principal"
          onClick={() => {
            guardarCorreo(correo.trim().toLowerCase());
            onIrAIngresar();
          }}
        >
          Ir a ingresar
        </button>
      </div>
    );
  }

  if (paso === "codigo") {
    return (
      <PasoCodigo
        correo={correo.trim().toLowerCase()}
        correoConfigurado={correoConfigurado}
        autoConfirmar={false}
        validarExtra={() =>
          password.length < 8
            ? "La contraseña debe tener al menos 8 caracteres"
            : password !== repetida
              ? "Las contraseñas no coinciden"
              : null
        }
        extra={
          <>
            <label className="auth-campo">
              <span>
                Nueva contraseña{" "}
                <span className="auth-ayuda">· mínimo 8 caracteres</span>
              </span>
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
              />
            </label>

            <label className="auth-campo">
              Repite la contraseña
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                required
                value={repetida}
                onChange={(evento) => setRepetida(evento.target.value)}
              />
            </label>
          </>
        }
        onVerificar={async (codigo) => {
          await api("/api/auth/recuperar/confirmar", {
            method: "POST",
            body: { correo, codigo, password },
          });
          setPaso("listo");
        }}
        onReenviar={enviarCodigo}
        onCambiarCorreo={() => setPaso("correo")}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={continuar}>
      <p className="auth-nota auth-centrado">
        Si {correo.trim() || "el correo"} está registrado, te llegará un código.
      </p>

      <label className="auth-campo">
        Correo
        <input
          className="auth-input"
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
        />
      </label>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="auth-boton auth-boton-principal"
        disabled={enviando}
      >
        {enviando ? "Enviando código…" : "Enviar código"}
      </button>
    </form>
  );
}
