/*  ============================================================================
    GOOGLE SHEETS INTEGRAL  —  Backend en Google Apps Script
    ----------------------------------------------------------------------------
    Qué hace este script:
      1) Recibe los datos del formulario de la landing y los guarda en Google Sheets.
      2) Te notifica por email cada vez que entra un contacto nuevo.
      3) Envía automáticamente el email de bienvenida al instante.
      4) Ejecuta una secuencia de emails en los tiempos que vos definas.
      5) Registra cada clic en los botones de WhatsApp para medir el alcance.
      6) Arma un Panel de métricas dentro de la misma planilla.

    IMPORTANTE: este script va en una planilla PROPIA de esta capacitación,
    distinta de la de Ciberseguridad y de las demás. Así las métricas y las
    secuencias de cada capacitación quedan separadas y no se pisan entre sí.

    INSTALACIÓN (paso a paso):
      1. Crear una planilla nueva en Google Sheets.
      2. Extensiones → Apps Script → pegar este archivo completo.
      3. Editar el bloque CONFIG y la SECUENCIA_EMAILS de abajo.
      4. ⚙️ Configuración del proyecto → Zona horaria → (GMT-03:00) Buenos Aires.
      5. Ejecutar la función  configurarTodo()  una sola vez y aceptar los permisos.
      6. Implementar → Nueva implementación → Aplicación web
         · Ejecutar como: Yo
         · Quién tiene acceso: Cualquier usuario
      7. Copiar la URL que termina en /exec y pegarla en index.html (APPS_SCRIPT_URL).
    ============================================================================ */


/* Versión de este archivo. Si en Apps Script ejecutás "Verificar configuración"
   y no ves este mismo número, es que pegaste una versión vieja del código. */
var VERSION_CODIGO = 'sheets-ia 2026-09-09';


/* ============================================================================
   1) CONFIGURACIÓN — EDITÁ SOLO ESTE BLOQUE
   ============================================================================ */
var CONFIG = {

  // --- Notificaciones internas -------------------------------------------------
  EMAIL_NOTIFICACION: 'yjuarez@escencialconsult.com.ar',  // A dónde te avisamos cada lead nuevo (podés poner varios separados por coma)
  NOTIFICAR_CLICS_WHATSAPP: false,                        // true = también te llega un mail por cada clic de WhatsApp

  // --- Identidad de los emails que salen al contacto ---------------------------
  NOMBRE_REMITENTE: 'Escencial Consultora',
  EMAIL_RESPUESTA: 'lucianaherreraescencial@gmail.com',   // A dónde responde el contacto si aprieta "Responder"
  FIRMA_EQUIPO: 'Escencial Consultora',

  // Link corto de WhatsApp: se usa TAL CUAL en todos los botones de los emails.
  // Tiene que ser EL MISMO que está en index.html (WHATSAPP_URL). Si lo cambiás,
  // cambialo en los dos lados o van a quedar apuntando a números distintos.
  WHATSAPP_LINK: 'https://wa.link/w5hscw',
  // Los dos de abajo solo se usan si dejás WHATSAPP_LINK vacío.
  WHATSAPP_NUMERO: '',
  WHATSAPP_MENSAJE: 'Buenas 👋 Recibí tu mail de la capacitación Google Sheets ' +
                    'Integral, ¿me podrías brindar más información?',

  // Página de la capacitación: es el link del pie de todos los emails.
  // ⚠️ Cambiala por la ficha específica del curso cuando esté publicada.
  URL_LANDING: 'https://escencialconsultora.com.ar',

  // Texto corto del link que se muestra en el pie.
  TEXTO_LINK_PIE: 'escencialconsultora.com.ar',

  // Bajada de la firma, en el pie de todos los emails.
  DESCRIPCION_FIRMA: 'Formación y herramientas para potenciar el ejercicio profesional.',

  // Imagen de cabecera de los emails. Tiene que estar alojada en un servidor
  // público que Gmail pueda leer (el sitio de Escencial, por ejemplo).
  // Si la dejás VACÍA, el email usa una cabecera de texto con el nombre del curso.
  // Google Drive NO sirve: Gmail no puede leer esas URLs.
  IMAGEN_ENCABEZADO: '',

  // --- Datos de la capacitación que se muestran en los emails ------------------
  CURSO_NOMBRE: 'Google Sheets Integral',
  CURSO_INICIO: 'Martes 22/09',
  CURSO_HORARIO: 'Según cronograma',
  CURSO_MODALIDAD: 'Online en vivo por Zoom',
  CURSO_MODULOS: 5,

  // Husos horarios de la cursada. Se muestran como tabla en los emails.
  // Formato: ['Países', 'Horario']
  //
  // ⚠️ ESTÁ VACÍO A PROPÓSITO: todavía no está definido el horario de cursada.
  // Mientras esté vacío, los emails simplemente no muestran la tabla de horarios.
  // Cuando lo definan, descomentá las cuatro líneas de abajo y ajustá los horarios,
  // y hacé lo mismo en index.html (el bloque .husos de la sección "Qué incluye").
  HORARIOS_POR_PAIS: [
    // ['Argentina · Uruguay · Chile', '20:00 a 22:00 hs'],
    // ['Bolivia',                     '19:00 a 21:00 hs'],
    // ['Perú · Ecuador',              '18:00 a 20:00 hs'],
    // ['México',                      '17:00 a 19:00 hs']
  ],

  // --- Colores de marca usados en los emails -----------------------------------
  // Paleta oficial: #52006a · #e2b808 · #ffffff
  //
  // El dorado es un color CLARO: sirve de relleno (con texto morado encima) o de
  // texto sobre fondo oscuro, pero NUNCA como texto sobre fondo blanco.
  // Por eso hay dos acentos distintos y no uno solo.
  COLOR_MORADO: '#52006a',  // morado de marca: títulos y fondos oscuros
  COLOR_DORADO: '#e2b808',  // dorado de marca: botones y texto sobre fondo oscuro
  COLOR_ACENTO: '#7d4e94',  // morado medio: textos de acento sobre fondo claro
  COLOR_FONDO: '#f8f4fa',   // fondo del email (blanco violáceo)
  COLOR_TINTA: '#2b0038',   // morado más profundo: cabecera y pie del email

  // --- Comportamiento ----------------------------------------------------------
  EVITAR_DUPLICADOS: true,     // Si el email ya existe, actualiza el registro en vez de duplicarlo
  SECUENCIA_ACTIVA: true       // false = solo guarda y notifica, sin enviar la secuencia automática
};


/* ============================================================================
   2) SECUENCIA DE EMAILS — DEFINÍ ACÁ LOS TIEMPOS Y LOS TEXTOS
   ----------------------------------------------------------------------------
   Cada paso se programa de UNA de estas dos formas:

   A) esperaHoras → relativo a cuándo la persona dejó sus datos.
        0   = al instante          24  = 1 día después
        72  = 3 días después       168 = 7 días después

   B) fechaFija  → una fecha y hora del calendario, igual para todos.
        Formato: 'AAAA-MM-DD HH:mm'   Ej: '2026-09-22 09:00'
        Se envía a todos los contactos cargados hasta ese momento.
        A quien se registre DESPUÉS de esa fecha no se le manda (no tendría
        sentido recibir "hoy iniciamos" tres días más tarde): queda marcado
        como "omitido" y la secuencia sigue normalmente.

   Extra: 'noAntesDe' se puede sumar a cualquier paso y funciona como piso.
        El email se manda cuando le toque, pero nunca antes de esa fecha.

   ⚠️ Las fechas usan la zona horaria del proyecto. Verificala en Apps Script:
      ⚙️ Configuración del proyecto → Zona horaria → (GMT-03:00) Buenos Aires.

   Podés agregar, quitar o reordenar pasos libremente, pero mantenelos en orden
   cronológico. IMPORTANTE: no repitas el "id", es lo que evita los reenvíos.
   ============================================================================ */
