import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthBackground from "../components/AuthBackground.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";

import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
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

    if (
      firstName.trim() === "" ||
      lastName.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      passwordAgain === ""
    ) {
      showFeedback(
        "warning",
        "Eksik bilgiler var",
        "Kayıt olabilmek için tüm alanları doldurmalısınız.",
      );

      return;
    }

    if (password !== passwordAgain) {
      showFeedback(
        "warning",
        "Şifreler eşleşmiyor",
        "Girdiğiniz iki şifrenin aynı olduğundan emin olun.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      await register(firstName, lastName, email.trim(), password);

      showFeedback(
        "success",
        "Hesabın oluşturuldu!",
        "Survey App'e hoş geldin. Ana sayfaya yönlendiriliyorsun...",
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Kayıt sırasında hata oluştu:", error);

      if (error.code === "auth/email-already-in-use") {
        showFeedback(
          "error",
          "Bu e-posta zaten kullanımda",
          "Bu e-posta adresiyle daha önce bir hesap oluşturulmuş.",
        );
      } else if (error.code === "auth/invalid-email") {
        showFeedback(
          "error",
          "Geçersiz e-posta",
          "Lütfen geçerli bir e-posta adresi girin.",
        );
      } else if (error.code === "auth/weak-password") {
        showFeedback(
          "error",
          "Şifre yeterince güçlü değil",
          "Lütfen daha güçlü bir şifre belirleyin.",
        );
      } else {
        showFeedback(
          "error",
          "Hesap oluşturulamadı",
          "Kayıt sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950 via-amber-700 to-amber-500 px-6 py-10">
        <AuthBackground />
        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-8 shadow-xl shadow-amber-200/30">
          {/* İKON */}

          <div className="text-center">
            <img
              src="/kayit-icon.svg"
              alt="Kayıt ol"
              className="mx-auto h-24 w-24"
            />

            <p className="font-stack-notch mt-5 text-sm font-bold tracking-[0.16em] text-amber-700">
              YENİ HESAP
            </p>

            <h1 className="font-stack-notch mt-2 text-3xl font-bold text-amber-950">
              Aramıza katıl
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">
              Kendi anketlerini oluşturmak, düzenlemek ve sonuçlarını takip
              etmek için hesabını oluştur.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* AD + SOYAD */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                >
                  AD
                </label>

                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Adınız"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                >
                  SOYAD
                </label>

                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Soyadınız"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

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
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            {/* ŞİFRE */}

            <div>
              <label
                htmlFor="password"
                className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
              >
                ŞİFRE
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
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

            {/* ŞİFRE TEKRAR */}

            <div>
              <label
                htmlFor="password-again"
                className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
              >
                ŞİFRE TEKRAR
              </label>

              <div className="relative">
                <input
                  id="password-again"
                  type={showPasswordAgain ? "text" : "password"}
                  value={passwordAgain}
                  onChange={(event) => setPasswordAgain(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                  aria-label={
                    showPasswordAgain ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                >
                  <img
                    src={
                      showPasswordAgain ? "/sifre-acik.svg" : "/sifre-gizli.svg"
                    }
                    alt=""
                    className="h-6 w-6"
                  />
                </button>
              </div>
            </div>

            {/* KAYIT OL */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-800 px-5 py-3.5 font-semibold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:scale-[1.01] hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "HESAP OLUŞTURULUYOR..." : "KAYIT OL"}
            </button>
          </form>

          {/* LOGIN */}

          <div className="mt-7 border-t border-amber-200 pt-6 text-center">
            <p className="text-sm font-medium text-slate-600">
              Zaten bir hesabın var mı?{" "}
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

export default Register;
