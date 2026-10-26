// Número de versión que se muestra en pantalla. Súbelo junto con VERSION en sw.js.
const VERSION_APP = 11;

// =====================================================================
// 1. GUARDAR Y LEER EL PROGRESO (localStorage)
// =====================================================================
// localStorage guarda texto en el navegador y no se borra al cerrar la app.
// Guardamos un objeto como { "hotel-3": true } = "la frase 3 del hotel está dominada".
// Usamos try/catch porque en modo privado Safari puede bloquear localStorage.

const CLAVE_PROGRESO = "ingles-viaje-dominadas";
const CLAVE_LENTO = "ingles-viaje-lento";

function leerProgreso() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PROGRESO)) || {};
  } catch (error) {
    return {};
  }
}

function guardarProgreso(progreso) {
  try {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
  } catch (error) {
    // Si no se puede guardar, la app sigue funcionando igual
  }
}

function contarDominadas(escenario) {
  const progreso = leerProgreso();
  let total = 0;
  escenario.frases.forEach((frase, indice) => {
    if (progreso[escenario.id + "-" + indice]) total++;
  });
  return total;
}

// =====================================================================
// 2. PANTALLA DE INICIO
// =====================================================================

const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaFrases = document.getElementById("pantalla-frases");

function mostrarInicio() {
  const lista = document.getElementById("lista-escenarios");
  lista.innerHTML = ""; // borramos los botones viejos para redibujarlos

  ESCENARIOS.forEach((escenario) => {
    const boton = document.createElement("button");
    boton.className = "boton boton-escenario";

    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = escenario.emoji;

    const nombre = document.createElement("span");
    nombre.textContent = escenario.nombre;

    const progreso = document.createElement("span");
    progreso.className = "progreso";
    progreso.textContent = contarDominadas(escenario) + " / " + escenario.frases.length;

    boton.append(emoji, nombre, progreso);
    boton.addEventListener("click", () => mostrarEscenario(escenario));
    lista.appendChild(boton);
  });

  pantallaFrases.hidden = true;
  pantallaInicio.hidden = false;
  window.scrollTo(0, 0);
}

// =====================================================================
// 3. PANTALLA DE FRASES
// =====================================================================

function mostrarEscenario(escenario) {
  document.getElementById("titulo-escenario").textContent =
    escenario.emoji + " " + escenario.nombre;

  const lista = document.getElementById("lista-frases");
  lista.innerHTML = "";

  escenario.frases.forEach((frase, indice) => {
    lista.appendChild(crearTarjeta(escenario, frase, indice));

    // Descargamos sus audios por adelantado para que suenen sin demora
    [rutaDeAudio(frase.en, "en"), rutaDeAudio(frase.es, "es")].forEach((ruta) => {
      if (audiosDisponibles.has(ruta)) cargarAudio(ruta).catch(() => {});
    });
  });

  pantallaInicio.hidden = true;
  pantallaFrases.hidden = false;
  window.scrollTo(0, 0);
}

// Crea la tarjeta de una frase con sus botones y su casilla
function crearTarjeta(escenario, frase, indice) {
  const clave = escenario.id + "-" + indice;

  const tarjeta = document.createElement("section");
  tarjeta.className = "tarjeta";

  const ingles = document.createElement("p");
  ingles.className = "ingles";
  ingles.textContent = frase.en;

  const espanol = document.createElement("p");
  espanol.className = "espanol";
  espanol.textContent = frase.es;

  // Botón para oír la traducción con la voz latina
  const botonEspanol = document.createElement("button");
  botonEspanol.className = "boton boton-espanol";
  botonEspanol.textContent = "🇨🇴 Escuchar en español";
  botonEspanol.addEventListener("click", () => hablar(frase.es, "es"));

  // --- Botones ---
  const botones = document.createElement("div");
  botones.className = "botones";

  const botonEscuchar = document.createElement("button");
  botonEscuchar.className = "boton boton-escuchar";
  botonEscuchar.textContent = "🔊 Escuchar";
  botonEscuchar.addEventListener("click", () => hablar(frase.en, "en"));

  const botonRepetir = document.createElement("button");
  botonRepetir.className = "boton boton-repetir";
  botonRepetir.textContent = "🎤 Repetir";

  // Caja donde mostramos el puntaje (empieza oculta)
  const resultado = document.createElement("div");
  resultado.className = "resultado";
  resultado.hidden = true;

  botonRepetir.addEventListener("click", () =>
    escuchar(frase.en, botonRepetir, resultado)
  );

  botones.append(botonEscuchar, botonRepetir);

  // --- Casilla "Ya la domino" ---
  const dominio = document.createElement("label");
  dominio.className = "dominio";

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = Boolean(leerProgreso()[clave]);
  tarjeta.classList.toggle("dominada", casilla.checked);

  casilla.addEventListener("change", () => {
    const progreso = leerProgreso();
    if (casilla.checked) {
      progreso[clave] = true;
    } else {
      delete progreso[clave];
    }
    guardarProgreso(progreso);
    tarjeta.classList.toggle("dominada", casilla.checked);
  });

  const textoDominio = document.createElement("span");
  textoDominio.textContent = "✅ Ya la domino";

  dominio.append(casilla, textoDominio);

  tarjeta.append(ingles, espanol, botonEspanol, botones, resultado, dominio);
  return tarjeta;
}

