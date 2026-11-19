# AgriMind AI · Herramientas de IA (Skills, MCPs, Provider y Plugins)

> Selección pensada para el plan `PLAN_MIGRACION_VERCEL_SUPABASE.md` y para trabajar con **agentes gratuitos en OpenCode**. Se cubre el mínimo que pide el enunciado (2 Skills, 2 MCPs, 1 Provider, 2 Plugins) y nada más, porque **no se acepta ninguna herramienta instalada que no se use**. Cada ficha sigue los puntos que se piden en la presentación.

---

## 0. Resumen

| Tipo | Herramienta | Para qué se usa en AgriMind | Fase |
|---|---|---|---|
| **Skill** | `supabase` (supabase/agent-skills) | Esquema, RLS y Auth bien hechos | 1, 3 |
| **Skill** | `frontend-design` (anthropics/skills) | Interfaz cuidada, no genérica | 2, 5 |
| **MCP** | Supabase MCP | El agente crea tablas, consulta datos y revisa la seguridad | 1, 3, 5 |
| **MCP** | Vercel MCP | El agente consulta proyectos, despliegues y logs | 4, 8 |
| **Provider** | OpenCode Zen (modelos gratuitos) | Modelo que programa la app | Todas |
| **Plugin** | Vercel plugin para OpenCode | Conocimiento y comandos de Vercel en el agente | 4 |
| **Plugin** | Dynamic Context Pruning (DCP) | Ahorra contexto en sesiones largas con modelos gratuitos | Todas |

Opcionales (instalar **solo si se van a usar**): skill `supabase-postgres-best-practices`, MCP Context7 y, en la Fase 7, un provider para el asistente de la app.

> ⚠️ El ecosistema de OpenCode cambia rápido: comandos, nombres y modelos gratuitos se han comprobado al redactar este archivo, pero hay que verificarlos al instalar.

---

## 1. Skills (mínimo 2)

### Qué es una Skill
Una carpeta con instrucciones (`SKILL.md`) y, a veces, scripts y recursos que el agente carga cuando la tarea lo requiere. Le dan conocimiento especializado y buenas prácticas sin tener que repetirlas en cada prompt.

### 1.1 `supabase` (oficial de Supabase)
- **Qué es y finalidad:** guía al agente para construir apps con Postgres, Auth, Storage y Edge Functions usando los valores de seguridad correctos.
- **Capacidades que añade:** diseño de esquemas, políticas RLS, gestión de sesión/JWT y uso correcto del SDK y la CLI actuales.
- **Dónde conseguirla:** repositorio `github.com/supabase/agent-skills`.
- **Instalación:**
  ```bash
  npx skills add supabase/agent-skills
  ```
  Elegir la skill `supabase` y OpenCode como agente cuando lo pregunte el instalador (si pregunta por el ámbito, elegir proyecto).
- **Credenciales:** ninguna.
- **Por qué esta:** el punto débil de un modelo gratuito es la seguridad (RLS olvidado, claves mal usadas). Esta skill ataca justo ese riesgo.
- **Dónde se usa:** Fase 1 (schema y políticas) y Fase 3 (Auth).
- **Evidencia para la presentación:** captura del agente cargando la skill y comparación entre el SQL que genera con ella y sin ella (por ejemplo, políticas RLS presentes o ausentes).

### 1.2 `frontend-design` (anthropics/skills)
- **Qué es y finalidad:** orienta al agente para crear interfaces con identidad visual propia y evitar el aspecto genérico de las plantillas.
- **Capacidades que añade:** criterios de tipografía, color, composición y detalles de UI.
- **Dónde conseguirla:** repositorio `github.com/anthropics/skills`.
- **Instalación:**
  ```bash
  npx skills add anthropics/skills --skill frontend-design
  ```
  Si el nombre no coincide, usar el modo interactivo (`npx skills add anthropics/skills`) y elegirla de la lista.
- **Credenciales:** ninguna.
- **Por qué esta:** el enunciado pide una interfaz cuidada y la marca AgriMind tiene paleta definida (azul marino, verde esmeralda, naranja). La skill ayuda a aplicarla con coherencia.
- **Dónde se usa:** Fase 2 (rediseño de la página) y Fase 5 (panel, tarjetas de alerta, gráfica).
- **Evidencia:** captura «antes y después» de la interfaz.

**Comprobar que están activas:** abrir OpenCode y preguntar «¿qué skills tienes disponibles?».

