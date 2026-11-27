-- Superadministrador: puede todo lo del administrador y los
-- administradores normales no ven su cuenta.

ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'superadmin';
