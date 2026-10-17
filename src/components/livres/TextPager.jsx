import { useMemo, useState, useEffect } from 'react';

// ==========================================
// TEXTE PAGINÉ AVEC ONGLETS
// ==========================================
// Découpe un texte long en pages de taille fixe, présentées en onglets
// numérotés (1, 2, 3...). Chaque page a une hauteur fixe pour éviter
// de scroller interminablement avant de lire un chapitre.

const CHARS_PER_PAGE = 700;

/**
 * Découpe un texte en pages de taille fixe en respectant les paragraphes.
 * Découpe d'abord sur les doubles retours ligne, puis sur les phrases
 * si un paragraphe est trop long.
 */
function splitIntoPages(text, maxChars = CHARS_PER_PAGE) {
  if (!text || !text.trim()) return [''];

  const paragraphs = text.split(/\n\s*\n/);
  const pages = [];
  let current = '';

  const splitLongParagraph = (trimmed) => {
    const sentences = trimmed.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [trimmed];
    const chunks = [];
    let chunk = '';
    for (const s of sentences) {
      if (chunk && (chunk + s).length > maxChars) {
        chunks.push(chunk.trim());
        chunk = s;
      } else {
        chunk += s;
      }
    }
    if (chunk.trim()) chunks.push(chunk.trim());
    return chunks;
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();

    if (!current) {
      if (trimmed.length <= maxChars) {
        current = trimmed;
      } else {
        const chunks = splitLongParagraph(trimmed);
        for (let i = 0; i < chunks.length - 1; i++) pages.push(chunks[i]);
        current = chunks[chunks.length - 1] || '';
      }
    } else if ((current + '\n\n' + trimmed).length <= maxChars) {
      current += '\n\n' + trimmed;
    } else {
      pages.push(current.trim());
      if (trimmed.length <= maxChars) {
        current = trimmed;
      } else {
        const chunks = splitLongParagraph(trimmed);
        for (let i = 0; i < chunks.length - 1; i++) pages.push(chunks[i]);
        current = chunks[chunks.length - 1] || '';
      }
    }
  }

  if (current.trim()) pages.push(current.trim());

  return pages.length > 0 ? pages : [''];
}

export default function TextPager({ text, title }) {
  const pages = useMemo(() => splitIntoPages(text), [text]);
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [text]);

  if (pages.length <= 1) {
    return (
      <div className="whitespace-pre-line text-[15px] leading-relaxed">
        {text}
      </div>
    );
  }

  const goTo = (i) => setPage(Math.max(0, Math.min(i, pages.length - 1)));

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="tablist"
        aria-label={title ? 'Pages du chapitre : ' + title : 'Pages du chapitre'}
      >
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === page}
            aria-controls={'texte-page-' + i}
            onClick={() => goTo(i)}
            className={
              'grid h-9 min-w-[2.25rem] place-items-center rounded-lg px-2 text-xs font-black transition-all duration-150 ' +
              (i === page
                ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-pop'
                : 'border border-ink-900/15 bg-white text-ink-700/70 hover:border-brand-500/40 hover:text-brand-700')
            }
          >
            {i + 1}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Page précédente"
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/15 bg-white text-ink-700 transition hover:border-brand-500/40 hover:text-brand-700 disabled:opacity-30"
          >
            ←
          </button>
          <span className="min-w-[3rem] text-center text-xs font-bold text-ink-700/60">
            {page + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === pages.length - 1}
            aria-label="Page suivante"
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/15 bg-white text-ink-700 transition hover:border-brand-500/40 hover:text-brand-700 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>

      <div
        id={'texte-page-' + page}
        role="tabpanel"
        className="h-[420px] overflow-y-auto rounded-2xl border border-ink-900/10 bg-sand-50/60 p-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-800 sm:h-[480px]"
      >
        {pages[page]}
      </div>

      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-700/40">
        <span>Page {page + 1} sur {pages.length}</span>
        <span>~{pages[page].length} caractères</span>
      </div>
    </div>
  );
}
