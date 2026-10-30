"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, UserCog, X } from "lucide-react";
import Modal from "@/components/Modal";
import { ErrorApi, api } from "@/lib/auth/cliente";
import { NOMBRE_ROL, type Rol } from "@/lib/permisos";

type Cuenta = {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol | null;
  estado: "pendiente" | "activo" | "rechazado" | "inactivo";
  creado_en: string;
  aprobado_en: string | null;
  aprobado_por: string | null;
};

type Respuesta = { usuarios: Cuenta[]; roles_asignables: Rol[]; yo: number };

type Confirmacion = {
  titulo: string;
  mensaje: string;
  textoBoton: string;
  peligro: boolean;
  accion: () => Promise<void>;
};

const claseSelector =
  "rounded-xl border border-borde bg-superficie px-3 py-2 text-sm outline-none focus:border-verde disabled:opacity-60";

const ETIQUETA_ESTADO: Record<Cuenta["estado"], string> = {
  pendiente: "Pendiente",
  activo: "Activa",
  rechazado: "Rechazada",
  inactivo: "Desactivada",
};

function fecha(valor: string): string {
  return new Date(valor).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CuentasClient() {
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [rolElegido, setRolElegido] = useState<Record<number, Rol>>({});
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await api<Respuesta>("/api/usuarios"));
      setError(null);
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : "No se pudo cargar");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde la API
    cargar();
  }, [cargar]);

  const ejecutar = async (id: number, accion: () => Promise<unknown>) => {
    setOcupado(id);
    setError(null);

    try {
      await accion();
      await cargar();
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : "No se pudo guardar");
    } finally {
      setOcupado(null);
    }
  };

  if (!datos) {
    return (
      <div className="px-5 py-6 md:px-8 lg:px-10">
        <Encabezado />
        <p className="text-sm text-texto-suave">{error ?? "Cargando cuentas…"}</p>
      </div>
    );
  }

  const { usuarios, roles_asignables: rolesAsignables, yo } = datos;
  const pendientes = usuarios.filter((cuenta) => cuenta.estado === "pendiente");
  const resto = usuarios.filter((cuenta) => cuenta.estado !== "pendiente");

  /* Las mismas reglas que el servidor, solo para no ofrecer lo imposible. */
  const editable = (cuenta: Cuenta) =>
    cuenta.id !== yo &&
    cuenta.rol !== "superadmin" &&
    (cuenta.rol !== "admin" || rolesAsignables.includes("admin"));

  return (
    <div className="px-5 py-6 md:px-8 lg:px-10">
      <Encabezado />

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-borde-peligro bg-peligro-suave p-4 text-sm font-semibold text-peligro-fuerte"
        >
          {error}
        </p>
      )}

      {/* PENDIENTES */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-texto-suave">
          <Clock3 size={16} />
          Por aprobar ({pendientes.length})
        </h2>

        {pendientes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-borde bg-superficie p-5 text-sm text-texto-suave">
            No hay cuentas esperando aprobación.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {pendientes.map((cuenta) => {
              const rol = rolElegido[cuenta.id] ?? rolesAsignables[0];

              return (
                <article
                  key={cuenta.id}
                  className="rounded-2xl border-2 border-borde-alerta bg-superficie p-5"
                >
                  <p className="font-bold text-texto">{cuenta.nombre}</p>
                  <p className="text-sm text-texto-2">{cuenta.correo}</p>
                  <p className="mt-1 text-xs text-texto-suave">
                    Se registró el {fecha(cuenta.creado_en)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`rol-${cuenta.id}`}>
                      Rol para {cuenta.nombre}
                    </label>
                    <select
                      id={`rol-${cuenta.id}`}
                      className={claseSelector}
                      value={rol}
                      disabled={ocupado === cuenta.id}
                      onChange={(evento) =>
                        setRolElegido((anterior) => ({
                          ...anterior,
                          [cuenta.id]: evento.target.value as Rol,
                        }))
                      }
                    >
                      {rolesAsignables.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {NOMBRE_ROL[opcion]}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={ocupado === cuenta.id}
                      onClick={() =>
                        ejecutar(cuenta.id, () =>
                          api(`/api/usuarios/${cuenta.id}/aprobar`, {
                            method: "POST",
                            body: { rol },
                          })
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-boton px-4 py-2 text-sm font-semibold text-sobre-boton transition hover:bg-boton-hover disabled:opacity-60"
                    >
                      <Check size={16} />
                      Aprobar
                    </button>

                    <button
                      type="button"
                      disabled={ocupado === cuenta.id}
                      onClick={() =>
                        setConfirmacion({
                          titulo: "Rechazar cuenta",
                          mensaje: `${cuenta.nombre} no podrá ingresar al panel. Si fue un error, tendrá que registrarse de nuevo.`,
                          textoBoton: "Rechazar",
                          peligro: true,
                          accion: () =>
                            ejecutar(cuenta.id, () =>
                              api(`/api/usuarios/${cuenta.id}/rechazar`, {
                                method: "POST",
                              })
                            ),
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-borde px-4 py-2 text-sm font-semibold text-peligro-fuerte transition hover:bg-peligro-suave disabled:opacity-60"
                    >
                      <X size={16} />
                      Rechazar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CUENTAS */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-texto-suave">
          <UserCog size={16} />
          Cuentas ({resto.length})
        </h2>

        <div className="overflow-hidden rounded-2xl border border-borde bg-superficie">
          {resto.map((cuenta) => {
            const puedeEditar =
              editable(cuenta) &&
              (cuenta.estado === "activo" || cuenta.estado === "inactivo");
            const opcionesRol =
              cuenta.rol && !rolesAsignables.includes(cuenta.rol)
                ? [cuenta.rol, ...rolesAsignables]
                : rolesAsignables;

            return (
              <article
                key={cuenta.id}
                className="flex flex-col gap-3 border-b border-borde p-5 last:border-b-0 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-texto">
                    {cuenta.nombre}
                    {cuenta.id === yo && (
                      <span className="ml-2 text-xs font-semibold text-verde">
                        (tú)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-texto-2">
                    {cuenta.correo}
                  </p>
                  {cuenta.aprobado_por && cuenta.aprobado_en && (
                    <p className="mt-1 text-xs text-texto-suave">
                      Aprobada por {cuenta.aprobado_por} el{" "}
                      {fecha(cuenta.aprobado_en)}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                    cuenta.estado === "activo"
                      ? "bg-lima-suave text-verde-oscuro"
                      : "bg-fondo text-texto-suave"
                  }`}
                >
                  {ETIQUETA_ESTADO[cuenta.estado]}
                </span>

                {puedeEditar ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`cambiar-rol-${cuenta.id}`}>
                      Rol de {cuenta.nombre}
                    </label>
                    <select
                      id={`cambiar-rol-${cuenta.id}`}
                      className={claseSelector}
                      value={cuenta.rol ?? ""}
                      disabled={ocupado === cuenta.id}
                      onChange={(evento) => {
                        const nuevo = evento.target.value as Rol;

                        setConfirmacion({
                          titulo: "Cambiar rol",
                          mensaje: `${cuenta.nombre} pasará de ${cuenta.rol ? NOMBRE_ROL[cuenta.rol] : "sin rol"} a ${NOMBRE_ROL[nuevo]}.`,
                          textoBoton: "Cambiar rol",
                          peligro: false,
                          accion: () =>
                            ejecutar(cuenta.id, () =>
                              api(`/api/usuarios/${cuenta.id}`, {
                                method: "PATCH",
                                body: { rol: nuevo },
                              })
                            ),
                        });
                      }}
                    >
                      {opcionesRol.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {NOMBRE_ROL[opcion]}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={ocupado === cuenta.id}
                      onClick={() => {
                        const activar = cuenta.estado === "inactivo";

                        setConfirmacion({
                          titulo: activar ? "Activar cuenta" : "Desactivar cuenta",
                          mensaje: activar
                            ? `${cuenta.nombre} podrá volver a ingresar al panel.`
                            : `${cuenta.nombre} no podrá ingresar y su sesión actual se cerrará.`,
                          textoBoton: activar ? "Activar" : "Desactivar",
                          peligro: !activar,
                          accion: () =>
                            ejecutar(cuenta.id, () =>
                              api(`/api/usuarios/${cuenta.id}`, {
                                method: "PATCH",
                                body: { estado: activar ? "activo" : "inactivo" },
                              })
                            ),
                        });
                      }}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                        cuenta.estado === "inactivo"
                          ? "border-borde text-verde-oscuro hover:bg-lima-suave"
                          : "border-borde text-peligro-fuerte hover:bg-peligro-suave"
                      }`}
                    >
                      {cuenta.estado === "inactivo" ? "Activar" : "Desactivar"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-texto-2 md:w-48 md:text-right">
                    {cuenta.rol ? NOMBRE_ROL[cuenta.rol] : "Sin rol"}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {confirmacion && (
        <Modal
          etiqueta="Confirmar"
          titulo={confirmacion.titulo}
          onCerrar={() => setConfirmacion(null)}
          pie={
            <>
              <button
                type="button"
                onClick={() => setConfirmacion(null)}
                className="rounded-xl border border-borde px-5 py-3 text-sm font-semibold text-texto transition hover:bg-fondo"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { accion } = confirmacion;

                  setConfirmacion(null);
                  await accion();
                }}
                className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  confirmacion.peligro
                    ? "bg-[#9d3a2e] text-white hover:bg-[#7e2c22]"
                    : "bg-boton text-sobre-boton hover:bg-boton-hover"
                }`}
              >
                {confirmacion.textoBoton}
              </button>
            </>
          }
        >
          <p className="text-sm text-texto-2">{confirmacion.mensaje}</p>
        </Modal>
      )}
    </div>
  );
}

function Encabezado() {
  return (
    <section className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-verde">
        Administración
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-texto">
        CUENTAS
      </h1>
      <p className="mt-2 text-sm text-texto-suave">
        Aprueba solicitudes, asigna roles y desactiva accesos.
      </p>
    </section>
  );
}
