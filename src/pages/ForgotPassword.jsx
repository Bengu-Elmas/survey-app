import { useState } from "react";
import { Link } from "react-router-dom";

import AuthBackground from "../components/AuthBackground.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";

import { useAuth } from "../context/AuthContext.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  function showFeedback(type, title, message) {
    setFeedback({
      isOpen: true,
      type,
      title,
      message,
    });
  }

  function closeFeedback() {
    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      isOpen: false,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (email.trim() === "") {
      showFeedback(
        "warning",
        "E-posta adresi gerekli",
        "Şifrenizi sıfırlayabilmek için hesabınıza ait e-posta adresini yazmalısınız.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await resetPassword(email);

      showFeedback(
        "success",
        "E-posta gönderildi!",
        "Bu e-posta adresiyle kayıtlı bir hesap bulunuyorsa şifre sıfırlama bağlantısı gelen kutunuza gönderildi.",
      );

      setEmail("");
    } catch (error) {
      console.error("Şifre sıfırlama sırasında hata oluştu:", error);

      if (error.code === "auth/invalid-email") {
        showFeedback(
          "error",
          "Geçersiz e-posta",
          "Lütfen geçerli bir e-posta adresi girin.",
        );
      } else if (error.code === "auth/too-many-requests") {
        showFeedback(
          "warning",
          "Çok fazla istek gönderildi",
          "Kısa süre içerisinde çok fazla şifre sıfırlama isteği gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
        );
      } else if (error.code === "auth/user-not-found") {
        /*
          Hesabın var olup olmadığını açıkça söylemeyerek
          kullanıcı gizliliğini koruyoruz.
        */

        showFeedback(
          "success",
          "E-posta gönderildi!",
          "Bu e-posta adresiyle kayıtlı bir hesap bulunuyorsa şifre sıfırlama bağlantısı gelen kutunuza gönderildi.",
        );
      } else {
        showFeedback(
          "error",
          "E-posta gönderilemedi",
          "Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={closeFeedback}
      />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950 via-amber-700 to-amber-500 px-4 py-10 sm:px-6">
        <AuthBackground />

        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-6 shadow-xl shadow-amber-950/20 sm:p-8">
          {/* BAŞLIK */}

          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 shadow-inner">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-12 w-12 text-amber-900"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />

                <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />

                <path d="M12 14v2" strokeLinecap="round" />
              </svg>
            </div>

            <p className="font-stack-notch mt-5 text-sm font-bold tracking-[0.16em] text-amber-700">
              ŞİFRE SIFIRLAMA
            </p>

            <h1 className="font-stack-notch mt-2 text-3xl font-bold text-amber-950">
              Şifreni mi Unuttun?
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
              Hesabına ait e-posta adresini yaz. Şifreni yenileyebilmen için
              sana bir sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
              >
                E-POSTA
              </label>

              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@mail.com"
                autoComplete="email"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-800 px-5 py-3.5 font-semibold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:scale-[1.01] hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "E-POSTA GÖNDERİLİYOR..."
                : "ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDER"}
            </button>
          </form>

          {/* LOGIN */}

          <div className="mt-7 border-t border-amber-200 pt-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              Şifreni hatırladın mı?{" "}
              <Link
                to="/login"
                className="font-bold text-amber-800 transition hover:text-amber-950"
              >
                GİRİŞ YAP
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default ForgotPassword;
