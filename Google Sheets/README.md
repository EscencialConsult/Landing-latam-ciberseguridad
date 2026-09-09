# Google Sheets Integral

Landing de captación de contactos para la capacitación **Google Sheets
Integral**, con backend propio en Google Apps Script.

Está armada sobre la misma estructura y el mismo diseño que la landing de
Ciberseguridad, pero es **totalmente independiente**: sus propios archivos, su
propia planilla de Google Sheets y su propia secuencia de emails. Nada de lo que
se toque acá afecta a la otra landing.

```
Google Sheets/
├── index.html              La landing completa (HTML + CSS + JS, sin dependencias)
├── Codigo-SHEETS-IA.gs     Backend para pegar en Google Apps Script
├── README.md               Este archivo
└── assets/
    ├── hero-sheets.png            La imagen del inicio, recortada (la que usa la landing)
    ├── hero-sheets-panoramica.jpg La apaisada, para la vista previa al compartir el link
    ├── hero-sheets-original.png   La cuadrada que pasaste, sin tocar (fondo negro)
    ├── logo-curso.png             El logo original (negro sobre transparente)
    ├── logo-curso-color.png       El mismo, recortado (favicon y fondos claros)
    ├── logo-curso-blanco.png      Versión blanca, la que usa la landing en header y pie
    └── logo-escencial-blanco.png  Logo de Escencial Consultora (hoy no se usa)
```

---

## ⚠️ Lo primero: falta un dato

**No está definido el horario de cursada.** Solo sabemos que inicia el martes
22/09 y que las clases son en vivo por Zoom "de acuerdo con el cronograma
establecido". Como no me lo pasaste, **no lo inventé**:

- En `index.html`, donde la landing de Ciberseguridad muestra la tabla de husos
  horarios por país, esta muestra cuatro datos neutros (Comienza · Modalidad ·
  Las clases · Al finalizar). Arriba del bloque hay un comentario con el HTML
  exacto para reemplazarlo por los husos cuando tengas los horarios.
- En `Codigo-SHEETS-IA.gs`, `CONFIG.HORARIOS_POR_PAIS` está **vacío** (con las
  cuatro líneas listas, comentadas). Mientras esté vacío, los emails
  directamente no muestran esa tabla, en vez de mostrar un recuadro en blanco.

Cuando definas el horario, se carga en esos dos lugares y listo.

---

## Datos cargados

| | |
|---|---|
| **Inicia** | Martes 22 de septiembre |
| **Modalidad** | Online en vivo por Zoom |
| **Programa** | 5 módulos |
| **Horario** | ⚠️ **Sin definir** (ver arriba) |
| **Dirigido a** | Profesionales y equipos administrativos · Profesionales que trabajan con datos · Emprendedores y equipos de trabajo · Perfiles que buscan automatización e IA |
| **Incluye** | Certificación · Aula Virtual · Grabación de las clases · Trabajo práctico |
| **Responder a** (emails) | lucianaherreraescencial@gmail.com |
| **Avisos de leads nuevos** | yjuarez@escencialconsult.com.ar |
| **Email en el pie de la landing** | yjuarez@escencialconsult.com.ar |
| **WhatsApp** | https://wa.link/w5hscw |
| **Ficha del curso en la web** | ⚠️ Todavía apunta a `escencialconsultora.com.ar` (home). Cambiala por la ficha del curso cuando esté publicada. |
| **Apps Script (app web)** | ✅ Conectado y verificado: `.../AKfycbyVKe2c7Kfy.../exec` |
| **Paleta** | `#52006a` morado · `#e2b808` dorado · `#ffffff` blanco |

> **Nombre de la capacitación.** Es *"Google Sheets Integral"*. Si alguna vez
> cambia, aparece en `index.html` (`<title>`, el `og:title`, el `<h1>` del hero, el
> pie y `CONFIG.CURSO`) y en `Codigo-SHEETS-IA.gs` (`CONFIG.CURSO_NOMBRE`, el
> `WHATSAPP_MENSAJE` y los asuntos y cuerpos de los tres emails).

