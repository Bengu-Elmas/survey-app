import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const navigate = useNavigate();

  const { currentUser, userProfile, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName =
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Kullanıcı";

  const userEmail = userProfile?.email || currentUser?.email || "";

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      await logout();

      setUserMenuOpen(false);

      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header
      className={`relative z-20 px-6 pt-4 ${
        currentUser
          ? "bg-slate-100 pb-5"
          : "bg-gradient-to-r from-amber-950 via-amber-700 to-amber-500 pb-0"
      }`}
    >
      <nav className="mx-auto max-w-6xl rounded-2xl border border-amber-200/70 bg-gradient-to-r from-white via-amber-50/50 to-white shadow-lg shadow-amber-950/20">
        <div className="flex items-center justify-between px-6 py-4">
          <Logo />

          {/* GİRİŞ YAPILMIŞSA */}

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="rounded-xl px-5 py-3.5 text-sm font-bold text-amber-900 transition duration-300 hover:bg-amber-100"
              >
                Anketlerim
              </Link>

              <Link
                to="/create"
                className="rounded-xl bg-amber-800 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-300/30 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-900 hover:shadow-lg"
              >
                + Yeni Anket Oluştur
              </Link>

              {/* KULLANICI */}

              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-label="Kullanıcı menüsünü aç"
                  className="flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 pr-4 text-[#461901] shadow-sm transition duration-300 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md"
                >
                  <img src="/usericon.svg" alt="" className="h-10 w-10" />

                  <span className="font-stack-notch max-w-32 truncate text-sm font-bold">
                    {userName}
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                    className={`h-4 w-4 transition duration-300 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* DROPDOWN */}

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xl shadow-amber-950/10">
                    {/* KULLANICI BİLGİLERİ */}

                    <div className="bg-gradient-to-br from-amber-50 to-white px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src="/usericon.svg" alt="" className="h-12 w-12" />

                        <div className="min-w-0">
                          <p className="font-stack-notch truncate text-base font-bold text-[#461901]">
                            {userName}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MENÜ İŞLEMLERİ */}

                    <div className="space-y-2 border-t border-amber-100 p-2">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-amber-900 transition duration-300 hover:bg-amber-100"
                      >
                        PROFİLİMİ DÜZENLE
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center justify-center rounded-xl bg-[#461901] px-4 py-3 text-sm font-bold text-white transition duration-300 hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoggingOut ? "ÇIKIŞ YAPILIYOR..." : "ÇIKIŞ YAP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* GİRİŞ YAPILMAMIŞSA */

            <div className="flex items-center rounded-full bg-[#461901] px-5 py-3 shadow-md shadow-amber-950/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <img
                src="/girisyapkaydolicon.svg"
                alt=""
                className="mr-3 h-6 w-6"
              />

              <Link
                to="/login"
                className="text-sm font-bold text-amber-50 transition hover:text-amber-200"
              >
                GİRİŞ YAP
              </Link>

              <span className="mx-2 text-amber-200/70">|</span>

              <Link
                to="/register"
                className="text-sm font-bold text-amber-50 transition hover:text-amber-200"
              >
                KAYDOL
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
