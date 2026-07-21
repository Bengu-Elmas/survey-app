import { Link } from "react-router-dom";

function SurveyCard({ survey }) {
  return (
    <article>
      <h2>{survey.title}</h2>

      <p>{survey.description}</p>

      <p>Durum: {survey.status}</p>

      <p>Soru sayısı: {survey.questionCount}</p>

      <p>Yanıt sayısı: {survey.responseCount}</p>

      <Link to={`/edit/${survey.id}`}>Düzenle</Link>
      {" | "}
      <Link to={`/results/${survey.id}`}>Sonuçlar</Link>
    </article>
  );
}

export default SurveyCard;
