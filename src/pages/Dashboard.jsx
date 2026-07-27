import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";

import { db } from "../firebase.js";
import SurveyCard from "../components/SurveyCard.jsx";

function Dashboard() {
  const [surveyDocuments, setSurveyDocuments] = useState([]);
  const [responses, setResponses] = useState([]);

  const [surveysLoaded, setSurveysLoaded] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);

  /* FIRESTORE'DAN ANKETLERİ DİNLE */

  useEffect(() => {
    const unsubscribeSurveys = onSnapshot(
      collection(db, "surveys"),

      (snapshot) => {
        const surveyList = snapshot.docs.map((surveyDoc) => ({
          id: surveyDoc.id,
          ...surveyDoc.data(),
        }));

        setSurveyDocuments(surveyList);
        setSurveysLoaded(true);
      },

      (error) => {
        console.error("Anketler alınırken hata oluştu:", error);
        setSurveysLoaded(true);
      },
    );

    return () => {
      unsubscribeSurveys();
    };
  }, []);

  /* FIRESTORE'DAN YANITLARI DİNLE */

  useEffect(() => {
    const unsubscribeResponses = onSnapshot(
      collection(db, "responses"),

      (snapshot) => {
        const responseList = snapshot.docs.map((responseDoc) => ({
          id: responseDoc.id,
          ...responseDoc.data(),
        }));

        setResponses(responseList);
        setResponsesLoaded(true);
      },

      (error) => {
        console.error("Yanıtlar alınırken hata oluştu:", error);
        setResponsesLoaded(true);
      },
    );

    return () => {
      unsubscribeResponses();
    };
  }, []);

  /* BİR CEVABIN DOLU OLUP OLMADIĞINI KONTROL ET */

  function isStoredAnswerFilled(answer) {
    if (answer === undefined || answer === null) {
      return false;
    }

    if (typeof answer === "string") {
      return answer.trim() !== "";
    }

    /*
      Multiple-choice cevapları artık:

      {
        optionIndex: 2,
        value: "Seçenek"
      }

      şeklinde tutuluyor.
    */

    if (typeof answer === "object") {
      if ("value" in answer) {
        return String(answer.value).trim() !== "";
      }

      return true;
    }

    return true;
  }

  /* HER ANKET İÇİN GERÇEK İSTATİSTİKLERİ HESAPLA */

  const surveys =
    surveysLoaded && responsesLoaded
      ? surveyDocuments.map((survey) => {
          const surveyResponses = responses.filter(
            (response) => response.surveyId === survey.id,
          );

          const questions = survey.questions || [];

          const responseCount = surveyResponses.length;

          let completionRate = 0;

          if (responseCount > 0 && questions.length > 0) {
            let answeredQuestionCount = 0;

            surveyResponses.forEach((response) => {
              questions.forEach((question) => {
                const answer = response.answers?.[question.id];

                if (isStoredAnswerFilled(answer)) {
                  answeredQuestionCount += 1;
                }
              });
            });

            const totalPossibleAnswers = responseCount * questions.length;

            completionRate = Math.round(
              (answeredQuestionCount / totalPossibleAnswers) * 100,
            );
          }

          return {
            ...survey,

            questionCount:
              survey.questions?.length ?? survey.questionCount ?? 0,

            responseCount,

            completionRate,
          };
        })
      : [];

  /* DASHBOARD GENEL İSTATİSTİKLERİ */

  const totalSurveys = surveys.length;

  const publishedSurveys = surveys.filter(
    (survey) => survey.status === "Yayında",
  ).length;

  const totalResponses = surveys.reduce(
    (total, survey) => total + survey.responseCount,
    0,
  );

  const averageCompletion =
    surveys.length > 0
      ? Math.round(
          surveys.reduce((total, survey) => total + survey.completionRate, 0) /
            surveys.length,
        )
      : 0;

  /* ANKETİ VE O ANKETE AİT RESPONSE'LARI SİL */

  async function handleDelete(surveyId) {
    const confirmed = window.confirm(
      "Bu anketi ve ankete ait tüm yanıtları silmek istediğinize emin misiniz?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const relatedResponses = responses.filter(
        (response) => response.surveyId === surveyId,
      );

      await Promise.all(
        relatedResponses.map((response) =>
          deleteDoc(doc(db, "responses", response.id)),
        ),
      );

      await deleteDoc(doc(db, "surveys", surveyId));

      console.log("Anket ve ankete ait yanıtlar Firebase'den silindi.");
    } catch (error) {
      console.error("Anket silinirken hata oluştu:", error);
    }
  }

  /* PAYLAŞ */

  async function handleShare(survey) {
    const surveyUrl = `${window.location.origin}/survey/${survey.id}`;

    try {
      await navigator.clipboard.writeText(surveyUrl);

      alert("Anket bağlantısı panoya kopyalandı.");
    } catch (error) {
      console.error("Bağlantı kopyalanırken hata oluştu:", error);
    }
  }

  const loading = !surveysLoaded || !responsesLoaded;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* ÜST KARŞILAMA ALANI */}

        <section className="rounded-3xl bg-gradient-to-r from-amber-950 via-amber-700 to-amber-400 px-8 py-10 text-white shadow-lg shadow-amber-900/20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-amber-100">DASHBOARD</p>

              <h1 className="font-stack-notch mt-2 text-3xl font-bold md:text-4xl">
                Anketlerini tek yerden yönet
              </h1>

              <p className="mt-4 leading-7 text-amber-50">
                Anketlerini oluştur, düzenle ve katılımcılardan gelen yanıtları
                kolayca takip et.
              </p>
            </div>

            <Link
              to="/create"
              className="w-fit rounded-xl bg-white px-5 py-3 font-semibold text-amber-900 shadow-md transition duration-300 hover:scale-105 hover:bg-amber-50"
            >
              + Yeni Anket Oluştur
            </Link>
          </div>
        </section>

        {/* İSTATİSTİKLER */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-5 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <p className="text-sm font-semibold text-amber-800">Toplam Anket</p>

            <p className="mt-2 text-3xl font-bold text-amber-950">
              {totalSurveys}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-5 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <p className="text-sm font-semibold text-amber-800">
              Yayındaki Anket
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-950">
              {publishedSurveys}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-5 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <p className="text-sm font-semibold text-amber-800">Toplam Yanıt</p>

            <p className="mt-2 text-3xl font-bold text-amber-950">
              {totalResponses}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 p-5 shadow-lg shadow-amber-200/40 transition duration-300 hover:scale-105 hover:shadow-xl">
            <p className="text-sm font-semibold text-amber-800">
              Ortalama Tamamlanma
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-950">
              %{averageCompletion}
            </p>
          </div>
        </section>

        {/* ANKETLER */}

        <section className="mt-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-12 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-amber-800" />

            <div>
              <h2 className="font-stack-notch text-2xl font-bold text-amber-950">
                Anketlerim
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-700">
                Oluşturduğun tüm anketleri buradan yönetebilirsin.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-amber-900">
                Anketler yükleniyor...
              </p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-10 text-center">
              <p className="font-stack-notch text-xl font-bold text-amber-950">
                Henüz anket bulunmuyor
              </p>

              <p className="mt-2 text-sm font-medium text-amber-800">
                İlk anketini oluşturarak başlayabilirsin.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {surveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
