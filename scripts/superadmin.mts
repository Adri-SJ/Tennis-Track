/*
  Crea el superadmin de TennisTrack (solo puede haber uno).
  Uso: npm run superadmin
  También acepta SUPERADMIN_NOMBRE, SUPERADMIN_CORREO y SUPERADMIN_PASSWORD.

  - Si ya existe un superadmin con ese correo, le cambia la contraseña.
  - Si el correo ya tenía cuenta, la promueve a superadmin.
  - Si existe otro superadmin con otro correo, no hace nada.
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
        new Error("Sin terminal interactiva: usa SUPERADMIN_PASSWORD.")
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
  if (process.env.SUPERADMIN_PASSWORD) {
    return process.env.SUPERADMIN_PASSWORD;
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
  process.env.SUPERADMIN_NOMBRE?.trim() || (await preguntar("Nombre: "));
const correo = (
  process.env.SUPERADMIN_CORREO || (await preguntar("Correo: "))
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
  const { rows: superadmins } = await cliente.query<{ correo: string }>(
    "SELECT correo FROM usuarios WHERE rol = 'superadmin'"
  );

  const actual = superadmins[0];

  if (actual && actual.correo !== correo) {
    console.error(
      `Ya existe un superadmin (${actual.correo}). Solo puede haber uno.`
    );
    process.exit(1);
  }

  if (actual) {
    await cliente.query(
      "UPDATE usuarios SET password_hash = $1, nombre = $2 WHERE correo = $3",
      [hash, nombre, correo]
    );
    console.log(`Contraseña del superadmin ${correo} actualizada.`);
  } else {
    const { rowCount } = await cliente.query(
      `UPDATE usuarios
          SET rol = 'superadmin', estado = 'activo', password_hash = $1,
              nombre = $2, aprobado_en = COALESCE(aprobado_en, now())
        WHERE correo = $3`,
      [hash, nombre, correo]
    );

    if (rowCount) {
      console.log(`La cuenta ${correo} ahora es superadmin.`);
    } else {
      await cliente.query(
        `INSERT INTO usuarios (nombre, correo, password_hash, rol, estado, aprobado_en)
         VALUES ($1, $2, $3, 'superadmin', 'activo', now())`,
        [nombre, correo, hash]
      );
      console.log(`Superadmin ${correo} creado.`);
    }
  }
} finally {
  await cliente.end();
}
