# AgriMind AI — Informe Técnico y Memoria de Proyecto

Oct 14, 2026 · @Manuel

## 1\. Ficha Ejecutiva e Identidad Corporativa

AgriMind AI es una plataforma SaaS de agricultura de precisión que convierte datos de suelo, satélite y clima en decisiones agronómicas automáticas sobre riego y plagas. Sin la IA no existe producto: es el motor de la propuesta de valor y de los ingresos.

| Campo                    | Descripción                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **Nombre de la empresa** | AgriMind AI                                                                                   |
| **Sector**               | Agritech · Agricultura de precisión                                                           |
| **Modelo de negocio**    | Software como servicio (SaaS) por suscripción                                                 |
| **Cliente objetivo**     | Pequeños y medianos agricultores, cooperativas y técnicos agrícolas                           |
| **Propuesta de valor**   | Gestión inteligente de cultivos, predicción de plagas y optimización del riego en tiempo real |
| **Objetivo de impacto**  | Reducción del 30 % del consumo de agua de riego                                               |

### Línea de negocio principal

AgriMind AI vende **decisiones**, no datos. El cliente contrata una suscripción con tres módulos, y cada uno depende de una familia de modelos de IA distinta:

1. **Módulo de protección de cultivos:** detecta plagas y deficiencias nutricionales y predice su aparición antes de que sean visibles. Se apoya en visión por computador y razonamiento sobre grafos de conocimiento.
2. **Módulo de riego inteligente:** calcula cuánta agua aplicar y cuándo, parcela a parcela. Se apoya en aprendizaje por refuerzo.
3. **Módulo de asistente conversacional:** permite consultar el estado del cultivo por voz y en lenguaje natural. Se apoya en procesamiento del lenguaje natural (PLN).

La IA genera ingresos por tres vías. La primera es la suscripción escalonada por superficie y módulos contratados (modelo propuesto). La segunda es el ahorro medible que obtiene el cliente en agua, insumos y pérdidas de cosecha, que justifica la renovación. La tercera son los acuerdos con cooperativas, que aportan datos históricos y a cambio reciben analítica agregada.

### Valor diferencial

* **Fusión multifuente:** combina sensores IoT de suelo, imágenes multiespectrales Sentinel (programa Copernicus) y meteorología en un único modelo del terreno.
* **Razonamiento espacio-temporal:** no solo clasifica imágenes; infiere riesgos futuros a partir de la evolución del cultivo y del clima.
* **Accesibilidad real:** una interfaz de voz permite que operarios sin formación técnica usen la plataforma desde el campo.
* **Efecto de red de datos:** cada parcela y cada cooperativa que se incorpora mejora los modelos para el resto de clientes.
* **Robustez ante eventos extremos:** los datos sintéticos permiten entrenar la respuesta a sequías que apenas existen en los registros históricos.

### Identidad visual y logo

El logotipo representa la idea central de la marca: una **mente que piensa el campo**. Una silueta humana de perfil, trazada en azul, contiene en su interior un paisaje agrícola. Un sol naciente de rayos naranjas se alza sobre campos de cultivo en franjas verdes, y una pequeña hoja azul remata la base del cuello. El nombre aparece en tipografía geométrica de palo seco.

| Elemento                       | Significado                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Cabeza en perfil               | Inteligencia artificial centrada en las personas; la IA asiste al agricultor, no lo sustituye |
| Campos en el lugar del cerebro | El conocimiento agronómico es el núcleo del razonamiento del sistema                          |
| Sol naciente (naranja)         | Energía, clima y un nuevo amanecer para el sector primario                                    |
| Hoja                           | Sostenibilidad y preservación del medio ambiente                                              |
| Azul                           | Tecnología, datos y agua                                                                      |
| Verde                          | Cultivo, vida y crecimiento sostenible                                                        |

La presentación mantiene esta paleta con fondos azul marino y acentos verde esmeralda, de modo que la identidad es coherente entre el logo y el soporte visual. El logotipo y su narrativa de marca se generaron con IA. *[Indicar la herramienta y el prompt utilizados para el logo.]*

## 2\. Arquitectura e Ingeniería de la IA

