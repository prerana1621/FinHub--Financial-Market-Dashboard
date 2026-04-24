"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

const ADMIN_EMAIL = "preranaacharyya11b@gmail.com"; 

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        try {
          const userDocRef = doc(db, "users", u.uid);
          const userDoc = await getDoc(userDocRef);

          let userRole = "user";

          if (userDoc.exists()) {
            userRole = userDoc.data().role || "user";
          }

          if (u.email === ADMIN_EMAIL) {
            userRole = "admin";
          }

          setRole(userRole);

        } catch (error) {
          console.error("Error fetching user role:", error);

          if (u.email === ADMIN_EMAIL) {
            setRole("admin");
          } else {
            setRole("user");
          }
        }

      } else {
        setUser(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signOut = async () => {
    await fbSignOut(auth);
    setRole(null); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);