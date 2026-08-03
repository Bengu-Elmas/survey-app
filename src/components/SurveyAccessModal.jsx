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
import FeedbackModal from "./FeedbackModal.jsx";

function SurveyAccessModal({ survey, onClose }) {
  const { currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");

  const [liveSurvey, setLiveSurvey] = useState(survey);
  const [members, setMembers] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  /*
    Bir üyeye ait rol değiştirme veya erişim kaldırma
    işlemi sürerken ilgili satırı takip eder.
  */
  const [memberAction, setMemberAction] = useState({
    userId: null,
    type: "",
  });

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mode: "message",
  });

  const [memberToRemove, setMemberToRemove] = useState(null);

  const isMemberActionRunning = Boolean(memberAction.userId);
  const isBusy = isSubmitting || isMemberActionRunning;

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

        showFeedback(
          "error",
          "Erişim bilgileri yüklenemedi",
          "Anketin erişim bilgileri alınırken bir hata oluştu.",
        );
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

          return (
            firstMember.fullName ||
            firstMember.email ||
            ""
          ).localeCompare(
            secondMember.fullName || secondMember.email || "",
            "tr",
            {
              sensitivity: "base",
            },
          );
        });

        setMembers(sortedMembers);
      } catch (error) {
        console.error("Üye bilgileri alınırken hata oluştu:", error);

        if (isActive) {
          showFeedback(
            "error",
            "Kullanıcılar yüklenemedi",
            "Yetkilendirilmiş kullanıcılar yüklenirken bir hata oluştu.",
          );
        }
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
      if (event.key === "Escape" && !isBusy && !feedback.isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [survey, onClose, isBusy, feedback.isOpen]);

  if (!survey) {
    return null;
  }

  function showFeedback(
    type,
    feedbackTitle,
    feedbackMessage,
    mode = "message",
  ) {
    setFeedback({
      isOpen: true,
      type,
      title: feedbackTitle,
      message: feedbackMessage,
      mode,
    });
  }

  function closeFeedback() {
    if (isBusy) {
      return;
    }

    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      isOpen: false,
    }));

    setMemberToRemove(null);
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

  function canCurrentUserManageAccess() {
    return currentUser && liveSurvey && liveSurvey.ownerId === currentUser.uid;
  }

  /* KULLANICIYI YETKİLENDİR */

  async function handleSubmit(event) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showFeedback(
        "warning",
        "E-POSTA ADRESİ GEREKLİ",
        "Lütfen yetkilendirmek istediğiniz kullanıcının e-posta adresini yazın.",
      );

      return;
    }

    if (!currentUser) {
      showFeedback(
        "error",
        "OTURUM GEREKLİ",
        "Yetkilendirme yapabilmek için giriş yapmalısınız.",
      );

      return;
    }

    if (!canCurrentUserManageAccess()) {
      showFeedback(
        "error",
        "YETKİN BULUNMUYOR",
        "Bu anketin erişim ayarlarını yalnızca anket sahibi değiştirebilir.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      /* E-POSTA İLE KULLANICIYI BUL */

      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", cleanEmail),
      );

      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        showFeedback(
          "error",
          "Kullanıcı bulunamadı",
          "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.",
        );

        return;
      }

      const targetUserDocument = usersSnapshot.docs[0];
      const targetUserId = targetUserDocument.id;

      /* OWNER KENDİ ROLÜNÜ DEĞİŞTİREMEZ */

      if (targetUserId === liveSurvey.ownerId) {
        showFeedback(
          "warning",
          "Kullanıcı zaten sahip",
          "Bu kullanıcı zaten anketin sahibi olduğu için rolü değiştirilemez.",
        );

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

      showFeedback(
        "success",
        previousRole ? "Rol güncellendi!" : "Erişim verildi!",
        previousRole
          ? selectedRole === "editor"
            ? "Kullanıcının rolü Editör olarak güncellendi."
            : "Kullanıcının rolü Görüntüleyici olarak güncellendi."
          : selectedRole === "editor"
            ? "Kullanıcı ankete Editör olarak eklendi."
            : "Kullanıcı ankete Görüntüleyici olarak eklendi.",
      );
    } catch (error) {
      console.error("Kullanıcı yetkilendirilirken hata oluştu:", error);

      showFeedback(
        "error",
        "Yetkilendirme başarısız",
        "Kullanıcı yetkilendirilirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /* MEVCUT KULLANICININ ROLÜNÜ DEĞİŞTİR */

  async function handleMemberRoleChange(member, newRole) {
    if (isBusy || member.surveyRole === newRole) {
      return;
    }

    if (newRole !== "editor" && newRole !== "viewer") {
      return;
    }

    if (!canCurrentUserManageAccess()) {
      showFeedback(
        "error",
        "Yetkin bulunmuyor",
        "Rolleri yalnızca anket sahibi değiştirebilir.",
      );

      return;
    }

    if (member.uid === liveSurvey.ownerId || member.surveyRole === "owner") {
      showFeedback(
        "warning",
        "Sahip rolü değiştirilemez",
        "Anket sahibinin rolü değiştirilemez.",
      );

      return;
    }

    try {
      setMemberAction({
        userId: member.uid,
        type: "role",
      });

      const surveyReference = doc(db, "surveys", liveSurvey.id);

      await runTransaction(db, async (transaction) => {
        const surveySnapshot = await transaction.get(surveyReference);

        if (!surveySnapshot.exists()) {
          throw new Error("Anket bulunamadı.");
        }

        const surveyData = surveySnapshot.data();

        if (surveyData.ownerId !== currentUser.uid) {
          throw new Error("Bu işlem için yetkiniz bulunmuyor.");
        }

        if (member.uid === surveyData.ownerId) {
          throw new Error("Anket sahibinin rolü değiştirilemez.");
        }

        const currentMembers = surveyData.members || {};

        if (!currentMembers[member.uid]) {
          throw new Error("Kullanıcının mevcut erişimi bulunamadı.");
        }

        transaction.update(surveyReference, {
          members: {
            ...currentMembers,
            [member.uid]: newRole,
          },

          updatedAt: serverTimestamp(),
        });
      });

      showFeedback(
        "success",
        "Rol güncellendi!",
        newRole === "editor"
          ? `${member.fullName || member.email || "Kullanıcı"} artık Editör.`
          : `${member.fullName || member.email || "Kullanıcı"} artık Görüntüleyici.`,
      );
    } catch (error) {
      console.error("Kullanıcının rolü değiştirilirken hata oluştu:", error);

      showFeedback(
        "error",
        "Rol güncellenemedi",
        "Kullanıcının rolü değiştirilirken bir hata oluştu.",
      );
    } finally {
      setMemberAction({
        userId: null,
        type: "",
      });
    }
  }

  /* ERİŞİM KALDIRMA ONAY PENCERESİNİ AÇ */

  function requestRemoveAccess(member) {
    if (isBusy) {
      return;
    }

    if (!canCurrentUserManageAccess()) {
      showFeedback(
        "error",
        "Yetkin bulunmuyor",
        "Kullanıcı erişimini yalnızca anket sahibi kaldırabilir.",
      );

      return;
    }

    if (member.uid === liveSurvey.ownerId || member.surveyRole === "owner") {
      showFeedback(
        "warning",
        "Sahibin erişimi kaldırılamaz",
        "Anket sahibinin erişimi kaldırılamaz.",
      );

      return;
    }

    const memberName = member.fullName || member.email || "Bu kullanıcı";

    setMemberToRemove(member);

    showFeedback(
      "warning",
      "Erişim kaldırılsın mı?",
      `${memberName} kullanıcısının bu ankete erişimi kalıcı olarak kaldırılacak.`,
      "confirm",
    );
  }

  /* ONAYDAN SONRA KULLANICININ ERİŞİMİNİ KALDIR */

  async function confirmRemoveAccess() {
    if (!memberToRemove || isBusy) {
      return;
    }

    const member = memberToRemove;
    const memberName = member.fullName || member.email || "Bu kullanıcı";

    try {
      setMemberAction({
        userId: member.uid,
        type: "remove",
      });

      const surveyReference = doc(db, "surveys", liveSurvey.id);

      await runTransaction(db, async (transaction) => {
        const surveySnapshot = await transaction.get(surveyReference);

        if (!surveySnapshot.exists()) {
          throw new Error("Anket bulunamadı.");
        }

        const surveyData = surveySnapshot.data();

        if (surveyData.ownerId !== currentUser.uid) {
          throw new Error("Bu işlem için yetkiniz bulunmuyor.");
        }

        if (member.uid === surveyData.ownerId) {
          throw new Error("Anket sahibinin erişimi kaldırılamaz.");
        }

        const updatedMembers = {
          ...(surveyData.members || {}),
        };

        delete updatedMembers[member.uid];

        const updatedMemberIds = Array.isArray(surveyData.memberIds)
          ? surveyData.memberIds.filter((memberId) => memberId !== member.uid)
          : [surveyData.ownerId];

        /*
          Owner her zaman memberIds listesinde ve
          members map'inde korunur.
        */
        if (!updatedMemberIds.includes(surveyData.ownerId)) {
          updatedMemberIds.unshift(surveyData.ownerId);
        }

        updatedMembers[surveyData.ownerId] = "owner";

        transaction.update(surveyReference, {
          members: updatedMembers,
          memberIds: updatedMemberIds,
          updatedAt: serverTimestamp(),
        });
      });

      setMemberToRemove(null);

      showFeedback(
        "success",
        "Erişim kaldırıldı!",
        `${memberName} kullanıcısının ankete erişimi başarıyla kaldırıldı.`,
      );
    } catch (error) {
      console.error("Kullanıcı erişimi kaldırılırken hata oluştu:", error);

      showFeedback(
        "error",
        "Erişim kaldırılamadı",
        "Kullanıcının erişimi kaldırılırken bir hata oluştu.",
      );
    } finally {
      setMemberAction({
        userId: null,
        type: "",
      });
    }
  }

  return (
    <>
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        mode={feedback.mode}
        onClose={closeFeedback}
        onConfirm={confirmRemoveAccess}
        confirmText="Erişimi Kaldır"
        cancelText="İptal"
        isLoading={
          memberAction.type === "remove" && Boolean(memberAction.userId)
        }
        danger={feedback.mode === "confirm"}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3 backdrop-blur-sm sm:p-5"
        onMouseDown={() => {
          if (!isBusy && !feedback.isOpen) {
            onClose();
          }
        }}
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
              disabled={isBusy}
              aria-label="Pencereyi kapat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl font-bold text-amber-900 transition duration-200 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              ×
            </button>
          </div>

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
                }}
                placeholder="kullanici@mail.com"
                disabled={isBusy}
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              />
            </div>

            {/* ROL SEÇİMİ */}

            <div className="mt-5">
              <p className="font-stack-notch mb-3 text-sm font-bold text-amber-950 sm:text-base">
                KULLANICI YETKİSİ
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("editor")}
                  disabled={isBusy}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition duration-200 sm:p-4 ${
                    selectedRole === "editor"
                      ? "border-amber-500 bg-amber-100 shadow-sm"
                      : "border-amber-200 bg-white hover:bg-amber-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
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

                <button
                  type="button"
                  onClick={() => setSelectedRole("viewer")}
                  disabled={isBusy}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition duration-200 sm:p-4 ${
                    selectedRole === "viewer"
                      ? "border-amber-500 bg-amber-100 shadow-sm"
                      : "border-amber-200 bg-white hover:bg-amber-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
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

            <button
              type="submit"
              disabled={isBusy}
              className="mt-6 w-full rounded-xl bg-amber-800 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-300/40 transition duration-300 hover:bg-amber-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "YETKİLENDİRİLİYOR..."
                : "KULLANICIYI YETKİLENDİR"}
            </button>
          </form>

          {/* MEVCUT ERİŞİMLER */}

          <div className="mt-7 border-t border-amber-200 pt-5">
            <h3 className="font-stack-notch text-lg font-bold text-amber-950 sm:text-xl">
              Erişimi Olan Kullanıcılar
            </h3>

            <p className="mt-1.5 text-sm font-medium leading-5 text-slate-700">
              Anket sahibinin rolü değiştirilemez. Diğer kullanıcıların rolünü
              aşağıdan değiştirebilir veya erişimini kaldırabilirsin.
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

                  const isOwnerMember =
                    member.uid === liveSurvey?.ownerId ||
                    member.surveyRole === "owner";

                  const isThisMemberProcessing =
                    memberAction.userId === member.uid;

                  return (
                    <div
                      key={member.uid}
                      className="group rounded-2xl border border-transparent bg-amber-50 p-4 transition duration-200 hover:border-amber-300 hover:bg-amber-100/70 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

                        {isOwnerMember ? (
                          <span className="w-fit shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-amber-900">
                            Sahip
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative min-w-[155px]">
                              <select
                                value={member.surveyRole}
                                onChange={(event) =>
                                  handleMemberRoleChange(
                                    member,
                                    event.target.value,
                                  )
                                }
                                disabled={isBusy}
                                aria-label={`${
                                  member.fullName || member.email || "Kullanıcı"
                                } rolünü değiştir`}
                                className="h-10 w-full appearance-none rounded-xl border border-amber-400 bg-amber-50 py-2 pl-4 pr-11 text-sm font-bold text-amber-950 outline-none transition duration-200 hover:border-amber-500 hover:bg-amber-100 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <option value="editor">Editör</option>
                                <option value="viewer">Görüntüleyici</option>
                              </select>

                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-800"
                              >
                                <path
                                  d="m7 10 5 5 5-5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            <button
                              type="button"
                              onClick={() => requestRemoveAccess(member)}
                              disabled={isBusy}
                              className="h-10 rounded-xl border border-amber-800 bg-amber-900 px-4 text-sm font-bold text-amber-50 shadow-sm transition duration-200 hover:border-amber-950 hover:bg-amber-950 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isThisMemberProcessing &&
                              memberAction.type === "remove"
                                ? "Kaldırılıyor..."
                                : isThisMemberProcessing &&
                                    memberAction.type === "role"
                                  ? "Güncelleniyor..."
                                  : "Erişimi Kaldır"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SurveyAccessModal;
