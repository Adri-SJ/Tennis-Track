-- Cuentas de acceso al panel. Los datos de la academia viven en Twenty.

CREATE TYPE estado_usuario AS ENUM ('pendiente', 'activo', 'rechazado', 'inactivo');

CREATE TYPE rol_usuario AS ENUM ('entrenador', 'recepcion', 'admin', 'superadmin');

CREATE TABLE usuarios (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        text NOT NULL,
  correo        text NOT NULL UNIQUE CHECK (correo = lower(btrim(correo))),
  password_hash text NOT NULL,
  rol           rol_usuario,
  estado        estado_usuario NOT NULL DEFAULT 'pendiente',
  aprobado_por  integer REFERENCES usuarios (id) ON DELETE SET NULL,
  aprobado_en   timestamptz,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_activo_con_rol CHECK (estado <> 'activo' OR rol IS NOT NULL)
);

-- Solo puede existir un superadmin.
CREATE UNIQUE INDEX usuarios_un_superadmin ON usuarios ((true)) WHERE rol = 'superadmin';
