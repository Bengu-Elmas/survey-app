import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import surveys from "../data/surveys.js";

function SurveyFill() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const questions = selectedSurvey?.questions || [];

  // Her sorunun cevabını tutacak.
  // Örnek:
  // {
  //   "survey-1-question-1": 8,
  //   "survey-1-question-2": "Evet"
  // }
  const [answers, setAnswers] = useState({});

  // Zorunlu sorular boş bırakılırsa hata mesajlarını tutar.
  const [errors, setErrors] = useState({});

  // Random User API'den gelen kullanıcı.
  const [participant, setParticipant] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  // API isteğini tekrar çalıştırabilmek için.
  const [userRequest, setUserRequest] = useState(0);

  // Başka bir ankete geçilirse eski cevapları temizle.
  useEffect(() => {
    setAnswers({});
    setErrors({});
  }, [surveyId]);

  // Random User API'den rastgele katılımcı çek.
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

  // Bir soruya cevap verilip verilmediğini kontrol eder.
  function isAnswered(question, answer) {
    if (question.type === "text") {
      return typeof answer === "string" && answer.trim() !== "";
    }

    return answer !== undefined && answer !== null && answer !== "";
  }

  // Bir cevap değiştiğinde answers state'ini günceller.
  function handleAnswerChange(questionId, value) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: value,
    }));

    // Kullanıcı soruyu cevapladıysa varsa hata mesajını temizle.
    setErrors((previousErrors) => ({
      ...previousErrors,
      [questionId]: "",
    }));
  }

  // Kaç sorunun cevaplandığını hesapla.
  const answeredQuestionCount = questions.filter((question) =>
    isAnswered(question, answers[question.id]),
  ).length;

  // İlerleme yüzdesi.
  const progress =
    questions.length > 0
      ? Math.round((answeredQuestionCount / questions.length) * 100)
      : 0;

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    // Zorunlu soruların hepsini kontrol et.
    questions.forEach((question) => {
      if (question.required && !isAnswered(question, answers[question.id])) {
        newErrors[question.id] = "Bu soru zorunludur.";
      }
    });

    setErrors(newErrors);

    // Hata varsa ilk hatalı soruya git.
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

    // Daha sonra Firestore'a göndereceğimiz nesne.
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

      submittedAt: new Date().toISOString(),
    };

    console.log("Gönderilen anket yanıtı:", surveyResponse);

    // Firebase bağlantısından sonra burada
    // Firestore'a kayıt işlemini yapacağız.

    navigate(`/thank-you/${surveyId}`);
  }

  if (!selectedSurvey) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Anket bulunamadı
          </h1>

          <p className="mt-2 text-slate-600">
            Bu bağlantıya ait bir anket bulunmuyor.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* ANKET BAŞLIĞI */}

        <header className="rounded-xl bg-indigo-600 p-6 text-white shadow-sm">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {selectedSurvey.title}
          </h1>

          <p className="mt-2 text-sm text-indigo-100">
            {selectedSurvey.description}
          </p>

          <div className="mt-4 flex items-center justify-between text-sm text-indigo-100">
            <span>{questions.length} soru</span>

            <span>%{progress} tamamlandı</span>
          </div>

          {/* İLERLEME ÇUBUĞU */}

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-400">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </header>

        {/* RANDOM USER */}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {userLoading && (
            <p className="text-sm text-slate-500">
              Katılımcı profili yükleniyor...
            </p>
          )}

          {!userLoading && participant && (
            <div className="flex items-center gap-4">
              <img
                src={participant.avatar}
                alt={participant.fullName}
                className="h-14 w-14 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold text-slate-900">
                  {participant.fullName}
                </p>

                <p className="text-sm text-slate-500">{participant.city}</p>

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
                className="mt-3 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </section>

        {/* ANKET FORMU */}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {questions.map((question, index) => {
            const answer = answers[question.id];

            return (
              <section
                key={question.id}
                id={`question-${question.id}`}
                tabIndex={-1}
                className={`rounded-xl border bg-white p-5 shadow-sm outline-none transition ${
                  errors[question.id] ? "border-red-400" : "border-slate-200"
                }`}
              >
                {/* SORU BAŞLIĞI */}

                <h2 className="font-semibold text-slate-900">
                  {index + 1}. {question.text}
                  {question.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </h2>

                {/* PUANLAMA */}

                {question.type === "rating" && (
                  <div className="mt-4 flex flex-wrap gap-2">
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
                            className={`flex h-11 w-11 items-center justify-center rounded-lg border font-semibold transition ${
                              selected
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
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
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, "Evet")}
                      className={`rounded-lg border px-4 py-3 font-semibold transition ${
                        answer === "Evet"
                          ? "border-green-500 bg-green-100 text-green-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Evet
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, "Hayır")}
                      className={`rounded-lg border px-4 py-3 font-semibold transition ${
                        answer === "Hayır"
                          ? "border-red-400 bg-red-100 text-red-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Hayır
                    </button>
                  </div>
                )}

                {/* ÇOKTAN SEÇMELİ */}

                {question.type === "multiple-choice" && (
                  <div className="mt-4 space-y-2">
                    {(question.options || []).map((option, optionIndex) => (
                      <label
                        key={`${question.id}-${optionIndex}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                          answer === option
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answer === option}
                          onChange={() =>
                            handleAnswerChange(question.id, option)
                          }
                          className="h-4 w-4 accent-indigo-600"
                        />

                        <span className="text-sm text-slate-800">{option}</span>
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
                    className="mt-4 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                )}

                {/* HATA MESAJI */}

                {errors[question.id] && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                    {errors[question.id]}
                  </p>
                )}
              </section>
            );
          })}

          {/* GÖNDER */}

          <button
            type="submit"
            disabled={userLoading || !participant}
            className="w-full rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Anketi Gönder
          </button>
        </form>
      </div>
    </main>
  );
}

export default SurveyFill;
