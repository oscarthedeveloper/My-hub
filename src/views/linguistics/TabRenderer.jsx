import { useParams, Navigate } from 'react-router-dom'
import { useLinguisticsStore } from '@/store'
import DocsView from './shared/DocsView'
import NotesView from './shared/NotesView'
import FonologiView from './fornsvenska/FonologiView'
import OvningarView from './svenska/OvningarView'
import KonjugationerView from './italienska/KonjugationerView'

export default function TabRenderer() {
  const { lang, tab: tabId } = useParams()
  const { languages } = useLinguisticsStore()

  const language = languages.find(l => l.id === lang)
  if (!language) return <Navigate to="/lingvistik" replace />

  const tab = language.tabs.find(t => t.id === tabId)
  if (!tab) {
    const first = language.tabs[0]
    return <Navigate to={first ? `/lingvistik/${lang}/${first.id}` : '/lingvistik'} replace />
  }

  switch (tab.type) {
    case 'docs':          return <DocsView section={tab.id} />
    case 'notes':         return <NotesView />
    case 'fonologi':      return <FonologiView />
    case 'ovningar':      return <OvningarView />
    case 'konjugationer': return <KonjugationerView />
    default:
      return <p className="p-8 font-mono text-sm text-muted">// okänd fliktyp: {tab.type}</p>
  }
}
