# Claude para la Gestión Empresarial

Landing de captación de contactos para el curso **Claude para la Gestión Empresarial**,
con backend propio en Google Apps Script.

Está armada sobre la **misma estructura de diseño** que las landings de Ciberseguridad
y Google Sheets (mismo CSS, misma grilla, mismos componentes, mismo logo y misma
paleta), pero es **totalmente independiente**: sus propios archivos, su propia planilla
de Google Sheets y su propia secuencia de emails. Nada de lo que se toque acá afecta
a las otras landings.

```
CLAUDE PARA LA GESTIÓN EMPRESARIAL/
├── index.html           La landing completa (HTML + CSS + JS, sin dependencias)
├── Codigo-CLAUDE.gs     Backend para pegar en Google Apps Script
├── README.md            Este archivo
└── assets/
    ├── hero-claude.webp          La imagen del inicio, recortada (la que usa la landing)
    ├── hero-claude.png           El mismo recorte sin comprimir, por si hay que reeditarlo
    ├── hero-claude-original.jpg  El original que pasaste, con fondo blanco
    ├── logo-curso-blanco.png     El logo que usan el header y el pie
    └── logo-curso-color.png     El mismo logo, para el favicon
```

---

## Antes de publicar

Los datos de conexión ya están cargados: Apps Script, WhatsApp, email de contacto
y ficha del curso. La landing está lista para subir.

Tiene que ser una implementación **nueva**, con planilla nueva: no reutilices la URL
`/exec` de Ciberseguridad ni la de Google Sheets, o los contactos de este curso van a
caer en la planilla equivocada.

---

## Datos del curso cargados

| | |
|---|---|
| **Inicia** | Lunes 28 de septiembre |
| **Modalidad** | Online en vivo por Zoom · todas las clases quedan grabadas |
| **Programa** | 4 módulos temáticos, a lo largo de 5 encuentros |
| **Horario** | Argentina/Uruguay/Chile 20:00–22:00 · Bolivia 19:00–21:00 · Perú/Ecuador 18:00–20:00 · México 17:00–19:00 |
| **Dirigido a** | Profesionales independientes y consultores · Emprendedores y equipos administrativos · Marketing, RRHH y áreas comerciales · Interesados en crear soluciones digitales |
| **Incluye** | Certificación · Grabación de las clases · Modalidad online |
| **Responder a** (emails) | lucianaherreraescencial@gmail.com |
| **Avisos de leads nuevos** | yjuarez@escencialconsult.com.ar |
| **Email en el pie de la landing** | yjuarez@escencialconsult.com.ar |
| **WhatsApp** | https://wa.link/b0luoh |
| **Ficha del curso en la web** | https://escencialconsultora.com.ar/cursos/1129/claude-para-la-gestion-empresarial-28-de-septiembre-del-2026-online |
| **Apps Script (app web)** | .../AKfycbzmCQ-9Dq8rqlYn39TgBZ93Ww40h5WnyVmoFTJkz_mRtBHkEW01ZnQyLzW2c5iaBgrM/exec |
| **Paleta** | `#52006a` morado · `#e2b808` dorado · `#ffffff` blanco |

> **Regla del dorado.** `#e2b808` sobre blanco tiene apenas **1.9:1** de contraste:
> es ilegible. Funciona como **relleno de botón** (siempre con el texto en morado,
> que da 7:1) o como **texto sobre fondo oscuro**, nunca como texto sobre blanco ni
> con texto blanco encima. Por eso en las secciones claras el acento es morado y el
> dorado aparece como relleno o resaltador. Si cambiás un color, respetá esa regla
> o los botones quedan ilegibles.

### Sobre la imagen del hero

La pieza del curso venía con **fondo blanco**, que sobre el morado del hero se veía
como un rectángulo pegado. El fondo se quitó de forma automática, pero **no por
brillo**: la persona lleva una camisa blanca, y cualquier umbral que borrara el fondo
le habría borrado también la camisa.

En cambio se usa un **relleno desde los bordes** (flood fill): se marca como fondo el
blanco que está *conectado con el borde* de la imagen. La camisa, al estar rodeada
por el saco y la piel, nunca queda conectada al borde, así que se conserva intacta.
Se eliminó así el 32% de los píxeles, con un suavizado de 1 píxel en el contorno para
que el recorte no quede dentado.

Dos detalles más del CSS:

- La imagen **se desvanece abajo** (`mask-image`), porque el original corta el cuerpo
  en seco y, sin el fondo, ese corte quedaba a la vista.
