import { Link, useParams } from "react-router-dom";

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

function Results() {
  const { surveyId } = useParams();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const responses = mockResponses[surveyId] || [];

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
            <p className="font-stack-notch text-sm font-semibold text-amber-700">
              ANKET SONUÇLARI
            </p>

            <h1 className="font-stack-notch mt-1 text-4xl font-bold text-amber-950">
              {selectedSurvey.title}
            </h1>

            <p className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
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
              %{selectedSurvey.completionRate}
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
              {responses.length > 0 ? averageRating : "—"}
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
                {selectedSurvey.questions.map((question, index) => {
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
                                cursor={{
                                  fill: "#fef3c7",
                                  fillOpacity: 0.45,
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

                              <Bar
                                dataKey="count"
                                fill={`url(#${barGradientId})`}
                                radius={[6, 6, 0, 0]}
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

            <section className="mt-10 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-amber-100 shadow-lg shadow-amber-200/40">
              <div className="flex items-center justify-between border-b border-amber-200 px-6 py-5">
                <div>
                  <h1 className="font-stack-notch text-4xl font-bold text-amber-950">
                    Yanıt Verenler
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-amber-800">
                    Ankete katılan kullanıcılar
                  </p>
                </div>

                <span className="rounded-full bg-amber-200 px-4 py-1.5 text-sm font-bold text-amber-950">
                  {responses.length} kişi
                </span>
              </div>

              <div className="respondents-scrollbar max-h-96 overflow-y-auto">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center gap-4 border-b border-amber-200/70 px-6 py-4 transition duration-200 last:border-b-0 hover:bg-amber-100/70"
                  >
                    {response.participant.avatar ? (
                      <img
                        src={response.participant.avatar}
                        alt={response.participant.fullName}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-300"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-950 ring-2 ring-amber-300">
                        {getInitials(response.participant)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-amber-950">
                        {response.participant.fullName}
                      </p>

                      <p className="mt-1 text-sm font-medium text-amber-800">
                        📍 {response.participant.city}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-amber-800">
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