// =====================================================================
// 4. BOTÓN "ESCUCHAR" (speechSynthesis = el navegador lee en voz alta)
// =====================================================================

const casillaLento = document.getElementById("modo-lento");

// Recordamos si el modo lento estaba activado la última vez
try {
  casillaLento.checked = localStorage.getItem(CLAVE_LENTO) === "si";
} catch (error) {}

casillaLento.addEventListener("change", () => {
  try {
    localStorage.setItem(CLAVE_LENTO, casillaLento.checked ? "si" : "no");
  } catch (error) {}
});

// --- Cómo elegimos las voces ---
// El navegador no dice si una voz es de mujer o de hombre, así que usamos
// listas de nombres de voces femeninas conocidas (Apple, Google, Microsoft).
// Cada voz recibe "puntos": idioma preferido + nombre femenino + buena calidad.
// Gana la voz con más puntos.

const VOCES_FEMENINAS = [
  // Español
  "soledad", "paulina", "angélica", "angelica", "salome", "salomé", "dalia",
  "paloma", "marisol", "mónica", "monica", "isabela", "francisca", "ximena",
  "google español de estados unidos",
  // Inglés británico
  "kate", "serena", "martha", "stephanie", "libby", "sonia", "hazel", "maisie",
  "google uk english female",
  // Otros acentos de inglés (por si el dispositivo no tiene voces británicas)
  "samantha", "ava", "allison", "susan", "zoe", "nicky", "joelle",
  "karen", "moira", "tessa", "aria", "jenny", "zira",
  "google us english",
];

// Voces "de juguete" o robóticas de Apple que no queremos usar
const VOCES_RARAS = [
  "flo", "sandy", "shelley", "grandma", "grandpa", "eddy", "reed", "rocko",
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "good news", "jester", "organ", "superstar", "trinoids", "whisper",
  "wobble", "zarvox", "junior", "ralph", "fred", "kathy",
];

// Orden de idiomas preferidos: el primero vale más puntos
const IDIOMAS_ESPANOL = ["es-CO", "es-419", "es-MX", "es-US"];
// Inglés del Reino Unido primero; si no hay, Irlanda, Australia y EE. UU.
const IDIOMAS_INGLES = ["en-GB", "en-IE", "en-AU", "en-US"];

let vozIngles = null;
let vozEspanol = null;

// "es_CO" y "es-co" se convierten en "es-CO" (cada navegador lo escribe distinto)
function normalizarIdioma(idioma) {
  const [lengua, region] = idioma.replace("_", "-").split("-");
  return region ? lengua.toLowerCase() + "-" + region.toUpperCase() : lengua.toLowerCase();
}

function puntuarVoz(voz, idiomasPreferidos) {
  const nombre = voz.name.toLowerCase();
  const idioma = normalizarIdioma(voz.lang);

  if (VOCES_RARAS.some((rara) => nombre.startsWith(rara))) return -1;

  let puntos = 0;
  const posicion = idiomasPreferidos.indexOf(idioma);
  // El idioma pesa más que el género: un acento británico de hombre
  // le gana a una voz de mujer de otro país.
  if (posicion !== -1) puntos += (idiomasPreferidos.length - posicion) * 30;
  if (VOCES_FEMENINAS.some((femenina) => nombre.includes(femenina))) puntos += 25;
  if (/enhanced|premium|mejorada|natural/.test(nombre)) puntos += 5;
  return puntos;
}

