import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import surveys from "../data/surveys.js";

function EditSurvey() {
  const { surveyId } = useParams();

  const selectedSurvey = surveys.find((survey) => survey.id === surveyId);

  const [title, setTitle] = useState(selectedSurvey?.title || "");
  const [description, setDescription] = useState(
    selectedSurvey?.description || "",
  );
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (saveMessage === "") {
      return;
    }

    const timer = setTimeout(() => {
      setSaveMessage("");
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [saveMessage]);

  function handleSubmit(event) {
    event.preventDefault();

    const updatedSurvey = {
      ...selectedSurvey,
      title: title,
      description: description,
    };

    console.log(updatedSurvey);
    setSaveMessage("Değişiklikler kaydedildi.");
  }

  if (!selectedSurvey) {
    return (
      <main>
        <h1>Anket bulunamadı</h1>
        <p>Bu ID ile eşleşen bir anket bulunmuyor.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Anketi Düzenle</h1>

      <p>Anket ID: {surveyId}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="survey-title">Anket başlığı:</label>
          <br />

          <input
            id="survey-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label htmlFor="survey-description">Anket açıklaması:</label>
          <br />

          <textarea
            id="survey-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows="4"
            cols="40"
          />
        </div>

        <br />

        <button type="submit">Kaydet</button>
      </form>
      {saveMessage && <p>{saveMessage}</p>}
      <p>Güncel başlık: {title}</p>
      <p>Güncel açıklama: {description}</p>
    </main>
  );
}

export default EditSurvey;