La arquitectura de AgriMind AI encadena cuatro etapas: percepción de datos, representación y razonamiento, aprendizaje y entrega de la decisión al usuario. Cada etapa se describe a continuación con los modelos y las fuentes concretas que emplea.

[embedded content: arquitectura de AgriMind AI · 4 etapas y un ciclo de mejora]

El razonamiento híbrido combina el grafo de conocimiento con los modelos de aprendizaje, y las respuestas del usuario cierran el ciclo reentrenando los modelos.

### 2.1 Percepción de datos

La plataforma ingiere cuatro familias de datos del entorno y las sincroniza en una referencia común: la parcela y el instante de medida.

| Fuente                          | Qué mide                                                                                                            | Cómo se ingiere                                                                               | Uso principal                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Sensores IoT en suelo           | pH, humedad y salinidad                                                                                             | Transmisión inalámbrica de bajo consumo hacia una pasarela y *streaming* de lecturas por MQTT | Estrés hídrico, programación del riego        |
| Satélites Sentinel (Copernicus) | Imágenes multiespectrales, con revisita de unos 5 días y 10 m de resolución en las bandas principales de Sentinel-2 | Descarga por API desde repositorios abiertos                                                  | Índice NDVI, vigor del cultivo                |
| Ortofotos aéreas (drones)       | Imagen de alta resolución de la parcela                                                                             | Carga por lotes tras cada vuelo                                                               | Anomalías visibles y no visibles              |
| Datos meteorológicos            | Temperatura, humedad relativa, viento, precipitación y previsión                                                    | Consulta periódica a APIs de servicios meteorológicos oficiales                               | Riesgo de plagas, demanda hídrica             |
| Entradas del usuario            | Voz, texto y fotografías de hojas desde el móvil                                                                    | Aplicación móvil                                                                              | Consulta, diagnóstico y validación de alertas |

Antes de modelar, un *pipeline* de preprocesado georreferencia cada dato a su parcela, alinea las series temporales, enmascara nubes en las imágenes y descarta lecturas de sensor anómalas mediante reglas de rango y detección de valores atípicos.

### 2.2 Representación y razonamiento

El sistema usa un enfoque **híbrido** que combina conocimiento explícito y aprendizaje estadístico:

* **Grafo de conocimiento del terreno.** Los nodos son parcelas, cultivos, sensores, plagas, tratamientos y eventos climáticos. Las aristas expresan relaciones como «es colindante con», «está afectado por» o «requiere». Una ontología agronómica da significado común a cada nodo.
* **Matrices espacio-temporales.** Los datos de satélite, sensores y clima se organizan en un cubo de datos con tres ejes: posición, tiempo y variable. Sobre él se calculan índices como el NDVI y se detectan tendencias.
* **Redes neuronales convolucionales (CNN).** Procesan ortofotos e imágenes de hojas para clasificar y localizar patógenos y deficiencias nutricionales.
* **Modelos de series temporales.** Predicen la evolución de la humedad del suelo y de las condiciones climáticas a corto plazo.
* **Inferencia lógica sobre el grafo.** Reglas agronómicas combinan las salidas anteriores para predecir riesgos. Por ejemplo: humedad persistente, temperaturas favorables y un foco en una parcela colindante elevan el riesgo de un patógeno fúngico.

Este diseño hace que cada alerta sea **explicable**: el usuario puede ver qué datos y qué regla la han producido, algo esencial para que un agricultor confíe en la recomendación.

### 2.3 Aprendizaje y entrenamiento

| Módulo                   | Paradigma                        | Cómo se entrena                                                                                                                                          | Cómo se evalúa                                                                                                      |
| ------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Clasificación foliar     | **Supervisado**                  | CNN con aprendizaje por transferencia a partir de un modelo preentrenado y *fine-tuning* con imágenes etiquetadas por agrónomos                          | Precisión, exhaustividad (*recall*) y F1 por clase; validación en parcelas y campañas no vistas en el entrenamiento |
| Optimización del riego   | **Por refuerzo**                 | Un agente observa humedad, previsión y fase del cultivo; elige dosis y horario; recibe recompensa por mantener el cultivo sin estrés y gastar menos agua | Ahorro de agua y estrés hídrico frente a un riego de referencia, primero en simulación y después en parcelas piloto |
| Eventos extremos         | **Datos sintéticos generativos** | Simulación de sequías y episodios climáticos poco frecuentes para entrenar la respuesta preventiva                                                       | Contraste con datos reales; los sintéticos nunca se usan en el conjunto de evaluación final                         |
| Asistente conversacional | **Modelo de lenguaje con RAG**   | Recuperación de normativa y guías agronómicas como contexto de cada respuesta                                                                            | Revisión de respuestas por expertos y comprobación de que citan la fuente                                           |

