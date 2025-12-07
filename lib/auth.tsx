"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, Auth, User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyD87yMXVU-duvvjluTcsBY9Vk4KKcsPhic",
  authDomain: "neighbor-notes.firebaseapp.com",
  projectId: "neighbor-notes",
  storageBucket: "neighbor-notes.firebasestorage.app",
  messagingSenderId: "7942002024",
  appId: "1:7942002024:web:638386eeeabbf6ddfe32dd",
  measurementId: "G-0SSQKZJLK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Define Context Types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  // Initialize Firebase and Auth
  useEffect(() => {
    try {
      const app: FirebaseApp = initializeApp(firebaseConfig);
      const authInstance: Auth = getAuth(app);
      setAuth(authInstance);

      // Set up authentication state listener
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      // Catch error if Firebase is already initialized (e.g., in development mode)
      setLoading(false);
    }
  }, []);

  // Authentication functions
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication not initialized.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication not initialized.");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 5. Loading Screen for better UX
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-stone-50 flex items-center justify-center">
    <div className="text-emerald-600 text-xl font-semibold animate-pulse">
      Loading Auth...
    </div>
  </div>
);