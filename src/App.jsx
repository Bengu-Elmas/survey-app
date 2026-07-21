import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateSurvey from "./pages/CreateSurvey.jsx";
import EditSurvey from "./pages/EditSurvey.jsx";
import Results from "./pages/Results.jsx";
import SurveyFill from "./pages/SurveyFill.jsx";
import ThankYou from "./pages/ThankYou.jsx";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname.startsWith("/survey/") ||
    location.pathname.startsWith("/thank-you/");
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateSurvey />} />
        <Route path="/edit/:surveyId" element={<EditSurvey />} />
        <Route path="/results/:surveyId" element={<Results />} />
        <Route path="/survey/:surveyId" element={<SurveyFill />} />
        <Route path="/thank-you/:surveyId" element={<ThankYou />} />
      </Routes>
    </>
  );
}

export default App;
