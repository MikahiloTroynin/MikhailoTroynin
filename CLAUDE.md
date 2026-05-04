# CLAUDE.md — MikhailoTroynin Project

Контекст та інструкції для Claude Code сесій у цьому репозиторії.

## Репозиторій

- GitHub: `MikahiloTroynin/MikhailoTroynin`
- Тип: статичний веб-застосунок (React + marked.js без збірки)
- Мова: Ukrainian (UA) та English (EN) документація

## Git: гілки та коміти

Кожна задача виконується на окремій гілці, вказаній у системному промпті (`claude/<task-name>-<ID>`).

```bash
git checkout -b claude/<task-name>-<ID>  # якщо гілка ще не існує
git add <files>
git commit -m "Опис змін"
```

## Git Push — обов'язковий воркфлоу

Прямий `git push` **не працює** — проксі повертає 403. Завжди потрібен PAT токен.

**Алгоритм:**

1. Запитай у користувача PAT токен (`ghp_xxxxxxxxxxxxxxxx`)
2. Виконай push з токеном в URL, одразу відновивши оригінальний remote:

```bash
git remote set-url origin "https://<TOKEN>@github.com/MikahiloTroynin/MikhailoTroynin.git" && \
git push -u origin <branch> 2>&1; \
git remote set-url origin "http://local_proxy@127.0.0.1:39565/git/MikahiloTroynin/MikhailoTroynin"
```

**Правила безпеки:**
- Токен **ніколи** не зберігати у файлах (`settings.json`, `.env`, тощо)
- Оригінальний remote URL завжди відновлювати одразу після push
- Для retry при мережевих помилках: чекай 2s, 4s, 8s, 16s між спробами

## Структура застосунку

```
index.html                        # точка входу, завантажує всі JS/JSX
styles.css                        # всі стилі
edge-veda-docs-content-ua.js      # Markdown контент (UA), window.EDGE_VEDA_DOCS_UA_CONTENT
edge-veda-docs-content-en.js      # Markdown контент (EN), window.EDGE_VEDA_DOCS_EN_CONTENT
edge-veda-docs-data.js            # структура розділів та метадані
ev-doc-page.jsx                   # рендеринг документації (marked.js → HTML)
api-doc-page.jsx                  # рендеринг API документації
app.jsx                           # роутер (#/ev-doc/:slug, #/api-doc/:slug)
mermaid-diagrams/                 # згенеровані PNG з Mermaid діаграм
```

## Markdown рендеринг

Використовується `marked.js` (CDN, остання версія). Важливо:

- `marked.setOptions` приймає лише актуальні опції: `{ breaks: true, gfm: true }`
- `mangle` та `headerIds` **видалені** у marked v5+ — не передавати!
- Зображення у `.api-doc-prose img` потребують CSS: `max-width: 100%; height: auto; display: block`

## Mermaid → PNG генерація

Для генерації PNG з Mermaid коду:

```bash
# Встановити puppeteer config для root (no-sandbox)
cat > puppeteer-config.json << 'EOF'
{"args": ["--no-sandbox", "--disable-setuid-sandbox"]}
EOF

# Генерація
npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.png -b white -p puppeteer-config.json
```

Діаграми зберігаються у `mermaid-diagrams/`, посилання у Markdown:
```markdown
![назва](mermaid-diagrams/назва.png)
```

## Контентні файли

Контент зберігається як JS об'єкти з екранованими рядками:
```js
window.EDGE_VEDA_DOCS_UA_CONTENT = {
  "slug": "---\ntitle: ...\n---\n\n# Заголовок\n\nТекст..."
}
```

При зміні контенту міняти **обидва** файли: `edge-veda-docs-content-ua.js` та `edge-veda-docs-content-en.js`.
