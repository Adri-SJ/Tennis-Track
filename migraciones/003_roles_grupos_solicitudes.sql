-- Los roles quedan en Entrenador y Administrador.

DROP INDEX usuarios_un_superadmin;

ALTER TABLE usuarios ALTER COLUMN rol TYPE text;

UPDATE usuarios SET rol = 'admin' WHERE rol = 'superadmin';
UPDATE usuarios SET rol = 'entrenador' WHERE rol = 'recepcion';

DROP TYPE rol_usuario;

CREATE TYPE rol_usuario AS ENUM ('entrenador', 'admin');

ALTER TABLE usuarios ALTER COLUMN rol TYPE rol_usuario USING rol::rol_usuario;

-- Grupos de Twenty que atiende cada entrenador.

CREATE TABLE grupos_entrenadores (
  usuario_id  integer NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  grupo_id    text NOT NULL,
  asignado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, grupo_id)
);

-- Material que piden los entrenadores; el administrador lo aprueba o rechaza.

CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobada', 'rechazada');

CREATE TABLE solicitudes_material (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id      integer NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  articulo_id     text NOT NULL,
  articulo_nombre text NOT NULL,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  nota            text NOT NULL DEFAULT '',
  estado          estado_solicitud NOT NULL DEFAULT 'pendiente',
  resuelta_por    integer REFERENCES usuarios (id) ON DELETE SET NULL,
  resuelta_en     timestamptz,
  creada_en       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX solicitudes_material_pendientes
  ON solicitudes_material (creada_en)
  WHERE estado = 'pendiente';
