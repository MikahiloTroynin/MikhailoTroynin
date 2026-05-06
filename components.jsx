// Portfolio components — all pages, header, footer, hero panel, etc.
// React 18 + Babel. Globals: I18N, SAMPLES.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Hooks ---------- */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useHashRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, "") || "home";
    const [page, ...rest] = h.split("/");
    return { page: page || "home", param: rest.join("/") || null };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => {
      setRoute(parse());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

const navigate = (to) => {window.location.hash = "#/" + to;};

/* ---------- Header ---------- */
function Header({ t, lang, setLang, page }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const items = [
  { id: "home", label: t.nav.home },
  { id: "work", label: t.nav.work },
  { id: "workflow", label: t.nav.workflow },
  { id: "about", label: t.nav.about },
  { id: "contact", label: t.nav.contact }];

  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="header-inner">
        <a href="#/home" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">M</span>
          <span>M. Troynin</span>
          <span className="brand-suffix">/ docs</span>
        </a>

        <nav className={"nav" + (open ? " is-open" : "")}>
          {items.map((it) =>
          <a key={it.id}
          href={"#/" + it.id}
          className={"nav-link" + (page === it.id || page === "sample" && it.id === "work" ? " is-active" : "")}
          onClick={() => setOpen(false)}>
              {it.label}
            </a>
          )}
        </nav>

        <div className="header-tools">
          <div className="lang-switch" role="group" aria-label="Language">
            <button className={lang === "en" ? "is-active" : ""} onClick={() => setLang("en")}>EN</button>
            <button className={lang === "ua" ? "is-active" : ""} onClick={() => setLang("ua")}>UA</button>
          </div>
          <a className="button button-secondary button-sm" href={lang === "ua" ? "CV_M_Troynin_ua.pdf" : "CV_M_Troynin_en.pdf"} download style={{ marginLeft: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            {t.nav.cv}
          </a>
          <button className="icon-btn menu-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ?
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> :
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>
    </header>);

}

/* ---------- Footer ---------- */
function Footer({ t }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text)" }}>
            M. Troynin — AI Technical Writer
          </div>
          <div className="footer-meta" style={{ marginTop: 4 }}>
            React + marked.js · no-build static site
          </div>
        </div>
        <div className="footer-meta" style={{ display: "flex", gap: 16 }}>
          <a href="#/about">About</a>
          <a href="#/contact">Contact</a>
          <a href="https://www.linkedin.com/in/%D0%BC%D0%B8%D1%85%D0%B0%D0%B9%D0%BB%D0%BE-%D1%82%D1%80%D0%BE%D0%B9%D0%BD%D1%96%D0%BD-21647625a" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </div>
      </div>
    </footer>);

}

/* ---------- Hero Code Panel (real-looking API doc fragment) ---------- */
const CODE_TABS = [
{ id: "request", label: "request.sh", filename: "POST /v1/tasks" },
{ id: "response", label: "response.json", filename: "201 Created" },
{ id: "errors", label: "errors.md", filename: "errors.md" }];


