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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-amber-50 to-amber-100 px-6 py-12">
      <section
        className={`w-full max-w-2xl rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-10 text-center shadow-xl shadow-amber-200/50 transition-all duration-1000 ease-out sm:p-12 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* TİK İKONU */}

        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 shadow-md shadow-amber-200/50 transition-all duration-700 ease-out ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <svg viewBox="0 0 52 52" className="h-14 w-14" fill="none">
            <circle
              cx="26"
              cy="26"
              r="23"
              className="stroke-amber-600"
              strokeWidth="3"
            />

            <path
              d="M15 27L22 34L38 18"
              className={`stroke-amber-800 ${
                showCheck ? "thank-you-check" : ""
              }`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* YAZI */}

        <p className="mt-7 text-sm font-bold tracking-[0.2em] text-amber-700">
          ANKET TAMAMLANDI
        </p>

        <h1 className="font-stack-notch mt-3 text-4xl font-extrabold text-amber-950 sm:text-5xl">
          Teşekkür ederiz!
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-amber-900/70">
          Yanıtların başarıyla kaydedildi. Ankete zaman ayırdığın ve görüşlerini
          bizimle paylaştığın için teşekkür ederiz.
        </p>

        {/* TAMAMLANAN ANKET */}

        {selectedSurvey && (
          <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/70 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">
              Tamamlanan Anket
            </p>

            <p className="mt-2 text-lg font-bold text-amber-950">
              {selectedSurvey.title}
            </p>
          </div>
        )}

        {/* ANA SAYFAYA DÖN */}

        <div className="mt-9">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-amber-800 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-300/40 transition duration-300 hover:scale-105 hover:bg-amber-900 hover:shadow-xl"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ThankYou;
