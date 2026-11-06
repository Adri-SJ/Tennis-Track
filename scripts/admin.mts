/*
  Crea un administrador de TennisTrack.
  Uso: npm run admin
  También acepta ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD.

  Si el correo ya tiene cuenta, la activa como administrador y le
  cambia la contraseña.
*/
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local se usan las variables del entorno.
}

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env.local.");
  process.exit(1);
}

async function preguntar(texto: string): Promise<string> {
  const lector = createInterface({ input: stdin, output: stdout });

  try {
    return (await lector.question(texto)).trim();
  } finally {
    lector.close();
  }
}

/* Lee la contraseña sin mostrarla en pantalla. */
function preguntarOculto(texto: string): Promise<string> {
  return new Promise((resolver, rechazar) => {
    if (!stdin.isTTY) {
      rechazar(
        new Error("Sin terminal interactiva: usa ADMIN_PASSWORD.")
      );
      return;
    }

    stdout.write(texto);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let valor = "";

    const alTeclear = (tecla: string) => {
      for (const caracter of tecla) {
        if (caracter === "\r" || caracter === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", alTeclear);
          stdout.write("\n");
          resolver(valor);
          return;
        }

        if (caracter === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }

        if (caracter === "\u007f" || caracter === "\b") {
          valor = valor.slice(0, -1);
        } else {
          valor += caracter;
        }
      }
    };

    stdin.on("data", alTeclear);
  });
}

async function pedirPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }

  for (;;) {
    const primera = await preguntarOculto("Contraseña (mínimo 8 caracteres): ");

    if (primera.length < 8) {
      console.log("La contraseña debe tener al menos 8 caracteres.");
      continue;
    }

    const segunda = await preguntarOculto("Repite la contraseña: ");

    if (primera === segunda) {
      return primera;
    }

    console.log("Las contraseñas no coinciden. Inténtalo de nuevo.");
  }
}

const nombre =
  process.env.ADMIN_NOMBRE?.trim() || (await preguntar("Nombre: "));
const correo = (
  process.env.ADMIN_CORREO || (await preguntar("Correo: "))
)
  .trim()
  .toLowerCase();

if (nombre.length < 2) {
  console.error("Escribe tu nombre (mínimo 2 caracteres).");
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
  console.error("Correo no válido.");
  process.exit(1);
}

const password = await pedirPassword();

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });

await cliente.connect();

try {
  const { rowCount } = await cliente.query(
    `UPDATE usuarios
        SET rol = 'admin', estado = 'activo', password_hash = $1,
            nombre = $2, aprobado_en = COALESCE(aprobado_en, now())
      WHERE correo = $3`,
    [hash, nombre, correo]
  );

  if (rowCount) {
    console.log(`La cuenta ${correo} ahora es administrador.`);
  } else {
    await cliente.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, estado, aprobado_en)
       VALUES ($1, $2, $3, 'admin', 'activo', now())`,
      [nombre, correo, hash]
    );
    console.log(`Administrador ${correo} creado.`);
  }
} finally {
  await cliente.end();
}
