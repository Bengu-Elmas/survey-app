import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthBackground from "../components/AuthBackground.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Profile() {
  const {
    currentUser,
    userProfile,
    isAdmin,
    updateAccountProfile,
    changePassword,
  } = useAuth();

  const storedProfileName = (
    userProfile?.fullName ||
    userProfile?.name ||
    currentUser?.displayName ||
    ""
  ).trim();

  const profileDisplayName = storedProfileName || "Survey App Kullanıcısı";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  /* KAYITLI BİLGİLERİ FORMA YERLEŞTİR */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const displayNameParts = storedProfileName.split(" ").filter(Boolean);

    setFirstName(userProfile?.firstName || displayNameParts[0] || "");

    setLastName(
      userProfile?.lastName || displayNameParts.slice(1).join(" ") || "",
    );

    setEmail(userProfile?.email || currentUser.email || "");
  }, [currentUser, userProfile, storedProfileName]);

  const originalNameParts = storedProfileName.split(" ").filter(Boolean);

  const originalFirstName =
    userProfile?.firstName || originalNameParts[0] || "";

  const originalLastName =
    userProfile?.lastName || originalNameParts.slice(1).join(" ") || "";
  const originalEmail = (
    userProfile?.email ||
    currentUser?.email ||
    ""
  ).toLowerCase();

  const emailChanged = email.trim().toLowerCase() !== originalEmail;

  const profileChanged =
    firstName.trim() !== originalFirstName ||
    lastName.trim() !== originalLastName ||
    emailChanged;

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
  async function handleChangePassword() {
    if (isChangingPassword) {
      return;
    }

    if (
      passwordCurrent.trim() === "" ||
      newPassword.trim() === "" ||
      confirmNewPassword.trim() === ""
    ) {
      showFeedback(
        "warning",
        "Eksik bilgiler var",
        "Şifrenizi değiştirmek için tüm şifre alanlarını doldurmalısınız.",
      );

      return;
    }

    if (newPassword !== confirmNewPassword) {
      showFeedback(
        "warning",
        "Şifreler eşleşmiyor",
        "Yeni şifre ve yeni şifre tekrar alanları aynı olmalıdır.",
      );

      return;
    }

    if (newPassword.length < 6) {
      showFeedback(
        "warning",
        "Şifre çok kısa",
        "Yeni şifreniz en az 6 karakter olmalıdır.",
      );

      return;
    }

    if (passwordCurrent === newPassword) {
      showFeedback(
        "warning",
        "Yeni bir şifre belirleyin",
        "Yeni şifreniz mevcut şifrenizle aynı olmamalıdır.",
      );

      return;
    }

    try {
      setIsChangingPassword(true);

      await changePassword(passwordCurrent, newPassword);

      setPasswordCurrent("");
      setNewPassword("");
      setConfirmNewPassword("");

      setShowPasswordCurrent(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);

      setShowPasswordSection(false);

      showFeedback(
        "success",
        "Şifreniz güncellendi!",
        "Yeni şifreniz başarıyla kaydedildi.",
      );
    } catch (error) {
      console.error("Şifre değiştirilirken hata oluştu:", error);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showFeedback(
          "error",
          "Mevcut şifre yanlış",
          "Yazdığınız mevcut şifre doğru değil. Lütfen tekrar deneyin.",
        );
      } else if (error.code === "auth/weak-password") {
        showFeedback(
          "error",
          "Şifre yeterince güçlü değil",
          "Lütfen daha güçlü bir şifre belirleyin.",
        );
      } else if (error.code === "auth/too-many-requests") {
        showFeedback(
          "error",
          "Çok fazla deneme yapıldı",
          "Güvenlik nedeniyle işlem geçici olarak sınırlandırıldı. Lütfen daha sonra tekrar deneyin.",
        );
      } else {
        showFeedback(
          "error",
          "Şifre güncellenemedi",
          "Şifreniz değiştirilirken beklenmeyen bir hata oluştu.",
        );
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      firstName.trim() === "" ||
      lastName.trim() === "" ||
      email.trim() === ""
    ) {
      showFeedback(
        "warning",
        "Eksik bilgiler var",
        "Ad, soyad ve e-posta alanlarının tamamını doldurmalısınız.",
      );

      return;
    }

    if (!profileChanged) {
      showFeedback(
        "warning",
        "Değişiklik bulunmuyor",
        "Kaydedebilmek için profil bilgilerinizden en az birini değiştirmelisiniz.",
      );

      return;
    }

    if (emailChanged && currentPassword.trim() === "") {
      showFeedback(
        "warning",
        "Mevcut şifre gerekli",
        "E-posta adresinizi değiştirmek için mevcut şifrenizi yazmalısınız.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const updateResult = await updateAccountProfile(
        firstName,
        lastName,
        email,
        currentPassword,
      );

      setCurrentPassword("");

      if (updateResult.emailVerificationSent) {
        showFeedback(
          "success",
          "Doğrulama e-postası gönderildi!",
          `${updateResult.pendingEmail} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladığında e-posta adresin değişecek.`,
        );
      } else {
        showFeedback(
          "success",
          "Bilgilerin güncellendi!",
          "Profil bilgileriniz başarıyla güncellendi.",
        );
      }
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);

      if (error.code === "profile/missing-fields") {
        showFeedback(
          "warning",
          "Eksik bilgiler var",
          "Ad, soyad ve e-posta alanlarının tamamını doldurmalısınız.",
        );
      } else if (error.code === "profile/password-required") {
        showFeedback(
          "warning",
          "Mevcut şifre gerekli",
          "E-posta adresinizi değiştirmek için mevcut şifrenizi yazmalısınız.",
        );
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showFeedback(
          "error",
          "Şifre doğrulanamadı",
          "Yazdığınız mevcut şifre doğru değil. Lütfen tekrar deneyin.",
        );
      } else if (error.code === "auth/email-already-in-use") {
        showFeedback(
          "error",
          "E-posta kullanılıyor",
          "Bu e-posta adresi başka bir hesap tarafından kullanılıyor.",
        );
      } else if (error.code === "auth/invalid-email") {
        showFeedback(
          "error",
          "Geçersiz e-posta",
          "Lütfen geçerli bir e-posta adresi yazın.",
        );
      } else if (error.code === "auth/too-many-requests") {
        showFeedback(
          "error",
          "Çok fazla deneme yapıldı",
          "Güvenlik nedeniyle işlemler geçici olarak sınırlandırıldı. Lütfen daha sonra tekrar deneyin.",
        );
      } else if (error.code === "auth/requires-recent-login") {
        showFeedback(
          "error",
          "Yeniden giriş gerekli",
          "Güvenlik nedeniyle hesabınızdan çıkıp tekrar giriş yaptıktan sonra yeniden deneyin.",
        );
      } else {
        showFeedback(
          "error",
          "Bilgiler güncellenemedi",
          "Profil bilgileriniz güncellenirken beklenmeyen bir hata oluştu.",
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

        {/* TEK PARÇA PROFİL PANELİ */}

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/25 bg-white/10 shadow-2xl shadow-amber-950/30 backdrop-blur-sm lg:grid-cols-[0.9fr_1.1fr]">
          {/* SOL TANITIM ALANI */}

          <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden px-8 py-12 text-white sm:px-10 lg:min-h-[680px] lg:px-12 lg:py-14">
            <div className="relative z-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-amber-50 backdrop-blur-sm transition duration-300 hover:bg-white/20"
              >
                <span aria-hidden="true">←</span>
                {isAdmin ? "Admin Paneline Dön" : "Anketlerime Dön"}
              </Link>

              <img
                src={isAdmin ? "/adminicon.svg" : "/usericon.svg"}
                alt=""
                className="mt-12 h-24 w-24 drop-shadow-xl"
              />

              <p className="font-stack-notch mt-7 text-base font-bold tracking-[0.18em] text-amber-200">
                {isAdmin ? "ADMIN HESAP AYARLARI" : "HESAP AYARLARI"}
              </p>

              <h1 className="font-stack-notch mt-4 max-w-md text-4xl font-bold leading-tight sm:text-5xl">
                {isAdmin
                  ? "Admin hesabını ve yönetim bilgilerini güncel tut."
                  : "Profilin değiştiğinde Survey App de seninle güncellensin."}
              </h1>

              <p className="mt-6 max-w-md text-base font-medium leading-8 text-amber-50/90">
                {isAdmin
                  ? "Profil bilgilerini düzenle ve Survey App içerisindeki kullanıcı anketlerini admin yetkinle yönetmeye devam et."
                  : "Kişisel bilgilerini güncel tut, hesabını düzenle ve anketlerini kendi profilin üzerinden yönetmeye devam et."}
              </p>
            </div>

            <div className="relative z-10 mt-10 rounded-2xl border border-white/20 bg-amber-950/20 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-stack-notch text-sm font-bold text-amber-100">
                  {isAdmin ? "Aktif admin hesabı" : "Aktif kullanıcı"}
                </p>

                {isAdmin && (
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-extrabold tracking-wide text-amber-950">
                    ADMIN
                  </span>
                )}
              </div>

              <p className="font-stack-notch mt-2 text-xl font-bold text-white">
                {profileDisplayName}
              </p>

              <p className="mt-1 text-sm font-medium text-amber-100/80">
                {userProfile?.email || currentUser?.email}
              </p>
            </div>
          </section>

          {/* FORM ALANI */}

          <section className="relative bg-gradient-to-br from-white via-white to-amber-50 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            {/* SOL GRADIENTTEN FORMA GEÇİŞ */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-amber-600/10 to-transparent lg:block"
            />

            <div className="relative z-10">
              <p className="font-stack-notch text-sm font-bold tracking-[0.16em] text-amber-700">
                {isAdmin ? "ADMIN HESAP BİLGİLERİ" : "HESAP BİLGİLERİN"}
              </p>

              <h2 className="font-stack-notch mt-2 text-3xl font-bold text-amber-950 sm:text-4xl">
                {isAdmin
                  ? "Admin Bilgilerini Güncelle"
                  : "Bilgilerini Güncelle"}
              </h2>

              <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-slate-600">
                Ad, soyad ve e-posta bilgilerini buradan düzenleyebilirsin.
              </p>

              <form onSubmit={handleSubmit} className="mt-9 space-y-6">
                {/* AD VE SOYAD */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profile-first-name"
                      className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                    >
                      AD
                    </label>

                    <input
                      id="profile-first-name"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Adınız"
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-last-name"
                      className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                    >
                      SOYAD
                    </label>

                    <input
                      id="profile-last-name"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Soyadınız"
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>

                {/* E-POSTA */}

                <div>
                  <label
                    htmlFor="profile-email"
                    className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                  >
                    E-POSTA
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* E-POSTA DEĞİŞTİRİLİRSE ŞİFRE */}

                {emailChanged && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                    <p className="font-stack-notch text-sm font-bold text-amber-950">
                      E-posta değişikliği doğrulaması
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-amber-800">
                      E-posta adresini değiştirebilmek için mevcut şifreni
                      yazmalısın.
                    </p>

                    <label
                      htmlFor="profile-current-password"
                      className="font-stack-notch mb-2 mt-5 block text-sm font-bold text-amber-950"
                    >
                      MEVCUT ŞİFRE
                    </label>

                    <div className="relative">
                      <input
                        id="profile-current-password"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(event.target.value)
                        }
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                      >
                        <img
                          src={
                            showPassword
                              ? "/sifre-acik.svg"
                              : "/sifre-gizli.svg"
                          }
                          alt=""
                          className="h-6 w-6"
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* ŞİFRE DEĞİŞTİR */}

                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full rounded-xl bg-amber-100 px-5 py-4 font-semibold text-amber-900 transition duration-300 hover:bg-amber-200"
                >
                  {showPasswordSection
                    ? "ŞİFRE DEĞİŞTİRMEYİ KAPAT"
                    : "ŞİFREMİ DEĞİŞTİR"}
                </button>

                {showPasswordSection && (
                  <div className="rounded-2xl bg-amber-50 p-5">
                    <p className="font-stack-notch text-lg font-bold text-amber-950">
                      Şifreni Değiştir
                    </p>

                    <p className="mt-1 text-sm font-medium text-amber-800">
                      Güvenliğin için mevcut şifreni doğruladıktan sonra yeni
                      bir şifre belirleyebilirsin.
                    </p>

                    <div className="mt-5 space-y-4">
                      {/* MEVCUT ŞİFRE */}

                      <div>
                        <label
                          htmlFor="password-current"
                          className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                        >
                          MEVCUT ŞİFRE
                        </label>

                        <div className="relative">
                          <input
                            id="password-current"
                            type={showPasswordCurrent ? "text" : "password"}
                            value={passwordCurrent}
                            onChange={(event) =>
                              setPasswordCurrent(event.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordCurrent(!showPasswordCurrent)
                            }
                            aria-label={
                              showPasswordCurrent
                                ? "Şifreyi gizle"
                                : "Şifreyi göster"
                            }
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                          >
                            <img
                              src={
                                showPasswordCurrent
                                  ? "/sifre-acik.svg"
                                  : "/sifre-gizli.svg"
                              }
                              alt=""
                              className="h-6 w-6"
                            />
                          </button>
                        </div>
                      </div>

                      {/* YENİ ŞİFRE */}

                      <div>
                        <label
                          htmlFor="new-password"
                          className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                        >
                          YENİ ŞİFRE
                        </label>

                        <div className="relative">
                          <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(event.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={
                              showNewPassword
                                ? "Şifreyi gizle"
                                : "Şifreyi göster"
                            }
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                          >
                            <img
                              src={
                                showNewPassword
                                  ? "/sifre-acik.svg"
                                  : "/sifre-gizli.svg"
                              }
                              alt=""
                              className="h-6 w-6"
                            />
                          </button>
                        </div>
                      </div>

                      {/* YENİ ŞİFRE TEKRAR */}

                      <div>
                        <label
                          htmlFor="confirm-new-password"
                          className="font-stack-notch mb-2 block text-sm font-bold text-amber-950"
                        >
                          YENİ ŞİFRE TEKRAR
                        </label>

                        <div className="relative">
                          <input
                            id="confirm-new-password"
                            type={showConfirmNewPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(event) =>
                              setConfirmNewPassword(event.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmNewPassword(!showConfirmNewPassword)
                            }
                            aria-label={
                              showConfirmNewPassword
                                ? "Şifreyi gizle"
                                : "Şifreyi göster"
                            }
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition hover:bg-amber-100"
                          >
                            <img
                              src={
                                showConfirmNewPassword
                                  ? "/sifre-acik.svg"
                                  : "/sifre-gizli.svg"
                              }
                              alt=""
                              className="h-6 w-6"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="mt-5 w-full rounded-xl bg-amber-800 px-5 py-3.5 font-semibold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:scale-[1.01] hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isChangingPassword
                        ? "ŞİFRE GÜNCELLENİYOR..."
                        : "ŞİFREYİ GÜNCELLE"}
                    </button>
                  </div>
                )}

                {/* KAYDET */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-amber-800 px-5 py-4 font-semibold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:scale-[1.01] hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "BİLGİLER GÜNCELLENİYOR..."
                    : "DEĞİŞİKLİKLERİ KAYDET"}
                </button>

                <p className="text-center text-xs font-medium leading-5 text-slate-900">
                  Yaptığın değişiklikler hesabına ve Survey App profil
                  bilgilerine uygulanır.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Profile;
