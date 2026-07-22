import { useParams } from "react-router-dom";

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

import surveys from "../data/surveys.js";
import mockResponses from "../data/mockResponses.js";

const PIE_COLORS = ["#6366f1", "#c4b5fd"];

function Results() {
  const { surveyId } = useParams();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const responses = mockResponses[surveyId] || [];

  if (!selectedSurvey) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Anket bulunamadı
            </h1>

            <p className="mt-2 text-slate-500">
              Sonuçlarını görüntülemek istediğiniz anket bulunamadı.
            </p>
          </div>
        </div>
      </main>
    );
  }

  function getQuestionData(question) {
    if (question.type === "rating") {
      const maxRating = question.maxRating || 10;

      return Array.from({ length: maxRating }, (_, index) => {
        const rating = index + 1;

        const count = responses.filter(
          (response) => Number(response.answers[question.id]) === rating,
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
          (response) => response.answers[question.id] === answer,
        ).length,
      }));
    }

    if (question.type === "multiple-choice") {
      return (question.options || []).map((option) => ({
        name: option,

        count: responses.filter(
          (response) => response.answers[question.id] === option,
        ).length,
      }));
    }

    return [];
  }

  function calculateAverageRating() {
    const ratingQuestions = selectedSurvey.questions.filter(
      (question) => question.type === "rating",
    );

    const ratings = [];

    responses.forEach((response) => {
      ratingQuestions.forEach((question) => {
        const answer = Number(response.answers[question.id]);

        if (!Number.isNaN(answer)) {
          ratings.push(answer);
        }
      });
    });

    if (ratings.length === 0) {
      return 0;
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);

    return (total / ratings.length).toFixed(1);
  }

  function getTextAnswers(question) {
    return responses.filter((response) => {
      const answer = response.answers[question.id];

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
    return `${participant.firstName?.[0] || ""}${
      participant.lastName?.[0] || ""
    }`;
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function handleDownloadCSV() {
    if (responses.length === 0) {
      return;
    }

    const headers = [
      "Ad Soyad",
      "Şehir",
      "Gönderim Tarihi",
      ...selectedSurvey.questions.map((question) => question.text),
    ];

    const rows = responses.map((response) => [
      response.participant.fullName,
      response.participant.city,
      formatDate(response.submittedAt),

      ...selectedSurvey.questions.map(
        (question) => response.answers[question.id] ?? "",
      ),
    ]);

    const escapeCSVValue = (value) => {
      const stringValue = String(value);

      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCSVValue).join(","),
      ...rows.map((row) => row.map(escapeCSVValue).join(",")),
    ].join("\n");

    // Türkçe karakterlerin Excel'de düzgün
    // görünmesi için BOM ekliyoruz.
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

  const averageRating = calculateAverageRating();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* SAYFA BAŞLIĞI */}

        <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-wider text-indigo-600">
              ANKET SONUÇLARI
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {selectedSurvey.title}
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              {selectedSurvey.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={responses.length === 0}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Toplam Yanıt
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
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

            <p className="mt-4 text-4xl font-bold text-slate-900">
              {responses.length}
            </p>

            <p className="mt-1 text-sm text-slate-400">katılımcı</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Tamamlanma Oranı
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
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

            <p className="mt-4 text-4xl font-bold text-slate-900">
              %{selectedSurvey.completionRate}
            </p>

            <p className="mt-1 text-sm text-slate-400">anket tamamlama</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
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

            <p className="mt-4 text-4xl font-bold text-slate-900">
              {responses.length > 0 ? averageRating : "—"}
            </p>

            <p className="mt-1 text-sm text-slate-400">puanlama soruları</p>
          </div>
        </section>

        {/* YANIT YOKSA */}

        {responses.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📊
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Henüz yanıt bulunmuyor
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Katılımcılar anketi doldurduğunda sonuçlar burada grafik olarak
              görüntülenecek.
            </p>
          </section>
        ) : (
          <>
            {/* SORU SONUÇLARI */}

            <section className="mt-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Soru Sonuçları
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Her soruya verilen yanıtların dağılımı.
                </p>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {selectedSurvey.questions.map((question, index) => {
                  const questionData = getQuestionData(question);

                  const textAnswers = getTextAnswers(question);

                  return (
                    <article
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold tracking-wider text-indigo-600">
                            SORU {index + 1}
                          </p>

                          <h3 className="mt-2 font-bold leading-6 text-slate-900">
                            {question.text}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
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
                                className="rounded-xl bg-slate-50 p-4"
                              >
                                <p className="text-sm leading-6 text-slate-700">
                                  {response.answers[question.id]}
                                </p>

                                <p className="mt-2 text-xs font-medium text-slate-400">
                                  {response.participant.fullName}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="py-8 text-center text-sm text-slate-400">
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
                              <Pie
                                data={questionData}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={4}
                                label={({ name, percent }) =>
                                  `${name} %${Math.round(percent * 100)}`
                                }
                              >
                                {questionData.map((entry, dataIndex) => (
                                  <Cell
                                    key={entry.name}
                                    fill={
                                      PIE_COLORS[dataIndex % PIE_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                formatter={(value) => [
                                  `${value} kişi`,
                                  "Yanıt",
                                ]}
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
                                  fontSize: 11,
                                }}
                              />

                              <YAxis
                                allowDecimals={false}
                                tick={{
                                  fontSize: 11,
                                }}
                              />

                              <Tooltip
                                formatter={(value) => {
                                  const percentage =
                                    responses.length > 0
                                      ? Math.round(
                                          (value / responses.length) * 100,
                                        )
                                      : 0;

                                  return [
                                    `${value} kişi (%${percentage})`,
                                    "Yanıt",
                                  ];
                                }}
                              />

                              <Bar
                                dataKey="count"
                                fill="#6366f1"
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

            {/* YANIT VERENLER */}

            <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Yanıt Verenler
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Ankete katılan kullanıcılar
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
                  {responses.length} kişi
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0"
                  >
                    {response.participant.avatar ? (
                      <img
                        src={response.participant.avatar}
                        alt={response.participant.fullName}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {getInitials(response.participant)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {response.participant.fullName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        📍 {response.participant.city}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm text-slate-400">
                      {formatDate(response.submittedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Results;