var SECUENCIA_EMAILS = [

  /* --------------------------------------------------------------------------
     EMAIL 1 — Sale AL INSTANTE, apenas la persona deja sus datos.
     -------------------------------------------------------------------------- */
  {
    id: 'e1_informacion',
    etiqueta: 'Toda la información',
    esperaHoras: 0,
    asunto: 'Google Sheets Integral | Toda la información',
    cuerpo: function (lead) {
      return '' +
        saludo('Hola 👋🏻') +
        p('Estamos próximos a iniciar con <b>Google Sheets Integral</b>, ' +
          'una capacitación pensada para <b>profesionales, equipos y personas que trabajan ' +
          'con datos</b> y necesitan organizar, analizar y automatizar información con ' +
          'Google Sheets.') +
        p('Durante la capacitación vas a trabajar contenidos de:') +
        listaEmoji('🔹', [
          'Organización de datos y trabajo colaborativo en Google Sheets',
          'Fórmulas y funciones avanzadas: lógicas, de texto, de fecha y anidadas',
          'Búsqueda y referencia: BUSCARV, BUSCARX, ÍNDICE + COINCIDIR',
          'Filtros, validaciones y listas desplegables',
          'Tablas dinámicas y QUERY para analizar información',
          'Gráficos y visualización de datos para reportes claros',
          'Automatización de procesos, macros y Apps Script',
          'Integraciones con Google Workspace: Forms, Gmail, Drive y Calendar',
          'Inteligencia Artificial aplicada a Google Sheets'
        ]) +
        fichaDatos([
          ['💻', 'Modalidad', 'Online en vivo por Zoom'],
          ['📅', 'Inicia', 'Martes 22 de septiembre'],
          ['📚', 'Programa', '5 módulos']
        ]) +
        tablaHorarios() +
        p('🤖 Además, vas a aprender a incorporar <b>herramientas de automatización e ' +
          'Inteligencia Artificial</b> para optimizar tareas repetitivas, agilizar procesos ' +
          'y trabajar con grandes volúmenes de información.') +
        p('🎓 La capacitación incluye <b>certificado, aula virtual, grabación de las clases ' +
          'y trabajo práctico</b>.') +
        p('💬 <b>¿Querés conocer el valor y las formas de inscripción?</b><br>' +
          'Escribinos por WhatsApp y te brindamos toda la información.') +
        botonWhatsapp('Consultar valor e inscripción');
    }
  },

  /* --------------------------------------------------------------------------
     EMAIL 2 — Sale el JUEVES 17 DE SEPTIEMBRE a las 10:30, a todos los
     contactos cargados hasta ese momento.
     Para cambiar la fecha, editá 'fechaFija' con el formato AAAA-MM-DD HH:mm
     -------------------------------------------------------------------------- */
  {
    id: 'e2_ultimos_cupos',
    etiqueta: 'Últimos cupos',
    fechaFija: '2026-09-17 10:30',
    asunto: '🚨 Últimos cupos | Google Sheets Integral',
    cuerpo: function (lead) {
      return '' +
        saludo('Hola 👋🏻') +
        p('Estamos en los <b>últimos cupos</b> para sumarte a ' +
          '<b>Google Sheets Integral</b>.') +
        p('Una capacitación pensada para que puedas gestionar, analizar y automatizar ' +
          'información con mayor precisión y en menos tiempo, trabajando sobre:') +
        listaEmoji('📌', [
          'Fórmulas y funciones avanzadas aplicadas al trabajo diario',
          'Tablas dinámicas, filtros y validaciones de datos',
          'QUERY: consultas sobre tus propios datos',
          'Gráficos y reportes que se actualizan solos',
          'IMPORTRANGE y consolidación entre planillas',
          'Macros y Apps Script para automatizar tareas repetitivas',
          'Integraciones con Google Forms, Gmail, Drive y Calendar',
          'Inteligencia Artificial aplicada a la planilla'
        ]) +
        p('El objetivo es que uses <b>Google Sheets, la automatización y la Inteligencia ' +
          'Artificial</b> como recursos reales de trabajo, no como temas sueltos.') +
        tablaHorarios() +
        p('💬 <b>¿Querés conocer el valor y las formas de inscripción?</b> Escribinos por WhatsApp.') +
        botonWhatsapp('Quiero uno de los últimos cupos');
    }
  },

  /* --------------------------------------------------------------------------
     EMAIL 3 — Sale el MARTES 22 DE SEPTIEMBRE, día de inicio de la cursada.
     Está puesto a las 09:00 para que llegue a la mañana. Si lo querés más cerca
     del horario de cursada, cambiá la hora acá (por ejemplo '2026-09-22 17:00').
     -------------------------------------------------------------------------- */
  {
    id: 'e3_hoy_iniciamos',
    etiqueta: 'Hoy iniciamos',
    fechaFija: '2026-09-22 09:00',
    asunto: '🚀 Hoy iniciamos | Google Sheets Integral',
    cuerpo: function (lead) {
      return '' +
        saludo('Hola 👋🏻') +
        p('<b>Hoy comienza Google Sheets Integral.</b> 🎓') +
        p('Llegó el momento de incorporar herramientas concretas para organizar tus datos, ' +
          'analizarlos con criterio y automatizar todo lo que hoy hacés a mano.') +
        destacado('Google Sheets aplicado al trabajo',
          'Fórmulas avanzadas · Tablas dinámicas · QUERY · Filtros · Gráficos · Análisis de datos') +
        destacado('Automatización e Inteligencia Artificial',
          'Automatización · Apps Script · IA · Integraciones · Procesos · Productividad') +
        tablaHorarios() +
        p('✨ <b>Te esperamos para comenzar esta nueva experiencia de aprendizaje.</b>') +
        p('💬 Si todavía querés sumarte, escribinos por WhatsApp y reservá tu lugar.') +
        botonWhatsapp('Reservar mi lugar');
    }
  }

];

/* ============================================================================
   3) ESTRUCTURA DE LA PLANILLA — no hace falta tocar nada de acá para abajo
   ============================================================================ */
var HOJAS = {
  LEADS: 'Leads',
  CLICS: 'Clics WhatsApp',
  LOG: 'Log Emails',
  PANEL: 'Panel'
};

var COLUMNAS_LEADS = [
  'ID', 'Fecha alta', 'Nombre', 'Email', 'Teléfono',
  'Perfil profesional', 'Nivel en Google Sheets', 'País', 'Consulta', 'Consentimiento',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'Referrer', 'Página', 'Dispositivo',
  'Estado', 'Emails enviados', 'Último email', 'Fecha último email',
  'Clics WhatsApp', 'Última actividad', 'Notas'
];

// Índices (1 = columna A).
// ⚠️ Si agregás o sacás columnas de COLUMNAS_LEADS, actualizá estos números Y
//    las letras de columna que usa crearPanel_() más abajo.
var C = {
  ID: 1, FECHA: 2, NOMBRE: 3, EMAIL: 4, TELEFONO: 5,
  PERFIL: 6, NIVEL: 7, PAIS: 8, CONSULTA: 9, CONSENTIMIENTO: 10,
  UTM_SOURCE: 11, UTM_MEDIUM: 12, UTM_CAMPAIGN: 13, UTM_CONTENT: 14, UTM_TERM: 15,
  REFERRER: 16, PAGINA: 17, DISPOSITIVO: 18,
  ESTADO: 19, ENVIADOS: 20, ULTIMO_EMAIL: 21, FECHA_ULTIMO: 22,
  CLICS: 23, ULTIMA_ACT: 24, NOTAS: 25
};

var COLUMNAS_CLICS = [
  'Fecha', 'Botón', 'Nombre', 'Email', 'Dispositivo',
  'utm_source', 'utm_medium', 'utm_campaign', 'Página', 'Referrer', 'ID Lead'
];

var COLUMNAS_LOG = ['Fecha', 'Email destino', 'Nombre', 'Paso', 'Asunto', 'Estado', 'Detalle'];


/* ============================================================================
   4) INSTALACIÓN AUTOMÁTICA — ejecutá  configurarTodo()  una sola vez
   ============================================================================ */
function configurarTodo() {
  crearHojas_();
  crearPanel_();
  instalarDisparadores_();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Planilla lista. Ahora implementá la app web y pegá la URL en index.html', 'Configuración completa', 10);
  Logger.log('✅ Configuración completa.');
  Logger.log('   Hojas creadas: ' + Object.keys(HOJAS).map(function (k) { return HOJAS[k]; }).join(', '));
  Logger.log('   Disparador horario instalado para procesarSecuencia().');
  Logger.log('   Siguiente paso: Implementar → Nueva implementación → Aplicación web.');
}

function crearHojas_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  prepararHoja_(ss, HOJAS.LEADS, COLUMNAS_LEADS);
  prepararHoja_(ss, HOJAS.CLICS, COLUMNAS_CLICS);
  prepararHoja_(ss, HOJAS.LOG, COLUMNAS_LOG);

  // Anchos cómodos en Leads
  var leads = ss.getSheetByName(HOJAS.LEADS);
  leads.setColumnWidth(C.ID, 140);
  leads.setColumnWidth(C.FECHA, 145);
  leads.setColumnWidth(C.NOMBRE, 190);
  leads.setColumnWidth(C.EMAIL, 220);
  leads.setColumnWidth(C.TELEFONO, 150);
  leads.setColumnWidth(C.PERFIL, 260);
  leads.setColumnWidth(C.NIVEL, 240);
  leads.setColumnWidth(C.CONSULTA, 280);
  leads.setColumnWidth(C.ENVIADOS, 240);
}

function prepararHoja_(ss, nombre, encabezados) {
  var sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);

  sh.getRange(1, 1, 1, encabezados.length)
    .setValues([encabezados])
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground(CONFIG.COLOR_MORADO)
    .setVerticalAlignment('middle');

  sh.setFrozenRows(1);
  sh.setRowHeight(1, 34);
  return sh;
}

function instalarDisparadores_() {
  // Borra disparadores previos de este proyecto para no duplicarlos
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'procesarSecuencia') ScriptApp.deleteTrigger(t);
  });

  // Cada 15 minutos: así un email programado para las 09:00 sale a las 09:00-09:15
  // y no en cualquier momento de esa hora.
  ScriptApp.newTrigger('procesarSecuencia')
    .timeBased()
    .everyMinutes(15)
    .create();
}

