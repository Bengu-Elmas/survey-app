import { createContext, useContext, useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* KAYIT OL */
  async function register(firstName, lastName, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      email: email.trim().toLowerCase(),
      role: "user",
      createdAt: serverTimestamp(),
    });

    return userCredential.user;
  }
  /* GİRİŞ YAP */
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return userCredential.user;
  }

  /* ÇIKIŞ YAP */
  async function logout() {
    await signOut(auth);
  }

  /* KULLANICI OTURUMUNU DİNLE */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    authLoading,
    register,
    login,
    logout,
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
