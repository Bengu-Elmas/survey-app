import { Link } from "react-router-dom";

function SurveyCard({ survey, onShare, onDelete }) {
  function getStatusClasses(status) {
    if (status === "Yayında") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Taslak") {
      return "bg-amber-200 text-amber-900";
    }

    return "bg-slate-100 text-slate-700";
  }

  return (
    <article className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/70 p-5 shadow-lg shadow-amber-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-300/40">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-stack-notch text-lg font-bold text-amber-950">
            {survey.title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {survey.description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
            survey.status,
          )}`}
        >
          {survey.status}
        </span>
      </div>

      {/* İstatistikler */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3">
          <p className="text-xs font-semibold text-amber-800">Soru Sayısı</p>

          <p className="mt-1 text-lg font-bold text-amber-950">
            {survey.questions.length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3">
          <p className="text-xs font-semibold text-amber-800">Yanıt Sayısı</p>

          <p className="mt-1 text-lg font-bold text-amber-950">
            {survey.responseCount}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-amber-100 bg-amber-50/80 p-3 sm:col-span-1">
          <p className="text-xs font-semibold text-amber-800">Tamamlanma</p>

          <p className="mt-1 text-lg font-bold text-amber-950">
            %{survey.completionRate}
          </p>
        </div>
      </div>

      {/* Butonlar */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/edit/${survey.id}`}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-amber-800"
        >
          Düzenle
        </Link>

        <Link
          to={`/results/${survey.id}`}
          className="rounded-lg border border-amber-300 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-900 transition duration-300 hover:bg-amber-100"
        >
          Sonuçlar
        </Link>

        <button
          type="button"
          onClick={() => onShare(survey)}
          aria-label="Anketi paylaş"
          title="Anketi paylaş"
          className="flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white/70 px-3 text-amber-900 transition duration-300 hover:bg-amber-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 10.7 15.4 6.3" />
            <path d="m8.6 13.3 6.8 4.4" />
          </svg>

          <span className="text-sm font-semibold">Paylaş</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(survey.id)}
          aria-label="Anketi sil"
          title="Anketi sil"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-900 text-amber-50 shadow-sm transition duration-300 hover:scale-105 hover:bg-amber-950 hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default SurveyCard;
