import { useParams } from 'react-router-dom'
import LinkedDocsSection from '@/components/LinkedDocsSection'

export default function NotesView() {
  const { lang } = useParams()

  return (
    <div>
      <LinkedDocsSection language={lang} view="anteckningar" />
    </div>
  )
}
