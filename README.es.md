# Task Manager

[English](README.en.md) | [Español](README.es.md)

Un pequeño gestor de tareas creado como proyecto independiente: Next.js, inicio de sesión con dos roles y un flujo de trabajo de cinco estados.

> 📐 **Arquitectura y componentes**: [`docs/architecture-and-components.md`](docs/architecture-and-components.md) — arquitectura general, árbol de componentes, modelo de datos, flujos principales y máquina de estados, con 6 diagramas ([HTML](docs/architecture-and-components.html) / [PDF](docs/architecture-and-components.pdf)). Esta documentación está en inglés.

```bash
npm install
npm run dev        # http://localhost:3000
```

La primera vez que se ejecuta la aplicación, se crean dos cuentas de ejemplo:

| Correo electrónico | Contraseña | Rol |
| --- | --- | --- |
| `admin@example.com` | `admin123` | Administrador (Administrator) |
| `viewer@example.com` | `viewer123` | Lector (Viewer) |

La página de inicio de sesión también muestra estas cuentas; un clic rellena el formulario.

```bash
npm test                     # 13 pruebas: reglas del flujo de trabajo y almacenamiento
npm run build && npm start   # compilar y ejecutar en modo producción
```

---

## Funcionalidades

- **Inicio de sesión** — correo electrónico y contraseña, con una sesión almacenada en una cookie firmada y marcada como httpOnly.
- **Dos roles** — los administradores crean tareas, cambian su estado y las eliminan. Los lectores solo pueden consultar la información.
- **Cinco estados** — `Pending → Approve → To Do → Done`, con la opción de pasar a `Cancelled` desde cualquier estado no final. Se conservan los nombres de los estados tal como aparecen en la aplicación.
- **Historial** — cada cambio de estado registra quién lo realizó, cuándo y los estados de origen y destino.
- **Filtros** — la lista se puede filtrar por estado, con un contador en cada pestaña.

No hay registro de usuarios: la prueba pide inicio de sesión y roles, y cada formulario adicional añade más validaciones que mantener.

---

## Estructura de carpetas

```text
app/
  layout.tsx            estructura base y fuentes
  page.tsx              / → /tasks o /login
  login/page.tsx
  tasks/page.tsx        lista con filtros por estado
  tasks/new/page.tsx    creación de tareas, solo administradores
  tasks/[id]/page.tsx   detalle y cambios de estado
components/             componentes reutilizados o que necesitan 'use client'
lib/
  types.ts              Task, User, TaskStatus
  workflow.ts           tabla de transiciones, etiquetas y colores
  auth.ts               sesión en una cookie firmada con HMAC
  password.ts           hash con scrypt y comparación en tiempo constante
  store.ts              único módulo que accede al almacenamiento
  actions.ts            operaciones de escritura con "use server"
data/db.json            se crea en la primera ejecución
test/                   pruebas con node:test
```

---

## Decisiones de diseño

**La tabla de transiciones es la única fuente de referencia.** `lib/workflow.ts` contiene `TRANSITIONS`, que utilizan la página de detalle para mostrar los botones disponibles, la acción de servidor para aceptar o rechazar el cambio y las pruebas para comprobar las combinaciones inválidas. Añadir un estado implica modificar un solo objeto.

**Los permisos se comprueban dos veces, de forma deliberada.** La página oculta las acciones que un lector no puede realizar para facilitar el uso. La acción de servidor vuelve a comprobar el rol para garantizar la seguridad. Ocultar un botón no impide que alguien construya la petición por su cuenta.

**Todas las comprobaciones se realizan antes de escribir.** `transitionAction` valida la sesión, el rol, el estado de destino y si la transición es válida desde el estado actual *almacenado*. Solo entonces guarda los cambios. Si falla una comprobación, los datos permanecen intactos.

**Las sesiones usan un contenido firmado, sin JWT.** El servidor necesita comprobar si se ha manipulado el contenido. HMAC-SHA256 permite hacerlo con pocas líneas y sin añadir dependencias ni elegir entre varios algoritmos. La sesión se guarda en una cookie httpOnly, de modo que los scripts de la página no pueden leerla, y se elimina al cerrar sesión.

**Las contraseñas se almacenan como `salt:hash` mediante scrypt.** Node ya incluye esta función, por lo que no hace falta compilar módulos nativos. La comparación utiliza `timingSafeEqual`.

**El almacenamiento es un archivo JSON con una interfaz acotada.** `lib/store.ts` es el único módulo que lee o escribe datos. Cada escritura se realiza primero en un archivo temporal que después se renombra, para evitar que una interrupción deje un documento a medio escribir. Es suficiente para que una persona evalúe la aplicación, pero no para varios usuarios simultáneos; por eso es la primera mejora propuesta a continuación.

---

## Qué mejoraría con más tiempo

1. **SQLite + Prisma** — el archivo JSON se reescribe por completo en cada modificación y dos escrituras simultáneas pueden provocar la pérdida de una de ellas. El cambio se concentraría en `lib/store.ts`; las llamadas pasarían a usar `await`.
2. **Sesiones revocables** — una cookie firmada no puede invalidarse en el servidor antes de que caduque. Almacenar las sesiones o un contador de versión por usuario permitiría cerrar sesión en todos los dispositivos.
3. **Control de concurrencia optimista** — existe un intervalo entre la lectura y la escritura en `transitionAction`. Un campo `version` y una actualización condicional permitirían detectar conflictos.
4. **Paginación y búsqueda** — seis tareas no las necesitan; seiscientas, sí. Se incorporarían en la página, sin cambiar el módulo de almacenamiento.

---

## Notas

Los comentarios del código, los nombres de archivo, la documentación de arquitectura y los textos de la interfaz están en inglés. El README está disponible en inglés y español.

Las pruebas configuran `DB_PATH` para utilizar un archivo temporal, de modo que nunca modifican `data/db.json`.
