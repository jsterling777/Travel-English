// ===== FRASES DE CADA ESCENARIO =====
// Las frases están en inglés británico (Reino Unido).
// Para agregar una frase, copia una línea { en: "...", es: "..." },
// pégala en el escenario que quieras y cambia los textos.
// El "id" de cada escenario debe ser único (se usa para guardar tu progreso).

const ESCENARIOS = [
  {
    id: "aeropuerto",
    nombre: "Aeropuerto",
    emoji: "✈️",
    frases: [
      { en: "Where is the check-in desk?", es: "¿Dónde está el mostrador de facturación?" },
      { en: "I would like a window seat, please.", es: "Quisiera un asiento junto a la ventana, por favor." },
      { en: "How many bags can I check in?", es: "¿Cuántas maletas puedo documentar?" },
      { en: "Where is gate twelve?", es: "¿Dónde está la puerta doce?" },
      { en: "Is the flight on time?", es: "¿El vuelo está a tiempo?" },
      { en: "My flight has been cancelled.", es: "Mi vuelo fue cancelado." },
      { en: "I have lost my luggage.", es: "Perdí mi equipaje." },
      { en: "I am here on holiday.", es: "Estoy aquí de vacaciones." },
      { en: "I am staying for two weeks.", es: "Me voy a quedar dos semanas." },
      { en: "Where can I get a taxi?", es: "¿Dónde puedo tomar un taxi?" },
    ],
  },
  {
    id: "hotel",
    nombre: "Hotel",
    emoji: "🏨",
    frases: [
      { en: "I have a booking.", es: "Tengo una reserva." },
      { en: "Do you have a room for tonight?", es: "¿Tiene una habitación para esta noche?" },
      { en: "What time is check-out?", es: "¿A qué hora es la salida?" },
      { en: "Is breakfast included?", es: "¿El desayuno está incluido?" },
      { en: "What is the Wi-Fi password?", es: "¿Cuál es la contraseña del wifi?" },
      { en: "Could I have another towel, please?", es: "¿Me podría dar otra toalla, por favor?" },
      { en: "The air conditioning is not working.", es: "El aire acondicionado no funciona." },
      { en: "Could you book a taxi for me?", es: "¿Me podría pedir un taxi?" },
      { en: "Can I leave my bags here?", es: "¿Puedo dejar mis maletas aquí?" },
      { en: "I would like to pay by card.", es: "Me gustaría pagar con tarjeta." },
    ],
  },
  {
    id: "restaurante",
    nombre: "Restaurante",
    emoji: "🍽️",
    frases: [
      { en: "A table for two, please.", es: "Una mesa para dos, por favor." },
      { en: "Could I see the menu, please?", es: "¿Podría ver la carta, por favor?" },
      { en: "What would you recommend?", es: "¿Qué me recomendaría?" },
      { en: "I will have the chicken, please.", es: "Voy a pedir el pollo, por favor." },
      { en: "I am allergic to nuts.", es: "Soy alérgico a las nueces." },
      { en: "Could I have a glass of tap water?", es: "¿Me podría dar un vaso de agua de la llave?" },
      { en: "No ice, please.", es: "Sin hielo, por favor." },
      { en: "This is delicious.", es: "Esto está delicioso." },
      { en: "Could we have the bill, please?", es: "¿Nos trae la cuenta, por favor?" },
      { en: "Is service included?", es: "¿El servicio está incluido?" },
    ],
  },
];
