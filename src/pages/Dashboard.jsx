import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase.js";
import SurveyCard from "../components/SurveyCard.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import GuestHome from "../components/GuestHome.jsx";
import Footer from "../components/Footer.jsx";

function Dashboard() {
  const { currentUser } = useAuth();

  const [surveyDocuments, setSurveyDocuments] = useState([]);
  const [responses, setResponses] = useState([]);

  const [surveysLoaded, setSurveysLoaded] = useState(false);
  const [responsesLoaded, setResponsesLoaded] = useState(false);

  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("created-desc");

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mode: "message",
  });

  function showFeedback(type, feedbackTitle, message, mode = "message") {
    setFeedback({
      isOpen: true,
      type,
      title: feedbackTitle,
      message,
      mode,
    });
  }

  function closeFeedback() {
    if (isDeleting) {
      return;
    }

    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      isOpen: false,
    }));

    setSurveyToDelete(null);
  }

  function showTemporaryFeedback(type, feedbackTitle, message) {
    showFeedback(type, feedbackTitle, message);

    setTimeout(() => {
      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        isOpen: false,
      }));
    }, 1600);
  }

  /* FIRESTORE'DAN ANKETLERİ DİNLE */

  useEffect(() => {
    if (!currentUser) {
      setSurveyDocuments([]);
      setSurveysLoaded(true);
      return;
    }

    setSurveyDocuments([]);
    setSurveysLoaded(false);

    const surveysQuery = query(
      collection(db, "surveys"),
      where("ownerId", "==", currentUser.uid),
    );

    const unsubscribeSurveys = onSnapshot(
      surveysQuery,

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
  }, [currentUser]);

  /* FIRESTORE'DAN KULLANICININ YANITLARINI DİNLE */

  useEffect(() => {
    if (!currentUser) {
      setResponses([]);
      setResponsesLoaded(true);
      return;
    }

    setResponses([]);
    setResponsesLoaded(false);

    const responsesQuery = query(
      collection(db, "responses"),
      where("surveyOwnerId", "==", currentUser.uid),
    );

    const unsubscribeResponses = onSnapshot(
      responsesQuery,

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

        showFeedback(
          "error",
          "Yanıtlar yüklenemedi",
          "Anket yanıtları alınırken bir hata oluştu. Lütfen tekrar deneyin.",
        );
      },
    );

    return () => {
      unsubscribeResponses();
    };
  }, [currentUser]);

  /* TARİHİ SIRALAMADA KULLANILABİLECEK SAYIYA ÇEVİR */

  function getTimestampValue(timestamp) {
    if (!timestamp) {
      return 0;
    }

    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().getTime();
    }

    if (timestamp.seconds) {
      return timestamp.seconds * 1000;
    }

    const convertedDate = new Date(timestamp);

    if (Number.isNaN(convertedDate.getTime())) {
      return 0;
    }

    return convertedDate.getTime();
  }

  /* BİR CEVABIN DOLU OLUP OLMADIĞINI KONTROL ET */

  function isStoredAnswerFilled(answer) {
    if (answer === undefined || answer === null) {
      return false;
    }

    if (typeof answer === "string") {
      return answer.trim() !== "";
    }

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

  /* ARAMA VE SIRALAMA */

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("tr-TR");

  const filteredAndSortedSurveys = [...surveys]
    .filter((survey) => {
      const normalizedTitle = (survey.title || "").toLocaleLowerCase("tr-TR");

      return normalizedTitle.includes(normalizedSearchTerm);
    })
    .sort((firstSurvey, secondSurvey) => {
      if (sortOption === "created-desc") {
        return (
          getTimestampValue(secondSurvey.createdAt) -
          getTimestampValue(firstSurvey.createdAt)
        );
      }

      if (sortOption === "created-asc") {
        return (
          getTimestampValue(firstSurvey.createdAt) -
          getTimestampValue(secondSurvey.createdAt)
        );
      }

      if (sortOption === "updated-desc") {
        return (
          getTimestampValue(secondSurvey.updatedAt || secondSurvey.createdAt) -
          getTimestampValue(firstSurvey.updatedAt || firstSurvey.createdAt)
        );
      }

      if (sortOption === "updated-asc") {
        return (
          getTimestampValue(firstSurvey.updatedAt || firstSurvey.createdAt) -
          getTimestampValue(secondSurvey.updatedAt || secondSurvey.createdAt)
        );
      }

      if (sortOption === "title-asc") {
        return (firstSurvey.title || "").localeCompare(
          secondSurvey.title || "",
          "tr",
          {
            sensitivity: "base",
          },
        );
      }

      if (sortOption === "title-desc") {
        return (secondSurvey.title || "").localeCompare(
          firstSurvey.title || "",
          "tr",
          {
            sensitivity: "base",
          },
        );
      }

      return 0;
    });

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

  /* SİLME MODALINI AÇ */

  function handleDelete(surveyId) {
    setSurveyToDelete(surveyId);

    showFeedback(
      "warning",
      "Anket silinsin mi?",
      "Bu anket ve ankete ait tüm yanıtlar kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      "confirm",
    );
  }

  /* ANKETİ VE ANKETE AİT YANITLARI SİL */

  async function confirmDelete() {
    if (!surveyToDelete || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      const relatedResponses = responses.filter(
        (response) => response.surveyId === surveyToDelete,
      );

      await Promise.all(
        relatedResponses.map((response) =>
          deleteDoc(doc(db, "responses", response.id)),
        ),
      );

      await deleteDoc(doc(db, "surveys", surveyToDelete));

      console.log("Anket ve ankete ait yanıtlar Firebase'den silindi.");

      setSurveyToDelete(null);

      showTemporaryFeedback(
        "success",
        "Anket silindi!",
        "Anket ve ankete ait tüm yanıtlar başarıyla silindi.",
      );
    } catch (error) {
      console.error("Anket silinirken hata oluştu:", error);

      showFeedback(
        "error",
        "Anket silinemedi",
        "Anket silinirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* PAYLAŞ */

  async function handleShare(survey) {
    if (survey.status !== "Yayında") {
      showFeedback(
        "warning",
        "Taslak anket paylaşılamaz",
        "Anket bağlantısını paylaşabilmek için anketin önce yayınlanması gerekir.",
      );

      return;
    }

    const surveyUrl = `${window.location.origin}/survey/${survey.id}`;

    try {
      await navigator.clipboard.writeText(surveyUrl);

      showTemporaryFeedback(
        "success",
        "Bağlantı kopyalandı!",
        "Anket bağlantısı panoya başarıyla kopyalandı.",
      );
    } catch (error) {
      console.error("Bağlantı kopyalanırken hata oluştu:", error);

      showFeedback(
        "error",
        "Bağlantı kopyalanamadı",
        "Anket bağlantısı panoya kopyalanırken bir hata oluştu.",
      );
    }
  }

  const loading = !surveysLoaded || !responsesLoaded;

  if (!currentUser) {
    return <GuestHome />;
  }

  return (
    <>
      {/* FEEDBACK MODAL */}

      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        mode={feedback.mode}
        onClose={closeFeedback}
        onConfirm={confirmDelete}
        confirmText="Sil"
        cancelText="İptal"
        isLoading={isDeleting}
        danger={feedback.mode === "confirm"}
      />

      <main className="min-h-screen bg-slate-100 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* ÜST KARŞILAMA ALANI */}

          <section className="rounded-3xl bg-gradient-to-r from-amber-950 via-amber-700 to-amber-400 px-8 py-10 text-white shadow-lg shadow-amber-900/20">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-amber-100">
                  DASHBOARD
                </p>

                <h1 className="font-stack-notch mt-2 text-3xl font-bold md:text-4xl">
                  Anketlerini tek yerden yönet
                </h1>

                <p className="mt-4 leading-7 text-amber-50">
                  Anketlerini oluştur, düzenle ve katılımcılardan gelen
                  yanıtları kolayca takip et.
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
              <p className="text-sm font-semibold text-amber-800">
                Toplam Anket
              </p>

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
              <p className="text-sm font-semibold text-amber-800">
                Toplam Yanıt
              </p>

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
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              {/* BAŞLIK */}

              <div className="flex items-center gap-4">
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

              {/* ARAMA VE SIRALAMA */}

              <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_230px] lg:w-auto">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-700"
                  >
                    <circle cx="11" cy="11" r="7" />

                    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                  </svg>

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Anket adına göre ara..."
                    aria-label="Anket adına göre ara"
                    className="h-12 w-full rounded-xl border border-amber-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 sm:min-w-72"
                  />
                </div>

                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                  aria-label="Anketleri sırala"
                  className="h-12 w-full rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-900 shadow-sm outline-none transition duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="created-desc">En yeni oluşturulan</option>
                  <option value="created-asc">En eski oluşturulan</option>
                  <option value="updated-desc">Son güncellenen</option>
                  <option value="updated-asc">En eski güncellenen</option>
                  <option value="title-asc">İsme göre A–Z</option>
                  <option value="title-desc">İsme göre Z–A</option>
                </select>
              </div>
            </div>

            {/* ANKET LİSTESİ */}

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
            ) : filteredAndSortedSurveys.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-10 text-center">
                <p className="font-stack-notch text-xl font-bold text-amber-950">
                  Aramana uygun anket bulunamadı
                </p>

                <p className="mt-2 text-sm font-medium text-amber-800">
                  Farklı bir anket adı yazarak tekrar deneyebilirsin.
                </p>

                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-amber-900"
                >
                  Aramayı Temizle
                </button>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {filteredAndSortedSurveys.map((survey) => (
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

      <Footer />
    </>
  );
}

export default Dashboard;
