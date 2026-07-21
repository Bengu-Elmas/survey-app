const surveys = [
  {
    id: "survey-1",

    title: "Müşteri Memnuniyeti Anketi",

    description:
      "Müşterilerin ürün ve hizmetler hakkındaki görüşlerini ölçmek için hazırlanmıştır.",

    status: "Yayında",

    questionCount: 3,

    responseCount: 47,

    completionRate: 73,

    questions: [
      {
        id: "survey-1-question-1",

        text: "Ürünü nasıl değerlendirirsiniz?",

        type: "rating",

        required: true,
      },

      {
        id: "survey-1-question-2",

        text: "Bizi başka kişilere tavsiye eder misiniz?",

        type: "yes-no",

        required: true,
      },

      {
        id: "survey-1-question-3",

        text: "Ürünün en beğendiğiniz özelliği nedir?",

        type: "multiple-choice",

        required: false,

        options: ["Kullanım kolaylığı", "Fiyat performans", "Müşteri desteği"],
      },
    ],
  },

  {
    id: "survey-2",

    title: "Çalışan Bağlılık Anketi",

    description:
      "Çalışanların şirkete ve çalışma ortamına ilişkin görüşlerini ölçmek için hazırlanmıştır.",

    status: "Taslak",

    questionCount: 3,

    responseCount: 0,

    completionRate: 0,

    questions: [
      {
        id: "survey-2-question-1",

        text: "Şirket içinde kendinizi değerli hissediyor musunuz?",

        type: "yes-no",

        required: true,
      },

      {
        id: "survey-2-question-2",

        text: "Çalışma ortamını nasıl değerlendirirsiniz?",

        type: "rating",

        required: false,
      },

      {
        id: "survey-2-question-3",

        text: "Çalışma ortamıyla ilgili görüşlerinizi paylaşır mısınız?",

        type: "text",

        required: false,
      },
    ],
  },
];

export default surveys;
