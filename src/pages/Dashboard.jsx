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
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-indigo-100">DASHBOARD</p>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Anketlerini tek yerden yönet
              </h1>

              <p className="mt-4 leading-7 text-indigo-100">
                Anketlerini oluştur, düzenle ve katılımcılardan gelen yanıtları
                kolayca takip et.
              </p>
            </div>

            <Link
              to="/create"
              className="w-fit rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              + Yeni Anket Oluştur
            </Link>
          </div>
        </section>

        {/* İstatistikler */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Toplam Anket</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalSurveys}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Yayındaki Anket
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {publishedSurveys}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Toplam Yanıt</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalResponses}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Ortalama Tamamlanma
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              %{averageCompletion}
            </p>
          </div>
        </section>

        {/* Anketler */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Anketlerim</h2>

            <p className="mt-1 text-sm text-slate-500">
              Oluşturduğun tüm anketleri buradan yönetebilirsin.
            </p>
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
