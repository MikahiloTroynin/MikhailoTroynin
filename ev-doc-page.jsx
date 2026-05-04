// Edge Veda docs page — renders markdown content for documentation entries

function useMarkdownHtml(md) {
  return React.useMemo(() => {
    if (!md) return "";
    if (typeof marked !== "undefined" && marked.parse) {
      marked.setOptions({ breaks: true, gfm: true, mangle: false, headerIds: true });
      return marked.parse(md);
    }
    return "<pre>" + md.replace(/</g, "&lt;") + "</pre>";
  }, [md]);
}

function stripFrontMatter(md) {
  if (!md) return "";
  return md.replace(/^[ \t]*---[ \t]*\n[\s\S]*?\n[ \t]*---[ \t]*\n?/, "").trimStart();
}

function buildDocPath(categoryId, slug, lang) {
  const isEn = lang === "en";
  const base = isEn ? "edge-veda docs/EN" : "edge-veda docs/UA";
  const suffix = isEn ? "EN" : "UA";
  const ext = isEn ? "_en.md" : "_ua.md";

  const catFolder = {
    "getting-started": `getting-started_${suffix}`,
    concepts: `concepts_${suffix}`,
    guides: `guides_${suffix}`,
    examples: `examples_${suffix}`,
    mcp: `mcp_${suffix}`,
    platforms: `platforms_${suffix}`,
    reference: `reference_${suffix}`,
    troubleshooting: `troubleshooting_${suffix}`,
  }[categoryId];
  if (!catFolder) return null;

  const slugPrefix = {
    "getting-started": "gs-",
    concepts: "c-",
    guides: "g-",
    examples: "e-",
    mcp: "mcp-",
    platforms: "p-",
    reference: "r-",
    troubleshooting: "t-",
  }[categoryId] || "";

  const fileStem = slug.startsWith(slugPrefix) ? slug.slice(slugPrefix.length) : slug;
  return `${base}/${catFolder}/${fileStem}${ext}`;
}

function getEmbeddedDoc(slug, lang) {
  const map = lang === "en"
    ? (window.EDGE_VEDA_DOCS_EN_CONTENT || {})
    : (window.EDGE_VEDA_DOCS_UA_CONTENT || {});
  return map[slug] || "";
}

function EdgeVedaDocPage({ lang, slug }) {
  const cats = window.EDGE_VEDA_DOCS.categories;
  let doc = null;
  let category = null;
  for (const cat of cats) {
    const found = cat.docs.find((d) => d.slug === slug);
    if (found) { doc = found; category = cat; break; }
  }

  const [md, setMd] = React.useState("");
  const [loadError, setLoadError] = React.useState("");

  React.useEffect(() => {
    setMd("");
    setLoadError("");
    if (!doc || !category) return;

    const embedded = getEmbeddedDoc(doc.slug, lang);
    if (embedded) {
      setMd(embedded);
      return;
    }

    const docPath = buildDocPath(category.id, doc.slug, lang);
    if (!docPath) {
      setLoadError("Unable to resolve document path.");
      return;
    }

    fetch(encodeURI(docPath))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((txt) => setMd(txt))
      .catch((e) => setLoadError(String(e?.message || e)));
  }, [slug, lang]);

  if (!doc) {
    return <main><div className="container page-header"><h1>{lang === "en" ? "Document not found" : "Документ не знайдено"}</h1><p><a href="#/sample/code-to-docs">← {lang === "en" ? "Back" : "Назад"}</a></p></div></main>;
  }

  const en = lang === "en";
  const title = doc.title[lang];
  const catTitle = category.title[lang];
  const cleanMd = React.useMemo(() => stripFrontMatter(md), [md]);
  const html = useMarkdownHtml(cleanMd);
  const idx = category.docs.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? category.docs[idx - 1] : null;
  const next = idx < category.docs.length - 1 ? category.docs[idx + 1] : null;

  return (
    <main>
      <div className="container page-header">
        <h1>{title}</h1>
        <p className="lede" style={{ color: "var(--color-text-muted)" }}>{en ? "Source: English documentation (EN docs)." : "Джерело контенту: українська документація (UA)."}</p>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose api-doc-prose">
            {cleanMd && <div dangerouslySetInnerHTML={{ __html: html }} />}
            {!md && !loadError && <p>{en ? "Loading documentation..." : "Завантаження документації..."}</p>}
            {loadError && <p style={{ color: "#b00020" }}>{en ? "Failed to load markdown:" : "Не вдалося завантажити markdown:"} {loadError}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 16 }}>
              {prev ? <a href={"#/ev-doc/" + prev.slug} className="button button-ghost button-sm">← {prev.title[lang]}</a> : <div />}
              {next ? <a href={"#/ev-doc/" + next.slug} className="button button-ghost button-sm">{next.title[lang]} →</a> : <div />}
            </div>
          </article>
          <aside>
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-title">{catTitle}</div>
              {category.docs.map((d) => <a key={d.slug} href={"#/ev-doc/" + d.slug} className={d.slug === slug ? "is-active" : ""}>{d.title[lang]}</a>)}
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { EdgeVedaDocPage });