/** Menú propio dentro de la planilla */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Sheets + IA')
    .addItem('1. Configurar todo (primera vez)', 'configurarTodo')
    .addItem('2. Procesar secuencia ahora', 'procesarSecuencia')
    .addSeparator()
    .addItem('✅ Verificar configuración activa', 'verificarConfiguracion')
    .addItem('Ver programación de la secuencia', 'verProgramacionDeEnvios')
    .addItem('🔍 Simular envíos en una fecha (no envía)', 'simularEnviosEnUnaFecha')
    .addItem('Enviar email 1 de prueba (a mí)', 'enviarEmailDePrueba')
    .addItem('Enviar LOS 3 emails de prueba (a mí)', 'enviarTodosLosEmailsDePrueba')
    .addItem('Simular un lead de prueba', 'simularLeadDePrueba')
    .addItem('Ver cuota de emails disponible', 'verCuotaEmails')
    .addSeparator()
    .addItem('🩺 Diagnosticar por qué no llegan los emails', 'diagnosticarEnvios')
    .addSeparator()
    .addItem('🚀 Preparar para producción (borra las pruebas)', 'prepararParaProduccion')
    .addToUi();
}


/* ============================================================================
   5) ENDPOINTS WEB (lo que llama la landing)
   ============================================================================ */

/** Recibe los datos de la landing (formulario y clics de WhatsApp). */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return jsonRespuesta_({ ok: false, error: 'Servidor ocupado, reintentá.' });
  }

  try {
    var datos = leerPayload_(e);
    var accion = (datos.action || 'lead').toString();

    if (accion === 'whatsapp_click') return jsonRespuesta_(registrarClicWhatsapp_(datos));
    if (accion === 'ping') return jsonRespuesta_({ ok: true, mensaje: 'Conexión OK' });
    return jsonRespuesta_(registrarLead_(datos));

  } catch (err) {
    registrarLog_('', '', 'ERROR', 'doPost', 'ERROR', err.message);
    return jsonRespuesta_({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET de control.
 *   .../exec              → estado del servicio
 *   .../exec?action=wa    → registra el clic y redirige a WhatsApp (alternativa
 *                           por si querés usar un link directo en vez de JS)
 */
function doGet(e) {
  var p = (e && e.parameter) || {};

  if (p.action === 'wa') {
    try {
      registrarClicWhatsapp_({
        boton: p.boton || 'link-directo',
        email: p.email || '',
        nombre: p.nombre || '',
        utm_source: p.utm_source || '',
        utm_campaign: p.utm_campaign || '',
        pagina: p.pagina || '',
        dispositivo: p.dispositivo || ''
      });
    } catch (err) { /* nunca bloqueamos la redirección */ }

    var destino = linkWhatsapp_();

    return HtmlService.createHtmlOutput(
      '<script>window.top.location.href=' + JSON.stringify(destino) + ';</' + 'script>' +
      '<p style="font-family:sans-serif">Redirigiendo a WhatsApp… ' +
      '<a href="' + destino + '">Tocá acá si no pasa nada</a>.</p>'
    );
  }

  return jsonRespuesta_({
    ok: true,
    servicio: CONFIG.CURSO_NOMBRE,
    estado: 'activo',
    pasos_secuencia: SECUENCIA_EMAILS.length
  });
}

function leerPayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // Por si llegara como formulario clásico
      return (e.parameter || {});
    }
  }
  return (e && e.parameter) || {};
}

function jsonRespuesta_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ============================================================================
   6) ALTA DE CONTACTOS
   ============================================================================ */
function registrarLead_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJAS.LEADS) || prepararHoja_(ss, HOJAS.LEADS, COLUMNAS_LEADS);

  var email = limpiar_(d.email).toLowerCase();
  var nombre = limpiar_(d.nombre);

  if (!email || email.indexOf('@') === -1) return { ok: false, error: 'Email inválido' };
  if (!nombre) return { ok: false, error: 'Falta el nombre' };

  var ahora = new Date();

  // ¿Ya existe este contacto?
  var filaExistente = CONFIG.EVITAR_DUPLICADOS ? buscarFilaPorEmail_(sh, email) : 0;

  if (filaExistente) {
    sh.getRange(filaExistente, C.ULTIMA_ACT).setValue(ahora);
    var notas = sh.getRange(filaExistente, C.NOTAS).getValue();
    sh.getRange(filaExistente, C.NOTAS).setValue(
      (notas ? notas + ' | ' : '') + 'Volvió a completar el formulario el ' + formatearFecha_(ahora)
    );
    if (limpiar_(d.mensaje)) {
      var consulta = sh.getRange(filaExistente, C.CONSULTA).getValue();
      sh.getRange(filaExistente, C.CONSULTA).setValue((consulta ? consulta + ' || ' : '') + limpiar_(d.mensaje));
    }

    notificarAdmin_(nombre, email, d, true);
    return { ok: true, duplicado: true, mensaje: 'Contacto ya registrado, se actualizó la ficha.' };
  }

  var id = 'SHEETS-' + Utilities.formatDate(ahora, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');

  var fila = [];
  fila[C.ID - 1] = id;
  fila[C.FECHA - 1] = ahora;
  fila[C.NOMBRE - 1] = nombre;
  fila[C.EMAIL - 1] = email;
  fila[C.TELEFONO - 1] = limpiar_(d.telefono);
  fila[C.PERFIL - 1] = limpiar_(d.perfil);
  fila[C.NIVEL - 1] = limpiar_(d.nivel);
  fila[C.PAIS - 1] = limpiar_(d.pais);
  fila[C.CONSULTA - 1] = limpiar_(d.mensaje);
  fila[C.CONSENTIMIENTO - 1] = limpiar_(d.consentimiento) || 'SI';
  fila[C.UTM_SOURCE - 1] = limpiar_(d.utm_source);
  fila[C.UTM_MEDIUM - 1] = limpiar_(d.utm_medium);
  fila[C.UTM_CAMPAIGN - 1] = limpiar_(d.utm_campaign);
  fila[C.UTM_CONTENT - 1] = limpiar_(d.utm_content);
  fila[C.UTM_TERM - 1] = limpiar_(d.utm_term);
  fila[C.REFERRER - 1] = limpiar_(d.referrer);
  fila[C.PAGINA - 1] = limpiar_(d.pagina);
  fila[C.DISPOSITIVO - 1] = limpiar_(d.dispositivo);
  fila[C.ESTADO - 1] = 'NUEVO';
  fila[C.ENVIADOS - 1] = '';
  fila[C.ULTIMO_EMAIL - 1] = '';
  fila[C.FECHA_ULTIMO - 1] = '';
  fila[C.CLICS - 1] = 0;
  fila[C.ULTIMA_ACT - 1] = ahora;
  fila[C.NOTAS - 1] = '';

  for (var i = 0; i < COLUMNAS_LEADS.length; i++) if (fila[i] === undefined) fila[i] = '';

  sh.appendRow(fila);
  var nuevaFila = sh.getLastRow();
  sh.getRange(nuevaFila, C.FECHA).setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange(nuevaFila, C.ULTIMA_ACT).setNumberFormat('dd/MM/yyyy HH:mm');

  // 1) Aviso interno
  notificarAdmin_(nombre, email, d, false);

  // 2) Email inmediato al contacto (pasos con esperaHoras = 0).
  //    Si el paso tiene 'noAntesDe' y esa fecha todavía no llegó, no se manda acá:
  //    queda pendiente y lo despacha el disparador cuando corresponda.
  if (CONFIG.SECUENCIA_ACTIVA) {
    var lead = leerLead_(sh, nuevaFila);
    SECUENCIA_EMAILS.forEach(function (paso) {
      if (Number(paso.esperaHoras) !== 0) return;
      var momento = momentoDeEnvio_(paso, ahora);
      if (momento && momento.getTime() > new Date().getTime()) return;
      enviarPaso_(sh, nuevaFila, lead, paso);
    });
  }

  return { ok: true, id: id, mensaje: 'Contacto registrado' };
}

function buscarFilaPorEmail_(sh, email) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return 0;
  var valores = sh.getRange(2, C.EMAIL, ultima - 1, 1).getValues();
  for (var i = 0; i < valores.length; i++) {
    if (String(valores[i][0]).trim().toLowerCase() === email) return i + 2;
  }
  return 0;
}

function leerLead_(sh, fila) {
  var v = sh.getRange(fila, 1, 1, COLUMNAS_LEADS.length).getValues()[0];
  return {
    fila: fila,
    id: v[C.ID - 1],
    fecha: v[C.FECHA - 1],
    nombre: v[C.NOMBRE - 1],
    primerNombre: String(v[C.NOMBRE - 1] || '').split(' ')[0],
    email: v[C.EMAIL - 1],
    telefono: v[C.TELEFONO - 1],
    perfil: v[C.PERFIL - 1],
    pais: v[C.PAIS - 1],
    enviados: String(v[C.ENVIADOS - 1] || ''),
    estado: v[C.ESTADO - 1]
  };
}


/* ============================================================================
   7) CLICS EN WHATSAPP (métrica de alcance)
   ============================================================================ */
