# Despliegue de TennisTrack

Todo corre en un solo servidor con Docker. `docker-compose.yml` levanta seis contenedores:

| Contenedor | Qué es |
|---|---|
| `caddy` | HTTPS automático para los dos subdominios |
| `panel` | El panel de TennisTrack (se construye con el `Dockerfile` de la raíz) |
| `server`, `worker` | Twenty v2.37.0 (imagen oficial) |
| `db` | PostgreSQL 16 con dos bases: `default` (Twenty) y `tennistrack` (cuentas del panel) |
| `redis` | Cola y caché de Twenty |

Las imágenes funcionan en servidores x86 y ARM. Alcanza con un VPS de **4 GB de RAM** (por ejemplo, Hostinger KVM 1): todo junto usa cerca de 1.8 GB.

## 1. Preparar el servidor

1. Crea el VPS con **Ubuntu 24.04** (en Hostinger, la plantilla «Ubuntu 24.04 con Docker» ya trae Docker).
   Entra por SSH con el usuario e IP que te da el proveedor: `ssh root@IP_DEL_SERVIDOR`.
2. Si Docker no viene instalado:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Agrega 2 GB de memoria de intercambio (swap). Con 4 GB de RAM evita que la construcción del panel se quede sin memoria:
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```
4. Abre solo los puertos necesarios (SSH, HTTP y HTTPS). Si el proveedor tiene firewall en su panel, abre ahí también 80 y 443:
   ```bash
   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
   ```
5. En el DNS del dominio crea dos registros **A** hacia la IP pública del servidor: uno para el panel y otro para Twenty
   (por ejemplo `tennistrack` y `twenty`). Ponlos también en `DOMINIO_PANEL` y `DOMINIO_TWENTY` del paso 2.

## 2. Configurar

```bash
git clone https://github.com/Adri-SJ/Tennis-Track.git
cd Tennis-Track/deploy
cp .env.example .env
nano .env
```

- Genera cada contraseña o secreto con `openssl rand -hex 24` (solo letras y números).
- **Copia `ENCRYPTION_KEY` (y `APP_SECRET`, si existe) del `.env` de la copia oficial de Twenty** (`~/Projects/twenty-crm/packages/twenty-docker/.env`) a `TWENTY_ENCRYPTION_KEY` y `TWENTY_APP_SECRET`. Si no hay `APP_SECRET`, déjalo vacío.
- `TWENTY_API_KEY`, `SMTP_PASS` y `CORREO_REMITENTE`: los mismos valores del `.env.local` de desarrollo.

## 3. Restaurar los datos de Twenty

La copia oficial es el Twenty de la Mac de desarrollo (puerto 3001). En esa Mac, saca el respaldo y los archivos subidos:

```bash
docker exec twenty-db-1 pg_dump -U postgres -d default -Fc -f /tmp/twenty.dump
docker cp twenty-db-1:/tmp/twenty.dump ./twenty.dump
docker cp twenty-server-1:/app/packages/twenty-server/.local-storage ./twenty-archivos
```

Súbelos al servidor (por ejemplo con `scp`) a `deploy/respaldo/` y restaura:

```bash
mkdir -p respaldo
# deja aquí twenty.dump y la carpeta twenty-archivos
./restaurar-twenty.sh
```

El script detiene Twenty, reemplaza su base con el respaldo, copia los archivos subidos y levanta todo.
La primera vez tarda unos minutos porque construye el panel y Caddy pide los certificados.

## 4. Primer administrador

Las cuentas del panel empiezan vacías en el servidor:

```bash
docker compose exec panel node scripts/admin.mts
```

## 5. Comprobar

- `https://twenty.ozkytech.com` abre Twenty con los datos de siempre.
- `https://tennistrack.ozkytech.com` abre el login del panel.
- Si el panel no muestra datos de Twenty, genera una API key nueva en Twenty
  (Settings → APIs & Webhooks), ponla en `TWENTY_API_KEY` y corre `docker compose up -d`.

## Mantenimiento

| Tarea | Comando (desde `deploy/`) |
|---|---|
| Ver registros | `docker compose logs -f panel` (o `server`) |
| Actualizar el panel | `git pull && docker compose up -d --build panel` |
| Respaldar Twenty | `docker compose exec -T db pg_dump -U postgres -d default -Fc > twenty-$(date +%F).dump` |
| Respaldar cuentas | `docker compose exec -T db pg_dump -U postgres -d tennistrack -Fc > cuentas-$(date +%F).dump` |

Las migraciones de la base de cuentas se aplican solas cada vez que arranca el panel.