> **Regla del dorado.** `#e2b808` sobre blanco tiene apenas **1.9:1** de contraste:
> es ilegible. Funciona como **relleno de botón** (siempre con el texto en morado,
> que da 7:1) o como **texto sobre fondo oscuro**, nunca como texto sobre blanco ni
> con texto blanco encima. Si cambiás un color, respetá esa regla o los botones
> quedan ilegibles.

---

## Sobre las imágenes

**El logo** que pasaste (`imgur.com/8io2cUg`) es el mismo "ESCENCIAL BO" que ya
usa la landing de Ciberseguridad: negro sobre fondo transparente. Como el header,
el hero y el pie son morado oscuro, tal cual venía no se veía. Por eso se
reutilizan las tres versiones que ya existían:

- `logo-curso.png` — el original sin tocar.
- `logo-curso-color.png` — el mismo recortado. Se usa de favicon.
- `logo-curso-blanco.png` — el texto en blanco, conservando el círculo dorado y
  las líneas roja y verde. **Es el que usa la landing** en el header y en el pie.

**La imagen del hero** venía con el fondo negro pegado. Se le sacó el fondo y va
**flotando sobre el morado, sin marco ni recuadro**, exactamente como la del curso
de Ciberseguridad:

- `hero-sheets.png` — **la que usa la landing** (601×522, fondo transparente).
  Sale de la pieza apaisada `imgur.com/xeV8Sc8`, recortada y con los márgenes
  negros ya descartados.
- `hero-sheets-panoramica.jpg` — la misma pieza sin recortar (1024×538). Se usa
  solo para la vista previa cuando se comparte el link por WhatsApp, Facebook o
  LinkedIn, que piden esa proporción.
- `hero-sheets-original.png` — la versión cuadrada, sin tocar.

> **Cómo se hizo el recorte, por si hay que rehacerlo.** El problema de recortar
> esta pieza es que la persona tiene el pelo oscuro sobre fondo negro: si se
> recorta por brillo, el recorte se mete en el pelo y el morado del hero se
> traspasa. La solución fue separar el fondo por el **canal rojo**: el resplandor
> verde de los paneles tiene el rojo prácticamente en cero, y la persona (piel,
> pelo castaño, saco beige) siempre lo tiene alto. Así el recorte se come el negro
> y el resplandor pero no puede entrar en ella.
>
> Los paneles quedaron **translúcidos** sobre el morado, igual que el panel azul
> de la imagen de Ciberseguridad. Los mechones sueltos de pelo dejan ver el fondo
> entre ellos, que es como se ve el pelo recortado de verdad; el cuerpo, la cara y
> la ropa están 100% opacos.

---

## Puesta en marcha

### 1. Crear la planilla y pegar el backend

1. Crear una planilla **nueva** en Google Sheets. **No reutilizar la de
   Ciberseguridad:** si comparten planilla, se mezclan los contactos y las métricas.
2. **Extensiones → Apps Script** → borrar lo que haya y pegar `Codigo-SHEETS-IA.gs` completo.
3. **⚙️ Configuración del proyecto → Zona horaria → (GMT-03:00) Buenos Aires.**
   Sin esto, los emails con fecha fija salen a la hora equivocada.
4. Revisar el bloque `CONFIG` (arriba de todo).
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

> ✅ **Ya está hecho.** La URL cargada es la que termina en
> `.../AKfycbyVKe2c7Kfy.../exec`, y se verificó que responde con el backend
> correcto. Solo hay que volver a este paso si algún día creás una implementación
> nueva desde cero, porque en ese caso la URL cambia.

Para verificar que quedó pegado el archivo correcto, abrí la URL `/exec` en el
navegador. Tiene que responder:

