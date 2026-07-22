import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      </div>

      <div>
        <p className="text-lg font-extrabold tracking-tight text-slate-900">
          SurveyApp
        </p>
        <p className="text-xs text-slate-500">Smart Survey Builder</p>
      </div>
    </Link>
  );
}

export default Logo;
