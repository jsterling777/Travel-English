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
  // Inglés
  "samantha", "ava", "allison", "susan", "zoe", "nicky", "joelle", "serena",
  "karen", "moira", "tessa", "kate", "aria", "jenny", "zira",
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
const IDIOMAS_INGLES = ["en-US", "en-GB", "en-AU", "en-CA"];

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
  if (posicion !== -1) puntos += (idiomasPreferidos.length - posicion) * 10;
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

  const describir = (voz) => (voz ? voz.name + " (" + voz.lang + ")" : "no encontrada");
  document.getElementById("voces-elegidas").textContent =
    "Voz en inglés: " + describir(vozIngles) +
    " · Voz en español: " + describir(vozEspanol);
}

function hablar(texto, idioma) {
  if (!("speechSynthesis" in window)) {
    alert("Tu navegador no puede leer en voz alta.");
    return;
  }
  speechSynthesis.cancel(); // detiene cualquier frase que esté sonando

  const mensaje = new SpeechSynthesisUtterance(texto);
  if (idioma === "es") {
    mensaje.lang = vozEspanol ? vozEspanol.lang : "es-CO";
    mensaje.voice = vozEspanol;
    mensaje.rate = 0.95;
  } else {
    mensaje.lang = vozIngles ? vozIngles.lang : "en-US";
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

  speechSynthesis.cancel(); // que no se mezcle la voz de la app con la tuya

  const grabacion = new Reconocimiento();
  grabacion.lang = "en-US";
  grabacion.interimResults = false; // solo queremos el resultado final
  grabacion.maxAlternatives = 3;    // pedimos 3 posibles interpretaciones

  grabacionActual = grabacion;
  boton.classList.add("grabando");
  boton.textContent = "⏹ Detener";
  resultado.hidden = false;
  resultado.className = "resultado";
  resultado.textContent = "Habla ahora…";

  grabacion.onresult = (evento) => {
    // Revisamos las alternativas y nos quedamos con la de mejor puntaje
    const alternativas = Array.from(evento.results[0]);
    let mejorTexto = "";
    let mejorPuntaje = -1;
    alternativas.forEach((alternativa) => {
      const puntaje = calcularPuntaje(fraseOriginal, alternativa.transcript);
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejorTexto = alternativa.transcript;
      }
    });
    mostrarResultado(resultado, mejorPuntaje, mejorTexto);
  };

  grabacion.onerror = (evento) => {
    resultado.className = "resultado mal";
    if (evento.error === "not-allowed" || evento.error === "service-not-allowed") {
      resultado.textContent =
        "No tengo permiso para usar el micrófono. Revisa los permisos de Safari" +
        (estaInstalada() ? " o abre la app desde Safari en vez de la pantalla de inicio." : ".");
    } else if (evento.error === "no-speech") {
      resultado.textContent = "No te escuché. Toca 🎤 Repetir e inténtalo otra vez.";
    } else {
      resultado.textContent = "Hubo un problema con el micrófono (" + evento.error + ").";
    }
  };

  grabacion.onend = () => {
    grabacionActual = null;
    boton.classList.remove("grabando");
    boton.textContent = "🎤 Repetir";
    if (resultado.textContent === "Habla ahora…") {
      resultado.textContent = "No te escuché. Toca 🎤 Repetir e inténtalo otra vez.";
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
  speechSynthesis.cancel();
  if (grabacionActual) grabacionActual.stop();
  mostrarInicio();
});

// Registramos el "service worker" para que la app funcione sin internet.
// Solo funciona en https:// o en localhost.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

mostrarInicio();
