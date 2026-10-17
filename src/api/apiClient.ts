import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ==========================================
// TIMEOUT GLOBAL
// ==========================================
// 15 secondes suffisent pour un appel API normal.
// Empêche une attente de 30+ secondes en cas de cold start Render.

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ==========================================
// INTERCEPTEUR : JWT + REFRESH
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// INTERCEPTEUR : GESTION DES ERREURS GLOBALLES
// ==========================================

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Timeout : message clair pour l'utilisateur
    if (error.code === "ECONNABORTED") {
      console.error("[API] Timeout — le serveur met trop de temps à répondre.");
      return Promise.reject(
        new Error(
          "Le serveur met trop de temps à répondre. Vérifiez votre connexion."
        )
      );
    }

    // Pas de connexion du tout
    if (error.code === "ERR_NETWORK") {
      console.error("[API] Erreur réseau — serveur injoignable.");
      return Promise.reject(
        new Error("Impossible de joindre le serveur. Réessayez plus tard.")
      );
    }

    // 401 : token expiré → nettoyage automatique
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        console.warn("[API] Session expirée — redirection vers /login.");
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    // 429 : rate limit
    if (error.response?.status === 429) {
      console.warn("[API] Rate limit atteint — trop de requêtes.");
      return Promise.reject(
        new Error(
          error.response?.data?.detail ||
            "Trop de requêtes. Attendez une minute puis réessayez."
        )
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
