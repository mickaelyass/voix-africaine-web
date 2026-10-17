import { NavLink } from 'react-router-dom';

const linkBase = 'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150';
const linkClass = ({ isActive }) => linkBase + (isActive ? ' bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-pop' : ' text-ink-700/70 hover:bg-brand-50 hover:text-brand-700');

export default function Sidebar({ user, onNavigate }) {
  return (
    <nav className="flex h-full flex-col gap-4 p-4" aria-label="Navigation principale">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-50 to-gold-400/20 px-3 py-3 ring-1 ring-inset ring-brand-500/15">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-black text-white">VA</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-black text-ink-900">Voix Africaine</span>
          <span className="truncate text-xs font-semibold text-brand-700">Espace personnel</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        <li><NavLink to="/dashboard" end className={linkClass} onClick={onNavigate}><span>◧</span> Tableau de bord</NavLink></li>
        <li><NavLink to="/dashboard/list-livre-public" className={linkClass} onClick={onNavigate}><span>▤</span> Livres publics</NavLink></li>
        {user?.role === 'admin' && (
          <li><NavLink to="/dashboard/ajouter-livre" className={linkClass} onClick={onNavigate}><span>+</span> Ajouter un livre</NavLink></li>
        )}
        {user?.role === 'admin' && (
          <li><NavLink to="/dashboard/utilisateurs" className={linkClass} onClick={onNavigate}><span>👥</span> Utilisateurs</NavLink></li>
        )}
      </ul>
      <div className="mt-auto rounded-2xl border border-ink-900/10 bg-sand-50 px-3.5 py-3.5">
        <p className="truncate text-sm font-black text-ink-900">{user?.full_name || 'Utilisateur'}</p>
        <p className="truncate text-xs text-ink-700/60">{user?.email}</p>
        <span className={user?.role === 'admin' ? 'badge-brand mt-2' : 'badge-slate mt-2'}>{user?.role === 'admin' ? 'Admin' : 'Lecteur'}</span>
      </div>
    </nav>
  );
}