El agente de riego se entrena primero en un simulador del cultivo. Al pasar a campo opera con límites de seguridad, como dosis máximas y mínimas, y con supervisión humana. El sistema se mantiene con MLOps: versionado de modelos, vigilancia de la deriva de datos y reentrenamiento al inicio de cada campaña.

### 2.4 Estrategia de captación de datos

El plan avanza en tres fases para tener datos desde el primer día y mejorarlos con el uso.

1. **Arranque.** Datos abiertos de Copernicus y datos sintéticos generativos para construir los primeros modelos sin depender de clientes.
2. **Pilotos con cooperativas.** Alianzas que aportan históricos de cultivo y permiten desplegar sensores en parcelas reales. Los agrónomos etiquetan imágenes y validan las primeras alertas.
3. **Ciclo de mejora continua.** Cada alerta confirmada o descartada por el agricultor se convierte en una etiqueta nueva que realimenta el entrenamiento.

Para que el conjunto de datos sea suficiente, ético, diverso y de calidad se aplican estos criterios:

| Criterio                             | Medida concreta                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ética y legalidad**                | El agricultor conserva la propiedad de sus datos. Consentimiento explícito, anonimización y uso agregado, conforme al RGPD y a los principios del código de conducta de la UE sobre intercambio de datos agrícolas |
| **Diversidad**                       | Cultivos, tipos de suelo, climas y campañas variados, y presencia de pequeñas explotaciones para no sesgar el modelo hacia grandes monocultivos                                                                    |
| **Calidad**                          | Etiquetado por agrónomos con doble revisión en una muestra, control de valores atípicos y trazabilidad de cada dato hasta su origen                                                                                |
| **Representatividad de casos raros** | Datos sintéticos de sequías y plagas poco frecuentes, identificados como tales y validados contra casos reales                                                                                                     |

## 3\. Interacción y Dominio Teórico

AgriMind AI se diseña para que un operario sin formación técnica pueda usarla en el campo, con el móvil en la mano. La interacción se apoya en dos canales: un panel visual y un asistente de voz. Debajo de ambos trabajan dos ramas de la IA: la visión por computador y el procesamiento del lenguaje natural.

### 3.1 Interacción humano-IA

| Canal                                | Qué ofrece                                                                                                                                                                                   | Decisión de diseño                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Panel móvil intuitivo**            | Mapas de calor interactivos por parcela (vigor, humedad, riesgo) y alertas de riesgo tipo semáforo en tiempo real                                                                            | El color resume el estado de un vistazo; al tocar una alerta se ve la causa y la acción recomendada |
| **Asistente conversacional por voz** | Consultas en lenguaje natural desde el campo, con respuestas inmediatas y precisas. Por ejemplo: «¿cuándo riego la parcela 3?» o una foto de una hoja con la pregunta «¿qué es esta mancha?» | Las manos quedan libres y no hace falta saber navegar por menús ni usar vocabulario técnico         |
| **Sistema adaptativo**               | Ajusta el nivel de detalle según el perfil: más simple para el operario, más analítico para el técnico o el gerente                                                                          | Un mismo dato se presenta de forma distinta según quién lo consulta                                 |

Tres principios guían la interfaz:

* **La persona decide.** La IA recomienda y explica; el agricultor acepta o rechaza. El riego automático es opcional y trabaja siempre dentro de límites que fija el usuario.
* **Cada alerta se explica.** Indica qué datos la originan, qué nivel de confianza tiene y qué conviene hacer, en lenguaje llano.
* **Cada respuesta del usuario enseña al sistema.** Aceptar, ignorar o corregir una alerta genera una etiqueta que mejora los modelos.

La interfaz tiene en cuenta que la conectividad rural puede ser limitada: el panel conserva la última información recibida y sincroniza cuando hay cobertura.

### 3.2 Ramas de la IA aplicadas

