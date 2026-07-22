import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

function Navbar() {
  return (
    <header className="relative z-20 bg-slate-100 px-6 pt-4 pb-5">
      <nav className="mx-auto max-w-6xl rounded-2xl border border-amber-200/70 bg-gradient-to-r from-white via-amber-50/50 to-white shadow-lg shadow-amber-300/30">
        <div className="flex items-center justify-between px-6 py-4">
          <Logo />

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-900 transition duration-300 hover:bg-amber-100"
            >
              Anketlerim
            </Link>

            <Link
              to="/create"
              className="rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-300/30 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-900 hover:shadow-lg"
            >
              + Yeni Anket Oluştur
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