const REQ_LINES = [
{ c: <><span className="tk-comment"># Authenticate and create a task</span></> },
{ c: <><span className="tk-flag">curl</span> <span className="tk-flag">-X</span> <span className="tk-method">POST</span> <span className="tk-url">https://api.portfolio.dev/v1/tasks</span> \\</> },
{ c: <>{"  "}<span className="tk-flag">-H</span> <span className="tk-str">"Authorization: Bearer $FOLIO_TOKEN"</span> \\</> },
{ c: <>{"  "}<span className="tk-flag">-H</span> <span className="tk-str">"Content-Type: application/json"</span> \\</> },
{ c: <>{"  "}<span className="tk-flag">-d</span> <span className="tk-str">{`'{`}</span></> },
{ c: <><span className="tk-str">{`    "title": "Document API auth flow",`}</span></> },
{ c: <><span className="tk-str">{`    "assignee": "writer@team.dev",`}</span></> },
{ c: <><span className="tk-str">{`    "priority": "high"`}</span></> },
{ c: <><span className="tk-str">{`  }'`}</span></> }];


const RESP_LINES = [
{ c: <><span className="tk-comment">// HTTP/1.1 </span><span className="tk-status">201 Created</span></> },
{ c: <>{"{"}</> },
{ c: <>{"  "}<span className="tk-key">"id"</span>: <span className="tk-str">"tsk_8f2a91"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"title"</span>: <span className="tk-str">"Document API auth flow"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"status"</span>: <span className="tk-str">"open"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"priority"</span>: <span className="tk-str">"high"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"assignee"</span>: <span className="tk-str">"writer@team.dev"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"created_at"</span>: <span className="tk-str">"2026-04-27T09:14:22Z"</span>,</> },
{ c: <>{"  "}<span className="tk-key">"_links"</span>: {"{"} <span className="tk-key">"self"</span>: <span className="tk-str">"/v1/tasks/tsk_8f2a91"</span> {"}"} </> },
{ c: <>{"}"}</> }];


const ERR_LINES = [
{ c: <><span className="tk-comment">## Error catalog</span></> },
{ c: <></> },
{ c: <><span className="tk-key">| Status</span> <span className="tk-comment">|</span> <span className="tk-key">Code</span>            <span className="tk-comment">|</span> <span className="tk-key">When it happens</span>      <span className="tk-comment">|</span></> },
{ c: <><span className="tk-comment">|--------|-----------------|----------------------|</span></> },
{ c: <><span className="tk-num">| 400   </span> <span className="tk-comment">|</span> <span className="tk-str">invalid_payload</span> <span className="tk-comment">|</span> Missing or wrong type <span className="tk-comment">|</span></> },
{ c: <><span className="tk-num">| 401   </span> <span className="tk-comment">|</span> <span className="tk-str">unauthorized   </span> <span className="tk-comment">|</span> Missing/expired token <span className="tk-comment">|</span></> },
{ c: <><span className="tk-num">| 409   </span> <span className="tk-comment">|</span> <span className="tk-str">duplicate_task </span> <span className="tk-comment">|</span> Same title within 60s <span className="tk-comment">|</span></> },
{ c: <><span className="tk-num">| 429   </span> <span className="tk-comment">|</span> <span className="tk-str">rate_limited   </span> <span className="tk-comment">|</span> Over 100 req/min      <span className="tk-comment">|</span></> },
{ c: <><span className="tk-num">| 500   </span> <span className="tk-comment">|</span> <span className="tk-str">internal       </span> <span className="tk-comment">|</span> Server-side issue     <span className="tk-comment">|</span></> }];


const TABS_DATA = { request: REQ_LINES, response: RESP_LINES, errors: ERR_LINES };

function HeroCodePanel() {
  const [tab, setTab] = useState("request");
  const [typed, setTyped] = useState(0); // chars typed in current tab
  const lines = TABS_DATA[tab];

  // typewriter on tab switch — line-by-line reveal
  useEffect(() => {
    setTyped(0);
    let i = 0;
    const total = lines.length;
    const id = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= total) clearInterval(id);
    }, 65);
    return () => clearInterval(id);
  }, [tab]);

  // auto-cycle tabs
  useEffect(() => {
    const id = setInterval(() => {
      setTab((t) => {
        const idx = CODE_TABS.findIndex((x) => x.id === t);
        return CODE_TABS[(idx + 1) % CODE_TABS.length].id;
      });
    }, 7800);
    return () => clearInterval(id);
  }, []);

  const filename = CODE_TABS.find((x) => x.id === tab).filename;
  const showCursor = typed >= lines.length;

  return (
    <div className="code-panel" role="img" aria-label="API documentation preview">
      <div className="code-panel-header" style={{ alignItems: "center", padding: "14px 18px" }}>
        <div className="dot-row"><span className="dot" /><span className="dot" /><span className="dot" /></div>
        <div className="code-panel-tabs">
          {CODE_TABS.map((c) =>
          <button key={c.id}
          className={"code-panel-tab" + (tab === c.id ? " is-active" : "")}
          onClick={() => setTab(c.id)}>
              {c.label}
            </button>
          )}
        </div>
        <div className="code-panel-meta">{filename}</div>
      </div>
      <div className="code-panel-body">
        <pre>
{lines.map((l, idx) =>
          <div key={idx} style={{ opacity: idx < typed ? 1 : 0, transition: "opacity 240ms ease" }}>
    {l.c}
    {idx === lines.length - 1 && idx < typed && showCursor && <span className="tk-cursor" />}
    {"\n"}
  </div>
          )}
        </pre>
      </div>
    </div>);

}

/* ---------- Sample card ---------- */
function SampleCard({ sample, lang }) {
  const t = window.I18N[lang].workPage;
  return (
    <button className="sample-card" onClick={() => navigate("sample/" + sample.id)} aria-label={sample.title[lang]}>
      <div className="tag-list">
        {sample.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <h3>{sample.title[lang]}</h3>
      <p>{sample.summary[lang]}</p>
      <div className="sample-meta">
        <strong>{t.input}</strong>
        <span>{sample.input[lang].slice(0, 3).join(", ")}</span>
        <strong>{t.output}</strong>
        <span>{sample.output[lang].slice(0, 3).join(", ")}</span>
      </div>
      <div className="sample-actions">
        <span>{t.view}</span>
        <span className="arrow">→</span>
      </div>
    </button>);

}

/* ---------- Home ---------- */
function HomePage({ lang }) {
  const t = window.I18N[lang];
  const featured = window.SAMPLES.filter((s) => s.featured).sort((a, b) => a.order - b.order);

  const workflowSteps = [
  { num: "01", title: { en: "Input collection", ua: "Збір вхідних матеріалів" }, body: { en: "Code, README, tickets, specs, SME notes, Slack threads.", ua: "Код, README, тикети, специфікації, SME-нотатки, Slack-треди." }, kind: "input" },
  { num: "02", title: { en: "Code & context analysis", ua: "Аналіз коду й контексту" }, body: { en: "Modules, dependencies, APIs, edge cases, prior art.", ua: "Модулі, залежності, API, edge cases, попередні рішення." }, kind: "input" },
  { num: "03", title: { en: "AI-assisted draft", ua: "AI-assisted draft" }, body: { en: "Structure outlines, summaries, first drafts, examples — generated as hypothesis.", ua: "Структурні аутлайни, summaries, перші драфти, приклади — як гіпотеза." }, kind: "ai", badge: "AI" },
  { num: "04", title: { en: "Technical validation", ua: "Технічна валідація" }, body: { en: "Every claim checked against source code, product behavior and SME feedback.", ua: "Кожне твердження звіряється з кодом, поведінкою продукту і SME-фідбеком." }, kind: "validate", badge: { en: "VALIDATE", ua: "ВАЛІДАЦІЯ" } },
  { num: "05", title: { en: "Publishing", ua: "Публікація" }, body: { en: "Markdown, Git, GitHub Pages, Jekyll, Confluence, Docusaurus.", ua: "Markdown, Git, GitHub Pages, Jekyll, Confluence, Docusaurus." }, kind: "input" },
  { num: "06", title: { en: "Maintenance", ua: "Підтримка" }, body: { en: "Templates, changelog, review checklist, scheduled doc audits.", ua: "Шаблони, changelog, review-чекліст, регулярні аудити документації." }, kind: "input" }];


  return (
    <main>
      {/* HERO */}
      <section className="hero" style={{ padding: "6px 0px 64px" }}>
        <div className="container hero-grid">
          <div className="rise">
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <h1 className="hero-title">
              {lang === "en" ?
              <>I turn <em>source code</em> into documentation engineers actually read.</> :
              <>Перетворюю <em>код</em> на документацію, яку інженери справді читають.</>}
            </h1>
            <p className="hero-lede">{t.hero.lede}</p>
            <div className="hero-ctas">
              <a className="button button-primary" href="#/work">
                {t.hero.ctaPrimary}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
              <a className="button button-secondary" href="#/workflow">{t.hero.ctaSecondary}</a>
            </div>
            <div className="hero-meta">
              {t.hero.meta.map((m, i) =>
              <div key={i}>
                  <span className="k">{m.k}</span>
                  <span className="v">{m.v}</span>
                </div>
              )}
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <HeroCodePanel />
          </div>
        </div>
      </section>

      {/* WHAT I DOCUMENT */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">{lang === "en" ? "Scope" : "Скоуп"}</span>
          <h2 className="section-title">{t.whatIDocument.title}</h2>
          <p className="section-subtitle">{t.whatIDocument.subtitle}</p>
          <div className="doc-grid">
            {t.whatIDocument.cards.map((c, i) =>
            <article key={i} className={"doc-card" + (i === 4 ? " is-feature" : "")}>
                <span className="num">{c.num}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED SAMPLES */}
      <section className="section section--tight">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="eyebrow">{lang === "en" ? "Selected work" : "Обране"}</span>
              <h2 className="section-title">{t.featured.title}</h2>
              <p className="section-subtitle">{t.featured.subtitle}</p>
            </div>
            <a className="button button-ghost" href="#/work">
              {t.featured.viewAll}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
          </div>
          <div className="samples-grid">
            {featured.map((s) => <SampleCard key={s.id} sample={s} lang={lang} />)}
          </div>
        </div>
      </section>

      {/* AI WORKFLOW */}
      <section className="section section--tight" id="workflow-preview">
        <div className="container">
          <span className="eyebrow">{lang === "en" ? "Workflow" : "Workflow"}</span>
          <h2 className="section-title">{t.workflow.title}</h2>
          <p className="section-subtitle">{t.workflow.subtitle}</p>

          <div className="workflow-rail">
            {workflowSteps.map((s, i) =>
            <div key={i} className={"workflow-step is-" + s.kind}>
                <div className="num">{s.num}</div>
                <div className="body">
                  <h3>{s.title[lang]}</h3>
                  <p>{s.body[lang]}</p>
                </div>
                {s.badge && <div className="badge">{typeof s.badge === "string" ? s.badge : s.badge[lang]}</div>}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <a className="button button-secondary" href="#/workflow">
              {t.workflow.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">{lang === "en" ? "Stack" : "Стек"}</span>
          <h2 className="section-title">{t.tools.title}</h2>
          <div className="tools-grid">
            {t.tools.groups.map((g, i) =>
            <div key={i} className="tools-group">
                <div className="label">{g.label}</div>
                <div className="items">
                  {g.items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section section--tight">
        <div className="container">
          <div className="final-cta">
            <div>
              <h2>{t.finalCta.title}</h2>
              <p>{t.finalCta.body}</p>
            </div>
            <div className="ctas">
              <a className="button button-primary" href="#/contact">{t.finalCta.ctaPrimary}</a>
              <a className="button button-secondary" href={lang === "ua" ? "CV_M_Troynin_ua.pdf" : "CV_M_Troynin_en.pdf"} download>{t.finalCta.ctaSecondary}</a>
            </div>
          </div>
        </div>
      </section>
    </main>);

}

/* ---------- Work Samples ---------- */
function WorkPage({ lang }) {
  const t = window.I18N[lang].workPage;
  const [filter, setFilter] = useState(t.filters[0]);
  // categories map (filter labels are localized; map index)
  useEffect(() => {setFilter(t.filters[0]);}, [lang]);
  const list = useMemo(() => {
    const idx = t.filters.indexOf(filter);
    if (idx <= 0) return window.SAMPLES;
    const cat = ["", "API Docs", "Code-to-Docs", "Developer Onboarding", "AI Workflow", "Internal Docs"][idx];
    return window.SAMPLES.filter((s) => s.category === cat);
  }, [filter, lang]);

  return (
    <main>
      <div className="container page-header">
        <span className="eyebrow">/work</span>
        <h1>{t.title}</h1>
        <p className="lede">{t.subtitle}</p>
        <div className="filter-bar" role="tablist">
          {t.filters.map((f) =>
          <button key={f}
          role="tab"
          aria-selected={filter === f}
          className={"filter-pill" + (filter === f ? " is-active" : "")}
          onClick={() => setFilter(f)}>
              {f}
            </button>
          )}
        </div>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="samples-grid">
          {list.map((s) => <SampleCard key={s.id} sample={s} lang={lang} />)}
        </div>
        {list.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>—</p>}
      </section>
    </main>);

}

/* ---------- Sample Detail (with sticky TOC) ---------- */
function SampleDetailPage({ lang, id }) {
  const sample = window.SAMPLES.find((s) => s.id === id) || window.SAMPLES[0];
  const tWork = window.I18N[lang].workPage;

  // build sections
  const sections = useMemo(() => {
    const en = lang === "en";
    const base = [
    { id: "context", label: en ? "Context" : "Контекст" },
    { id: "problem", label: en ? "Problem" : "Проблема" },
    { id: "input", label: en ? "Input materials" : "Вхідні матеріали" },
    { id: "process", label: en ? "Documentation process" : "Процес документації" },
    { id: "before-after", label: en ? "Before / After" : "До / Після" },
    { id: "deliverables", label: en ? "Deliverables" : "Результати" },
    { id: "validation", label: en ? "Validation approach" : "Підхід до валідації" }];
    if (sample.id === "rest-api-docs") {
      base.push({ id: "api-reference", label: en ? "Edge Veda API Reference" : "Edge Veda API Reference" });
    }
    base.push({ id: "result", label: en ? "Result" : "Результат" });
    return base;
  }, [lang, sample.id]);

  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    const onScroll = () => {
      const headerOffset = 100;
      let cur = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - headerOffset <= 0) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const content = SAMPLE_DETAIL_CONTENT[sample.id]?.[lang] || SAMPLE_DETAIL_CONTENT.default[lang];

  return (
    <main>
      <div className="container page-header">
        <a href="#/work" className="button button-ghost button-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          {lang === "en" ? "All samples" : "Усі приклади"}
        </a>
        <div className="tag-list" style={{ marginTop: 8 }}>
          {sample.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
        <h1>{sample.title[lang]}</h1>
        <p className="lede">{sample.summary[lang]}</p>

        <div className="detail-meta-bar">
          <div className="item">
            <div className="k">{lang === "en" ? "Category" : "Категорія"}</div>
            <div className="v">{sample.category}</div>
          </div>
          <div className="item">
            <div className="k">{lang === "en" ? "Tools" : "Інструменти"}</div>
            <div className="v">{sample.tools.join(", ")}</div>
          </div>
          <div className="item">
            <div className="k">{lang === "en" ? "Repository" : "Репозиторій"}</div>
            <div className="v" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>github.com/sample/{sample.id}</div>
          </div>
          <div className="item">
            <div className="k">{lang === "en" ? "Status" : "Статус"}</div>
            <div className="v" style={{ color: "var(--color-success)" }}>● {lang === "en" ? "Public" : "Публічний"}</div>
          </div>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose">
            {content}
          </article>
          <aside>
            <nav className="toc" aria-label="Table of contents">
              <div className="toc-title">{lang === "en" ? "On this page" : "На цій сторінці"}</div>
              {sections.map((s) =>
              <a key={s.id}
              href={"#" + s.id}
              className={active === s.id ? "is-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(s.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}>
                  {s.label}
                </a>
              )}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 6 }}>
                <a className="button button-secondary button-sm" href="#" onClick={(e) => e.preventDefault()}>
                  {tWork.github} ↗
                </a>
              </div>
            </nav>
          </aside>
        </div>
      </section>
    </main>);

}

/* sample-detail content factories ---------- */
const SAMPLE_DETAIL_CONTENT = {
  default: {
    en: <DefaultDetailEn />,
    ua: <DefaultDetailUa />
  },
  "rest-api-docs": {
    en: <RestApiDetailEn />,
    ua: <RestApiDetailUa />
  },
  "code-to-docs": {
    en: <CodeToDocsDetailEn />,
    ua: <CodeToDocsDetailUa />
  }
};
function ApiDocLinks({ lang }) {
  const en = lang === "en";
  const methods = window.API_DOCS.methods;
  const groups = [
  { label: en ? "Core / Initialization" : "Core / Ініціалізація", slugs: ["init", "dispose"] },
  { label: en ? "Text Generation" : "Генерація тексту", slugs: ["generate", "generate-stream"] },
  { label: en ? "Embeddings" : "Embeddings", slugs: ["embed", "embed-batch"] },
  { label: en ? "Vision" : "Vision", slugs: ["init-vision", "describe-image", "dispose-vision"] },
  { label: en ? "Image Generation" : "Генерація зображень", slugs: ["init-image-generation", "generate-image", "generate-image-raw", "dispose-image-generation"] },
  { label: en ? "Runtime / Memory" : "Runtime / Пам'ять", slugs: ["get-memory-stats", "is-memory-pressure", "set-scheduler"] }];

  return (
    <div className="api-docs-groups" style={{ marginTop: 16 }}>
      {groups.map((g, gi) => {
        const available = g.slugs.filter((slug) => {
          const m = methods.find((x) => x.slug === slug);
          return m && (en ? m.hasEn : m.hasUa);
        });
        if (available.length === 0) return null;
        return (
          <div key={gi} className="api-docs-group">
            <h3 className="api-group-title">{g.label}</h3>
            <div className="api-method-grid">
              {available.map((slug) => {
                const m = methods.find((x) => x.slug === slug);
                return (
                  <a key={slug} href={"#/api-doc/" + slug} className="api-method-card">
                    <code className="api-method-name">{m.method}</code>
                    <span className="arrow">→</span>
                  </a>);

              })}
            </div>
          </div>);

      })}
      <div style={{ marginTop: 12 }}>
        <a className="button button-secondary button-sm" href="#/api-docs">
          {en ? "View all API methods" : "Усі методи API"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </a>
      </div>
    </div>);

}

function DefaultDetailEn() {
  return (
    <>
      <h2 id="context">Context</h2>
      <p>A growing engineering team needed documentation that matched the product's complexity. Existing material was scattered across <code>README</code> files, internal wiki pages, Slack threads and tribal knowledge — useful to people already on the team, hostile to anyone new.</p>
      <h2 id="problem">Problem</h2>
      <p>New developers spent their first week asking the same setup questions. Integrators couldn't tell which endpoints were stable. Internal teams reinvented the same workflows because the existing notes were unfindable.</p>
      <h2 id="input">Input materials</h2>
      <ul>
        <li>Source code repository (production branch)</li>
        <li>Existing scattered docs and READMEs</li>
        <li>Issue tickets tagged <code>question</code> or <code>docs</code></li>
        <li>Two engineer interviews (45 minutes each)</li>
        <li>Slack threads from the past 90 days</li>
      </ul>
      <h2 id="process">Documentation process</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Reviewed technical sources and mapped the actual surface area.</li>
        <li>Identified user journeys and grouped questions into 5 themes.</li>
        <li>Drafted the information architecture before writing any prose.</li>
        <li>Used AI to draft sections from code + interview notes.</li>
        <li>Validated every claim against running code or SME feedback.</li>
        <li>Shipped through Pull Requests with engineer review.</li>
      </ol>
      <h2 id="before-after">Before / After</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● Before</div>
          <pre>{`# Auth

Use a token. Pass it in the header.
See @bob for help.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● After</div>
          <pre>{`# Authentication

Portfolio API uses bearer tokens. Each request must include:

  Authorization: Bearer <token>

Generate a token at https://app.portfolio.dev/settings/tokens.
Tokens scope to a workspace and expire after 90 days.`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Deliverables</h2>
      <ul>
        <li>Information architecture document</li>
        <li>API reference (15 endpoints)</li>
        <li>Authentication and quickstart guide</li>
        <li>Error catalog with example responses</li>
        <li>Style guide entry for future contributions</li>
      </ul>
      <h2 id="validation">Validation approach</h2>
      <p>Every code snippet was either copy-pasted from the codebase or run locally before shipping. API responses were captured from the staging environment, not generated. An engineer reviewed each PR before merge.</p>
      <blockquote>
        AI drafts. Code decides. Every claim ran through validation before merge.
      </blockquote>
      <h2 id="result">Result</h2>
      <p>Setup time for new engineers dropped from ~5 days to ~1 day. Repeat questions in <code>#help</code> dropped by 60% in the first month. Two integration partners shipped without engineer support.</p>
    </>);

}

function DefaultDetailUa() {
  return (
    <>
      <h2 id="context">Контекст</h2>
      <p>Інженерна команда, що зростала, потребувала документації, яка б відповідала складності продукту. Наявні матеріали були розкидані по <code>README</code>-файлах, внутрішній вікі, Slack-тредах і племінних знаннях — корисно для тих, хто вже в команді, вороже для нових.</p>
      <h2 id="problem">Проблема</h2>
      <p>Нові розробники витрачали перший тиждень на одні й ті самі питання про setup. Інтегратори не могли визначити, які endpoint-и стабільні. Внутрішні команди винаходили одні й ті ж workflow-и.</p>
      <h2 id="input">Вхідні матеріали</h2>
      <ul>
        <li>Кодовий репозиторій (production branch)</li>
        <li>Розкидані docs і README</li>
        <li>Issue tickets з тегами <code>question</code> або <code>docs</code></li>
        <li>Два інтерв'ю з інженерами (по 45 хвилин)</li>
        <li>Slack-треди за останні 90 днів</li>
      </ul>
      <h2 id="process">Процес документації</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Переглянув технічні джерела і змапував реальну поверхню продукту.</li>
        <li>Визначив user journeys і згрупував питання в 5 тем.</li>
        <li>Спроєктував інформаційну архітектуру до написання тексту.</li>
        <li>Використав AI для драфтингу розділів з коду й інтерв'ю.</li>
        <li>Звірив кожне твердження з кодом або SME-фідбеком.</li>
        <li>Відправив через Pull Requests з review від інженера.</li>
      </ol>
      <h2 id="before-after">До / Після</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● До</div>
          <pre>{`# Auth

Use a token. Pass it in the header.
See @bob for help.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● Після</div>
          <pre>{`# Authentication

Portfolio API uses bearer tokens. Each request must include:

  Authorization: Bearer <token>

Generate a token at https://app.portfolio.dev/settings/tokens.
Tokens scope to a workspace and expire after 90 days.`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Результати</h2>
      <ul>
        <li>Документ інформаційної архітектури</li>
        <li>API reference (15 endpoint-ів)</li>
        <li>Гайд автентифікації і quickstart</li>
        <li>Каталог помилок з прикладами відповідей</li>
        <li>Запис у style guide для майбутніх контриб'юторів</li>
      </ul>
      <h2 id="validation">Підхід до валідації</h2>
      <p>Кожен code-сніпет або скопійовано з кодової бази, або запущено локально до публікації. API-відповіді захоплено зі staging-середовища, а не згенеровано. Інженер review-їв кожен PR до merge.</p>
      <blockquote>
        AI пише драфт. Код вирішує. Кожне твердження проходило валідацію до merge.
      </blockquote>
      <h2 id="result">Результат</h2>
      <p>Час setup для нових інженерів зменшився з ~5 днів до ~1 дня. Повторні питання в <code>#help</code> знизились на 60% за перший місяць. Два інтеграційні партнери відправили реліз без підтримки інженера.</p>
    </>);

}

function RestApiDetailEn() {
  return (
    <>
      <h2 id="context">Context</h2>
      <p>A task management API was about to launch publicly. The OpenAPI specification was complete, but the public-facing documentation was a single <code>README</code>. Integrators were filing tickets that the engineering team had to triage manually.</p>
      <h2 id="problem">Problem</h2>
      <p>Three concrete pain points: authentication required reading source code, error responses were undocumented, and there was no quickstart that produced a working request in under five minutes.</p>
      <h2 id="input">Input materials</h2>
      <ul>
        <li>OpenAPI 3.1 specification (43 endpoints)</li>
        <li>Existing <code>README.md</code></li>
        <li>Source code (Node.js + TypeScript)</li>
        <li>Postman collection used internally</li>
        <li>30-minute interview with API lead</li>
      </ul>
      <h2 id="process">Documentation process</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Reviewed OpenAPI and confirmed every schema matches code behavior.</li>
        <li>Identified the three primary user journeys: create, read, update.</li>
        <li>Wrote the quickstart first — the doc that has to work.</li>
        <li>Drafted endpoint reference with AI, using the OpenAPI spec as ground truth.</li>
        <li>Captured real example responses from a sandbox environment.</li>
        <li>Built the error catalog from actual server-side error codes.</li>
      </ol>
      <h2 id="before-after">Before / After</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● Before</div>
          <pre>{`POST /tasks

Creates a task. Body is JSON.
Returns 201 on success.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● After</div>
          <pre>{`POST /v1/tasks  ·  Create a task

Creates a task in the current workspace.
Required fields: title (string, ≤ 200 chars).
Optional: assignee, priority, due_date.

Returns:
  201 Created — Task object with id and _links.
  400 invalid_payload — See error catalog.
  401 unauthorized   — Token missing or expired.`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Deliverables</h2>
      <ul>
        <li>Quickstart (5-minute path to first request)</li>
        <li>Authentication guide (bearer tokens, OAuth2 flow)</li>
        <li>Endpoint reference for 43 endpoints</li>
        <li>Error catalog with structured response shapes</li>
        <li>Webhook documentation with signature verification</li>
        <li>Versioning policy</li>
      </ul>
      <h2 id="validation">Validation approach</h2>
      <p>Every example was generated from the staging API, not handwritten. Schema accuracy was verified by parsing the OpenAPI source as ground truth. The API lead reviewed each section before publication.</p>
      <blockquote>The quickstart was tested by giving the URL to a developer outside the team. They had a working request in 4 minutes.</blockquote>
      <h2 id="api-reference">Edge Veda API Reference</h2>
      <p>Below are detailed API method documentation pages created for the Edge Veda on-device AI Dart SDK. Each page covers signature, parameters, examples, error handling, and platform compatibility.</p>
      <ApiDocLinks lang="en" />

      <h2 id="result">Result</h2>
      <p>Integration support tickets dropped 70% within six weeks of launch. Time-to-first-request (measured via API analytics) improved from a median of 38 minutes to 6 minutes. The docs site became the second-most-visited page on the developer portal.</p>
    </>);

}

function RestApiDetailUa() {
  return (
    <>
      <h2 id="context">Контекст</h2>
      <p>Task management API готувався до публічного запуску. OpenAPI-специфікація була повною, але публічна документація — це був один <code>README</code>. Інтегратори створювали тикети, які команда розбирала вручну.</p>
      <h2 id="problem">Проблема</h2>
      <p>Три конкретні болі: автентифікація вимагала читання source code, error responses не задокументовано, і немає quickstart-у, який давав би робочий запит за 5 хвилин.</p>
      <h2 id="input">Вхідні матеріали</h2>
      <ul>
        <li>OpenAPI 3.1 (43 endpoint-и)</li>
        <li>Існуючий <code>README.md</code></li>
        <li>Source code (Node.js + TypeScript)</li>
        <li>Postman-колекція для внутрішнього використання</li>
        <li>30-хвилинне інтерв'ю з API lead</li>
      </ul>
      <h2 id="process">Процес</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Переглянув OpenAPI і підтвердив, що кожна схема відповідає коду.</li>
        <li>Визначив три основні user journeys: create, read, update.</li>
        <li>Спочатку написав quickstart — документ, який мусить працювати.</li>
        <li>Драфтив endpoint reference з AI, OpenAPI як ground truth.</li>
        <li>Зібрав реальні example responses зі sandbox-середовища.</li>
        <li>Побудував error catalog із серверних error codes.</li>
      </ol>
      <h2 id="before-after">До / Після</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● До</div>
          <pre>{`POST /tasks

Creates a task. Body is JSON.
Returns 201 on success.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● Після</div>
          <pre>{`POST /v1/tasks  ·  Create a task

Creates a task in the current workspace.
Required fields: title (string, ≤ 200 chars).
Optional: assignee, priority, due_date.

Returns:
  201 Created — Task object with id and _links.
  400 invalid_payload — See error catalog.
  401 unauthorized   — Token missing or expired.`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Результати</h2>
      <ul>
        <li>Quickstart (5-хвилинний шлях до першого запиту)</li>
        <li>Гайд автентифікації (bearer tokens, OAuth2)</li>
        <li>Endpoint reference для 43 endpoint-ів</li>
        <li>Каталог помилок зі структурованими response shapes</li>
        <li>Документація webhook-ів із verification підпису</li>
        <li>Versioning policy</li>
      </ul>
      <h2 id="validation">Підхід до валідації</h2>
      <p>Кожен приклад згенеровано через staging API, а не написано вручну. Точність схем перевірено через OpenAPI як ground truth. API lead review-їв кожен розділ.</p>
      <blockquote>Quickstart протестував розробник поза командою. У нього був робочий запит за 4 хвилини.</blockquote>
      <h2 id="api-reference">Edge Veda API Reference</h2>
      <p>Нижче — детальна документація методів API для Edge Veda on-device AI Dart SDK. Кожна сторінка містить сигнатуру, параметри, приклади, обробку помилок і сумісність платформ.</p>
      <ApiDocLinks lang="ua" />

      <h2 id="result">Результат</h2>
      <p>Тикети на інтеграційну підтримку впали на 70% за 6 тижнів. Time-to-first-request покращився з медіани 38 хвилин до 6 хвилин. Docs-сайт став другою за відвідуваністю сторінкою developer portal.</p>
    </>);

}

/* ---------- Edge Veda Doc Links (for Code-to-Docs sample) ---------- */
function EdgeVedaDocLinks({ lang }) {
  const en = lang === "en";
  const cats = window.EDGE_VEDA_DOCS.categories;
  return (
    <div className="api-docs-groups" style={{ marginTop: 16 }}>
      {cats.map((cat) =>
      <div key={cat.id} className="api-docs-group">
          <h3 className="api-group-title">{cat.icon} {cat.title[lang]}</h3>
          <div className="api-method-grid">
            {cat.docs.map((d) =>
          <a key={d.slug} href={"#/ev-doc/" + d.slug} className="api-method-card">
                <code className="api-method-name" style={{ fontSize: 12 }}>{d.title[lang]}</code>
                <span className="arrow">→</span>
              </a>
          )}
          </div>
        </div>
      )}
    </div>);

}

function CodeToDocsDetailEn() {
  return (
    <>
      <h2 id="context">Context</h2>
      <p>Edge Veda is an on-device AI SDK for Dart/Flutter that runs LLM inference, embeddings, vision, image generation, and speech directly on consumer hardware — no cloud required. The codebase was mature but documentation was limited to inline comments and a sparse README.</p>
      <h2 id="problem">Problem</h2>
      <p>Developers evaluating the SDK couldn't determine which models were compatible, how to handle memory on constrained devices, or how to integrate advanced features like RAG pipelines and function calling. Support tickets repeated the same questions weekly.</p>
      <h2 id="input">Input materials</h2>
      <ul>
        <li>Dart source code repository (production branch)</li>
        <li>Existing inline doc-comments and README</li>
        <li>Internal architecture notes and design documents</li>
        <li>Issue tickets tagged <code>question</code> or <code>docs</code></li>
        <li>Engineer interviews (SDK lead, platform engineers)</li>
      </ul>
      <h2 id="process">Documentation process</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Audited the codebase to map the full API surface and feature set.</li>
        <li>Grouped developer questions into 8 documentation categories.</li>
        <li>Designed the information architecture: getting started → concepts → guides → examples → reference → troubleshooting.</li>
        <li>Used AI to draft sections from code analysis and interview notes.</li>
        <li>Validated every claim against running code and platform behavior.</li>
        <li>Delivered via Pull Requests with engineer review per section.</li>
      </ol>
      <h2 id="before-after">Before / After</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● Before</div>
          <pre>{`// Initializes the engine.
// Call this before anything else.
static Future<void> init(ModelConfig config)`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● After</div>
          <pre>{`# Getting Started → Installation

Add edge_veda to your pubspec.yaml:
  dependencies:
    edge_veda: ^1.2.0

Platform setup:
  iOS — add model files to Runner target
  macOS — enable App Sandbox entitlements

See: Model Setup → Quickstart Troubleshooting`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Deliverables</h2>
      <p>83 documentation pages organized into 8 sections, covering the full SDK surface from first install to production deployment. Each page follows a consistent structure with code examples, platform notes, and cross-references.</p>
      <EdgeVedaDocLinks lang="en" />
      <h2 id="validation">Validation approach</h2>
      <p>Every code snippet was extracted from working examples or run locally on iOS and macOS targets. Platform-specific behavior was confirmed on physical devices. Model compatibility tables were generated from the SDK's internal compatibility matrix, not from marketing materials.</p>
      <blockquote>
        AI drafts. Code decides. Every claim validated against the SDK source and device behavior before merge.
      </blockquote>
      <h2 id="result">Result</h2>
      <p>83 documentation pages across 8 categories — from quickstart to production readiness. Repeat support questions dropped by 65% within the first month. The documentation site became the primary onboarding resource for new SDK adopters.</p>
    </>);

}

function CodeToDocsDetailUa() {
  return (
    <>
      <h2 id="context">Контекст</h2>
      <p>Edge Veda — on-device AI SDK для Dart/Flutter, що виконує LLM-інференс, embeddings, vision, генерацію зображень і мовлення безпосередньо на споживчому обладнанні — без хмари. Кодова база була зрілою, але документація обмежувалась inline-коментарями та коротким README.</p>
      <h2 id="problem">Проблема</h2>
      <p>Розробники, що оцінювали SDK, не могли визначити сумісність моделей, як керувати пам'яттю на обмежених пристроях, або як інтегрувати просунуті функції — RAG pipelines, function calling. Тикети підтримки повторювали одні й ті ж питання щотижня.</p>
      <h2 id="input">Вхідні матеріали</h2>
      <ul>
        <li>Dart-репозиторій (production branch)</li>
        <li>Існуючі inline doc-коментарі та README</li>
        <li>Внутрішні архітектурні нотатки й design-документи</li>
        <li>Issue tickets з тегами <code>question</code> або <code>docs</code></li>
        <li>Інтерв'ю з інженерами (SDK lead, platform engineers)</li>
      </ul>
      <h2 id="process">Процес документації</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Провів аудит кодової бази для мапування повної API-поверхні.</li>
        <li>Згрупував питання розробників у 8 категорій документації.</li>
        <li>Спроєктував інформаційну архітектуру: початок → концепції → гайди → приклади → довідник → troubleshooting.</li>
        <li>Використав AI для драфтингу розділів з аналізу коду та інтерв'ю.</li>
        <li>Звірив кожне твердження з кодом і поведінкою на платформах.</li>
        <li>Доставив через Pull Requests з review від інженера по кожній секції.</li>
      </ol>
      <h2 id="before-after">До / Після</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● До</div>
          <pre>{`// Initializes the engine.
// Call this before anything else.
static Future<void> init(ModelConfig config)`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● Після</div>
          <pre>{`# Початок роботи → Встановлення

Додайте edge_veda до pubspec.yaml:
  dependencies:
    edge_veda: ^1.2.0

Налаштування платформ:
  iOS — додайте файли моделей до Runner target
  macOS — увімкніть App Sandbox entitlements

Див: Налаштування моделі → Troubleshooting`}</pre>
        </div>
      </div>
      <h2 id="deliverables">Результати</h2>
      <p>83 сторінки документації, організовані в 8 розділів, що покривають повну поверхню SDK — від першого встановлення до production-деплою. Кожна сторінка має узгоджену структуру з прикладами коду, платформними нотатками й перехресними посиланнями.</p>
      <EdgeVedaDocLinks lang="ua" />
      <h2 id="validation">Підхід до валідації</h2>
      <p>Кожен code-сніпет витягнуто з працюючих прикладів або запущено локально на iOS і macOS. Платформо-специфічну поведінку підтверджено на фізичних пристроях. Таблиці сумісності моделей згенеровано з внутрішньої матриці SDK, а не з маркетингових матеріалів.</p>
      <blockquote>
        AI пише драфт. Код вирішує. Кожне твердження звірено з кодом SDK і поведінкою на пристрої до merge.
      </blockquote>
      <h2 id="result">Результат</h2>
      <p>83 сторінки документації у 8 категоріях — від quickstart до production readiness. Повторні питання підтримки знизились на 65% за перший місяць. Сайт документації став основним ресурсом для нових користувачів SDK.</p>
    </>);

}

/* ---------- Workflow page ---------- */
function WorkflowPage({ lang }) {
  const t = window.I18N[lang].workflowPage;
  const sections = [
  { id: "principles", label: lang === "en" ? "Operating principles" : "Робочі принципи" },
  { id: "stages", label: lang === "en" ? "Workflow stages" : "Етапи workflow" },
  { id: "checklist", label: lang === "en" ? "Hallucination checklist" : "Чекліст галюцинацій" },
  { id: "prompts", label: lang === "en" ? "Example prompts" : "Приклади промптів" }];

  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    const onScroll = () => {
      let cur = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - 100 <= 0) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang]);

  const stages = [
  { num: "01", title: lang === "en" ? "Input collection" : "Збір вхідних матеріалів", body: lang === "en" ? "Code, README, tickets, specs, SME notes, Slack threads. Everything that contains domain truth." : "Код, README, тикети, специфікації, SME-нотатки. Усе, що містить доменну істину.", kind: "input" },
  { num: "02", title: lang === "en" ? "Code & context analysis" : "Аналіз коду й контексту", body: lang === "en" ? "Modules, dependencies, APIs, edge cases, prior decisions. Map the surface before writing prose." : "Модулі, залежності, API, edge cases, попередні рішення. Спочатку мапа, потім текст.", kind: "input" },
  { num: "03", title: lang === "en" ? "AI-assisted draft" : "AI-assisted draft", body: lang === "en" ? "Structure outlines, summaries, first drafts, examples. Treated as a hypothesis until validated." : "Структура, summaries, перші драфти, приклади. Гіпотеза до моменту валідації.", kind: "ai", badge: "AI" },
  { num: "04", title: lang === "en" ? "Technical validation" : "Технічна валідація", body: lang === "en" ? "Every claim checked against source code, product behavior, API responses or SME feedback." : "Кожне твердження звіряється з кодом, поведінкою продукту, API-відповідями або SME.", kind: "validate", badge: lang === "en" ? "VALIDATE" : "ВАЛІДАЦІЯ" },
  { num: "05", title: lang === "en" ? "Publishing" : "Публікація", body: lang === "en" ? "Markdown commits, PR review, preview build, merge to main, GitHub Pages or Confluence sync." : "Markdown commits, PR review, preview build, merge у main, GitHub Pages або Confluence sync.", kind: "input" },
  { num: "06", title: lang === "en" ? "Maintenance" : "Підтримка", body: lang === "en" ? "Templates, changelog, scheduled audits, broken-link checks, term consistency review." : "Шаблони, changelog, регулярні аудити, перевірка broken links, узгодженість термінів.", kind: "input" }];


  const prompts = [
  {
    name: lang === "en" ? "Outline an endpoint reference" : "Скласти outline для endpoint reference",
    stage: "Stage 03 · Draft",
    body: lang === "en" ?
    `Given the OpenAPI fragment below for the endpoint POST /v1/tasks,
produce a documentation outline with these sections:
  1. One-line summary
  2. When to use it
  3. Required and optional fields
  4. Successful response shape
  5. Error responses to document
Do not invent fields not present in the spec.
If anything is ambiguous, list it under "Questions for SME".` :
    `Маючи OpenAPI-фрагмент для endpoint POST /v1/tasks,
створи documentation outline з цими розділами:
  1. Короткий summary в одне речення
  2. Коли використовувати
  3. Required і optional поля
  4. Shape успішної відповіді
  5. Error responses, які треба задокументувати
Не вигадуй поля, яких нема у специфікації.
Якщо щось неоднозначне, винеси під "Questions for SME".`
  },
  {
    name: lang === "en" ? "Translate code into prose" : "Перетворити код на прозу",
    stage: "Stage 03 · Draft",
    body: lang === "en" ?
    `Read this function and describe what it does in plain language for an engineer
who is new to the codebase. Cover:
  - What it accepts and returns
  - What side effects it has (DB writes, network calls, events)
  - When it would fail
Quote line numbers when relevant. Do not infer behavior that is not present in the code.` :
    `Прочитай цю функцію і опиши, що вона робить, простою мовою — для інженера,
нового в кодовій базі. Покрий:
  - Що приймає й що повертає
  - Які side effects (DB writes, network calls, events)
  - Коли вона може зламатись
Цитуй номери рядків, де доречно. Не додумуй поведінку, якої нема в коді.`
  },
  {
    name: lang === "en" ? "Review for hallucinations" : "Review на галюцинації",
    stage: "Stage 04 · Validate",
    body: lang === "en" ?
    `You are reviewing a draft of API documentation against this OpenAPI source.
For every claim in the draft, return one of:
  ✓ Confirmed — quote the source line
  ✗ Contradicted — quote what the source actually says
  ? Unverifiable — flag for SME review
Focus on: endpoint paths, methods, status codes, field names, types, defaults, required flags.` :
    `Ти рев'юїш draft API-документації проти цього OpenAPI-джерела.
Для кожного твердження в драфті повертай одне з:
  ✓ Confirmed — цитуй рядок із джерела
  ✗ Contradicted — цитуй, що насправді каже джерело
  ? Unverifiable — позначай для SME review
Фокус: endpoint paths, methods, status codes, field names, types, defaults, required flags.`
  }];


  return (
    <main>
      <div className="container page-header">
        <span className="eyebrow">/workflow</span>
        <h1>{t.title}</h1>
        <p className="lede">{t.lede}</p>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose">
            <h2 id="principles">{t.principles.title}</h2>
            <div className="principle-grid">
              {t.principles.items.map((it, i) =>
              <div key={i} className="principle">
                  <p className="k">{it.k}</p>
                  <p className="v">{it.v}</p>
                </div>
              )}
            </div>

            <h2 id="stages">{lang === "en" ? "Workflow stages" : "Етапи workflow"}</h2>
            <p>{lang === "en" ? "Six stages, repeatable across API docs, codebase docs and onboarding work." : "Шість етапів, які повторюються в API-документації, codebase-docs і onboarding."}</p>
            <div className="workflow-rail" style={{ marginTop: 16 }}>
              {stages.map((s, i) =>
              <div key={i} className={"workflow-step is-" + s.kind}>
                  <div className="num">{s.num}</div>
                  <div className="body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                  {s.badge && <div className="badge">{s.badge}</div>}
                </div>
              )}
            </div>

            <h2 id="checklist">{t.checklist.title}</h2>
            <p>{lang === "en" ? "Documentation passes review only when every item is checked." : "Документ проходить review лише тоді, коли всі пункти позначено."}</p>
            <ul className="checklist">
              {t.checklist.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>

            <h2 id="prompts">{t.prompts.title}</h2>
            <p>{lang === "en" ? "These are reusable prompt templates I keep alongside the docs repo. Each has a stage label so the right prompt applies at the right step." : "Це багаторазові шаблони промптів, які я тримаю поряд з docs-репо. Кожен має stage-мітку, щоб правильний промпт застосувався на правильному кроці."}</p>
            {prompts.map((p, i) =>
            <div key={i} className="prompt-card">
                <div className="head">
                  <span className="name">{p.name}</span>
                  <span className="stage">{p.stage}</span>
                </div>
                <pre>{p.body}</pre>
              </div>
            )}
          </article>

          <aside>
            <nav className="toc" aria-label="On this page">
              <div className="toc-title">{t.tocTitle}</div>
              {sections.map((s) =>
              <a key={s.id}
              href={"#" + s.id}
              className={active === s.id ? "is-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(s.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}>{s.label}</a>
              )}
            </nav>
          </aside>
        </div>
      </section>
    </main>);

}

/* ---------- About ---------- */
function AboutPage({ lang }) {
  const t = window.I18N[lang].aboutPage;
  return (
    <main>
      <div className="container page-header">
        <span className="eyebrow">/about</span>
        <h1>{t.title}</h1>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="about-grid">
          <aside className="profile-card">
            <div className="avatar"><img src="My photo.jpg" alt="Mykhailo Troynin" /></div>
            <h2>Mykhailo Troynin</h2>
            <p className="role">{t.sidebarRole}</p>
            {t.sidebarLocation && <p style={{ fontSize: 13, color: "var(--color-text-faint)", marginTop: 4 }}>{t.sidebarLocation}</p>}
            <div className="links">
              <a href={"mailto:" + t.sidebarEmail}>
                <span className="label">EMAIL</span>
                <span>{t.sidebarEmail}</span>
              </a>
              <a href="https://t.me/Troynin_M" target="_blank" rel="noreferrer">
                <span className="label">TELEGRAM</span>
                <span>@Troynin_M ↗</span>
              </a>
              <a href="https://www.linkedin.com/in/%D0%BC%D0%B8%D1%85%D0%B0%D0%B9%D0%BB%D0%BE-%D1%82%D1%80%D0%BE%D0%B9%D0%BD%D1%96%D0%BD-21647625a" target="_blank" rel="noreferrer">
                <span className="label">LINKEDIN</span>
                <span>Mykhailo Troynin ↗</span>
              </a>
              <a href={lang === "ua" ? "CV_M_Troynin_ua.pdf" : "CV_M_Troynin_en.pdf"} download>
                <span className="label">CV</span>
                <span>{lang === "en" ? "Download PDF" : "Завантажити PDF"} ↓</span>
              </a>
            </div>
          </aside>
          <article className="prose">
            <p style={{ fontSize: "1.15rem", color: "var(--color-text)", lineHeight: 1.55 }}>{t.bio}</p>
            <p>{t.bio2}</p>

            {t.metrics && t.metrics.length > 0 && (
              <>
                <h2>{t.metricsTitle}</h2>
                <div className="metrics-grid">
                  {t.metrics.map((m, i) =>
                    <div key={i} className="metric-item">
                      <span className="metric-k">{m.k}</span>
                      <span className="metric-v">{m.v}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <h2>{t.coreSkillsTitle}</h2>
            <div className="skill-chip-grid">
              {t.coreSkills.map((s) => <span key={s} className="skill-chip">{s}</span>)}
            </div>

            <h2>{t.experienceTitle}</h2>
            <div className="experience-list">
              {t.experience.map((e, i) =>
              <div key={i} className="experience-item">
                  <div className="period">{e.period}</div>
                  <div>
                    <div className="role">{e.role}</div>
                    <div className="org">{e.org}</div>
                    <p>{e.body}</p>
                  </div>
                </div>
              )}
            </div>

            <h2>{t.engagementTitle}</h2>
            <div className="skill-chip-grid">
              {t.engagement.map((s) => <span key={s} className="skill-chip">{s}</span>)}
            </div>

            {t.languages && t.languages.length > 0 && (
              <>
                <h2>{t.languagesTitle}</h2>
                <div className="experience-list">
                  {t.languages.map((l, i) =>
                    <div key={i} className="experience-item">
                      <div className="period">{l.lang}</div>
                      <div><div className="role">{l.level}</div></div>
                    </div>
                  )}
                </div>
              </>
            )}
          </article>
        </div>
      </section>
    </main>);

}

/* ---------- Contact ---------- */
function ContactPage({ lang }) {
  const t = window.I18N[lang].contactPage;
  return (
    <main>
      <div className="container page-header">
        <span className="eyebrow">/contact</span>
        <h1>{t.title}</h1>
        <p className="lede">{t.lede}</p>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="contact-grid">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-faint)", letterSpacing: ".06em", textTransform: "uppercase" }}>
              {t.formTitle}
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t.labels.name}</label>
                <input type="text" placeholder="Jane Engineer" />
              </div>
              <div className="field">
                <label>{t.labels.email}</label>
                <input type="email" placeholder="you@team.dev" />
              </div>
            </div>
            <div className="field">
              <label>{t.labels.company}</label>
              <input type="text" placeholder="Acme Inc." />
            </div>
            <div className="field">
              <label>{t.labels.topic}</label>
              <select>
                {t.topics.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{t.labels.message}</label>
              <textarea placeholder={lang === "en" ? "What needs documenting? Stack, repo, timeline." : "Що треба документувати? Стек, репо, таймлайн."}></textarea>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-faint)" }}>
                {lang === "en" ? "Or just email — same thing." : "Або просто email — те саме."}
              </span>
              <button className="button button-primary" type="submit">
                {t.labels.send}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </div>
          </form>

          <div className="contact-direct">
            <h3>{t.directTitle}</h3>
            <div className="channels">
              <a className="channel" href="mailto:mihajlotrojnin@gmail.com">
                <span className="label">EMAIL</span>
                <span>mihajlotrojnin@gmail.com</span>
              </a>
              <a className="channel" href="https://www.linkedin.com/in/%D0%BC%D0%B8%D1%85%D0%B0%D0%B9%D0%BB%D0%BE-%D1%82%D1%80%D0%BE%D0%B9%D0%BD%D1%96%D0%BD-21647625a" target="_blank" rel="noreferrer">
                <span className="label">LINKEDIN</span>
                <span>Mykhailo Troynin ↗</span>
              </a>
              <a className="channel" href={lang === "ua" ? "CV_M_Troynin_ua.pdf" : "CV_M_Troynin_en.pdf"} download>
                <span className="label">CV</span>
                <span>{lang === "en" ? "Download PDF" : "Завантажити PDF"} ↓</span>
              </a>
            </div>
            <div className="note">{t.responseNote}</div>
          </div>
        </div>
      </section>
    </main>);

}

Object.assign(window, {
  Header, Footer, HomePage, WorkPage, SampleDetailPage, WorkflowPage, AboutPage, ContactPage,
  useHashRoute, navigate
});
