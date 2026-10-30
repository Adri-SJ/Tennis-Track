-- Códigos de 6 dígitos para confirmar el registro y recuperar la contraseña.

CREATE TYPE proposito_codigo AS ENUM ('registro', 'recuperar');

CREATE TABLE codigos_verificacion (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  correo      text NOT NULL,
  proposito   proposito_codigo NOT NULL,
  codigo_hash text NOT NULL,
  datos       jsonb,
  intentos    integer NOT NULL DEFAULT 0,
  creado_en   timestamptz NOT NULL DEFAULT now(),
  expira_en   timestamptz NOT NULL,
  usado_en    timestamptz
);

CREATE INDEX codigos_verificacion_vigentes
  ON codigos_verificacion (correo, proposito)
  WHERE usado_en IS NULL;
