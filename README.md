# TennisTrack

Panel de administración para una academia de tenis. Lee y guarda todos los datos en un workspace de [Twenty CRM](https://twenty.com) a través de su API REST.

## Módulos

| Módulo | Qué hace | Objetos de Twenty |
|---|---|---|
| Resumen | Indicadores generales de la academia | varios |
| Alumnos | Alta, edición, perfil e historial de grupos; cambio de grupo | `people` |
| Grupos | Alta y edición de grupos con días, horario, nivel y capacidad | `grupos` |
| Horario semanal | Vista de los grupos por día y hora | `grupos` |
| Inscripciones | Inscribir alumnos en grupos y editar fechas y estado | `inscripciones` |
| Asistencia | Pase de lista por grupo y fecha | `asistencias` |
| Pagos | Mensualidades, pagos y cancelaciones | `mensualidades`, `pagos` |
| Desarrollo deportivo | Evaluaciones de saque, derecha, revés, volea y condición física | `evaluaciones` |
| Inventario | Artículos, existencias y movimientos | `articulos`, `movimientosInventario` |
| Prospectos | Seguimiento de interesados y conversión en alumnos | `prospectos`, `people` |

## Tecnología

- [Next.js](https://nextjs.org) 16 (App Router, Server Components y Server Actions)
- React 19, TypeScript y Tailwind CSS 4
- Íconos de [lucide-react](https://lucide.dev)
- Acceso: PostgreSQL propio (`pg`), `jose` (JWT), `bcryptjs`, `zod` y `nodemailer`

## Cómo correrlo

Requiere Node.js 22 o superior, Docker (para PostgreSQL) y acceso a un workspace de Twenty con los objetos de la tabla anterior.

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y llena los valores:

   | Variable | Para qué sirve |
   |---|---|
   | `TWENTY_API_URL` | URL del backend de Twenty, sin `/` al final |
   | `TWENTY_API_KEY` | Clave de API de Twenty (Settings → APIs & Webhooks) |
   | `DATABASE_URL` | Base de PostgreSQL de las cuentas de acceso |
   | `JWT_SECRET` | Secreto para firmar la sesión (`openssl rand -base64 48`) |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Servidor de correo para los códigos (465 = TLS, 587 = STARTTLS) |
   | `CORREO_REMITENTE` | Remitente, por ejemplo `TennisTrack <no-reply@dominio.com>` |

3. Levanta PostgreSQL y crea las tablas:

   ```bash
   docker compose up -d
   npm run migrar
   ```

4. Crea el primer superadmin. Pide nombre, correo y contraseña (oculta, dos veces):

   ```bash
   npm run superadmin
   ```

   También acepta `SUPERADMIN_NOMBRE`, `SUPERADMIN_CORREO` y `SUPERADMIN_PASSWORD`. Solo puede haber un superadmin: si ya existe con ese correo, le cambia la contraseña; si el correo ya tenía cuenta, la promueve.

5. Levanta el servidor de desarrollo y abre http://localhost:3000:

   ```bash
   npm run dev
   ```

Otros comandos: `npm run build` (compilación de producción), `npm start` (servir la compilación) y `npm run lint`.

## Inicio de sesión y cuentas

- **Cuentas:** viven en PostgreSQL (`usuarios` y `codigos_verificacion`, migraciones en `migraciones/`), separadas de Twenty.
- **Registro:** «Crear cuenta» envía un código de 6 dígitos al correo. Al confirmarlo la cuenta queda **pendiente**, sin rol, hasta que un administrador la apruebe en **Cuentas** (`/cuentas`).
- **Recuperar contraseña:** también con código por correo.
- **Roles:** `entrenador`, `recepcion`, `admin` y `superadmin`. Qué módulos ve cada uno está en `src/lib/permisos.ts`. El admin asigna entrenador y recepción; solo el superadmin asigna o modifica administradores.
- **Sesión:** un JWT con `{ id }` en una cookie `httpOnly` que dura 16 h. `src/proxy.ts` revisa la firma; las páginas, las Server Actions y la API vuelven a leer la cuenta en la base, así que desactivar una cuenta corta su acceso de inmediato.
- **Límites:** 10 intentos de ingreso por minuto por IP; códigos de 15 minutos con 5 intentos y un reenvío cada 60 s.

### Correo con Resend

Los códigos se envían por el SMTP de [Resend](https://resend.com):

| Variable | Valor |
|---|---|
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | La API key de Resend (`re_…`, permiso *Sending access*) |
| `CORREO_REMITENTE` | `TennisTrack <onboarding@resend.dev>` mientras no haya dominio verificado |

Sin dominio verificado, Resend solo entrega al correo dueño de la cuenta de Resend. Para enviar a cualquier persona, verifica el dominio de la academia en *Domains* (registros DNS) y cambia el remitente a, por ejemplo, `TennisTrack <no-reply@dominio.com>`.

### Probar el flujo en desarrollo

Con `SMTP_HOST` vacío no se envían correos: el código aparece en la consola de `npm run dev` como `[correo de desarrollo] Para: … | Código: 123456`.

1. Ingresa con el superadmin.
2. En otra ventana privada, usa «Crear cuenta», copia el código de la consola y confírmalo.
3. Con el superadmin, abre **Cuentas**, elige un rol y aprueba la cuenta nueva.
4. Ingresa con la cuenta nueva: el menú solo muestra los módulos de su rol.
5. Prueba «¿Olvidaste tu contraseña?» con el código de la consola.

## Estructura

```
src/
  app/          páginas por módulo y sus Server Actions (actions.ts)
  components/   diseño (barra lateral, navegación móvil) y formularios compartidos
  app/api/      API de acceso (auth) y de gestión de cuentas (usuarios)
  lib/          acceso a Twenty por módulo, tipos y permisos
  lib/auth/     sesión, base de usuarios, códigos, correo y validación
  proxy.ts      exige sesión en todas las rutas salvo /login
migraciones/    SQL numerado de la base de usuarios
scripts/        migrar y crear el superadmin
```

La clave de Twenty y la base de usuarios solo se usan en el servidor (`src/lib/api.ts` y `src/lib/auth/*` con `server-only`). Los componentes de cliente solo importan tipos de ahí, más `src/lib/permisos.ts` y `src/lib/auth/cliente.ts`, que no tienen secretos.
