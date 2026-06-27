# CALIDAD.md

## Estrategia general

El enfoque que elegimos es **pirámide de tests clásica adaptada al stack**: tests unitarios para la lógica de negocio pura, y un test E2E que cubre el flujo crítico de extremo a extremo. No intentamos testear todo: priorizamos lo que si falla rompe la aplicación para todos los usuarios (autenticación, integridad de datos) por sobre lo que si falla afecta un caso de uso secundario (filtros, visualización de estrellas en pantalla).

La lógica de validación y normalización de datos fue extraída a funciones puras en `src/lib/utils.js` específicamente para poder testearla sin levantar un servidor ni conectarse a Supabase. Esa separación no es un accidente: es una decisión de diseño orientada a la testeabilidad.

El pipeline de CI actúa como guardián: ningún código llega a producción sin pasar por lint, tests unitarios, tests E2E y build. Si cualquiera de esos pasos falla, el deploy no ocurre.

---

## Herramientas seleccionadas

**Vitest** para tests unitarios. Lo elegimos sobre Jest porque el proyecto usa Vite internamente (Astro lo usa como bundler), lo que significa que Vitest reutiliza la misma configuración sin plugins adicionales. Jest requeriría transformers para manejar los módulos ES. Vitest arranca más rápido y la API es idéntica a Jest, por lo que no hay curva de aprendizaje.

**Playwright** para tests E2E. Lo evaluamos contra Cypress. Playwright tiene mejor soporte para SSR (las páginas de Astro se renderizan server-side, no como SPA), no requiere un servidor separado para la instrumentación, y el modo `webServer` del config levanta y baja el servidor de desarrollo automáticamente. Cypress en su versión gratuita tiene limitaciones de paralelismo y el soporte para aplicaciones no-React es más frágil.

**ESLint con eslint-plugin-astro** para lint. El plugin específico de Astro detecta errores en la sintaxis de componentes `.astro` que ESLint estándar ignoraría. No evaluamos alternativas porque es el linter oficial del ecosistema.

**GitHub Actions** para CI/CD. Elegimos Actions sobre CircleCI o Travis porque el repo ya está en GitHub, la integración es nativa (acceso a secrets, contexto del PR, environments), y el tier gratuito cubre nuestro uso. Vercel CLI en el pipeline nos permite controlar exactamente cuándo y cómo se despliega, en lugar de depender del deploy automático de Vercel que no respeta la secuencia lint → test → build.

---

## Tests desarrollados

### Tests unitarios (`tests/utils.test.js`)

| # | Test | Qué valida |
|---|------|------------|
| 1 | `validarPassword` — contraseñas que no coinciden | Que el registro rechace si `password !== confirm`, con mensaje de error específico |
| 2 | `validarPassword` — contraseña menor a 6 caracteres | Que no se acepten contraseñas demasiado cortas aunque coincidan |
| 3 | `validarPassword` — contraseña válida | El camino feliz: contraseña larga y coincidente retorna `{ valido: true, error: null }` |
| 4 | `parsearPelicula` — sin título | Que no se pueda guardar una película sin el único campo obligatorio |
| 5 | `parsearPelicula` — puntuación mayor a 5 | Que una puntuación de 9 (posible via manipulación del form) quede clampeada a 5 |
| 6 | `parsearPelicula` — estado inválido | Que cualquier valor no reconocido caiga a `"pendiente"` como default seguro |
| 7 | `parsearPelicula` — género fuera de la lista | Que un género inventado (ej. "Western") no llegue a la base de datos |
| 8 | `formatearEstrellas` — puntuación 5 | Que la representación visual sea 5 estrellas llenas `★★★★★` |
| 9 | `formatearEstrellas` — puntuación 0 | Que la representación visual sea 5 estrellas vacías `☆☆☆☆☆` |

### Tests E2E (`e2e/flujo-principal.spec.js`)

| # | Test | Qué valida |
|---|------|------------|
| 1 | Registro → agregar película → ver en catálogo | El flujo principal completo: un usuario nuevo puede registrarse, agregar una película y verla en su catálogo. Cubre autenticación, persistencia en Supabase y renderizado del catálogo. |
| 2 | Usuario no autenticado redirigido al login | Que `/catalog` no sea accesible sin sesión activa, redirigiendo a `/login`. Protege que los datos de otros usuarios no sean accesibles. |

