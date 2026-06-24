import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, ExternalLink, Trash2, Pencil, Check, X, FolderOpen } from 'lucide-react'
import { useLinguisticsStore } from '@/store'

const PRESET_COLORS = [
  '#7c72f5', '#22d3ee', '#34d399', '#fbbf24',
  '#f97316', '#e11d48', '#a78bfa', '#94a3b8',
]

// ─── Formulärfält ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, required, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">Färg</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="h-6 w-6 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              outline: value === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Dokument-kort ───────────────────────────────────────────────────────────

function DocCard({ doc, color, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})

  function startEdit(e) {
    e.stopPropagation()
    setDraft({ title: doc.title, description: doc.description ?? '', url: doc.url })
    setEditing(true)
  }

  function saveEdit(e) {
    e.preventDefault()
    onUpdate(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-accent/30 bg-surface p-4 space-y-3">
        <form onSubmit={saveEdit} className="space-y-3">
          <Field label="Titel" value={draft.title} onChange={v => setDraft(d => ({ ...d, title: v }))} required />
          <Field label="Google Docs-länk" value={draft.url} onChange={v => setDraft(d => ({ ...d, url: v }))} required placeholder="https://docs.google.com/…" />
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Beskrivning</label>
            <textarea
              className="w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
              rows={2}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              placeholder="Valfri anteckning…"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 font-mono text-[12px] text-accent ring-1 ring-accent/20 hover:bg-accent/20 transition-all">
              <Check size={12} /> Spara
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-[12px]">Avbryt</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="group relative rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-border2">
      {/* Färgband */}
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-medium text-text truncate">{doc.title}</p>
            {doc.description && (
              <p className="mt-1 font-mono text-[11px] text-muted line-clamp-2 leading-relaxed">
                {doc.description}
              </p>
            )}
          </div>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg p-1.5 text-muted hover:text-accent hover:bg-accent/10 transition-colors"
            title="Öppna i Google Docs"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-dim">
            {new Date(doc.addedAt).toLocaleDateString('sv-SE')}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={startEdit}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-md p-1 text-dim hover:text-muted transition-all"
              title="Redigera"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={onDelete}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-md p-1 text-dim hover:text-rose transition-all"
              title="Ta bort"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kategori-sektion ─────────────────────────────────────────────────────────

function CategorySection({ cat, langColor, onDeleteCat, onUpdateCat, onAddDoc, onUpdateDoc, onDeleteDoc }) {
  const [showDocForm, setShowDocForm] = useState(false)
  const [docForm, setDocForm]         = useState({ title: '', url: '', description: '' })
  const [editingCat, setEditingCat]   = useState(false)
  const [catDraft, setCatDraft]       = useState({ name: cat.name, color: cat.color })
  const [confirmDel, setConfirmDel]   = useState(false)

  const color = cat.color ?? langColor

  function handleAddDoc(e) {
    e.preventDefault()
    onAddDoc(docForm)
    setDocForm({ title: '', url: '', description: '' })
    setShowDocForm(false)
  }

  function handleSaveCat(e) {
    e.preventDefault()
    onUpdateCat(catDraft)
    setEditingCat(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* ── Kategori-rubrik ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        {editingCat ? (
          <form onSubmit={handleSaveCat} className="flex flex-1 items-center gap-3 flex-wrap">
            <input
              className="flex-1 min-w-0 rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-sm text-text outline-none focus:border-accent/40 transition-colors"
              value={catDraft.name}
              onChange={e => setCatDraft(d => ({ ...d, name: e.target.value }))}
              required
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatDraft(d => ({ ...d, color: c }))}
                  className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: catDraft.color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button type="submit" className="rounded-lg p-1.5 text-accent hover:bg-accent/10 transition-colors">
                <Check size={14} />
              </button>
              <button type="button" onClick={() => setEditingCat(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface2 transition-colors">
                <X size={14} />
              </button>
            </div>
          </form>
        ) : (
          <>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="flex-1 font-display text-base text-text">{cat.name}</h3>
            <span className="font-mono text-[11px] text-muted">
              {(cat.docs ?? []).length} {(cat.docs ?? []).length === 1 ? 'dokument' : 'dokument'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCatDraft({ name: cat.name, color: cat.color }); setEditingCat(true) }}
                className="rounded-lg p-1.5 text-dim hover:text-muted hover:bg-surface2 transition-colors"
                title="Redigera kategori"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setConfirmDel(true)}
                className="rounded-lg p-1.5 text-dim hover:text-rose hover:bg-rose/10 transition-colors"
                title="Ta bort kategori"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Dokument-grid ── */}
      <div className="p-5">
        {(cat.docs ?? []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {(cat.docs ?? []).map(doc => (
              <DocCard
                key={doc.id}
                doc={doc}
                color={color}
                onDelete={() => onDeleteDoc(doc.id)}
                onUpdate={patch => onUpdateDoc(doc.id, patch)}
              />
            ))}
          </div>
        ) : (
          !showDocForm && (
            <div className="mb-4 rounded-xl border border-dashed border-border py-8 text-center">
              <p className="font-mono text-xs text-muted">// Inga dokument ännu</p>
            </div>
          )
        )}

        {/* ── Lägg till dok-formulär ── */}
        {showDocForm ? (
          <form onSubmit={handleAddDoc} className="rounded-xl border border-border bg-surface2 p-4 space-y-3">
            <p className="font-mono text-[11px] text-muted">// Nytt dokument</p>
            <Field
              label="Titel"
              value={docForm.title}
              onChange={v => setDocForm(f => ({ ...f, title: v }))}
              required
              placeholder="t.ex. Oregelbundna verb"
            />
            <Field
              label="Google Docs-länk"
              value={docForm.url}
              onChange={v => setDocForm(f => ({ ...f, url: v }))}
              required
              placeholder="https://docs.google.com/…"
            />
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Beskrivning</label>
              <textarea
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text placeholder-dim outline-none focus:border-accent/40 transition-colors"
                rows={2}
                value={docForm.description}
                onChange={e => setDocForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Valfri anteckning…"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Spara</button>
              <button type="button" onClick={() => setShowDocForm(false)} className="btn-ghost">Avbryt</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowDocForm(true)}
            className="flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-text transition-colors"
          >
            <Plus size={13} style={{ color }} /> Lägg till dokument
          </button>
        )}
      </div>

      {/* ── Bekräfta radering ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <p className="font-mono text-sm text-text mb-1">Ta bort kategorin "{cat.name}"?</p>
            <p className="font-mono text-[11px] text-muted mb-5">
              Alla {(cat.docs ?? []).length} dokument i kategorin tas bort.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onDeleteCat(); setConfirmDel(false) }}
                className="rounded-lg bg-rose/10 px-3 py-1.5 font-mono text-sm text-rose ring-1 ring-rose/20 hover:bg-rose/20 transition-all"
              >
                Ta bort
              </button>
              <button onClick={() => setConfirmDel(false)} className="btn-ghost">Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Huvudvy ─────────────────────────────────────────────────────────────────

export default function DocsView({ section }) {
  const { lang } = useParams()
  const {
    categoriesByScope,
    addDocCategory,
    updateDocCategory,
    removeDocCategory,
    addDoc,
    updateDoc,
    removeDoc,
  } = useLinguisticsStore()

  const [showCatForm, setShowCatForm] = useState(false)
  const [catForm, setCatForm]         = useState({ name: '', color: PRESET_COLORS[0] })

  // Hämta kategorier för detta språk + sektion
  const categories = categoriesByScope(lang, section)

  // Hämta språkfärg från LanguageLayout-config
  const LANG_COLORS = {
    fornsvenska: '#34d399',
    svenska:     '#7c72f5',
    italienska:  '#22d3ee',
    engelska:    '#fbbf24',
  }
  const langColor = LANG_COLORS[lang] ?? '#7c72f5'

  function handleCreateCat(e) {
    e.preventDefault()
    if (!catForm.name.trim()) return
    addDocCategory(lang, section, { name: catForm.name.trim(), color: catForm.color })
    setCatForm({ name: '', color: PRESET_COLORS[0] })
    setShowCatForm(false)
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-muted">
          {categories.length === 0
            ? '// Inga kategorier ännu'
            : `// ${categories.length} ${categories.length === 1 ? 'kategori' : 'kategorier'} · ${categories.reduce((s, c) => s + (c.docs?.length ?? 0), 0)} dokument`}
        </p>
        <button
          onClick={() => setShowCatForm(s => !s)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={13} /> Ny kategori
        </button>
      </div>

      {/* ── Ny kategori-formulär ── */}
      {showCatForm && (
        <form onSubmit={handleCreateCat} className="mb-6 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-text">Skapa kategori</p>
            <button type="button" onClick={() => setShowCatForm(false)} className="text-muted hover:text-text">
              <X size={15} />
            </button>
          </div>
          <Field
            label="Namn"
            value={catForm.name}
            onChange={v => setCatForm(f => ({ ...f, name: v }))}
            required
            placeholder="t.ex. Verb, Substantiv, Konjunktioner…"
          />
          <ColorPicker value={catForm.color} onChange={v => setCatForm(f => ({ ...f, color: v }))} />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">Skapa</button>
            <button type="button" onClick={() => setShowCatForm(false)} className="btn-ghost">Avbryt</button>
          </div>
        </form>
      )}

      {/* ── Kategori-lista ── */}
      {categories.length === 0 && !showCatForm ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mb-3 flex justify-center text-muted">
            <FolderOpen size={28} strokeWidth={1.2} />
          </div>
          <p className="font-mono text-sm text-muted">// Tomt — skapa en kategori för att komma igång</p>
          <p className="mt-1 font-mono text-[11px] text-dim">
            t.ex. "Verb", "Substantiv", "Konjugationer"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              langColor={langColor}
              onDeleteCat={() => removeDocCategory(cat.id)}
              onUpdateCat={patch => updateDocCategory(cat.id, patch)}
              onAddDoc={doc => addDoc(cat.id, doc)}
              onUpdateDoc={(docId, patch) => updateDoc(cat.id, docId, patch)}
              onDeleteDoc={docId => removeDoc(cat.id, docId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
