"""
GENERADOR DE AUDIOS
===================
Lee las frases de phrases.js y crea un archivo de audio por cada una,
usando las voces instaladas en tu Mac (comando "say").

Crea tres versiones de cada frase:
  audio/en/     -> inglés a velocidad normal
  audio/lento/  -> inglés lento
  audio/es/     -> traducción en español

Cómo usarlo (desde la carpeta del proyecto, en la Terminal):
  python3 herramientas/generar_audios.py

Para cambiar la voz, edita VOZ_INGLES o VOZ_ESPANOL abajo.
Para ver qué voces tienes:  say -v '?'
"""

import os
import re
import subprocess
import tempfile
import unicodedata

# --- Configuración ---
VOZ_INGLES = "Daniel"     # voz del Reino Unido (en_GB)
VOZ_ESPANOL = "Paulina"   # voz de mujer latina (es_MX)
VELOCIDAD_NORMAL = 165    # palabras por minuto
VELOCIDAD_LENTA = 110
# Algunas voces (como Daniel) casi no cambian de velocidad, así que en la
# versión lenta además ponemos una pequeña pausa entre palabras (en milisegundos)
PAUSA_LENTA_MS = 180

CARPETA_PROYECTO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA_AUDIO = os.path.join(CARPETA_PROYECTO, "audio")


def nombre_de_audio(texto):
    """Convierte una frase en un nombre de archivo.
    "¿Dónde está?" -> "donde-esta"
    IMPORTANTE: app.js hace exactamente lo mismo (función nombreDeAudio)."""
    sin_acentos = "".join(
        letra for letra in unicodedata.normalize("NFD", texto)
        if unicodedata.category(letra) != "Mn"
    )
    return re.sub(r"[^a-z0-9]+", "-", sin_acentos.lower()).strip("-")


def leer_frases():
    """Saca de phrases.js todas las frases { en: "...", es: "..." }."""
    with open(os.path.join(CARPETA_PROYECTO, "phrases.js"), encoding="utf-8") as archivo:
        contenido = archivo.read()
    encontradas = re.findall(r'\{\s*en:\s*"(.*?)",\s*es:\s*"(.*?)"\s*\}', contenido)
    # Ignoramos el ejemplo { en: "...", es: "..." } del comentario (no tiene letras)
    return [(en, es) for en, es in encontradas if nombre_de_audio(en)]


def grabar(texto, voz, velocidad, destino):
    """Graba el texto con la voz del Mac y lo guarda como .m4a (AAC, pequeño)."""
    with tempfile.TemporaryDirectory() as temporal:
        aiff = os.path.join(temporal, "voz.aiff")
        subprocess.run(["say", "-v", voz, "-r", str(velocidad), "-o", aiff, texto], check=True)
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", "-c", "1", aiff, destino],
            check=True,
        )


def main():
    frases = leer_frases()
    archivos = []

    for en, es in frases:
        # "[[slnc 180]]" es un comando de "say" que agrega 180 ms de silencio
        pausa = " [[slnc " + str(PAUSA_LENTA_MS) + "]] "
        en_lento = pausa.join(en.split())
        trabajos = [
            # (carpeta, texto que se lee, nombre del archivo, voz, velocidad)
            ("en", en, en, VOZ_INGLES, VELOCIDAD_NORMAL),
            ("lento", en_lento, en, VOZ_INGLES, VELOCIDAD_LENTA),
            ("es", es, es, VOZ_ESPANOL, VELOCIDAD_NORMAL),
        ]
        for carpeta, texto, nombre, voz, velocidad in trabajos:
            os.makedirs(os.path.join(CARPETA_AUDIO, carpeta), exist_ok=True)
            ruta = "audio/" + carpeta + "/" + nombre_de_audio(nombre) + ".m4a"
            grabar(texto, voz, velocidad, os.path.join(CARPETA_PROYECTO, ruta))
            archivos.append(ruta)
            print("✓", ruta)

    # info.js le dice a la app (y al service worker) qué voces y archivos hay
    lista = ",\n    ".join('"' + ruta + '"' for ruta in archivos)
    with open(os.path.join(CARPETA_AUDIO, "info.js"), "w", encoding="utf-8") as archivo:
        archivo.write(
            "// Archivo creado por herramientas/generar_audios.py: no lo edites a mano.\n"
            "const INFO_AUDIOS = {\n"
            '  vozIngles: "' + VOZ_INGLES + '",\n'
            '  vozEspanol: "' + VOZ_ESPANOL + '",\n'
            "  archivos: [\n    " + lista + ",\n  ],\n"
            "};\n"
        )

    print("\nListo:", len(archivos), "audios de", len(frases), "frases.")


main()