function registrarClicWhatsapp_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJAS.CLICS) || prepararHoja_(ss, HOJAS.CLICS, COLUMNAS_CLICS);

  var ahora = new Date();
  var email = limpiar_(d.email).toLowerCase();
  var idLead = '';

  // Si conocemos el email, sumamos el clic a la ficha del contacto
  if (email) {
    var leadsSh = ss.getSheetByName(HOJAS.LEADS);
    if (leadsSh) {
      var fila = buscarFilaPorEmail_(leadsSh, email);
      if (fila) {
        idLead = leadsSh.getRange(fila, C.ID).getValue();
        var clics = Number(leadsSh.getRange(fila, C.CLICS).getValue()) || 0;
        leadsSh.getRange(fila, C.CLICS).setValue(clics + 1);
        leadsSh.getRange(fila, C.ULTIMA_ACT).setValue(ahora);
        if (leadsSh.getRange(fila, C.ESTADO).getValue() === 'NUEVO') {
          leadsSh.getRange(fila, C.ESTADO).setValue('CONTACTÓ POR WHATSAPP');
        }
      }
    }
  }

  sh.appendRow([
    ahora,
    limpiar_(d.boton) || 'sin-identificar',
    limpiar_(d.nombre),
    email,
    limpiar_(d.dispositivo),
    limpiar_(d.utm_source),
    limpiar_(d.utm_medium),
    limpiar_(d.utm_campaign),
    limpiar_(d.pagina),
    limpiar_(d.referrer),
    idLead
  ]);
  sh.getRange(sh.getLastRow(), 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');

  if (CONFIG.NOTIFICAR_CLICS_WHATSAPP) {
    enviarMailSeguro_(
      CONFIG.EMAIL_NOTIFICACION,
      '👋 Clic en WhatsApp desde la landing',
      'Botón: ' + (d.boton || 's/d') + '\n' +
      'Contacto: ' + (d.nombre || 'anónimo') + ' ' + (email ? '(' + email + ')' : '') + '\n' +
      'Dispositivo: ' + (d.dispositivo || 's/d') + '\n' +
      'Fecha: ' + formatearFecha_(ahora)
    );
  }

  return { ok: true, registrado: true };
}


/* ============================================================================
   8) SECUENCIA AUTOMÁTICA (la ejecuta el disparador cada 15 minutos)
   ============================================================================ */
function procesarSecuencia() {
  if (!CONFIG.SECUENCIA_ACTIVA) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJAS.LEADS);
  if (!sh || sh.getLastRow() < 2) return;

  var cuota = MailApp.getRemainingDailyQuota();
  if (cuota < 5) {
    registrarLog_('', '', 'SISTEMA', 'Cuota', 'PAUSADO', 'Quedan ' + cuota + ' emails de cuota diaria.');
    return;
  }

  var ahora = new Date();
  var arranque = ahora.getTime();
  var total = sh.getLastRow() - 1;
  var enviadosEnEstaCorrida = 0;

  for (var fila = 2; fila <= total + 1; fila++) {
    // Cortes de seguridad: cuota diaria de Gmail y límite de 6 min por ejecución
    if (enviadosEnEstaCorrida >= cuota - 3) break;
    if (new Date().getTime() - arranque > 4.5 * 60 * 1000) {
      Logger.log('Corte por tiempo de ejecución. El resto sale en la próxima corrida.');
      break;
    }

    var lead = leerLead_(sh, fila);
    if (!lead.email) continue;
    if (String(lead.estado).toUpperCase() === 'BAJA') continue;
    if (String(lead.estado).toUpperCase() === 'SECUENCIA FINALIZADA') continue;

    var fechaAlta = new Date(lead.fecha);

    // Se envía como máximo un paso por contacto en cada corrida.
    // Los pasos "omitidos" no cuentan: se marcan y se sigue evaluando.
    var enviadosTexto = lead.enviados;
    for (var vuelta = 0; vuelta < 20; vuelta++) {
      var decision = decidirProximoPaso_(fechaAlta, enviadosTexto, ahora);

      if (decision.accion === 'omitir') {
        marcarPaso_(sh, fila, decision.paso.id + ':omitido');
        enviadosTexto = String(sh.getRange(fila, C.ENVIADOS).getValue() || '');
        registrarLog_(lead.email, lead.nombre, decision.paso.etiqueta, decision.paso.asunto, 'OMITIDO',
          'Se registró después del ' + formatearFecha_(decision.momento));
        continue;
      }

      if (decision.accion === 'enviar') {
        enviarPaso_(sh, fila, lead, decision.paso);
        enviadosEnEstaCorrida++;
      }
      break;   // 'enviar', 'esperar' o 'completo' cierran el ciclo de este contacto
    }

    // ¿Ya pasó por todos los pasos (enviados u omitidos)?
    var actualizados = idsProcesados_(sh.getRange(fila, C.ENVIADOS).getValue());
    var faltan = SECUENCIA_EMAILS.filter(function (pa) { return actualizados.indexOf(pa.id) === -1; });
    if (faltan.length === 0 && String(lead.estado).toUpperCase() !== 'SECUENCIA FINALIZADA') {
      sh.getRange(fila, C.ESTADO).setValue('SECUENCIA FINALIZADA');
    }
  }

  if (enviadosEnEstaCorrida > 0) {
    Logger.log('Secuencia: ' + enviadosEnEstaCorrida + ' email(s) enviado(s).');
  }
}

/**
 * Decide qué corresponde hacer con un contacto en un momento dado.
 * Es el cerebro de la secuencia: lo usan tanto el envío real como la simulación,
 * así que lo que muestra la simulación es exactamente lo que va a pasar.
 *
 * Devuelve { accion, paso, momento } donde accion es:
 *   'enviar'   → le toca este email ahora
 *   'omitir'   → fecha fija que ya pasó antes de que se registrara
 *   'esperar'  → el próximo email es más adelante
 *   'completo' → ya pasó por todos los pasos
 */
function decidirProximoPaso_(fechaAlta, enviadosTexto, ahora) {
  var procesados = idsProcesados_(enviadosTexto);

  for (var i = 0; i < SECUENCIA_EMAILS.length; i++) {
    var paso = SECUENCIA_EMAILS[i];
    if (procesados.indexOf(paso.id) !== -1) continue;

    var momento = momentoDeEnvio_(paso, fechaAlta);
    if (!momento) continue;                                   // paso mal configurado

    if (ahora.getTime() < momento.getTime() - 60000) {
      return { accion: 'esperar', paso: paso, momento: momento };
    }
    if (paso.fechaFija && fechaAlta.getTime() > momento.getTime()) {
      return { accion: 'omitir', paso: paso, momento: momento };
    }
    return { accion: 'enviar', paso: paso, momento: momento };
  }

  return { accion: 'completo', paso: null, momento: null };
}

/**
 * Devuelve cuándo corresponde enviar un paso para un contacto dado.
 *   · Si el paso tiene fechaFija  → esa fecha del calendario.
 *   · Si tiene esperaHoras        → alta del contacto + esas horas.
 */
function momentoDeEnvio_(paso, fechaAlta) {
  var momento;

  if (paso.fechaFija) {
    momento = parsearFecha_(paso.fechaFija);
  } else if (paso.esperaHoras !== undefined && paso.esperaHoras !== null) {
    momento = new Date(fechaAlta.getTime() + Number(paso.esperaHoras) * 3600000);
  } else {
    return null;
  }
  if (!momento) return null;

  // 'noAntesDe' actúa como piso: nunca se envía antes de esa fecha,
  // aunque a la persona le correspondiera antes.
  if (paso.noAntesDe) {
    var piso = parsearFecha_(paso.noAntesDe);
    if (piso && momento.getTime() < piso.getTime()) momento = piso;
  }

  return momento;
}

/** 'AAAA-MM-DD HH:mm' → objeto Date en la zona horaria del proyecto. */
function parsearFecha_(txt) {
  var m = String(txt).match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) {
    Logger.log('Fecha mal escrita en la secuencia: "' + txt + '". Usá AAAA-MM-DD HH:mm');
    return null;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0), 0, 0);
}

/**
 * Lee la columna "Emails enviados" y devuelve solo los id, sin el sufijo.
 * Ej: 'e1_informacion, e2_ultimos_cupos:omitido' → ['e1_informacion','e2_ultimos_cupos']
 */
function idsProcesados_(texto) {
  if (!texto) return [];
  return String(texto).split(',').map(function (s) { return s.trim().split(':')[0]; })
    .filter(function (s) { return s !== ''; });
}

/** Agrega una marca a la columna "Emails enviados" sin pisar lo anterior. */
function marcarPaso_(sh, fila, marca) {
  var previos = String(sh.getRange(fila, C.ENVIADOS).getValue() || '');
  var lista = previos ? previos.split(',').map(function (s) { return s.trim(); }) : [];
  if (lista.indexOf(marca) === -1) lista.push(marca);
  sh.getRange(fila, C.ENVIADOS).setValue(lista.join(', '));
}

