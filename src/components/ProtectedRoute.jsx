import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-stack-notch font-bold text-amber-900">
          Kullanıcı Bilgileri Kontrol Ediliyor...
        </p>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
