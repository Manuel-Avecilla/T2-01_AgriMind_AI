# AgriMind AI · Gestión de parcelas

Aplicación web inicial de **AgriMind AI**, una plataforma de agricultura de precisión que convierte datos de suelo, satélite y clima en decisiones sobre riego y plagas. Esta primera versión es deliberadamente sencilla: una sola página para **gestionar parcelas** (crear, ver, editar y borrar), con un semáforo de estado (verde, amarillo, rojo) que anticipa el sistema de alertas descrito en el informe técnico del proyecto.

No incluye login, sensores reales ni modelos de IA; eso queda como trabajo futuro.

## Qué hace

Cada parcela tiene: nombre, cultivo, superficie (ha), humedad del suelo (%), estado de alerta y notas. Desde la página puedes:

- Ver todas las parcelas y un resumen por estado en la cabecera.
- Añadir una parcela nueva.
- Editar una parcela existente.
- Borrar una parcela.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript sin frameworks (carpeta `public/`) |
| Backend | Node.js 20 + Express (API REST) |
| Base de datos | PostgreSQL 16 |
| Despliegue | Docker y Docker Compose |

## Estructura

```
agrimind/
├── docker-compose.yml   # Orquesta la app y la base de datos
├── Dockerfile           # Imagen de la aplicación
├── package.json
├── server.js            # API REST + servidor de archivos estáticos
├── db/
│   └── init.sql         # Crea la tabla y datos de ejemplo
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Cómo desplegarlo

**Requisitos:** tener instalado [Docker](https://docs.docker.com/get-docker/) con Docker Compose.

1. Descarga o clona este proyecto y entra en la carpeta:

   ```bash
   cd agrimind
   ```

2. Construye y arranca los contenedores:

   ```bash
   docker compose up --build
   ```

3. Abre el navegador en **http://localhost:3000**.

Para detener la aplicación pulsa `Ctrl + C` o ejecuta `docker compose down`. Los datos se conservan en un volumen de Docker. Para borrarlos y volver a empezar con los datos de ejemplo:

```bash
docker compose down -v
```

## API

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/parcelas` | Lista todas las parcelas |
| POST | `/api/parcelas` | Crea una parcela |
| PUT | `/api/parcelas/:id` | Edita una parcela |
| DELETE | `/api/parcelas/:id` | Borra una parcela |

Ejemplo de cuerpo para crear o editar:

```json
{
  "nombre": "Parcela 4",
  "cultivo": "Vid",
  "superficie_ha": 2.5,
  "humedad_suelo": 35,
  "estado": "verde",
  "notas": "Sin incidencias"
}
```

## IAs utilizadas

| IA | Uso en el proyecto |
|---|---|
| Claude (Anthropic) | Plan de desarrollo y generación del código (frontend, backend, base de datos, Docker) y de este README |

<!-- Añade aquí cualquier otra IA que hayas usado realmente en esta práctica. -->

## Trabajo futuro

- Conectar sensores IoT de suelo y datos de satélite (Sentinel).
- Calcular las alertas automáticamente con modelos de IA en lugar de asignarlas a mano.
- Añadir asistente de voz y panel con mapas de calor.
- Añadir autenticación y perfiles de usuario.
