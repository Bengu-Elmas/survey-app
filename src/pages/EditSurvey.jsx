import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import surveys from "../data/surveys.js";

function EditSurvey() {
  const { surveyId } = useParams();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const [title, setTitle] = useState(selectedSurvey?.title || "");

  const [description, setDescription] = useState(
    selectedSurvey?.description || "",
  );

  const [questions, setQuestions] = useState(selectedSurvey?.questions || []);

  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!selectedSurvey) {
      return;
    }

    setTitle(selectedSurvey.title);
    setDescription(selectedSurvey.description);
    setQuestions(selectedSurvey.questions);
  }, [selectedSurvey]);

  useEffect(() => {
    if (saveMessage === "") {
      return;
    }

    const timer = setTimeout(() => {
      setSaveMessage("");
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [saveMessage]);

  function handleQuestionChange(questionId, newText) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId ? { ...question, text: newText } : question,
      ),
    );
  }

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

  function handleQuestionTypeChange(questionId, newType) {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              type: newType,
            }
          : question,
      ),
    );
  }

  function handleAddQuestion() {
    const newQuestion = {
      id: `question-${Date.now()}`,
      text: "",
      type: "text",
      required: false,
    };

    setQuestions([...questions, newQuestion]);
  }

  function handleDeleteQuestion(questionId) {
    setQuestions(questions.filter((question) => question.id !== questionId));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const updatedSurvey = {
      ...selectedSurvey,
      title,
      description,
      questions,
    };

    console.log(updatedSurvey);

    setSaveMessage("Değişiklikler kaydedildi.");
  }

  function handleOptionChange(questionId, optionIndex, newValue) {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = newValue;

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );
  }

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

  function handleDeleteOption(questionId, optionIndex) {
    setQuestions(
      questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const updatedOptions = question.options.filter(
          (_, index) => index !== optionIndex,
        );

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );
  }

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

  if (!selectedSurvey) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Anket bulunamadı
          </h1>

          <p className="mt-2 text-slate-600">
            Bu ID ile eşleşen bir anket bulunmuyor.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="font-stack-notch text-sm font-semibold text-amber-700">
            ANKET DÜZENLEME
          </p>

          <h1 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
            Anketi Düzenle
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-900">
            Anket ID: {surveyId}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-7 rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-7 shadow-xl shadow-amber-200/30"
        >
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
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

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
              rows="5"
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <section>
            <h2 className="font-stack-notch mb-4 text-xl font-bold text-amber-950">
              Anket Soruları
            </h2>

            <div className="space-y-5">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/70 p-5 shadow-md shadow-amber-100/50"
                >
                  {/* SORU BAŞLIĞI + SİL */}

                  <div className="mb-3 flex items-center justify-between">
                    <label
                      htmlFor={`question-${question.id}`}
                      className="font-stack-notch text-lg font-bold text-amber-950"
                    >
                      {index + 1}. Soru
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded-lg bg-amber-900 px-3 py-2 text-sm font-semibold text-amber-50 transition duration-200 hover:bg-amber-950"
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
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />

                  {/* SORU TÜRÜ + ZORUNLULUK */}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`question-type-${question.id}`}
                        className="font-stack-notch mb-1 block text-lg font-bold text-amber-950"
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
                        className="h-12 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      >
                        <option value="multiple-choice">Çoktan Seçmeli</option>
                        <option value="text">Metin</option>
                        <option value="rating">Puanlama</option>
                        <option value="yes-no">Evet / Hayır</option>
                      </select>
                    </div>

                    <div>
                      <span className="font-stack-notch mb-1 block text-lg font-bold text-amber-950">
                        Zorunluluk
                      </span>

                      <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 shadow-sm transition duration-200 hover:border-amber-400 hover:bg-amber-50">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={() => handleRequiredChange(question.id)}
                          className="h-4 w-4 cursor-pointer accent-amber-700"
                        />

                        <span className="text-sm font-medium text-amber-950">
                          Bu soru zorunlu
                        </span>
                      </label>
                    </div>

                    {/* PUANLAMA */}

                    {question.type === "rating" && (
                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`max-rating-${question.id}`}
                          className="font-stack-notch mb-1 block text-lg font-bold text-amber-950"
                        >
                          Maksimum puan
                        </label>

                        <select
                          id={`max-rating-${question.id}`}
                          value={question.maxRating || 10}
                          onChange={(event) =>
                            handleMaxRatingChange(
                              question.id,
                              event.target.value,
                            )
                          }
                          className="h-12 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        >
                          <option value="5">1 - 5</option>
                          <option value="10">1 - 10</option>
                        </select>
                      </div>
                    )}

                    {/* ÇOKTAN SEÇMELİ */}

                    {question.type === "multiple-choice" && (
                      <div className="sm:col-span-2">
                        <h4 className="font-stack-notch mb-2 text-lg font-bold text-amber-950">
                          Seçenekler
                        </h4>

                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div
                              key={`${question.id}-option-${optionIndex}`}
                              className="flex items-center gap-2"
                            >
                              <span className="w-5 text-center text-sm font-bold text-amber-700">
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
                                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteOption(question.id, optionIndex)
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-900 font-bold text-amber-50 transition duration-200 hover:bg-amber-950"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddOption(question.id)}
                          className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition duration-200 hover:border-amber-400 hover:bg-amber-100"
                        >
                          + Seçenek Ekle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* YENİ SORU */}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-5 w-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 px-4 py-3 font-semibold text-amber-800 transition duration-300 hover:border-amber-600 hover:bg-amber-100 hover:shadow-md"
            >
              + Yeni Soru Ekle
            </button>
          </section>
          <button
            type="submit"
            className="w-full rounded-2xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-[1.02] hover:bg-amber-900 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:scale-100"
          >
            Kaydet
          </button>
        </form>

        {saveMessage && (
          <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
            {saveMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default EditSurvey;