*Opcional:* `supabase-postgres-best-practices` (mismo repositorio) para revisar índices y rendimiento. Solo instalar si se llega a usar.

---

## 2. MCPs (mínimo 2)

### Qué es un MCP
Un servidor del *Model Context Protocol*: un estándar abierto que permite al modelo usar **herramientas de servicios externos** (bases de datos, plataformas de despliegue, documentación…) de forma controlada.

### 2.1 Supabase MCP
- **Qué servicio proporciona:** conecta el agente con tu proyecto de Supabase.
- **Herramientas que expone (por grupos):** `database` (listar tablas, ejecutar SQL, aplicar migraciones), `docs` (buscar en la documentación), `debugging` (logs y *advisors* de seguridad y rendimiento), `development` (URL del proyecto, claves públicas, tipos TypeScript).
- **Dónde se consigue:** servidor oficial alojado en `https://mcp.supabase.com/mcp` (repositorio `supabase/mcp`).
- **Configuración** en `opencode.json` del proyecto:
  ```json
  {
    "$schema": "https://opencode.ai/config.json",
    "mcp": {
      "supabase": {
        "type": "remote",
        "url": "https://mcp.supabase.com/mcp?project_ref=TU_PROJECT_REF&features=docs,database,debugging,development",
        "enabled": true
      }
    }
  }
  ```
  Después, autenticar: `opencode mcp auth supabase` (se abre el navegador) y comprobar con `opencode mcp list`.
- **Permisos y credenciales:** inicio de sesión **OAuth** con tu cuenta de Supabase; no hay que pegar ninguna clave. `project_ref` es el *Project ID* de *Project Settings*.
- **Buenas prácticas de seguridad (mencionarlas en la presentación):**
  - Limitar el servidor a **un proyecto** con `project_ref` y a los grupos necesarios con `features`. Además, así se cargan menos herramientas y se ahorra contexto.
  - Usar un proyecto de pruebas y **no conectarlo a datos reales de producción**.
  - Cuando el esquema esté creado, añadir `&read_only=true` a la URL: el agente podrá consultar pero no modificar (en ese modo las migraciones quedan desactivadas).
  - Revisar siempre el SQL antes de aprobar una acción.
- **Ejemplos de uso en el proyecto:**
  - «Lista las tablas del proyecto y comprueba que todas tienen RLS.»
  - «Aplica el esquema de `supabase/schema.sql`.» *(modo escritura)*
  - «Ejecuta los *advisors* de seguridad y arregla lo que marquen.»
  - «Inserta una lectura de 15 % en la parcela X y dime en qué estado queda.»
- **Ventajas aportadas:** el agente ve el estado real de la base de datos en vez de adivinarlo, y se detectan fallos de seguridad antes de desplegar.
- **Evidencia:** captura del agente listando tablas y de la salida de los *advisors*.

### 2.2 Vercel MCP
- **Qué servicio proporciona:** acceso del agente a tu cuenta de Vercel.
- **Herramientas que expone:** buscar en la documentación de Vercel, consultar proyectos y despliegues, leer **logs de build y de ejecución** y consultar analíticas web.
- **Dónde se consigue:** servidor oficial en `https://mcp.vercel.com`.
- **Configuración** en `opencode.json`:
  ```json
  {
    "mcp": {
      "vercel": {
        "type": "remote",
        "url": "https://mcp.vercel.com",
        "enabled": true
      }
    }
  }
  ```
  Autenticar con `opencode mcp auth vercel`. Alternativa: `npx -y add-mcp https://mcp.vercel.com -g`.
- **Permisos y credenciales:** **OAuth** con tu cuenta de Vercel. El agente actúa con los permisos de ese usuario, así que conviene **aprobar manualmente** cada acción que modifique algo.
- **Ejemplos de uso en el proyecto:**
  - «¿Por qué ha fallado mi último despliegue?» (lee los logs del build)
  - «Comprueba que el proyecto tiene definidas las variables de entorno de Supabase.»
  - «Muéstrame el estado del último despliegue de producción.»
- **Ventajas aportadas:** los errores de despliegue se diagnostican desde el propio agente, sin copiar y pegar logs.
- **Evidencia:** captura de una consulta de logs o de despliegues.

### 2.3 Opcional · Context7
Servidor de documentación actualizada de librerías (`https://mcp.context7.com/mcp`). Útil porque los modelos gratuitos suelen conocer versiones antiguas de `supabase-js` o Vite. Puede requerir una API key gratuita, que debe ir por variable de entorno (`{env:CONTEXT7_API_KEY}`) y nunca en el repositorio. Añadirlo solo si se va a usar.

