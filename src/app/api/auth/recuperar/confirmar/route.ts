import bcrypt from "bcryptjs";
import { canjearCodigo } from "@/lib/auth/codigos";
import { db } from "@/lib/auth/db";
import { leerJson, manejarErrores } from "@/lib/auth/errores";
import { esquemaConfirmarRecuperar } from "@/lib/auth/validacion";

export const POST = manejarErrores(async (request: Request) => {
  const { correo, codigo, password } = esquemaConfirmarRecuperar.parse(
    await leerJson(request)
  );

  await canjearCodigo(correo, "recuperar", codigo);

  await db().query(
    "UPDATE usuarios SET password_hash = $1 WHERE correo = $2",
    [await bcrypt.hash(password, 10), correo]
  );

  return Response.json({ ok: true });
});
