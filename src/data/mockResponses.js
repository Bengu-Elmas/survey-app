const firstNames = [
  "Aylin",
  "Mert",
  "Selin",
  "Emre",
  "Derya",
  "Kerem",
  "Elif",
  "Can",
  "Zeynep",
  "Bora",
];

const lastNames = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Şahin",
  "Çelik",
  "Arslan",
  "Aydın",
  "Koç",
  "Kurt",
  "Öztürk",
];

const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir"];

const ratingValues = [8, 9, 7, 10, 8, 6, 9, 8, 7, 10];

const optionValues = [
  "Kullanım kolaylığı",
  "Kullanım kolaylığı",
  "Fiyat performans",
  "Kullanım kolaylığı",
  "Müşteri desteği",
  "Fiyat performans",
  "Kullanım kolaylığı",
  "Müşteri desteği",
  "Kullanım kolaylığı",
  "Fiyat performans",
];

const survey1Responses = Array.from({ length: 47 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];

  const lastName = lastNames[index % lastNames.length];

  return {
    id: `response-${index + 1}`,

    participant: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      city: cities[index % cities.length],

      // Firebase + Random User bağlandığında
      // buraya gerçek avatar gelecek.
      avatar: "",
    },

    answers: {
      "survey-1-question-1": ratingValues[index % ratingValues.length],

      "survey-1-question-2": index % 6 === 0 ? "Hayır" : "Evet",

      "survey-1-question-3": optionValues[index % optionValues.length],
    },

    submittedAt: new Date(Date.now() - index * 37 * 60 * 1000).toISOString(),
  };
});

const mockResponses = {
  "survey-1": survey1Responses,

  // Taslak anket olduğu için henüz yanıt yok.
  "survey-2": [],
};

export default mockResponses;
