# Hub

Personlig hub för projekt, lingvistik, högskoleprov och engagemang.

## Kom igång

```bash
npm install
npm run dev
```

Öppna sedan `http://localhost:5173`.

## Stack

- **React 18** + **Vite** — SPA, snabb dev-loop
- **Tailwind CSS** — utility-first styling
- **GSAP** — sidoövergångar och animationer
- **Lenis** — smooth scroll
- **Zustand** — global state
- **React Router v6** — klientrouting

## Struktur

```
src/
├── layout/          Sidebar + Canvas (huvud-layout)
├── views/           En mapp per modul
│   ├── Dashboard    Bento-grid startsida
│   ├── projects     Next.js/Docusaurus-projekt
│   ├── linguistics  Fornsvenska, Svenska, Italienska, Engelska
│   ├── hp           Högskoleprov – countdown och övningslogg
│   └── engagemang   MUF, UPF, Substack, Frontend Mentor, Scrimba
├── components/      Delade UI-komponenter (BentoCard etc)
├── hooks/           useLenis, useGSAP
├── store/           Zustand stores (ett per domän)
└── lib/storage.js   Abstrakt datalager (localStorage → Supabase)
```

## Data och säkerhet

Data lagras i **localStorage** som standard.

### Exportera backup
I konsolen (F12):
```js
import('@/lib/storage').then(m => console.log(m.storage.export()))
```
Kopiera JSON-strängen och spara den på valfri plats.

### Migrera till Supabase
1. Skapa ett projekt på [supabase.com](https://supabase.com)
2. Skapa `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   ```
3. Byt ut `lsGet`/`lsSet` i `src/lib/storage.js` mot Supabase-anrop

## Lägga till en ny modul

1. Skapa `src/views/minmodul/MinModulView.jsx`
2. Lägg till rutt i `src/layout/Canvas.jsx`
3. Lägg till nav-item i `src/layout/Sidebar.jsx` (NAV_ITEMS-arrayen)
4. Lägg till ett BentoCard i `src/views/Dashboard.jsx`
