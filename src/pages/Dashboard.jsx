import { Link } from "react-router-dom";
import surveys from "../data/surveys.js";
import SurveyCard from "../components/SurveyCard.jsx";

function Dashboard() {
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

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Üst karşılama alanı */}
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

        {/* İstatistikler */}
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

        {/* Anketler */}
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

          <div className="grid gap-5 lg:grid-cols-2">
            {surveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
