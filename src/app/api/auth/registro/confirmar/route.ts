import { canjearCodigo } from "@/lib/auth/codigos";
import { db } from "@/lib/auth/db";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { esquemaConfirmarRegistro } from "@/lib/auth/validacion";

/* Crea la cuenta pendiente y sin rol; un administrador la aprueba. */
export const POST = manejarErrores(async (request: Request) => {
  const { correo, codigo } = esquemaConfirmarRegistro.parse(
    await leerJson(request)
  );

  const datos = await canjearCodigo(correo, "registro", codigo);

  if (
    typeof datos?.nombre !== "string" ||
    typeof datos?.password_hash !== "string"
  ) {
    throw new ErrorHttp(400, "El código no es válido. Vuelve a registrarte.");
  }

  try {
    await db().query(
      `INSERT INTO usuarios (nombre, correo, password_hash)
       VALUES ($1, $2, $3)`,
      [datos.nombre, correo, datos.password_hash]
    );
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new ErrorHttp(409, "Ya existe una cuenta con ese correo");
    }

    throw error;
  }

  return Response.json({ ok: true }, { status: 201 });
});
