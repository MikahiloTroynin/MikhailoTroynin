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

function buildUaDocPath(categoryId, slug) {
  const base = "edge-veda docs/UA";
  const catFolder = {
    "getting-started": "getting-started_UA",
    concepts: "concepts_UA",
    guides: "guides_UA",
    examples: "examples_UA",
    mcp: "mcp_UA",
    platforms: "platforms_UA",
    reference: "reference_UA",
    troubleshooting: "troubleshooting_UA",
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
  return `${base}/${catFolder}/${fileStem}_ua.md`;
}

function getEmbeddedUaDoc(slug) {
  const map = window.EDGE_VEDA_DOCS_UA_CONTENT || {};
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

    const embedded = getEmbeddedUaDoc(doc.slug);
    if (embedded) {
      setMd(embedded);
      return;
    }

    const uaPath = buildUaDocPath(category.id, doc.slug);
    if (!uaPath) {
      setLoadError("Unable to resolve document path.");
      return;
    }

    fetch(encodeURI(uaPath))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((txt) => setMd(txt))
      .catch((e) => setLoadError(String(e?.message || e)));
  }, [slug]);

  if (!doc) {
    return <main><div className="container page-header"><h1>{lang === "en" ? "Document not found" : "Документ не знайдено"}</h1><p><a href="#/sample/code-to-docs">← {lang === "en" ? "Back" : "Назад"}</a></p></div></main>;
  }

  const en = lang === "en";
  const title = doc.title[lang];
  const catTitle = category.title[lang];
  const html = useMarkdownHtml(md);
  const idx = category.docs.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? category.docs[idx - 1] : null;
  const next = idx < category.docs.length - 1 ? category.docs[idx + 1] : null;

  return (
    <main>
      <div className="container page-header">
        <h1>{title}</h1>
        <p className="lede" style={{ color: "var(--color-text-muted)" }}>{en ? "Source language: Ukrainian (UA docs)." : "Джерело контенту: українська документація (UA)."}</p>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose">
            {md && <div dangerouslySetInnerHTML={{ __html: html }} />}
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