---

## Casos de uso críticos

**Autenticación** es el caso más crítico: si el login o el registro falla, ningún usuario puede usar la aplicación. El test E2E lo cubre de extremo a extremo porque no alcanza con testear la función de validación de contraseña: hay que verificar que el formulario, la API route, Supabase y las cookies funcionen en conjunto.

**Integridad de los datos de película** es el segundo más crítico: `parsearPelicula` es la única barrera entre el formulario y la base de datos. Si esa función acepta datos inválidos (puntuación negativa, estado desconocido, género arbitrario), esos valores llegan a Supabase y son difíciles de limpiar después. Por eso tiene más tests unitarios que cualquier otra función.

**Protección de rutas** es crítico por seguridad y privacidad: si `/catalog` fuera accesible sin autenticación, un usuario podría ver las películas de otro (aunque el RLS de Supabase lo previene a nivel de base de datos, queremos detectar el problema antes de llegar ahí).

Dejamos sin tests el flujo de edición y eliminación de películas por priorización de tiempo: si el flujo de creación funciona, la infraestructura de autenticación y persistencia está validada. Editar y eliminar usan las mismas rutas de auth y los mismos patrones de acceso a Supabase.

---

## Pipeline de CI/CD

El pipeline está definido en `.github/workflows/ci-cd.yml` y tiene tres jobs encadenados:

```
lint + tests unitarios + tests E2E  →  build  →  deploy
         (job: quality)                          (solo en push a main)
```

**Job `quality`** corre lint, tests unitarios con Vitest y tests E2E con Playwright en ese orden. Si el lint falla, los tests no corren: no tiene sentido ejecutar una suite de tests sobre código que ya sabemos que está mal formado. Si algún test falla, el job falla y los siguientes jobs no se ejecutan.

**Job `build`** depende de `quality` (`needs: quality`). Compila la aplicación con `astro build`. Está separado de `quality` porque el build es más pesado y queremos que los tests fallen rápido y barato antes de gastar tiempo en compilar.

**Job `deploy`** depende de `build` y solo corre si el evento es un push directo a `main` (no en PRs). Esto significa que los PRs validan el código pero no despliegan: solo el merge a main despliega a producción. Usamos Vercel CLI en lugar del deploy automático de Vercel para que el deploy sea un paso explícito del pipeline y no ocurra si los pasos anteriores fallaron.

Las variables de entorno de Supabase (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`) están configuradas como secrets en GitHub y se inyectan en los jobs que las necesitan. El token de Vercel (`VERCEL_TOKEN`) solo está disponible en el job de deploy.

---

## Limitaciones y deuda técnica

**No hay entorno de staging.** Los tests E2E corren contra Supabase de producción con usuarios de prueba reales (con emails del formato `e2e-test-{timestamp}@cinevault-test.com`). Idealmente habría un proyecto de Supabase separado para tests. Si el test falla a mitad del flujo de registro, puede quedar un usuario creado pero sin película, que es datos basura que no se limpia automáticamente.

**El test E2E de registro tiene un click duplicado.** En el flujo de agregar película, el submit se clickea dos veces (líneas 21-25 del spec). Es un bug conocido que no afecta el resultado del test porque Playwright espera la URL después, pero podría causar un doble envío del formulario en condiciones de red lenta.

**No hay tests para edición ni eliminación de películas.** Si una refactorización rompe esas rutas API, el CI no lo detecta.

**No hay tests para los estados de error.** Por ejemplo, qué pasa si Supabase devuelve un error al guardar, o si la sesión expira mientras el usuario está completando un formulario.

**La cobertura de tests está acotada a `src/lib/utils.js`.** Las API routes (`src/pages/api/`) no tienen tests unitarios porque dependen del cliente de Supabase, lo que requeriría mocks o una instancia real. Optamos por cubrir ese nivel con el test E2E en lugar de mockear Supabase, porque los mocks podrían no reflejar el comportamiento real de la API.
