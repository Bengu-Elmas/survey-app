import { useEffect, useState } from "react";

function CreateSurvey() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [publishMessage, setPublishMessage] = useState("");

  // Yayınlandı mesajını 2 saniye sonra kaldırır.
  useEffect(() => {
    if (publishMessage === "") {
      return;
    }

    const timer = setTimeout(() => {
      setPublishMessage("");
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [publishMessage]);

  // Yeni soru ekler.
  function handleAddQuestion() {
    const newQuestion = {
      id: `question-${Date.now()}`,
      text: "",
      type: "text",
      required: false,
    };

    setQuestions([...questions, newQuestion]);
  }

  // Soru metnini değiştirir.
  function handleQuestionChange(questionId, newText) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId ? { ...question, text: newText } : question,
      ),
    );
  }

  // Soruyu siler.
  function handleDeleteQuestion(questionId) {
    setQuestions(questions.filter((question) => question.id !== questionId));
  }

  // Zorunluluk durumunu değiştirir.
  function handleRequiredChange(questionId) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              required: !question.required,
            }
          : question,
      ),
    );
  }

  // Soru türünü değiştirir.
  function handleQuestionTypeChange(questionId, newType) {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        // Çoktan seçmeliye geçilirse başlangıç seçenekleri oluştur.
        if (newType === "multiple-choice") {
          return {
            ...question,
            type: newType,
            options: question.options || ["", ""],
          };
        }

        // Puanlamaya geçilirse varsayılan max değer 10 olsun.
        if (newType === "rating") {
          return {
            ...question,
            type: newType,
            maxRating: question.maxRating || 10,
          };
        }

        return {
          ...question,
          type: newType,
        };
      }),
    );
  }

  // Puanlama maksimum değerini değiştirir.
  function handleMaxRatingChange(questionId, newMaxRating) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              maxRating: Number(newMaxRating),
            }
          : question,
      ),
    );
  }

  // Çoktan seçmeli seçeneğin metnini değiştirir.
  function handleOptionChange(questionId, optionIndex, newValue) {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const updatedOptions = [...(question.options || [])];

        updatedOptions[optionIndex] = newValue;

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );
  }

  // Yeni seçenek ekler.
  function handleAddOption(questionId) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [...(question.options || []), ""],
            }
          : question,
      ),
    );
  }

  // Seçenek siler.
  function handleDeleteOption(questionId, optionIndex) {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const updatedOptions = (question.options || []).filter(
          (_, index) => index !== optionIndex,
        );

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );
  }

  function handlePublish(event) {
    event.preventDefault();

    if (title.trim() === "") {
      setPublishMessage("Anket başlığı boş bırakılamaz.");
      return;
    }

    if (questions.length === 0) {
      setPublishMessage("Ankete en az bir soru eklemelisiniz.");
      return;
    }

    const newSurvey = {
      id: `survey-${Date.now()}`,
      title,
      description,
      status: "Yayında",
      questionCount: questions.length,
      responseCount: 0,
      completionRate: 0,
      questions,
    };

    console.log("Yeni oluşturulan anket:", newSurvey);

    setPublishMessage("Anket başarıyla yayınlandı.");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="font-stack-notch text-sm font-semibold text-amber-700">
            YENİ ANKET
          </p>

          <h1 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
            Anket Oluştur
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Anket başlığını belirle, sorularını ekle ve yayınlamaya hazır hale
            getir.
          </p>
        </div>

        <form
          onSubmit={handlePublish}
          className="mt-7 space-y-7 rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-7 shadow-xl shadow-amber-200/30"
        >
          {/* BAŞLIK */}

          <div>
            <label
              htmlFor="survey-title"
              className="font-stack-notch mb-2 block text-xl font-bold text-amber-950"
            >
              Anket başlığı
            </label>

            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örneğin: Müşteri Memnuniyeti Anketi"
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {/* AÇIKLAMA */}

          <div>
            <label
              htmlFor="survey-description"
              className="font-stack-notch mb-2 block text-xl font-bold text-amber-950"
            >
              Anket açıklaması
            </label>

            <textarea
              id="survey-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="4"
              placeholder="Anket hakkında kısa bir açıklama yazın..."
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {/* SORULAR */}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-stack-notch mb-2 block text-xl font-bold text-amber-950">
                  Anket Soruları
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {questions.length} soru eklendi
                </p>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-white p-10 text-center shadow-sm shadow-amber-100/50">
                <p className="font-stack-notch text-xl font-bold text-amber-950">
                  Henüz soru eklenmedi
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amber-900/70">
                  Anketini oluşturmaya başlamak için ilk sorunu ekleyebilirsin.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  {/* SORU BAŞLIĞI + SİL */}

                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor={`question-${question.id}`}
                      className="text-sm font-semibold text-slate-800"
                    >
                      {index + 1}. Soru
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded-md px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Soruyu Sil ×
                    </button>
                  </div>

                  {/* SORU METNİ */}

                  <input
                    id={`question-${question.id}`}
                    type="text"
                    value={question.text}
                    onChange={(event) =>
                      handleQuestionChange(question.id, event.target.value)
                    }
                    placeholder="Sorunuzu yazın..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />

                  {/* TÜR + ZORUNLULUK */}

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`question-type-${question.id}`}
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Soru türü
                      </label>

                      <select
                        id={`question-type-${question.id}`}
                        value={question.type}
                        onChange={(event) =>
                          handleQuestionTypeChange(
                            question.id,
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="text">Metin</option>

                        <option value="multiple-choice">Çoktan Seçmeli</option>

                        <option value="rating">Puanlama</option>

                        <option value="yes-no">Evet / Hayır</option>
                      </select>
                    </div>

                    <div>
                      <span className="mb-2 block text-sm font-semibold text-slate-800">
                        Zorunluluk
                      </span>

                      <label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-300 bg-white px-4">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={() => handleRequiredChange(question.id)}
                          className="h-4 w-4 cursor-pointer accent-indigo-600"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          Bu soru zorunlu
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* PUANLAMA */}

                  {question.type === "rating" && (
                    <div className="mt-4">
                      <label
                        htmlFor={`max-rating-${question.id}`}
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Maksimum puan
                      </label>

                      <select
                        id={`max-rating-${question.id}`}
                        value={question.maxRating || 10}
                        onChange={(event) =>
                          handleMaxRatingChange(question.id, event.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                      >
                        <option value="5">1 - 5</option>

                        <option value="10">1 - 10</option>
                      </select>
                    </div>
                  )}

                  {/* ÇOKTAN SEÇMELİ */}

                  {question.type === "multiple-choice" && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-semibold text-slate-800">
                        Seçenekler
                      </h3>

                      <div className="space-y-2">
                        {(question.options || []).map((option, optionIndex) => (
                          <div
                            key={`${question.id}-option-${optionIndex}`}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm font-semibold text-slate-500">
                              {optionIndex + 1}.
                            </span>

                            <input
                              type="text"
                              value={option}
                              onChange={(event) =>
                                handleOptionChange(
                                  question.id,
                                  optionIndex,
                                  event.target.value,
                                )
                              }
                              placeholder="Seçenek..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteOption(question.id, optionIndex)
                              }
                              className="rounded-lg px-3 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddOption(question.id)}
                        className="mt-3 rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        + Seçenek Ekle
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* YENİ SORU */}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-4 w-full rounded-lg border-2 border-dashed border-indigo-300 px-4 py-3 font-semibold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              + Yeni Soru Ekle
            </button>
          </section>

          {/* YAYINLA */}

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-[1.02] hover:bg-amber-900 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:scale-100"
          >
            Anketi Gönder
          </button>
        </form>

        {publishMessage && (
          <p
            className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${
              publishMessage.includes("başarıyla")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {publishMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default CreateSurvey;
