function FeedbackModal({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
  mode = "message",
  onConfirm,
  confirmText = "Onayla",
  cancelText = "İptal",
  isLoading = false,
  danger = false,
}) {
  if (!isOpen) {
    return null;
  }

  const modalStyles = {
    success: {
      iconBackground: "bg-green-100",
      iconColor: "text-green-700",
      label: "BAŞARILI",
      labelColor: "text-green-700",
    },

    error: {
      iconBackground: "bg-red-100",
      iconColor: "text-red-700",
      label: "BİR HATA OLUŞTU",
      labelColor: "text-red-700",
    },

    warning: {
      iconBackground: "bg-amber-100",
      iconColor: "text-amber-700",
      label: "UYARI",
      labelColor: "text-amber-700",
    },
  };

  const currentStyle = modalStyles[type] || modalStyles.success;

  function renderIcon() {
    if (type === "success") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-8 w-8"
        >
          <path
            d="m5 12 4 4L19 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (type === "error") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-8 w-8"
        >
          <path d="M6 6l12 12" strokeLinecap="round" />
          <path d="M18 6 6 18" strokeLinecap="round" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        className="h-8 w-8"
      >
        <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
        <path d="M12 9v5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-7 text-center shadow-2xl shadow-slate-950/20">
        {/* KAPAT */}

        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Mesajı kapat"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition duration-200 hover:bg-amber-100 hover:text-amber-900"
          >
            ×
          </button>
        )}

        {/* İKON */}

        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${currentStyle.iconBackground} ${currentStyle.iconColor}`}
        >
          {renderIcon()}
        </div>

        {/* DURUM */}

        <p
          className={`font-stack-notch mt-5 text-xs font-bold tracking-[0.18em] ${currentStyle.labelColor}`}
        >
          {mode === "confirm" ? "ONAY GEREKİYOR" : currentStyle.label}
        </p>

        {/* BAŞLIK */}

        <h2
          id="feedback-modal-title"
          className="font-stack-notch mt-2 text-2xl font-bold text-amber-950"
        >
          {title}
        </h2>

        {/* MESAJ */}

        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
          {message}
        </p>

        {/* CONFIRM BUTONLARI */}

        {mode === "confirm" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border-2 border-amber-700 bg-white px-5 py-3 text-sm font-semibold text-amber-900 transition duration-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                danger
                  ? "bg-amber-800 hover:bg-amber-900"
                  : "bg-amber-800 hover:bg-amber-900"
              }`}
            >
              {isLoading ? "İşleniyor..." : confirmText}
            </button>
          </div>
        )}

        {/* NORMAL TAMAM BUTONU */}

        {mode === "message" && type !== "success" && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-amber-800 px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-amber-900 hover:shadow-lg"
          >
            Tamam
          </button>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;
