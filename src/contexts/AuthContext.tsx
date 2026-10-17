import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import {
  login as loginService,
  register as registerService,
  getCurrentUser,
} from "../hooks/useAuth";


// ==========================================
// TYPES
// ==========================================

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}


// ==========================================
// CONTEXT
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


// ==========================================
// PROVIDER
// ==========================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  // ==========================================
  // RESTAURATION DE SESSION
  // ==========================================

  useEffect(() => {

    const loadUser = async () => {

      const token = localStorage.getItem(
        "access_token"
      );

      // Aucun token = utilisateur non connecté
      if (!token) {

        setUser(null);
        setLoading(false);

        return;
      }


      try {

        const userData = await getCurrentUser();

        setUser(userData);

      } catch (error: any) {

        console.error(
          "Impossible de restaurer la session :",
          error?.message || error
        );

        localStorage.removeItem(
          "access_token"
        );

        setUser(null);

      } finally {

        setLoading(false);

      }
    };


    loadUser();

  }, []);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email: string,
    password: string
  ) => {

    setError(null);

    try {

      const data = await loginService({
        username: email,
        password,
      });


      // Stockage du JWT
      localStorage.setItem(
        "access_token",
        data.access_token
      );


      // Récupération de l'utilisateur connecté
      const userData = await getCurrentUser();

      setUser(userData);

    } catch (err: any) {

      // Message d'erreur clair pour l'utilisateur
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Échec de la connexion. Vérifiez vos identifiants.";

      setError(msg);
      throw new Error(msg);
    }
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    formData: {
      email: string;
      password: string;
      full_name: string;
    }
  ) => {

    setError(null);

    try {

      // Création du compte
      await registerService(formData);

      // Connexion automatique
      await login(
        formData.email,
        formData.password
      );

    } catch (err: any) {

      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Échec de l'inscription.";

      setError(msg);
      throw new Error(msg);
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    setUser(null);
    setError(null);
  };


  // ==========================================
  // CLEAR ERROR
  // ==========================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ==========================================
// HOOK
// ==========================================

export function useAuth() {

  const context = useContext(
    AuthContext
  );


  if (!context) {

    throw new Error(
      "useAuth doit être utilisé à l'intérieur de AuthProvider"
    );

  }


  return context;
}