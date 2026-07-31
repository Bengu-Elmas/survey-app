import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthBackground from "../components/AuthBackground.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";

import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (email.trim() === "" || password === "") {
      showFeedback(
        "warning",
        "Eksik bilgiler var",
        "Giriş yapabilmek için e-posta ve şifre alanlarını doldurmalısınız.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await login(email.trim(), password);

      showFeedback(
        "success",
        "Giriş başarılı!",
        "Tekrar hoş geldin. Ana sayfaya yönlendiriliyorsun...",
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Giriş sırasında hata oluştu:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        showFeedback(
          "error",
          "Giriş yapılamadı",
          "E-posta adresinizi veya şifrenizi kontrol edin.",
        );
      } else if (error.code === "auth/invalid-email") {
        showFeedback(
          "error",
          "Geçersiz e-posta",
          "Lütfen geçerli bir e-posta adresi girin.",
        );
      } else {
        showFeedback(
          "error",
          "Giriş yapılamadı",
          "Giriş sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
          {/* İKON */}

          <div className="text-center">
            <img
              src="/giris-icon.svg"
              alt="Giriş yap"
              className="mx-auto h-24 w-24"
            />

            <p className="font-stack-notch mt-5 text-sm font-bold tracking-[0.16em] text-amber-700">
              HOŞ GELDİN
            </p>

            <h1 className="font-stack-notch mt-2 text-3xl font-bold text-amber-950">
              Hesabına Giriş Yap
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
              Anketlerini yönetmeye ve sonuçlarını takip etmeye kaldığın yerden
              devam et.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* E-POSTA */}

            <div>
              <label
                htmlFor="email"
                className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
              >
                E-POSTA
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@mail.com"
                autoComplete="email"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            {/* ŞİFRE */}

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="font-stack-notch block text-sm font-bold text-amber-950"
                >
                  ŞİFRE
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-amber-700 transition hover:text-amber-950"
                >
                  ŞİFREMİ UNUTTUM ?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                >
                  <img
                    src={showPassword ? "/sifre-acik.svg" : "/sifre-gizli.svg"}
                    alt=""
                    className="h-6 w-6"
                  />
                </button>
              </div>
            </div>

            {/* GİRİŞ */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-800 px-5 py-3.5 font-semibold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:scale-[1.01] hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
            </button>
          </form>

          {/* REGISTER */}

          <div className="mt-7 border-t border-amber-200 pt-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              Henüz bir hesabın yok mu?{" "}
              <Link
                to="/register"
                className="font-bold text-amber-800 transition hover:text-amber-950"
              >
                KAYIT OL
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
