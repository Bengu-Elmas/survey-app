import surveys from "../data/surveys";
import SurveyCard from "./SurveyCard";
function Dashboard() {
  return (
    <main>
      <h1>Anketlerim</h1>
      <p>Oluşturduğum anketler burada listelenecek.</p>
      <section>
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </section>
    </main>
  );
}

export default Dashboard;