- Las dos tarjetas flotantes van en esquinas opuestas para no taparle ni el panel de
  Claude ni la cara de la persona.

En `assets/` quedan tres archivos, y conviene saber para qué es cada uno:

| Archivo | Para qué |
|---|---|
| `hero-claude.webp` | **El que carga la landing.** 1100 px, 109 KB |
| `hero-claude.png` | El mismo recorte sin comprimir, 1300 px y 2 MB. Es el master: si hay que reeditar, se parte de acá |
| `hero-claude-original.jpg` | El original que pasaste, con fondo blanco y sin tocar |

El WebP pesa **20 veces menos** que el PNG y se ve idéntico, que en una landing con
tráfico de celular es la diferencia entre cargar rápido o no. El `og:image` —la vista
previa al compartir el link— apunta al PNG a propósito, porque no todos los
previsualizadores de WhatsApp y redes leen WebP.

---

## Puesta en marcha

### 1. Crear la planilla y pegar el backend

1. Crear una planilla **nueva** en Google Sheets. No reutilices la de Ciberseguridad
   ni la de Google Sheets Integral: si comparten planilla, se mezclan los contactos
   y las métricas de los tres cursos.
2. **Extensiones → Apps Script** → borrar lo que haya y pegar `Codigo-CLAUDE.gs` completo.
   Ojo: se pega **el `.gs`**, no este README.
3. **⚙️ Configuración del proyecto → Zona horaria → (GMT-03:00) Buenos Aires.**
   Sin esto, los emails con fecha fija salen a la hora equivocada.
4. Ejecutar la función **`configurarTodo()`** una sola vez y aceptar los permisos.
   Crea las hojas *Leads*, *Clics WhatsApp*, *Log Emails* y *Panel*, e instala el
   disparador que revisa la secuencia cada 15 minutos. **Este paso es el que activa
   todo**: sin él, el formulario guarda pero los emails programados no salen nunca.

### 2. Publicar la app web

**Implementar → Nueva implementación → Aplicación web**

- Ejecutar como: **Yo**
- Quién tiene acceso: **Cualquier usuario**

Copiar la URL que termina en `/exec`.

### 3. Conectar la landing

En `index.html`, bloque `CONFIG` (cerca del final del archivo):

```js
APPS_SCRIPT_URL: "PEGAR_AQUI_LA_URL_DEL_APPS_SCRIPT",
```

Reemplazar por la URL `/exec` del paso anterior. **Hasta que no hagas esto, el
formulario no guarda nada.**

> **Ya está hecho.** La URL cargada es la que termina en `.../AKfycbzmCQ-9Dq.../exec`,
> y se verificó que responde con `"servicio":"Claude para la Gestión Empresarial"`.
> Solo hay que volver a este paso si creás una implementación nueva desde cero,
> porque en ese caso la URL cambia.

Para confirmar que pegaste el backend correcto, abrí la URL `/exec` en el navegador.
Tiene que responder:

```json
{"ok":true,"servicio":"Claude para la Gestión Empresarial","estado":"activo","pasos_secuencia":3}
```

Si dice otro nombre de curso, está pegado el archivo equivocado.

### 4. Subir la landing

Subir el contenido de esta carpeta (`index.html` + `assets/`) a cualquier hosting
estático. Como el archivo ya se llama `index.html`, la carpeta se puede publicar
tal cual.

> ⚠️ Cada vez que edites `Codigo-CLAUDE.gs` en Apps Script tenés que hacer
> **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar**.
> Si no, la web sigue usando la versión vieja del código.

---

## Secuencia de emails

| # | Email | Cuándo sale |
|---|---|---|
| 1 | Toda la información | Al instante, apenas se registra |
| 2 | 🚨 Últimos cupos | jueves 24/09 10:30, a todos los registrados |
| 3 | 🚀 Hoy iniciamos | lunes 28/09 09:00, día de inicio |

> **La fecha del email 2 la elegí yo.** No me la pasaste: puse el **jueves 24/09**,
> cuatro días antes del inicio, siguiendo el criterio de los otros dos cursos. Si
> preferís otra, se cambia en una sola línea: `fechaFija: '2026-09-24 10:30'` en el
> bloque `SECUENCIA_EMAILS` de `Codigo-CLAUDE.gs`.

Cada paso admite `esperaHoras` (relativo al registro) o `fechaFija` (fecha del
calendario, igual para todos). **No repitas el `id` de un paso**: es lo que evita que
un email se mande dos veces a la misma persona.

Quien se registre **después** de una fecha fija no recibe ese email —no tendría
sentido recibir "hoy iniciamos" tres días más tarde—: queda marcado como *omitido*
y la secuencia sigue normalmente.