/** Envía un paso puntual y deja constancia en la planilla y en el log. */
function enviarPaso_(sh, fila, lead, paso) {
  var asunto = String(paso.asunto)
    .replace(/{{nombre}}/g, lead.primerNombre || lead.nombre)
    .replace(/{{nombre_completo}}/g, lead.nombre);

  var cuerpoHtml = plantillaEmail_(
    typeof paso.cuerpo === 'function' ? paso.cuerpo(lead) : String(paso.cuerpo),
    lead
  );

  var enviado = enviarMailSeguro_(lead.email, asunto, null, cuerpoHtml);

  if (enviado) {
    var ahora = new Date();
    marcarPaso_(sh, fila, paso.id);
    sh.getRange(fila, C.ULTIMO_EMAIL).setValue(paso.etiqueta);
    sh.getRange(fila, C.FECHA_ULTIMO).setValue(ahora).setNumberFormat('dd/MM/yyyy HH:mm');
    if (String(sh.getRange(fila, C.ESTADO).getValue()) === 'NUEVO') {
      sh.getRange(fila, C.ESTADO).setValue('EN SECUENCIA');
    }
    registrarLog_(lead.email, lead.nombre, paso.etiqueta, asunto, 'ENVIADO', '');
  } else {
    registrarLog_(lead.email, lead.nombre, paso.etiqueta, asunto, 'ERROR', 'No se pudo enviar');
  }

  return enviado;
}

function enviarMailSeguro_(destino, asunto, textoPlano, html) {
  try {
    var opciones = {
      name: CONFIG.NOMBRE_REMITENTE,
      replyTo: CONFIG.EMAIL_RESPUESTA
    };
    if (html) {
      opciones.htmlBody = html;
      MailApp.sendEmail(destino, asunto, textoPlano || quitarHtml_(html), opciones);
    } else {
      MailApp.sendEmail(destino, asunto, textoPlano || '', opciones);
    }
    return true;
  } catch (err) {
    Logger.log('Error enviando a ' + destino + ': ' + err.message);
    return false;
  }
}

function registrarLog_(email, nombre, paso, asunto, estado, detalle) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(HOJAS.LOG) || prepararHoja_(ss, HOJAS.LOG, COLUMNAS_LOG);
    sh.appendRow([new Date(), email, nombre, paso, asunto, estado, detalle || '']);
    sh.getRange(sh.getLastRow(), 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  } catch (err) { /* el log nunca debe romper el flujo */ }
}


/* ============================================================================
   9) AVISO INTERNO DE LEAD NUEVO
   ============================================================================ */
function notificarAdmin_(nombre, email, d, esDuplicado) {
  var titulo = esDuplicado
    ? '🔁 Contacto repetido: ' + nombre
    : '🔔 Nuevo contacto: ' + nombre;

  var telefonoLimpio = String(d.telefono || '').replace(/\D/g, '');
  var linkWa = telefonoLimpio ? 'https://wa.me/' + telefonoLimpio : '';

  var filas = [
    ['Nombre', nombre],
    ['Email', '<a href="mailto:' + email + '">' + email + '</a>'],
    ['Teléfono', linkWa ? '<a href="' + linkWa + '">' + (d.telefono || '') + '</a>' : (d.telefono || '—')],
    ['Perfil', d.perfil || '—'],
    ['Nivel', d.nivel || '—'],
    ['País', d.pais || '—'],
    ['Consulta', d.mensaje || '—'],
    ['Campaña', [d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(' / ') || 'directo'],
    ['Dispositivo', d.dispositivo || '—'],
    ['Fecha', formatearFecha_(new Date())]
  ];

  var tabla = filas.map(function (f) {
    return '<tr>' +
      '<td style="padding:9px 14px;border-bottom:1px solid #eee;color:#7c6b85;font-size:13px;white-space:nowrap">' + f[0] + '</td>' +
      '<td style="padding:9px 14px;border-bottom:1px solid #eee;color:' + CONFIG.COLOR_MORADO + ';font-size:14px;font-weight:600">' + f[1] + '</td>' +
      '</tr>';
  }).join('');

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto">' +
      '<div style="background:' + CONFIG.COLOR_MORADO + ';color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">' +
        '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:' + CONFIG.COLOR_DORADO + ';font-weight:bold">' + CONFIG.CURSO_NOMBRE + '</div>' +
        '<div style="font-size:20px;font-weight:bold;margin-top:6px">' + titulo + '</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8dfec;border-top:0">' + tabla + '</table>' +
      (linkWa
        ? '<div style="text-align:center;padding:20px 0">' +
            '<a href="' + linkWa + '" style="background:' + CONFIG.COLOR_DORADO + ';color:' + CONFIG.COLOR_MORADO + ';text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:bold;display:inline-block">Responder por WhatsApp</a>' +
          '</div>'
        : '') +
      '<p style="color:#9a8aa3;font-size:12px;text-align:center;padding:8px 0">Registrado automáticamente en tu planilla de Google Sheets.</p>' +
    '</div>';

  String(CONFIG.EMAIL_NOTIFICACION).split(',').forEach(function (dest) {
    dest = dest.trim();
    if (dest) enviarMailSeguro_(dest, titulo, null, html);
  });
}


/* ============================================================================
   10) PLANTILLA HTML DE LOS EMAILS AL CONTACTO
   ============================================================================ */
function plantillaEmail_(contenido, lead) {
  return '' +
'<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
'<body style="margin:0;padding:0;background:' + CONFIG.COLOR_FONDO + ';">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + CONFIG.COLOR_FONDO + ';padding:28px 12px">' +
'<tr><td align="center">' +
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(20,0,28,.10)">' +

    // Encabezado: si cargaste una pieza gráfica en CONFIG.IMAGEN_ENCABEZADO va la
    // imagen a todo el ancho; si la dejaste vacía, va una cabecera de texto.
    (CONFIG.IMAGEN_ENCABEZADO
      ? '<tr><td style="background:' + CONFIG.COLOR_TINTA + ';font-size:0;line-height:0">' +
          '<a href="' + CONFIG.URL_LANDING + '" style="text-decoration:none">' +
            '<img src="' + CONFIG.IMAGEN_ENCABEZADO + '" alt="' + CONFIG.CURSO_NOMBRE + '" ' +
              'width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0">' +
          '</a>' +
        '</td></tr>'
      : '<tr><td style="background:' + CONFIG.COLOR_TINTA + ';padding:34px 32px;text-align:center;' +
          'font-family:Arial,Helvetica,sans-serif">' +
          '<div style="color:' + CONFIG.COLOR_DORADO + ';font-size:11px;letter-spacing:.2em;' +
            'text-transform:uppercase;font-weight:bold;margin-bottom:10px">Escencial Consultora</div>' +
          '<div style="color:#ffffff;font-size:25px;line-height:1.25;font-weight:bold">' +
            CONFIG.CURSO_NOMBRE +
          '</div>' +
        '</td></tr>') +

    // Franja de modalidad
    '<tr><td style="background:' + CONFIG.COLOR_MORADO + ';padding:14px 32px;text-align:center;' +
      'border-top:1px solid rgba(255,255,255,.12)">' +
      '<div style="color:' + CONFIG.COLOR_DORADO + ';font-family:Arial,Helvetica,sans-serif;font-size:11px;' +
        'letter-spacing:.18em;text-transform:uppercase;font-weight:bold">' +
        CONFIG.CURSO_MODALIDAD + ' · Inicia ' + CONFIG.CURSO_INICIO +
      '</div>' +
    '</td></tr>' +

    // Contenido
    '<tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#55465e;font-size:15.5px;line-height:1.65">' +
      contenido +
    '</td></tr>' +

    // Datos clave
    '<tr><td style="padding:0 32px 28px">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + CONFIG.COLOR_FONDO + ';border-radius:12px">' +
        '<tr>' +
          celdaDato_('Online', 'MODALIDAD') +
          celdaDato_(String(CONFIG.CURSO_MODULOS), 'MÓDULOS') +
          celdaDato_('Sheets + IA', 'HERRAMIENTAS') +
        '</tr>' +
      '</table>' +
    '</td></tr>' +

    // Pie
    '<tr><td style="background:' + CONFIG.COLOR_TINTA + ';padding:24px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif">' +
      '<div style="color:#ffffff;font-size:15px;font-weight:bold;margin-bottom:6px">' + CONFIG.FIRMA_EQUIPO + '</div>' +
      '<div style="color:rgba(255,255,255,.6);font-size:12.5px;line-height:1.6;margin-bottom:16px">' +
        CONFIG.DESCRIPCION_FIRMA +
      '</div>' +
      '<div style="margin-bottom:14px">' +
        '<a href="' + CONFIG.URL_LANDING + '" ' +
          'style="display:inline-block;color:#ffffff;text-decoration:none;font-size:13.5px;font-weight:bold;' +
          'border:1.5px solid ' + CONFIG.COLOR_DORADO + ';border-radius:999px;padding:10px 22px">' +
          'Ver el curso en la web' +
        '</a>' +
      '</div>' +
      '<div style="color:rgba(255,255,255,.55);font-size:12px;word-break:break-all">' +
        '<a href="' + CONFIG.URL_LANDING + '" style="color:' + CONFIG.COLOR_DORADO + ';text-decoration:underline">' +
          CONFIG.TEXTO_LINK_PIE +
        '</a>' +
      '</div>' +
      '<div style="color:rgba(255,255,255,.35);font-size:11px;margin-top:14px">' +
        'Recibís este email porque dejaste tus datos en nuestra web. ' +
        'Si no querés recibir más información, respondé este mensaje con la palabra BAJA.' +
      '</div>' +
    '</td></tr>' +

  '</table>' +
'</td></tr></table></body></html>';
}

function celdaDato_(numero, etiqueta) {
  return '<td align="center" style="padding:18px 8px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="color:' + CONFIG.COLOR_MORADO + ';font-size:17px;font-weight:bold;line-height:1.25">' + numero + '</div>' +
    '<div style="color:' + CONFIG.COLOR_ACENTO + ';font-size:10.5px;letter-spacing:.12em;font-weight:bold;margin-top:4px">' + etiqueta + '</div>' +
  '</td>';
}

/* --- Helpers para escribir el cuerpo de los emails de forma simple --- */
function p(texto) {
  return '<p style="margin:0 0 16px;color:#55465e;font-size:15.5px;line-height:1.65">' + texto + '</p>';
}

/** Saludo destacado del inicio del email. */
function saludo(texto) {
  return '<p style="margin:0 0 16px;color:' + CONFIG.COLOR_MORADO + ';font-size:19px;font-weight:bold;' +
    'font-family:Arial,Helvetica,sans-serif">' + texto + '</p>';
}

/** Lista con el emoji que elijas al inicio de cada renglón. */
function listaEmoji(emoji, items) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">' +
    items.map(function (t) {
      return '<tr>' +
        '<td valign="top" style="padding:6px 10px 6px 0;font-size:15px;line-height:1.5">' + emoji + '</td>' +
        '<td style="padding:6px 0;color:#55465e;font-size:15.5px;line-height:1.5;' +
          'font-family:Arial,Helvetica,sans-serif">' + t + '</td>' +
        '</tr>';
    }).join('') +
    '</table>';
}

