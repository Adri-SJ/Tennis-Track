import { z } from "zod";
import { ROLES } from "@/lib/permisos";

export const correo = z
  .string({ error: "Escribe tu correo" })
  .trim()
  .pipe(z.email("Correo no válido"))
  .transform((valor) => valor.toLowerCase());

export const password = z
  .string({ error: "Escribe tu contraseña" })
  .min(8, "La contraseña debe tener al menos 8 caracteres");

export const codigo = z
  .string({ error: "Escribe el código" })
  .regex(/^\d{6}$/, "El código tiene 6 dígitos");

export const nombre = z
  .string({ error: "Escribe tu nombre" })
  .trim()
  .min(2, "Escribe tu nombre");

export const rol = z.enum(ROLES, { error: "Elige un rol válido" });

export const esquemaLogin = z.object({
  correo,
  password: z.string({ error: "Escribe tu contraseña" }).min(1, "Escribe tu contraseña"),
});

export const esquemaRegistro = z.object({ nombre, correo, password });

export const esquemaConfirmarRegistro = z.object({ correo, codigo });

export const esquemaRecuperar = z.object({ correo });

export const esquemaConfirmarRecuperar = z.object({ correo, codigo, password });

export const esquemaAprobar = z.object({ rol });

export const esquemaActualizarUsuario = z
  .object({
    rol: rol.optional(),
    estado: z
      .enum(["activo", "inactivo"], { error: "Estado no válido" })
      .optional(),
  })
  .refine((datos) => datos.rol || datos.estado, "No hay cambios que guardar");
