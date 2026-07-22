import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Anketlerim
          </Link>

          <Link
            to="/create"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Yeni Anket Oluştur
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
