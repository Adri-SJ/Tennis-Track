import "server-only";
import { db } from "./db";
import type { Rol } from "@/lib/permisos";

export type EstadoUsuario = "pendiente" | "activo" | "rechazado" | "inactivo";

export type UsuarioCompleto = {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  rol: Rol | null;
  estado: EstadoUsuario;
};

export async function buscarPorCorreo(
  correo: string
): Promise<UsuarioCompleto | null> {
  const { rows } = await db().query<UsuarioCompleto>(
    `SELECT id, nombre, correo, password_hash, rol, estado
       FROM usuarios WHERE correo = $1`,
    [correo]
  );

  return rows[0] ?? null;
}

export async function buscarPorId(id: number): Promise<UsuarioCompleto | null> {
  const { rows } = await db().query<UsuarioCompleto>(
    `SELECT id, nombre, correo, password_hash, rol, estado
       FROM usuarios WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}
