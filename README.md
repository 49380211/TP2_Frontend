https://vercel.com/49380211-1280s-projects/tp-2-frontend/3PR5fLdWNrP1amncyKfr3LufY5ra

CineVault — Catálogo Personal de Películas
Aplicación web para gestionar tu catálogo personal de películas: podés agregar, editar, puntuar y filtrar películas, con login de usuarios y datos guardados en la nube.

Stack
CapaTecnologíaFrontendAstroBackend / Auth / DBSupabaseDespliegueVercel

Funcionalidades
Registro, inicio y cierre de sesión
Agregar, editar y eliminar películas
Estados: Vista / Pendiente
Marcar como favorita
Puntaje de 1 a 5 estrellas
Reseña personal
Búsqueda por título o director
Filtros por estado, género y favoritas
Cada usuario solo ve sus propias películas (RLS en Supabase)

Estructura del proyecto
src/
├── layouts/
│   └── Layout.astro         # Layout base con navbar
├── pages/
│   ├── index.astro           # Landing page
│   ├── login.astro
│   ├── register.astro
│   ├── catalog.astro         # Catálogo con filtros
│   ├── add.astro
│   ├── movie/[id].astro      # Detalle de película
│   ├── edit/[id].astro
│   └── api/
│       ├── auth/             # login, register, logout
│       └── movies/           # add, edit, delete, toggle-favorite
├── lib/
│   └── supabase.js
└── styles/
    └── global.css

Correr el proyecto localmente
bashgit clone https://github.com/TU_USUARIO/film-catalog.git
cd film-catalog
npm install
cp .env.example .env
# Completar .env con las credenciales de Supabase
npm run dev

Variables de entorno
envPUBLIC_SUPABASE_URL=https://tu-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
Se obtienen en: Supabase Dashboard → Project Settings → API.

Base de datos
El esquema SQL está en supabase/schema.sql. Ejecutarlo en el SQL Editor de Supabase.

Por qué estas tecnologías
Astro con SSR: permite manejar la autenticación del lado del servidor, sin exponer tokens al cliente. Las cookies httpOnly protegen los tokens de sesión contra XSS.

Supabase: combina auth y base de datos en un mismo servicio con un SDK simple. Las políticas RLS aseguran que cada usuario solo acceda a sus propias películas, sin lógica extra en el backend.

Vercel: tiene soporte nativo para Astro con adaptador SSR y deploys automáticos desde GitHub.
Autores

Integrantes:
Augusto Gercovich
Nicolas Atalah

Gracias por leer Ivo.