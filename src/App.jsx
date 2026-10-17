import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auths/ProtectedRoute';
import DashboardHome from './pages/Home';
import AddLivrePage from './pages/AddLivrePage';
import ListeLivre from './pages/ListeLivre';
import LivreDetail from './pages/LivreDetail';
import AjoutChapitre from './pages/AjoutChapitre';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />}>
              <Route index element={<DashboardHome />} />
              <Route path="ajouter-livre" element={<AddLivrePage />} />
              <Route path="list-livre-public" element={<ListeLivre />} />
              <Route path="livre/:id" element={<LivreDetail />} />
              <Route path="livres/:livreId/ajouter-chapitre" element={<AjoutChapitre />} />
              <Route path="utilisateurs" element={<UsersPage />} />
              <Route path="utilisateurs/:id" element={<UserDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
