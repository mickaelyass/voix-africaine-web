import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ==========================================
// PAGE ADMIN : LISTE DES UTILISATEURS
// ==========================================
// Affiche la liste de tous les utilisateurs avec recherche,
// et permet de naviguer vers la fiche détaillée de chacun.

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/auth/');
      setUsers(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Impossible de charger les utilisateurs.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <span className="ml-3 text-sm font-bold text-ink-700/60">Chargement des utilisateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error" role="alert">
        {error}
        <button type="button" onClick={fetchUsers} className="ml-2 font-black underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''} sur la plateforme.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="card">
        <div className="card-body">
          <label htmlFor="user-search" className="sr-only">Rechercher un utilisateur</label>
          <input
            id="user-search"
            type="search"
            placeholder="Rechercher par nom, email ou rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-md"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Liste / Tableau */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg font-black text-ink-900">Aucun utilisateur trouvé</p>
          <p className="mt-1 text-sm text-ink-700/60">
            {search ? 'Essayez un autre terme de recherche.' : 'Aucun utilisateur enregistré.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 bg-sand-50 text-[11px] font-black uppercase tracking-wider text-ink-700/60">
                  <th scope="col" className="px-5 py-3.5">Utilisateur</th>
                  <th scope="col" className="px-5 py-3.5">Email</th>
                  <th scope="col" className="px-5 py-3.5">Rôle</th>
                  <th scope="col" className="px-5 py-3.5">Inscrit le</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const initial = (u.full_name || u.email || '?').charAt(0).toUpperCase();
                  return (
                    <tr key={u.id} className="border-b border-ink-900/5 transition hover:bg-brand-50/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-black text-white">
                            {initial}
                          </span>
                          <span className="font-bold text-ink-900">{u.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={u.role === 'admin' ? 'badge-brand' : 'badge-slate'}>
                          {u.role === 'admin' ? 'Admin' : 'Lecteur'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-ink-700/60">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={'/dashboard/utilisateurs/' + u.id}
                          className="btn-xs bg-brand-50 text-brand-700 hover:bg-brand-100"
                        >
                          Voir la fiche →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
