# Implementación de autenticación

## Resumen
- Se implementó un flujo completo de autenticación para el proyecto usando NestJS en el backend y una interfaz más pulida en el frontend.
- Se añadieron registro, login, logout y acceso al perfil con protección mediante JWT.
- Se mejoró la experiencia de usuario con una interfaz más limpia, manejo de tokens más seguro y respuestas de error más claras en el backend.

## Qué se añadió

### Backend
- Se creó un módulo de autenticación con controlador, servicio, guard y DTOs.
- Se añadieron endpoints para:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - GET /auth/me
  - GET /auth/health
- Se implementó el hashing de contraseñas con bcrypt.
- Se añadió autenticación basada en JWT y rutas protegidas.
- Se agregó validación para los datos de login y registro.
- Se mejoró el manejo de errores relacionados con la conexión a la base de datos y credenciales inválidas.
- Se activó CORS y validación global en el punto de entrada de NestJS.

### Frontend
- Se construyó un formulario de login/registro con Material UI y Material Icons.
- Se persistió el JWT en localStorage y se reutilizó para peticiones autenticadas.
- Se añadió la carga del perfil tras iniciar sesión y el manejo del logout.
- Se evitó el problema de hidratación al retrasar el renderizado dependiente del navegador hasta que el cliente está listo.
- Se simplificó la estructura visual para ofrecer una experiencia más limpia.

## Archivos principales involucrados

### Backend
- [backend/src/auth/auth.controller.ts](../backend/src/auth/auth.controller.ts)
- [backend/src/auth/auth.service.ts](../backend/src/auth/auth.service.ts)
- [backend/src/auth/auth.module.ts](../backend/src/auth/auth.module.ts)
- [backend/src/auth/dto.ts](../backend/src/auth/dto.ts)
- [backend/src/auth/jwt-auth.guard.ts](../backend/src/auth/jwt-auth.guard.ts)
- [backend/src/main.ts](../backend/src/main.ts)
- [backend/src/prisma/prisma.service.ts](../backend/src/prisma/prisma.service.ts)
- [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)

### Frontend
- [frontend/src/app/page.tsx](../frontend/src/app/page.tsx)
- [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx)

## Puntos destacados de la implementación
- El flujo de registro almacena una contraseña cifrada y crea el usuario en MongoDB.
- El flujo de login valida las credenciales, genera un JWT y devuelve la información del usuario autenticado.
- La ruta protegida del perfil lee el token de la solicitud y devuelve el usuario actual.
- El endpoint de health revisa la conexión con la base de datos y devuelve un mensaje de estado claro.
- El campo de nombre es opcional en el registro y no se requiere en el login.

## Verificación
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
3. Abrir http://localhost:3000 y probar:
   - registro de usuario
   - login con JWT
   - acceso a la vista protegida del perfil
   - flujo de logout

## Notas
- El backend necesita una URI válida de MongoDB y un secret JWT configurado en el entorno.
- El formulario de login usa solo email y contraseña; el campo de nombre se reserva para el registro.
- La actualización más reciente del frontend también resolvió el problema de hidratación al evitar el renderizado prematuro dependiente del navegador.