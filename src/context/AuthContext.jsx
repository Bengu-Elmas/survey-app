import { createContext, useContext, useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyBeforeUpdateEmail,
  updatePassword,
} from "firebase/auth";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* FIRESTORE'DAN KULLANICI PROFİLİNİ AL */

  async function loadUserProfile(user) {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      /*
        Kullanıcı e-posta doğrulama bağlantısına tıkladıysa
        Firebase Authentication bilgilerini yeniliyoruz.
      */

      try {
        await reload(user);
      } catch (reloadError) {
        console.warn("Kullanıcı bilgileri yenilenemedi:", reloadError);
      }

      const refreshedUser = auth.currentUser || user;

      const userRef = doc(db, "users", refreshedUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const profileData = userSnapshot.data();

        /*
          Authentication e-postası değişmiş fakat Firestore'daki
          e-posta eski kalmışsa iki tarafı eşitliyoruz.
        */

        const authenticatedEmail =
          refreshedUser.email || profileData.email || "";

        if (authenticatedEmail && authenticatedEmail !== profileData.email) {
          await setDoc(
            userRef,
            {
              email: authenticatedEmail,
              updatedAt: serverTimestamp(),
            },
            {
              merge: true,
            },
          );
        }

        setUserProfile({
          id: userSnapshot.id,
          ...profileData,
          email: authenticatedEmail,
        });

        setCurrentUser(refreshedUser);
        return;
      }

      /*
        Eski hesaplarda Firestore kullanıcı belgesi
        bulunmayabilir.
      */

      const nameParts = (refreshedUser.displayName || "")
        .trim()
        .split(" ")
        .filter(Boolean);

      setUserProfile({
        id: refreshedUser.uid,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" "),
        fullName: refreshedUser.displayName || "",
        email: refreshedUser.email || "",
        role: "user",
      });

      setCurrentUser(refreshedUser);
    } catch (error) {
      console.error("Kullanıcı profili alınırken hata oluştu:", error);

      setUserProfile({
        id: user.uid,
        firstName: "",
        lastName: "",
        fullName: user.displayName || "",
        email: user.email || "",
        role: "user",
      });
    }
  }

  /* KAYIT OL */

  async function register(firstName, lastName, email, password) {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

    const fullName = `${cleanFirstName} ${cleanLastName}`.trim();

    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    const profileData = {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName,
      email: cleanEmail,
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), profileData);

    setCurrentUser(userCredential.user);

    setUserProfile({
      id: userCredential.user.uid,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName,
      email: cleanEmail,
      role: "user",
    });

    return userCredential.user;
  }

  /* GİRİŞ YAP */

  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    const userCredential = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password,
    );

    return userCredential.user;
  }

  /* ŞİFRE SIFIRLAMA E-POSTASI GÖNDER */

  async function resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      const error = new Error("E-posta adresi gereklidir.");

      error.code = "auth/email-required";

      throw error;
    }

    /*
      Firebase tarafından gönderilen e-postanın
      dilini Türkçe olarak ayarlıyoruz.
    */

    auth.languageCode = "tr";

    await sendPasswordResetEmail(auth, cleanEmail);
  }

  /* GİRİŞ YAPMIŞ KULLANICININ ŞİFRESİNİ DEĞİŞTİR */

  async function changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;

    if (!user || !user.email) {
      const error = new Error("Kullanıcı bilgisi bulunamadı.");

      error.code = "password/user-not-found";

      throw error;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );

    // Önce mevcut şifreyi doğruluyoruz.
    await reauthenticateWithCredential(user, credential);

    // Doğrulama başarılıysa yeni şifreyi kaydediyoruz.
    await updatePassword(user, newPassword);
  }

  /* PROFİL BİLGİLERİNİ GÜNCELLE */

  async function updateAccountProfile(
    firstName,
    lastName,
    email,
    currentPassword = "",
  ) {
    const user = auth.currentUser;

    if (!user) {
      const error = new Error("Profil güncellemek için giriş yapmalısınız.");

      error.code = "profile/user-not-found";

      throw error;
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName || !cleanEmail) {
      const error = new Error("Ad, soyad ve e-posta alanları zorunludur.");

      error.code = "profile/missing-fields";

      throw error;
    }

    const fullName = `${cleanFirstName} ${cleanLastName}`.trim();

    const currentEmail = (user.email || "").trim().toLowerCase();

    const emailChanged = cleanEmail !== currentEmail;

    /* E-POSTA DEĞİŞİKLİĞİ İÇİN YENİDEN DOĞRULAMA */

    if (emailChanged) {
      if (!currentPassword.trim()) {
        const error = new Error(
          "E-posta adresini değiştirmek için mevcut şifrenizi yazmalısınız.",
        );

        error.code = "profile/password-required";

        throw error;
      }

      if (!user.email) {
        const error = new Error("Mevcut e-posta adresi bulunamadı.");

        error.code = "profile/email-not-found";

        throw error;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);

      /*
        E-posta burada doğrudan değişmez.
        Yeni e-posta adresine doğrulama bağlantısı gönderilir.
        Kullanıcı bağlantıya tıklayınca Firebase Auth e-postayı değiştirir.
      */

      await verifyBeforeUpdateEmail(user, cleanEmail);
    }

    /* FIREBASE AUTH GÖRÜNEN ADINI GÜNCELLE */

    await updateProfile(user, {
      displayName: fullName,
    });

    /* FIRESTORE KULLANICI BELGESİNİ GÜNCELLE */

    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    /*
      E-posta doğrulanmadan önce Firestore'a yeni e-postayı
      yazmıyoruz. Böylece Auth ve Firestore birbirinden kopmuyor.
    */

    const profileEmail = emailChanged ? currentEmail : cleanEmail;

    const updatedProfileData = {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName,
      email: profileEmail,
      updatedAt: serverTimestamp(),
    };

    if (userSnapshot.exists()) {
      await setDoc(userRef, updatedProfileData, {
        merge: true,
      });
    } else {
      await setDoc(userRef, {
        ...updatedProfileData,
        role: "user",
        createdAt: serverTimestamp(),
      });
    }

    /* CONTEXT BİLGİLERİNİ ANINDA GÜNCELLE */

    const updatedLocalProfile = {
      id: user.uid,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      fullName,
      email: profileEmail,
      role: userProfile?.role || "user",
    };

    setCurrentUser(auth.currentUser);

    setUserProfile((currentProfile) => ({
      ...currentProfile,
      ...updatedLocalProfile,
    }));

    return {
      ...updatedLocalProfile,
      emailVerificationSent: emailChanged,
      pendingEmail: emailChanged ? cleanEmail : "",
    };
  }

  /* ÇIKIŞ YAP */

  async function logout() {
    await signOut(auth);

    setCurrentUser(null);
    setUserProfile(null);
  }

  /* KULLANICI OTURUMUNU DİNLE */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      setCurrentUser(user);

      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userProfile?.role === "admin";

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    authLoading,
    register,
    login,
    logout,
    resetPassword,
    updateAccountProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth, AuthProvider içerisinde kullanılmalıdır.");
  }

  return context;
}
