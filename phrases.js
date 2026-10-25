// ===== FRASES DE CADA ESCENARIO =====
// Para agregar una frase, copia una línea { en: "...", es: "..." },
// pégala en el escenario que quieras y cambia los textos.
// El "id" de cada escenario debe ser único (se usa para guardar tu progreso).

const ESCENARIOS = [
  {
    id: "aeropuerto",
    nombre: "Aeropuerto",
    emoji: "✈️",
    frases: [
      { en: "Where is the check-in counter?", es: "¿Dónde está el mostrador de facturación?" },
      { en: "I would like a window seat, please.", es: "Quisiera un asiento junto a la ventana, por favor." },
      { en: "How many bags can I check?", es: "¿Cuántas maletas puedo documentar?" },
      { en: "Where is gate twelve?", es: "¿Dónde está la puerta doce?" },
      { en: "Is the flight on time?", es: "¿El vuelo está a tiempo?" },
      { en: "My flight was canceled.", es: "Mi vuelo fue cancelado." },
      { en: "I lost my luggage.", es: "Perdí mi equipaje." },
      { en: "I am here on vacation.", es: "Estoy aquí de vacaciones." },
      { en: "I will stay for two weeks.", es: "Me quedaré dos semanas." },
      { en: "Where can I get a taxi?", es: "¿Dónde puedo tomar un taxi?" },
    ],
  },
  {
    id: "hotel",
    nombre: "Hotel",
    emoji: "🏨",
    frases: [
      { en: "I have a reservation.", es: "Tengo una reservación." },
      { en: "Do you have a room for tonight?", es: "¿Tiene una habitación para esta noche?" },
      { en: "What time is check-out?", es: "¿A qué hora es la salida?" },
      { en: "Is breakfast included?", es: "¿El desayuno está incluido?" },
      { en: "What is the Wi-Fi password?", es: "¿Cuál es la contraseña del wifi?" },
      { en: "Can I have another towel, please?", es: "¿Me puede dar otra toalla, por favor?" },
      { en: "The air conditioning is not working.", es: "El aire acondicionado no funciona." },
      { en: "Can you call a taxi for me?", es: "¿Me puede pedir un taxi?" },
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
      { en: "Can I see the menu, please?", es: "¿Puedo ver el menú, por favor?" },
      { en: "What do you recommend?", es: "¿Qué me recomienda?" },
      { en: "I would like the chicken, please.", es: "Quisiera el pollo, por favor." },
      { en: "I am allergic to nuts.", es: "Soy alérgico a las nueces." },
      { en: "Can I have a glass of water?", es: "¿Me puede dar un vaso de agua?" },
      { en: "No ice, please.", es: "Sin hielo, por favor." },
      { en: "This is delicious.", es: "Esto está delicioso." },
      { en: "Can we have the check, please?", es: "¿Nos trae la cuenta, por favor?" },
      { en: "Is the tip included?", es: "¿La propina está incluida?" },
    ],
  },
];
