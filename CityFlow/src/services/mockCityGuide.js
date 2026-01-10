// src/services/mockCityGuide.js

export const CLUJ_ITINERARIES = {
  "classic": {
    id: "cluj_classic",
    title: "🏰 Clujul Istoric & Medieval",
    subtitle: "Descoperă inima Transilvaniei",
    duration: "6 ore • Mers pe jos",
    description: "Un traseu complet prin centrul vechi, ideal pentru prima zi în oraș.",
    stops: [
      {
        time: "10:00",
        title: "Piața Unirii",
        info: "Punctul zero si una dintre cele mai apreciate zone din oras",
        icon: "map",
        color: "#5C6BC0"
      },
      {
        time: "11:30",
        title: "Piața Muzeului",
        info: "Cea mai veche piață pietonală. Perfectă pentru poze instagramabile.",
        icon: "camera",
        color: "#AB47BC"
      },
      {
        time: "13:00",
        title: "Prânz la Casa Boema",
        info: "Trebuie să încerci celebrele mancaruri traditionale romanesti.",
        icon: "restaurant",
        color: "#EF5350"
      },
      {
        time: "15:00",
        title: "Bastionul Croitorilor",
        info: "Zidul vechi al cetății. Intrare gratuită.",
        icon: "shield",
        color: "#FFA726"
      }
    ]
  },
  "relax": {
    id: "cluj_relax",
    title: "🍃 Clujul Verde & Chill",
    subtitle: "O zi de relaxare totală",
    duration: "4 ore • Relaxare",
    description: "Dacă vrei să eviți agitația și să te bucuri de natură urbană.",
    stops: [
      {
        time: "11:00",
        title: "Grădina Botanică",
        info: "Vizitează Grădina Japoneză și Serele tropicale.",
        icon: "leaf",
        color: "#66BB6A"
      },
      {
        time: "13:30",
        title: "Cafea la Meron / Yume",
        info: "Clujul e faimos pentru specialty coffee. Ia o pauză.",
        icon: "cafe",
        color: "#8D6E63"
      },
      {
        time: "15:00",
        title: "Parcul Central & Hamace",
        info: "Închiriază o barcă pe lac sau stai în hamac lângă Casino.",
        icon: "boat",
        color: "#29B6F6"
      }
    ]
  }
};


export const getCityGuide = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("relax") || lowerText.includes("verde") || lowerText.includes("liniste")) {
    return CLUJ_ITINERARIES["relax"];
  }
  

  return CLUJ_ITINERARIES["classic"];
};