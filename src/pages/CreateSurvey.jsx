import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";

import FeedbackModal from "../components/FeedbackModal.jsx";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* SÜRÜKLENEBİLİR SORU KARTI */
function SortableQuestion({ id, index, onDelete, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/70 p-5 shadow-md shadow-amber-100/50 ${
        isDragging ? "relative z-10 opacity-70 shadow-xl" : ""
      }`}
    >
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <label
          htmlFor={`question-${id}`}
          className="font-stack-notch text-lg font-bold text-amber-950"
        >
          {index + 1}. Soru
        </label>

        <button
          ref={setActivatorNodeRef}
          type="button"
          {...listeners}
          aria-label="Soruyu sürükle"
          className="flex touch-none cursor-grab select-none items-center gap-2 rounded-xl px-3 py-2 text-amber-900 transition duration-200 hover:bg-amber-100 active:cursor-grabbing"
        >
          <img
            src="/dragicon.svg"
            alt=""
            draggable="false"
            className="pointer-events-none h-7 w-7"
          />

          <span className="font-stack-notch pointer-events-none text-sm font-bold">
            Soruyu Sürükle
          </span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          className="justify-self-end rounded-lg bg-amber-900 px-3 py-2 text-sm font-semibold text-amber-50 transition duration-200 hover:bg-amber-950"
        >
          Soruyu Sil ×
        </button>
      </div>

      {children}
    </div>
  );
}

function CreateSurvey() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  function showFeedback(type, feedbackTitle, message) {
    setFeedback({
      isOpen: true,
      type,
      title: feedbackTitle,
      message,
    });
  }

  function closeFeedback() {
    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      isOpen: false,
    }));
  }

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
        question.id === questionId
          ? {
              ...question,
              text: newText,
            }
          : question,
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

        if (newType === "multiple-choice") {
          return {
            ...question,
            type: newType,
            options: question.options || ["", ""],
          };
        }

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

  // Kart bırakıldığında soruların yeni sırasını belirler.
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setQuestions((currentQuestions) => {
      const oldIndex = currentQuestions.findIndex(
        (question) => question.id === active.id,
      );

      const newIndex = currentQuestions.findIndex(
        (question) => question.id === over.id,
      );

      return arrayMove(currentQuestions, oldIndex, newIndex);
    });
  }

  // Taslak olarak kaydeder.
  async function handleSaveDraft() {
    if (isSaving) {
      return;
    }

    const draftSurvey = {
      title: title.trim() || "İsimsiz Anket",
      description,
      status: "Taslak",
      questionCount: questions.length,
      responseCount: 0,
      completionRate: 0,
      questions,
    };

    try {
      setIsSaving(true);

      const docRef = await addDoc(collection(db, "surveys"), draftSurvey);

      console.log("Taslak Firebase'e kaydedildi:", docRef.id);

      showFeedback(
        "success",
        "Taslak kaydedildi!",
        "Anket başarıyla taslak olarak kaydedildi. Ana sayfaya yönlendiriliyorsunuz...",
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Taslak kaydedilirken hata oluştu:", error);

      showFeedback(
        "error",
        "Taslak kaydedilemedi",
        "Taslak kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Anketi yayınlar.
  async function handlePublish(event) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (title.trim() === "") {
      showFeedback(
        "warning",
        "Anket başlığı gerekli",
        "Anketi yayınlamadan önce bir başlık yazmalısınız.",
      );

      return;
    }

    if (questions.length === 0) {
      showFeedback(
        "warning",
        "Henüz soru eklenmedi",
        "Anketi yayınlayabilmek için en az bir soru eklemelisiniz.",
      );

      return;
    }

    const newSurvey = {
      title: title.trim(),
      description,
      status: "Yayında",
      questionCount: questions.length,
      responseCount: 0,
      completionRate: 0,
      questions,
    };

    try {
      setIsSaving(true);

      const docRef = await addDoc(collection(db, "surveys"), newSurvey);

      console.log("Anket Firebase'e kaydedildi:", docRef.id);

      showFeedback(
        "success",
        "Anket yayınlandı!",
        "Anket başarıyla yayınlandı. Ana sayfaya yönlendiriliyorsunuz...",
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Anket kaydedilirken hata oluştu:", error);

      showFeedback(
        "error",
        "Anket yayınlanamadı",
        "Anket yayınlanırken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* FEEDBACK MODAL */}

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closeFeedback}
      />

      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div>
            <p className="font-stack-notch text-sm font-semibold text-amber-700">
              YENİ ANKET
            </p>

            <h1 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
              Anket Oluştur
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-700">
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

                  <p className="mt-1 text-sm font-medium text-slate-700">
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
                    Anketini oluşturmaya başlamak için ilk sorunu
                    ekleyebilirsin.
                  </p>
                </div>
              )}

              {/* DRAG & DROP */}

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((question) => question.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-5">
                    {questions.map((question, index) => (
                      <SortableQuestion
                        key={question.id}
                        id={question.id}
                        index={index}
                        onDelete={handleDeleteQuestion}
                      >
                        {/* SORU METNİ */}

                        <input
                          id={`question-${question.id}`}
                          type="text"
                          value={question.text}
                          onChange={(event) =>
                            handleQuestionChange(
                              question.id,
                              event.target.value,
                            )
                          }
                          placeholder="Sorunuzu yazın..."
                          className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        />

                        {/* TÜR + ZORUNLULUK */}

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                              <option value="text">Metin</option>

                              <option value="multiple-choice">
                                Çoktan Seçmeli
                              </option>

                              <option value="rating">Puanlama</option>

                              <option value="yes-no">Evet / Hayır</option>
                            </select>
                          </div>

                          <div>
                            <span className="font-stack-notch text-lg font-bold text-amber-950">
                              Zorunluluk
                            </span>

                            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 shadow-sm transition duration-200 hover:border-amber-400 hover:bg-amber-50">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={() =>
                                  handleRequiredChange(question.id)
                                }
                                className="h-4 w-4 cursor-pointer accent-amber-700"
                              />

                              <span className="text-sm font-medium text-amber-950">
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
                              className="font-stack-notch text-lg font-bold text-amber-950"
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
                              className="mt-1 h-12 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-950 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                            >
                              <option value="5">1 - 5</option>
                              <option value="10">1 - 10</option>
                            </select>
                          </div>
                        )}

                        {/* ÇOKTAN SEÇMELİ */}

                        {question.type === "multiple-choice" && (
                          <div className="mt-4">
                            <h3 className="font-stack-notch text-lg font-bold text-amber-950">
                              Seçenekler
                            </h3>

                            <div className="space-y-2">
                              {(question.options || []).map(
                                (option, optionIndex) => (
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
                                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteOption(
                                          question.id,
                                          optionIndex,
                                        )
                                      }
                                      className="rounded-lg bg-amber-900 px-3 py-2 text-sm font-semibold text-amber-50 transition duration-200 hover:bg-amber-950"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ),
                              )}
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
                      </SortableQuestion>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* YENİ SORU */}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="mt-5 w-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 px-4 py-3 font-semibold text-amber-800 transition duration-300 hover:border-amber-600 hover:bg-amber-100 hover:shadow-md"
              >
                + Yeni Soru Ekle
              </button>
            </section>

            {/* KAYDET / YAYINLA */}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="w-full rounded-2xl border-2 border-amber-800 bg-amber-50 px-5 py-4 font-semibold text-amber-900 transition duration-300 hover:scale-[1.02] hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-2xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-[1.02] hover:bg-amber-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Kaydediliyor..." : "Anketi Yayınla"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default CreateSurvey;
