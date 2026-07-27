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

  const [participant, setParticipant] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [userRequest, setUserRequest] = useState(0);
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
  }, [surveyId]);

  /* RANDOM USER */

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRandomUser() {
      try {
        setUserLoading(true);
        setUserError("");

        const response = await fetch("https://randomuser.me/api/", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Kullanıcı bilgisi alınamadı.");
        }

        const data = await response.json();
        const user = data.results[0];

        setParticipant({
          firstName: user.name.first,
          lastName: user.name.last,
          fullName: `${user.name.first} ${user.name.last}`,
          city: user.location.city,
          avatar: user.picture.medium,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);

          setUserError("Katılımcı bilgisi yüklenirken bir hata oluştu.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setUserLoading(false);
        }
      }
    }

    fetchRandomUser();

    return () => {
      controller.abort();
    };
  }, [surveyId, userRequest]);

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
      setUserError("Katılımcı bilgisi yüklenmeden anket gönderilemez.");

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

        {/* RANDOM USER */}

        <section className="mt-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-5 shadow-lg shadow-amber-200/30">
          {userLoading && (
            <p className="text-sm font-medium text-amber-800">
              Katılımcı profili yükleniyor...
            </p>
          )}

          {!userLoading && participant && (
            <div className="flex items-center gap-4">
              <img
                src={participant.avatar}
                alt={participant.fullName}
                className="h-16 w-16 rounded-full border-2 border-amber-200 object-cover shadow-sm"
              />

              <div>
                <p className="font-stack-notch text-lg font-bold text-amber-950">
                  {participant.fullName}
                </p>

                <p className="mt-1 text-sm font-medium text-amber-800">
                  {participant.city}
                </p>

                <p className="mt-1 text-xs text-slate-400">Random User API</p>
              </div>
            </div>
          )}

          {!userLoading && userError && (
            <div>
              <p className="text-sm font-medium text-red-600">{userError}</p>

              <button
                type="button"
                onClick={() => setUserRequest((previous) => previous + 1)}
                className="mt-3 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-amber-900"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </section>

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
                          checked={selectedOptions[question.id] === optionIndex}
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
            disabled={userLoading || !participant || isSubmitting}
            className="w-full rounded-2xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-[1.02] hover:bg-amber-900 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:scale-100"
          >
            {isSubmitting ? "Gönderiliyor..." : "Anketi Gönder"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default SurveyFill;