Las dos ramas que afectan directamente al proyecto son la **visión por computador** y el **procesamiento del lenguaje natural**. Ambas se apoyan en el aprendizaje automático y en la representación del conocimiento descritos en el apartado 2.

| Rama                                         | Aplicación técnica en AgriMind AI                                                                                                                                                    | Resultado para el usuario                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Visión por computador (CV)**               | Análisis de ortofotos aéreas e imágenes satelitales multiespectrales. Cálculo del índice NDVI. Clasificación y segmentación de hojas con CNN para localizar patógenos y deficiencias | Identificación de anomalías invisibles al ojo humano, antes de que el daño sea visible                  |
| **Procesamiento del lenguaje natural (PLN)** | Reconocimiento de voz, comprensión de la consulta, generación de la respuesta con recuperación de normativa agrícola (RAG) y síntesis de voz                                         | Comunicación directa por voz con operarios sin experiencia técnica y acceso comprensible a la normativa |

El índice NDVI mide el vigor de la vegetación a partir de la luz roja y del infrarrojo cercano que refleja el cultivo:

```
NDVI = \frac{NIR - Rojo}{NIR + Rojo}

```

Sus valores van de −1 a +1\. Los valores altos indican vegetación densa y sana, y los cercanos a 0 indican suelo desnudo o cultivo estresado. Una caída del NDVI en una zona de la parcela puede delatar un problema días antes de que el ojo humano lo perciba.

## 4\. Impacto y Conclusiones

AgriMind AI aspira a reducir en un 30 % el consumo de agua y a dar a los pequeños agricultores herramientas que hoy solo están al alcance de grandes explotaciones. Su viabilidad social depende de que la tecnología sea accesible, explicable y respetuosa con los datos de quien la usa.

### 4.1 Impacto social y ético

**Beneficios**

* **Ambientales:** menor consumo de agua con el riego ajustado a la necesidad real del cultivo, y tratamientos más localizados al detectar las plagas de forma temprana.
* **Económicos:** menos pérdidas de cosecha y menos gasto en agua e insumos.
* **Sociales:** empoderamiento tecnológico de pequeños agricultores y de operarios sin formación técnica, gracias a la interfaz de voz y al panel visual.
* **Resiliencia climática:** capacidad de anticipar y gestionar sequías y episodios extremos.

**Viabilidad social y accesibilidad.** La adopción se apoya en una interfaz que no exige conocimientos técnicos y en las cooperativas como canal de confianza y de formación. El asistente de voz, el semáforo de alertas y el lenguaje llano reducen la barrera de entrada para personas con poca experiencia digital.

**Riesgos y medidas de mitigación**

| Riesgo                                                                                    | Mitigación                                                                                                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Brecha digital y conectividad rural limitada**                                          | Funcionamiento con la última información disponible sin cobertura, interfaz de voz y despliegue a través de cooperativas        |
| **Privacidad y propiedad de los datos**                                                   | Los datos pertenecen al agricultor. Consentimiento explícito, anonimización y uso agregado, conforme al RGPD                    |
| **Sesgo del modelo hacia cultivos o zonas mejor representados**                           | Conjunto de datos diverso, evaluación por tipo de cultivo y zona, e indicación del nivel de confianza en cada predicción        |
| **Errores del sistema** (falsa alarma, plaga no detectada, riego excesivo o insuficiente) | La persona decide, límites de seguridad en el riego, alertas explicables y umbrales conservadores en las predicciones de riesgo |
| **Respuestas erróneas del asistente**                                                     | Recuperación de normativa con cita de la fuente (RAG) y revisión periódica por expertos                                         |
| **Dependencia del proveedor**                                                             | Exportación de los datos del cliente en formatos abiertos                                                                       |
| **Impacto en el empleo agrario**                                                          | Diseño centrado en asistir al operario, no en sustituirlo, con formación incluida en el despliegue                              |
| **Huella ambiental del cómputo**                                                          | Aprendizaje por transferencia y modelos eficientes en lugar de entrenamientos desde cero                                        |

### 4.2 Conclusiones

