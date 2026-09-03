# UV Archiver

Sistema digital de expedientes departamentales.

## Requisitos

- Node.js 18 o superior
- Base de datos PostgreSQL 14 o superior
- Base de datos MySQL 8 o superior
- npm v11+ o pnpm v11+

## Instalación

1. Clonacion del proyecto e instalación de dependencias

```bash
git clone https://github.com/FastingBits/UVArchiver
cd uvarchiver
#usadno npm
npm install
#o usando pnpm (recomendado)
pnpm install 
```

2. Configuración de variables de entorno
Configura las credenciales de tu base de datos para postgres|.

```bash
DB_HOST_PG=localhost
DB_USER_PG=postgres
DB_PASSWORD_PG=password
DB_NAME_PG=uvarchiver_db
DB_PORT_PG=5432
```

3. creacion de la base de datos en base a el esquema de base de datos en [pg_uvarchiver.sql](Db/pg_uvarchiver.sql) y la semilla para el primer usuario administrador [seed.js](Db/seed.js)

```bash
node Db/seed.js
```

4. Ejecucion del servidor en modo de desarrollo

```bash
npm run dev
#o usando pnpm (recomendado)
pnpm run dev
```