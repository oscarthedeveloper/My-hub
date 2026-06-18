import LinkedDocsSection from '@/components/LinkedDocsSection'

const CONJ_CATEGORIES = [
  'Presente', 'Imperfetto', 'Passato prossimo', 'Futuro', 'Condizionale', 'Congiuntivo', 'Övrigt'
]

export default function KonjugationerView() {
  return (
    <div>
      {CONJ_CATEGORIES.map(cat => (
        <div key={cat} className="mb-6">
          <div className="mb-2">
            <span className="rounded px-2 py-0.5 font-mono text-[11px] font-medium bg-cyan/10 text-cyan">
              {cat}
            </span>
          </div>
          <LinkedDocsSection language="italienska" view="konjugationer" category={cat} />
        </div>
      ))}
    </div>
  )
}
