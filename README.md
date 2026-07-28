# Todo-App-NextJS

Todo-App-NextJS es una aplicación para la gestión de tareas personales por usuario. El sistema permite que cada usuario acceda a su propia cuenta y organice sus pendientes de forma independiente, marcando las tareas como completadas cuando ya fueron realizadas.

La idea principal del proyecto es ofrecer un flujo sencillo para administrar actividades diarias: cada usuario puede autenticarse, consultar su información y trabajar con sus propias tareas sin mezclarlas con las de otros usuarios. De esta forma, la aplicación funciona como un espacio personal para llevar control de lo que falta por hacer y de lo que ya se completó.

## Características principales

- Registro e inicio de sesión de usuarios.
- Gestión de tareas asociadas a cada usuario.
- Marcado de tareas como completadas.
- Separación entre frontend y backend.
- Persistencia de datos mediante base de datos.

## Tecnologías utilizadas

- Next.js para el frontend.
- NestJS para el backend.
- Prisma como ORM.
- MongoDB como base de datos.

## Instalación en entorno local

El proyecto está dividido en dos aplicaciones:

- `/backend`: API desarrollada con NestJS.
- `/frontend`: interfaz web desarrollada con Next.js.

### 1. Instalar dependencias del backend

Desde la raíz del proyecto, ejecutar:

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno del backend

En la carpeta `/backend`, crear el archivo `.env` a partir del archivo `.env.sample`:

```bash
cp .env.sample .env
```

Luego completar las siguientes variables:

| Variable | Descripción | Ejemplo local |
| --- | --- | --- |
| `MONGODB_URI` | Cadena de conexión a la base de datos MongoDB usada por Prisma. | `mongodb+srv://username:password@cluster_name.mongodb.net/todoappnextjs` |
| `PORT` | Puerto donde se ejecuta la API. Si no se define, el backend usa `4000`. | `4000` |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT de autenticación. | `local-secret-key` |
| `CORS_BASE_URL_1` | URL permitida para peticiones CORS desde el frontend local. | `http://localhost:3000` |
| `CORS_BASE_URL_2` | Segunda URL permitida para CORS, útil si se usa otro host o puerto. | `http://127.0.0.1:3000` |

### 3. Instalar dependencias del frontend

Desde la raíz del proyecto, ejecutar:

```bash
cd frontend
npm install
```

### 4. Configurar variables de entorno del frontend

En la carpeta `/frontend`, crear el archivo `.env` a partir del archivo `.env.sample`:

```bash
cp .env.sample .env
```

Luego completar la siguiente variable:

| Variable | Descripción | Ejemplo local |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_BASE_URL` | URL base de la API que consume el frontend desde el navegador. | `http://localhost:4000` |

## Compilación y verificación
- La compilación del frontend se completó correctamente en la terminal del workspace:
  - `cd frontend && npm run build`
- La compilación del backend debe comprobarse localmente con:
  - `cd backend && npm run build`
- Comprobación del endpoint de API para confirmar la conexión con MongoDB:
  - `curl http://localhost:4000/auth/health`

## Cómo probarlo localmente

1. Iniciar el backend:
   - `cd backend && npm run start:dev`
2. Iniciar el frontend:
   - `cd frontend && npm run dev`
3. Abrir http://localhost:3000 en el navegador