function elegirVoz(prefijoIdioma, idiomasPreferidos) {
  const candidatas = speechSynthesis
    .getVoices()
    .filter((voz) => normalizarIdioma(voz.lang).startsWith(prefijoIdioma));

  let mejor = null;
  let mejoresPuntos = -1;
  candidatas.forEach((voz) => {
    const puntos = puntuarVoz(voz, idiomasPreferidos);
    if (puntos > mejoresPuntos) {
      mejoresPuntos = puntos;
      mejor = voz;
    }
  });
  return mejor;
}

// Elige las dos voces y muestra en pantalla cuáles se van a usar
function cargarVoces() {
  vozIngles = elegirVoz("en", IDIOMAS_INGLES);
  vozEspanol = elegirVoz("es", IDIOMAS_ESPANOL);

  let texto;
  if (typeof INFO_AUDIOS !== "undefined") {
    // Si hay audios grabados, esos son los que se oyen
    texto = "Voz en inglés: " + INFO_AUDIOS.vozIngles + " (Reino Unido)" +
      " · Voz en español: " + INFO_AUDIOS.vozEspanol;
  } else {
    const describir = (voz) => (voz ? voz.name + " (" + voz.lang + ")" : "no encontrada");
    texto = "Voz en inglés: " + describir(vozIngles) +
      " · Voz en español: " + describir(vozEspanol);
  }
  // La versión y la variante sirven para saber qué estás usando si algo falla
  document.getElementById("voces-elegidas").textContent =
    texto + " · Versión " + VERSION_APP + " · audio " + VARIANTE_AUDIO;
}

// --- Modo de audio del iPhone ---
// Safari decide solo si el iPhone está en modo "reproducir" o "reproducir y
// grabar". Desde iOS 17 podemos pedirle un modo, pero en las pruebas eso a
// veces empeoró las cosas (bajó el volumen y cortó el micrófono).
// Por eso hay tres variantes que se eligen desde el link:
//   ?audio=1  -> no tocar el modo (predeterminada)
//   ?audio=2  -> "play-and-record" al grabar, "auto" el resto del tiempo
//   ?audio=3  -> "playback" al hablar, "play-and-record" al grabar
const VARIANTE_AUDIO = ["1", "2", "3"].includes(new URLSearchParams(location.search).get("audio"))
  ? new URLSearchParams(location.search).get("audio")
  : "1";

const MODOS_POR_VARIANTE = {
  "1": {},
  "2": { hablar: "auto", grabar: "play-and-record", terminar: "auto" },
  "3": { hablar: "playback", grabar: "play-and-record" },
};

// "accion" es "hablar", "grabar" o "terminar" (terminar de grabar)
function prepararAudioPara(accion) {
  const modo = MODOS_POR_VARIANTE[VARIANTE_AUDIO][accion];
  if (!modo) return;
  try {
    if (navigator.audioSession) navigator.audioSession.type = modo;
  } catch (error) {
    // Navegadores sin esta función: no pasa nada
  }
}

let ultimoUsoDeVoz = 0; // momento en que la app habló por última vez

// --- Audios grabados (Web Audio) ---
// En iPhone, después de usar la voz del navegador el micrófono deja de
// funcionar. Por eso preferimos audios grabados (carpeta audio/, creados con
// herramientas/generar_audios.py) que suenan por otro camino: Web Audio.
//
// Importante en iPhone: un reproductor abierto (aunque esté en pausa) sigue
// "ocupando" el audio y el micrófono se corta. Por eso creamos un reproductor
// nuevo para cada audio y lo CERRAMOS apenas termina.

let contextoAudio = null;          // el reproductor de Web Audio (solo mientras suena)
let fuenteActual = null;           // el audio que está sonando ahora
let numeroReproduccion = 0;        // sube con cada toque; sirve para ignorar audios viejos
let decodificador = null;          // prepara los audios sin usar el parlante
const audiosCargados = new Map();  // audios ya descargados, para no repetir
const audiosDisponibles = new Set(
  typeof INFO_AUDIOS !== "undefined" ? INFO_AUDIOS.archivos : []
);

// "¿Dónde está?" -> "donde-esta" (igual que en generar_audios.py)
function nombreDeAudio(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita los acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rutaDeAudio(texto, carpeta) {
  return "audio/" + carpeta + "/" + nombreDeAudio(texto) + ".m4a";
}

// Un "contexto sin conexión" convierte los archivos en sonido listo para
// reproducir, pero sin tocar el parlante ni el micrófono del iPhone.
function obtenerDecodificador() {
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!decodificador && Offline) decodificador = new Offline(1, 1, 44100);
  return decodificador;
}

