// API Documentation page — renders markdown content for a single API method
// Depends on: window.API_DOCS (from api-docs-data.js), marked.js for markdown parsing

const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Lightweight Markdown → HTML (using marked.js) ---------- */
function useMarkdownHtml(md) {
  return useMemo(() => {
    if (!md) return "";
    if (typeof marked !== "undefined" && marked.parse) {
      marked.setOptions({
        highlight: null,
        gfm: true,
        breaks: false,
      });
      return marked.parse(md);
    }
    // Fallback: just wrap in <pre>
    return "<pre>" + md.replace(/</g, "&lt;") + "</pre>";
  }, [md]);
}

/* ---------- API Doc List Page ---------- */
function ApiDocsListPage({ lang }) {
  const en = lang === "en";
  const methods = window.API_DOCS.methods;

  // Group methods by category
  const groups = [
    { label: en ? "Core / Initialization" : "Core / Ініціалізація", slugs: ["init", "dispose"] },
    { label: en ? "Text Generation" : "Генерація тексту", slugs: ["generate", "generate-stream"] },
    { label: en ? "Embeddings" : "Embeddings", slugs: ["embed", "embed-batch"] },
    { label: en ? "Vision" : "Vision", slugs: ["init-vision", "describe-image", "dispose-vision"] },
    { label: en ? "Image Generation" : "Генерація зображень", slugs: ["init-image-generation", "generate-image", "generate-image-raw", "dispose-image-generation"] },
    { label: en ? "Runtime / Memory" : "Runtime / Пам'ять", slugs: ["get-memory-stats", "is-memory-pressure", "set-scheduler"] },
  ];

  return (
    <main>
      <div className="container page-header">
        <a href="#/sample/rest-api-docs" className="button button-ghost button-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {en ? "Back to REST API sample" : "Назад до прикладу REST API"}
        </a>
        <span className="eyebrow">Edge Veda API Reference</span>
        <h1>{en ? "API Method Documentation" : "Документація методів API"}</h1>
        <p className="lede">{en
          ? "Complete reference for public methods in the Edge Veda Dart SDK."
          : "Повний довідник публічних методів Edge Veda Dart SDK."}</p>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="api-docs-groups">
          {groups.map((g, gi) => {
            const available = g.slugs.filter(slug => {
              const m = methods.find(x => x.slug === slug);
              return m && (en ? m.hasEn : m.hasUa);
            });
            if (available.length === 0) return null;
            return (
              <div key={gi} className="api-docs-group">
                <h2 className="api-group-title">{g.label}</h2>
                <div className="api-method-grid">
                  {available.map(slug => {
                    const m = methods.find(x => x.slug === slug);
                    return (
                      <a key={slug} href={"#/api-doc/" + slug} className="api-method-card">
                        <code className="api-method-name">{m.method}</code>
                        <span className="arrow">→</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* ---------- API Doc Detail Page ---------- */
function ApiDocPage({ lang, id }) {
  const en = lang === "en";
  const contentKey = id + "_" + lang;
  const fallbackKey = id + "_en";
  const md = window.API_DOCS.content[contentKey] || window.API_DOCS.content[fallbackKey] || "";
  const method = window.API_DOCS.methods.find(m => m.slug === id);
  const html = useMarkdownHtml(md);
  const contentRef = useRef(null);

  // Extract TOC from headings
  const tocItems = useMemo(() => {
    const items = [];
    const regex = /^#{2}\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(md)) !== null) {
      const text = match[1].replace(/`/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      items.push({ id, text });
    }
    return items;
  }, [md]);

  const [activeToc, setActiveToc] = useState(tocItems[0]?.id || "");
  
  useEffect(() => {
    const onScroll = () => {
      const offset = 110;
      let cur = tocItems[0]?.id || "";
      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) cur = item.id;
      }
      setActiveToc(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [tocItems]);

  // Navigate between methods
  const methods = window.API_DOCS.methods.filter(m => en ? m.hasEn : m.hasUa);
  const curIdx = methods.findIndex(m => m.slug === id);
  const prev = curIdx > 0 ? methods[curIdx - 1] : null;
  const next = curIdx < methods.length - 1 ? methods[curIdx + 1] : null;

  if (!md) {
    return (
      <main>
        <div className="container page-header">
          <h1>{en ? "Document not found" : "Документ не знайдено"}</h1>
          <a href="#/api-docs" className="button button-secondary">{en ? "View all API docs" : "Усі документи API"}</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container page-header">
        <a href="#/api-docs" className="button button-ghost button-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {en ? "All API methods" : "Усі методи API"}
        </a>
        <div className="tag-list" style={{ marginTop: 8 }}>
          <span className="tag">API Reference</span>
          <span className="tag">Dart SDK</span>
          <span className="tag" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-strong)" }}>Draft</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
          {method ? method.method : id}
        </h1>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article
            className="prose api-doc-prose"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: html }}
          ></article>
          <aside>
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-title">{en ? "On this page" : "На цій сторінці"}</div>
              {tocItems.slice(0, 18).map(item => (
                <a key={item.id}
                   href={"#" + item.id}
                   className={activeToc === item.id ? "is-active" : ""}
                   onClick={(e) => {
                     e.preventDefault();
                     const el = document.getElementById(item.id);
                     if (el) {
                       const y = el.getBoundingClientRect().top + window.scrollY - 90;
                       window.scrollTo({ top: y, behavior: "smooth" });
                     }
                   }}>
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        </div>

        {/* Prev / Next navigation */}
        <div className="api-nav-bar">
          {prev ? (
            <a href={"#/api-doc/" + prev.slug} className="api-nav-link prev">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span><small>{en ? "Previous" : "Попередній"}</small><code>{prev.method}</code></span>
            </a>
          ) : <span></span>}
          {next ? (
            <a href={"#/api-doc/" + next.slug} className="api-nav-link next">
              <span><small>{en ? "Next" : "Наступний"}</small><code>{next.method}</code></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          ) : <span></span>}
        </div>
      </section>
    </main>
  );
}

window.ApiDocsListPage = ApiDocsListPage;
window.ApiDocPage = ApiDocPage;
