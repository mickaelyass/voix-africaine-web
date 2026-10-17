import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return d; }
}
function fmtDur(s) {
  if (!s) return '0s';
  const m = Math.floor(s / 60);
  return m > 0 ? m + 'min ' + (s % 60) + 's' : s + 's';
}

export default function UserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('lectures');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await apiClient.get('/auth/stats/' + id);
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Fiche indisponible.');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span className="ml-3 text-sm font-bold text-ink-700/60">Chargement...</span>
    </div>
  );
  if (error) return (
    <div className="space-y-4">
      <Link to="/dashboard/utilisateurs" className="text-sm font-bold text-brand-600 hover:underline">← Retour</Link>
      <div className="alert-error" role="alert">{error}</div>
    </div>
  );
  if (!data) return null;

  const { user, stats, recent_lectures, recent_comments, recent_chapitres } = data;
  const ini = (user.full_name || user.email || '?').charAt(0).toUpperCase();
  const tabs = [
    { key: 'lectures', label: 'Lectures', count: stats.lectures_count },
    { key: 'commentaires', label: 'Commentaires', count: stats.comments_count },
    { key: 'chapitres', label: 'Chapitres créés', count: stats.chapitres_count },
  ];

  return (
    <div className="space-y-6">
      <Link to="/dashboard/utilisateurs" className="text-sm font-bold text-brand-600 hover:underline">← Retour à la liste</Link>

      <section className="card overflow-hidden">
        <div className="hero-vignette relative bg-ink-950 p-6 text-white sm:p-8">
          <div className="pattern-kente absolute inset-0 opacity-20" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-3xl font-black shadow-2xl ring-1 ring-white/20">{ini}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={user.role === 'admin' ? 'badge-gold badge' : 'badge rounded-full bg-white/15 text-white/80'}>{user.role === 'admin' ? 'Administrateur' : 'Lecteur'}</span>
                <span className="text-xs font-semibold text-white/50">Inscrit le {fmtDate(user.created_at)}</span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl">{user.full_name || 'Sans nom'}</h1>
              <p className="mt-1 text-sm text-white/70">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-900/10 border-t border-ink-900/10 bg-white">
          <div className="px-4 py-5 text-center"><p className="font-display text-3xl font-black text-brand-600">{stats.lectures_count}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Lectures</p></div>
          <div className="px-4 py-5 text-center"><p className="font-display text-3xl font-black text-brand-600">{stats.comments_count}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Commentaires</p></div>
          <div className="px-4 py-5 text-center"><p className="font-display text-3xl font-black text-brand-600">{stats.chapitres_count}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-700/50">Chapitres</p></div>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ' +
              (tab === t.key ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-pop' : 'border border-ink-900/15 bg-white text-ink-700/70 hover:border-brand-500/40 hover:text-brand-700')}>
            {t.label}
            <span className={'rounded-full px-2 py-0.5 text-[11px] font-black ' + (tab === t.key ? 'bg-white/20 text-white' : 'bg-ink-900/5 text-ink-700/60')}>{t.count}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'lectures' && <LecturesList items={recent_lectures} />}
        {tab === 'commentaires' && <CommentsList items={recent_comments} />}
        {tab === 'chapitres' && <ChapitresList items={recent_chapitres} />}
      </div>
    </div>
  );
}

// ==========================================
// SOUS-COMPOSANTS DES ONGLETS
// ==========================================

function LecturesList({ items }) {
  if (!items.length) return <div className="card"><div className="card-body"><div className="empty-state"><p className="font-bold text-ink-700/60">Aucune lecture.</p></div></div></div>;
  return (
    <div className="card">
      <div className="card-header"><h2 className="section-title">Dernières lectures</h2></div>
      <div className="card-body">
        <ul className="divide-y divide-ink-900/5">
          {items.map((l, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{l.chapitre_titre}</p>
                <p className="text-xs text-ink-700/50">{fmtDate(l.date_lecture)} · {fmtDur(l.listened_seconds)}</p>
              </div>
              <span className={l.is_completed ? 'badge-green badge' : 'badge-amber badge'}>{l.is_completed ? 'Terminé' : 'En cours'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CommentsList({ items }) {
  if (!items.length) return <div className="card"><div className="card-body"><div className="empty-state"><p className="font-bold text-ink-700/60">Aucun commentaire.</p></div></div></div>;
  return (
    <div className="card">
      <div className="card-header"><h2 className="section-title">Derniers commentaires</h2></div>
      <div className="card-body">
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="rounded-2xl border border-ink-900/10 bg-sand-50 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-xs font-bold text-brand-700">Sur : {c.chapitre_titre}</span>
                <span className="text-[11px] text-ink-700/50">{fmtDate(c.created_at)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-800">{c.contenu}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChapitresList({ items }) {
  if (!items.length) return <div className="card"><div className="card-body"><div className="empty-state"><p className="font-bold text-ink-700/60">Aucun chapitre créé.</p></div></div></div>;
  return (
    <div className="card">
      <div className="card-header"><h2 className="section-title">Chapitres créés</h2></div>
      <div className="card-body">
        <ul className="divide-y divide-ink-900/5">
          {items.map((ch) => (
            <li key={ch.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{ch.numero ? '#' + ch.numero + ' — ' : ''}{ch.titre}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <span className={ch.audio_url ? 'badge-green badge' : 'badge-slate badge'}>{ch.audio_url ? 'Audio' : 'Texte'}</span>
                <span className={ch.is_public ? 'badge-brand badge' : 'badge-amber badge'}>{ch.is_public ? 'Public' : 'Privé'}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
