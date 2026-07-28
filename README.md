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

## Cómo probarlo localmente

1. Iniciar el backend:
   - `cd backend && npm run start:dev`
2. Iniciar el frontend:
   - `cd frontend && npm run dev`
3. Abrir http://localhost:3000 en el navegador