AgriMind AI es técnicamente viable porque se construye sobre tecnologías maduras: CNN para imagen, satélites Sentinel de acceso abierto, sensores IoT, aprendizaje por refuerzo y modelos de lenguaje con recuperación de información. El riesgo principal no es la tecnología, sino la disponibilidad de datos etiquetados de calidad y la capacidad de generalizar entre cultivos y climas. La estrategia de datos abiertos, sintéticos y de alianzas con cooperativas responde directamente a ese riesgo.

Las conclusiones del proyecto se resumen en tres ideas:

1. **Transformación digital.** El sector primario evoluciona hacia decisiones basadas en datos de alta precisión.
2. **Modelo escalable.** La arquitectura se adapta a múltiples cultivos, parcelas y zonas geográficas.
3. **Sinergia sostenible.** Rendimiento económico y preservación del medio ambiente se refuerzan en lugar de competir.

**Propuestas de futuro**

* Realizar pilotos con cooperativas y medir el ahorro de agua real frente al objetivo del 30 %.
* Ampliar el catálogo de cultivos y de zonas geográficas.
* Incorporar aprendizaje federado, para mejorar los modelos con datos de varias explotaciones sin que estas compartan sus datos en bruto.
* Conectar la plataforma con válvulas y maquinaria de riego automatizadas.
* Añadir indicadores de huella hídrica y de trazabilidad para el cumplimiento normativo.
* Extender el asistente a más idiomas y a un modo de uso sin conexión.

## 5\. Bibliografía y Ficha Tecnológica

El proyecto, su presentación y esta memoria se han elaborado con herramientas de IA. La tabla las recoge junto con su función exacta; las filas marcadas con corchetes deben completarse con las herramientas que se usaron realmente.

### 5.1 Herramientas de IA utilizadas

| Herramienta                                        | Tipo                          | Función exacta en el proyecto                                                                                                                   |
| -------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gemini 3.6 Thinking**                            | Texto y razonamiento          | Definición de la idea de negocio, desarrollo del contenido técnico de la presentación y estructuración de los apartados exigidos por la rúbrica |
| **Gemini Notebook (NotebookLM)**                   | Gestión de fuentes y síntesis | Espacio de trabajo con las fuentes del proyecto; síntesis y consulta del material para elaborar la presentación                                 |
| **Claude (Anthropic)**                             | Texto                         | Redacción y ampliación técnica de este informe a partir del contenido de la presentación                                                        |
| *[Herramienta de generación del logo]*           | Imagen                        | Creación del logotipo y de la narrativa de marca de AgriMind                                                                                    |
| *[Herramienta de generación de imágenes]*        | Imagen                        | Imágenes ilustrativas de la presentación, como la escena de dron sobre cultivo                                                                  |
| *[Herramienta de generación de la presentación]* | Presentación                  | Maquetación y diseño de las diapositivas                                                                                                        |
| *[Herramienta de voz o audio, si se usó]*        | Sonido                        | Narración o soporte auditivo de la presentación                                                                                                 |
| *[Herramienta de vídeo, si se usó]*              | Vídeo                         | Elementos de vídeo de la presentación                                                                                                           |

### 5.2 Enlaces del proyecto

* **Presentación (soporte visual y auditivo generado 100 % por IA):** *[PEGAR AQUÍ EL ENLACE A LA PRESENTACIÓN]*
* **Espacio de trabajo de NotebookLM:** *[PEGAR AQUÍ EL ENLACE AL ESPACIO DE TRABAJO DE NOTEBOOKLM]*

### 5.3 Referencias técnicas

* Agencia Espacial Europea. [Sentinel-2](https://www.google.com/url?sa=E&amp;q=https%3A%2F%2Fwww.esa.int%2FApplications%2FObserving%5Fthe%5FEarth%2FCopernicus%2FSentinel-2): misión de dos satélites con 13 bandas espectrales, resolución de 10 m y revisita de 5 días. Consultado el 14/10/2026.
* Programa Copernicus. [Copernicus Data Space Ecosystem](https://www.google.com/url?sa=E&amp;q=https%3A%2F%2Fdataspace.copernicus.eu%2F): acceso a imágenes multiespectrales Sentinel.
* Publicaciones especializadas sobre agricultura de precisión y redes neuronales convolucionales (CNN) aplicadas a la detección de enfermedades en cultivos. *[Añadir las referencias concretas consultadas, con autor, año y enlace.]*