Los tres emails incluyen la **tabla de horarios por país**, que se arma sola desde
`CONFIG.HORARIOS_POR_PAIS`. Si cambia un huso, se edita ahí una sola vez y se
actualiza en los tres.

Antes de que salgan de verdad podés verificarlos con **🔍 Simular envíos en una fecha**:
te pide una fecha (por ejemplo `2026-09-24 10:30`) y te dice exactamente quién recibiría
qué, sin enviar nada.

### Cabecera de los emails

`CONFIG.IMAGEN_ENCABEZADO` está **vacío**, así que los emails salen con una cabecera
de texto (nombre del curso sobre fondo morado profundo). Si tenés la pieza gráfica
del curso subida a un servidor público, pegá su URL ahí y pasa a usarse como imagen
a todo el ancho. Tiene que ser un link público que Gmail pueda leer — Google Drive
no sirve.

---

## Métricas de WhatsApp

Todos los botones de WhatsApp de la landing tienen la clase `js-whatsapp` y un
atributo `data-origen` que identifica desde dónde se hizo clic:

| `data-origen` | Dónde está el botón |
|---|---|
| `boton-flotante` | El botón verde fijo abajo a la derecha |
| `seccion-formulario` | Al lado del formulario de inscripción |
| `post-formulario` | En el mensaje de "¡Recibimos tus datos!" |
| `footer` | En el pie de página |

Cada clic se registra en la hoja **Clics WhatsApp** con fecha, botón, dispositivo y
campaña. Si la persona ya había completado el formulario, el clic además se suma a
su ficha en la hoja *Leads* y su estado pasa a `CONTACTÓ POR WHATSAPP`.

El **Panel** de la planilla muestra el total de clics, los clics por botón, la tasa
de clic sobre contactos y los contactos por perfil, por nivel, por país, por
procedencia y por campaña.

---

## Temario cargado

| | Módulo |
|---|---|
| I | Introducción a Claude |
| II | Claude Chat, proyectos e instrucciones personalizadas |
| III | Claude para productividad, análisis y automatización de procesos |
| IV | Claude Code y creación de páginas web |

El módulo IV va destacado (tarjeta morada, abierta por defecto) por ser el cierre del
programa.

Son **4 módulos temáticos que se desarrollan a lo largo de 5 encuentros**, tal como
figura en la página oficial del curso. La landing lo dice así en la bajada de
*Contenidos*, y en la barra de datos del hero el número grande es **5 (encuentros)**,
que es el dato que le importa a quien se está por inscribir.

---

## Qué falta definir

- **Valor e inscripción.** Hoy se derivan a WhatsApp, como en las otras landings.
- **Fecha del email de últimos cupos.** Quedó el 24/09 por criterio propio; confirmala
  o cambiala.
- **Detalle de cada encuentro.** El temario que pasaste describe los 4 módulos pero no
  dice qué se ve en cada una de las 5 clases. Si tenés ese cronograma, se puede sumar
  a la sección de contenidos.

---

## ⚠️ Ojo al pegar el código en Apps Script

Cada curso tiene su propio backend y **no son intercambiables**:

| Archivo | Para qué landing |
|---|---|
| `Codigo.gs` | Clínica del Contador — **NO** usar acá |
| `Codigo-EXCEL-IA.gs` | Excel para Contadores — **NO** usar acá |
| `Codigo-CIBER-IA.gs` | Ciberseguridad y Herramientas de IA — **NO** usar acá |
| `Codigo-SHEETS-IA.gs` | Google Sheets Integral — **NO** usar acá |
| `Codigo-CLAUDE.gs` | **Este curso** |

Para saber cuál está corriendo en una implementación, abrí su URL `/exec` en el
navegador: el campo `servicio` tiene que decir `Claude para la Gestión Empresarial`.

---

## Menú dentro de la planilla

Al abrir la planilla aparece el menú **⚙️ Claude Gestión** con:

- `1. Configurar todo (primera vez)`
- `2. Procesar secuencia ahora` — fuerza la revisión sin esperar al disparador
- `✅ Verificar configuración activa`
- `Ver programación de la secuencia`
- `🔍 Simular envíos en una fecha (no envía)`
- `Enviar email 1 de prueba (a mí)` / `Enviar LOS 3 emails de prueba (a mí)`
- `Simular un lead de prueba`
- `Ver cuota de emails disponible`
- `🩺 Diagnosticar por qué no llegan los emails`
- `🚀 Preparar para producción (borra las pruebas)`
