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
- `src/data/work.ts`: field reports anonimi (nessun nome, link o screenshot di clienti). Visual blueprint: in home `WorkStage.astro` (plot → build → live, `scripts/rd/work-stage.ts`), nelle pagine servizio `WorkVisual.astro`. Copy: segui `docs/content-strategy.md`; ogni numero o promessa deve stare in `docs/content-facts.md`.

## Regole di motion (nate da bug reali)
- Un elemento animato da GSAP non ha `transition` CSS sulla stessa proprietà (causava gli scatti del parallax).
- Con Lenis usa `scrub: true`: uno scrub numerico somma un secondo smoothing.
- Reveal: stato iniziale impostato al setup, mai `gsap.from` dentro un `onEnter` (l'elemento visibile lampeggia prima di rientrare). Controlla con `pnpm qa:reveal`.
- Hover con riempimento a tutta riga: hook `data-fill` + stili su `[data-hot]` e su `:hover` solo sotto `:global(html:not(.fill-js))` (vedi `rowFills()` in `motion.ts`, QA `tools/qa/hover-scroll.mjs`). Mai `pointer-events: none` durante lo scroll (perde il primo hover), mai legare il blocco agli eventi rotella (l'inerzia del trackpad continua a mandarli).
- Maschere e clip sul testo grande includono i discendenti: `clip-path: inset(-0.35em … -0.45em …)`, `roomForDescenders()` per le maschere SplitText.
- Manifesto: il riempimento “lettera per lettera” (wipe con `clip-path`) è quello scelto da Pier; l'alternativa a translate opposti è stata scartata.
- SplitText con `aria: "none"` (e `tag: "span"` dentro elementi inline), altrimenti Lighthouse segnala ARIA proibita.
- Ogni effetto rispetta `prefers-reduced-motion` (contenuto subito visibile, niente cursore/WebGL/intro) e ha un fallback senza JS.

## Accessibilità (WCAG 2.1 AA, EN 301 549)
- Obiettivo: WCAG 2.1 AA su ogni pagina, in tema chiaro/scuro e con tutti e 3 gli accenti. `pnpm qa:a11y` (axe-core + giro da tastiera, reflow 320 px, text spacing) deve dare 0 problemi. Dichiarazione pubblica in `src/pages/accessibility.astro`: aggiornala se cambia qualcosa.
- Colori: testo secondario `--muted`, testo/anelli di focus in accento `--accent-text`, errori `--danger`, bordi dei controlli `--control-line`. `--accent` e `--line*` solo per decorazioni.
- Niente animazioni infinite: tutto ciò che si muove da solo si ferma entro 5 s (WebGL compreso: poi reagisce solo al puntatore).
- Niente scorciatoie a tasto singolo globali (griglia = `⌥G`, codice `KeyG`).
- Link esterni: sempre `target="_blank" rel="noopener"` e freccia `↗` nei bottoni e nei link di navigazione. Nel Markdown lo fa il plugin `externalLinks` in `astro.config.mjs` (hast plugin di Sätteri: Astro 7 non accetta più `rehypePlugins`).
- Link dentro una frase: classe `link link--inline` (sottolineati). Testo generato via CSS `content` con alternativa vuota (`content: "✓ " / ""`).
- Contenuti che compaiono all'hover: passabili col mouse e chiudibili con Esc (`html[data-hover-off]`, in `site.ts`).
- Form: errori testuali inline con `aria-invalid` + `aria-describedby` (vedi `BriefForm.astro`); feedback di azioni in una regione `role="status"`.

## Verifica
Una modifica visiva è verificata quando: `pnpm build` passa, `astro check` ha 0 errori, la pagina è stata vista nel browser, e per il motion `pnpm qa:motion` (Chrome headless, vedi `tools/qa/`) mostra scroll a 60 fps e gli screenshot sono stati guardati. Lighthouse mobile resta ≥ 95 su home, servizi e un articolo (`npx lighthouse <url> --chrome-flags="--headless=new"` su `astro preview`).
- SVG: `clip-path` su un `<text>` è ignorato da Safari/WebKit (il testo resta intero). Metti il ritaglio su un `<g>` che contiene il testo. Verifica Safari con `node tools/qa/work-stage-webkit.mjs` (WebKit di Playwright, già installato).
- Il dev server può continuare a servire lo `<style>` scoped vecchio di un `.astro` modificato da shell (sed/python): dopo modifiche fuori dall'editor fai `touch` del file e verifica il valore calcolato (`getComputedStyle`), non solo lo screenshot.
- La finestra Chrome dell'estensione, quando è in background, sospende `requestAnimationFrame`: WebGL e animazioni sembrano ferme e le misure di frame sono falsate. Per motion e WebGL usa gli script headless.
