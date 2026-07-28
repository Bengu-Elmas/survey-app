function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* YAYINDA */}

      <img
        src="/yayinda-logo.svg"
        alt=""
        className="auth-float absolute left-[7%] top-[12%] h-24 w-24 opacity-20"
        style={{ animationDelay: "0s" }}
      />

      <img
        src="/yayinda-logo.svg"
        alt=""
        className="auth-float absolute bottom-[12%] right-[8%] h-20 w-20 opacity-15"
        style={{ animationDelay: "2s" }}
      />

      {/* TASLAK */}

      <img
        src="/taslak-logo.svg"
        alt=""
        className="auth-float absolute right-[10%] top-[18%] h-28 w-28 opacity-20"
        style={{ animationDelay: "1s" }}
      />

      <img
        src="/taslak-logo.svg"
        alt=""
        className="auth-float absolute bottom-[15%] left-[10%] h-20 w-20 opacity-15"
        style={{ animationDelay: "3s" }}
      />

      {/* SPARKLE */}

      <span
        className="auth-float absolute left-[20%] top-[38%] text-5xl text-amber-100/30"
        style={{ animationDelay: "1.5s" }}
      >
        ✦
      </span>

      <span
        className="auth-float absolute bottom-[25%] right-[22%] text-4xl text-amber-100/25"
        style={{ animationDelay: "4s" }}
      >
        ✦
      </span>

      <span
        className="auth-float absolute right-[30%] top-[8%] text-3xl text-white/20"
        style={{ animationDelay: "2.5s" }}
      >
        ✦
      </span>
    </div>
  );
}

export default AuthBackground;
