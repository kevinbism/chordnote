# Chordnote

Chordnote is a lightweight, client-side guitar song-sheet editor. Create sections, build ordered chord progressions, transpose a whole song and print diagrams or chord names.

## Requirements

- Node.js 26 LTS
- pnpm 10.33 or later

## Run locally

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Validate

```sh
pnpm test
pnpm test:e2e
pnpm lint
pnpm build
pnpm preview
```

The browser tests use Playwright's Chromium project. Install its browser the first time with:

```sh
pnpm exec playwright install chromium
```

## Use

- Add a chord name and press Enter or select **Add chord**. ChordKit's parser validates it.
- Parser-valid chords stay in the progression even when the guitar dictionary does not contain a matching diagram.
- Add as many custom sections and chords as needed. Each chord can be removed separately.
- Transpose the full song by semitones between -11 and +11. Chord names and diagrams are derived from the original names; a chord entered while transposed is interpreted in the original key.
- Clear the song after confirmation. The editor restarts with one empty section; the theme preference is retained.
- Print an A4 song sheet with chord diagrams or chord names only. Browser-menu printing uses the most recently selected format.
- Songs exist only in the current page session. Chordnote has no account, database, network storage or song persistence. An explicitly selected light/dark theme is saved locally in this browser.

## ChordKit coverage

Chordnote uses ChordKit's parser, theory utilities, React SVG components and built-in guitar dictionary; it does not duplicate chord fingering data. The current dictionary covers a limited set of common guitar shapes. A recognized chord without a suitable shape is kept in the progression and labeled **Diagram unavailable**. When transposition has no target-key dictionary entry but the original shape exists, ChordKit shifts that shape on the neck; resulting voicings can be higher-position shapes.

## Deploy to Vercel

Import the Git repository into Vercel, select the Vite preset, and configure:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Node.js version: `26.x`

Connect the repository through Vercel Git integration to create production deployments from the configured production branch and preview deployments for pull requests/branches. Chordnote is a static Vite application and does not require serverless functions, APIs or a database.
