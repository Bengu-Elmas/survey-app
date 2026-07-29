import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase.js";

function Results() {
  const { surveyId } = useParams();
  const { currentUser } = useAuth();

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  // Hangi katılımcının cevapları açık?
  const [expandedResponseId, setExpandedResponseId] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        setErrorMessage("");
        setAccessDenied(false);

        const surveyRef = doc(db, "surveys", surveyId);
        const surveySnapshot = await getDoc(surveyRef);

        if (!surveySnapshot.exists()) {
          setSelectedSurvey(null);
          setResponses([]);
          return;
        }

        const surveyData = {
          id: surveySnapshot.id,
          ...surveySnapshot.data(),
        };

        // Anket giriş yapan kullanıcıya ait mi?
        if (surveyData.ownerId !== currentUser.uid) {
          setAccessDenied(true);
          setSelectedSurvey(null);
          setResponses([]);
          return;
        }

        setSelectedSurvey(surveyData);

        // Sahiplik kontrolünden geçtikten sonra yanıtları getiriyoruz.
        const responsesQuery = query(
          collection(db, "responses"),
          where("surveyId", "==", surveyId),
        );

        const responsesSnapshot = await getDocs(responsesQuery);

        const responseList = responsesSnapshot.docs.map((responseDoc) => ({
          id: responseDoc.id,
          ...responseDoc.data(),
        }));

        setResponses(responseList);
      } catch (error) {
        console.error("Anket sonuçları alınırken hata oluştu:", error);

        setErrorMessage(
          "Anket sonuçları alınırken bir hata oluştu. Lütfen tekrar deneyin.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchResults();
    }
  }, [surveyId, currentUser]);

  function getQuestionData(question) {
    if (question.type === "rating") {
      const maxRating = question.maxRating || 10;

      return Array.from({ length: maxRating }, (_, index) => {
        const rating = index + 1;

        const count = responses.filter(
          (response) => Number(response.answers?.[question.id]) === rating,
        ).length;

        return {
          name: rating.toString(),
          count,
        };
      });
    }

    if (question.type === "yes-no") {
      return ["Evet", "Hayır"].map((answer) => ({
        name: answer,

        count: responses.filter(
          (response) => response.answers?.[question.id] === answer,
        ).length,
      }));
    }

    if (question.type === "multiple-choice") {
      return (question.options || []).map((option, optionIndex) => ({
        name: option,

        count: responses.filter(
          (response) =>
            response.answers?.[question.id]?.optionIndex === optionIndex,
        ).length,
      }));
    }

    return [];
  }

  function calculateAverageRating() {
    const ratingQuestions = (selectedSurvey?.questions || []).filter(
      (question) => question.type === "rating",
    );

    const ratings = [];

    responses.forEach((response) => {
      ratingQuestions.forEach((question) => {
        const answer = response.answers?.[question.id];

        if (answer === undefined || answer === null || answer === "") {
          return;
        }

        const numericAnswer = Number(answer);

        if (!Number.isNaN(numericAnswer)) {
          ratings.push(numericAnswer);
        }
      });
    });

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);

    return (total / ratings.length).toFixed(1);
  }

  function calculateCompletionRate() {
    const questions = selectedSurvey?.questions || [];

    if (responses.length === 0 || questions.length === 0) {
      return 0;
    }

    let answeredQuestions = 0;

    const totalQuestions = responses.length * questions.length;

    responses.forEach((response) => {
      questions.forEach((question) => {
        const answer = response.answers?.[question.id];

        if (isAnswerFilled(answer)) {
          answeredQuestions += 1;
        }
      });
    });

    return Math.round((answeredQuestions / totalQuestions) * 100);
  }

  function getTextAnswers(question) {
    return responses.filter((response) => {
      const answer = response.answers?.[question.id];

      return typeof answer === "string" && answer.trim() !== "";
    });
  }

  function getQuestionTypeName(type) {
    if (type === "rating") {
      return "Puanlama";
    }

    if (type === "yes-no") {
      return "Evet / Hayır";
    }

    if (type === "multiple-choice") {
      return "Çoktan Seçmeli";
    }

    return "Metin";
  }

  function getInitials(participant) {
    const initials = `${participant?.firstName?.[0] || ""}${
      participant?.lastName?.[0] || ""
    }`;

    return initials || "?";
  }

  function isAnswerFilled(answer) {
    if (answer === undefined || answer === null) {
      return false;
    }

    if (typeof answer === "string") {
      return answer.trim() !== "";
    }

    if (typeof answer === "object") {
      return answer.value !== undefined && answer.value !== "";
    }

    return true;
  }

  function getAnsweredQuestionCount(response) {
    const questions = selectedSurvey?.questions || [];

    return questions.reduce((count, question) => {
      const answer = response.answers?.[question.id];

      return isAnswerFilled(answer) ? count + 1 : count;
    }, 0);
  }

  function formatAnswer(question, answer) {
    if (!isAnswerFilled(answer)) {
      return "Yanıt verilmedi";
    }

    if (
      question.type === "multiple-choice" &&
      typeof answer === "object" &&
      answer !== null
    ) {
      return answer.value || "Yanıt verilmedi";
    }

    if (question.type === "rating") {
      return `${answer} / ${question.maxRating || 10}`;
    }

    return String(answer);
  }

  function toggleParticipantAnswers(responseId) {
    setExpandedResponseId((currentId) =>
      currentId === responseId ? null : responseId,
    );
  }

  function formatDate(date) {
    if (!date) {
      return "Tarih bulunamadı";
    }

    let convertedDate;

    if (typeof date.toDate === "function") {
      convertedDate = date.toDate();
    } else if (date.seconds) {
      convertedDate = new Date(date.seconds * 1000);
    } else {
      convertedDate = new Date(date);
    }

    if (Number.isNaN(convertedDate.getTime())) {
      return "Tarih bulunamadı";
    }

    return convertedDate.toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function handleDownloadCSV() {
    if (responses.length === 0 || !selectedSurvey) {
      return;
    }

    const headers = [
      "Ad Soyad",
      "Şehir",
      "Gönderim Tarihi",
      ...selectedSurvey.questions.map((question) => question.text),
    ];

    const rows = responses.map((response) => [
      response.participant?.fullName || "",
      response.participant?.city || "",
      formatDate(response.submittedAt),

      ...selectedSurvey.questions.map((question) => {
        const answer = response.answers?.[question.id];

        if (
          question.type === "multiple-choice" &&
          typeof answer === "object" &&
          answer !== null
        ) {
          return answer.value;
        }

        return answer ?? "";
      }),
    ]);

    const escapeCSVValue = (value) => {
      const stringValue = String(value);

      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCSVValue).join(","),
      ...rows.map((row) => row.map(escapeCSVValue).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedSurvey.title}-yanitlar.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <p className="font-stack-notch text-2xl font-bold text-amber-950">
            Sonuçlar yükleniyor...
          </p>

          <p className="mt-3 text-sm font-medium text-amber-800">
            Anket ve yanıt bilgileri Firebase&apos;den alınıyor.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-red-200 bg-white px-10 py-20 text-center shadow-xl">
          <h1 className="font-stack-notch text-3xl font-bold text-red-800">
            Bir Hata Oluştu
          </h1>

          <p className="mt-4 text-slate-700">{errorMessage}</p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-amber-900"
          >
            Anketlerime Dön
          </Link>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <img src="/usericon.svg" alt="" className="mx-auto h-16 w-16" />

          <p className="font-stack-notch mt-5 text-sm font-bold tracking-[0.2em] text-amber-700">
            ERİŞİM ENGELLENDİ
          </p>

          <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 md:text-5xl">
            BU ANKET SANA AİT DEĞİL !
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-amber-900/70">
            Yalnızca kendi oluşturduğun anketlerin sonuçlarını
            görüntüleyebilirsin.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-amber-900"
          >
            Anketlerime Dön
          </Link>
        </div>
      </main>
    );
  }

  if (!selectedSurvey) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <p className="text-sm font-bold tracking-[0.2em] text-amber-700">
            SONUÇLARA ULAŞILAMADI
          </p>

          <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 md:text-5xl">
            Anket bulunamadı
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-amber-900/70">
            Sonuçlarını görüntülemek istediğin ankete ulaşamadık. Anket silinmiş
            olabilir veya kullandığın bağlantı artık geçerli olmayabilir.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-amber-900"
          >
            Anketlerime Dön
          </Link>
        </div>
      </main>
    );
  }

  /* TASLAK ANKET */

  if (selectedSurvey.status !== "Yayında") {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-3xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-10 py-20 text-center shadow-xl shadow-amber-200/40">
          <p className="text-sm font-bold tracking-[0.2em] text-amber-700">
            SONUÇLAR GÖRÜNTÜLENEMİYOR
          </p>

          <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 md:text-5xl">
            Bu anket henüz yayınlanmadı
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-amber-900/70">
            Taslak durumundaki anketlerin sonuçları görüntülenemez. Anket
            yayınlandıktan ve katılımcılardan yanıt almaya başladıktan sonra
            sonuçlara buradan ulaşabilirsiniz.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-amber-900"
          >
            Anketlerime Dön
          </Link>
        </div>
      </main>
    );
  }

  const averageRating = calculateAverageRating();
  const completionRate = calculateCompletionRate();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* SAYFA BAŞLIĞI */}

        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-stack-notch text-sm font-semibold text-amber-700">
              ANKET SONUÇLARI
            </p>

            <h1 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
              {selectedSurvey.title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              {selectedSurvey.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={responses.length === 0}
            className="flex w-fit items-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M12 3v12" strokeLinecap="round" />

              <path
                d="m7 10 5 5 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path d="M5 21h14" strokeLinecap="round" />
            </svg>
            CSV İndir
          </button>
        </section>

        {/* İSTATİSTİK KARTLARI */}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-6 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-stack-notch text-2xl font-bold text-amber-950">
                Toplam Yanıt
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                </svg>
              </div>
            </div>

            <p className="font-stack-notch mt-4 text-4xl font-bold text-amber-950">
              {responses.length}
            </p>

            <p className="mt-1 text-sm font-semibold text-amber-900">
              Katılımcı
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-6 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-stack-notch text-2xl font-bold text-amber-950">
                Tamamlanma Oranı
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <p className="font-stack-notch mt-4 text-4xl font-bold text-amber-950">
              %{completionRate}
            </p>

            <p className="mt-1 text-sm font-semibold text-amber-900">
              Anket Tamamlama
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-6 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-stack-notch text-2xl font-bold text-amber-950">
                Ortalama Puan
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path
                    d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <p className="font-stack-notch mt-4 text-4xl font-bold text-amber-950">
              {responses.length > 0 && averageRating !== 0
                ? averageRating
                : "—"}
            </p>

            <p className="mt-1 text-sm font-semibold text-amber-900">
              Puanlama Soruları
            </p>
          </div>
        </section>

        {/* YANIT YOKSA */}

        {responses.length === 0 ? (
          <section className="mt-8 rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-white via-amber-50 to-amber-100 px-6 py-16 text-center shadow-lg shadow-amber-200/30">
            <h2 className="font-stack-notch mt-5 text-3xl font-bold text-amber-950">
              Henüz Yanıt Bulunmuyor
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-7 text-amber-900">
              Katılımcılar anketi doldurduğunda sonuçlar burada grafik olarak
              görüntülenecek.
            </p>
          </section>
        ) : (
          <>
            {/* SORU SONUÇLARI */}

            <section className="mt-10">
              <div>
                <h2 className="font-stack-notch text-sm font-semibold text-amber-700">
                  Soru Sonuçları
                </h2>

                <p className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
                  Her Soruya Verilen Yanıtların Dağılımı
                </p>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {(selectedSurvey.questions || []).map((question, index) => {
                  const questionData = getQuestionData(question);
                  const textAnswers = getTextAnswers(question);

                  const yesGradientId = `pie-yes-${question.id}`;
                  const noGradientId = `pie-no-${question.id}`;
                  const barGradientId = `bar-gradient-${question.id}`;

                  return (
                    <article
                      key={question.id}
                      className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-6 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-stack-notch text-lg font-bold text-amber-950">
                            SORU {index + 1}
                          </p>

                          <h3 className="mt-2 font-bold leading-6 text-slate-900">
                            {question.text}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                          {getQuestionTypeName(question.type)}
                        </span>
                      </div>

                      {/* METİN SORUSU */}

                      {question.type === "text" && (
                        <div className="mt-6 max-h-72 space-y-3 overflow-y-auto pr-2">
                          {textAnswers.length > 0 ? (
                            textAnswers.map((response) => (
                              <div
                                key={response.id}
                                className="rounded-2xl border border-amber-200 bg-white/80 p-4 shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  {response.participant?.avatar ? (
                                    <img
                                      src={response.participant.avatar}
                                      alt={
                                        response.participant?.fullName ||
                                        "Katılımcı"
                                      }
                                      className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-200"
                                    />
                                  ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-950">
                                      {getInitials(response.participant)}
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-amber-950">
                                      {response.participant?.fullName ||
                                        "İsimsiz Katılımcı"}
                                    </p>

                                    <p className="text-xs font-medium text-amber-700">
                                      {response.participant?.city ||
                                        "Şehir bilgisi yok"}
                                    </p>
                                  </div>
                                </div>

                                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">
                                  {response.answers?.[question.id]}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="py-8 text-center text-sm text-slate-500">
                              Bu soruya henüz metin yanıtı verilmedi.
                            </p>
                          )}
                        </div>
                      )}

                      {/* EVET / HAYIR */}

                      {question.type === "yes-no" && (
                        <div className="mt-5 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <radialGradient
                                  id={yesGradientId}
                                  cx="30%"
                                  cy="25%"
                                  r="80%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="var(--color-amber-300)"
                                  />
                                  <stop
                                    offset="55%"
                                    stopColor="var(--color-amber-500)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="var(--color-amber-800)"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={noGradientId}
                                  cx="30%"
                                  cy="25%"
                                  r="80%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="var(--color-amber-50)"
                                  />
                                  <stop
                                    offset="55%"
                                    stopColor="var(--color-amber-200)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="var(--color-amber-500)"
                                  />
                                </radialGradient>
                              </defs>

                              <Pie
                                data={questionData}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={4}
                                label={({
                                  name,
                                  percent,
                                  x,
                                  y,
                                  textAnchor,
                                }) => (
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor={textAnchor}
                                    dominantBaseline="central"
                                    fill="#78350f"
                                    fontSize={13}
                                    fontWeight={700}
                                  >
                                    {`${name} %${Math.round(percent * 100)}`}
                                  </text>
                                )}
                              >
                                {questionData.map((entry, dataIndex) => (
                                  <Cell
                                    key={entry.name}
                                    fill={`url(#${
                                      dataIndex === 0
                                        ? yesGradientId
                                        : noGradientId
                                    })`}
                                    stroke="var(--color-amber-50)"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                formatter={(value) => [
                                  `${value} kişi`,
                                  "Yanıt",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#fffbeb",
                                  border: "1px solid #f59e0b",
                                  borderRadius: "12px",
                                  boxShadow:
                                    "0 10px 25px rgba(146, 64, 14, 0.15)",
                                  padding: "10px 14px",
                                }}
                                labelStyle={{
                                  color: "#78350f",
                                  fontWeight: 700,
                                  marginBottom: "4px",
                                }}
                                itemStyle={{
                                  color: "#92400e",
                                  fontWeight: 600,
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* PUANLAMA VE ÇOKTAN SEÇMELİ */}

                      {(question.type === "rating" ||
                        question.type === "multiple-choice") && (
                        <div className="mt-5 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={questionData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 10,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                              />

                              <XAxis
                                dataKey="name"
                                tick={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  fill: "#78350f",
                                }}
                                axisLine={{
                                  stroke: "#d97706",
                                }}
                                tickLine={{
                                  stroke: "#d97706",
                                }}
                              />

                              <YAxis
                                allowDecimals={false}
                                tick={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  fill: "#78350f",
                                }}
                                axisLine={{
                                  stroke: "#d97706",
                                }}
                                tickLine={{
                                  stroke: "#d97706",
                                }}
                              />

                              <Tooltip
                                formatter={(value) => [
                                  `${value} kişi`,
                                  "Yanıt",
                                ]}
                                contentStyle={{
                                  backgroundColor: "#fffbeb",
                                  border: "1px solid #f59e0b",
                                  borderRadius: "12px",
                                  boxShadow:
                                    "0 10px 25px rgba(146, 64, 14, 0.15)",
                                  padding: "10px 14px",
                                }}
                                labelStyle={{
                                  color: "#78350f",
                                  fontWeight: 700,
                                  marginBottom: "4px",
                                }}
                                itemStyle={{
                                  color: "#92400e",
                                  fontWeight: 600,
                                }}
                                cursor={{
                                  fill: "#fef3c7",
                                  fillOpacity: 0.45,
                                }}
                              />

                              <defs>
                                <linearGradient
                                  id={barGradientId}
                                  x1="0"
                                  y1="100%"
                                  x2="0"
                                  y2="0%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="var(--color-amber-900)"
                                  />

                                  <stop
                                    offset="55%"
                                    stopColor="var(--color-amber-600)"
                                  />

                                  <stop
                                    offset="100%"
                                    stopColor="var(--color-amber-300)"
                                  />
                                </linearGradient>
                              </defs>

                              <Bar
                                dataKey="count"
                                fill={`url(#${barGradientId})`}
                                radius={[6, 6, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* KATILIMCI YANITLARI */}

            <section className="mt-10">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-stack-notch text-sm font-semibold text-amber-700">
                    KATILIMCILAR
                  </p>

                  <h2 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
                    Katılımcı Yanıtları
                  </h2>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Ankete katılan kişileri ve verdikleri cevapları inceleyin.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-amber-200 px-4 py-2 text-sm font-bold text-amber-950">
                  {responses.length} katılımcı
                </span>
              </div>

              <div className="space-y-4">
                {responses.map((response, responseIndex) => {
                  const isExpanded = expandedResponseId === response.id;

                  const answeredQuestionCount =
                    getAnsweredQuestionCount(response);

                  return (
                    <article
                      key={response.id}
                      className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 shadow-lg shadow-amber-200/30"
                    >
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        {/* PROFİL */}

                        {response.participant?.avatar ? (
                          <img
                            src={response.participant.avatar}
                            alt={response.participant?.fullName || "Katılımcı"}
                            className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-amber-200"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-200 text-base font-bold text-amber-950 ring-4 ring-amber-100">
                            {getInitials(response.participant)}
                          </div>
                        )}

                        {/* KİŞİ BİLGİLERİ */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-bold text-amber-950">
                              {response.participant?.fullName ||
                                "İsimsiz Katılımcı"}
                            </h3>

                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                              Katılımcı #{responseIndex + 1}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-amber-800">
                            <span>
                              📍{" "}
                              {response.participant?.city ||
                                "Şehir bilgisi yok"}
                            </span>

                            <span>🕒 {formatDate(response.submittedAt)}</span>
                          </div>
                        </div>

                        {/* TAMAMLANMA + BUTON */}

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
                            <p className="text-xs font-semibold text-amber-700">
                              Yanıtlanan
                            </p>

                            <p className="font-stack-notch mt-0.5 font-bold text-amber-950">
                              {answeredQuestionCount}/
                              {selectedSurvey.questions?.length || 0}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              toggleParticipantAnswers(response.id)
                            }
                            className="rounded-xl bg-amber-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-amber-900"
                          >
                            {isExpanded ? "Yanıtları Gizle" : "Yanıtları Gör"}
                          </button>
                        </div>
                      </div>

                      {/* KİŞİNİN TÜM CEVAPLARI */}

                      {isExpanded && (
                        <div className="border-t border-amber-200 bg-white/70 p-5">
                          <div className="mb-4">
                            <p className="font-stack-notch text-lg font-bold text-amber-950">
                              Verilen Yanıtlar
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              Bu katılımcının anketteki sorulara verdiği
                              cevaplar.
                            </p>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {(selectedSurvey.questions || []).map(
                              (question, questionIndex) => {
                                const answer = response.answers?.[question.id];

                                const hasAnswer = isAnswerFilled(answer);

                                return (
                                  <div
                                    key={question.id}
                                    className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                        Soru {questionIndex + 1}
                                      </p>

                                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                                        {getQuestionTypeName(question.type)}
                                      </span>
                                    </div>

                                    <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                                      {question.text}
                                    </p>

                                    <div
                                      className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold leading-6 ${
                                        hasAnswer
                                          ? "bg-amber-100 text-amber-950"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {formatAnswer(question, answer)}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Results;
