import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 transition duration-300 hover:scale-[1.02]"
    >
      <img src="/survey-logo.svg" alt="Survey App logo" className="h-12 w-12" />

      <div>
        <p className="font-stack-notch text-xl font-extrabold tracking-tight text-amber-950">
          Survey App
        </p>

        <p className="text-xs font-medium text-amber-800/70">
          Fikrini paylaş, fark yarat.
        </p>
      </div>
    </Link>
  );
}

export default Logo;
