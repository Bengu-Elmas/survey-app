import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateSurvey from "./pages/CreateSurvey.jsx";
import EditSurvey from "./pages/EditSurvey.jsx";
import Results from "./pages/Results.jsx";
import SurveyFill from "./pages/SurveyFill.jsx";
import ThankYou from "./pages/ThankYou.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/survey/") ||
    location.pathname.startsWith("/thank-you/") ||
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname === "/profile" ||
    location.pathname === "/forgot-password";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              {" "}
              {/* ProtectedRoute bize eğer giriş yapılmamışsa bu sayfanın açılmamasını sağlıyor */}
              <CreateSurvey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:surveyId"
          element={
            <ProtectedRoute>
              <EditSurvey />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results/:surveyId"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        <Route path="/survey/:surveyId" element={<SurveyFill />} />
        <Route path="/thank-you/:surveyId" element={<ThankYou />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

export default App;
