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
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Anketi Düzenle</h1>

        <p className="mt-2 text-sm text-slate-500">Anket ID: {surveyId}</p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="survey-title"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Anket başlığı
            </label>

            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label
              htmlFor="survey-description"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Anket açıklaması
            </label>

            <textarea
              id="survey-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="5"
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Anket Soruları
            </h2>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
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
                      Soruyu Sil x
                    </button>
                  </div>

                  <input
                    id={`question-${question.id}`}
                    type="text"
                    value={question.text}
                    onChange={(event) =>
                      handleQuestionChange(question.id, event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />

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
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="multiple-choice">Çoktan Seçmeli</option>

                        <option value="text">Metin</option>

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
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          Bu soru zorunlu
                        </span>
                      </label>
                    </div>

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
                            handleMaxRatingChange(
                              question.id,
                              event.target.value,
                            )
                          }
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="5">1 - 5</option>
                          <option value="10">1 - 10</option>
                        </select>
                      </div>
                    )}
                    {question.type === "multiple-choice" && (
                      <div className="mt-4">
                        <h4 className="mb-2 text-sm font-semibold text-slate-800">
                          Seçenekler
                        </h4>

                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
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
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-4 w-full rounded-lg border-2 border-dashed border-indigo-300 px-4 py-3 font-semibold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              + Yeni Soru Ekle
            </button>
          </section>

          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
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
