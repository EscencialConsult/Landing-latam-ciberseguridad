# Ciberseguridad y Herramientas de IA

Landing de captación de contactos para el curso **Ciberseguridad y Herramientas
de IA**, con backend propio en Google Apps Script.

Está armada sobre el mismo modelo que las landings de Clínica del Contador y de
Excel + IA, pero es **totalmente independiente**: sus propios archivos, su propia
planilla de Google Sheets y su propia secuencia de emails. Nada de lo que se toque
acá afecta a las otras landings.

```
ciberseguridad-ia/
├── index.html            La landing completa (HTML + CSS + JS, sin dependencias)
├── Codigo-CIBER-IA.gs    Backend para pegar en Google Apps Script
├── README.md             Este archivo
└── assets/
    ├── logo-curso.png          El original que compartiste (negro sobre transparente)
    ├── logo-curso-color.png    El mismo, recortado (favicon y fondos claros)
    ├── logo-curso-blanco.png   Versión blanca, la que usa la landing en header y pie
    ├── hero-ciber.png          La imagen del inicio, recortada al sujeto
    └── logo-escencial-blanco.png  Logo de Escencial Consultora (hoy no se usa)
```

---

## Antes de publicar

Los datos de conexión ya están cargados: Apps Script, WhatsApp, email de contacto y
ficha del curso. La landing está lista para subir.

Además, el **nombre del curso** quedó como *"Ciberseguridad y Herramientas de IA"*,
derivado del temario y del texto que pasaste. Si el nombre oficial es otro,
cambialo en `index.html` (`<title>`, el `<h1>` del hero, el pie y `CONFIG.CURSO`)
y en `Codigo-CIBER-IA.gs` (`CONFIG.CURSO_NOMBRE` y los asuntos de los tres emails).

---

## Datos del curso cargados

| | |
|---|---|
| **Inicia** | Jueves 17 de septiembre |
| **Modalidad** | Online en vivo |
| **Programa** | 5 módulos |
| **Horario** | Argentina/Uruguay/Chile 20:00–22:00 · Bolivia 19:00–21:00 · Perú/Ecuador 18:00–20:00 · México 17:00–19:00 |
| **Dirigido a** | Profesionales y equipos de empresas · Responsables de gestión, compliance y administración · Programadores y perfiles técnicos |
| **Incluye** | Certificación · Aula Virtual · Grabación de la clase · Trabajo práctico |
| **Responder a** (emails) | lucianaherreraescencial@gmail.com |
| **Avisos de leads nuevos** | yjuarez@escencialconsult.com.ar |
| **Email en el pie de la landing** | yjuarez@escencialconsult.com.ar |
| **WhatsApp** | https://wa.link/ylazw7 |
| **Ficha del curso en la web** | https://escencialconsultora.com.ar/cursos/1080/ciberseguridad-empresarial-17-de-septiembre-del-2026-online |
| **Apps Script (app web)** | .../AKfycbxLs1kAOsy1KdDyHTqHE-8plkdDfsxcjHtXMeSkQWF5mfAf_6AOV_VLQFC2DLMgzWfiyA/exec |
| **Paleta** | `#52006a` morado · `#e2b808` dorado · `#ffffff` blanco |

> **Regla del dorado.** `#e2b808` sobre blanco tiene apenas **1.9:1** de contraste:
> es ilegible. Funciona como **relleno de botón** (siempre con el texto en morado,
> que da 7:1) o como **texto sobre fondo oscuro**, nunca como texto sobre blanco ni
> con texto blanco encima. Por eso en las secciones claras el acento es morado y el
> dorado aparece como relleno o resaltador. Si cambiás un color, respetá esa regla
> o los botones quedan ilegibles.

### Sobre los logos

El logo que pasaste viene en **negro sobre fondo transparente**, y la landing tiene
el header, el hero y el pie en morado oscuro: tal cual venía, no se veía. Por eso
hay tres versiones en `assets/`:

- `logo-curso.png` — el original sin tocar, por si lo necesitás.
- `logo-curso-color.png` — el mismo recortado (se le sacaron los márgenes vacíos,
  que ocupaban dos tercios de la imagen). Se usa de favicon.
- `logo-curso-blanco.png` — el texto pasado a blanco, conservando el círculo dorado
  y las líneas roja y verde. **Es el que usa la landing** en el header y en el pie.

Si más adelante te pasan el logo ya en versión blanca, reemplazá directamente
`logo-curso-blanco.png` y no hay que tocar nada más.

---

## Puesta en marcha

### 1. Crear la planilla y pegar el backend

1. Crear una planilla **nueva** en Google Sheets (no reutilizar la de Excel + IA ni
   la de Clínica del Contador: si comparten planilla, se mezclan los contactos y las
   métricas).