```json
{"ok":true,"servicio":"Google Sheets Integral","estado":"activo","pasos_secuencia":3}
```

Si dice "Ciberseguridad", está pegado el backend equivocado.

### 4. Subir la landing

Subir el contenido de esta carpeta (`index.html` + `assets/`) a cualquier hosting
estático. Como el archivo ya se llama `index.html`, la carpeta se puede publicar
tal cual. En Netlify (o similar) hay que apuntar el **Publish directory** a esta
carpeta, o se publica la landing equivocada.

> ⚠️ Cada vez que edites `Codigo-SHEETS-IA.gs` en Apps Script tenés que hacer
> **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva → Implementar**.
> Si no, la web sigue usando la versión vieja del código.

---

## Secuencia de emails

| # | Email | Cuándo sale |
|---|---|---|
| 1 | Toda la información | Al instante, apenas se registra |
| 2 | 🚨 Últimos cupos | jueves 17/09 10:30, a todos los registrados |
| 3 | 🚀 Hoy iniciamos | martes 22/09 09:00, día de inicio |

Las fechas y los textos se editan en el bloque `SECUENCIA_EMAILS` de
`Codigo-SHEETS-IA.gs`. Cada paso admite `esperaHoras` (relativo al registro) o
`fechaFija` (fecha del calendario, igual para todos). **No repitas el `id` de un
paso**: es lo que evita que un email se mande dos veces a la misma persona.

Los tres emails incluyen la **tabla de horarios por país**, que se arma sola desde
`CONFIG.HORARIOS_POR_PAIS`. Como hoy está vacía, el bloque no aparece. Al cargarla,
se actualiza en los tres de una sola vez.

### Cabecera de los emails

`CONFIG.IMAGEN_ENCABEZADO` está **vacío**, así que los emails salen con una cabecera
de texto (nombre de la capacitación sobre fondo morado profundo). Si tenés la pieza
gráfica subida a un servidor público, pegá su URL ahí y pasa a usarse como imagen a
todo el ancho. Tiene que ser un link público que Gmail pueda leer — Google Drive
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

## Contenidos cargados

Los contenidos de la sección *Contenidos* están **derivados del texto que pasaste**
(que describía los ejes, no el temario módulo por módulo). Los cinco módulos
recorren exactamente lo que decía el material —manejo de Sheets, funciones
avanzadas, análisis de datos, automatización, Apps Script, integraciones e IA—
pero **conviene que los revises y ajustes** contra el programa oficial:

| | Módulo |
|---|---|
| I | Google Sheets: base sólida para trabajar con datos |
| II | Fórmulas y funciones avanzadas |
| III | Análisis de datos: tablas dinámicas, QUERY y visualización |
| IV | Automatización de procesos y Apps Script |
| V | Inteligencia Artificial aplicada a Google Sheets |

El módulo V va destacado (tarjeta morada, abierta por defecto) por ser el cierre del
programa, igual que el V de Ciberseguridad. Los módulos II, III, IV y V usan
subtítulos con temas anidados.

Cada módulo cierra con una **actividad práctica**. Esas también son propuestas: si
las prácticas reales son otras, se editan en el `<p class="actividad">` de cada
módulo.

---

## Qué falta definir

- **Horario de cursada.** Es lo más importante (ver arriba).
- **Duración.** No figura en la landing porque no está definida. Si hay una cantidad
  de clases o de semanas, conviene sumarla a la barra de datos del hero (donde hoy
  dice "5 módulos") y a la sección *Qué incluye*.
- **Ficha del curso en la web.** Hoy el pie de los emails apunta a la home.
- **Valor e inscripción.** Se derivan a WhatsApp, como en la otra landing.
- ~~URL del Apps Script~~ — ✅ ya está conectada y verificada.

---

## Menú dentro de la planilla

Al abrir la planilla aparece el menú **⚙️ Sheets + IA** con:

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
