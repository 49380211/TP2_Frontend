https://tp-2-frontend-h2ke931m1-49380211-1280s-projects.vercel.app/
CineVault: Catálogo de Películas
Aplicación web que gestiona tu catálogo de películas: podés agregar, editar, puntuar y filtrar películas, con login de usuarios y datos guardados en la nube (En Supabase).

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
│   └── Layout.astro        
├── pages/
│   ├── index.astro           # Página
│   ├── login.astro
│   ├── register.astro
│   ├── catalog.astro         # Catálogo con filtros
│   ├── add.astro
│   ├── movie/[id].astro      # Detalle de película
│   ├── edit/[id].astro
│   └── api/
│       ├── auth/             # login, registrar, logout guardado en supabase
│       └── movies/           # añdir, editar, borrar, favoritos
├── lib/
│   └── supabase.js
└── styles/
    └── global.css

Base de datos
Hecha en Supabase. 

Desplegado en Vercel

Integrantes:
Augusto Gercovich
Nicolas Atalah

Gracias por leer Ivo.