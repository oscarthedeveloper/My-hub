import LinkedDocsSection from '@/components/LinkedDocsSection'

const PHON_CATEGORIES = [
  'Vokalljud', 'Konsonanter', 'Ljudförändringar', 'Accent & Prosodi', 'Ortografi', 'Övrigt'
]

export default function FonologiView() {
  return (
    <div>
      {PHON_CATEGORIES.map(cat => (
        <div key={cat} className="mb-6">
          <div className="mb-2">
            <span className="rounded px-2 py-0.5 font-mono text-[11px] font-medium bg-green/10 text-green">
              {cat}
            </span>
          </div>
          <LinkedDocsSection language="fornsvenska" view="fonologi" category={cat} />
        </div>
      ))}
    </div>
  )
}
