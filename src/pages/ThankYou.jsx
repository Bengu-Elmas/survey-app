import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import surveys from "../data/surveys.js";

function ThankYou() {
  const { surveyId } = useParams();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const [isVisible, setIsVisible] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const cardTimer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    const checkTimer = setTimeout(() => {
      setShowCheck(true);
    }, 650);

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(checkTimer);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 px-6 py-12">
      <section
        className={`w-full max-w-xl rounded-3xl border border-white/60 bg-white p-8 text-center shadow-xl shadow-indigo-100/70 transition-all duration-1000 ease-out sm:p-10 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* TİK İKONU */}

        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 transition-all duration-700 ease-out ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <svg viewBox="0 0 52 52" className="h-14 w-14" fill="none">
            <circle
              cx="26"
              cy="26"
              r="23"
              className="stroke-emerald-500"
              strokeWidth="3"
            />

            <path
              d="M15 27L22 34L38 18"
              className={`stroke-emerald-600 ${
                showCheck ? "thank-you-check" : ""
              }`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* YAZI */}

        <p className="mt-7 text-sm font-bold tracking-widest text-indigo-600">
          ANKET TAMAMLANDI
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Teşekkür ederiz!
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
          Yanıtlarınız başarıyla kaydedildi. Ankete zaman ayırdığınız için
          teşekkür ederiz.
        </p>

        {selectedSurvey && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tamamlanan Anket
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {selectedSurvey.title}
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ThankYou;
