# AGENTS.md — MikhailoTroynin Project

Instructions for AI agents working in this repository.

## Repository

- GitHub: `MikahiloTroynin/MikhailoTroynin`
- Type: static web app (React + marked.js, no build step)
- Languages: Ukrainian (UA) and English (EN) documentation

## Git Workflow

### Branch

Always work on the branch specified in the task description (`claude/<task-name>-<ID>`). Create it locally if it doesn't exist.

### Commit

```bash
git add <specific files>
git commit -m "Clear description of what changed and why"
```

### Push — IMPORTANT

Direct `git push` returns **403** (local proxy has no auth). You must use a GitHub PAT token.

**Steps:**
1. Ask the user for their PAT: `ghp_xxxxxxxxxxxxxxxx`
2. Execute push and restore original remote in one chain:

```bash
git remote set-url origin "https://<TOKEN>@github.com/MikahiloTroynin/MikhailoTroynin.git" && \
git push -u origin <branch> 2>&1; \
git remote set-url origin "http://local_proxy@127.0.0.1:39565/git/MikahiloTroynin/MikhailoTroynin"
```

**Security:** Never store the token in any file. Always restore the original remote URL.

**Retry on network failure:** wait 2s → 4s → 8s → 16s between attempts (max 4 retries).

## App Structure

| File | Purpose |
|------|---------|
| `index.html` | Entry point, loads all scripts |
| `styles.css` | All styles |
| `edge-veda-docs-content-ua.js` | UA Markdown content → `window.EDGE_VEDA_DOCS_UA_CONTENT` |
| `edge-veda-docs-content-en.js` | EN Markdown content → `window.EDGE_VEDA_DOCS_EN_CONTENT` |
| `edge-veda-docs-data.js` | Sidebar structure and metadata |
| `ev-doc-page.jsx` | Doc page renderer (marked.js → HTML) |
| `app.jsx` | Hash router (`#/ev-doc/:slug`, `#/api-doc/:slug`) |
| `mermaid-diagrams/` | Generated PNG images from Mermaid diagrams |

## Markdown Rendering Rules

- Library: `marked.js` loaded from CDN (latest version)
- Valid `setOptions`: `{ breaks: true, gfm: true }` — **do not** pass `mangle`, `headerIds`, `sanitize` (removed in marked v5+, will throw)
- Images require CSS: `.api-doc-prose img { max-width: 100%; height: auto; display: block; }`

## Content File Format

Content is stored as escaped JS strings:
```js
window.EDGE_VEDA_DOCS_UA_CONTENT = {
  "slug-name": "---\ntitle: \"Title\"\n---\n\n# Heading\n\nContent..."
}
```

When editing content: always update **both** `edge-veda-docs-content-ua.js` and `edge-veda-docs-content-en.js`.

## Mermaid → PNG Generation

```bash
# One-time: create puppeteer config (required when running as root)
echo '{"args":["--no-sandbox","--disable-setuid-sandbox"]}' > puppeteer-config.json

# Generate PNG
npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.png -b white -p puppeteer-config.json
```

Output goes to `mermaid-diagrams/`. Reference in Markdown: `![name](mermaid-diagrams/name.png)`.
