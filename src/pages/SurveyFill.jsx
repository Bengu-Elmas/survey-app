import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase.js";

function SurveyFill() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyLoading, setSurveyLoading] = useState(true);

  const questions = selectedSurvey?.questions || [];

  const [selectedOptions, setSelectedOptions] = useState({});
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const [participantForm, setParticipantForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
  });

  const [participant, setParticipant] = useState(null);
  const [participantError, setParticipantError] = useState("");
  const [participantModalOpen, setParticipantModalOpen] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ANKETİ FIREBASE'DEN AL */

  useEffect(() => {
    async function fetchSurvey() {
      try {
        setSurveyLoading(true);

        const surveyRef = doc(db, "surveys", surveyId);
        const surveySnapshot = await getDoc(surveyRef);

        if (surveySnapshot.exists()) {
          setSelectedSurvey({
            id: surveySnapshot.id,
            ...surveySnapshot.data(),
          });
        } else {
          setSelectedSurvey(null);
        }
      } catch (error) {
        console.error("Anket alınırken hata oluştu:", error);
        setSelectedSurvey(null);
      } finally {
        setSurveyLoading(false);
      }
    }

    fetchSurvey();
  }, [surveyId]);

  /* ANKET DEĞİŞİNCE CEVAPLARI TEMİZLE */

  useEffect(() => {
    setAnswers({});
    setErrors({});
    setSelectedOptions({});

    setParticipantForm({
      firstName: "",
      lastName: "",
      city: "",
    });

    setParticipant(null);
    setParticipantError("");
    setParticipantModalOpen(true);
  }, [surveyId]);

  /* KATILIMCI BİLGİLERİ */

  function handleParticipantFormChange(event) {
    const { name, value } = event.target;

    setParticipantForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setParticipantError("");
  }

  function handleParticipantSubmit(event) {
    event.preventDefault();

    const cleanFirstName = participantForm.firstName.trim();
    const cleanLastName = participantForm.lastName.trim();
    const cleanCity = participantForm.city.trim();

    if (!cleanFirstName || !cleanLastName || !cleanCity) {
      setParticipantError(
        "Ankete Başlamadan Önce Ad, Soyad ve Şehir Alanlarını Doldurmalısınız !",
      );

      return;
    }

    setParticipant({
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName: `${cleanFirstName} ${cleanLastName}`,
      city: cleanCity,
      avatar: null,
    });

    setParticipantError("");
    setParticipantModalOpen(false);
  }

  /* CEVAP KONTROLÜ */

  function isAnswered(question, answer) {
    if (question.type === "text") {
      return typeof answer === "string" && answer.trim() !== "";
    }

    return answer !== undefined && answer !== null && answer !== "";
  }

  function handleAnswerChange(questionId, value) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [questionId]: "",
    }));
  }

  /* İLERLEME ORANI */

  const answeredQuestionCount = questions.filter((question) =>
    isAnswered(question, answers[question.id]),
  ).length;

  const progress =
    questions.length > 0
      ? Math.round((answeredQuestionCount / questions.length) * 100)
      : 0;

  /* ANKETİ GÖNDER */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedSurvey || selectedSurvey.status !== "Yayında") {
      console.error("Taslak durumundaki ankete yanıt gönderilemez.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    const newErrors = {};

    questions.forEach((question) => {
      if (question.required && !isAnswered(question, answers[question.id])) {
        newErrors[question.id] = "Bu soru zorunludur.";
      }
    });

    setErrors(newErrors);

    const firstErrorQuestionId = Object.keys(newErrors)[0];

    if (firstErrorQuestionId) {
      setTimeout(() => {
        const questionElement = document.getElementById(
          `question-${firstErrorQuestionId}`,
        );

        questionElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        questionElement?.focus();
      }, 0);

      return;
    }

    if (!participant) {
      setParticipantError(
        "Anketi Göndermeden önce Katılımcı Bilgilerini Tamamlamalısınız !",
      );

      setParticipantModalOpen(true);
      return;
    }

    if (!selectedSurvey || questions.length === 0) {
      return;
    }

    /*
      Bu katılımcının anketi yüzde kaç
      tamamladığını hesaplıyoruz.
    */

    const currentAnsweredQuestionCount = questions.filter((question) =>
      isAnswered(question, answers[question.id]),
    ).length;

    const currentResponseCompletion = Math.round(
      (currentAnsweredQuestionCount / questions.length) * 100,
    );

    /*
      Firestore'a kaydedilecek response.
    */

    const surveyResponse = {
      surveyId: selectedSurvey.id,
      surveyOwnerId: selectedSurvey.ownerId,

      participant: {
        firstName: participant.firstName,
        lastName: participant.lastName,
        fullName: participant.fullName,
        city: participant.city,
        avatar: participant.avatar,
      },

      answers,

      submittedAt: serverTimestamp(),
    };

    const surveyRef = doc(db, "surveys", surveyId);

    /*
      addDoc yerine burada ID'yi önceden
      oluşturuyoruz çünkü response ve survey
      güncellemesini aynı transaction içinde
      yapacağız.
    */

    const responseRef = doc(collection(db, "responses"));

    try {
      setIsSubmitting(true);

      await runTransaction(db, async (transaction) => {
        /*
          Firestore'daki anketin EN GÜNCEL
          halini transaction içinde okuyoruz.
        */

        const latestSurveySnapshot = await transaction.get(surveyRef);

        if (!latestSurveySnapshot.exists()) {
          throw new Error("Anket bulunamadı.");
        }

        const latestSurveyData = latestSurveySnapshot.data();

        const currentResponseCount =
          Number(latestSurveyData.responseCount) || 0;

        const currentCompletionRate =
          Number(latestSurveyData.completionRate) || 0;

        const newResponseCount = currentResponseCount + 1;

        /*
          Önceki tamamlanma ortalaması ile
          yeni katılımcının oranını birleştiriyoruz.
        */

        const newCompletionRate = Math.round(
          (currentCompletionRate * currentResponseCount +
            currentResponseCompletion) /
            newResponseCount,
        );

        /*
          RESPONSE KAYDI
        */

        transaction.set(responseRef, surveyResponse);

        /*
          SURVEY İSTATİSTİKLERİNİ GÜNCELLE
        */

        transaction.update(surveyRef, {
          responseCount: newResponseCount,
          completionRate: newCompletionRate,
        });
      });

      console.log("Anket yanıtı Firebase'e kaydedildi:", responseRef.id);

      console.log("Tamamlanma oranı:", currentResponseCompletion);

      navigate(`/thank-you/${surveyId}`);
    } catch (error) {
      console.error("Anket yanıtı kaydedilirken hata oluştu:", error);

      setIsSubmitting(false);
    }
  }

  /* YÜKLENİYOR */

  if (surveyLoading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <p className="text-slate-700">Anket yükleniyor...</p>
        </div>
      </main>
    );
  }

  /* ANKET BULUNAMADI */

  if (!selectedSurvey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <p className="text-sm font-bold tracking-[0.2em] text-amber-700">
            ANKETE ULAŞILAMADI
          </p>

          <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 md:text-5xl">
            Anket bulunamadı
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-amber-900/70">
            Bu bağlantıya ait bir anket bulunmuyor. Anket silinmiş veya bağlantı
            artık geçerli olmayabilir.
          </p>
        </div>
      </main>
    );
  }

  /* TASLAK ANKET */

  if (selectedSurvey.status !== "Yayında") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <p className="text-sm font-bold tracking-[0.2em] text-amber-700">
            ANKET HENÜZ YAYINDA DEĞİL
          </p>

          <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 md:text-5xl">
            Bu anket şu anda taslak durumda
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-amber-900/70">
            Bu ankete şu anda yanıt verilemiyor. Anket yayınlandığında
            katılımcılar yanıt gönderebilir.
          </p>
        </div>
      </main>
    );
  }
  return (
    <>
      {participantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-modal-title"
            className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <p className="font-stack-notch text-sm font-bold tracking-[0.15em] text-amber-700">
              KATILIMCI BİLGİLERİ
            </p>

            <h2
              id="participant-modal-title"
              className="font-stack-notch mt-2 text-3xl font-bold text-amber-950"
            >
              Ankete Başlamadan Önce
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Yanıtlarınızla birlikte saklanacak temel bilgilerinizi girin.
            </p>

            <form onSubmit={handleParticipantSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="participant-first-name"
                    className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                  >
                    AD
                  </label>

                  <input
                    id="participant-first-name"
                    name="firstName"
                    type="text"
                    value={participantForm.firstName}
                    onChange={handleParticipantFormChange}
                    maxLength={50}
                    autoComplete="given-name"
                    placeholder="Adınız"
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="participant-last-name"
                    className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                  >
                    SOYAD
                  </label>

                  <input
                    id="participant-last-name"
                    name="lastName"
                    type="text"
                    value={participantForm.lastName}
                    onChange={handleParticipantFormChange}
                    maxLength={50}
                    autoComplete="family-name"
                    placeholder="Soyadınız"
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="participant-city"
                  className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                >
                  ŞEHİR
                </label>

                <input
                  id="participant-city"
                  name="city"
                  type="text"
                  value={participantForm.city}
                  onChange={handleParticipantFormChange}
                  maxLength={80}
                  autoComplete="address-level2"
                  placeholder="Yaşadığınız şehir"
                  className="w-full rounded-xl border border-amber-200 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {participantError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {participantError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-800 px-5 py-4 font-bold text-white shadow-md transition hover:bg-amber-900"
              >
                ANKETE BAŞLA
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* ANKET BAŞLIĞI */}

          <header className="rounded-3xl bg-gradient-to-r from-amber-950 via-amber-700 to-amber-400 p-7 text-white shadow-xl shadow-amber-900/20">
            <p className="text-xs font-bold tracking-[0.2em] text-amber-100">
              SURVEY APP
            </p>

            <h1 className="font-stack-notch mt-2 text-3xl font-bold sm:text-4xl">
              {selectedSurvey.title}
            </h1>

            <p className="mt-3 leading-6 text-amber-50">
              {selectedSurvey.description}
            </p>

            <div className="mt-6 flex items-center justify-between text-sm font-medium text-amber-50">
              <span>{questions.length} soru</span>

              <span>%{progress} tamamlandı</span>
            </div>

            {/* İLERLEME ÇUBUĞU */}

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-amber-900/40">
              <div
                className="h-full rounded-full bg-white shadow-sm transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </header>

          {/* KATILIMCI BİLGİLERİ */}

          {participant && (
            <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-5 shadow-lg shadow-amber-200/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-200 font-stack-notch text-lg font-bold text-amber-950">
                  {participant.firstName.charAt(0).toUpperCase()}
                  {participant.lastName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-stack-notch text-xs font-bold tracking-wide text-amber-700">
                    KATILIMCI
                  </p>

                  <p className="mt-1 font-stack-notch text-lg font-bold text-amber-950">
                    {participant.fullName}
                  </p>

                  <p className="mt-1 text-sm font-medium text-amber-800">
                    {participant.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setParticipantModalOpen(true)}
                className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
              >
                Bilgileri Düzenle
              </button>
            </section>
          )}

          {/* ANKET FORMU */}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {questions.map((question, index) => {
              const answer = answers[question.id];

              return (
                <section
                  key={question.id}
                  id={`question-${question.id}`}
                  tabIndex={-1}
                  className={`rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/70 p-6 shadow-lg shadow-amber-200/20 outline-none transition duration-300 hover:shadow-xl hover:shadow-amber-200/30 ${
                    errors[question.id]
                      ? "border-2 border-red-400"
                      : "border border-amber-200"
                  }`}
                >
                  {/* SORU BAŞLIĞI */}

                  <div className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800">
                      {index + 1}
                    </span>

                    <h2 className="font-stack-notch pt-1 text-lg font-semibold text-amber-950">
                      {question.text}

                      {question.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </h2>
                  </div>

                  {/* PUANLAMA */}

                  {question.type === "rating" && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {Array.from(
                        {
                          length: question.maxRating || 10,
                        },
                        (_, ratingIndex) => {
                          const rating = ratingIndex + 1;

                          const selected = answer === rating;

                          return (
                            <button
                              key={rating}
                              type="button"
                              onClick={() =>
                                handleAnswerChange(question.id, rating)
                              }
                              className={`flex h-11 w-11 items-center justify-center rounded-xl border font-semibold transition duration-200 ${
                                selected
                                  ? "scale-105 border-amber-800 bg-amber-800 text-white shadow-md shadow-amber-300/40"
                                  : "border-amber-200 bg-white text-amber-900 hover:border-amber-500 hover:bg-amber-50"
                              }`}
                            >
                              {rating}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* EVET / HAYIR */}

                  {question.type === "yes-no" && (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(question.id, "Evet")}
                        className={`rounded-xl border px-4 py-3 font-semibold transition duration-300 ${
                          answer === "Evet"
                            ? "border-amber-800 bg-amber-800 text-white shadow-md shadow-amber-200/50"
                            : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                        }`}
                      >
                        Evet
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswerChange(question.id, "Hayır")}
                        className={`rounded-xl border px-4 py-3 font-semibold transition duration-300 ${
                          answer === "Hayır"
                            ? "border-amber-800 bg-amber-800 text-white shadow-md shadow-amber-200/50"
                            : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                        }`}
                      >
                        Hayır
                      </button>
                    </div>
                  )}

                  {/* ÇOKTAN SEÇMELİ */}

                  {question.type === "multiple-choice" && (
                    <div className="mt-5 space-y-3">
                      {(question.options || []).map((option, optionIndex) => (
                        <label
                          key={`${question.id}-${optionIndex}`}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition duration-200 ${
                            selectedOptions[question.id] === optionIndex
                              ? "border-amber-600 bg-amber-100 shadow-sm"
                              : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={
                              selectedOptions[question.id] === optionIndex
                            }
                            onChange={() => {
                              setSelectedOptions((previousOptions) => ({
                                ...previousOptions,
                                [question.id]: optionIndex,
                              }));

                              handleAnswerChange(question.id, {
                                optionIndex,
                                value: option,
                              });
                            }}
                            className="h-4 w-4 accent-amber-700"
                          />

                          <span className="text-sm font-medium text-amber-950">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* METİN */}

                  {question.type === "text" && (
                    <textarea
                      value={answer || ""}
                      onChange={(event) =>
                        handleAnswerChange(question.id, event.target.value)
                      }
                      rows="4"
                      placeholder="Cevabınızı yazın..."
                      className="mt-5 w-full resize-y rounded-xl border border-amber-200 bg-white px-4 py-3 text-amber-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  )}

                  {/* HATA */}

                  {errors[question.id] && (
                    <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {errors[question.id]}
                    </p>
                  )}
                </section>
              );
            })}

            {/* GÖNDER */}

            <button
              type="submit"
              disabled={!participant || isSubmitting}
              className="w-full rounded-2xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-[1.02] hover:bg-amber-900 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:scale-100"
            >
              {isSubmitting ? "Gönderiliyor..." : "Anketi Gönder"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default SurveyFill;