/** Ficha de datos tipo "💻 Modalidad: Online". Recibe [[emoji, título, valor], ...] */
function fichaDatos(filas) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px">' +
    '<tr><td style="background:' + CONFIG.COLOR_FONDO + ';border-left:4px solid ' + CONFIG.COLOR_ACENTO + ';' +
      'border-radius:10px;padding:18px 20px;font-family:Arial,Helvetica,sans-serif">' +
      filas.map(function (f, i) {
        return '<div style="' + (i ? 'margin-top:10px;' : '') + 'font-size:15.5px;color:#55465e;line-height:1.5">' +
          f[0] + ' <b style="color:' + CONFIG.COLOR_MORADO + '">' + f[1] + ':</b> ' + f[2] +
        '</div>';
      }).join('') +
    '</td></tr></table>';
}

/**
 * Tabla con el horario de cursada país por país.
 * Se arma sola desde CONFIG.HORARIOS_POR_PAIS: si cambia un huso, se edita ahí
 * una sola vez y se actualiza en los tres emails.
 */
function tablaHorarios() {
  // Mientras CONFIG.HORARIOS_POR_PAIS esté vacío (horario todavía sin definir),
  // el bloque directamente no aparece en el email en vez de salir como un
  // recuadro vacío. Al cargar los horarios, se muestra solo.
  if (!CONFIG.HORARIOS_POR_PAIS || !CONFIG.HORARIOS_POR_PAIS.length) return '';

  var filas = CONFIG.HORARIOS_POR_PAIS.map(function (f, i) {
    var borde = i ? 'border-top:1px solid rgba(125,78,148,.18);' : '';
    return '<tr>' +
      '<td style="' + borde + 'padding:9px 4px;color:#55465e;font-size:14.5px;font-family:Arial,Helvetica,sans-serif">' + f[0] + '</td>' +
      '<td align="right" style="' + borde + 'padding:9px 4px;color:' + CONFIG.COLOR_MORADO + ';font-size:14.5px;font-weight:bold;white-space:nowrap;font-family:Arial,Helvetica,sans-serif">' + f[1] + '</td>' +
      '</tr>';
  }).join('');

  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px">' +
    '<tr><td style="background:' + CONFIG.COLOR_FONDO + ';border-radius:10px;padding:16px 20px">' +
      '<div style="color:' + CONFIG.COLOR_ACENTO + ';font-size:11px;letter-spacing:.14em;font-weight:bold;' +
        'text-transform:uppercase;margin-bottom:8px;font-family:Arial,Helvetica,sans-serif">🕗 Horario según tu país</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + filas + '</table>' +
    '</td></tr></table>';
}

function lista(items) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">' +
    items.map(function (t) {
      return '<tr>' +
        '<td valign="top" style="padding:5px 10px 5px 0;color:' + CONFIG.COLOR_ACENTO + ';font-size:16px;font-weight:bold">✓</td>' +
        '<td style="padding:5px 0;color:#55465e;font-size:15px;line-height:1.6">' + t + '</td>' +
        '</tr>';
    }).join('') +
    '</table>';
}

function boton(texto, url) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td>' +
    '<a href="' + url + '" style="background:' + CONFIG.COLOR_DORADO + ';color:' + CONFIG.COLOR_MORADO + ';text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:bold;font-size:15px;display:inline-block;font-family:Arial,Helvetica,sans-serif">' + texto + '</a>' +
    '</td></tr></table>';
}

/** Arma el link de WhatsApp: usa el link corto si lo configuraste, si no lo genera. */
function linkWhatsapp_() {
  if (CONFIG.WHATSAPP_LINK) return CONFIG.WHATSAPP_LINK;
  return 'https://wa.me/' + CONFIG.WHATSAPP_NUMERO + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_MENSAJE);
}

function botonWhatsapp(texto) {
  var url = linkWhatsapp_();
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td>' +
    '<a href="' + url + '" style="background:#25D366;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:bold;font-size:15px;display:inline-block;font-family:Arial,Helvetica,sans-serif">💬 ' + texto + '</a>' +
    '</td></tr></table>';
}

function destacado(titulo, texto) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px">' +
    '<tr><td style="background:' + CONFIG.COLOR_MORADO + ';border-radius:12px;padding:20px 22px;font-family:Arial,Helvetica,sans-serif">' +
      '<div style="color:' + CONFIG.COLOR_DORADO + ';font-size:11px;letter-spacing:.14em;font-weight:bold;text-transform:uppercase;margin-bottom:6px">★ ' + titulo + '</div>' +
      '<div style="color:#ffffff;font-size:14.5px;line-height:1.6">' + texto + '</div>' +
    '</td></tr></table>';
}


/* ============================================================================
   11) PANEL DE MÉTRICAS
   ============================================================================ */
function crearPanel_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJAS.PANEL);
  if (!sh) sh = ss.insertSheet(HOJAS.PANEL, 0);
  sh.clear();

  var L = "'" + HOJAS.LEADS + "'";
  var W = "'" + HOJAS.CLICS + "'";
  var G = "'" + HOJAS.LOG + "'";

  sh.getRange('B2').setValue('PANEL DE MÉTRICAS — ' + CONFIG.CURSO_NOMBRE.toUpperCase())
    .setFontSize(16).setFontWeight('bold').setFontColor(CONFIG.COLOR_MORADO);
  sh.getRange('B3').setValue('Se actualiza solo. Última carga: ')
    .setFontColor('#7c6b85');
  sh.getRange('C3').setFormula('=TEXT(NOW(),"dd/mm/yyyy hh:mm")').setFontColor('#7c6b85');

  var kpis = [
    ['Contactos totales',       '=COUNTA(' + L + '!A2:A)'],
    ['Contactos hoy',           '=COUNTIFS(' + L + '!B2:B,">="&TODAY())'],
    ['Contactos últimos 7 días','=COUNTIFS(' + L + '!B2:B,">="&TODAY()-7)'],
    ['Clics en WhatsApp',       '=COUNTA(' + W + '!A2:A)'],
    ['Clics hoy',               '=COUNTIFS(' + W + '!A2:A,">="&TODAY())'],
    ['Emails enviados',         '=COUNTIF(' + G + '!F2:F,"ENVIADO")'],
    // W = columna "Clics WhatsApp" de la hoja Leads (C.CLICS = 23)
    ['Contactos que hicieron clic', '=COUNTIF(' + L + '!W2:W,">0")'],
    ['Tasa de clic sobre contactos','=IFERROR(COUNTIF(' + L + '!W2:W,">0")/COUNTA(' + L + '!A2:A),0)']
  ];

  var fila = 5;
  kpis.forEach(function (k, i) {
    var f = fila + i;
    sh.getRange(f, 2).setValue(k[0]).setFontColor('#55465e').setFontSize(11);
    sh.getRange(f, 3).setFormula(k[1]).setFontSize(15).setFontWeight('bold').setFontColor(CONFIG.COLOR_MORADO);
  });
  sh.getRange(fila + 7, 3).setNumberFormat('0.0%');

  sh.getRange('B15').setValue('CLICS DE WHATSAPP POR BOTÓN').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('B16').setFormula(
    '=IFERROR(QUERY(' + W + '!B2:B,"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 \'Botón\', count(Col1) \'Clics\'",0),"Sin datos todavía")'
  );

  // P = columna "Referrer" de la hoja Leads (C.REFERRER = 16)
  sh.getRange('E15').setValue('CONTACTOS POR PROCEDENCIA').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('E16').setFormula(
    '=IFERROR(QUERY(' + L + '!P2:P,"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 \'Procedencia\', count(Col1) \'Contactos\'",0),"Sin datos todavía")'
  );

  // F = "Perfil profesional" (C.PERFIL = 6)
  sh.getRange('H15').setValue('CONTACTOS POR PERFIL').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('H16').setFormula(
    '=IFERROR(QUERY(' + L + '!F2:F,"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 \'Perfil\', count(Col1) \'Contactos\'",0),"Sin datos todavía")'
  );

  // G = "Nivel en Google Sheets" (C.NIVEL = 7)
  sh.getRange('K15').setValue('CONTACTOS POR NIVEL').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('K16').setFormula(
    '=IFERROR(QUERY(' + L + '!G2:G,"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 \'Nivel\', count(Col1) \'Contactos\'",0),"Sin datos todavía")'
  );

  // H = "País" (C.PAIS = 8). Sirve para saber desde dónde llegan los contactos
  // y, cuando se defina el horario, a qué huso responde cada uno.
  sh.getRange('N15').setValue('CONTACTOS POR PAÍS').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('N16').setFormula(
    '=IFERROR(QUERY(' + L + '!H2:H,"select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc label Col1 \'País\', count(Col1) \'Contactos\'",0),"Sin datos todavía")'
  );

  sh.getRange('B30').setValue('CONTACTOS POR DÍA').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('B31').setFormula(
    '=IFERROR(QUERY(' + L + '!B2:B,"select Col1, count(Col1) where Col1 is not null group by Col1 order by Col1 desc label Col1 \'Fecha\', count(Col1) \'Contactos\' format Col1 \'dd/mm/yyyy\'",0),"Sin datos todavía")'
  );

  sh.getRange('E30').setValue('CONTACTOS POR CAMPAÑA (UTM)').setFontWeight('bold').setFontColor(CONFIG.COLOR_ACENTO);
  sh.getRange('E31').setFormula(
    // K:M = utm_source, utm_medium, utm_campaign (C.UTM_SOURCE = 11)
    '=IFERROR(QUERY(' + L + '!K2:M,"select Col1, Col3, count(Col1) where Col1 is not null group by Col1, Col3 order by count(Col1) desc label Col1 \'Fuente\', Col3 \'Campaña\', count(Col1) \'Contactos\'",0),"Sin datos de campañas todavía")'
  );

  sh.setColumnWidth(1, 30);
  sh.setColumnWidth(2, 230);
  sh.setColumnWidth(3, 130);
  sh.setColumnWidth(5, 180);
  sh.setColumnWidth(8, 250);
  sh.setColumnWidth(11, 250);
  sh.setColumnWidth(14, 160);
  sh.setHiddenGridlines(true);
}


