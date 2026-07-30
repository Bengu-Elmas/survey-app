# Survey App

React, Tailwind CSS, Firebase Authentication ve Cloud Firestore kullanılarak geliştirilen interaktif bir anket oluşturma, paylaşma ve sonuç analiz uygulamasıdır.

🔗 **Live Demo:** https://survey-app-rosy-nine.vercel.app/

## Proje Hakkında

Survey App, kullanıcıların hesap oluşturarak farklı soru tipleriyle anketler hazırlamasına, kendi anketlerini taslak veya yayında olarak yönetmesine, paylaşmasına ve katılımcılardan gelen yanıtları detaylı şekilde incelemesine olanak sağlayan bir web uygulamasıdır.

Proje, frontend stajı kapsamında React ekosistemini, Firebase ile veri yönetimini, modern arayüz geliştirme yaklaşımlarını ve üçüncü parti kütüphanelerin kullanımını uygulamalı olarak öğrenmek amacıyla geliştirilmiştir.

Arayüz tasarımında uygulamanın görsel bütünlüğüne özellikle önem verilmiştir. Survey App logosu ile uygulamada kullanılan özel SVG ikonları proje için tarafımdan tasarlanmıştır.

---

## Özellikler

### Kullanıcı Hesapları

- Firebase Authentication ile kayıt olma, giriş yapma ve çıkış yapma
- Kullanıcı bazlı anket sahipliği
- Yalnızca hesap sahibinin erişebildiği düzenleme ve sonuç sayfaları
- Ad, soyad ve e-posta bilgilerinin düzenlenebildiği profil sayfası
- E-posta değişikliklerinde doğrulama bağlantısı gönderme

### Anket Yönetimi

- Yeni anket oluşturma
- Mevcut anketleri düzenleme
- Anketleri silme
- Taslak ve yayında durum yönetimi
- Yayındaki anketler için paylaşım bağlantısı oluşturma
- Taslak anketlerin doldurulmasını engelleme
- Taslak anketlerin sonuçlarının görüntülenmesini engelleme
- Anket başlığı ve açıklaması düzenleme
- Anket adına göre arama
- Oluşturulma, güncellenme ve isme göre sıralama
- Oluşturulma ve son güncellenme tarihlerini görüntüleme

### Soru Yönetimi

Desteklenen soru türleri:

- Metin
- Çoktan seçmeli
- Puanlama
- Evet / Hayır

Ayrıca:

- Soruları zorunlu veya isteğe bağlı olarak belirleme
- Yeni soru ekleme
- Soru silme
- Çoktan seçmeli sorulara seçenek ekleme ve silme
- Puanlama sorularında maksimum puan belirleme
- **dnd-kit** ile soruların sırasını sürükle-bırak yöntemiyle değiştirme

### Anket Katılımı

- Yayındaki anketleri bağlantı üzerinden doldurma
- Zorunlu sorular için doğrulama
- Anket ilerleme durumunu takip etme
- **Random User API** ile katılımcı profili oluşturma
- Katılımcının adı, konumu ve profil fotoğrafını yanıt bilgileriyle birlikte saklama
- Yanıtları Firebase Firestore üzerinde kaydetme
- Anket tamamlandıktan sonra teşekkür ekranına yönlendirme

### Sonuç Analizi

- Toplam yanıt sayısını görüntüleme
- Anket tamamlanma oranını hesaplama
- Puanlama sorularının ortalama değerini görüntüleme
- Çoktan seçmeli soruları sütun grafiklerle analiz etme
- Puanlama sorularını grafiklerle görüntüleme
- Evet / Hayır cevaplarını pasta grafik üzerinde gösterme
- Metin yanıtlarını ayrı ayrı görüntüleme
- Katılımcı listesini görüntüleme
- Katılımcıların bireysel cevaplarını detaylı olarak inceleme
- Grafik araç ipuçlarında seçenek adı, kişi sayısı ve yüzdelik oranı görüntüleme
- Yanıtları **CSV** formatında dışa aktarma

### Arayüz

- Responsive tasarım
- Tailwind CSS ile geliştirilmiş kullanıcı arayüzü
- Özel amber renk paleti
- Boxy SVG kullanılarak tarafımdan tasarlanan uygulama logosu
- Boxy SVG kullanılarak tarafımdan tasarlanan taslak ve yayında durum ikonları
- Projeye özel sürükle-bırak ikonu
- Giriş, kayıt, kullanıcı profili ve şifre görünürlüğü için özel SVG ikonları
- Giriş, kayıt ve profil sayfalarında hareketli amber arka plan tasarımı
- Yükleme, hata ve boş durum ekranları
- Responsive grafikler
- Vercel üzerinde canlı deployment

