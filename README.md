# M. Troynin — AI Technical Writer Portfolio

Jekyll site for GitHub Pages. Dark theme with teal accent, Inter + JetBrains Mono typography.

## Quick Start

```bash
# Install dependencies
bundle install

# Run locally
bundle exec jekyll serve --livereload

# Open http://localhost:4000
```

## Deploy to GitHub Pages

### Option A: User site (`username.github.io`)

1. Create a repo named `username.github.io`
2. Push this folder to the `main` branch
3. Go to **Settings → Pages → Source** → select `main` branch
4. Site will be live at `https://username.github.io`

### Option B: Project site (`username.github.io/repo-name`)

1. Create any repo (e.g. `portfolio`)
2. Push this folder to the `main` branch
3. In `_config.yml`, set `baseurl: "/portfolio"`
4. Go to **Settings → Pages → Source** → select `main` branch
5. Site will be live at `https://username.github.io/portfolio`

## Customization

### Content

| What | Where |
|------|-------|
| Site metadata | `_config.yml` |
| Navigation | `_data/navigation.yml` |
| "What I Document" cards | `_data/doc_types.yml` |
| Tools list | `_data/tools.yml` |
| Workflow principles & prompts | `_data/workflow.yml` |
| About page content | `_data/about.yml` |
| Work samples | `_samples/*.md` (each file = one sample) |

### Design

| What | Where |
|------|-------|
| Colors, fonts, tokens | `_sass/_variables.scss` |
| Layout & containers | `_sass/_layout.scss` |
| Component styles | `_sass/_cards.scss`, `_sass/_buttons.scss`, etc. |

### Adding a new work sample

Create a file in `_samples/`, e.g. `_samples/my-new-project.md`:

```yaml
---
title: "My New Project"
summary: "Short description"
tags: ["API Docs", "REST"]
category: "API Docs"
tools: ["Markdown", "GitHub"]
input: ["Source code", "Interviews"]
output: ["API reference", "Quickstart"]
featured: true    # show on home page
order: 8          # sort order
status: "Complete"
---

## Context
...your content in Markdown...
```

### Contact form

The contact form uses [Formspree](https://formspree.io). Replace `YOUR_FORM_ID` in `contact.html` with your Formspree form ID, or swap for another form backend.

### Theme toggle

The site defaults to dark theme. To add a light/dark toggle button, add an element with `id="theme-toggle"` anywhere in the header — the JS is already wired up.

### Profile photo

Place your photo at `assets/images/portrait.jpg` and uncomment the `<img>` tag in `about.html`.

## Structure

```
├── _config.yml          # Jekyll config
├── _data/               # YAML data files
├── _includes/           # Reusable HTML fragments
├── _layouts/            # Page templates
├── _samples/            # Work sample collection (Markdown)
├── _sass/               # SCSS partials
├── assets/
│   ├── css/main.scss    # SCSS entry point
│   ├── js/main.js       # Interactivity
│   └── images/          # Static images
├── index.html           # Home page
├── work.html            # Work samples listing
├── workflow.html        # AI Workflow page
├── about.html           # About page
├── contact.html         # Contact page
├── Gemfile              # Ruby dependencies
└── .gitignore
```
