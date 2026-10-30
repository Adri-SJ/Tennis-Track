import { emitirCodigo } from "@/lib/auth/codigos";
import { correoConfigurado } from "@/lib/auth/correo";
import { leerJson, manejarErrores } from "@/lib/auth/errores";
import { esperarReenvioSinCuenta } from "@/lib/auth/limite";
import { buscarPorCorreo } from "@/lib/auth/usuarios";
import { esquemaRecuperar } from "@/lib/auth/validacion";

/* Responde igual exista o no el correo, incluida la espera de 60 s. */
export const POST = manejarErrores(async (request: Request) => {
  const { correo } = esquemaRecuperar.parse(await leerJson(request));

  if (await buscarPorCorreo(correo)) {
    await emitirCodigo(correo, "recuperar");
  } else {
    esperarReenvioSinCuenta(`recuperar:${correo}`, 60);
  }

  return Response.json({ ok: true, correo_configurado: correoConfigurado() });
});
