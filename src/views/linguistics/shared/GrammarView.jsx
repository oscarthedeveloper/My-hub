import { useParams } from 'react-router-dom'
import { LANG_CONFIG } from '../LanguageLayout'
import LinkedDocsSection from '@/components/LinkedDocsSection'

const GRAMMAR_CATEGORIES = {
  fornsvenska: ['Morfologi', 'Syntax', 'Deklinationer', 'Konjugationer', 'Kasussystem', 'Pronomen', 'Övrigt'],
  svenska:     ['Grammatik', 'Stilistik', 'Meningsbyggnad', 'Interpunktion', 'Stil', 'Övrigt'],
  italienska:  ['Substantiv', 'Adjektiv', 'Verb', 'Pronomen', 'Prepositioner', 'Meningsbyggnad', 'Övrigt'],
  engelska:    ['Grammar', 'Usage', 'Syntax', 'Idioms', 'Punctuation', 'Other'],
}

export default function GrammarView() {
  const { lang } = useParams()
  const config = LANG_CONFIG[lang] ?? {}
  const categories = GRAMMAR_CATEGORIES[lang] ?? ['Övrigt']

  return (
    <div>
      {/* ── Kategorier ── */}
      {categories.map(cat => (
        <div key={cat} className="mb-6">
          <div className="mb-2">
            <span
              className="rounded px-2 py-0.5 font-mono text-[11px] font-medium"
              style={{ backgroundColor: (config.color ?? '#7c72f5') + '15', color: config.color ?? '#7c72f5' }}
            >
              {cat}
            </span>
          </div>
          <LinkedDocsSection language={lang} view="grammatik" category={cat} />
        </div>
      ))}
    </div>
  )
}


