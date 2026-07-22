import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

function Navbar() {
  return (
    <header className="relative z-20 bg-slate-100 px-6 pt-4">
      <nav className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-400/40">
        <div className="flex items-center justify-between px-6 py-4">
          <Logo />

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Anketlerim
            </Link>

            <Link
              to="/create"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
            >
              Yeni Anket Oluştur
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
