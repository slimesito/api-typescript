# 📚 Prueba Técnica API RESTful (TypeScript)

Esta es una API RESTful profesional construida con TypeScript, Node.js y Express. El proyecto implementa una arquitectura modular escalable, autenticación JWT, trabajos en segundo plano (Jobs) y manejo de base de datos con Prisma ORM y SQLite.

## 🚀 Características Principales

-   **Autenticación Segura:** Login, Registro y Logout mediante JWT.
-   **Arquitectura Modular:** Código organizado por módulos (Auth,
    Authors, Books) para alta escalabilidad.
-   **Background Jobs:** Sistema de eventos para actualizar contadores
    automáticamente (Observer Pattern).
-   **Validaciones Robustas:** Uso de Zod para validar todas las
    peticiones (FormRequest pattern).
-   **Exportación de Datos:** Endpoints dedicados para descargar
    reportes en formato Excel (.xlsx).
-   **Docker Ready:** Configuración optimizada (Debian Slim) lista para
    despliegue.
-   **Base de Datos:** SQLite gestionado mediante Prisma ORM.

## 🛠️ Tecnologías

-   TypeScript
-   Node.js & Express
-   Prisma ORM (SQLite)
-   Docker
-   Zod (Validaciones)
-   Jest (Testing)

## 📦 Estructura del Proyecto

    src/
    ├── config/          # Variables de entorno centralizadas
    ├── core/            # Utilidades compartidas (Excel, EventBus, Response Handler)
    ├── jobs/            # Lógica de tareas en segundo plano (Listeners)
    ├── middlewares/     # Middlewares de Auth y Validación
    ├── modules/         # Lógica de negocio (Controladores, Rutas, Schemas)
    │   ├── auth/        # Login, Registro y Logout
    │   ├── authors/     # CRUD de Autores
    │   └── books/       # CRUD de Libros y Emisión de Eventos
    ├── app.ts           # Configuración de Express e inicio de Jobs
    └── server.ts        # Punto de entrada del servidor

## ⚙️ Instalación y Ejecución

### **Opción 1: Usando Docker (Recomendado) 🐳**

**Clonar el repositorio:**

``` bash
git clone https://github.com/slimesito/api-typescript.git
cd api-typescript
```

**Configurar Variables de Entorno:** Crea un archivo `.env`:

    PORT=3000
    NODE_ENV=development
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="mi_super_secreto_seguro_123"

**Construir y Correr:**

``` bash
docker-compose up --build
```

**Inicializar Base de Datos (solo la primera vez):**

``` bash
docker-compose exec api npx prisma migrate dev --name init
```

La API estará disponible en: **http://localhost:3000**

------------------------------------------------------------------------


## 🔗 Endpoints de la API

### 🔐 **Autenticación**

  Método   Endpoint             Descripción                      Requiere Auth
  -------- -------------------- -------------------------------- ---------------
  POST     /api/auth/register   Registrar nuevo usuario          ❌
  POST     /api/auth/login      Iniciar sesión y obtener Token   ❌
  POST     /api/auth/logout     Cerrar sesión                    ✅

**Ejemplo Body (Login):**

``` json
{
  "email": "user@test.com",
  "password": "password123"
}
```

------------------------------------------------------------------------

### ✍️ **Autores**

  Método   Endpoint                    Descripción                Requiere Auth
  -------- --------------------------- -------------------------- ---------------
  GET      /api/authors                Listar todos los autores   ✅
  POST     /api/authors                Crear un nuevo autor       ✅
  GET      /api/authors/export/excel   Descargar reporte Excel    ✅

**Ejemplo Body (Crear Autor):**

``` json
{
  "name": "Gabriel García Márquez",
  "email": "gabo@macondo.com"
}
```

------------------------------------------------------------------------

### 📚 **Libros**

  Método   Endpoint                  Descripción                           Requiere Auth
  -------- ------------------------- ------------------------------------- ---------------
  GET      /api/books                Listar todos los libros               ✅
  POST     /api/books                Crear libro (Dispara Job de conteo)   ✅
  GET      /api/books/export/excel   Descargar reporte Excel               ✅

**Ejemplo Body (Crear Libro):**

``` json
{
  "title": "Cien Años de Soledad",
  "description": "Una novela épica",
  "authorId": 1
}
```

------------------------------------------------------------------------

## 🔄 Funcionamiento del Job (Escuchador)

-   El sistema implementa un Event Bus interno
    (`src/core/event-bus.ts`).
-   Cuando se crea un libro (`POST /books`), se emite el evento
    **BOOK_CREATED**.
-   Un listener en `src/jobs/book-counter.job.ts` detecta este evento.
-   El Job cuenta cuántos libros tiene el autor y actualiza el campo
    `bookCount` en la tabla **Authors**.

------------------------------------------------------------------------

## 🧪 Testing

El proyecto incluye dos modos de prueba:

### **1. Test Aislado (Recomendado) 🛡️**

Crea una base de datos temporal (`test.db`) y NO borra tus datos reales.

``` bash
docker-compose exec api npm run test:isolated
```

------------------------------------------------------------------------

## ⚠️ Solución de Problemas Comunes

### **Error: `The table main.User does not exist`**

**Causa:** La base de datos está vacía.\
**Solución:**

``` bash
docker-compose exec api npx prisma migrate dev
```

### **Error: `Email already exists` al registrar**

**Causa:** El usuario ya existe en la DB.\
**Solución:** Usa `/login` o borra `dev.db`.
