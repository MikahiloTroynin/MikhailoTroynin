// Empty doc page for Edge Veda documentation entries
// Shows placeholder content for a hypothetical documentation page

function EdgeVedaDocPage({ lang, slug }) {
  const cats = window.EDGE_VEDA_DOCS.categories;
  let doc = null;
  let category = null;
  for (const cat of cats) {
    const found = cat.docs.find((d) => d.slug === slug);
    if (found) { doc = found; category = cat; break; }
  }

  if (!doc) {
    return (
      <main>
        <div className="container page-header">
          <h1>{lang === "en" ? "Document not found" : "Документ не знайдено"}</h1>
          <p><a href="#/sample/code-to-docs">← {lang === "en" ? "Back" : "Назад"}</a></p>
        </div>
      </main>
    );
  }

  const en = lang === "en";
  const title = doc.title[lang];
  const catTitle = category.title[lang];

  // Build breadcrumb path
  const breadcrumbs = [
    { label: en ? "Work Samples" : "Приклади робіт", href: "#/work" },
    { label: en ? "Code-to-Docs Sample" : "Приклад Code-to-Docs", href: "#/sample/code-to-docs" },
    { label: catTitle, href: null },
  ];

  // Find prev/next within same category
  const idx = category.docs.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? category.docs[idx - 1] : null;
  const next = idx < category.docs.length - 1 ? category.docs[idx + 1] : null;

  return (
    <main>
      <div className="container page-header">
        <nav className="breadcrumbs" style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, fontSize: 13, color: "var(--color-text-muted)" }}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
              {b.href ? <a href={b.href} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{b.label}</a> : <span>{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>

        <div className="tag-list" style={{ marginTop: 4 }}>
          <span className="tag">{catTitle}</span>
          <span className="tag">Edge Veda</span>
          <span className="tag">Code-to-Docs</span>
        </div>
        <h1>{title}</h1>
        <p className="lede" style={{ color: "var(--color-text-muted)" }}>
          {en
            ? "This page is a placeholder for the Edge Veda documentation article. Content will be populated from the source markdown files."
            : "Ця сторінка — placeholder для статті документації Edge Veda. Контент буде заповнено з markdown-файлів."}
        </p>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose">
            <div className="empty-doc-placeholder" style={{
              border: "1px dashed var(--color-border)",
              borderRadius: 12,
              padding: "48px 32px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              background: "var(--color-surface)",
            }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>{category.icon}</div>
              <h3 style={{ margin: "0 0 8px", color: "var(--color-text)" }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 14, maxWidth: 420, marginInline: "auto" }}>
                {en
                  ? "Documentation content pending. This page will contain the full article from the Edge Veda docs repository."
                  : "Контент документації очікується. Ця сторінка міститиме повну статтю з репозиторію документації Edge Veda."}
              </p>
              <div style={{ marginTop: 20, fontSize: 12, fontFamily: "var(--font-mono)", opacity: 0.5 }}>
                edge-veda docs/{en ? "EN" : "UA"}/{category.id}_{en ? "EN" : "UA"}/
              </div>
            </div>

            {/* Navigation between docs in the same category */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 16 }}>
              {prev ? (
                <a href={"#/ev-doc/" + prev.slug} className="button button-ghost button-sm" style={{ paddingLeft: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  {prev.title[lang]}
                </a>
              ) : <div></div>}
              {next ? (
                <a href={"#/ev-doc/" + next.slug} className="button button-ghost button-sm" style={{ paddingRight: 0 }}>
                  {next.title[lang]}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </a>
              ) : <div></div>}
            </div>
          </article>

          <aside>
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-title">{catTitle}</div>
              {category.docs.map((d) => (
                <a key={d.slug}
                   href={"#/ev-doc/" + d.slug}
                   className={d.slug === slug ? "is-active" : ""}>
                  {d.title[lang]}
                </a>
              ))}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--color-border)" }}>
                <a className="button button-secondary button-sm" href="#/sample/code-to-docs">
                  ← {en ? "Back to Code-to-Docs" : "Назад до Code-to-Docs"}
                </a>
              </div>
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { EdgeVedaDocPage });
