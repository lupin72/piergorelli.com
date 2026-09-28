# piergorelli.com — redesign

Sito personale di Pier Gorelli (Astro 7 + Tailwind 4, Netlify). Redesign in corso sul branch `redesign`. Con Pier si parla in italiano.

## Sessione
1. Leggi `docs/redesign-status.md` (dove siamo, limiti noti, prossimi passi, decisioni aperte), poi la sezione pertinente di `docs/redesign-plan.md` (specifiche approvate: posizionamento, architettura, SEO, design, motion, roadmap). Le decisioni lì sono chiuse: costruisci su quelle; se una richiesta le contraddice, fallo notare e annota la nuova decisione nel piano.
2. Lavora sul branch `redesign`. Push, merge o deploy solo con ok esplicito di Pier: `master` va in produzione su Netlify.
3. Fine lavoro: `docs/redesign-status.md` aggiornato (fatto, misure, limiti, prossimi passi, data) e commit. Il lavoro è finito quando lo stato scritto basta a riprendere dopo un clear del contesto.

## Ambiente
- Node 22: il Node di default di Volta è il 12. Prefissa i comandi con `export PATH="$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"`.
- `astro check` va in crash di memoria su Node 24: usa Node 22 e `NODE_OPTIONS=--max-old-space-size=8192`.

## Architettura del redesign
- Il nuovo design convive col vecchio: pagine su `src/layouts/Base.astro` = nuovo; pagine su `Layout.astro` = vecchio, da rifare. Codice nuovo in `src/components/rd/`, `src/scripts/rd/`, `src/styles/redesign.css`.
- `Base.astro` prop `motion`: `"showcase"` carica `motion.ts` (Lenis, GSAP, intro, cursore, WebGL); `"read"` (blog) resta senza JS di animazione al caricamento — budget JS blog < 15 KB gzip. Le transizioni (`transition.ts`) sul blog si scaricano solo al passaggio su un link.
- Hook del motion documentati in testa a `src/scripts/rd/motion.ts` (`data-hero`, `data-bp`, `data-reveal`, `data-wireframe`, `data-draw`, `data-parallax`…): riusali sulle nuove pagine.
- Colore del testo in accento: sempre `var(--accent-text)` (contrasto sul tema chiaro); `var(--accent)` solo per fondi, tratti, riempimenti.
- `src/data/work.ts` contiene casi studio **segnaposto**: restano etichettati “placeholder” finché Pier non fornisce quelli reali.

## Regole di motion (nate da bug reali)
- Un elemento animato da GSAP non ha `transition` CSS sulla stessa proprietà (causava gli scatti del parallax).
- Con Lenis usa `scrub: true`: uno scrub numerico somma un secondo smoothing.
- Maschere e clip sul testo grande includono i discendenti: `clip-path: inset(-0.35em … -0.45em …)`, `roomForDescenders()` per le maschere SplitText.
- Manifesto: il riempimento “lettera per lettera” (wipe con `clip-path`) è quello scelto da Pier; l'alternativa a translate opposti è stata scartata.
- SplitText con `aria: "none"` (e `tag: "span"` dentro elementi inline), altrimenti Lighthouse segnala ARIA proibita.
- Ogni effetto rispetta `prefers-reduced-motion` (contenuto subito visibile, niente cursore/WebGL/intro) e ha un fallback senza JS.

## Verifica
Una modifica visiva è verificata quando: `pnpm build` passa, `astro check` ha 0 errori, la pagina è stata vista nel browser, e per il motion `pnpm qa:motion` (Chrome headless, vedi `tools/qa/`) mostra scroll a 60 fps e gli screenshot sono stati guardati. Lighthouse mobile resta ≥ 95 su home, servizi e un articolo (`npx lighthouse <url> --chrome-flags="--headless=new"` su `astro preview`).
- La finestra Chrome dell'estensione, quando è in background, sospende `requestAnimationFrame`: WebGL e animazioni sembrano ferme e le misure di frame sono falsate. Per motion e WebGL usa gli script headless.
