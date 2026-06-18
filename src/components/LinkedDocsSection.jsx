/**
 * LinkedDocsSection
 *
 * Återanvändbar komponent för att bifoga Google Docs-kort till valfri vy.
 *
 * Props:
 *   language   string   — t.ex. 'fornsvenska'
 *   view       string   — t.ex. 'grammatik'
 *   category   string?  — t.ex. 'Syntax' (valfri, för att skopa per kategori)
 *   label      string?  — rubrik ovanför korten (default: 'Dokument')
 */

import { useState } from 'react'
import { FileText, Plus, X, ExternalLink, Pencil, Trash2, Check } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

// Google Docs-ikon som SVG
function GDocsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="1" width="16" height="22" rx="2" fill="#4285F4" fillOpacity="0.12" stroke="#4285F4" strokeWidth="1.5" />
      <path d="M14 1v5h5" stroke="#4285F4" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="8" y1="11" x2="16" y2="11" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function LinkedDocsSection({ language, view, category = null, label = 'Dokument' }) {
  const { linkedDocs, addLinkedDoc, updateLinkedDoc, removeLinkedDoc } = useLinguisticsStore()

  const docs = linkedDocs.filter(d =>
    d.language === language &&
    d.view === view &&
    (category ? d.category === category : !d.category)
  )

  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [form,      setForm]      = useState({ title: '', url: '', description: '' })
  const [editForm,  setEditForm]  = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    if (!form.url.trim()) return
    addLinkedDoc({ ...form, language, view, category: category ?? null })
    setForm({ title: '', url: '', description: '' })
    setShowForm(false)
  }

  function startEdit(doc) {
    setEditId(doc.id)
    setEditForm({ title: doc.title, url: doc.url, description: doc.description ?? '' })
  }

  function handleUpdate(e) {
    e.preventDefault()
    updateLinkedDoc(editId, editForm)
    setEditId(null)
    setEditForm(null)
  }

  // Extrahera ett visningsnamn ur URL:en som fallback
  function docDisplayTitle(doc) {
    if (doc.title) return doc.title
    try {
      const url = new URL(doc.url)
      return url.hostname.replace('www.', '')
    } catch {
      return doc.url
    }
  }

  if (docs.length === 0 && !showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 font-mono text-[11px] text-dim hover:text-muted transition-colors"
      >
        <Plus size={11} />
        Bifoga Google Dokument
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {/* Befintliga kort */}
      {docs.map(doc => {
        if (editId === doc.id) {
          return (
            <form key={doc.id} onSubmit={handleUpdate}
              className="flex items-start gap-2 rounded-lg border border-border bg-surface2 p-3">
              <GDocsIcon size={15} />
              <div className="flex-1 space-y-1.5">
                <input
                  autoFocus
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
                  placeholder="Dokumenttitel"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                />
                <input
                  required
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted placeholder-dim outline-none focus:border-accent/40"
                  placeholder="Google Docs-länk"
                  value={editForm.url}
                  onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                />
                <input
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted placeholder-dim outline-none focus:border-accent/40"
                  placeholder="Kort beskrivning (valfri)"
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                />
                <div className="flex gap-1.5 pt-0.5">
                  <button type="submit" className="btn-primary py-1 px-2 text-[11px] flex items-center gap-1">
                    <Check size={10} /> Spara
                  </button>
                  <button type="button" onClick={() => setEditId(null)} className="btn-ghost py-1 px-2 text-[11px]">
                    Avbryt
                  </button>
                </div>
              </div>
            </form>
          )
        }

        return (
          <div key={doc.id} className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border2">
            <GDocsIcon size={15} />

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[12px] font-medium text-text truncate">
                {docDisplayTitle(doc)}
              </p>
              {doc.description && (
                <p className="font-mono text-[10px] text-muted truncate">{doc.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-md bg-[#4285F4]/10 px-2 py-1 font-mono text-[10px] text-[#4285F4] transition-colors hover:bg-[#4285F4]/20"
                onClick={e => e.stopPropagation()}
              >
                Öppna <ExternalLink size={9} />
              </a>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button onClick={() => startEdit(doc)} className="rounded p-1 text-muted hover:text-text transition-colors">
                  <Pencil size={11} />
                </button>
                <button onClick={() => setConfirmDel(doc.id)} className="rounded p-1 text-muted hover:text-rose transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Lägg till-formulär */}
      {showForm && (
        <form onSubmit={handleAdd}
          className="flex items-start gap-2 rounded-lg border border-border bg-surface2 p-3">
          <GDocsIcon size={15} />
          <div className="flex-1 space-y-1.5">
            <input
              autoFocus
              className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[12px] text-text placeholder-dim outline-none focus:border-accent/40"
              placeholder="Dokumenttitel (valfri)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <input
              required
              className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted placeholder-dim outline-none focus:border-accent/40"
              placeholder="Klistra in Google Docs-länk…"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
            <input
              className="w-full rounded border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted placeholder-dim outline-none focus:border-accent/40"
              placeholder="Kort beskrivning (valfri)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex gap-1.5 pt-0.5">
              <button type="submit" className="btn-primary py-1 px-2 text-[11px] flex items-center gap-1">
                <Plus size={10} /> Bifoga
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost py-1 px-2 text-[11px]">
                Avbryt
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lägg till-knapp (när det redan finns kort) */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-mono text-[11px] text-dim hover:text-muted transition-colors"
        >
          <Plus size={11} /> Bifoga dokument
        </button>
      )}

      {/* Radera-bekräftelse */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}>
          <div className="rounded-2xl border border-border bg-bg p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <p className="font-mono text-sm text-text mb-4">Ta bort det bifogade dokumentet?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { removeLinkedDoc(confirmDel); setConfirmDel(null) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 text-sm font-medium text-rose ring-1 ring-rose/20 hover:bg-rose/20"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(null)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
