import React, { useState, useEffect, useCallback } from 'react';
import AudioRecorderUploader from './AudioRecorderUploader';
import TextPager from '../components/livres/TextPager';
import axios from 'axios';

const ListeChapitres = ({ chapitres, user, onTogglePublic, onDelete, onChapitresUpdated }) => {
  const [chapitreActif, setChapitreActif] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [timestamp, setTimestamp] = useState(0);
  const token = localStorage.getItem('access_token');
  const API_URL = process.env.REACT_APP_API_URL;
  const isAdmin = user?.role === 'admin';
  const refresh = onChapitresUpdated || (async () => {});
  const chapitreActifId = chapitreActif?.id;

  const chargerCommentaires = useCallback(async () => {
    if (!chapitreActifId) return;
    try {
      const res = await axios.get(API_URL + '/commentaires/?chapitre_id=' + chapitreActifId, { headers: { Authorization: 'Bearer ' + token } });
      setCommentaires(res.data);
    } catch (e) { console.error(e); }
  }, [chapitreActifId, API_URL, token]);

  useEffect(() => { if (chapitreActifId) chargerCommentaires(); }, [chapitreActifId, chargerCommentaires]);

  // Resynchronisation avec la liste rafraichie : apres un enregistrement, le
  // chapitre selectionne doit pointer sur la version a jour (audio_url,
  // audio_validated), sinon le lecteur audio n'apparait pas et l'utilisateur ne
  // peut pas relire l'audio qu'il vient d'envoyer.
  useEffect(() => {
    if (chapitres.length === 0) {
      if (chapitreActif) setChapitreActif(null);
      return;
    }
    const aJour = chapitreActif ? chapitres.find((ch) => ch.id === chapitreActif.id) : null;
    if (!aJour) setChapitreActif(chapitres[0]);
    else if (aJour !== chapitreActif) setChapitreActif(aJour);
  }, [chapitres, chapitreActif]);


  const doDeleteAudio = async (chapitreId) => {
    if (!window.confirm('Supprimer cet audio ?')) return;
    try {
      await axios.delete(API_URL + '/chapitres/' + chapitreId + '/audio', { headers: { Authorization: 'Bearer ' + token } });
      setChapitreActif(null);
      await refresh();
    } catch (error) { alert(error.response?.data?.detail || 'Suppression impossible.'); }
  };

  const doValidateAudio = async (chapitreId) => {
    if (!window.confirm('Valider cet audio ?')) return;
    try {
      await axios.patch(API_URL + '/chapitres/' + chapitreId + '/validate-audio', {}, { headers: { Authorization: 'Bearer ' + token } });
      await refresh();
    } catch (error) { alert(error.response?.data?.detail || 'Validation impossible.'); }
  };

  const doAddComment = async (e) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim()) return;
    try {
      await axios.post(API_URL + '/commentaires/', { contenu: nouveauCommentaire, timestamp: timestamp, chapitre_id: chapitreActif.id }, { headers: { Authorization: 'Bearer ' + token } });
      setNouveauCommentaire('');
      chargerCommentaires();
    } catch (error) { alert(error.response?.data?.detail || 'Ajout impossible.'); }
  };

  const doDelComment = async (commentaire) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await axios.delete(API_URL + '/commentaires/' + commentaire.id, { headers: { Authorization: 'Bearer ' + token } });
      chargerCommentaires();
    } catch (error) { alert('Suppression impossible.'); }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[330px_1fr]">
      <div className="card overflow-hidden">
        <div className="card-header"><div><h2 className="section-title">Chapitres</h2><p className="section-desc">{chapitres.length} episode(s)</p></div></div>
        <div className="max-h-[480px] overflow-y-auto p-3">
          {chapitres.length === 0 ? <p className="p-3 text-sm italic">Aucun chapitre.</p> : (
            <ul className="space-y-2">
              {chapitres.map((ch, idx) => (
                <li key={ch.id}>
                  <button onClick={() => { setChapitreActif(ch); setCommentaires([]); }} className={'flex w-full items-center gap-3 rounded-2xl border p-3 text-left ' + (chapitreActif?.id === ch.id ? 'border-brand-500/40 bg-brand-50' : 'border-transparent hover:bg-sand-100')}>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/5 font-display text-sm font-black">{String(ch.numero ?? idx + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{ch.titre}</span>
                      <span className="mt-1 flex gap-1.5">{ch.audio_url ? <span className="badge-green badge">Audio</span> : <span className="badge-slate badge">Texte</span>}{ch.audio_validated && <span className="badge-gold badge">Valide</span>}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="min-w-0 space-y-5">
        {!chapitreActif ? <div className="empty-state"><p className="font-bold">Selectionnez un chapitre</p></div> : (
          <>
            <div className="card"><div className="card-body">
              <p className="eyebrow">Chapitre {chapitreActif.numero}</p>
              <h3 className="mt-1 font-display text-2xl font-black">{chapitreActif.titre}</h3>
              <div className="mt-4">
                <TextPager text={chapitreActif.contenu_texte} title={chapitreActif.titre} />
              </div>
              {chapitreActif.audio_url && (
                <div className="mt-5 rounded-2xl bg-ink-950 p-4 text-white">
                  <p className="mb-3 text-xs font-bold uppercase text-gold-300">Lecture audio</p>
                  <audio controls src={chapitreActif.audio_url} className="w-full" onTimeUpdate={(e) => setTimestamp(e.target.currentTime)} />
                  {!chapitreActif.audio_validated && (
                    <div className="mt-3 flex gap-2">
                      {isAdmin && <button onClick={() => doDeleteAudio(chapitreActif.id)} className="rounded-xl border border-red-400/40 px-3 py-2 text-xs font-bold text-red-300">Supprimer</button>}
                      {isAdmin && <button onClick={() => doValidateAudio(chapitreActif.id)} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white">Valider</button>}
                    </div>
                  )}
                </div>
              )}
              {/* Tout utilisateur connecte peut enregistrer un audio */}
              {!chapitreActif.audio_url && (
                <div className="mt-5"><AudioRecorderUploader chapitreId={chapitreActif.id} token={token} existingAudio={false} audioValidated={false} onUploadSuccess={refresh} /></div>
              )}
              {/* Remplacement possible par tous tant que l'audio n'est pas valide */}
              {chapitreActif.audio_url && !chapitreActif.audio_validated && (
                <div className="mt-5"><AudioRecorderUploader chapitreId={chapitreActif.id} token={token} existingAudio={true} audioValidated={false} onUploadSuccess={refresh} /></div>
              )}
            </div></div>
            <div className="card"><div className="card-body">
              <h3 className="section-title">Commentaires ({commentaires.length})</h3>
              <form onSubmit={doAddComment} className="mb-4 mt-4 flex gap-2">
                <input type="text" value={nouveauCommentaire} onChange={(e) => setNouveauCommentaire(e.target.value)} placeholder="Ajouter un commentaire..." className="input flex-1" />
                <button type="submit" className="btn-primary shrink-0">Envoyer</button>
              </form>
              <div className="space-y-3">
                {commentaires.map((cm) => (
                  <div key={cm.id} className="rounded-2xl border border-ink-900/10 bg-sand-50 p-4">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm font-bold">{cm.user_info?.full_name || 'Utilisateur'}</span>
                      {(isAdmin || cm.user_info?.id === user?.id) && <button type="button" onClick={() => doDelComment(cm)} className="text-xs font-bold text-red-500">Supprimer</button>}
                    </div>
                    <p className="mt-1 text-sm">{cm.contenu}</p>
                    {cm.timestamp > 0 && <button onClick={() => { const a = document.querySelector('audio'); if (a) { a.currentTime = cm.timestamp; a.play(); } }} className="mt-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-black text-brand-700">Reprendre a {cm.timestamp.toFixed(1)}s</button>}
                  </div>
                ))}
                {commentaires.length === 0 && <p className="rounded-2xl bg-sand-100 p-5 text-center text-sm italic">Aucun commentaire.</p>}
              </div>
            </div></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListeChapitres;

