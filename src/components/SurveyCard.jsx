import { Link } from "react-router-dom";

function SurveyCard({ survey, onShare, onDelete }) {
  function getStatusClasses(status) {
    if (status === "Yayında") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Taslak") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{survey.title}</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Soru Sayısı</p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {survey.questions.length}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Yanıt Sayısı</p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {survey.responseCount}
          </p>
        </div>

        <div className="col-span-2 rounded-xl bg-slate-50 p-3 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500">Tamamlanma</p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            %{survey.completionRate}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/edit/${survey.id}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Düzenle
        </Link>

        <Link
          to={`/results/${survey.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Sonuçlar
        </Link>

        <button
          type="button"
          onClick={() => onShare(survey)}
          aria-label="Anketi paylaş"
          title="Anketi paylaş"
          className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-slate-700 transition hover:bg-slate-50"
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
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
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