---

## Tasarım ve Görsel Varlıklar

Survey App içerisinde kullanılan görsel kimlik öğeleri proje için özel olarak hazırlanmıştır.

Aşağıdaki görsel varlıklar **Bengü Elmas tarafından Boxy SVG kullanılarak tasarlanmış ve SVG formatında oluşturulmuştur:**

- Survey App uygulama logosu
- Taslak durumunu temsil eden ikon
- Yayında durumunu temsil eden ikon
- Sürükle-bırak işlemlerinde kullanılan özel ikonlar
- Giriş, kayıt, kullanıcı profili ve şifre görünürlüğü ikonları

Bu görsel öğeler hazır bir ikon paketi veya üçüncü parti tasarım setinden alınmamış, Survey App projesinin görsel diliyle uyumlu olacak şekilde özel olarak hazırlanmıştır.

**Survey App için özel olarak oluşturulan logo ve SVG tasarımlar Bengü Elmas'a aittir.**

---

## Kullanılan Teknolojiler

| Teknoloji                   | Kullanım                                                     |
| --------------------------- | ------------------------------------------------------------ |
| **React**                   | Kullanıcı arayüzü ve component yapısı                        |
| **Vite**                    | Geliştirme ve build ortamı                                   |
| **Tailwind CSS**            | Arayüz tasarımı                                              |
| **React Router**            | Sayfalar arası yönlendirme ve korumalı sayfalar              |
| **Firebase Authentication** | Kayıt, giriş, oturum ve profil işlemleri                     |
| **Cloud Firestore**         | Kullanıcı, anket ve yanıt verilerinin saklanması             |
| **Recharts**                | Sonuç grafiklerinin oluşturulması                            |
| **dnd-kit**                 | Sürükle-bırak soru sıralaması                                |
| **Random User API**         | Katılımcı profillerinin oluşturulması                        |
| **Boxy SVG**                | Uygulama logosu ve projeye özel SVG ikonlarının tasarlanması |
| **Vercel**                  | Deployment ve hosting                                        |

---

## Sayfalar

| Sayfa             | Açıklama                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| **Guest Home**    | Giriş yapmamış kullanıcılar için tanıtım ve yönlendirme sayfası          |
| **Dashboard**     | Kullanıcıya ait anketlerin ve genel istatistiklerin görüntülendiği sayfa |
| **Create Survey** | Yeni anket oluşturma ekranı                                              |
| **Edit Survey**   | Mevcut anketleri ve soruları düzenleme ekranı                            |
| **Survey Fill**   | Katılımcıların anketi doldurduğu ekran                                   |
| **Results**       | Grafikler, istatistikler ve katılımcı yanıtlarının görüntülendiği ekran  |
| **Thank You**     | Anket gönderildikten sonra görüntülenen teşekkür ekranı                  |
| **Register**      | Yeni kullanıcı hesabı oluşturma ekranı                                   |
| **Login**         | Kullanıcı giriş ekranı                                                   |
| **Profile**       | Ad, soyad ve e-posta bilgilerinin güncellendiği hesap ayarları ekranı    |

---

## Gereksinimler

Projeyi yerel ortamda çalıştırabilmek için aşağıdakilerin kurulu veya hazırlanmış olması gerekir:

- **Node.js**
- **npm**
- **Git**
- Bir **Firebase projesi**
- Etkinleştirilmiş **Cloud Firestore** veritabanı
- Etkinleştirilmiş **Email/Password Firebase Authentication** yöntemi
- Firebase Web App yapılandırma bilgileri

Random User API kullanımı için ayrıca bir API anahtarı gerekmemektedir.

---

## Kurulum

```bash
git clone https://github.com/Bengu-Elmas/survey-app.git
cd survey-app
npm install
npm run dev
```

Firebase bağlantısının çalışabilmesi için proje ana dizininde gerekli Firebase yapılandırma değerlerini içeren bir `.env.local` dosyası oluşturulmalıdır.

---

## Proje Yapısı

```text
survey-app/
│
├── public/
│   ├── survey-logo.svg
│   ├── dragicon.svg
│   ├── usericon.svg
│   ├── giris-icon.svg
│   ├── kayit-icon.svg
│   └── ...
│
├── src/
│   ├── components/
│   │   ├── AuthBackground.jsx
│   │   ├── FeedbackModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SurveyCard.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── CreateSurvey.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EditSurvey.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   ├── Results.jsx
│   │   ├── SurveyFill.jsx
│   │   └── ThankYou.jsx
│   │
│   ├── firebase.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── package.json
├── vercel.json
├── vite.config.js
└── README.md
```

