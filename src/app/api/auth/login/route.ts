import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ErrorHttp, leerJson, manejarErrores } from "@/lib/auth/errores";
import { COOKIE_SESION, firmarToken, opcionesCookie } from "@/lib/auth/jwt";
import { ipDe, limitarIntentos } from "@/lib/auth/limite";
import { buscarPorCorreo } from "@/lib/auth/usuarios";
import { esquemaLogin } from "@/lib/auth/validacion";

/* Hash de relleno: sin cuenta también se compara, para tardar lo mismo. */
const HASH_RELLENO = bcrypt.hashSync("tennistrack-sin-cuenta", 10);

const MENSAJE_ESTADO = {
  pendiente:
    "Tu cuenta aún no ha sido aprobada. Pide a un administrador que la active.",
  rechazado: "Tu solicitud de cuenta fue rechazada.",
  inactivo: "Tu cuenta está desactivada.",
};

export const POST = manejarErrores(async (request: Request) => {
  limitarIntentos(`login:${ipDe(request)}`, 10, 60_000);

  const { correo, password } = esquemaLogin.parse(await leerJson(request));
  const usuario = await buscarPorCorreo(correo);
  const correcta = await bcrypt.compare(
    password,
    usuario?.password_hash ?? HASH_RELLENO
  );

  if (!usuario || !correcta) {
    throw new ErrorHttp(401, "Correo o contraseña incorrectos");
  }

  /* El estado solo se revela con la contraseña correcta. */
  if (usuario.estado !== "activo") {
    throw new ErrorHttp(403, MENSAJE_ESTADO[usuario.estado]);
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_SESION, await firmarToken(usuario.id), opcionesCookie);

  return Response.json({
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
  });
});
