import bcrypt from "bcryptjs";
import { emitirCodigo } from "@/lib/auth/codigos";
import { correoConfigurado } from "@/lib/auth/correo";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { buscarPorCorreo } from "@/lib/auth/usuarios";
import { esquemaRegistro } from "@/lib/auth/validacion";

/*
  La cuenta todavía no se crea: nombre y hash viajan en los datos
  del código y se guardan al confirmarlo.
*/
export const POST = manejarErrores(async (request: Request) => {
  const { nombre, correo, password } = esquemaRegistro.parse(
    await leerJson(request)
  );

  if (await buscarPorCorreo(correo)) {
    throw new ErrorHttp(409, "Ya existe una cuenta con ese correo");
  }

  await emitirCodigo(correo, "registro", {
    nombre,
    password_hash: await bcrypt.hash(password, 10),
  });

  return Response.json({ ok: true, correo_configurado: correoConfigurado() });
});