---

## Anket Akışı

```text
Yeni Anket Oluştur
        ↓
Soruları Ekle / Düzenle
        ↓
Soruları Sürükle-Bırak ile Sırala
        ↓
Taslak Olarak Kaydet
        veya
Anketi Yayınla
        ↓
Paylaşım Bağlantısı
        ↓
Katılımcı Anketi Doldurur
        ↓
Yanıtlar Firebase Firestore'a Kaydedilir
        ↓
Sonuçlar ve Grafikler Oluşturulur
```

---

## Firebase Veri Yapısı

Uygulamada üç temel Firestore collection kullanılmaktadır.

### `users`

Kullanıcı profil bilgilerini saklar.

```text
users/
└── userId
    ├── firstName
    ├── lastName
    ├── fullName
    ├── email
    ├── role
    ├── createdAt
    └── updatedAt
```

### `surveys`

Anket bilgilerini, soruları ve anket sahibini saklar.

```text
surveys/
└── surveyId
    ├── ownerId
    ├── title
    ├── description
    ├── status
    ├── questionCount
    ├── questions[]
    ├── createdAt
    └── updatedAt
```

### `responses`

Katılımcı bilgilerini ve verilen cevapları saklar.

```text
responses/
└── responseId
    ├── surveyId
    ├── surveyOwnerId
    ├── participant
    │   ├── fullName
    │   ├── city
    │   └── avatar
    ├── answers
    └── submittedAt
```

---

## Sonuç Analizi

Anket sonuçları **Recharts** kullanılarak görselleştirilmektedir.

Soru türüne göre farklı sonuç gösterimleri kullanılmaktadır:

- **Çoktan Seçmeli:** Sütun grafik
- **Puanlama:** Sütun grafik
- **Evet / Hayır:** Pasta grafik
- **Metin:** Katılımcı bazlı metin cevapları

Results ekranında ayrıca:

- Toplam katılımcı sayısı
- Tamamlanma oranı
- Ortalama puan
- Katılımcı bilgileri
- Her katılımcının bireysel cevapları

görüntülenebilir.

Sonuçlar ayrıca `.csv` formatında dışa aktarılabilir.

---

## Taslak ve Yayında Durumları

Anketler iki farklı durumda tutulabilir.

### Taslak

Taslak durumundaki bir anket:

- Düzenlenebilir
- Katılımcılar tarafından doldurulamaz
- Paylaşılamaz
- Sonuçları görüntülenemez

### Yayında

Yayındaki bir anket:

- Paylaşılabilir
- Katılımcılar tarafından doldurulabilir
- Yanıt toplayabilir
- Sonuçları ve istatistikleri görüntülenebilir

---

## Güvenlik

Firebase yapılandırma değerleri `.env.local` üzerinden yönetilerek repository içerisinde doğrudan tutulmamaktadır.

Firebase Authentication ile kullanıcı oturumları yönetilmekte; oluşturma, düzenleme, sonuç görüntüleme ve profil sayfaları korumalı route yapısıyla sınırlandırılmaktadır.

Firestore Security Rules ile:

- Kullanıcılar yalnızca kendi profil belgelerini okuyabilir ve güncelleyebilir.
- Kullanıcılar yalnızca kendi anketlerini düzenleyebilir ve silebilir.
- Yayındaki anketler herkese açık olarak okunabilir ve doldurulabilir.
- Taslak anketlere yalnızca anket sahibi erişebilir.
- Yanıtlar yalnızca ilgili anketin sahibi tarafından okunabilir ve silinebilir.

Firebase Web API anahtarının kullanım alanı Google Cloud Console üzerinden izin verilen web adresleri ve gerekli Firebase API'leri ile sınırlandırılmıştır.

---

## Görsel Haklar

Survey App için özel olarak oluşturulan uygulama logosu ve SVG ikonlar **Bengü Elmas tarafından tasarlanmıştır**.

Bu görsel öğeler **Boxy SVG** kullanılarak oluşturulmuş olup Survey App projesine özel tasarımlardır.

Logo ve projeye özel SVG tasarımların görsel hakları **Bengü Elmas'a aittir**.

---

Bu proje, frontend geliştirme ve Firebase entegrasyonu konularında uygulamalı deneyim kazanmak amacıyla geliştirilmiştir.
