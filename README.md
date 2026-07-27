# Survey App

React, Tailwind CSS ve Firebase kullanılarak geliştirilen interaktif bir anket oluşturma, paylaşma ve sonuç analiz uygulaması.

🔗 **Live Demo:** https://survey-app-rosy-nine.vercel.app/

## Proje Hakkında

Survey App; kullanıcıların farklı soru tipleriyle anket oluşturmasına, anketleri taslak veya yayında olarak yönetmesine, paylaşmasına ve gelen yanıtları grafikler üzerinden incelemesine olanak sağlar.

Proje, frontend stajı kapsamında React ekosistemini, Firebase ile gerçek zamanlı veri kullanımını ve modern arayüz geliştirme yaklaşımlarını uygulamalı olarak öğrenmek amacıyla geliştirilmiştir.

## Özellikler

- Anket oluşturma ve düzenleme
- Taslak ve yayında durum yönetimi
- Sürükle-bırak ile soru sıralama
- Metin, çoktan seçmeli, puanlama ve evet/hayır soru tipleri
- Zorunlu soru desteği
- Anket paylaşım bağlantısı oluşturma
- Firebase Firestore ile anket ve yanıt verilerini saklama
- Random User API ile katılımcı profili oluşturma
- Anket sonuçlarını grafiklerle görüntüleme
- Katılımcı bazlı yanıt detaylarını inceleme
- Ortalama puan ve tamamlanma oranı hesaplama
- CSV olarak sonuç indirme
- Responsive arayüz
- Vercel üzerinde canlı deployment

## Kullanılan Teknolojiler

- **React**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Firebase / Cloud Firestore**
- **Recharts**
- **dnd-kit**
- **Random User API**
- **Vercel**

## Sayfalar

| Sayfa         | Açıklama                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Dashboard     | Anketlerin ve genel istatistiklerin görüntülendiği ana sayfa            |
| Create Survey | Yeni anket oluşturma ekranı                                             |
| Edit Survey   | Mevcut anketleri düzenleme ve durum değiştirme ekranı                   |
| Survey Fill   | Katılımcıların anketi doldurduğu ekran                                  |
| Results       | Grafikler, istatistikler ve katılımcı yanıtlarının görüntülendiği ekran |
| Thank You     | Anket gönderildikten sonra gösterilen teşekkür sayfası                  |

## Kurulum

Projeyi bilgisayarınızda çalıştırmak için:

```bash
git clone https://github.com/Bengu-Elmas/survey-app.git
cd survey-app
npm install
npm run dev
```

Ardından terminalde gösterilen local adresi tarayıcıda açabilirsiniz.

## Proje Yapısı

```text
src/
├── components/
├── pages/
│   ├── CreateSurvey.jsx
│   ├── Dashboard.jsx
│   ├── EditSurvey.jsx
│   ├── Results.jsx
│   ├── SurveyFill.jsx
│   └── ThankYou.jsx
├── firebase.js
├── App.jsx
└── main.jsx
```

## Anket Akışı

```text
Anket Oluştur
      ↓
Taslak / Yayında
      ↓
Anketi Paylaş
      ↓
Katılımcı Yanıtı
      ↓
Firebase Firestore
      ↓
Sonuçlar ve Grafikler
```

## Sonuç Analizi

Results sayfasında:

- Toplam yanıt sayısı
- Anket tamamlanma oranı
- Puanlama sorularının ortalaması
- Evet/Hayır dağılımları
- Çoktan seçmeli cevap grafikleri
- Metin yanıtları
- Katılımcıların bireysel cevapları
- CSV dışa aktarma

özellikleri bulunmaktadır.

## Güvenlik

Firebase yapılandırma değerleri `.env.local` üzerinden yönetilmektedir. API anahtarının kullanım alanı Google Cloud üzerinden yalnızca izin verilen web adresleri ve Firebase ile ilişkili API'lerle sınırlandırılmıştır.

Firestore erişim kuralları proje gereksinimlerine göre ayrıca yapılandırılmalıdır.

## Planlanan Geliştirmeler

- Anket oluşturan kullanıcıların profil bilgilerinin gösterilmesi
- Kullanıcı bazlı anket sahipliği
- Daha gelişmiş yetkilendirme ve kullanıcı yönetimi
- Ek sonuç filtreleme seçenekleri

Bu proje frontend geliştirme ve Firebase entegrasyonu üzerine pratik yapmak amacıyla geliştirilmiştir.