/* ============================================================================
   12) FUNCIONES DE PRUEBA Y MANTENIMIENTO
   ============================================================================ */

/** Te manda a vos mismo el primer email de la secuencia para ver cómo se ve. */
function enviarEmailDePrueba() {
  enviarPruebaDePaso_(0);
}

/** Te manda los 3 emails de la secuencia, uno atrás del otro, para revisarlos. */
function enviarTodosLosEmailsDePrueba() {
  for (var i = 0; i < SECUENCIA_EMAILS.length; i++) enviarPruebaDePaso_(i, true);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    SECUENCIA_EMAILS.length + ' emails de prueba enviados.', 'Listo', 8);
}

function enviarPruebaDePaso_(indice, silencioso) {
  var leadFalso = {
    fila: 0,
    nombre: 'Nombre de Prueba',
    primerNombre: 'Nombre',
    email: String(CONFIG.EMAIL_NOTIFICACION).split(',')[0].trim(),
    perfil: 'Profesional o equipo administrativo',
    pais: 'Argentina'
  };
  var paso = SECUENCIA_EMAILS[indice];
  var asunto = '[PRUEBA ' + (indice + 1) + '] ' +
    String(paso.asunto).replace(/{{nombre}}/g, leadFalso.primerNombre);
  enviarMailSeguro_(leadFalso.email, asunto, null, plantillaEmail_(paso.cuerpo(leadFalso), leadFalso));
  if (!silencioso) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Email de prueba enviado a ' + leadFalso.email, 'Listo', 6);
  }
}

/**
 * SIMULACIÓN EN SECO — no envía ningún email ni toca la planilla.
 * Te pregunta una fecha y te muestra qué email recibiría cada contacto ese día.
 * Sirve para verificar los envíos del 11/09 y del 17/09 antes de que ocurran.
 */
function simularEnviosEnUnaFecha() {
  var ui = SpreadsheetApp.getUi();

  var resp = ui.prompt(
    'Simulación (NO envía nada)',
    'Escribí la fecha y hora que querés simular.\n\n' +
    'Formato: AAAA-MM-DD HH:mm\n' +
    'Ejemplos:  2026-09-11 10:30   ·   2026-09-17 09:00',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp.getSelectedButton() !== ui.Button.OK) return;

  var momentoSimulado = parsearFecha_(resp.getResponseText());
  if (!momentoSimulado) {
    ui.alert('Fecha mal escrita', 'Usá el formato AAAA-MM-DD HH:mm\nEjemplo: 2026-09-11 10:30', ui.ButtonSet.OK);
    return;
  }

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.LEADS);
  if (!sh || sh.getLastRow() < 2) {
    ui.alert('Sin contactos', 'Todavía no hay contactos cargados en la hoja Leads.', ui.ButtonSet.OK);
    return;
  }

  var resumen = {};     // etiqueta del paso → cantidad
  var detalle = [];
  var esperando = 0, completos = 0, omitidos = 0;

  for (var fila = 2; fila <= sh.getLastRow(); fila++) {
    var lead = leerLead_(sh, fila);
    if (!lead.email) continue;
    if (String(lead.estado).toUpperCase() === 'BAJA') continue;

    // Un contacto que todavía no se registró no existe en la fecha simulada
    var fechaAlta = new Date(lead.fecha);
    if (fechaAlta.getTime() > momentoSimulado.getTime()) continue;

    var decision = decidirProximoPaso_(fechaAlta, lead.enviados, momentoSimulado);

    if (decision.accion === 'enviar') {
      var et = decision.paso.etiqueta;
      resumen[et] = (resumen[et] || 0) + 1;
      if (detalle.length < 25) detalle.push('  · ' + lead.email + '  →  ' + et);
    } else if (decision.accion === 'omitir') {
      omitidos++;
    } else if (decision.accion === 'esperar') {
      esperando++;
    } else {
      completos++;
    }
  }

  var texto = 'Si fuera el ' + formatearFecha_(momentoSimulado) + ':\n\n';

  var etiquetas = Object.keys(resumen);
  if (etiquetas.length === 0) {
    texto += 'No saldría ningún email.\n\n';
  } else {
    etiquetas.forEach(function (et) {
      texto += '📤 ' + resumen[et] + ' contacto(s) recibirían: "' + et + '"\n';
    });
    texto += '\n' + detalle.join('\n') + '\n\n';
  }

  texto += '⏳ ' + esperando + ' esperando su próximo email\n';
  texto += '⏭️ ' + omitidos + ' se saltearían un email (se registraron tarde)\n';
  texto += '✅ ' + completos + ' ya completaron la secuencia\n\n';
  texto += 'Esto es solo una simulación: no se envió ningún email.';

  Logger.log(texto);
  ui.alert('Simulación de envíos', texto, ui.ButtonSet.OK);
}

/**
 * Muestra la configuración que está corriendo REALMENTE en Apps Script.
 * Sirve para confirmar que pegaste la última versión del código.
 */
