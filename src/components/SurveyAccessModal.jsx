import { useEffect, useState } from "react";

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";

function SurveyAccessModal({ survey, onClose }) {
  const { currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");

  const [liveSurvey, setLiveSurvey] = useState(survey);
  const [members, setMembers] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* MODAL AÇILDIĞINDA ANKETİ CANLI DİNLE */

  useEffect(() => {
    if (!survey?.id) {
      return;
    }

    setLiveSurvey(survey);

    const surveyReference = doc(db, "surveys", survey.id);

    const unsubscribe = onSnapshot(
      surveyReference,
      (surveySnapshot) => {
        if (!surveySnapshot.exists()) {
          return;
        }

        setLiveSurvey({
          id: surveySnapshot.id,
          ...surveySnapshot.data(),
        });
      },
      (error) => {
        console.error("Anket erişim bilgileri alınamadı:", error);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [survey]);

  /* ÜYELERİN PROFİL BİLGİLERİNİ GETİR */

  useEffect(() => {
    if (!liveSurvey?.memberIds?.length) {
      setMembers([]);
      return;
    }

    let isActive = true;

    async function loadMembers() {
      try {
        setMembersLoading(true);

        const memberList = await Promise.all(
          liveSurvey.memberIds.map(async (userId) => {
            const userReference = doc(db, "users", userId);
            const userSnapshot = await getDoc(userReference);

            const userData = userSnapshot.exists() ? userSnapshot.data() : {};

            const surveyRole =
              liveSurvey.members?.[userId] ||
              (liveSurvey.ownerId === userId ? "owner" : null);

            return {
              uid: userId,
              ...userData,
              surveyRole,
            };
          }),
        );

        if (!isActive) {
          return;
        }

        const sortedMembers = memberList.sort((firstMember, secondMember) => {
          if (firstMember.surveyRole === "owner") {
            return -1;
          }

          if (secondMember.surveyRole === "owner") {
            return 1;
          }

          return 0;
        });

        setMembers(sortedMembers);
      } catch (error) {
        console.error("Üye bilgileri alınırken hata oluştu:", error);
      } finally {
        if (isActive) {
          setMembersLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      isActive = false;
    };
  }, [liveSurvey]);

  /* MODAL AÇIKKEN ESC İLE KAPAT */

  useEffect(() => {
    if (!survey) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [survey, onClose]);

  if (!survey) {
    return null;
  }

  function getRoleInfo(role) {
    if (role === "owner") {
      return {
        label: "Sahip",
        icon: "/ownericon.svg",
      };
    }

    if (role === "editor") {
      return {
        label: "Editör",
        icon: "/editoricon.svg",
      };
    }

    if (role === "viewer") {
      return {
        label: "Görüntüleyici",
        icon: "/viewericon.svg",
      };
    }

    return {
      label: "Kullanıcı",
      icon: "/usericon.svg",
    };
  }

  /* KULLANICIYI YETKİLENDİR */

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage({
        type: "error",
        text: "Lütfen bir e-posta adresi yazın.",
      });

      return;
    }

    if (!currentUser) {
      setMessage({
        type: "error",
        text: "Yetkilendirme yapabilmek için giriş yapmalısınız.",
      });

      return;
    }

    if (liveSurvey?.ownerId !== currentUser.uid) {
      setMessage({
        type: "error",
        text: "Bu anketin erişim ayarlarını yalnızca anket sahibi değiştirebilir.",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      setMessage({
        type: "",
        text: "",
      });

      /* E-POSTA İLE KULLANICIYI BUL */

      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", cleanEmail),
      );

      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        setMessage({
          type: "error",
          text: "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.",
        });

        return;
      }

      const targetUserDocument = usersSnapshot.docs[0];

      const targetUserId = targetUserDocument.id;

      /* OWNER KENDİ ROLÜNÜ DEĞİŞTİREMEZ */

      if (targetUserId === liveSurvey.ownerId) {
        setMessage({
          type: "error",
          text: "Bu kullanıcı zaten anketin sahibi.",
        });

        return;
      }

      const previousRole = liveSurvey.members?.[targetUserId] || null;

      const surveyReference = doc(db, "surveys", liveSurvey.id);

      /* ANKETİ GÜVENLİ ŞEKİLDE GÜNCELLE */

      await runTransaction(db, async (transaction) => {
        const surveySnapshot = await transaction.get(surveyReference);

        if (!surveySnapshot.exists()) {
          throw new Error("Anket bulunamadı.");
        }

        const surveyData = surveySnapshot.data();

        if (surveyData.ownerId !== currentUser.uid) {
          throw new Error("Bu işlem için yetkiniz bulunmuyor.");
        }

        const currentMembers = surveyData.members || {};

        transaction.update(surveyReference, {
          members: {
            ...currentMembers,
            [targetUserId]: selectedRole,
          },

          memberIds: arrayUnion(targetUserId),

          updatedAt: serverTimestamp(),
        });
      });

      setEmail("");

      setMessage({
        type: "success",
        text: previousRole
          ? selectedRole === "editor"
            ? "Kullanıcının yetkisi Editör olarak güncellendi."
            : "Kullanıcının yetkisi Görüntüleyici olarak güncellendi."
          : selectedRole === "editor"
            ? "Kullanıcı Editör olarak yetkilendirildi."
            : "Kullanıcı Görüntüleyici olarak yetkilendirildi.",
      });
    } catch (error) {
      console.error("Kullanıcı yetkilendirilirken hata oluştu:", error);

      setMessage({
        type: "error",
        text: "Kullanıcı yetkilendirilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[calc(100vh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl sm:max-h-[calc(100vh-2.5rem)] sm:rounded-3xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* BAŞLIK */}

        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="font-stack-notch text-sm font-bold text-amber-700 sm:text-base">
              ERİŞİM YÖNETİMİ
            </p>

            <h2 className="font-stack-notch mt-1 text-xl font-bold leading-tight text-amber-950 sm:text-2xl">
              Anket Erişimini Yönet
            </h2>

            <p className="mt-1.5 break-words text-sm font-medium text-slate-700 sm:text-base">
              {liveSurvey?.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl font-bold text-amber-900 transition duration-200 hover:bg-amber-200 sm:h-10 sm:w-10"
          >
            ×
          </button>
        </div>

        {/* AYIRICI */}

        <div className="my-5 h-px bg-amber-200" />

        {/* KULLANICI EKLE */}

        <form onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="member-email"
              className="font-stack-notch mb-2 block text-sm font-bold text-amber-950 sm:text-base"
            >
              KULLANICI E-POSTASI
            </label>

            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (message.text) {
                  setMessage({
                    type: "",
                    text: "",
                  });
                }
              }}
              placeholder="kullanici@mail.com"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            />
          </div>

          {/* ROL SEÇİMİ */}

          <div className="mt-5">
            <p className="font-stack-notch mb-3 text-sm font-bold text-amber-950 sm:text-base">
              KULLANICI YETKİSİ
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* EDITOR */}

              <button
                type="button"
                onClick={() => setSelectedRole("editor")}
                disabled={isSubmitting}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition duration-200 sm:p-4 ${
                  selectedRole === "editor"
                    ? "border-amber-500 bg-amber-100 shadow-sm"
                    : "border-amber-200 bg-white hover:bg-amber-50"
                }`}
              >
                <img
                  src="/editoricon.svg"
                  alt=""
                  className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
                />

                <div className="min-w-0">
                  <p className="font-stack-notch text-base font-bold text-amber-950 sm:text-lg">
                    EDİTÖR
                  </p>

                  <p className="mt-1 text-sm font-medium leading-5 text-slate-900">
                    Anketi düzenleyebilir.
                  </p>
                </div>
              </button>

              {/* VIEWER */}

              <button
                type="button"
                onClick={() => setSelectedRole("viewer")}
                disabled={isSubmitting}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition duration-200 sm:p-4 ${
                  selectedRole === "viewer"
                    ? "border-amber-500 bg-amber-100 shadow-sm"
                    : "border-amber-200 bg-white hover:bg-amber-50"
                }`}
              >
                <img
                  src="/viewericon.svg"
                  alt=""
                  className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
                />

                <div className="min-w-0">
                  <p className="font-stack-notch text-base font-bold text-amber-950 sm:text-lg">
                    GÖRÜNTÜLEYİCİ
                  </p>

                  <p className="mt-1 text-sm font-medium leading-5 text-slate-900">
                    Anket sonuçlarını görüntüleyebilir.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* BAŞARI / HATA MESAJI */}

          {message.text && (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* YETKİLENDİR */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-amber-800 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "YETKİLENDİRİLİYOR..." : "KULLANICIYI YETKİLENDİR"}
          </button>
        </form>

        {/* MEVCUT ERİŞİMLER */}

        <div className="mt-7 border-t border-amber-200 pt-5">
          <h3 className="font-stack-notch text-lg font-bold text-amber-950 sm:text-xl">
            Erişimi Olan Kullanıcılar
          </h3>

          <p className="mt-1.5 text-sm font-medium leading-5 text-slate-700">
            Bu ankete erişebilen kullanıcılar burada görüntülenir.
          </p>

          {membersLoading ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                Kullanıcılar yükleniyor...
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {members.map((member) => {
                const roleInfo = getRoleInfo(member.surveyRole);

                return (
                  <div
                    key={member.uid}
                    className="flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={roleInfo.icon}
                        alt=""
                        className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
                      />

                      <div className="min-w-0">
                        <p className="font-stack-notch truncate text-base font-bold text-amber-950">
                          {member.fullName || member.email || "Kullanıcı"}
                        </p>

                        {member.email && (
                          <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="w-fit shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-amber-900">
                      {roleInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyAccessModal;