// Descarga y prepara un audio (solo una vez por archivo)
function cargarAudio(ruta) {
  if (!audiosCargados.has(ruta)) {
    const promesa = fetch(ruta)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("No existe " + ruta);
        return respuesta.arrayBuffer();
      })
      .then((datos) => obtenerDecodificador().decodeAudioData(datos));
    promesa.catch(() => audiosCargados.delete(ruta)); // si falla, se reintenta otra vez
    audiosCargados.set(ruta, promesa);
  }
  return audiosCargados.get(ruta);
}

// Cierra el reproductor para que el iPhone libere el audio
function cerrarReproductor() {
  if (contextoAudio) {
    contextoAudio.close().catch(() => {});
    contextoAudio = null;
  }
}

// Detiene cualquier sonido de la app (audio grabado o voz del navegador)
function detenerSonido() {
  numeroReproduccion++; // cualquier audio que estuviera cargando ya no sonará
  if (fuenteActual) {
    try { fuenteActual.stop(); } catch (error) {}
    fuenteActual = null;
  }
  cerrarReproductor();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

function haySonido() {
  return Boolean(fuenteActual) ||
    ("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending));
}

function hablar(texto, idioma) {
  detenerSonido();
  prepararAudioPara("hablar");
  ultimoUsoDeVoz = Date.now();

  const carpeta = idioma === "es" ? "es" : (casillaLento.checked ? "lento" : "en");
  const ruta = rutaDeAudio(texto, carpeta);
  const Contexto = window.AudioContext || window.webkitAudioContext;

  // Sin audio grabado para esta frase: usamos la voz del navegador
  if (!audiosDisponibles.has(ruta) || !Contexto || !obtenerDecodificador()) {
    hablarConVozDelNavegador(texto, idioma);
    return;
  }

  // Reproductor nuevo, creado dentro del toque (el iPhone lo exige)
  const contexto = new Contexto();
  contextoAudio = contexto;
  contexto.resume();
  const numero = numeroReproduccion;

  cargarAudio(ruta)
    .then((sonido) => {
      if (numero !== numeroReproduccion) return; // tocaste otra cosa mientras cargaba
      const fuente = contexto.createBufferSource();
      fuente.buffer = sonido;
      fuente.connect(contexto.destination);
      fuente.onended = () => {
        // Al terminar, cerramos el reproductor para liberar el audio del iPhone
        if (numero === numeroReproduccion) {
          fuenteActual = null;
          cerrarReproductor();
        }
      };
      fuenteActual = fuente;
      fuente.start();
    })
    .catch(() => {
      if (numero === numeroReproduccion) hablarConVozDelNavegador(texto, idioma);
    });
}

// Respaldo: la voz del navegador (speechSynthesis)
function hablarConVozDelNavegador(texto, idioma) {
  if (!("speechSynthesis" in window)) {
    alert("Tu navegador no puede leer en voz alta.");
    return;
  }

  const mensaje = new SpeechSynthesisUtterance(texto);
  if (idioma === "es") {
    mensaje.lang = vozEspanol ? vozEspanol.lang : "es-CO";
    mensaje.voice = vozEspanol;
    mensaje.rate = 0.95;
  } else {
    mensaje.lang = vozIngles ? vozIngles.lang : "en-GB";
    mensaje.voice = vozIngles;
    mensaje.rate = casillaLento.checked ? 0.6 : 0.95; // 1 = velocidad normal
  }

  speechSynthesis.speak(mensaje);
}

// Las voces cargan un poco tarde. Cuando estén listas, el navegador
// avisa con "voiceschanged" y volvemos a elegir.
if ("speechSynthesis" in window) {
  cargarVoces();
  speechSynthesis.addEventListener("voiceschanged", cargarVoces);
}

// =====================================================================
// 5. BOTÓN "REPETIR" (reconocimiento de voz con el micrófono)
// =====================================================================

// Safari lo llama "webkitSpeechRecognition"; otros navegadores sin "webkit"
const Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
let grabacionActual = null; // para no grabar dos frases a la vez

// En iPhone, solo el PRIMER reconocedor de voz que crea la página funciona;
// los siguientes se cortan solos ("aborted"). Por eso creamos uno solo y lo
// reutilizamos para todas las frases.
let reconocedor = null;

function obtenerReconocedor() {
  if (!reconocedor) {
    reconocedor = new Reconocimiento();
    reconocedor.lang = "en-GB"; // inglés británico, igual que la voz
    // Pedimos también resultados "en borrador" mientras hablas: así los vemos
    // en vivo, y en iPhone a veces son lo único que llega.
    reconocedor.interimResults = true;
    reconocedor.maxAlternatives = 3; // pedimos 3 posibles interpretaciones
  }
  return reconocedor;
}

// Mensajes en español para cada error que puede dar el micrófono
// "detectoVoz" dice si el micrófono notó que hablabas (ayuda a saber qué falló)
function explicarError(codigo, detectoVoz) {
  switch (codigo) {
    case "not-allowed":
    case "service-not-allowed":
      return estaInstalada()
        ? "No tengo permiso para usar el micrófono. Abre la app desde Safari en vez del ícono de la pantalla de inicio."
        : "No tengo permiso para usar el micrófono. Toca aA → Ajustes del sitio web → Micrófono → Permitir. " +
          "Revisa también que el dictado esté activado (Ajustes → General → Teclado → Activar dictado).";
    case "no-speech":
      return detectoVoz
        ? "Te escuché, pero no entendí las palabras. Habla un poco más despacio y claro."
        : "No te escuché. Espera a ver \"🎙️ Habla ahora…\" y habla cerca del micrófono, sin pausas largas.";
    case "aborted":
      return "El iPhone cortó la grabación. Toca 🎤 Repetir otra vez y espera a ver \"Habla ahora…\" antes de hablar." +
        (estaInstalada() ? " Si sigue pasando, abre la app desde Safari." : "");
    case "audio-capture":
      return "Otra cosa está usando el micrófono (una llamada, una app de grabación o unos AirPods). Ciérrala e inténtalo de nuevo.";
    case "network":
      return "No pude conectarme al servicio de voz de Apple. Revisa tu conexión a internet.";
    case "language-not-supported":
      return "El dictado en inglés no está activo. Agrega el teclado English (US) en Ajustes → General → Teclado.";
    default:
      return "Hubo un problema con el micrófono (" + codigo + "). Toca 🎤 Repetir otra vez.";
  }
}

function escuchar(fraseOriginal, boton, resultado) {
  if (!Reconocimiento) {
    mostrarAvisoMicrofono();
    return;
  }

  // Si ya estaba grabando, tocar otra vez detiene la grabación
  if (grabacionActual) {
    grabacionActual.stop();
    return;
  }

  // Pedimos al iPhone el modo "reproducir y grabar" antes de abrir el micrófono
  prepararAudioPara("grabar");

  // Si la voz de la app está sonando, la callamos y esperamos un momento:
  // en iPhone el micrófono falla ("aborted") si el audio sigue ocupado.
  const estabaSonando = haySonido();
  detenerSonido(); // también cierra el reproductor de audios

  if (estabaSonando) {
    setTimeout(() => iniciarGrabacion(fraseOriginal, boton, resultado, false), 400);
  } else {
    iniciarGrabacion(fraseOriginal, boton, resultado, false);
  }
}

// Elige, entre las interpretaciones del micrófono, la que más se parece a la frase
function mejorInterpretacion(fraseOriginal, alternativas) {
  let mejorTexto = "";
  let mejorPuntaje = -1;
  alternativas.forEach((texto) => {
    const puntaje = calcularPuntaje(fraseOriginal, texto);
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorTexto = texto;
    }
  });
  return { texto: mejorTexto, puntaje: mejorPuntaje };
}

let numeroGrabacion = 0; // cuántas grabaciones van desde que abriste la app

// Muestra el error en español y, debajo en letra pequeña, detalles técnicos
// que sirven para encontrar la causa si algo falla.
function mostrarError(resultado, codigo, detectoVoz, esReintento) {
  resultado.className = "resultado mal";
  resultado.innerHTML = "";

  const mensaje = document.createElement("div");
  mensaje.textContent = explicarError(codigo, detectoVoz);

  const segundosDesdeVoz = ultimoUsoDeVoz ? Math.round((Date.now() - ultimoUsoDeVoz) / 1000) : "-";
  const detalles = document.createElement("div");
  detalles.className = "detalles";
  detalles.textContent =
    "Detalles: " + codigo +
    " · grabación #" + numeroGrabacion +
    " · reintento: " + (esReintento ? "sí" : "no") +
    " · voz hace " + segundosDesdeVoz + " s" +
    " · reproductor: " + (contextoAudio ? contextoAudio.state : "cerrado") +
    " · modo: " + (navigator.audioSession ? navigator.audioSession.type : "n/a") +
    " · v" + VERSION_APP + " audio " + VARIANTE_AUDIO;

  resultado.append(mensaje, detalles);
}

// "esReintento" evita reintentar más de una vez seguida
function iniciarGrabacion(fraseOriginal, boton, resultado, esReintento) {
  numeroGrabacion++;
  const grabacion = obtenerReconocedor();

  const momentoInicio = Date.now();
  let reintentar = false;
  let terminado = false;      // ya mostramos un puntaje o un error
  let detectoVoz = false;     // el micrófono notó que alguien hablaba
  let ultimoBorrador = "";    // lo último que entendió, aunque no sea final

  grabacionActual = grabacion;
  boton.classList.add("grabando");
  boton.textContent = "⏹ Detener";
  resultado.hidden = false;
  resultado.className = "resultado";
  resultado.textContent = "Preparando micrófono…";

  // El micrófono ya está grabando: ahora sí puedes hablar.
  // Usamos dos avisos porque no todos los navegadores mandan los dos.
  const avisarQueHable = () => {
    if (!terminado && !ultimoBorrador) resultado.textContent = "🎙️ Habla ahora…";
  };
  grabacion.onstart = avisarQueHable;
  grabacion.onaudiostart = avisarQueHable;

  grabacion.onspeechstart = () => {
    detectoVoz = true;
  };

  grabacion.onresult = (evento) => {
    // Juntamos todo lo que ha entendido hasta ahora
    let texto = "";
    for (let i = 0; i < evento.results.length; i++) {
      texto += evento.results[i][0].transcript;
    }
    ultimoBorrador = texto.trim();

    const ultimo = evento.results[evento.results.length - 1];
    if (ultimo.isFinal) {
      // Resultado definitivo: revisamos sus alternativas y calificamos la mejor
      const alternativas = Array.from(ultimo).map((alternativa) => alternativa.transcript);
      const mejor = mejorInterpretacion(fraseOriginal, alternativas);
      terminado = true;
      mostrarResultado(resultado, mejor.puntaje, mejor.texto);
    } else {
      // Borrador: lo mostramos en vivo
      resultado.textContent = "🎙️ " + ultimoBorrador + "…";
    }
  };

  grabacion.onerror = (evento) => {
    // Si el iPhone corta la grabación apenas empieza (por ejemplo, por el
    // aviso de permiso), reintentamos una vez sin que tengas que tocar nada.
    if (evento.error === "aborted" && !esReintento && !ultimoBorrador &&
        Date.now() - momentoInicio < 2000) {
      reintentar = true;
      return;
    }
    // Si ya había entendido algo, lo calificamos en onend en vez de mostrar el error
    if (ultimoBorrador) return;
    terminado = true;
    mostrarError(resultado, evento.error, detectoVoz, esReintento);
  };

  grabacion.onend = () => {
    grabacionActual = null;
    if (reintentar) {
      // Si la voz habló hace poco, esperamos más para que el iPhone suelte el audio
      const espera = Date.now() - ultimoUsoDeVoz < 15000 ? 900 : 300;
      prepararAudioPara("grabar");
      setTimeout(() => iniciarGrabacion(fraseOriginal, boton, resultado, true), espera);
      return;
    }
    boton.classList.remove("grabando");
    boton.textContent = "🎤 Repetir";
    prepararAudioPara("terminar"); // terminamos de grabar
    if (terminado) return;

    if (ultimoBorrador) {
      // Safari terminó sin marcar el texto como final: calificamos el borrador
      mostrarResultado(resultado, calcularPuntaje(fraseOriginal, ultimoBorrador), ultimoBorrador);
    } else {
      mostrarError(resultado, "no-speech", detectoVoz, esReintento);
    }
  };

  grabacion.start();
}

function mostrarResultado(resultado, puntaje, textoDicho) {
  let clase, mensaje;
  if (puntaje >= 80) {
    clase = "bien";
    mensaje = "🟢 ¡Excelente!";
  } else if (puntaje >= 50) {
    clase = "casi";
    mensaje = "🟡 Casi, sigue practicando";
  } else {
    clase = "mal";
    mensaje = "🔴 Intenta de nuevo";
  }

  resultado.className = "resultado " + clase;
  resultado.innerHTML = "";

  const lineaPuntaje = document.createElement("div");
  lineaPuntaje.className = "puntaje";
  lineaPuntaje.textContent = puntaje + " / 100  " + mensaje;

  const lineaDicho = document.createElement("div");
  lineaDicho.textContent = "Entendí: \"" + textoDicho + "\"";

  resultado.append(lineaPuntaje, lineaDicho);
}

// =====================================================================
// 6. CALCULAR EL PUNTAJE
// =====================================================================
// Idea: convertimos cada frase en una lista de palabras "limpias" y
// contamos cuántas coinciden EN ORDEN. Luego lo pasamos a 0-100.

// El micrófono a veces escribe "12" en vez de "twelve", o "I'm" en vez de "I am".
// Este diccionario unifica esas diferencias para no castigarte por ellas.
const EQUIVALENCIAS = {
  "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
  "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
  "11": "eleven", "12": "twelve",
  "i'm": "i am", "it's": "it is", "what's": "what is", "isn't": "is not",
  "don't": "do not", "can't": "can not", "cannot": "can not",
  "i'd": "i would", "i'll": "i will", "we'd": "we would",
  "i've": "i have", "we've": "we have", "it'll": "it will", "couldn't": "could not",
  "flight's": "flight has", "aren't": "are not",
  "wifi": "wi fi", "checkin": "check in", "checkout": "check out",
  "cancelled": "canceled",
};

function limpiarTexto(texto) {
  const palabras = texto
    .toLowerCase()
    .replace(/-/g, " ")            // "check-in" -> "check in"
    .replace(/[^a-z0-9' ]/g, "")   // quitamos signos: ¿?.,!
    .split(" ")
    .filter((palabra) => palabra !== "");

  // Reemplazamos cada palabra por su equivalente (si tiene uno)
  return palabras
    .map((palabra) => EQUIVALENCIAS[palabra] || palabra)
    .join(" ")
    .split(" ");
}

// Cuenta la mayor cantidad de palabras que aparecen en el mismo orden en ambas listas
// (se llama "subsecuencia común más larga").
function palabrasEnOrden(a, b) {
  const tabla = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        tabla[i][j] = tabla[i - 1][j - 1] + 1;
      } else {
        tabla[i][j] = Math.max(tabla[i - 1][j], tabla[i][j - 1]);
      }
    }
  }
  return tabla[a.length][b.length];
}

