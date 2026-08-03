import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function SurveyCard({ survey, onShare, onDelete, onManageAccess }) {
  const { currentUser } = useAuth();

  /* KULLANICININ BU ANKETTEKİ ROLÜ */

  const userRole = currentUser
    ? survey.members?.[currentUser.uid] ||
      (survey.ownerId === currentUser.uid ? "owner" : null)
    : null;

  /* ROL BAZLI YETKİLER */

  const canManageAccess = userRole === "owner";

  const canEdit = userRole === "owner" || userRole === "editor";

  const canViewResults =
    userRole === "owner" || userRole === "editor" || userRole === "viewer";

  const canShare = userRole === "owner" || userRole === "editor";

  const canDelete = userRole === "owner";

  function getStatusClasses(status) {
    if (status === "Yayında") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Taslak") {
      return "bg-amber-200 text-amber-900";
    }

    return "bg-slate-100 text-slate-700";
  }

  function getStatusIcon(status) {
    if (status === "Yayında") {
      return "/yayinda-logo.svg";
    }

    if (status === "Taslak") {
      return "/taslak-logo.svg";
    }

    return null;
  }

  /* ROL BİLGİLERİ */

  function getRoleInfo(role) {
    if (role === "owner") {
      return {
        label: "Sahip",
        icon: "/ownericon.svg",
        classes: "border-amber-300 bg-amber-100 text-amber-950",
      };
    }

    if (role === "editor") {
      return {
        label: "Editör",
        icon: "/editoricon.svg",
        classes: "border-orange-300 bg-orange-100 text-orange-900",
      };
    }

    if (role === "viewer") {
      return {
        label: "Görüntüleyici",
        icon: "/viewericon.svg",
        classes: "border-slate-300 bg-slate-100 text-slate-800",
      };
    }

    return null;
  }

  function formatSurveyDate(timestamp) {
    if (!timestamp) {
      return "Tarih bilgisi yok";
    }

    let date;

    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) {
      return "Tarih bilgisi yok";
    }

    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const roleInfo = getRoleInfo(userRole);
  const statusIcon = getStatusIcon(survey.status);

  return (
    <article className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/50 to-amber-100/70 p-5 shadow-lg shadow-amber-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-300/40">
      {/* BAŞLIK */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-stack-notch text-lg font-bold text-amber-950">
            {survey.title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {survey.description}
          </p>
        </div>

        {/* ROL + ANKET DURUMU */}

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {roleInfo && (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${roleInfo.classes}`}
            >
              <img src={roleInfo.icon} alt="" className="h-7 w-7 shrink-0" />

              <span>{roleInfo.label}</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold leading-none ${getStatusClasses(
              survey.status,
            )}`}
          >
            {statusIcon && (
              <img src={statusIcon} alt="" className="h-8 w-8 shrink-0" />
            )}

            <span className="leading-none">{survey.status}</span>
          </span>
        </div>
      </div>

      {/* İSTATİSTİKLER */}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <p className="text-lg font-bold text-amber-950">
            {survey.questionCount ?? 0}
          </p>

          <p className="text-sm font-bold text-amber-800">Soru</p>
        </div>

        <div>
          <p className="text-lg font-bold text-amber-950">
            {survey.responseCount ?? 0}
          </p>

          <p className="text-sm font-bold text-amber-800">Yanıt</p>
        </div>

        <div>
          <p className="text-lg font-bold text-amber-950">
            %{survey.completionRate ?? 0}
          </p>

          <p className="text-sm font-bold text-amber-800">Tamamlama</p>
        </div>
      </div>

      {/* TARİHLER */}

      <div className="mt-5 flex flex-col gap-2 border-t border-amber-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-stack-notch text-sm font-bold text-amber-900">
          Oluşturuldu:{" "}
          <span className="font-semibold text-amber-800">
            {formatSurveyDate(survey.createdAt)}
          </span>
        </p>

        <p className="font-stack-notch text-sm font-bold text-amber-900">
          Son güncelleme:{" "}
          <span className="font-semibold text-amber-800">
            {formatSurveyDate(survey.updatedAt || survey.createdAt)}
          </span>
        </p>
      </div>

      {/* AKSİYON BUTONLARI */}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* SADECE OWNER */}

        {canManageAccess && (
          <button
            type="button"
            onClick={() => onManageAccess?.(survey)}
            className="flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-3 text-sm font-semibold text-amber-900 transition duration-300 hover:bg-amber-200"
          >
            <img src="/ownericon.svg" alt="" className="h-5 w-5" />

            <span>Yetkilendir</span>
          </button>
        )}

        {/* OWNER VE EDITOR */}

        {canEdit && (
          <Link
            to={`/edit/${survey.id}`}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-amber-800"
          >
            Düzenle
          </Link>
        )}

        {/* OWNER, EDITOR VE VIEWER */}

        {canViewResults && (
          <Link
            to={`/results/${survey.id}`}
            className="rounded-lg border border-amber-300 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-900 transition duration-300 hover:bg-amber-100"
          >
            Sonuçlar
          </Link>
        )}

        {/* OWNER VE EDITOR */}

        {canShare && (
          <button
            type="button"
            onClick={() => onShare?.(survey)}
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
        )}

        {/* SADECE OWNER */}

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(survey.id)}
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
        )}
      </div>
    </article>
  );
}

export default SurveyCard;