2. **Extensiones → Apps Script** → borrar lo que haya y pegar `Codigo-CIBER-IA.gs` completo.
3. **⚙️ Configuración del proyecto → Zona horaria → (GMT-03:00) Buenos Aires.**
   Sin esto, los emails con fecha fija salen a la hora equivocada.
4. Revisar el bloque `CONFIG` (arriba de todo) y completar los datos que faltan.
5. Ejecutar la función **`configurarTodo()`** una sola vez y aceptar los permisos.
   Crea las hojas *Leads*, *Clics WhatsApp*, *Log Emails* y *Panel*, e instala el
   disparador que revisa la secuencia cada 15 minutos.

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

> **Ya está hecho.** La URL cargada es la que termina en `.../AKfycbxLs1k.../exec`.
> Solo hay que volver a este paso si algún día creás una implementación nueva desde
> cero, porque en ese caso la URL cambia.

### 4. Subir la landing

Subir el contenido de esta carpeta (`index.html` + `assets/`) a cualquier hosting
estático. Como el archivo ya se llama `index.html`, la carpeta se puede publicar
tal cual.

> **En Netlify (o cualquier hosting conectado a este repo):** el `index.html` de la
> **raíz** es el de Clínica del Contador y el de `excel-ia/` es el del curso de Excel.
> Hay que configurar el **Publish directory** en `ciberseguridad-ia`, o si no se
> publica la landing equivocada.

> ⚠️ Cada vez que edites `Codigo-CIBER-IA.gs` en Apps Script tenés que hacer
> **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar**.
> Si no, la web sigue usando la versión vieja del código.

---

## Secuencia de emails

| # | Email | Cuándo sale |
|---|---|---|
| 1 | Toda la información | Al instante, apenas se registra |
| 2 | 🚨 Últimos cupos | viernes 11/09 10:30, a todos los registrados |
| 3 | 🚀 Hoy iniciamos | jueves 17/09 09:00, día de inicio |

Las fechas y los textos se editan en el bloque `SECUENCIA_EMAILS` de
`Codigo-CIBER-IA.gs`. Cada paso admite `esperaHoras` (relativo al registro) o
`fechaFija` (fecha del calendario, igual para todos). **No repitas el `id` de un
paso**: es lo que evita que un email se mande dos veces a la misma persona.

Los tres emails incluyen la **tabla de horarios por país**, que se arma sola desde
`CONFIG.HORARIOS_POR_PAIS`. Si cambia un huso, se edita ahí una sola vez y se
actualiza en los tres.

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
de clic sobre contactos y los contactos por perfil, por nivel, **por país**, por
procedencia y por campaña.

> El formulario suma un campo **País** que las otras dos landings no tienen: como el
> curso se dicta en cuatro husos horarios, sirve para saber a qué horario responde
> cada contacto. Por eso las columnas de la hoja *Leads* están corridas un lugar
> respecto de las otras planillas.

---

## Temario cargado

Los 5 módulos del programa están en la sección *Contenidos*, cada uno con su
listado de temas desplegable y su actividad práctica:

| | Módulo |
|---|---|
| I | Fundamentos de ciberseguridad y amenazas reales |
| II | Herramientas y buenas prácticas de prevención |
| III | Marco legal en Argentina, Latinoamérica y el mundo digital |
| IV | Cultura de cumplimiento y prevención organizacional (compliance) |
| V | Seguridad para programadores y entornos técnicos |

El módulo V va destacado (tarjeta morada, abierta por defecto) por ser el cierre del
programa. El módulo III, que es el más largo, usa subtítulos (*Legislación argentina
/ internacional / América Latina*) con sus temas anidados.

---

## Qué falta definir

- **Duración del curso.** No figura en la landing porque no está definida. Si hay una
  cantidad de clases o de semanas, conviene sumarla a la barra de datos del hero
  (donde hoy dice "5 módulos") y a la sección *Qué incluye*.
- **Valor e inscripción.** Hoy se derivan a WhatsApp, como en las otras landings.

---

## ⚠️ Ojo al pegar el código en Apps Script

En este repo hay **tres** backends distintos:

| Archivo | Para qué landing |
|---|---|
| `Codigo.gs` (en la raíz) | Clínica del Contador — **NO** usar acá |
| `excel-ia/Codigo-EXCEL-IA.gs` | Excel para Contadores — **NO** usar acá |
| `ciberseguridad-ia/Codigo-CIBER-IA.gs` | Este curso |

Para saber cuál está corriendo en una implementación, abrí su URL `/exec` en el
navegador. Tiene que responder:

```json
{"ok":true,"servicio":"Ciberseguridad y Herramientas de IA","estado":"activo","pasos_secuencia":3}
```

Si dice otro nombre, está pegado el archivo equivocado.

---

## Menú dentro de la planilla

Al abrir la planilla aparece el menú **⚙️ Ciber + IA** con:

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