---

## 3. Provider (mínimo 1)

### Qué es un Provider
El proveedor que ofrece los modelos de IA a tu entorno de desarrollo. OpenCode se conecta a más de 75 proveedores a través de Models.dev, incluidos modelos locales.

### 3.1 Elegido: Groq
- **Función:** proveedor de inferencia ultrarrápida (basado en hardware LPU) que ofrece acceso vía API a modelos abiertos con una **capa gratuita** ideal para desarrollo y pruebas.
- **Modelos disponibles:** ofrece un catálogo de modelos abiertos gratuitos (sujetos a disponibilidad y cuotas), entre otros, `qwen/qwen3-32b`, `llama-3.3-70b-versatile` y `openai/gpt-oss-120b`. **Comprobar los vigentes con `/models` o en `https://console.groq.com/docs/models`.**
- **Configuración:**
  1. En OpenCode ejecutar `/connect` y elegir *Groq*.
  2. Pegar la API key (se obtiene gratis creando una cuenta en `console.groq.com/keys`).
  3. Ejecutar `/models` y seleccionar uno de los modelos disponibles.
  4. Opcional: fijarlo en `opencode.json` con `"model": "groq/<id-del-modelo>"`.
- **Credenciales:** la API key (`gsk_...`) queda guardada por OpenCode en tu equipo. **No debe aparecer en capturas ni en el repositorio.**
- **Por qué este provider:** coste cero, configuración sencilla, velocidad de respuesta extremadamente alta, compatibilidad con llamadas a herramientas (*tool calling*) y posibilidad de cambiar entre modelos sin tocar nada más.
- **Ventajas frente a otras alternativas:**
  - Frente a **claves propias de OpenAI/Anthropic**: no requiere tarjeta ni pagar por token.
  - Frente a **modelos locales (Ollama)**: no exige un ordenador potente.
  - Frente a **otros proveedores con capa gratuita**: ya viene integrado de forma nativa en OpenCode y destaca por su latencia mínima (respuestas casi instantáneas).
- **Limitaciones a mencionar con honestidad:** en el nivel gratuito tiene límites estrictos de tokens por minuto (TPM) y peticiones diarias (puede dar errores de límite si se envían archivos muy grandes de golpe), los modelos abiertos pueden ser menos fiables en tareas muy largas y, en el plan gratuito, los datos pueden usarse según sus condiciones de servicio. Por eso en el plan se trabaja por fases pequeñas y sin datos sensibles.
- **Evidencia:** captura de `/models` mostrando el modelo elegido y comparación de un mismo prompt con dos modelos distintos.

*Opcional (Fase 7, asistente dentro de la app):* para que la propia aplicación responda a los usuarios hace falta otro provider llamado desde `api/asistente.js` con la clave guardada en Vercel. Una opción razonable es **OpenRouter** con un modelo marcado como gratuito. Comprobar sus límites antes de usarlo. Si no se hace la Fase 7, no se instala ni se menciona.

---

## 4. Plugins (mínimo 2)

### Qué es un Plugin en OpenCode
Una extensión que se carga al iniciar OpenCode y amplía el propio agente (comandos, herramientas, gestión del contexto…). Se declaran en el campo `plugin` de `opencode.json`.

### 4.1 Vercel plugin para OpenCode
- **Funcionalidad:** añade al agente conocimiento específico de la plataforma Vercel y sus buenas prácticas de despliegue.
- **Problema que resuelve:** los modelos gratuitos conocen mal las particularidades de Vercel (variables de entorno, estructura de funciones, configuración de frameworks).
- **Dónde conseguirlo:** `github.com/vercel/vercel-plugin`.
- **Instalación:**
  ```bash
  opencode plugin add github:vercel/vercel-plugin
  ```
  Según su documentación se activa solo, sin configuración adicional. Reiniciar OpenCode tras instalarlo.
- **Cómo se usa:** funciona en segundo plano. Se nota al pedir tareas de despliegue («prepara el proyecto para Vercel y dime qué variables de entorno hay que definir»).
- **Por qué este:** aporta algo distinto al Vercel MCP: el **plugin da conocimiento**, el **MCP da acceso a tu cuenta**. No se instalan además las skills de Vercel porque duplicarían lo que ya hace el plugin.
- **Dónde se usa:** Fase 4 (primer despliegue) y Fase 8.
- **Evidencia:** captura de la instalación y de una respuesta del agente con y sin el plugin.