function calcularPuntaje(original, dicho) {
  const esperadas = limpiarTexto(original);
  const dichas = limpiarTexto(dicho);
  if (dichas.length === 0) return 0;

  const coincidencias = palabrasEnOrden(esperadas, dichas);
  // Dividimos entre el promedio de ambas longitudes: así faltar palabras
  // o agregar palabras de más baja el puntaje.
  const puntaje = (2 * coincidencias) / (esperadas.length + dichas.length);
  return Math.round(puntaje * 100);
}

// =====================================================================
// 7. AVISOS Y ARRANQUE DE LA APP
// =====================================================================

// ¿Se abrió desde el ícono de la pantalla de inicio?
function estaInstalada() {
  return window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
}

function mostrarAvisoMicrofono() {
  const aviso = document.getElementById("aviso-microfono");
  aviso.textContent = estaInstalada()
    ? "🎤 El micrófono no está disponible dentro de la app instalada. Abre esta página en Safari para usar \"Repetir\"."
    : "🎤 Este navegador no permite reconocer tu voz. Usa Safari en iPhone o Chrome en computadora.";
  aviso.hidden = false;
}

if (!Reconocimiento) {
  mostrarAvisoMicrofono();
}

document.getElementById("boton-volver").addEventListener("click", () => {
  detenerSonido();
  if (grabacionActual) grabacionActual.stop();
  mostrarInicio();
});

// Registramos el "service worker" para que la app funcione sin internet.
// Solo funciona en https:// o en localhost.
if ("serviceWorker" in navigator) {
  // Si ya había una versión guardada y llega una nueva, recargamos la página
  // una vez para usarla (así no tienes que recargar a mano dos veces).
  const habiaVersionGuardada = Boolean(navigator.serviceWorker.controller);
  let yaRecargo = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (habiaVersionGuardada && !yaRecargo) {
      yaRecargo = true;
      location.reload();
    }
  });
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

mostrarInicio();