function verificarConfiguracion() {
  var texto =
    'VERSIÓN DEL CÓDIGO: ' + VERSION_CODIGO + '\n' +
    '─────────────────────────────────────\n\n' +
    'Curso:\n   ' + CONFIG.CURSO_NOMBRE + '\n\n' +
    'Firma del pie:\n   ' + CONFIG.FIRMA_EQUIPO + '\n\n' +
    'Responder a:\n   ' + CONFIG.EMAIL_RESPUESTA + '\n\n' +
    'Link "Ver el curso":\n   ' + CONFIG.URL_LANDING + '\n\n' +
    'Botón de WhatsApp:\n   ' + linkWhatsapp_() + '\n\n' +
    'Imagen de cabecera:\n   ' + (CONFIG.IMAGEN_ENCABEZADO || '(no configurada)') + '\n\n' +
    'Avisos de leads nuevos a:\n   ' + CONFIG.EMAIL_NOTIFICACION + '\n\n' +
    'Emails en la secuencia: ' + SECUENCIA_EMAILS.length + '\n' +
    'Zona horaria del proyecto: ' + Session.getScriptTimeZone() + '\n\n' +
    '─────────────────────────────────────\n' +
    'Si alguno de estos datos no es el que esperabas,\n' +
    'estás corriendo una versión vieja del código.';

  Logger.log(texto);
  SpreadsheetApp.getUi().alert('Configuración activa', texto, SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Muestra en qué fecha y hora está programado cada paso de la secuencia. */
function verProgramacionDeEnvios() {
  var hoy = new Date();
  var detalle = SECUENCIA_EMAILS.map(function (paso, i) {
    var cuando = paso.fechaFija
      ? formatearFecha_(parsearFecha_(paso.fechaFija)) + ' (fecha fija, a todos)'
      : (Number(paso.esperaHoras) === 0
          ? 'Al instante, al registrarse'
          : Number(paso.esperaHoras) + ' hs después de registrarse');

    if (paso.noAntesDe) {
      var piso = parsearFecha_(paso.noAntesDe);
      cuando += '\n     pero nunca antes del ' + formatearFecha_(piso) +
        (hoy.getTime() < piso.getTime() ? '  ← todavía no arrancó' : '');
    }
    return (i + 1) + '. ' + paso.etiqueta + '\n     ' + cuando;
  }).join('\n');

  Logger.log('Hoy es ' + formatearFecha_(hoy) + '\n\n' + detalle);
  SpreadsheetApp.getUi().alert('Programación de la secuencia', detalle, SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Simula un envío del formulario, útil para verificar toda la cadena. */
function simularLeadDePrueba() {
  var r = registrarLead_({
    action: 'lead',
    nombre: 'Contacto de Prueba',
    email: 'prueba+' + Date.now() + '@ejemplo.com',
    telefono: '3410000000',
    perfil: 'Profesional que trabaja con datos',
    nivel: 'Básico — uso la planilla para cargar y ordenar datos',
    pais: 'Argentina',
    mensaje: 'Este es un lead de prueba generado desde el menú.',
    consentimiento: 'SI',
    utm_source: 'prueba',
    utm_campaign: 'test-interno',
    dispositivo: 'Desktop',
    pagina: CONFIG.URL_LANDING
  });
  SpreadsheetApp.getActiveSpreadsheet().toast(JSON.stringify(r), 'Resultado', 8);
}

function verCuotaEmails() {
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Te quedan ' + MailApp.getRemainingDailyQuota() + ' emails para enviar hoy.',
    'Cuota diaria', 8
  );
}

/**
 * PREPARAR PARA PRODUCCIÓN — borra los datos de prueba y deja todo listo.
 *
 * Qué hace:
 *   1. Borra TODAS las filas de Leads, Clics WhatsApp y Log Emails
 *      (deja los encabezados y el Panel intactos).
 *   2. Verifica que el disparador automático esté instalado, y si no, lo instala.
 *   3. Te muestra un resumen del estado final.
 *
 * Qué NO hace: no toca la programación de la secuencia. Los emails del 11 y del
 * 17 de septiembre siguen esperando su fecha; no se disparan por ejecutar esto.
 */
function prepararParaProduccion() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var leads = ss.getSheetByName(HOJAS.LEADS);
  var clics = ss.getSheetByName(HOJAS.CLICS);
  var log = ss.getSheetByName(HOJAS.LOG);

  var nLeads = leads && leads.getLastRow() > 1 ? leads.getLastRow() - 1 : 0;
  var nClics = clics && clics.getLastRow() > 1 ? clics.getLastRow() - 1 : 0;
  var nLog = log && log.getLastRow() > 1 ? log.getLastRow() - 1 : 0;

  var confirmacion = ui.alert(
    '¿Borrar los datos de prueba?',
    'Se van a eliminar DEFINITIVAMENTE:\n\n' +
    '   · ' + nLeads + ' contacto(s) de la hoja Leads\n' +
    '   · ' + nClics + ' clic(s) de WhatsApp\n' +
    '   · ' + nLog + ' registro(s) del Log de Emails\n\n' +
    'Los encabezados y el Panel quedan intactos.\n' +
    'Esto NO se puede deshacer.\n\n' +
    '¿Continuamos?',
    ui.ButtonSet.YES_NO
  );
  if (confirmacion !== ui.Button.YES) {
    ss.toast('Cancelado. No se borró nada.', 'Producción', 6);
    return;
  }

  [leads, clics, log].forEach(function (sh) {
    if (sh && sh.getLastRow() > 1) {
      sh.deleteRows(2, sh.getLastRow() - 1);
    }
  });

  // El disparador es lo que dispara los envíos del 11 y del 17
  var trigs = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'procesarSecuencia';
  });
  var disparadorNuevo = false;
  if (trigs.length === 0) {
    instalarDisparadores_();
    disparadorNuevo = true;
  }

  // Resumen del estado final
  var pasos = SECUENCIA_EMAILS.map(function (paso, i) {
    var cuando = paso.fechaFija
      ? formatearFecha_(parsearFecha_(paso.fechaFija))
      : 'al registrarse';
    return '   ' + (i + 1) + '. ' + paso.etiqueta + ' → ' + cuando;
  }).join('\n');

  ui.alert(
    '✅ Listo para producción',
    'Planilla vacía y sistema activo.\n\n' +
    'PROGRAMACIÓN DE ENVÍOS:\n' + pasos + '\n\n' +
    'Disparador automático: ' + (disparadorNuevo ? 'instalado ahora ✓' : 'ya estaba activo ✓') + '\n' +
    'Avisos de leads nuevos a: ' + CONFIG.EMAIL_NOTIFICACION + '\n' +
    'Cuota de emails disponible hoy: ' + MailApp.getRemainingDailyQuota() + '\n\n' +
    'Los emails con fecha fija NO se enviaron:\n' +
    'salen solos en su fecha, a quienes se hayan registrado.',
    ui.ButtonSet.OK
  );
}

/**
 * DIAGNÓSTICO — revisa por qué no llegan los emails.
 * Se puede ejecutar desde el editor de Apps Script (no necesita la planilla abierta).
 * El resultado queda en "Registro de ejecución".
 */
function diagnosticarEnvios() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = [];

  out.push('═══════════ DIAGNÓSTICO DE ENVÍOS ═══════════');
  out.push('Versión del código:  ' + (typeof VERSION_CODIGO !== 'undefined' ? VERSION_CODIGO : 'DESCONOCIDA (código viejo)'));
  out.push('Fecha y hora ahora:  ' + formatearFecha_(new Date()));
  out.push('Zona horaria:        ' + Session.getScriptTimeZone());
  out.push('');
  out.push('Cuenta que envía:    ' + Session.getEffectiveUser().getEmail());
  out.push('Cuota restante hoy:  ' + MailApp.getRemainingDailyQuota() + ' emails');
  out.push('Las PRUEBAS van a:   ' + String(CONFIG.EMAIL_NOTIFICACION).split(',')[0].trim());
  out.push('   (revisá ESA casilla, y también su carpeta de Spam)');
  out.push('');

  // --- Estado de cada contacto ---
  var leads = ss.getSheetByName(HOJAS.LEADS);
  if (!leads || leads.getLastRow() < 2) {
    out.push('CONTACTOS: no hay ninguno cargado.');
  } else {
    out.push('CONTACTOS (' + (leads.getLastRow() - 1) + '):');
    for (var f = 2; f <= leads.getLastRow(); f++) {
      var l = leerLead_(leads, f);
      if (!l.email) continue;
      var d = decidirProximoPaso_(new Date(l.fecha), l.enviados, new Date());
      out.push('  ' + l.email);
      out.push('     alta: ' + formatearFecha_(new Date(l.fecha)) +
               '  |  estado: ' + l.estado +
               '  |  ya recibió: ' + (l.enviados || '(nada)'));
      out.push('     ahora le corresponde: ' + d.accion +
               (d.paso ? ' → "' + d.paso.etiqueta + '"' : '') +
               (d.accion === 'esperar' && d.momento ? ' (recién el ' + formatearFecha_(d.momento) + ')' : ''));
    }
  }
  out.push('');

  // --- Últimos intentos de envío ---
  var log = ss.getSheetByName(HOJAS.LOG);
  if (!log || log.getLastRow() < 2) {
    out.push('LOG DE EMAILS: vacío. El script nunca intentó enviar nada.');
    out.push('   → Si ya ejecutaste "enviarTodosLosEmailsDePrueba", puede que');
    out.push('     haya fallado antes de registrar. Mirá el Registro de ejecución.');
  } else {
    var desde = Math.max(2, log.getLastRow() - 14);
    var filas = log.getRange(desde, 1, log.getLastRow() - desde + 1, COLUMNAS_LOG.length).getValues();
    out.push('ÚLTIMOS ' + filas.length + ' INTENTOS DE ENVÍO:');
    filas.forEach(function (r) {
      out.push('  ' + formatearFecha_(new Date(r[0])) + ' | ' + r[5] + ' | ' + r[1] + ' | ' + r[3] +
               (r[6] ? ' | ' + r[6] : ''));
    });
  }
  out.push('');

  // --- Disparador instalado ---
  var trigs = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === 'procesarSecuencia';
  });
  out.push('DISPARADOR AUTOMÁTICO: ' + (trigs.length
    ? trigs.length + ' instalado(s) ✓'
    : 'NINGUNO ✗  → ejecutá configurarTodo()'));
  out.push('═════════════════════════════════════════════');

  var texto = out.join('\n');
  Logger.log(texto);
  try { ss.toast('Diagnóstico listo. Miralo en "Registro de ejecución".', 'Diagnóstico', 10); } catch (e) {}
  return texto;
}

/** Da de baja un contacto para que deje de recibir la secuencia. */
function darDeBajaEmail(email) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.LEADS);
  var fila = buscarFilaPorEmail_(sh, String(email).toLowerCase().trim());
  if (fila) {
    sh.getRange(fila, C.ESTADO).setValue('BAJA');
    Logger.log('Contacto dado de baja: ' + email);
  } else {
    Logger.log('No se encontró el email: ' + email);
  }
}


/* ============================================================================
   13) UTILIDADES
   ============================================================================ */
function limpiar_(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim().substring(0, 1000);
}

function formatearFecha_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
}

function quitarHtml_(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
