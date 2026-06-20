/**
 * syncWordsToFile — Slår ihop nuvarande ord med en JSON-fil på disk.
 *
 * Logik:
 *  - Öppna en befintlig fil ELLER skapa en ny
 *  - Läs in befintliga ord från filen (om den finns)
 *  - Slå ihop: ord i store upserteras via `id` (lägg till om ny, uppdatera om finns)
 *  - Ord i filen som INTE finns i store behålls (de kan komma från annan enhet/session)
 *  - Skriv tillbaka den sammanslagna listan
 *
 * @param {Array} storeWords  — alla ord från Zustand-storen
 * @returns {{ added, updated, kept, total } | { cancelled: true } | { error: string }}
 */
export async function syncWordsToFile(storeWords) {
  // Fallback: om File System Access API saknas → ladda ned som vanlig fil
  if (!window.showOpenFilePicker) {
    downloadFallback(storeWords)
    return { fallback: true, total: storeWords.length }
  }

  // 1. Låt användaren välja eller skapa fil via "Spara som"-dialog
  //    (befintlig fil kan väljas här — innehållet läses och slås ihop nedan)
  let fileHandle
  try {
    fileHandle = await window.showSaveFilePicker({
      suggestedName: 'ordbok.json',
      types: [{ description: 'Ordbok (JSON)', accept: { 'application/json': ['.json'] } }],
      startIn: 'documents',
    })
  } catch (err) {
    if (err.name === 'AbortError') return { cancelled: true }
    return { error: err.message }
  }

  // 2. Läs befintlig fil
  let existing = []
  try {
    const file = await fileHandle.getFile()
    const text = await file.text()
    if (text.trim()) {
      const parsed = JSON.parse(text)
      existing = Array.isArray(parsed) ? parsed : []
    }
  } catch {
    existing = [] // tom eller korrupt fil — börja om
  }

  // 3. Slå ihop via id
  const fileMap = new Map(existing.map(w => [w.id, w]))
  let added = 0
  let updated = 0

  for (const word of storeWords) {
    if (fileMap.has(word.id)) {
      updated++
    } else {
      added++
    }
    fileMap.set(word.id, word) // alltid senaste versionen
  }

  const kept = existing.filter(w => !storeWords.some(sw => sw.id === w.id)).length
  const merged = Array.from(fileMap.values())
    .sort((a, b) => (a.language ?? '').localeCompare(b.language ?? '') || (a.word ?? '').localeCompare(b.word ?? ''))

  // 4. Skriv tillbaka
  try {
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(merged, null, 2))
    await writable.close()
  } catch (err) {
    return { error: err.message }
  }

  return { added, updated, kept, total: merged.length }
}

// Fallback för Firefox/Safari — enkel nedladdning
function downloadFallback(words) {
  const json = JSON.stringify(words, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ordbok-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
