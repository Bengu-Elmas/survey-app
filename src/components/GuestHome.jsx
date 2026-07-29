import AuthBackground from "./AuthBackground.jsx";
import Footer from "./Footer.jsx";

function GuestHome() {
  const features = [
    {
      number: "01",
      title: "Kolay anket oluşturma",
      description:
        "Farklı soru türleri ekle, sorularını sürükleyerek sırala ve anketini birkaç adımda yayına hazırla.",
    },
    {
      number: "02",
      title: "Ayrıntılı sonuç analizi",
      description:
        "Katılımcılardan gelen yanıtları grafikler, istatistikler ve kişiye özel yanıt detaylarıyla incele.",
    },
    {
      number: "03",
      title: "Kolay anket paylaşımı",
      description:
        "Yayınladığın anketin bağlantısını kolayca kopyala ve katılımcılarınla paylaş.",
    },
    {
      number: "04",
      title: "CSV dışa aktarımı",
      description:
        "Toplanan anket yanıtlarını CSV formatında dışa aktararak verilerini farklı ortamlarda kullan.",
    },
    {
      number: "05",
      title: "Taslak ve yayın yönetimi",
      description:
        "Henüz tamamlamadığın anketleri taslak olarak sakla, hazır olduğunda yayınla ve dilediğin zaman düzenle.",
    },
    {
      number: "06",
      title: "Her ekrana uyumlu tasarım",
      description:
        "Responsive arayüz sayesinde Survey App'i masaüstü ve mobil ekranlarda rahatlıkla kullan.",
    },
  ];

  const steps = [
    "Oluştur",
    "Taslak Kaydet",
    "Yayınla",
    "Paylaş",
    "Yanıt Topla",
    "Analiz Et",
    "CSV Olarak Aktar",
  ];

  return (
    <>
      <main className="bg-slate-100">
        {/* HERO */}

        <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-gradient-to-r from-amber-950 via-amber-700 to-amber-500 px-6 py-20 text-white">
          <AuthBackground />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="font-stack-notch text-base font-bold tracking-[0.2em] text-amber-200 md:text-lg">
              SURVEY APP
            </p>

            <h1 className="font-stack-notch mt-4 text-4xl font-bold leading-tight md:text-6xl">
              Anketlerini oluştur.
              <br />
              Fikirleri keşfet.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-amber-50 md:text-xl">
              Survey App ile anketlerini kolayca oluştur, katılımcılarınla
              paylaş ve gelen yanıtları ayrıntılı şekilde incele.
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-amber-100/90">
              Kendi anketlerini oluşturmaya başlamak için giriş yapabilir veya
              aramıza katılabilirsin.
            </p>
          </div>
        </section>

        {/* ÖZELLİKLER */}

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="font-stack-notch text-sm font-bold tracking-[0.16em] text-amber-700">
                SURVEY APP'İ KEŞFET
              </p>

              <h2 className="font-stack-notch mt-2 text-3xl font-bold text-[#461901] md:text-4xl">
                Seni Survey App'te neler bekliyor?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600">
                Anket oluşturma sürecinden sonuç analizine kadar ihtiyacın olan
                araçları tek bir yerde kullan.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="group rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 p-6 shadow-md shadow-amber-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="font-stack-notch flex h-12 w-12 items-center justify-center rounded-2xl bg-[#461901] text-sm font-bold text-amber-50 shadow-md">
                    {feature.number}
                  </div>

                  <h3 className="font-stack-notch mt-5 text-xl font-bold text-amber-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            {/* ANKET AKIŞI */}

            <div className="mt-14 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 via-amber-50 to-white p-8 shadow-lg shadow-amber-200/30">
              <div className="text-center">
                <p className="font-stack-notch text-sm font-bold tracking-[0.16em] text-amber-700">
                  BAŞTAN SONA
                </p>

                <h2 className="font-stack-notch mt-2 text-2xl font-bold text-[#461901] md:text-3xl">
                  Bir anketin tüm yolculuğu tek yerde
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Oluşturmaktan sonuçları dışa aktarmaya kadar tüm süreci Survey
                  App üzerinden yönet.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex flex-1 flex-col items-center gap-3 lg:flex-row"
                  >
                    <div className="flex min-h-16 w-full items-center justify-center rounded-2xl border border-amber-200 bg-white px-3 py-4 text-center shadow-sm">
                      <span className="font-stack-notch text-sm font-bold text-amber-900">
                        {step}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <>
                        <span className="hidden font-bold text-amber-500 lg:block">
                          →
                        </span>

                        <span className="font-bold text-amber-500 lg:hidden">
                          ↓
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default GuestHome;
