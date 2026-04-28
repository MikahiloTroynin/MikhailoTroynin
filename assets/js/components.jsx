// Folio components — all pages, header, footer, hero panel, etc.
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

const navigate = (to) => { window.location.hash = "#/" + to; };

/* ---------- Header ---------- */
function Header({ t, lang, setLang, page }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const items = [
    { id: "home", label: t.nav.home },
    { id: "work", label: t.nav.work },
    { id: "workflow", label: t.nav.workflow },
    { id: "about", label: t.nav.about },
    { id: "contact", label: t.nav.contact },
  ];
  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="header-inner">
        <a href="#/home" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">M</span>
          <span>M. Troynin</span>
          <span className="brand-suffix">/ docs</span>
        </a>

        <nav className={"nav" + (open ? " is-open" : "")}>
          {items.map(it => (
            <a key={it.id}
               href={"#/" + it.id}
               className={"nav-link" + (page === it.id || (page === "sample" && it.id === "work") ? " is-active" : "")}
               onClick={() => setOpen(false)}>
              {it.label}
            </a>
          ))}
        </nav>

        <div className="header-tools">
          <div className="lang-switch" role="group" aria-label="Language">
            <button className={lang === "en" ? "is-active" : ""} onClick={() => setLang("en")}>EN</button>
            <button className={lang === "ua" ? "is-active" : ""} onClick={() => setLang("ua")}>UA</button>
          </div>
          <a className="button button-secondary button-sm" href="#/contact" style={{ marginLeft: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t.nav.cv}
          </a>
          <button className="icon-btn menu-toggle" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
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
            Built like docs-as-code · Markdown + Jekyll + GitHub Pages
          </div>
        </div>
        <div className="footer-meta" style={{ display: "flex", gap: 16 }}>
          <a href="#/about">About</a>
          <a href="#/contact">Contact</a>
          <a href="https://github.com" onClick={(e) => e.preventDefault()}>GitHub ↗</a>
          <a href="https://linkedin.com" onClick={(e) => e.preventDefault()}>LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Hero Code Panel (real-looking API doc fragment) ---------- */
const CODE_TABS = [
  { id: "request", label: "request.sh", filename: "POST /v1/tasks" },
  { id: "response", label: "response.json", filename: "201 Created" },
  { id: "errors", label: "errors.md", filename: "errors.md" },
];

const REQ_LINES = [
  { c: <><span className="tk-comment"># Authenticate and create a task</span></> },
  { c: <><span className="tk-flag">curl</span> <span className="tk-flag">-X</span> <span className="tk-method">POST</span> <span className="tk-url">https://api.folio.dev/v1/tasks</span> \\</> },
  { c: <>{"  "}<span className="tk-flag">-H</span> <span className="tk-str">"Authorization: Bearer $FOLIO_TOKEN"</span> \\</> },
  { c: <>{"  "}<span className="tk-flag">-H</span> <span className="tk-str">"Content-Type: application/json"</span> \\</> },
  { c: <>{"  "}<span className="tk-flag">-d</span> <span className="tk-str">{`'{`}</span></> },
  { c: <><span className="tk-str">{`    "title": "Document API auth flow",`}</span></> },
  { c: <><span className="tk-str">{`    "assignee": "writer@team.dev",`}</span></> },
  { c: <><span className="tk-str">{`    "priority": "high"`}</span></> },
  { c: <><span className="tk-str">{`  }'`}</span></> },
];

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
  { c: <>{"}"}</> },
];

const ERR_LINES = [
  { c: <><span className="tk-comment">## Error catalog</span></> },
  { c: <></> },
  { c: <><span className="tk-key">| Status</span> <span className="tk-comment">|</span> <span className="tk-key">Code</span>            <span className="tk-comment">|</span> <span className="tk-key">When it happens</span>      <span className="tk-comment">|</span></> },
  { c: <><span className="tk-comment">|--------|-----------------|----------------------|</span></> },
  { c: <><span className="tk-num">| 400   </span> <span className="tk-comment">|</span> <span className="tk-str">invalid_payload</span> <span className="tk-comment">|</span> Missing or wrong type <span className="tk-comment">|</span></> },
  { c: <><span className="tk-num">| 401   </span> <span className="tk-comment">|</span> <span className="tk-str">unauthorized   </span> <span className="tk-comment">|</span> Missing/expired token <span className="tk-comment">|</span></> },
  { c: <><span className="tk-num">| 409   </span> <span className="tk-comment">|</span> <span className="tk-str">duplicate_task </span> <span className="tk-comment">|</span> Same title within 60s <span className="tk-comment">|</span></> },
  { c: <><span className="tk-num">| 429   </span> <span className="tk-comment">|</span> <span className="tk-str">rate_limited   </span> <span className="tk-comment">|</span> Over 100 req/min      <span className="tk-comment">|</span></> },
  { c: <><span className="tk-num">| 500   </span> <span className="tk-comment">|</span> <span className="tk-str">internal       </span> <span className="tk-comment">|</span> Server-side issue     <span className="tk-comment">|</span></> },
];

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
      setTab(t => {
        const idx = CODE_TABS.findIndex(x => x.id === t);
        return CODE_TABS[(idx + 1) % CODE_TABS.length].id;
      });
    }, 7800);
    return () => clearInterval(id);
  }, []);

  const filename = CODE_TABS.find(x => x.id === tab).filename;
  const showCursor = typed >= lines.length;

  return (
    <div className="code-panel" role="img" aria-label="API documentation preview">
      <div className="code-panel-header">
        <div className="dot-row"><span className="dot"/><span className="dot"/><span className="dot"/></div>
        <div className="code-panel-tabs">
          {CODE_TABS.map(c => (
            <button key={c.id}
                    className={"code-panel-tab" + (tab === c.id ? " is-active" : "")}
                    onClick={() => setTab(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="code-panel-meta">{filename}</div>
      </div>
      <div className="code-panel-body">
        <pre>
{lines.map((l, idx) => (
  <div key={idx} style={{ opacity: idx < typed ? 1 : 0, transition: "opacity 240ms ease" }}>
    {l.c}
    {idx === lines.length - 1 && idx < typed && showCursor && <span className="tk-cursor"/>}
    {"\n"}
  </div>
))}
        </pre>
      </div>
    </div>
  );
}

/* ---------- Sample card ---------- */
function SampleCard({ sample, lang }) {
  const t = window.I18N[lang].workPage;
  return (
    <button className="sample-card" onClick={() => navigate("sample/" + sample.id)} aria-label={sample.title[lang]}>
      <div className="tag-list">
        {sample.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
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
    </button>
  );
}

/* ---------- Home ---------- */
function HomePage({ lang }) {
  const t = window.I18N[lang];
  const featured = window.SAMPLES.filter(s => s.featured).sort((a,b) => a.order - b.order);

  const workflowSteps = [
    { num: "01", title: { en: "Input collection", ua: "Збір вхідних матеріалів" }, body: { en: "Code, README, tickets, specs, SME notes, Slack threads.", ua: "Код, README, тикети, специфікації, SME-нотатки, Slack-треди." }, kind: "input" },
    { num: "02", title: { en: "Code & context analysis", ua: "Аналіз коду й контексту" }, body: { en: "Modules, dependencies, APIs, edge cases, prior art.", ua: "Модулі, залежності, API, edge cases, попередні рішення." }, kind: "input" },
    { num: "03", title: { en: "AI-assisted draft", ua: "AI-assisted draft" }, body: { en: "Structure outlines, summaries, first drafts, examples — generated as hypothesis.", ua: "Структурні аутлайни, summaries, перші драфти, приклади — як гіпотеза." }, kind: "ai", badge: "AI" },
    { num: "04", title: { en: "Technical validation", ua: "Технічна валідація" }, body: { en: "Every claim checked against source code, product behavior and SME feedback.", ua: "Кожне твердження звіряється з кодом, поведінкою продукту і SME-фідбеком." }, kind: "validate", badge: { en: "VALIDATE", ua: "ВАЛІДАЦІЯ" } },
    { num: "05", title: { en: "Publishing", ua: "Публікація" }, body: { en: "Markdown, Git, GitHub Pages, Jekyll, Confluence, Docusaurus.", ua: "Markdown, Git, GitHub Pages, Jekyll, Confluence, Docusaurus." }, kind: "input" },
    { num: "06", title: { en: "Maintenance", ua: "Підтримка" }, body: { en: "Templates, changelog, review checklist, scheduled doc audits.", ua: "Шаблони, changelog, review-чекліст, регулярні аудити документації." }, kind: "input" },
  ];

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="rise">
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <h1 className="hero-title">
              {lang === "en"
                ? <>I turn <em>source code</em> into documentation engineers actually read.</>
                : <>Перетворюю <em>код</em> на документацію, яку інженери справді читають.</>}
            </h1>
            <p className="hero-lede">{t.hero.lede}</p>
            <div className="hero-ctas">
              <a className="button button-primary" href="#/work">
                {t.hero.ctaPrimary}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a className="button button-secondary" href="#/workflow">{t.hero.ctaSecondary}</a>
            </div>
            <div className="hero-meta">
              {t.hero.meta.map((m, i) => (
                <div key={i}>
                  <span className="k">{m.k}</span>
                  <span className="v">{m.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <HeroCodePanel/>
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
            {t.whatIDocument.cards.map((c, i) => (
              <article key={i} className={"doc-card" + (i === 4 ? " is-feature" : "")}>
                <span className="num">{c.num}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </article>
            ))}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="samples-grid">
            {featured.map(s => <SampleCard key={s.id} sample={s} lang={lang}/>)}
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
            {workflowSteps.map((s, i) => (
              <div key={i} className={"workflow-step is-" + s.kind}>
                <div className="num">{s.num}</div>
                <div className="body">
                  <h3>{s.title[lang]}</h3>
                  <p>{s.body[lang]}</p>
                </div>
                {s.badge && <div className="badge">{typeof s.badge === "string" ? s.badge : s.badge[lang]}</div>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <a className="button button-secondary" href="#/workflow">
              {t.workflow.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
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
            {t.tools.groups.map((g, i) => (
              <div key={i} className="tools-group">
                <div className="label">{g.label}</div>
                <div className="items">
                  {g.items.map(item => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
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
              <a className="button button-secondary" href="#" onClick={(e) => e.preventDefault()}>{t.finalCta.ctaSecondary}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Work Samples ---------- */
function WorkPage({ lang }) {
  const t = window.I18N[lang].workPage;
  const [filter, setFilter] = useState(t.filters[0]);
  // categories map (filter labels are localized; map index)
  useEffect(() => { setFilter(t.filters[0]); }, [lang]);
  const list = useMemo(() => {
    const idx = t.filters.indexOf(filter);
    if (idx <= 0) return window.SAMPLES;
    const cat = ["", "API Docs", "Code-to-Docs", "Developer Onboarding", "AI Workflow", "Internal Docs"][idx];
    return window.SAMPLES.filter(s => s.category === cat);
  }, [filter, lang]);

  return (
    <main>
      <div className="container page-header">
        <span className="eyebrow">/work</span>
        <h1>{t.title}</h1>
        <p className="lede">{t.subtitle}</p>
        <div className="filter-bar" role="tablist">
          {t.filters.map(f => (
            <button key={f}
                    role="tab"
                    aria-selected={filter === f}
                    className={"filter-pill" + (filter === f ? " is-active" : "")}
                    onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="samples-grid">
          {list.map(s => <SampleCard key={s.id} sample={s} lang={lang}/>)}
        </div>
        {list.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>—</p>}
      </section>
    </main>
  );
}

/* ---------- Sample Detail (with sticky TOC) ---------- */
function SampleDetailPage({ lang, id }) {
  const sample = window.SAMPLES.find(s => s.id === id) || window.SAMPLES[0];
  const tWork = window.I18N[lang].workPage;

  // build sections
  const sections = useMemo(() => {
    const en = lang === "en";
    if (sample.id === "edge-veda-code-to-docs") {
      return [
        { id: "context", label: en ? "Context" : "Контекст" },
        { id: "problem", label: en ? "Problem" : "Проблема" },
        { id: "input", label: en ? "Input materials" : "Вхідні матеріали" },
        { id: "process", label: en ? "Documentation process" : "Процес документації" },
        { id: "architecture", label: en ? "Documentation architecture" : "Архітектура документації" },
        { id: "api-inventory", label: en ? "Public API inventory" : "Інвентаризація API" },
        { id: "before-after", label: en ? "Before / After" : "До / Після" },
        { id: "getting-started", label: en ? "Getting Started" : "Початок роботи" },
        { id: "core-api", label: en ? "Core API Usage" : "Використання Core API" },
        { id: "model-compatibility", label: en ? "Model Compatibility" : "Сумісність моделей" },
        { id: "performance", label: en ? "Performance & Troubleshooting" : "Продуктивність" },
        { id: "deliverables", label: en ? "Deliverables" : "Результати" },
        { id: "validation", label: en ? "Validation approach" : "Підхід до валідації" },
        { id: "result", label: en ? "Status & next step" : "Статус і наступний крок" },
      ];
    }
    return [
      { id: "context", label: en ? "Context" : "Контекст" },
      { id: "problem", label: en ? "Problem" : "Проблема" },
      { id: "input", label: en ? "Input materials" : "Вхідні матеріали" },
      { id: "process", label: en ? "Documentation process" : "Процес документації" },
      { id: "before-after", label: en ? "Before / After" : "До / Після" },
      { id: "deliverables", label: en ? "Deliverables" : "Результати" },
      { id: "validation", label: en ? "Validation approach" : "Підхід до валідації" },
      { id: "result", label: en ? "Result" : "Результат" },
    ];
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {lang === "en" ? "All samples" : "Усі приклади"}
        </a>
        <div className="tag-list" style={{ marginTop: 8 }}>
          {sample.tags.map(t => <span key={t} className="tag">{t}</span>)}
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
              {sections.map(s => (
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
              ))}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 6 }}>
                <a className="button button-secondary button-sm" href="#" onClick={(e) => e.preventDefault()}>
                  {tWork.github} ↗
                </a>
              </div>
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* sample-detail content factories ---------- */
const SAMPLE_DETAIL_CONTENT = {
  default: {
    en: <DefaultDetailEn/>,
    ua: <DefaultDetailUa/>,
  },
  "rest-api-docs": {
    en: <RestApiDetailEn/>,
    ua: <RestApiDetailUa/>,
  },
  "edge-veda-code-to-docs": {
    en: <EdgeVedaDetailEn/>,
    ua: <EdgeVedaDetailUa/>,
  },
};

function EdgeVedaDetailEn() {
  return (
    <>
      <h2 id="context">Context</h2>
      <p>Edge-Veda is an open-source on-device AI runtime for Flutter — text generation, streaming chat, speech-to-text, text-to-speech, image generation, embeddings, retrieval-augmented generation, function calling and device-aware runtime supervision. I selected it as a documentation case because it concentrates several developer-documentation challenges in one repository: AI/ML concepts, Flutter SDK usage, native runtime constraints, public Dart APIs, model setup and practical examples.</p>
      <p>Status: <code>Draft / Open-source contribution in preparation</code>. Until the PR is submitted I use verbs like <em>drafted</em>, <em>analyzed</em>, <em>mapped</em> and <em>proposed</em>, never <em>improved adoption</em> or <em>reduced onboarding time</em>.</p>

      <h2 id="problem">Problem</h2>
      <p>The repository already has useful README content and examples, but a new SDK user still needs a clearer path from "I found this repo" to "I have a small working app." The main gaps:</p>
      <ul>
        <li>no single beginner-friendly documentation path;</li>
        <li>public APIs need a structured inventory before reference docs are written;</li>
        <li>usage examples should be grouped by developer task;</li>
        <li>model setup and compatibility need a dedicated guide;</li>
        <li>performance and platform limitations should live in one place;</li>
        <li>AI-generated drafts need technical validation against source code and examples.</li>
      </ul>

      <h2 id="input">Input materials</h2>
      <ul>
        <li>GitHub repository and README</li>
        <li><code>flutter/lib/</code> source files</li>
        <li><code>flutter/example/</code> example app</li>
        <li>Open issue requesting API documentation and usage examples</li>
        <li>Existing quickstart content</li>
        <li>AI-assisted analysis prompts and a manual validation checklist</li>
      </ul>

      <h2 id="process">Documentation process</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Repository review — identified the files that matter for a documentation contributor: SDK source, example app, README, issue scope, existing docs folder, package configuration.</li>
        <li>API mapping — built a working map of public Dart APIs and developer tasks, prioritizing what new users need first rather than documenting every method at once.</li>
        <li>Example extraction — turned existing example code into documentation-friendly examples (when to use, prerequisites, minimal code, expected result, common errors, related APIs).</li>
        <li>AI-assisted drafting — used AI for outlines, summarizing code behavior, turning examples into prose and drafting checklists. Treated every AI claim as a hypothesis.</li>
        <li>Technical validation — verified every statement against source code, README, examples, package metadata and local behavior where possible. Ambiguities go into "Questions for maintainers".</li>
      </ol>

      <h2 id="architecture">Proposed documentation architecture</h2>
      <pre>{`docs/
├── getting-started.md
├── model-compatibility.md
├── performance-tuning.md
├── platform-notes.md
├── examples/
│   ├── basic-llm-generation.md
│   ├── streaming-chat.md
│   ├── whisper-transcription.md
│   ├── image-generation.md
│   └── model-selection.md
└── reference/
    └── public-api-overview.md`}</pre>

      <h2 id="api-inventory">Public API inventory (working draft)</h2>
      <p>A living document that maps the public developer-facing API surface before reference docs are written. Each entry is labelled <code>Verified</code>, <code>Needs check</code> or <code>Question</code>.</p>
      <ul>
        <li><strong>Core runtime</strong> — <code>EdgeVeda</code>, <code>EdgeVedaConfig</code>, <code>generate()</code>, <code>generateStream()</code>, <code>embed()</code>, <code>describeImage()</code>.</li>
        <li><strong>Chat &amp; tools</strong> — <code>ChatSession</code>, <code>SystemPromptPreset</code>, <code>ToolRegistry</code>, <code>ToolDefinition</code>, <code>sendWithTools()</code>.</li>
        <li><strong>Speech</strong> — <code>WhisperSession</code>, <code>WhisperSession.microphone()</code>, <code>feedAudio()</code>, <code>flush()</code>, <code>stop()</code>, <code>TtsService</code>.</li>
        <li><strong>RAG &amp; embeddings</strong> — <code>VectorIndex</code>, <code>RagPipeline</code>.</li>
        <li><strong>Model selection &amp; runtime</strong> — <code>ModelAdvisor</code>, <code>DeviceProfile</code>, <code>MemoryEstimator</code>, <code>EdgeVedaBudget</code>.</li>
      </ul>

      <h2 id="before-after">Before / After</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● Before</div>
          <pre>{`Quickstart in the README only.
Examples scattered across the repo,
issue comments and the example app.
No grouped task pages, no
model-compatibility or platform notes.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● After (proposed)</div>
          <pre>{`docs/getting-started.md
  1. Install the package
  2. Verify platform requirements
  3. Pick a starter model
  4. Run a minimal generation
  5. Move to streaming, speech,
     image, RAG, or function calling
  6. Public API overview & follow-ups`}</pre>
        </div>
      </div>

      <h2 id="getting-started">Getting Started with Edge-Veda</h2>
      <p>Edge-Veda is an on-device AI SDK for Flutter. It lets you run local text generation, speech-to-text, text-to-speech, image generation, embeddings, RAG, and function calling without sending inference requests to a cloud API.</p>
      <p>This guide helps you create a minimal Flutter app, add Edge-Veda, download a starter model, initialize the runtime, and stream tokens into the UI.</p>
      <blockquote><strong>Validation note:</strong> This draft is based on the public README, quickstart, API reference, and exported Dart API. Before contributing it upstream, verify the package version and compile the final code sample against the latest <code>main</code> branch.</blockquote>

      <h3>Who this guide is for</h3>
      <p>Use this guide if you:</p>
      <ul>
        <li>already have Flutter and Xcode installed;</li>
        <li>want a first working on-device AI example;</li>
        <li>are testing on a physical iPhone;</li>
        <li>need a simple path before exploring RAG, vision, STT, TTS, or function calling.</li>
      </ul>

      <h3>Prerequisites</h3>
      <p>Install or configure: Flutter SDK, Xcode, CocoaPods, an Apple Developer account, Developer Mode on your iPhone, code signing in Xcode, and enough free storage for the model file.</p>
      <p>Check your environment:</p>
      <pre>{`flutter --version
xcode-select -p
pod --version`}</pre>

      <h3>1. Create a Flutter app</h3>
      <pre>{`flutter create my_edge_veda_app
cd my_edge_veda_app`}</pre>

      <h3>2. Add the dependency</h3>
      <p>Add Edge-Veda to <code>pubspec.yaml</code>.</p>
      <pre>{`dependencies:
  flutter:
    sdk: flutter
  edge_veda: ^2.5.0 # Verify the latest version before opening a PR.`}</pre>
      <p>Then install dependencies:</p>
      <pre>{`flutter pub get`}</pre>

      <h3>3. Configure iOS</h3>
      <p>Open <code>ios/Podfile</code> and make sure the deployment target is compatible with the package:</p>
      <pre>{`platform :ios, '13.0'`}</pre>
      <p>Install pods:</p>
      <pre>{`cd ios
pod install
cd ..`}</pre>

      <h3>4. Download a starter model</h3>
      <p>For your first app, use a small chat model that fits on mobile devices. The README recommends starting with Llama 3.2 1B for chat.</p>
      <pre>{`final modelManager = ModelManager();

modelManager.downloadProgress.listen((progress) {
  print('Download: \${progress.progressPercent}%');
});

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);`}</pre>

      <h3>5. Initialize Edge-Veda</h3>
      <pre>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));`}</pre>

      <h3>6. Generate text</h3>
      <p>Use streaming generation for interactive UIs.</p>
      <pre>{`await for (final chunk in edgeVeda.generateStream(
  'Explain on-device AI in two sentences.',
)) {
  if (!chunk.isFinal) {
    print(chunk.token);
  }
}`}</pre>
      <p>Use blocking generation when you want the complete response at once.</p>
      <pre>{`final response = await edgeVeda.generate(
  'Give me three reasons to run AI on-device.',
);

print(response.text);`}</pre>

      <h3>7. Dispose resources</h3>
      <p>Always release native resources when the app screen or service is done with inference.</p>
      <pre>{`await edgeVeda.dispose();
modelManager.dispose();`}</pre>

      <h3>Complete minimal example</h3>
      <pre>{`import 'package:edge_veda/edge_veda.dart';

Future<void> main() async {
  final modelManager = ModelManager();
  final edgeVeda = EdgeVeda();

  try {
    final modelPath = await modelManager.downloadModel(
      ModelRegistry.llama32_1b,
    );

    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    await for (final chunk in edgeVeda.generateStream(
      'Explain on-device AI in two sentences.',
    )) {
      if (!chunk.isFinal) {
        print(chunk.token);
      }
    }
  } finally {
    await edgeVeda.dispose();
    modelManager.dispose();
  }
}`}</pre>

      <h2 id="core-api">Core API Usage</h2>
      <p>This guide documents the most common Edge-Veda API flows. It is written for Flutter developers who already completed the getting started path and want to connect SDK classes to real product features.</p>

      <h3>API surface covered</h3>
      <ul>
        <li><strong>Text generation</strong> — <code>EdgeVeda</code>, <code>EdgeVedaConfig</code>, <code>GenerateOptions</code>, <code>GenerateResponse</code></li>
        <li><strong>Streaming generation</strong> — <code>EdgeVeda.generateStream()</code>, <code>TokenChunk</code>, <code>CancelToken</code></li>
        <li><strong>Multi-turn chat</strong> — <code>ChatSession</code>, <code>SystemPromptPreset</code>, <code>ChatTemplateFormat</code></li>
        <li><strong>Function calling</strong> — <code>ToolDefinition</code>, <code>ToolRegistry</code>, <code>ToolResult</code></li>
        <li><strong>Embeddings and RAG</strong> — <code>EdgeVeda.embed()</code>, <code>VectorIndex</code>, <code>RagPipeline</code>, <code>RagConfig</code></li>
        <li><strong>Speech-to-text</strong> — <code>WhisperSession</code>, <code>WhisperWorker</code></li>
        <li><strong>Text-to-speech</strong> — <code>TtsService</code>, <code>TtsVoice</code>, <code>TtsEvent</code></li>
        <li><strong>Vision</strong> — <code>VisionWorker</code>, <code>VisionConfig</code>, <code>EdgeVeda.describeImage()</code></li>
        <li><strong>Runtime control</strong> — <code>Scheduler</code>, <code>EdgeVedaBudget</code>, <code>RuntimePolicy</code>, <code>TelemetryService</code></li>
      </ul>

      <h3>Initialize the runtime</h3>
      <p><code>EdgeVeda</code> is the main entry point for text generation, streaming, embeddings, and image/vision initialization.</p>
      <pre>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));`}</pre>

      <h3>Generate a complete response</h3>
      <p>Use <code>generate()</code> when the caller needs the full result before updating the UI.</p>
      <pre>{`final response = await edgeVeda.generate(
  'Summarize the benefits of local AI inference.',
  options: const GenerateOptions(
    maxTokens: 200,
    temperature: 0.7,
  ),
);

print(response.text);`}</pre>

      <h3>Stream tokens</h3>
      <p>Use <code>generateStream()</code> for chat-like interfaces because the UI can render tokens as they arrive.</p>
      <pre>{`await for (final chunk in edgeVeda.generateStream(
  'Write a short onboarding message for a new user.',
  options: const GenerateOptions(maxTokens: 120),
)) {
  if (chunk.isFinal) break;
  print(chunk.token);
}`}</pre>

      <h3>Cancel a stream</h3>
      <pre>{`final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Tell me a long story about mobile AI.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (shouldStop) {
    cancelToken.cancel();
    break;
  }
  if (!chunk.isFinal) print(chunk.token);
}`}</pre>

      <h3>Multi-turn chat session</h3>
      <p><code>ChatSession</code> keeps conversation state while reusing the loaded model.</p>
      <pre>{`final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);

await for (final chunk in session.sendStream('Write hello world in Dart')) {
  if (!chunk.isFinal) print(chunk.token);
}

await for (final chunk in session.sendStream('Now explain each line')) {
  if (!chunk.isFinal) print(chunk.token);
}

print('Turns: \${session.turnCount}');
print('Context usage: \${(session.contextUsage * 100).toInt()}%');`}</pre>

      <h3>Function calling</h3>
      <p>Function calling lets the model request app-defined tools. Use a model and chat template that support tool calling.</p>
      <pre>{`final tools = ToolRegistry([
  ToolDefinition(
    name: 'get_time',
    description: 'Get the current time for a timezone',
    parameters: {
      'type': 'object',
      'properties': {
        'timezone': {
          'type': 'string',
          'enum': ['UTC', 'EST', 'PST'],
        },
      },
      'required': ['timezone'],
    },
  ),
]);

final session = ChatSession(
  edgeVeda: edgeVeda,
  tools: tools,
  templateFormat: ChatTemplateFormat.qwen3,
);

final response = await session.sendWithTools(
  'What time is it in UTC?',
  onToolCall: (call) async {
    if (call.name == 'get_time') {
      return ToolResult.success(
        toolCallId: call.id,
        data: {'time': DateTime.now().toIso8601String()},
      );
    }

    return ToolResult.failure(
      toolCallId: call.id,
      error: 'Unknown tool: \${call.name}',
    );
  },
);`}</pre>

      <h3>Embeddings, vector index, and RAG</h3>
      <p>Use an embedding model when calling <code>embed()</code>. A general chat model can produce meaningless embeddings.</p>
      <pre>{`final result = await edgeVeda.embed('On-device AI keeps data private.');

print('Dimensions: \${result.embedding.length}');
print('Tokens: \${result.tokenCount}');

final index = VectorIndex(dimensions: result.embedding.length);

index.add(
  'doc-1',
  result.embedding,
  metadata: {'source': 'intro.md'},
);

await index.save('/path/to/index.json');

final rag = RagPipeline(
  edgeVeda: edgeVeda,
  index: index,
  config: RagConfig(topK: 3),
);

final answer = await rag.query('What does the documentation say about privacy?');
print(answer.text);`}</pre>

      <h3>Speech-to-text</h3>
      <pre>{`final session = WhisperSession(modelPath: whisperModelPath);
await session.start();

session.onSegment.listen((segment) {
  print('[\${segment.startMs}ms] \${segment.text}');
});

final audioSub = WhisperSession.microphone().listen((samples) {
  session.feedAudio(samples);
});

await session.flush();
await session.stop();
await audioSub.cancel();`}</pre>

      <h3>Text-to-speech</h3>
      <pre>{`final tts = TtsService();
final voices = await tts.availableVoices();
final voice = voices.firstWhere((v) => v.language.startsWith('en'));

await tts.speak(
  'Hello from on-device AI.',
  voiceId: voice.id,
  rate: 0.5,
);`}</pre>

      <h3>Error handling pattern</h3>
      <p>Use typed exceptions so the app can show specific recovery actions.</p>
      <pre>{`try {
  await edgeVeda.init(config);
} on ModelLoadException catch (e) {
  print('Model load failed: \${e.message}');
} on ConfigurationException catch (e) {
  print('Configuration issue: \${e.message}');
} on EdgeVedaException catch (e) {
  print('Edge-Veda error: \${e.message}');
}`}</pre>

      <h3>Resource lifecycle</h3>
      <p>Recommended lifecycle: create <code>ModelManager</code>, download or import a model, create one <code>EdgeVeda</code> instance per active app session, initialize the runtime once, reuse the instance for generation calls, and dispose when the feature or app session ends.</p>

      <h2 id="model-compatibility">Model Compatibility Guide</h2>
      <p>Edge-Veda can load GGUF models compatible with the native runtime. The best model depends on the task, device memory, expected latency, and chat template support. This guide explains how to choose a model before downloading it and how to avoid the most common compatibility problems.</p>

      <h3>Model selection workflow</h3>
      <p>Use this sequence for every app feature:</p>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Define the task: chat, tools, vision, STT, image generation, embedding, or RAG.</li>
        <li>Detect the target device profile.</li>
        <li>Ask <code>ModelAdvisor</code> for a recommendation.</li>
        <li>Check memory and storage before downloading.</li>
        <li>Match the model to the correct chat template.</li>
        <li>Run a release/profile build on a physical device.</li>
      </ol>

      <h3>Start with a known model</h3>
      <p>For the first chat app, start with <code>ModelRegistry.llama32_1b</code>. For function calling, use a tool-capable model and a matching template, such as Qwen-style formatting.</p>
      <pre>{`final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

final session = ChatSession(
  edgeVeda: edgeVeda,
  tools: tools,
  templateFormat: ChatTemplateFormat.qwen3,
);`}</pre>

      <h3>Use ModelAdvisor</h3>
      <pre>{`final device = DeviceProfile.detect();

final recommendation = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

final best = recommendation.bestMatch;
if (best != null) {
  print('Recommended model: \${best.model.name}');
  print('Score: \${best.finalScore}/100');
  print('Fits device: \${best.fits}');
}`}</pre>

      <h3>Check memory and storage</h3>
      <pre>{`final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model or lower context length.');
}

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}`}</pre>

      <h3>Recommended model categories</h3>
      <ul>
        <li><strong>General chat</strong> — Llama 3.2 1B. Good first model for mobile chat tests.</li>
        <li><strong>Tool/function calling</strong> — Qwen3 0.6B. Match with <code>ChatTemplateFormat.qwen3</code>.</li>
        <li><strong>Vision</strong> — SmolVLM2. Requires model and projector files.</li>
        <li><strong>Speech-to-text</strong> — Whisper Tiny. Fast first STT test.</li>
        <li><strong>Higher-quality STT</strong> — Whisper Base. Larger than Tiny; test memory and latency.</li>
        <li><strong>Embeddings / RAG</strong> — MiniLM L6 v2 or supported embedding model. Do not use a general chat model for embeddings.</li>
        <li><strong>Image generation</strong> — SD v2.1 Turbo. Requires significantly more memory than text models.</li>
      </ul>

      <h3>GGUF and quantization</h3>
      <p>When choosing a GGUF model, check the model family, quantization level, file size, context length expectations, whether the model supports chat, tools, embeddings, or vision, and whether the chat template matches the model.</p>
      <p>Smaller quantized models usually fit more devices and run faster, but may reduce quality. Larger models can improve quality but increase model load time, memory pressure, and crash risk on older devices.</p>

      <h3>Chat template compatibility</h3>
      <p>Using the wrong chat template can produce repeated, malformed, or low-quality output. Before documenting or shipping a model: identify the model family, choose the matching <code>ChatTemplateFormat</code>, run a short smoke test, test multi-turn behavior, and test tool calling if applicable.</p>

      <h3>Vision and embedding model compatibility</h3>
      <p>Vision flows usually need two files: a vision-language model file and an <code>mmproj</code> projector file.</p>
      <pre>{`await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  contextSize: 2048,
  useGpu: true,
));`}</pre>
      <p>Use <code>VisionWorker</code> for long-running camera or frame-processing workflows where the model should stay loaded. For embeddings and RAG workflows, use an embedding model — do not build a production RAG index with embeddings from a model that was not designed for embedding tasks.</p>

      <h3>Model compatibility checklist</h3>
      <p>Before publishing a model recommendation, verify: the model constant exists in <code>ModelRegistry</code>; download size and checksum are current; the model fits the target device; there is enough free storage; the chat template is correct; the example works in release/profile mode; memory usage is acceptable after several prompts; the app disposes model resources when the feature ends.</p>

      <h2 id="performance">Performance and Troubleshooting</h2>
      <p>On-device AI performance depends on the model, device, build mode, memory pressure, context length, and runtime policy. This guide explains the first checks to run when Edge-Veda feels slow, fails to initialize, or crashes under load.</p>

      <h3>First rule: test in release or profile mode</h3>
      <p>Debug mode is not representative of production performance. Use release mode for speed testing and profile mode when you need DevTools.</p>
      <pre>{`flutter run --release
# or
flutter run --profile`}</pre>
      <p>Use debug mode only for UI development and logic debugging.</p>

      <h3>Performance checklist</h3>
      <p>Before tuning anything else, confirm: you are using a physical device, not only the simulator; the app runs in release or profile mode; the model fits the device memory; <code>contextLength</code> is not larger than needed; the correct chat template is used; the model is loaded once and reused; streaming is used for chat UI; resources are disposed after use.</p>

      <h3>Model loading takes time</h3>
      <p>Large model files must be loaded into memory before inference starts. The first call after initialization can feel slow.</p>
      <p>Recommended UX pattern: show a loading state while the model downloads; show a second loading state while the model initializes; keep the model loaded during the session; reuse the same <code>EdgeVeda</code> instance for related prompts; dispose only when the feature ends.</p>

      <h3>Reduce context length</h3>
      <p>Larger context windows increase memory usage and can slow down generation. Start with <code>2048</code> for the first tests and reduce it on older devices.</p>
      <pre>{`final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);`}</pre>

      <h3>Use streaming for responsive UI</h3>
      <p>If a full response takes several seconds, stream tokens instead of waiting for <code>generate()</code> to complete.</p>
      <pre>{`await for (final chunk in edgeVeda.generateStream(prompt)) {
  if (!chunk.isFinal) {
    appendToMessage(chunk.token);
  }
}`}</pre>

      <h3>Choose the right model size</h3>
      <p>Symptoms of an oversized model: initialization fails; iOS terminates the app under memory pressure; generation slows after a few turns; the app becomes unstable during long sessions.</p>
      <p>Mitigations: use a smaller model; lower <code>contextLength</code>; use a more compact quantization; avoid running multiple heavy workloads at the same time; dispose image or vision workers when not needed.</p>

      <h3>Troubleshooting table</h3>
      <ul>
        <li><strong><code>ModelLoadException: Model file not found</code></strong> — wrong model path or model not downloaded. Use <code>ModelManager.downloadModel()</code> or <code>getModelPath()</code> before <code>init()</code>.</li>
        <li><strong><code>InitializationException</code></strong> — invalid config, incompatible model, or memory issue. Check model format, reduce context length, choose a smaller model.</li>
        <li><strong>App is very slow</strong> — debug mode or simulator. Use <code>flutter run --release</code> on a physical device.</li>
        <li><strong>Repeated or malformed output</strong> — wrong chat template. Match model family to <code>ChatTemplateFormat</code>.</li>
        <li><strong>Tool calls are not parsed</strong> — model does not support tools or wrong template. Use a tool-capable model and matching template.</li>
        <li><strong>App crashes during long generation</strong> — memory pressure. Use a smaller model, lower context length, monitor memory.</li>
        <li><strong>Download fails</strong> — network interruption or storage issue. Retry download and check <code>ModelAdvisor.checkStorageAvailability()</code>.</li>
        <li><strong>Vision call fails</strong> — missing <code>mmproj</code> file or wrong image bytes. Verify both model paths and RGB byte format.</li>
      </ul>

      <h3>Monitor memory</h3>
      <pre>{`final stats = await edgeVeda.getMemoryStats();
print('Memory usage: \${(stats.usagePercent * 100).toStringAsFixed(1)}%');

if (await edgeVeda.isMemoryPressure()) {
  print('High memory pressure. Reduce workload or dispose unused models.');
}`}</pre>

      <h3>Use compute budgets for production features</h3>
      <p>For long-running features, connect a scheduler and define runtime constraints.</p>
      <pre>{`final scheduler = Scheduler(telemetry: TelemetryService());
scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));

scheduler.registerWorkload(
  WorkloadId.text,
  priority: WorkloadPriority.high,
);

scheduler.start();
edgeVeda.setScheduler(scheduler);`}</pre>

      <h3>Before reporting an issue</h3>
      <p>Collect: device model and iOS/macOS version; Flutter version; Edge-Veda package version; model name, size, and quantization; build mode (debug, profile, or release); <code>EdgeVedaConfig</code> values; complete error message and stack trace; whether the issue reproduces in the example app.</p>

      <h2 id="deliverables">Deliverables</h2>
      <ul>
        <li>Documentation gap analysis — what exists, what is missing, what to write first.</li>
        <li>Public API inventory — working draft with priority order.</li>
        <li>Getting Started guide — beginner-friendly first-success path.</li>
        <li>Usage example plan — examples grouped by task.</li>
        <li>Pre-PR validation checklist — class names, methods, package version, platform claims, model formats, runnable snippets.</li>
        <li>PR description — scope, files changed, validation method, follow-up work, review questions.</li>
      </ul>

      <h2 id="validation">Validation approach</h2>
      <p>Every technical claim is checked against source code, README, examples, package configuration and actual local behavior where possible. AI is used for outlines, summarization and prose, never as final authority. Each AI claim is labelled <code>Confirmed</code>, <code>Contradicted</code> or <code>Unverifiable</code> before it survives into the draft.</p>
      <blockquote>AI drafts. Code decides. Until the PR is submitted, the case is published as a transparent in-progress artifact, not a finished result.</blockquote>

      <h2 id="result">Status &amp; next step</h2>
      <p>Documentation package is prepared for portfolio and PR planning. Next step: open a focused PR adding <code>docs/getting-started.md</code>, an <code>examples/</code> folder with the first basic-LLM-generation guide and README links to both. After submission, the status moves to <em>Pull request submitted</em> with PR link, before/after screenshots, changed files and maintainer feedback. After merge — <em>Merged open-source contribution</em> with the final docs link and a short result summary.</p>
    </>
  );
}

function EdgeVedaDetailUa() {
  return (
    <>
      <h2 id="context">Контекст</h2>
      <p>Edge-Veda — open-source on-device AI runtime для Flutter: генерація тексту, streaming chat, speech-to-text, text-to-speech, генерація зображень, embeddings, retrieval-augmented generation, function calling і device-aware runtime supervision. Я обрав цей проєкт як кейс документації, бо він концентрує одразу кілька викликів developer documentation в одному репозиторії: AI/ML концепти, використання Flutter SDK, обмеження native runtime, публічні Dart API, налаштування моделей і практичні приклади.</p>
      <p>Статус: <code>Чернетка / Open-source контрибут у підготовці</code>. До моменту відправки PR використовую дієслова <em>драфтував</em>, <em>аналізував</em>, <em>змапував</em>, <em>запропонував</em>, а не <em>покращив adoption</em> чи <em>скоротив час onboarding</em>.</p>

      <h2 id="problem">Проблема</h2>
      <p>Репозиторій уже має корисний README і приклади, але новому користувачу SDK все одно бракує чіткого шляху від «знайшов репо» до «маю невеличкий робочий застосунок». Основні прогалини:</p>
      <ul>
        <li>немає єдиного beginner-friendly шляху в документації;</li>
        <li>публічні API потребують структурованої інвентаризації до написання reference;</li>
        <li>приклади використання слід згрупувати за задачами розробника;</li>
        <li>налаштування й сумісність моделей потребують окремого гайду;</li>
        <li>performance та платформенні обмеження — в одному місці;</li>
        <li>AI-чернетки потребують технічної валідації по сорсу й прикладах.</li>
      </ul>

      <h2 id="input">Вхідні матеріали</h2>
      <ul>
        <li>GitHub-репозиторій і README</li>
        <li>Сорс <code>flutter/lib/</code></li>
        <li>Приклад <code>flutter/example/</code></li>
        <li>Open issue з вимогою API-документації й прикладів</li>
        <li>Існуючий quickstart-контент</li>
        <li>AI-промпти для аналізу та чекліст ручної валідації</li>
      </ul>

      <h2 id="process">Процес документації</h2>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Рев'ю репозиторію — визначив файли, важливі для документаційного контриб'ютора: сорс SDK, приклад-застосунок, README, scope issue, існуюча папка docs, конфіг пакета.</li>
        <li>Мапування API — побудував робочу карту публічних Dart API і задач розробника, з пріоритетом для того, що потрібно новачкам, а не «задокументувати все одразу».</li>
        <li>Витяг прикладів — перетворив існуючі приклади на документаційні (коли використовувати, prerequisites, мінімальний код, очікуваний результат, типові помилки, пов'язані API).</li>
        <li>AI-assisted драфтинг — AI для outline-ів, узагальнення поведінки коду, перетворення прикладів у текст, генерації чеклістів. Кожне AI-твердження — гіпотеза.</li>
        <li>Технічна валідація — перевірка по сорсу, README, прикладах, метаданих пакета й реальній локальній поведінці. Усі неоднозначності — в «Questions for maintainers».</li>
      </ol>

      <h2 id="architecture">Запропонована архітектура документації</h2>
      <pre>{`docs/
├── getting-started.md
├── model-compatibility.md
├── performance-tuning.md
├── platform-notes.md
├── examples/
│   ├── basic-llm-generation.md
│   ├── streaming-chat.md
│   ├── whisper-transcription.md
│   ├── image-generation.md
│   └── model-selection.md
└── reference/
    └── public-api-overview.md`}</pre>

      <h2 id="api-inventory">Інвентаризація публічного API (working draft)</h2>
      <p>Living-документ, що мапує публічну developer-facing поверхню API до написання reference. Кожен запис — <code>Verified</code>, <code>Needs check</code> або <code>Question</code>.</p>
      <ul>
        <li><strong>Core runtime</strong> — <code>EdgeVeda</code>, <code>EdgeVedaConfig</code>, <code>generate()</code>, <code>generateStream()</code>, <code>embed()</code>, <code>describeImage()</code>.</li>
        <li><strong>Chat &amp; tools</strong> — <code>ChatSession</code>, <code>SystemPromptPreset</code>, <code>ToolRegistry</code>, <code>ToolDefinition</code>, <code>sendWithTools()</code>.</li>
        <li><strong>Speech</strong> — <code>WhisperSession</code>, <code>WhisperSession.microphone()</code>, <code>feedAudio()</code>, <code>flush()</code>, <code>stop()</code>, <code>TtsService</code>.</li>
        <li><strong>RAG &amp; embeddings</strong> — <code>VectorIndex</code>, <code>RagPipeline</code>.</li>
        <li><strong>Model selection &amp; runtime</strong> — <code>ModelAdvisor</code>, <code>DeviceProfile</code>, <code>MemoryEstimator</code>, <code>EdgeVedaBudget</code>.</li>
      </ul>

      <h2 id="before-after">До / Після</h2>
      <div className="beforeafter">
        <div className="ba-pane before">
          <div className="ba-head">● До</div>
          <pre>{`Quickstart лише в README.
Приклади розкидані по репо,
коментарях issue та example-застосунку.
Немає task-сторінок, model-compatibility
і platform notes в одному місці.`}</pre>
        </div>
        <div className="ba-pane after">
          <div className="ba-head">● Після (proposed)</div>
          <pre>{`docs/getting-started.md
  1. Встановити пакет
  2. Перевірити platform requirements
  3. Обрати стартову модель
  4. Запустити мінімальний generate
  5. Перейти до streaming, speech,
     image, RAG, function calling
  6. Огляд публічного API + наступні гайди`}</pre>
        </div>
      </div>

      <h2 id="getting-started">Початок роботи з Edge-Veda</h2>
      <p>Edge-Veda — це on-device AI SDK для Flutter. Він дає змогу запускати локальну генерацію тексту, speech-to-text, text-to-speech, image generation, embeddings, RAG і function calling без запитів до cloud API.</p>
      <p>Цей гайд допоможе створити мінімальний Flutter-застосунок, додати Edge-Veda, завантажити стартову модель, ініціалізувати runtime і вивести streaming tokens у застосунок.</p>
      <blockquote><strong>Нотатка для валідації:</strong> драфт створено на основі публічного README, quickstart, API reference та експортованого Dart API. Перед upstream PR перевірте версію пакета й скомпілюйте фінальний приклад на актуальній гілці <code>main</code>.</blockquote>

      <h3>Для кого цей гайд</h3>
      <ul>
        <li>вже маєте Flutter і Xcode;</li>
        <li>хочете отримати перший робочий on-device AI приклад;</li>
        <li>тестуєте на фізичному iPhone;</li>
        <li>хочете простий старт перед RAG, vision, STT, TTS або function calling.</li>
      </ul>

      <h3>Передумови</h3>
      <p>Потрібно встановити або налаштувати: Flutter SDK, Xcode, CocoaPods, Apple Developer account, Developer Mode на iPhone, code signing у Xcode, достатньо вільного місця для model file.</p>
      <p>Перевірте середовище:</p>
      <pre>{`flutter --version
xcode-select -p
pod --version`}</pre>

      <h3>1. Створіть Flutter-застосунок</h3>
      <pre>{`flutter create my_edge_veda_app
cd my_edge_veda_app`}</pre>

      <h3>2. Додайте dependency</h3>
      <p>Додайте Edge-Veda у <code>pubspec.yaml</code>.</p>
      <pre>{`dependencies:
  flutter:
    sdk: flutter
  edge_veda: ^2.5.0 # Перевірте актуальну версію перед PR.`}</pre>
      <p>Після цього встановіть залежності:</p>
      <pre>{`flutter pub get`}</pre>

      <h3>3. Налаштуйте iOS</h3>
      <p>Відкрийте <code>ios/Podfile</code> і переконайтеся, що deployment target сумісний із пакетом:</p>
      <pre>{`platform :ios, '13.0'`}</pre>
      <p>Встановіть pods:</p>
      <pre>{`cd ios
pod install
cd ..`}</pre>

      <h3>4. Завантажте стартову модель</h3>
      <p>Для першого застосунку використовуйте невелику chat model. README рекомендує починати з Llama 3.2 1B для chat.</p>
      <pre>{`final modelManager = ModelManager();

modelManager.downloadProgress.listen((progress) {
  print('Download: \${progress.progressPercent}%');
});

final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);`}</pre>

      <h3>5. Ініціалізуйте Edge-Veda</h3>
      <pre>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));`}</pre>

      <h3>6. Згенеруйте текст</h3>
      <p>Для інтерактивного UI використовуйте streaming generation.</p>
      <pre>{`await for (final chunk in edgeVeda.generateStream(
  'Explain on-device AI in two sentences.',
)) {
  if (!chunk.isFinal) {
    print(chunk.token);
  }
}`}</pre>
      <p>Для повної відповіді одним результатом використовуйте blocking generation.</p>
      <pre>{`final response = await edgeVeda.generate(
  'Give me three reasons to run AI on-device.',
);

print(response.text);`}</pre>

      <h3>7. Звільніть ресурси</h3>
      <pre>{`await edgeVeda.dispose();
modelManager.dispose();`}</pre>

      <h3>Повний мінімальний приклад</h3>
      <pre>{`import 'package:edge_veda/edge_veda.dart';

Future<void> main() async {
  final modelManager = ModelManager();
  final edgeVeda = EdgeVeda();

  try {
    final modelPath = await modelManager.downloadModel(
      ModelRegistry.llama32_1b,
    );

    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      useGpu: true,
    ));

    await for (final chunk in edgeVeda.generateStream(
      'Explain on-device AI in two sentences.',
    )) {
      if (!chunk.isFinal) {
        print(chunk.token);
      }
    }
  } finally {
    await edgeVeda.dispose();
    modelManager.dispose();
  }
}`}</pre>

      <h2 id="core-api">Використання Core API</h2>
      <p>Цей гайд описує найпоширеніші API flows в Edge-Veda. Він призначений для Flutter-розробників, які вже пройшли getting started і хочуть підключити SDK-класи до реальних продуктових фіч.</p>

      <h3>Які API покриває документ</h3>
      <ul>
        <li><strong>Text generation</strong> — <code>EdgeVeda</code>, <code>EdgeVedaConfig</code>, <code>GenerateOptions</code>, <code>GenerateResponse</code></li>
        <li><strong>Streaming generation</strong> — <code>EdgeVeda.generateStream()</code>, <code>TokenChunk</code>, <code>CancelToken</code></li>
        <li><strong>Multi-turn chat</strong> — <code>ChatSession</code>, <code>SystemPromptPreset</code>, <code>ChatTemplateFormat</code></li>
        <li><strong>Function calling</strong> — <code>ToolDefinition</code>, <code>ToolRegistry</code>, <code>ToolResult</code></li>
        <li><strong>Embeddings and RAG</strong> — <code>EdgeVeda.embed()</code>, <code>VectorIndex</code>, <code>RagPipeline</code>, <code>RagConfig</code></li>
        <li><strong>Speech-to-text</strong> — <code>WhisperSession</code>, <code>WhisperWorker</code></li>
        <li><strong>Text-to-speech</strong> — <code>TtsService</code>, <code>TtsVoice</code>, <code>TtsEvent</code></li>
        <li><strong>Vision</strong> — <code>VisionWorker</code>, <code>VisionConfig</code>, <code>EdgeVeda.describeImage()</code></li>
        <li><strong>Runtime control</strong> — <code>Scheduler</code>, <code>EdgeVedaBudget</code>, <code>RuntimePolicy</code>, <code>TelemetryService</code></li>
      </ul>

      <h3>Ініціалізація runtime</h3>
      <p><code>EdgeVeda</code> — головна точка входу для text generation, streaming, embeddings та ініціалізації image/vision можливостей.</p>
      <pre>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));`}</pre>

      <h3>Генерація повної відповіді</h3>
      <p>Використовуйте <code>generate()</code>, коли потрібен повний результат перед оновленням UI.</p>
      <pre>{`final response = await edgeVeda.generate(
  'Summarize the benefits of local AI inference.',
  options: const GenerateOptions(
    maxTokens: 200,
    temperature: 0.7,
  ),
);

print(response.text);`}</pre>

      <h3>Streaming tokens</h3>
      <pre>{`await for (final chunk in edgeVeda.generateStream(
  'Write a short onboarding message for a new user.',
  options: const GenerateOptions(maxTokens: 120),
)) {
  if (chunk.isFinal) break;
  print(chunk.token);
}`}</pre>

      <h3>Скасування stream</h3>
      <pre>{`final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Tell me a long story about mobile AI.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (shouldStop) {
    cancelToken.cancel();
    break;
  }
  if (!chunk.isFinal) print(chunk.token);
}`}</pre>

      <h3>Multi-turn chat session</h3>
      <p><code>ChatSession</code> зберігає conversation state і повторно використовує завантажену модель.</p>
      <pre>{`final session = ChatSession(
  edgeVeda: edgeVeda,
  preset: SystemPromptPreset.coder,
);

await for (final chunk in session.sendStream('Write hello world in Dart')) {
  if (!chunk.isFinal) print(chunk.token);
}

await for (final chunk in session.sendStream('Now explain each line')) {
  if (!chunk.isFinal) print(chunk.token);
}

print('Turns: \${session.turnCount}');
print('Context usage: \${(session.contextUsage * 100).toInt()}%');`}</pre>

      <h3>Function calling</h3>
      <p>Function calling дозволяє моделі викликати визначені застосунком tools. Використовуйте модель і chat template, які підтримують tool calling.</p>
      <pre>{`final tools = ToolRegistry([
  ToolDefinition(
    name: 'get_time',
    description: 'Get the current time for a timezone',
    parameters: {
      'type': 'object',
      'properties': {
        'timezone': {
          'type': 'string',
          'enum': ['UTC', 'EST', 'PST'],
        },
      },
      'required': ['timezone'],
    },
  ),
]);

final session = ChatSession(
  edgeVeda: edgeVeda,
  tools: tools,
  templateFormat: ChatTemplateFormat.qwen3,
);

final response = await session.sendWithTools(
  'What time is it in UTC?',
  onToolCall: (call) async {
    if (call.name == 'get_time') {
      return ToolResult.success(
        toolCallId: call.id,
        data: {'time': DateTime.now().toIso8601String()},
      );
    }

    return ToolResult.failure(
      toolCallId: call.id,
      error: 'Unknown tool: \${call.name}',
    );
  },
);`}</pre>

      <h3>Embeddings, vector index, RAG</h3>
      <p>Використовуйте embedding model для <code>embed()</code>. General chat model може дати беззмістовні embeddings.</p>
      <pre>{`final result = await edgeVeda.embed('On-device AI keeps data private.');

print('Dimensions: \${result.embedding.length}');
print('Tokens: \${result.tokenCount}');

final index = VectorIndex(dimensions: result.embedding.length);

index.add(
  'doc-1',
  result.embedding,
  metadata: {'source': 'intro.md'},
);

await index.save('/path/to/index.json');

final rag = RagPipeline(
  edgeVeda: edgeVeda,
  index: index,
  config: RagConfig(topK: 3),
);

final answer = await rag.query('What does the documentation say about privacy?');
print(answer.text);`}</pre>

      <h3>Speech-to-text</h3>
      <pre>{`final session = WhisperSession(modelPath: whisperModelPath);
await session.start();

session.onSegment.listen((segment) {
  print('[\${segment.startMs}ms] \${segment.text}');
});

final audioSub = WhisperSession.microphone().listen((samples) {
  session.feedAudio(samples);
});

await session.flush();
await session.stop();
await audioSub.cancel();`}</pre>

      <h3>Text-to-speech</h3>
      <pre>{`final tts = TtsService();
final voices = await tts.availableVoices();
final voice = voices.firstWhere((v) => v.language.startsWith('en'));

await tts.speak(
  'Hello from on-device AI.',
  voiceId: voice.id,
  rate: 0.5,
);`}</pre>

      <h3>Pattern для error handling</h3>
      <pre>{`try {
  await edgeVeda.init(config);
} on ModelLoadException catch (e) {
  print('Model load failed: \${e.message}');
} on ConfigurationException catch (e) {
  print('Configuration issue: \${e.message}');
} on EdgeVedaException catch (e) {
  print('Edge-Veda error: \${e.message}');
}`}</pre>

      <h3>Resource lifecycle</h3>
      <p>Рекомендований lifecycle: створити <code>ModelManager</code>, завантажити або імпортувати модель, створити один <code>EdgeVeda</code> instance на активну app session, ініціалізувати runtime один раз, повторно використовувати instance для generation calls, викликати dispose, коли feature або app session завершується.</p>

      <h2 id="model-compatibility">Гайд сумісності моделей</h2>
      <p>Edge-Veda може завантажувати GGUF-моделі, сумісні з native runtime. Найкраща модель залежить від задачі, памʼяті пристрою, очікуваної latency та підтримки chat template.</p>

      <h3>Workflow вибору моделі</h3>
      <ol style={{ paddingLeft: 22, color: "var(--color-text-muted)" }}>
        <li>Визначте задачу: chat, tools, vision, STT, image generation, embedding або RAG.</li>
        <li>Визначте target device profile.</li>
        <li>Запитайте рекомендацію в <code>ModelAdvisor</code>.</li>
        <li>Перевірте memory і storage до завантаження.</li>
        <li>Узгодьте модель із правильним chat template.</li>
        <li>Запустіть release/profile build на фізичному пристрої.</li>
      </ol>

      <h3>Почніть із перевіреної моделі</h3>
      <p>Для першого chat app почніть із <code>ModelRegistry.llama32_1b</code>. Для function calling — tool-capable модель і відповідний template, наприклад Qwen-style.</p>
      <pre>{`final modelPath = await modelManager.downloadModel(
  ModelRegistry.llama32_1b,
);

final session = ChatSession(
  edgeVeda: edgeVeda,
  tools: tools,
  templateFormat: ChatTemplateFormat.qwen3,
);`}</pre>

      <h3>ModelAdvisor</h3>
      <pre>{`final device = DeviceProfile.detect();

final recommendation = ModelAdvisor.recommend(
  device: device,
  useCase: UseCase.chat,
);

final best = recommendation.bestMatch;
if (best != null) {
  print('Recommended model: \${best.model.name}');
  print('Score: \${best.finalScore}/100');
  print('Fits device: \${best.fits}');
}`}</pre>

      <h3>Перевірка memory і storage</h3>
      <pre>{`final canRun = ModelAdvisor.canRun(
  model: ModelRegistry.llama32_1b,
);

if (!canRun) {
  print('Choose a smaller model or lower context length.');
}

final storage = await ModelAdvisor.checkStorageAvailability(
  model: ModelRegistry.llama32_1b,
);

if (!storage.hasSufficientSpace) {
  print(storage.warning);
}`}</pre>

      <h3>Рекомендовані категорії моделей</h3>
      <ul>
        <li><strong>General chat</strong> — Llama 3.2 1B. Хороша перша модель для mobile chat tests.</li>
        <li><strong>Tool/function calling</strong> — Qwen3 0.6B. Узгодьте з <code>ChatTemplateFormat.qwen3</code>.</li>
        <li><strong>Vision</strong> — SmolVLM2. Потрібні model і projector files.</li>
        <li><strong>Speech-to-text</strong> — Whisper Tiny. Швидкий перший STT test.</li>
        <li><strong>Якісніший STT</strong> — Whisper Base. Більший за Tiny; перевіряйте memory і latency.</li>
        <li><strong>Embeddings / RAG</strong> — MiniLM L6 v2 або підтримувана embedding model. Не використовуйте general chat model для embeddings.</li>
        <li><strong>Image generation</strong> — SD v2.1 Turbo. Потребує значно більше memory.</li>
      </ul>

      <h3>GGUF і quantization</h3>
      <p>Перевіряйте: model family, quantization level, file size, context length expectations, чи підтримує модель chat, tools, embeddings або vision, чи відповідає chat template моделі.</p>
      <p>Менші quantized models зазвичай підходять для більшої кількості пристроїв і працюють швидше, але можуть зменшити якість. Більші моделі покращують якість, але збільшують model load time, memory pressure і ризик crash на старіших пристроях.</p>

      <h3>Chat template compatibility</h3>
      <p>Неправильний chat template може давати повторюваний, malformed або низькоякісний output. Перед документацією: визначте model family, виберіть відповідний <code>ChatTemplateFormat</code>, запустіть короткий smoke test, перевірте multi-turn behavior, перевірте tool calling, якщо потрібно.</p>

      <h3>Сумісність vision і embedding моделей</h3>
      <p>Vision flows зазвичай потребують vision-language model file і <code>mmproj</code> projector file.</p>
      <pre>{`await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  contextSize: 2048,
  useGpu: true,
));`}</pre>
      <p>Для довготривалих camera workflows використовуйте <code>VisionWorker</code>. Для embeddings і RAG — embedding model. Не створюйте production RAG index із embeddings від моделі, що не призначена для embedding tasks.</p>

      <h3>Checklist сумісності моделей</h3>
      <p>Перед публікацією перевірте: model constant існує в <code>ModelRegistry</code>; download size і checksum актуальні; модель підходить для target device; достатньо вільного storage; chat template правильний; приклад працює в release/profile mode; memory usage прийнятний після кількох prompts; застосунок викликає dispose, коли feature завершується.</p>

      <h2 id="performance">Продуктивність і Troubleshooting</h2>
      <p>Продуктивність on-device AI залежить від моделі, пристрою, build mode, memory pressure, context length і runtime policy.</p>

      <h3>Перше правило: тестуйте в release або profile mode</h3>
      <pre>{`flutter run --release
# або
flutter run --profile`}</pre>
      <p>Debug mode використовуйте лише для UI development і logic debugging.</p>

      <h3>Performance checklist</h3>
      <p>Перед tuning перевірте: фізичний пристрій, а не лише simulator; release або profile mode; модель підходить за memory; <code>contextLength</code> не більший, ніж потрібно; правильний chat template; модель завантажується один раз і перевикористовується; для chat UI — streaming; resources звільняються після використання.</p>

      <h3>Model loading потребує часу</h3>
      <p>UX pattern: показуйте loading state під час model download, окремий loading state під час model initialization, тримайте модель завантаженою протягом session, перевикористовуйте той самий <code>EdgeVeda</code> instance, dispose лише коли feature завершується.</p>

      <h3>Зменшіть context length</h3>
      <pre>{`final config = EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 1024,
  useGpu: true,
);`}</pre>

      <h3>Streaming для responsive UI</h3>
      <pre>{`await for (final chunk in edgeVeda.generateStream(prompt)) {
  if (!chunk.isFinal) {
    appendToMessage(chunk.token);
  }
}`}</pre>

      <h3>Оберіть правильний model size</h3>
      <p>Ознаки завеликої моделі: initialization fails; iOS завершує app через memory pressure; generation сповільнюється після кількох turns; app стає нестабільним під час long sessions.</p>
      <p>Що робити: менша модель; зменшити <code>contextLength</code>; компактніша quantization; не запускати кілька важких workloads одночасно; dispose image або vision workers, коли вони не потрібні.</p>

      <h3>Troubleshooting table</h3>
      <ul>
        <li><strong><code>ModelLoadException: Model file not found</code></strong> — неправильний model path або модель не завантажено. Використайте <code>ModelManager.downloadModel()</code> або <code>getModelPath()</code> перед <code>init()</code>.</li>
        <li><strong><code>InitializationException</code></strong> — invalid config, incompatible model або memory issue. Перевірте model format, зменшіть context length, виберіть меншу модель.</li>
        <li><strong>App дуже повільний</strong> — debug mode або simulator. Використайте <code>flutter run --release</code> на фізичному пристрої.</li>
        <li><strong>Repeated або malformed output</strong> — неправильний chat template. Узгодьте model family з <code>ChatTemplateFormat</code>.</li>
        <li><strong>Tool calls не парсяться</strong> — модель не підтримує tools або template неправильний.</li>
        <li><strong>App падає під час довгої generation</strong> — memory pressure. Менша модель, менший context length, monitor memory.</li>
        <li><strong>Download fails</strong> — network interruption або storage issue. Повторіть і перевірте <code>ModelAdvisor.checkStorageAvailability()</code>.</li>
        <li><strong>Vision call fails</strong> — відсутній <code>mmproj</code> file або неправильні image bytes. Перевірте model paths і RGB byte format.</li>
      </ul>

      <h3>Memory monitoring</h3>
      <pre>{`final stats = await edgeVeda.getMemoryStats();
print('Memory usage: \${(stats.usagePercent * 100).toStringAsFixed(1)}%');

if (await edgeVeda.isMemoryPressure()) {
  print('High memory pressure. Reduce workload or dispose unused models.');
}`}</pre>

      <h3>Compute budgets для production features</h3>
      <pre>{`final scheduler = Scheduler(telemetry: TelemetryService());
scheduler.setBudget(EdgeVedaBudget.adaptive(BudgetProfile.balanced));

scheduler.registerWorkload(
  WorkloadId.text,
  priority: WorkloadPriority.high,
);

scheduler.start();
edgeVeda.setScheduler(scheduler);`}</pre>

      <h3>Перед створенням issue</h3>
      <p>Підготуйте: device model і iOS/macOS version; Flutter version; Edge-Veda package version; model name, size, quantization; build mode (debug, profile або release); значення <code>EdgeVedaConfig</code>; повний error message і stack trace; чи відтворюється проблема в example app.</p>

      <h2 id="deliverables">Результати</h2>
      <ul>
        <li>Аналіз прогалин у документації — що є, чого бракує, з чого почати.</li>
        <li>Інвентаризація публічного API — working draft із пріоритезацією.</li>
        <li>Getting Started guide — beginner-friendly шлях до першого успіху.</li>
        <li>План прикладів використання — приклади згруповано за задачею.</li>
        <li>Pre-PR чекліст валідації — імена класів, методи, версія пакета, platform claims, формати моделей, runnable snippets.</li>
        <li>Опис PR — scope, файли, метод валідації, наступні кроки, питання для review.</li>
      </ul>

      <h2 id="validation">Підхід до валідації</h2>
      <p>Кожне технічне твердження звіряється з сорсом, README, прикладами, конфігом пакета й реальною локальною поведінкою, де можливо. AI використовується для outline-ів, узагальнення й тексту — ніколи як фінальний авторитет. Кожне AI-твердження маркується <code>Confirmed</code>, <code>Contradicted</code> або <code>Unverifiable</code> до того, як потрапити в чернетку.</p>
      <blockquote>AI пише драфт. Код вирішує. До відправки PR кейс публікується як прозорий in-progress артефакт, а не «готовий результат».</blockquote>

      <h2 id="result">Статус і наступний крок</h2>
      <p>Пакет документації готовий для портфоліо й планування PR. Наступний крок — сфокусований PR із <code>docs/getting-started.md</code>, папкою <code>examples/</code> з першим basic-LLM-generation гайдом і лінками з README. Після відправки статус перейде у <em>Pull request submitted</em> із лінком PR, before/after скрінами, changed files і фідбеком мейнтейнерів. Після merge — <em>Merged open-source contribution</em> з лінком на фінальні docs і коротким підсумком.</p>
    </>
  );
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

Folio API uses bearer tokens. Each request must include:

  Authorization: Bearer <token>

Generate a token at https://app.folio.dev/settings/tokens.
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
    </>
  );
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

Folio API uses bearer tokens. Each request must include:

  Authorization: Bearer <token>

Generate a token at https://app.folio.dev/settings/tokens.
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
    </>
  );
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
      <h2 id="result">Result</h2>
      <p>Integration support tickets dropped 70% within six weeks of launch. Time-to-first-request (measured via API analytics) improved from a median of 38 minutes to 6 minutes. The docs site became the second-most-visited page on the developer portal.</p>
    </>
  );
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
      <h2 id="result">Результат</h2>
      <p>Тикети на інтеграційну підтримку впали на 70% за 6 тижнів. Time-to-first-request покращився з медіани 38 хвилин до 6 хвилин. Docs-сайт став другою за відвідуваністю сторінкою developer portal.</p>
    </>
  );
}

/* ---------- Workflow page ---------- */
function WorkflowPage({ lang }) {
  const t = window.I18N[lang].workflowPage;
  const sections = [
    { id: "principles", label: lang === "en" ? "Operating principles" : "Робочі принципи" },
    { id: "stages", label: lang === "en" ? "Workflow stages" : "Етапи workflow" },
    { id: "checklist", label: lang === "en" ? "Hallucination checklist" : "Чекліст галюцинацій" },
    { id: "prompts", label: lang === "en" ? "Example prompts" : "Приклади промптів" },
  ];
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
    { num: "06", title: lang === "en" ? "Maintenance" : "Підтримка", body: lang === "en" ? "Templates, changelog, scheduled audits, broken-link checks, term consistency review." : "Шаблони, changelog, регулярні аудити, перевірка broken links, узгодженість термінів.", kind: "input" },
  ];

  const prompts = [
    {
      name: lang === "en" ? "Outline an endpoint reference" : "Скласти outline для endpoint reference",
      stage: "Stage 03 · Draft",
      body: lang === "en"
        ? `Given the OpenAPI fragment below for the endpoint POST /v1/tasks,
produce a documentation outline with these sections:
  1. One-line summary
  2. When to use it
  3. Required and optional fields
  4. Successful response shape
  5. Error responses to document
Do not invent fields not present in the spec.
If anything is ambiguous, list it under "Questions for SME".`
        : `Маючи OpenAPI-фрагмент для endpoint POST /v1/tasks,
створи documentation outline з цими розділами:
  1. Короткий summary в одне речення
  2. Коли використовувати
  3. Required і optional поля
  4. Shape успішної відповіді
  5. Error responses, які треба задокументувати
Не вигадуй поля, яких нема у специфікації.
Якщо щось неоднозначне, винеси під "Questions for SME".`,
    },
    {
      name: lang === "en" ? "Translate code into prose" : "Перетворити код на прозу",
      stage: "Stage 03 · Draft",
      body: lang === "en"
        ? `Read this function and describe what it does in plain language for an engineer
who is new to the codebase. Cover:
  - What it accepts and returns
  - What side effects it has (DB writes, network calls, events)
  - When it would fail
Quote line numbers when relevant. Do not infer behavior that is not present in the code.`
        : `Прочитай цю функцію і опиши, що вона робить, простою мовою — для інженера,
нового в кодовій базі. Покрий:
  - Що приймає й що повертає
  - Які side effects (DB writes, network calls, events)
  - Коли вона може зламатись
Цитуй номери рядків, де доречно. Не додумуй поведінку, якої нема в коді.`,
    },
    {
      name: lang === "en" ? "Review for hallucinations" : "Review на галюцинації",
      stage: "Stage 04 · Validate",
      body: lang === "en"
        ? `You are reviewing a draft of API documentation against this OpenAPI source.
For every claim in the draft, return one of:
  ✓ Confirmed — quote the source line
  ✗ Contradicted — quote what the source actually says
  ? Unverifiable — flag for SME review
Focus on: endpoint paths, methods, status codes, field names, types, defaults, required flags.`
        : `Ти рев'юїш draft API-документації проти цього OpenAPI-джерела.
Для кожного твердження в драфті повертай одне з:
  ✓ Confirmed — цитуй рядок із джерела
  ✗ Contradicted — цитуй, що насправді каже джерело
  ? Unverifiable — позначай для SME review
Фокус: endpoint paths, methods, status codes, field names, types, defaults, required flags.`,
    },
  ];

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
              {t.principles.items.map((it, i) => (
                <div key={i} className="principle">
                  <p className="k">{it.k}</p>
                  <p className="v">{it.v}</p>
                </div>
              ))}
            </div>

            <h2 id="stages">{lang === "en" ? "Workflow stages" : "Етапи workflow"}</h2>
            <p>{lang === "en" ? "Six stages, repeatable across API docs, codebase docs and onboarding work." : "Шість етапів, які повторюються в API-документації, codebase-docs і onboarding."}</p>
            <div className="workflow-rail" style={{ marginTop: 16 }}>
              {stages.map((s, i) => (
                <div key={i} className={"workflow-step is-" + s.kind}>
                  <div className="num">{s.num}</div>
                  <div className="body">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                  {s.badge && <div className="badge">{s.badge}</div>}
                </div>
              ))}
            </div>

            <h2 id="checklist">{t.checklist.title}</h2>
            <p>{lang === "en" ? "Documentation passes review only when every item is checked." : "Документ проходить review лише тоді, коли всі пункти позначено."}</p>
            <ul className="checklist">
              {t.checklist.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>

            <h2 id="prompts">{t.prompts.title}</h2>
            <p>{lang === "en" ? "These are reusable prompt templates I keep alongside the docs repo. Each has a stage label so the right prompt applies at the right step." : "Це багаторазові шаблони промптів, які я тримаю поряд з docs-репо. Кожен має stage-мітку, щоб правильний промпт застосувався на правильному кроці."}</p>
            {prompts.map((p, i) => (
              <div key={i} className="prompt-card">
                <div className="head">
                  <span className="name">{p.name}</span>
                  <span className="stage">{p.stage}</span>
                </div>
                <pre>{p.body}</pre>
              </div>
            ))}
          </article>

          <aside>
            <nav className="toc" aria-label="On this page">
              <div className="toc-title">{t.tocTitle}</div>
              {sections.map(s => (
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
              ))}
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
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
            <div className="avatar"></div>
            <h2>Mykhailo Troynin</h2>
            <p className="role">{lang === "en" ? "AI Technical Writer" : "AI Technical Writer"}</p>
            <div className="links">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">EMAIL</span>
                <span>hello@folio.dev</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">LINKEDIN</span>
                <span>/in/troynin ↗</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">GITHUB</span>
                <span>@troynin ↗</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">CV</span>
                <span>{lang === "en" ? "Download PDF" : "Завантажити PDF"} ↓</span>
              </a>
            </div>
          </aside>
          <article className="prose">
            <p style={{ fontSize: "1.15rem", color: "var(--color-text)", lineHeight: 1.55 }}>{t.bio}</p>
            <p>{t.bio2}</p>

            <h2>{t.coreSkillsTitle}</h2>
            <div className="skill-chip-grid">
              {t.coreSkills.map(s => <span key={s} className="skill-chip">{s}</span>)}
            </div>

            <h2>{t.experienceTitle}</h2>
            <div className="experience-list">
              {t.experience.map((e, i) => (
                <div key={i} className="experience-item">
                  <div className="period">{e.period}</div>
                  <div>
                    <div className="role">{e.role}</div>
                    <div className="org">{e.org}</div>
                    <p>{e.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>{t.engagementTitle}</h2>
            <div className="skill-chip-grid">
              {t.engagement.map(s => <span key={s} className="skill-chip">{s}</span>)}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
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
                {t.topics.map(o => <option key={o}>{o}</option>)}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>

          <div className="contact-direct">
            <h3>{t.directTitle}</h3>
            <div className="channels">
              <a className="channel" href="mailto:hello@folio.dev">
                <span className="label">EMAIL</span>
                <span>hello@folio.dev</span>
              </a>
              <a className="channel" href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">LINKEDIN</span>
                <span>/in/troynin ↗</span>
              </a>
              <a className="channel" href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">GITHUB</span>
                <span>@troynin ↗</span>
              </a>
              <a className="channel" href="#" onClick={(e) => e.preventDefault()}>
                <span className="label">CV</span>
                <span>{lang === "en" ? "Download PDF" : "Завантажити PDF"} ↓</span>
              </a>
            </div>
            <div className="note">{t.responseNote}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, {
  Header, Footer, HomePage, WorkPage, SampleDetailPage, WorkflowPage, AboutPage, ContactPage,
  useHashRoute, navigate,
});
