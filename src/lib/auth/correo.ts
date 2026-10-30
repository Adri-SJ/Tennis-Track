import "server-only";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { ErrorHttp } from "./errores";
import type { Proposito } from "./codigos";

const MARCA = "TennisTrack";

export function correoConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

function transporte() {
  const puerto = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: puerto === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    connectionTimeout: 10_000,
  });
}

const ACCION: Record<Proposito, string> = {
  registro: "confirmar tu cuenta",
  recuperar: "cambiar tu contraseña",
};

function html(codigo: string, proposito: Proposito): string {
  const digitos = codigo
    .split("")
    .map(
      (digito) =>
        `<span style="display:inline-block;width:40px;margin:0 3px;padding:10px 0;border-radius:10px;background:#f6f4ee;border:1px solid #e1dace;font-size:30px;font-weight:800;color:#141113;">${digito}</span>`
    )
    .join("");

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#f6f4ee;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#141113;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border:1px solid #e1dace;border-radius:20px;">
            <tr>
              <td align="center" style="padding:28px 28px 8px;">
                <img src="cid:logo-tennistrack" width="180" alt="${MARCA}" style="display:block;border:0;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 28px 0;font-size:16px;line-height:1.4;">
                Usa este código para ${ACCION[proposito]}:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 20px;white-space:nowrap;">${digitos}</td>
            </tr>
            <tr>
              <td align="center" style="padding:0 28px 28px;font-size:14px;line-height:1.5;color:#8c847d;">
                Vence en 15 minutos.<br />
                Si no lo pediste, ignora este correo.
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#8c847d;">${MARCA} · Academia de tenis</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/*
  Envía el código. Sin SMTP_HOST, en desarrollo lo imprime en la
  consola y en producción responde 503.
*/
export async function enviarCodigo(
  correo: string,
  codigo: string,
  proposito: Proposito
): Promise<void> {
  if (!correoConfigurado()) {
    if (process.env.NODE_ENV === "production") {
      throw new ErrorHttp(503, "El envío de correos no está configurado");
    }

    console.log(`[correo de desarrollo] Para: ${correo} | Código: ${codigo}`);

    return;
  }

  try {
    await transporte().sendMail({
      from: process.env.CORREO_REMITENTE,
      to: correo,
      subject: `${codigo} es tu código de ${MARCA}`,
      text: [
        `Usa este código para ${ACCION[proposito]}: ${codigo}`,
        "",
        "Vence en 15 minutos.",
        "Si no lo pediste, ignora este correo.",
        "",
        `${MARCA} · Academia de tenis`,
      ].join("\n"),
      html: html(codigo, proposito),
      attachments: [
        {
          filename: "logo-tennistrack.png",
          path: join(process.cwd(), "public", "logo-tennistrack.png"),
          cid: "logo-tennistrack",
        },
      ],
    });
  } catch (error) {
    console.error("No se pudo enviar el correo:", error);

    throw new ErrorHttp(
      503,
      "No se pudo enviar el correo. Revisa que haya conexión a internet e inténtalo de nuevo."
    );
  }
}
