**# Character Codex

A GitHub Pages-ready static web app for character building and novel planning.

## Included files

- `index.html` — app shell
- `styles.css` — UI styling
- `app.js` — schema, state, rendering, import/export, placeholder text extraction
- `README.md` — setup and deploy notes

## What this version does

- Multiple characters in a roster
- Schema-driven form with grouped categories
- Dynamic `woundTheme -> coreLie` options
- Local-first persistence with `localStorage`
- Download one character or the entire roster as JSON
- Import a saved roster JSON
- Copy a structured AI prompt
- Placeholder `.txt` analysis that is safe for static hosting

## Important limitation

This app is static. Do **not** put an API key in `app.js`.

If you want real AI extraction later, add a backend endpoint and send the uploaded text there.

## Local use

You can open `index.html` directly in a browser, or drag the whole folder into a simple static server.

## Fast deploy using your current public repo

You currently have a public repo named:

- `kbrim3-boop/starwars-planets-db`

That is the least-friction place to publish this immediately.

### Upload steps

1. Open the repo on GitHub.
2. Click **Add file** → **Upload files**.
3. Upload these files into the repo root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
4. Commit the changes to the `main` branch.

### Turn on GitHub Pages

1. Open the repo.
2. Go to **Settings**.
3. Open **Pages** in the left sidebar.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Set:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
6. Click **Save**.

Your site URL should be:

- `https://kbrim3-boop.github.io/starwars-planets-db/`

## Cleaner option

If you do not want the codex living at a Star Wars repo URL, make a dedicated public repo such as `character-codex` and upload the same files there instead.

That would give you:

- `https://kbrim3-boop.github.io/character-codex/`

## Where to edit the schema

The form is controlled in `app.js` by the `questionSchema` array.

Each field supports the following structure:

```js
{
  id: "fieldName",
  label: "Label shown in UI",
  type: "text" | "textarea" | "select",
  category: "Section Name",
  placeholder: "Optional placeholder",
  options: ["", "Option 1", "Option 2"],
  note: "Optional helper note",
  dynamicOptions: (character) => ["", "Depends", "On", "State"]
}
```

## Suggested next improvements

- Add relationship cards and scene cards
- Add tag filters for POV / faction / act
- Add timeline fields
- Add export formats for Obsidian / Notion / AI prompt packs
- Replace `heuristicExtraction()` with a real server-side model call
**