### 4.2 Dynamic Context Pruning (`@tarquinen/opencode-dcp`)
- **Funcionalidad:** gestiona automáticamente el contexto de la conversación eliminando salidas de herramientas obsoletas, lo que reduce el consumo de tokens.
- **Problema que resuelve:** con modelos gratuitos de contexto limitado, las sesiones largas se llenan de logs y lecturas de archivos, y el agente empieza a olvidar o a equivocarse. Los MCPs, además, devuelven mucho texto.
- **Dónde conseguirlo:** `github.com/Opencode-DCP/opencode-dynamic-context-pruning` (paquete npm `@tarquinen/opencode-dcp`).
- **Instalación:**
  ```bash
  opencode plugin @tarquinen/opencode-dcp@latest --global
  ```
  O añadirlo a `opencode.json`: `"plugin": ["@tarquinen/opencode-dcp@latest"]`. OpenCode instala los plugins de npm con **Bun**, que debe estar instalado, o la instalación puede fallar sin avisar.
- **Cómo se usa:** funciona solo con valores por defecto. El comando `/dcp` muestra el panel y el desglose de tokens por categoría y el ahorro conseguido.
- **Por qué este:** resuelve una limitación real del entorno gratuito y es **independiente** del resto de herramientas (no duplica nada).
- **Aviso:** el autor indica que el desarrollo del plugin ha pasado a un proyecto nuevo (Sleev), pero el plugin sigue disponible. Si falla, desinstalarlo y no mencionarlo como usado.
- **Dónde se usa:** todas las fases, sobre todo la 5 y la 6.
- **Evidencia:** captura de `/dcp` con los tokens ahorrados en una sesión larga.

---

## 5. Configuración completa de ejemplo (`opencode.json`)

Sin claves: los MCPs usan OAuth y el modelo se conecta con `/connect`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/ID_DEL_MODELO_GRATUITO",
  "plugin": [
    "@tarquinen/opencode-dcp@latest"
  ],
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=TU_PROJECT_REF&features=docs,database,debugging,development",
      "enabled": true
    },
    "vercel": {
      "type": "remote",
      "url": "https://mcp.vercel.com",
      "enabled": true
    }
  }
}
```

El plugin de Vercel se añade con su propio comando (`opencode plugin add github:vercel/vercel-plugin`), que lo registra en la configuración.

---

## 6. Orden de instalación

1. Instalar OpenCode y conectar **Groq** (`/connect`, `/models`).
2. Crear `AGENTS.md` y `opencode.json` básico en el proyecto.
3. Añadir los **plugins**: DCP y Vercel plugin. Reiniciar OpenCode.
4. Instalar las **skills**: `supabase` y `frontend-design`.
5. Crear el proyecto de Supabase y añadir el **Supabase MCP** (cuando exista el `project_ref`, al inicio de la Fase 1).
6. Añadir el **Vercel MCP** (antes de la Fase 4).
7. Verificar: `opencode mcp list`, `/dcp` y la pregunta «¿qué skills tienes?».

---

## 7. Checklist de evidencias para la presentación

Para cada herramienta, preparar lo que el enunciado exige: qué es, qué aporta, dónde se consigue, cómo se instala/configura, permisos, justificación, ejemplo real de uso y mejora conseguida.

- [ ] **Skill supabase:** captura de carga + SQL con y sin skill.
- [ ] **Skill frontend-design:** captura «antes y después» de la interfaz.
- [ ] **Supabase MCP:** captura listando tablas y salida de los *advisors*; configuración **sin claves**.
- [ ] **Vercel MCP:** captura de logs o estado de despliegue.
- [ ] **Provider:** captura de `/models` y comparación de dos modelos.
- [ ] **Vercel plugin:** captura de instalación y de su uso.
- [ ] **DCP:** captura de `/dcp` con el ahorro de tokens.
- [ ] Comparativa final: desarrollo **con** y **sin** estas herramientas.
- [ ] Revisar todas las capturas: **ninguna API key, token ni contraseña visible.**

---

## 8. Dificultades previsibles (para el apartado de conclusiones)

- Los modelos gratuitos pueden fallar o cambiar de disponibilidad a mitad del proyecto: tener claro un modelo alternativo.
- El modo `read_only` del Supabase MCP impide aplicar migraciones: usarlo solo cuando el esquema ya esté creado.
- Un MCP con muchas herramientas consume contexto: limitar `features` y usar DCP.
- Los plugins de npm necesitan Bun: si no se instalan, comprobar los logs de OpenCode.
