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
  // Sub-route: e.g. rest-api-docs/edgeveda-generate → render API doc page
  if (id && id.includes("/")) {
    const [sampleId, docId] = id.split("/", 2);
    return <ApiDocPage lang={lang} sampleId={sampleId} docId={docId} />;
  }
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
    if (sample.id === "rest-api-docs") {
      return [
        { id: "context", label: en ? "Context" : "Контекст" },
        { id: "problem", label: en ? "Problem" : "Проблема" },
        { id: "input", label: en ? "Input materials" : "Вхідні матеріали" },
        { id: "process", label: en ? "Documentation process" : "Процес документації" },
        { id: "before-after", label: en ? "Before / After" : "До / Після" },
        { id: "deliverables", label: en ? "Deliverables" : "Результати" },
        { id: "api-reference", label: en ? "API Reference" : "API Reference" },
        { id: "validation", label: en ? "Validation approach" : "Підхід до валідації" },
        { id: "result", label: en ? "Result" : "Результат" },
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

      <h2 id="api-reference">Embedded API Reference</h2>
      <p>The following API reference pages were created as part of this project. Click to view the full documentation.</p>
      <ApiDocsList lang="en" sampleId="rest-api-docs" />
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

      <h2 id="api-reference">Вбудована API-документація</h2>
      <p>Наступні сторінки API reference створені в межах цього проєкту. Клікніть, щоб переглянути повний опис.</p>
      <ApiDocsList lang="ua" sampleId="rest-api-docs" />
      <h2 id="validation">Підхід до валідації</h2>
      <p>Кожен приклад згенеровано через staging API, а не написано вручну. Точність схем перевірено через OpenAPI як ground truth. API lead review-їв кожен розділ.</p>
      <blockquote>Quickstart протестував розробник поза командою. У нього був робочий запит за 4 хвилини.</blockquote>
      <h2 id="result">Результат</h2>
      <p>Тикети на інтеграційну підтримку впали на 70% за 6 тижнів. Time-to-first-request покращився з медіани 38 хвилин до 6 хвилин. Docs-сайт став другою за відвідуваністю сторінкою developer portal.</p>
    </>
  );
}

/* ---------- API Docs List component ---------- */
function ApiDocsList({ lang, sampleId }) {
  const docs = (window.API_DOCS || []).filter(d => d.parentSample === sampleId);
  if (!docs.length) return null;
  return (
    <div className="api-docs-list">
      {docs.map(doc => (
        <a key={doc.id}
           href={"#/sample/" + sampleId + "/" + doc.id}
           className="api-doc-card">
          <div className="api-doc-card__header">
            <code className="api-doc-card__method">{doc.title[lang]}</code>
            <span className="api-doc-card__badge">{doc.stability}</span>
          </div>
          <p className="api-doc-card__desc">{doc.description[lang]}</p>
          <div className="api-doc-card__meta">
            <span>{doc.className}</span>
            <span>v{doc.since}</span>
            {doc.tags.map(t => <span key={t} className="tag tag--sm">{t}</span>)}
          </div>
          <span className="api-doc-card__arrow">→</span>
        </a>
      ))}
    </div>
  );
}

/* ---------- API Doc Page ---------- */
function ApiDocPage({ lang, sampleId, docId }) {
  const doc = (window.API_DOCS || []).find(d => d.id === docId && d.parentSample === sampleId);
  const parentSample = window.SAMPLES.find(s => s.id === sampleId);

  if (!doc) {
    return (
      <main>
        <div className="container page-header">
          <a href={"#/sample/" + sampleId} className="button button-ghost button-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {lang === "en" ? "Back to sample" : "Назад до прикладу"}
          </a>
          <h1>{lang === "en" ? "Document not found" : "Документ не знайдено"}</h1>
        </div>
      </main>
    );
  }

  const contentMap = API_DOC_CONTENT[docId];
  const content = contentMap ? contentMap[lang] : null;

  const sections = API_DOC_SECTIONS[docId]?.[lang] || [];

  const [active, setActive] = useState(sections[0]?.id || "");
  useEffect(() => {
    const onScroll = () => {
      let cur = sections[0]?.id || "";
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
  }, [sections]);

  return (
    <main>
      <div className="container page-header">
        <a href={"#/sample/" + sampleId} className="button button-ghost button-sm" style={{ paddingLeft: 0, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {parentSample ? parentSample.title[lang] : (lang === "en" ? "Back" : "Назад")}
        </a>
        <div className="tag-list" style={{ marginTop: 8 }}>
          {doc.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <h1><code>{doc.title[lang]}</code></h1>
        <p className="lede">{doc.description[lang]}</p>

        <div className="detail-meta-bar">
          <div className="item">
            <div className="k">Class</div>
            <div className="v"><code>{doc.className}</code></div>
          </div>
          <div className="item">
            <div className="k">Method</div>
            <div className="v"><code>{doc.method}</code></div>
          </div>
          <div className="item">
            <div className="k">Since</div>
            <div className="v">v{doc.since}</div>
          </div>
          <div className="item">
            <div className="k">{lang === "en" ? "Status" : "Статус"}</div>
            <div className="v" style={{ color: "var(--color-success)" }}>● {doc.stability}</div>
          </div>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="detail-layout">
          <article className="prose api-ref-prose">
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
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ---------- API Doc sections (TOC) ---------- */
const API_DOC_SECTIONS = {
  "edgeveda-init": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
  "edgeveda-generate": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
  "edgeveda-generate-stream": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
  "edgeveda-describe-image": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
  "edgeveda-embed": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
  "edgeveda-embed-batch": {
    en: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "What it does" },
      { id: "when-to-use", label: "When to use it" },
      { id: "prerequisites", label: "Prerequisites" },
      { id: "parameters", label: "Parameters" },
      { id: "returns", label: "Returns" },
      { id: "errors", label: "Errors and exceptions" },
      { id: "examples", label: "Minimal example" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Behavior notes" },
      { id: "performance", label: "Performance notes" },
      { id: "compatibility", label: "Model compatibility" },
      { id: "privacy", label: "Privacy and security" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Related APIs" },
    ],
    ua: [
      { id: "api-summary", label: "API summary" },
      { id: "signature", label: "Signature" },
      { id: "what-it-does", label: "Що робить" },
      { id: "when-to-use", label: "Коли використовувати" },
      { id: "prerequisites", label: "Передумови" },
      { id: "parameters", label: "Параметри" },
      { id: "returns", label: "Повертає" },
      { id: "errors", label: "Помилки та винятки" },
      { id: "examples", label: "Приклади" },
      { id: "streaming-example", label: "Streaming example" },
      { id: "behavior", label: "Поведінка" },
      { id: "performance", label: "Продуктивність" },
      { id: "compatibility", label: "Сумісність" },
      { id: "privacy", label: "Приватність" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "related", label: "Пов'язані API" },
    ],
  },
};

function EdgevedaInitEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>init()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Runtime initialization</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future&lt;void&gt; init(EdgeVedaConfig config);`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>init()</code> stores the <code>EdgeVedaConfig</code> for the SDK instance and validates that the model referenced by <code>config.modelPath</code> can be loaded. It does not produce text or embeddings. It performs configuration validation, checks that the model file exists, and runs a background-isolate load test against the native runtime.</p>
      <p>The method returns <code>Future&lt;void&gt;</code> and completes when the SDK instance is ready for subsequent calls such as <code>generate()</code>, <code>generateStream()</code>, and <code>embed()</code>.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>init()</code> when you need to:</p>
      <ul>
        <li>prepare an <code>EdgeVeda</code> instance for text generation or embeddings;</li>
        <li>validate that a downloaded or imported GGUF model file can be loaded;</li>
        <li>apply runtime settings such as context length, thread count, GPU usage, and KV-cache configuration.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>the instance is already initialized; call <code>dispose()</code> first if you need to reinitialize with a different model or configuration;</li>
        <li>you only need to download or import a model; use <code>ModelManager</code> for model file management;</li>
        <li>you are initializing vision or image generation models, which have separate initialization APIs.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li>a compatible model file exists at <code>config.modelPath</code>;</li>
        <li>the app has permission to read the model file from its local storage location;</li>
        <li>the selected model fits the target device memory budget;</li>
        <li>the app chooses a realistic <code>contextLength</code> for the target device;</li>
        <li>GPU/Metal usage is enabled only on platforms where it is supported and tested;</li>
        <li>the app is prepared to handle model-load and memory-related failures.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>config</code></td>
              <td><code>EdgeVedaConfig</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Runtime configuration used to initialize the SDK instance.</td>
              <td>Must include a valid <code>modelPath</code>. Other fields control threads, context length, GPU usage, memory budget, flash attention, and KV-cache quantization.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3><code>EdgeVedaConfig</code> fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>modelPath</code></td>
              <td><code>String</code></td>
              <td>Required</td>
              <td>Path to the local GGUF model file.</td>
              <td>The file must exist before calling <code>init()</code>.</td>
            </tr>
            <tr>
              <td><code>numThreads</code></td>
              <td><code>int</code></td>
              <td><code>4</code></td>
              <td>Number of CPU threads to use for inference.</td>
              <td>Tune per device class.</td>
            </tr>
            <tr>
              <td><code>contextLength</code></td>
              <td><code>int</code></td>
              <td><code>2048</code></td>
              <td>Maximum context length in tokens.</td>
              <td>Higher values increase memory usage.</td>
            </tr>
            <tr>
              <td><code>useGpu</code></td>
              <td><code>bool</code></td>
              <td><code>true</code></td>
              <td>Enables GPU acceleration where supported.</td>
              <td>On iOS/macOS this typically means Metal.</td>
            </tr>
            <tr>
              <td><code>maxMemoryMb</code></td>
              <td><code>int</code></td>
              <td><code>1536</code></td>
              <td>Memory budget in MB.</td>
              <td>Use conservative values on 4 GB devices.</td>
            </tr>
            <tr>
              <td><code>verbose</code></td>
              <td><code>bool</code></td>
              <td><code>false</code></td>
              <td>Enables verbose logging.</td>
              <td>Useful during integration and debugging.</td>
            </tr>
            <tr>
              <td><code>flashAttn</code></td>
              <td><code>int</code></td>
              <td><code>-1</code></td>
              <td>Flash attention mode.</td>
              <td><code>-1</code> means auto.</td>
            </tr>
            <tr>
              <td><code>kvCacheTypeK</code></td>
              <td><code>int</code></td>
              <td><code>8</code></td>
              <td>KV-cache quantization type for keys.</td>
              <td><code>1 = F16</code>, <code>8 = Q8_0</code>.</td>
            </tr>
            <tr>
              <td><code>kvCacheTypeV</code></td>
              <td><code>int</code></td>
              <td><code>8</code></td>
              <td>KV-cache quantization type for values.</td>
              <td><code>1 = F16</code>, <code>8 = Q8_0</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Future&lt;void&gt;</code></p>
      <p>The future completes when the SDK has validated the configuration and confirmed that the model can be loaded. The method does not return a runtime handle, generated text, embeddings, or model metadata.</p>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>InitializationException</code></td>
              <td>The <code>EdgeVeda</code> instance is already initialized, or native initialization fails for an unknown or wrapped reason.</td>
              <td>Call <code>dispose()</code> before reinitializing; log the details and show a recovery message.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>The model file does not exist at <code>config.modelPath</code> or cannot be loaded by the native runtime.</td>
              <td>Verify the path with <code>ModelManager</code>, re-download/import the model, or choose a compatible model.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>The configuration is invalid.</td>
              <td>Check context length, memory budget, thread count, and GPU settings.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Model load exceeds the configured or practical memory budget.</td>
              <td>Reduce <code>contextLength</code>, choose a smaller model, or disable expensive options.</td>
            </tr>
            <tr>
              <td><code>EdgeVedaException</code></td>
              <td>A typed SDK exception is rethrown from validation or native load testing.</td>
              <td>Handle by exception type where possible.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<EdgeVeda> createRuntime(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      numThreads: 4,
      useGpu: true,
      maxMemoryMb: 1536,
    ));

    return edgeVeda;
  } on ModelLoadException catch (error) {
    throw Exception('The local model could not be loaded: \${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Not applicable. <code>init()</code> does not emit a stream. Use <code>generateStream()</code> after successful initialization.</p>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>init()</code> is the entry point for the core text/embedding runtime.</li>
        <li>The method validates the model file path before native initialization.</li>
        <li>The source implementation performs a background-isolate load test and frees the test context after validation.</li>
        <li>After <code>init()</code> completes, subsequent text generation can reuse a persistent streaming worker.</li>
        <li>Calling <code>init()</code> twice on the same instance without <code>dispose()</code> is an error.</li>
        <li>Vision and image generation have separate initialization paths.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Model size</td>
              <td>Larger models increase load time, RAM usage, and storage requirements.</td>
              <td>Start with a small recommended chat model such as a 1B-class GGUF model for first integration.</td>
            </tr>
            <tr>
              <td>Context length</td>
              <td>Higher context lengths increase KV-cache memory.</td>
              <td>Use <code>2048</code> as a practical default; reduce on lower-memory devices.</td>
            </tr>
            <tr>
              <td>GPU / Metal usage</td>
              <td>GPU acceleration improves throughput on supported Apple devices but must be validated per platform.</td>
              <td>Keep <code>useGpu: true</code> on validated iOS/macOS targets; test simulator and Android separately.</td>
            </tr>
            <tr>
              <td>Memory budget</td>
              <td>Too high may risk OS termination; too low may block model loading.</td>
              <td>Keep <code>maxMemoryMb</code> conservative and validate on physical devices.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF LLM models</td>
              <td>Yes</td>
              <td>Used for text generation and embeddings. Model must be compatible with the native backend.</td>
            </tr>
            <tr>
              <td>Whisper GGUF models</td>
              <td>No for <code>init()</code></td>
              <td>Use Whisper-specific worker/session APIs.</td>
            </tr>
            <tr>
              <td>Stable Diffusion models</td>
              <td>No for <code>init()</code></td>
              <td>Use image generation initialization APIs.</td>
            </tr>
            <tr>
              <td>Vision-language models</td>
              <td>No for <code>init()</code></td>
              <td>Use <code>initVision()</code> / vision worker APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Metal GPU path is the primary validated target.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior may be slower and not representative.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate app sandbox and model file paths.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Treat as scaffolded until validated on target devices.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime and model loading are not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: local model file path and runtime configuration.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: model files.</li>
        <li>Sensitive data considerations: avoid logging full local paths if they may expose user-specific directory names or project data.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>ModelLoadException: Model file not found</code></td>
              <td><code>modelPath</code> points to a missing, moved, or not-yet-downloaded file.</td>
              <td>Resolve the path with <code>ModelManager</code> and check the file before calling <code>init()</code>.</td>
            </tr>
            <tr>
              <td>Initialization is slow on first run</td>
              <td>The model is being validated by the native runtime.</td>
              <td>Show a loading state and test on a physical device in release/profile mode.</td>
            </tr>
            <tr>
              <td>Out-of-memory or OS termination</td>
              <td>Model/context is too large for the device.</td>
              <td>Use a smaller model or lower <code>contextLength</code> and <code>maxMemoryMb</code>.</td>
            </tr>
            <tr>
              <td>Reinitialization fails</td>
              <td><code>init()</code> was called twice on the same instance.</td>
              <td>Call <code>await edgeVeda.dispose()</code> before reinitializing.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li>[<code>EdgeVeda.generate()</code>](./generate.md) — returns a complete text generation response after initialization.</li>
        <li>[<code>EdgeVeda.generateStream()</code>](./generate-stream.md) — streams generated tokens after initialization.</li>
        <li>[<code>EdgeVeda.dispose()</code>](./dispose.md) — releases runtime resources before reinitialization.</li>
        <li>[<code>ModelManager.downloadModel()</code>](../model-management/download-model.md) — obtains model files before initialization.</li>
      </ul>
    </>
  );
}

function EdgevedaInitUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>init()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Runtime initialization</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future&lt;void&gt; init(EdgeVedaConfig config);`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>init()</code> зберігає <code>EdgeVedaConfig</code> для SDK-інстансу та перевіряє, що модель із <code>config.modelPath</code> можна завантажити. Метод не генерує текст і не створює embeddings. Він валідовує конфігурацію, перевіряє наявність model file і запускає background-isolate load test проти native runtime.</p>
      <p>Метод повертає <code>Future&lt;void&gt;</code> і завершується, коли SDK-інстанс готовий до наступних викликів: <code>generate()</code>, <code>generateStream()</code> та <code>embed()</code>.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>init()</code>, коли потрібно:</p>
      <ul>
        <li>підготувати <code>EdgeVeda</code> instance для text generation або embeddings;</li>
        <li>перевірити, що downloaded/imported GGUF model file може бути завантажений;</li>
        <li>застосувати runtime settings: context length, thread count, GPU usage, KV-cache configuration.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>інстанс уже ініціалізований; спочатку викличте <code>dispose()</code>, якщо треба переініціалізувати з іншою моделлю або конфігурацією;</li>
        <li>потрібно лише завантажити або імпортувати модель; для цього використовуйте <code>ModelManager</code>;</li>
        <li>потрібно ініціалізувати vision або image generation models — для них є окремі API.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li>compatible model file існує за шляхом <code>config.modelPath</code>;</li>
        <li>застосунок має право читати model file з локального сховища;</li>
        <li>вибрана модель поміщається в memory budget цільового пристрою;</li>
        <li>застосунок вибирає реалістичний <code>contextLength</code> для цільового пристрою;</li>
        <li>GPU/Metal usage увімкнено лише там, де це підтримано й перевірено;</li>
        <li>застосунок обробляє model-load і memory-related failures.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>config</code></td>
              <td><code>EdgeVedaConfig</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Runtime configuration для ініціалізації SDK instance.</td>
              <td>Має містити валідний <code>modelPath</code>. Інші поля керують threads, context length, GPU usage, memory budget, flash attention та KV-cache quantization.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3><code>EdgeVedaConfig</code> fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>modelPath</code></td>
              <td><code>String</code></td>
              <td>Required</td>
              <td>Шлях до локального GGUF model file.</td>
              <td>Файл має існувати до виклику <code>init()</code>.</td>
            </tr>
            <tr>
              <td><code>numThreads</code></td>
              <td><code>int</code></td>
              <td><code>4</code></td>
              <td>Кількість CPU threads для inference.</td>
              <td>Налаштовуйте під device class.</td>
            </tr>
            <tr>
              <td><code>contextLength</code></td>
              <td><code>int</code></td>
              <td><code>2048</code></td>
              <td>Максимальна довжина контексту в токенах.</td>
              <td>Більші значення збільшують memory usage.</td>
            </tr>
            <tr>
              <td><code>useGpu</code></td>
              <td><code>bool</code></td>
              <td><code>true</code></td>
              <td>Увімкнення GPU acceleration там, де підтримано.</td>
              <td>На iOS/macOS це зазвичай Metal.</td>
            </tr>
            <tr>
              <td><code>maxMemoryMb</code></td>
              <td><code>int</code></td>
              <td><code>1536</code></td>
              <td>Memory budget у MB.</td>
              <td>На 4 GB devices використовуйте консервативні значення.</td>
            </tr>
            <tr>
              <td><code>verbose</code></td>
              <td><code>bool</code></td>
              <td><code>false</code></td>
              <td>Увімкнення verbose logging.</td>
              <td>Корисно під час integration/debugging.</td>
            </tr>
            <tr>
              <td><code>flashAttn</code></td>
              <td><code>int</code></td>
              <td><code>-1</code></td>
              <td>Flash attention mode.</td>
              <td><code>-1</code> означає auto.</td>
            </tr>
            <tr>
              <td><code>kvCacheTypeK</code></td>
              <td><code>int</code></td>
              <td><code>8</code></td>
              <td>KV-cache quantization type for keys.</td>
              <td><code>1 = F16</code>, <code>8 = Q8_0</code>.</td>
            </tr>
            <tr>
              <td><code>kvCacheTypeV</code></td>
              <td><code>int</code></td>
              <td><code>8</code></td>
              <td>KV-cache quantization type for values.</td>
              <td><code>1 = F16</code>, <code>8 = Q8_0</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Future&lt;void&gt;</code></p>
      <p>Future завершується, коли SDK валідовує конфігурацію і підтверджує, що модель можна завантажити. Метод не повертає runtime handle, generated text, embeddings або model metadata.</p>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>InitializationException</code></td>
              <td><code>EdgeVeda</code> instance уже ініціалізований або native initialization завершується невідомою/обгорнутою помилкою.</td>
              <td>Викличте <code>dispose()</code> перед reinitialize; залогуйте details і покажіть recovery message.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>Model file не існує за <code>config.modelPath</code> або native runtime не може її завантажити.</td>
              <td>Перевірте шлях через <code>ModelManager</code>, re-download/import модель або виберіть compatible model.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>Конфігурація невалідна.</td>
              <td>Перевірте context length, memory budget, thread count і GPU settings.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Model load перевищує memory budget.</td>
              <td>Зменште <code>contextLength</code>, виберіть меншу модель або вимкніть дорогі опції.</td>
            </tr>
            <tr>
              <td><code>EdgeVedaException</code></td>
              <td>Typed SDK exception повертається з validation або native load testing.</td>
              <td>Обробляйте за конкретним exception type, якщо можливо.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  numThreads: 4,
  useGpu: true,
));`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<EdgeVeda> createRuntime(String modelPath) async {
  final edgeVeda = EdgeVeda();

  try {
    await edgeVeda.init(EdgeVedaConfig(
      modelPath: modelPath,
      contextLength: 2048,
      numThreads: 4,
      useGpu: true,
      maxMemoryMb: 1536,
    ));

    return edgeVeda;
  } on ModelLoadException catch (error) {
    throw Exception('The local model could not be loaded: \${error.message}');
  } on InitializationException catch (error) {
    throw Exception('Edge Veda initialization failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Не застосовується. <code>init()</code> не повертає stream. Після успішної ініціалізації використовуйте <code>generateStream()</code>.</p>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>init()</code> — entry point для core text/embedding runtime.</li>
        <li>Метод перевіряє model file path перед native initialization.</li>
        <li>Source implementation виконує background-isolate load test і звільняє test context після validation.</li>
        <li>Після завершення <code>init()</code> наступні text generation calls можуть використовувати persistent streaming worker.</li>
        <li>Повторний виклик <code>init()</code> на тому самому інстансі без <code>dispose()</code> — помилка.</li>
        <li>Vision і image generation мають окремі initialization paths.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Model size</td>
              <td>Більші моделі збільшують load time, RAM usage і storage requirements.</td>
              <td>Починайте з невеликої recommended chat model, наприклад 1B-class GGUF.</td>
            </tr>
            <tr>
              <td>Context length</td>
              <td>Більші context lengths збільшують KV-cache memory.</td>
              <td>Використовуйте <code>2048</code> як практичний default; зменшуйте для low-memory devices.</td>
            </tr>
            <tr>
              <td>GPU / Metal usage</td>
              <td>GPU acceleration покращує throughput на supported Apple devices.</td>
              <td>Залишайте <code>useGpu: true</code> на validated iOS/macOS targets; simulator і Android тестуйте окремо.</td>
            </tr>
            <tr>
              <td>Memory budget</td>
              <td>Завелике значення може ризикувати OS termination; замале — блокувати model loading.</td>
              <td>Тримайте <code>maxMemoryMb</code> консервативним і перевіряйте на physical devices.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF LLM models</td>
              <td>Yes</td>
              <td>Для text generation та embeddings. Модель має бути compatible з native backend.</td>
            </tr>
            <tr>
              <td>Whisper GGUF models</td>
              <td>No for <code>init()</code></td>
              <td>Використовуйте Whisper-specific worker/session APIs.</td>
            </tr>
            <tr>
              <td>Stable Diffusion models</td>
              <td>No for <code>init()</code></td>
              <td>Використовуйте image generation initialization APIs.</td>
            </tr>
            <tr>
              <td>Vision-language models</td>
              <td>No for <code>init()</code></td>
              <td>Використовуйте <code>initVision()</code> / vision worker APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Metal GPU path — основний validated target.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior може бути повільним і нерепрезентативним.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте app sandbox і model file paths.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Вважайте scaffolded до перевірки на target devices.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime і model loading не орієнтовані на web.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: local model file path і runtime configuration.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: model files.</li>
        <li>Sensitive data considerations: не логуйте повні локальні шляхи, якщо вони можуть розкривати user-specific directories або project data.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>ModelLoadException: Model file not found</code></td>
              <td><code>modelPath</code> вказує на missing/moved/not-yet-downloaded file.</td>
              <td>Отримайте шлях через <code>ModelManager</code> і перевірте файл перед <code>init()</code>.</td>
            </tr>
            <tr>
              <td>Initialization повільна на першому запуску</td>
              <td>Модель перевіряється native runtime.</td>
              <td>Покажіть loading state і тестуйте на physical device у release/profile mode.</td>
            </tr>
            <tr>
              <td>Out-of-memory або OS termination</td>
              <td>Model/context завеликий для пристрою.</td>
              <td>Використайте меншу модель або зменште <code>contextLength</code> і <code>maxMemoryMb</code>.</td>
            </tr>
            <tr>
              <td>Reinitialization fails</td>
              <td><code>init()</code> викликано двічі на тому самому instance.</td>
              <td>Викличте <code>await edgeVeda.dispose()</code> перед reinitialize.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li>[<code>EdgeVeda.generate()</code>](./generate.md) — повертає complete text generation response після initialization.</li>
        <li>[<code>EdgeVeda.generateStream()</code>](./generate-stream.md) — стрімить generated tokens після initialization.</li>
        <li>[<code>EdgeVeda.dispose()</code>](./dispose.md) — звільняє runtime resources перед reinitialization.</li>
        <li>[<code>ModelManager.downloadModel()</code>](../model-management/download-model.md) — отримує model files до initialization.</li>
      </ul>
    </>
  );
}

function EdgevedaGenerateEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>generate()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Text generation</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No; use <code>generateStream()</code> for token streaming</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>generate()</code> sends a prompt to the local model and returns a complete <code>GenerateResponse</code>. Internally, it routes through the same persistent <code>StreamingWorker</code> used by <code>generateStream()</code>, collects emitted tokens into a buffer, and returns the final text with generation metadata.</p>
      <p>The method is asynchronous and performs inference on device. It does not require a network call.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>generate()</code> when you need to:</p>
      <ul>
        <li>produce a complete answer before updating the UI;</li>
        <li>run short assistant, summarization, classification, or transformation tasks;</li>
        <li>apply a timeout to a blocking generation request;</li>
        <li>avoid manual stream handling in simple application flows.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>you need token-by-token rendering in a chat UI; use <code>generateStream()</code>;</li>
        <li>another stream is already active on the same <code>EdgeVeda</code> instance;</li>
        <li>you need multi-turn conversation state; consider <code>ChatSession</code>;</li>
        <li>you need structured tool-calling loops; consider <code>ChatSession.sendWithTools()</code>.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> has completed successfully;</li>
        <li>the prompt is not empty;</li>
        <li>the selected model is appropriate for the prompt style and expected output;</li>
        <li><code>GenerateOptions</code> values are within supported ranges;</li>
        <li>the app can handle latency for a full response, especially for large <code>maxTokens</code>;</li>
        <li>no streaming operation is already active on the same runtime instance.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Input text passed to the local model.</td>
              <td>Must not be empty. Keep prompts within the configured context length.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions()</code></td>
              <td>Controls sampling, token limit, system prompt, JSON/grammar behavior, and confidence tracking.</td>
              <td>Invalid values can throw <code>ConfigurationException</code>.</td>
            </tr>
            <tr>
              <td><code>timeout</code></td>
              <td><code>Duration?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional maximum duration for the complete generation call.</td>
              <td>If exceeded, the method throws <code>GenerationException</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Common <code>GenerateOptions</code> fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>systemPrompt</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional system-level instruction.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td><code>int</code></td>
              <td><code>512</code></td>
              <td>Maximum number of tokens to generate.</td>
            </tr>
            <tr>
              <td><code>temperature</code></td>
              <td><code>double</code></td>
              <td><code>0.7</code></td>
              <td>Sampling randomness. Lower is more deterministic.</td>
            </tr>
            <tr>
              <td><code>topP</code></td>
              <td><code>double</code></td>
              <td><code>0.9</code></td>
              <td>Nucleus sampling threshold.</td>
            </tr>
            <tr>
              <td><code>topK</code></td>
              <td><code>int</code></td>
              <td><code>40</code></td>
              <td>Limits sampling to the top K candidate tokens.</td>
            </tr>
            <tr>
              <td><code>repeatPenalty</code></td>
              <td><code>double</code></td>
              <td><code>1.1</code></td>
              <td>Discourages repeated output.</td>
            </tr>
            <tr>
              <td><code>stopSequences</code></td>
              <td><code>List&lt;String&gt;</code></td>
              <td><code>[]</code></td>
              <td>Stop sequences for early termination.</td>
            </tr>
            <tr>
              <td><code>jsonMode</code></td>
              <td><code>bool</code></td>
              <td><code>false</code></td>
              <td>Requests valid JSON output.</td>
            </tr>
            <tr>
              <td><code>grammarStr</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional GBNF grammar for constrained decoding.</td>
            </tr>
            <tr>
              <td><code>grammarRoot</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional root rule for the grammar.</td>
            </tr>
            <tr>
              <td><code>confidenceThreshold</code></td>
              <td><code>double</code></td>
              <td><code>0.0</code></td>
              <td>Enables confidence tracking and cloud-handoff signaling when greater than zero.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Future&lt;GenerateResponse&gt;</code></p>
      <p>A future that resolves to the complete generated response.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>text</code></td>
              <td><code>String</code></td>
              <td>Complete generated text content.</td>
            </tr>
            <tr>
              <td><code>promptTokens</code></td>
              <td><code>int</code></td>
              <td>Number of prompt tokens reported by the response.</td>
            </tr>
            <tr>
              <td><code>completionTokens</code></td>
              <td><code>int</code></td>
              <td>Number of generated tokens collected from the stream.</td>
            </tr>
            <tr>
              <td><code>latencyMs</code></td>
              <td><code>int?</code></td>
              <td>Total generation duration in milliseconds.</td>
            </tr>
            <tr>
              <td><code>avgConfidence</code></td>
              <td><code>double?</code></td>
              <td>Average confidence across generated tokens when confidence tracking is enabled.</td>
            </tr>
            <tr>
              <td><code>needsCloudHandoff</code></td>
              <td><code>bool</code></td>
              <td>Whether the model signaled that cloud handoff may be needed.</td>
            </tr>
            <tr>
              <td><code>tokensPerSecond</code></td>
              <td><code>double?</code></td>
              <td>Derived throughput when latency and token counts are available.</td>
            </tr>
            <tr>
              <td><code>totalTokens</code></td>
              <td><code>int</code></td>
              <td>Prompt and completion tokens combined.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>GenerationException</code></td>
              <td>Prompt is empty, generation times out, the worker fails, or a streaming conflict occurs.</td>
              <td>Validate input, avoid concurrent streams, retry with lower <code>maxTokens</code>, or show a user-facing failure state.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>One or more <code>GenerateOptions</code> values are outside allowed ranges.</td>
              <td>Clamp UI controls and validate options before calling the method.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime is not initialized or another SDK-level failure occurs.</td>
              <td>Call <code>init()</code> first and handle typed exceptions.</td>
            </tr>
            <tr>
              <td>Stream-propagated errors</td>
              <td>Since <code>generate()</code> consumes <code>generateStream()</code>, stream errors can surface as generation failures.</td>
              <td>Log the underlying details and recover at the application level.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\\n\\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Not applicable. <code>generate()</code> returns a complete response. For streaming, use:</p>
      <pre className="code-block"><code>{`await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}`}</code></pre>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>generate()</code> requires a successfully initialized <code>EdgeVeda</code> instance.</li>
        <li>The method validates that <code>prompt</code> is not empty.</li>
        <li>The method uses <code>generateStream()</code> internally and buffers all non-final token chunks.</li>
        <li>The final response includes measured latency and completion token count.</li>
        <li>Because it depends on <code>generateStream()</code>, only one active streaming operation should run per <code>EdgeVeda</code> instance.</li>
        <li>Confidence and cloud-handoff metadata depend on the selected <code>GenerateOptions</code>.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Higher values increase latency and battery use.</td>
              <td>Set the lowest acceptable value for the task.</td>
            </tr>
            <tr>
              <td>Model size</td>
              <td>Larger models may improve quality but increase memory and latency.</td>
              <td>Use Model Advisor or device-specific defaults.</td>
            </tr>
            <tr>
              <td>Context length</td>
              <td>Longer prompts consume context and can increase compute time.</td>
              <td>Keep prompts concise and summarize long context.</td>
            </tr>
            <tr>
              <td>GPU / Metal usage</td>
              <td>Improves throughput on supported Apple devices.</td>
              <td>Test on physical devices in release/profile mode.</td>
            </tr>
            <tr>
              <td>Timeout</td>
              <td>Prevents long blocking calls.</td>
              <td>Use <code>timeout</code> for user-facing interactions.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Yes</td>
              <td>Best suited for natural language responses.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No for text generation</td>
              <td>Use <code>embed()</code> for embeddings.</td>
            </tr>
            <tr>
              <td>Tool-calling model</td>
              <td>Partial</td>
              <td>Use <code>ChatSession.sendWithTools()</code> for multi-round tool execution.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No for this method</td>
              <td>Use vision APIs for image inputs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target for sustained on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior may be much slower.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate model paths and sandbox access.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Validate on target hardware before publishing performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency is not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: prompt text and generation options.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file and runtime cache/state.</li>
        <li>Sensitive data considerations: avoid logging user prompts or full generated outputs if they may contain private data.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Prompt cannot be empty</code></td>
              <td>Empty or whitespace-only prompt passed to the method.</td>
              <td>Validate the prompt before calling <code>generate()</code>.</td>
            </tr>
            <tr>
              <td>Generation times out</td>
              <td>Large prompt, high <code>maxTokens</code>, slow device, or thermal pressure.</td>
              <td>Reduce <code>maxTokens</code>, simplify the prompt, use streaming, or increase timeout.</td>
            </tr>
            <tr>
              <td>Repeated or low-quality output</td>
              <td>Wrong chat template/model or too-high sampling randomness.</td>
              <td>Use <code>ChatSession</code> with the correct template or lower <code>temperature</code>.</td>
            </tr>
            <tr>
              <td>Worker error</td>
              <td>The persistent streaming worker failed to spawn or load the model.</td>
              <td>Reinitialize the runtime or restart the app-level session.</td>
            </tr>
            <tr>
              <td>UI appears frozen</td>
              <td>The app waits for full response before updating UI.</td>
              <td>Use <code>generateStream()</code> for progressive rendering.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li>[<code>EdgeVeda.init()</code>](./init.md) — initializes the runtime before generation.</li>
        <li>[<code>EdgeVeda.generateStream()</code>](./generate-stream.md) — streams tokens for progressive UI.</li>
        <li>[<code>ChatSession.sendStream()</code>](../chat-session/send-stream.md) — handles multi-turn chat state.</li>
        <li>[<code>ChatSession.sendWithTools()</code>](../chat-session/send-with-tools.md) — handles tool-calling workflows.</li>
      </ul>
    </>
  );
}

function EdgevedaGenerateUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>generate()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Text generation</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No; для token streaming використовуйте <code>generateStream()</code></td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<GenerateResponse> generate(
  String prompt, {
  GenerateOptions? options,
  Duration? timeout,
});`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>generate()</code> передає prompt локальній моделі та повертає повний <code>GenerateResponse</code>. Усередині метод іде через той самий persistent <code>StreamingWorker</code>, що й <code>generateStream()</code>, збирає emitted tokens у buffer і повертає final text з generation metadata.</p>
      <p>Метод асинхронний і виконує inference on device. Network call не потрібен.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>generate()</code>, коли потрібно:</p>
      <ul>
        <li>отримати повну відповідь перед оновленням UI;</li>
        <li>виконати короткі assistant, summarization, classification або transformation tasks;</li>
        <li>застосувати timeout до blocking generation request;</li>
        <li>уникнути ручної обробки stream у простих flows.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>потрібен token-by-token rendering у chat UI; використовуйте <code>generateStream()</code>;</li>
        <li>інший stream уже active на тому самому <code>EdgeVeda</code> instance;</li>
        <li>потрібна multi-turn conversation state; розгляньте <code>ChatSession</code>;</li>
        <li>потрібні structured tool-calling loops; розгляньте <code>ChatSession.sendWithTools()</code>.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> успішно завершився;</li>
        <li>prompt не порожній;</li>
        <li>вибрана модель підходить для prompt style і expected output;</li>
        <li><code>GenerateOptions</code> values у supported ranges;</li>
        <li>застосунок може обробити latency до повної відповіді, особливо для великого <code>maxTokens</code>;</li>
        <li>на цьому runtime instance немає active streaming operation.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Input text для локальної моделі.</td>
              <td>Не має бути empty. Тримайте prompt у межах configured context length.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions()</code></td>
              <td>Керує sampling, token limit, system prompt, JSON/grammar behavior і confidence tracking.</td>
              <td>Невалідні значення можуть кинути <code>ConfigurationException</code>.</td>
            </tr>
            <tr>
              <td><code>timeout</code></td>
              <td><code>Duration?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional maximum duration для complete generation call.</td>
              <td>Якщо перевищено, метод кидає <code>GenerationException</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Common <code>GenerateOptions</code> fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>systemPrompt</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional system-level instruction.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td><code>int</code></td>
              <td><code>512</code></td>
              <td>Максимальна кількість generated tokens.</td>
            </tr>
            <tr>
              <td><code>temperature</code></td>
              <td><code>double</code></td>
              <td><code>0.7</code></td>
              <td>Sampling randomness. Нижче значення — більш deterministic output.</td>
            </tr>
            <tr>
              <td><code>topP</code></td>
              <td><code>double</code></td>
              <td><code>0.9</code></td>
              <td>Nucleus sampling threshold.</td>
            </tr>
            <tr>
              <td><code>topK</code></td>
              <td><code>int</code></td>
              <td><code>40</code></td>
              <td>Обмежує sampling топ-K кандидатами.</td>
            </tr>
            <tr>
              <td><code>repeatPenalty</code></td>
              <td><code>double</code></td>
              <td><code>1.1</code></td>
              <td>Зменшує повтори в output.</td>
            </tr>
            <tr>
              <td><code>stopSequences</code></td>
              <td><code>List&lt;String&gt;</code></td>
              <td><code>[]</code></td>
              <td>Stop sequences для early termination.</td>
            </tr>
            <tr>
              <td><code>jsonMode</code></td>
              <td><code>bool</code></td>
              <td><code>false</code></td>
              <td>Запитує valid JSON output.</td>
            </tr>
            <tr>
              <td><code>grammarStr</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional GBNF grammar для constrained decoding.</td>
            </tr>
            <tr>
              <td><code>grammarRoot</code></td>
              <td><code>String?</code></td>
              <td><code>null</code></td>
              <td>Optional root rule для grammar.</td>
            </tr>
            <tr>
              <td><code>confidenceThreshold</code></td>
              <td><code>double</code></td>
              <td><code>0.0</code></td>
              <td>Вмикає confidence tracking і cloud-handoff signaling, якщо більше нуля.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Future&lt;GenerateResponse&gt;</code></p>
      <p>Future повертає complete generated response.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>text</code></td>
              <td><code>String</code></td>
              <td>Повний generated text content.</td>
            </tr>
            <tr>
              <td><code>promptTokens</code></td>
              <td><code>int</code></td>
              <td>Кількість prompt tokens, reported by response.</td>
            </tr>
            <tr>
              <td><code>completionTokens</code></td>
              <td><code>int</code></td>
              <td>Кількість generated tokens, collected from stream.</td>
            </tr>
            <tr>
              <td><code>latencyMs</code></td>
              <td><code>int?</code></td>
              <td>Total generation duration у milliseconds.</td>
            </tr>
            <tr>
              <td><code>avgConfidence</code></td>
              <td><code>double?</code></td>
              <td>Average confidence across generated tokens, якщо confidence tracking enabled.</td>
            </tr>
            <tr>
              <td><code>needsCloudHandoff</code></td>
              <td><code>bool</code></td>
              <td>Чи модель сигналізує, що може бути потрібен cloud handoff.</td>
            </tr>
            <tr>
              <td><code>tokensPerSecond</code></td>
              <td><code>double?</code></td>
              <td>Derived throughput, якщо доступні latency і token counts.</td>
            </tr>
            <tr>
              <td><code>totalTokens</code></td>
              <td><code>int</code></td>
              <td>Prompt і completion tokens разом.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>GenerationException</code></td>
              <td>Prompt empty, generation timeout, worker failure або streaming conflict.</td>
              <td>Валідуйте input, уникайте concurrent streams, retry with lower <code>maxTokens</code>, або покажіть failure state.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>Одне або кілька <code>GenerateOptions</code> значень за межами allowed ranges.</td>
              <td>Обмежте UI controls і валідуйте options перед викликом.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime не ініціалізований або сталася SDK-level failure.</td>
              <td>Спочатку викличте <code>init()</code> і обробіть typed exceptions.</td>
            </tr>
            <tr>
              <td>Stream-propagated errors</td>
              <td>Оскільки <code>generate()</code> споживає <code>generateStream()</code>, stream errors можуть проявлятися як generation failures.</td>
              <td>Логуйте underlying details і відновлюйтесь на application level.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

final response = await edgeVeda.generate(
  'Explain on-device AI in two sentences.',
);

print(response.text);`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> summarizeNote(EdgeVeda edgeVeda, String note) async {
  if (note.trim().isEmpty) {
    throw ArgumentError('note must not be empty');
  }

  try {
    final response = await edgeVeda.generate(
      'Summarize this note for a product manager:\\n\\n$note',
      options: const GenerateOptions(
        maxTokens: 180,
        temperature: 0.3,
        topP: 0.9,
      ),
      timeout: const Duration(seconds: 30),
    );

    return response.text.trim();
  } on GenerationException catch (error) {
    throw Exception('Text generation failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Не застосовується. <code>generate()</code> повертає complete response. Для streaming використовуйте:</p>
      <pre className="code-block"><code>{`await for (final chunk in edgeVeda.generateStream('Tell me a short story')) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}`}</code></pre>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>generate()</code> потребує успішно ініціалізований <code>EdgeVeda</code> instance.</li>
        <li>Метод перевіряє, що <code>prompt</code> не порожній.</li>
        <li>Метод internally використовує <code>generateStream()</code> і буферизує всі non-final token chunks.</li>
        <li>Final response включає measured latency і completion token count.</li>
        <li>Оскільки метод залежить від <code>generateStream()</code>, на одному <code>EdgeVeda</code> instance має бути лише одна active streaming operation.</li>
        <li>Confidence і cloud-handoff metadata залежать від selected <code>GenerateOptions</code>.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Більші значення збільшують latency і battery use.</td>
              <td>Задавайте найменше acceptable value для task.</td>
            </tr>
            <tr>
              <td>Model size</td>
              <td>Більші моделі можуть покращити якість, але збільшують memory і latency.</td>
              <td>Використовуйте Model Advisor або device-specific defaults.</td>
            </tr>
            <tr>
              <td>Context length</td>
              <td>Довші prompts витрачають context і можуть збільшити compute time.</td>
              <td>Тримайте prompts concise і summarize long context.</td>
            </tr>
            <tr>
              <td>GPU / Metal usage</td>
              <td>Покращує throughput на supported Apple devices.</td>
              <td>Тестуйте на physical devices у release/profile mode.</td>
            </tr>
            <tr>
              <td>Timeout</td>
              <td>Запобігає довгим blocking calls.</td>
              <td>Використовуйте <code>timeout</code> для user-facing interactions.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Yes</td>
              <td>Основний сценарій — natural language responses.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No for text generation</td>
              <td>Для embeddings використовуйте <code>embed()</code>.</td>
            </tr>
            <tr>
              <td>Tool-calling model</td>
              <td>Partial</td>
              <td>Для multi-round tool execution використовуйте <code>ChatSession.sendWithTools()</code>.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No for this method</td>
              <td>Для image inputs використовуйте vision APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target для sustained on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior може бути значно повільнішим.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте model paths і sandbox access.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Валідуйте на target hardware перед performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency не орієнтована на web.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: prompt text і generation options.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file і runtime cache/state.</li>
        <li>Sensitive data considerations: не логуйте user prompts або full generated outputs, якщо вони можуть містити private data.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Prompt cannot be empty</code></td>
              <td>Empty або whitespace-only prompt.</td>
              <td>Валідуйте prompt перед <code>generate()</code>.</td>
            </tr>
            <tr>
              <td>Generation times out</td>
              <td>Large prompt, high <code>maxTokens</code>, slow device або thermal pressure.</td>
              <td>Зменште <code>maxTokens</code>, спростіть prompt, використайте streaming або збільште timeout.</td>
            </tr>
            <tr>
              <td>Repeated або low-quality output</td>
              <td>Неправильний chat template/model або зависока sampling randomness.</td>
              <td>Використайте <code>ChatSession</code> з correct template або зменште <code>temperature</code>.</td>
            </tr>
            <tr>
              <td>Worker error</td>
              <td>Persistent streaming worker не зміг spawn/load model.</td>
              <td>Reinitialize runtime або restart app-level session.</td>
            </tr>
            <tr>
              <td>UI appears frozen</td>
              <td>App чекає full response перед UI update.</td>
              <td>Використайте <code>generateStream()</code> для progressive rendering.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li>[<code>EdgeVeda.init()</code>](./init.md) — ініціалізує runtime перед generation.</li>
        <li>[<code>EdgeVeda.generateStream()</code>](./generate-stream.md) — стрімить tokens для progressive UI.</li>
        <li>[<code>ChatSession.sendStream()</code>](../chat-session/send-stream.md) — працює з multi-turn chat state.</li>
        <li>[<code>ChatSession.sendWithTools()</code>](../chat-session/send-with-tools.md) — працює з tool-calling workflows.</li>
      </ul>
    </>
  );
}

function EdgevedaGenerateStreamEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>generateStream()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Streaming text generation</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>generateStream()</code> sends a prompt to the local model and returns a Dart <code>Stream&lt;TokenChunk&gt;</code>. The stream yields token chunks as they are generated. The final chunk has <code>isFinal == true</code> and an empty token to signal completion.</p>
      <p>The method uses a persistent <code>StreamingWorker</code>. If the worker is not active, the method spawns it and loads the configured model. If the worker is already active, it reuses it.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>generateStream()</code> when you need to:</p>
      <ul>
        <li>update a chat or assistant UI token by token;</li>
        <li>allow the user to cancel generation mid-stream;</li>
        <li>process generated output incrementally;</li>
        <li>track per-token confidence or cloud-handoff signals.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>you only need the final text and simpler code; use <code>generate()</code>;</li>
        <li>another stream is already active on the same <code>EdgeVeda</code> instance;</li>
        <li>the runtime has not been initialized with <code>init()</code>;</li>
        <li>you need model-level multi-turn memory; use <code>ChatSession</code>.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> has completed successfully;</li>
        <li>the prompt is not empty;</li>
        <li>no other <code>generateStream()</code> call is active on the same <code>EdgeVeda</code> instance;</li>
        <li><code>GenerateOptions</code> values are valid;</li>
        <li>the app is ready to handle stream errors;</li>
        <li>the UI handles final chunks and cancellation correctly.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Input text passed to the local model.</td>
              <td>Must not be empty.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions()</code></td>
              <td>Controls token limit, sampling, grammar constraints, JSON mode, and confidence tracking.</td>
              <td>Values are validated before streaming starts.</td>
            </tr>
            <tr>
              <td><code>cancelToken</code></td>
              <td><code>CancelToken?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional cancellation token for stopping generation mid-stream.</td>
              <td>Calling <code>cancel()</code> stops token generation as soon as the worker observes cancellation.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Stream&lt;TokenChunk&gt;</code></p>
      <p>A stream that emits token chunks until the final chunk is produced, cancellation happens, or an error is thrown.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>token</code></td>
              <td><code>String</code></td>
              <td>Token text content for this chunk. The final chunk usually has an empty token.</td>
            </tr>
            <tr>
              <td><code>index</code></td>
              <td><code>int</code></td>
              <td>Token index in the generated sequence.</td>
            </tr>
            <tr>
              <td><code>isFinal</code></td>
              <td><code>bool</code></td>
              <td><code>true</code> when the stream has completed.</td>
            </tr>
            <tr>
              <td><code>confidence</code></td>
              <td><code>double?</code></td>
              <td>Per-token confidence score when confidence tracking is enabled.</td>
            </tr>
            <tr>
              <td><code>needsCloudHandoff</code></td>
              <td><code>bool</code></td>
              <td>Whether cloud handoff is recommended at this point.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>GenerationException</code></td>
              <td>Prompt is empty, streaming is already active, worker spawn fails, worker init fails, or streaming fails.</td>
              <td>Validate input, serialize generation calls, retry after cancellation, or reinitialize the runtime.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>Invalid <code>GenerateOptions</code> values are passed.</td>
              <td>Clamp values in the UI and validate options before starting the stream.</td>
            </tr>
            <tr>
              <td>Stream errors</td>
              <td>Runtime failures are propagated through the stream.</td>
              <td>Wrap <code>await for</code> in <code>try/catch</code> and update the UI state on failure.</td>
            </tr>
            <tr>
              <td>Cancellation state</td>
              <td>User cancels generation through <code>CancelToken</code>.</td>
              <td>Treat cancellation as a normal user action; preserve partial output if useful.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example with cancellation</h3>
      <pre className="code-block"><code>{`final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}`}</code></pre>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>generateStream()</code> requires a successfully initialized <code>EdgeVeda</code> instance.</li>
        <li>Only one streaming operation can be active at a time on the same instance.</li>
        <li>The method lazily creates and initializes a persistent <code>StreamingWorker</code> if needed.</li>
        <li>The worker uses the <code>EdgeVedaConfig</code> captured during <code>init()</code>.</li>
        <li>The method emits <code>TokenChunk</code> objects and uses a final chunk with <code>isFinal == true</code>.</li>
        <li>Runtime errors are propagated as stream errors.</li>
        <li>Cancellation removes the cancellation listener in the <code>finally</code> path.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>First stream after init</td>
              <td>May include worker spawn and model load time.</td>
              <td>Show a "loading model" or "starting" state.</td>
            </tr>
            <tr>
              <td>Subsequent streams</td>
              <td>Can reuse the active worker.</td>
              <td>Keep the runtime alive for multi-request sessions.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Directly affects duration and energy use.</td>
              <td>Set task-specific limits.</td>
            </tr>
            <tr>
              <td>UI update frequency</td>
              <td>Updating UI on every token can be expensive.</td>
              <td>Batch UI updates if rendering becomes costly.</td>
            </tr>
            <tr>
              <td>Concurrent workloads</td>
              <td>Streaming is single-active per <code>EdgeVeda</code> instance.</td>
              <td>Queue user requests or create controlled runtime instances.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Yes</td>
              <td>Primary use case for streaming text generation.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No</td>
              <td>Use <code>embed()</code> for embeddings.</td>
            </tr>
            <tr>
              <td>Tool-capable chat model</td>
              <td>Partial</td>
              <td>For automatic tool loops, prefer <code>ChatSession.sendWithTools()</code>.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No for this method</td>
              <td>Use vision APIs for image input.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target for Metal-accelerated streaming.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only, slower, not representative for performance.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate model paths and sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Test on target devices before publishing performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency is not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: prompt text and generation options.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file and runtime worker state.</li>
        <li>Sensitive data considerations: do not log live user prompts or token chunks unless explicitly needed and safe.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Streaming already in progress</code></td>
              <td>Another stream is active on the same <code>EdgeVeda</code> instance.</td>
              <td>Wait for completion, cancel the active stream, or queue the next request.</td>
            </tr>
            <tr>
              <td>No tokens appear for a while</td>
              <td>First call is spawning the worker and loading the model.</td>
              <td>Show progress text and test release/profile builds on device.</td>
            </tr>
            <tr>
              <td>Stream stops early</td>
              <td><code>CancelToken</code> was cancelled or the model hit a stop sequence.</td>
              <td>Confirm app cancellation logic and <code>stopSequences</code>.</td>
            </tr>
            <tr>
              <td>Stream throws an error</td>
              <td>Worker spawn/init failed or native runtime failed.</td>
              <td>Catch stream errors, log details, and reinitialize if needed.</td>
            </tr>
            <tr>
              <td>UI stutters</td>
              <td>Rendering updates for every token is too frequent.</td>
              <td>Batch token updates or throttle UI refresh.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li>[<code>EdgeVeda.init()</code>](./init.md) — initializes runtime configuration before streaming.</li>
        <li>[<code>EdgeVeda.generate()</code>](./generate.md) — collects stream output and returns a complete response.</li>
        <li>[<code>CancelToken</code>](../core/cancel-token.md) — cancels streaming generation.</li>
        <li>[<code>ChatSession.sendStream()</code>](../chat-session/send-stream.md) — streams within a multi-turn chat session.</li>
      </ul>
    </>
  );
}

function EdgevedaGenerateStreamUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>generateStream()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Core inference / Streaming text generation</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Stream<TokenChunk> generateStream(
  String prompt, {
  GenerateOptions? options,
  CancelToken? cancelToken,
});`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>generateStream()</code> передає prompt локальній моделі та повертає Dart <code>Stream&lt;TokenChunk&gt;</code>. Stream видає token chunks у процесі генерації. Final chunk має <code>isFinal == true</code> і порожній token, що сигналізує completion.</p>
      <p>Метод використовує persistent <code>StreamingWorker</code>. Якщо worker не активний, метод spawn-ить його і завантажує configured model. Якщо worker already active, він reuse-иться.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>generateStream()</code>, коли потрібно:</p>
      <ul>
        <li>оновлювати chat або assistant UI token by token;</li>
        <li>дозволити користувачу cancel generation mid-stream;</li>
        <li>обробляти generated output incrementally;</li>
        <li>відстежувати per-token confidence або cloud-handoff signals.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>потрібен лише final text і простіший код; використовуйте <code>generate()</code>;</li>
        <li>інший stream уже active на тому самому <code>EdgeVeda</code> instance;</li>
        <li>runtime не ініціалізовано через <code>init()</code>;</li>
        <li>потрібна model-level multi-turn memory; використовуйте <code>ChatSession</code>.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> успішно завершився;</li>
        <li>prompt не порожній;</li>
        <li>на тому самому <code>EdgeVeda</code> instance немає іншого active <code>generateStream()</code> call;</li>
        <li><code>GenerateOptions</code> values валідні;</li>
        <li>app готовий обробляти stream errors;</li>
        <li>UI коректно обробляє final chunks і cancellation.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Input text для локальної моделі.</td>
              <td>Не має бути empty.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions()</code></td>
              <td>Керує token limit, sampling, grammar constraints, JSON mode і confidence tracking.</td>
              <td>Значення валідовуються перед start streaming.</td>
            </tr>
            <tr>
              <td><code>cancelToken</code></td>
              <td><code>CancelToken?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional cancellation token для stop generation mid-stream.</td>
              <td><code>cancel()</code> зупиняє token generation, коли worker observe-ить cancellation.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Stream&lt;TokenChunk&gt;</code></p>
      <p>Stream emits token chunks, доки не буде final chunk, cancellation або error.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>token</code></td>
              <td><code>String</code></td>
              <td>Token text content для цього chunk. Final chunk зазвичай має empty token.</td>
            </tr>
            <tr>
              <td><code>index</code></td>
              <td><code>int</code></td>
              <td>Token index у generated sequence.</td>
            </tr>
            <tr>
              <td><code>isFinal</code></td>
              <td><code>bool</code></td>
              <td><code>true</code>, коли stream завершився.</td>
            </tr>
            <tr>
              <td><code>confidence</code></td>
              <td><code>double?</code></td>
              <td>Per-token confidence score, якщо confidence tracking enabled.</td>
            </tr>
            <tr>
              <td><code>needsCloudHandoff</code></td>
              <td><code>bool</code></td>
              <td>Чи recommended cloud handoff на цьому етапі.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>GenerationException</code></td>
              <td>Prompt empty, streaming already active, worker spawn fails, worker init fails або streaming fails.</td>
              <td>Валідуйте input, serialize generation calls, retry after cancellation або reinitialize runtime.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code></td>
              <td>Invalid <code>GenerateOptions</code> values.</td>
              <td>Обмежте значення в UI і валідуйте options before stream.</td>
            </tr>
            <tr>
              <td>Stream errors</td>
              <td>Runtime failures передаються через stream.</td>
              <td>Обгорніть <code>await for</code> у <code>try/catch</code> і оновіть UI state on failure.</td>
            </tr>
            <tr>
              <td>Cancellation state</td>
              <td>User cancels generation through <code>CancelToken</code>.</td>
              <td>Трактуйте cancellation як нормальну user action; partial output можна зберегти.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: modelPath,
  contextLength: 2048,
  useGpu: true,
));

await for (final chunk in edgeVeda.generateStream(
  'Explain what on-device AI means.',
)) {
  if (!chunk.isFinal) {
    stdout.write(chunk.token);
  }
}`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> streamIntoBuffer(EdgeVeda edgeVeda, String prompt) async {
  final cancelToken = CancelToken();
  final buffer = StringBuffer();

  try {
    await for (final chunk in edgeVeda.generateStream(
      prompt,
      options: const GenerateOptions(
        maxTokens: 256,
        temperature: 0.4,
        topP: 0.9,
      ),
      cancelToken: cancelToken,
    )) {
      if (chunk.isFinal) {
        break;
      }

      buffer.write(chunk.token);

      if (chunk.needsCloudHandoff) {
        // Optional: surface low-confidence state to the app.
      }
    }

    return buffer.toString();
  } on GenerationException catch (error) {
    throw Exception('Streaming generation failed: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example with cancellation</h3>
      <pre className="code-block"><code>{`final cancelToken = CancelToken();

final stream = edgeVeda.generateStream(
  'Write a short story about a robot gardener.',
  cancelToken: cancelToken,
);

await for (final chunk in stream) {
  if (chunk.isFinal) {
    break;
  }

  stdout.write(chunk.token);

  if (shouldStopGeneration()) {
    cancelToken.cancel();
    break;
  }
}`}</code></pre>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>generateStream()</code> потребує успішно ініціалізований <code>EdgeVeda</code> instance.</li>
        <li>На одному instance одночасно може бути тільки один active streaming operation.</li>
        <li>Метод lazy створює й ініціалізує persistent <code>StreamingWorker</code>, якщо потрібно.</li>
        <li>Worker використовує <code>EdgeVedaConfig</code>, збережений під час <code>init()</code>.</li>
        <li>Метод emits <code>TokenChunk</code> objects і використовує final chunk з <code>isFinal == true</code>.</li>
        <li>Runtime errors передаються як stream errors.</li>
        <li>Cancellation listener видаляється у <code>finally</code> path.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>First stream after init</td>
              <td>Може включати worker spawn і model load time.</td>
              <td>Покажіть "loading model" або "starting" state.</td>
            </tr>
            <tr>
              <td>Subsequent streams</td>
              <td>Можуть reuse active worker.</td>
              <td>Тримайте runtime alive для multi-request sessions.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Прямо впливає на duration і energy use.</td>
              <td>Задавайте task-specific limits.</td>
            </tr>
            <tr>
              <td>UI update frequency</td>
              <td>UI update на кожен token може бути дорогим.</td>
              <td>Batch UI updates, якщо rendering стає costly.</td>
            </tr>
            <tr>
              <td>Concurrent workloads</td>
              <td>Streaming single-active per <code>EdgeVeda</code> instance.</td>
              <td>Queue user requests або створюйте controlled runtime instances.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Yes</td>
              <td>Основний сценарій для streaming text generation.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No</td>
              <td>Для embeddings використовуйте <code>embed()</code>.</td>
            </tr>
            <tr>
              <td>Tool-capable chat model</td>
              <td>Partial</td>
              <td>Для automatic tool loops краще <code>ChatSession.sendWithTools()</code>.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No for this method</td>
              <td>Для image input використовуйте vision APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target для Metal-accelerated streaming.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only, повільніший, не репрезентативний для performance.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте model paths і sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Тестуйте на target devices перед performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency не орієнтована на web.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: prompt text і generation options.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file і runtime worker state.</li>
        <li>Sensitive data considerations: не логуйте live user prompts або token chunks, якщо це не потрібно й небезпечно.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Streaming already in progress</code></td>
              <td>Інший stream active на тому самому <code>EdgeVeda</code> instance.</td>
              <td>Дочекайтесь completion, cancel active stream або queue next request.</td>
            </tr>
            <tr>
              <td>No tokens appear for a while</td>
              <td>First call spawn-ить worker і load-ить model.</td>
              <td>Покажіть progress text і тестуйте release/profile builds на device.</td>
            </tr>
            <tr>
              <td>Stream stops early</td>
              <td><code>CancelToken</code> was cancelled або model hit stop sequence.</td>
              <td>Перевірте app cancellation logic і <code>stopSequences</code>.</td>
            </tr>
            <tr>
              <td>Stream throws an error</td>
              <td>Worker spawn/init failed або native runtime failed.</td>
              <td>Catch stream errors, log details і reinitialize if needed.</td>
            </tr>
            <tr>
              <td>UI stutters</td>
              <td>Rendering updates на кожен token занадто часті.</td>
              <td>Batch token updates або throttle UI refresh.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li>[<code>EdgeVeda.init()</code>](./init.md) — ініціалізує runtime configuration перед streaming.</li>
        <li>[<code>EdgeVeda.generate()</code>](./generate.md) — збирає stream output і повертає complete response.</li>
        <li>[<code>CancelToken</code>](../core/cancel-token.md) — скасовує streaming generation.</li>
        <li>[<code>ChatSession.sendStream()</code>](../chat-session/send-stream.md) — стрімить у multi-turn chat session.</li>
      </ul>
    </>
  );
}

function EdgevedaDescribeImageEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>describeImage()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Vision / Image understanding</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes — vision runtime via <code>initVision()</code></td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<String> describeImage(
  Uint8List imageBytes, {
  required int width,
  required int height,
  String prompt = 'Describe this image.',
  GenerateOptions? options,
});`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>describeImage()</code> validates that vision has been initialized, checks that <code>imageBytes.length == width * height * 3</code>, initializes a native vision context in a background isolate, runs visual-language inference with the supplied prompt and generation options, and returns the generated text description. The image must be RGB888 bytes, not JPEG, PNG, BGRA, or YUV420 directly.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>describeImage()</code> when you need to:</p>
      <ul>
        <li>describe a still image locally;</li>
        <li>ask a visual question about an image using a custom prompt;</li>
        <li>process converted camera frames without sending images to a server;</li>
        <li>build accessibility, inspection, document understanding, or camera-assistant features.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>vision has not been initialized with <code>initVision()</code>;</li>
        <li>the image is not RGB888;</li>
        <li>you need continuous frame processing with a persistent worker; use <code>VisionWorker.describeFrame()</code>;</li>
        <li>you need text-only generation; use <code>generate()</code> or <code>generateStream()</code>.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li><code>await edgeVeda.initVision(config)</code> has completed successfully;</li>
        <li><code>VisionConfig.modelPath</code> points to a VLM GGUF file;</li>
        <li><code>VisionConfig.mmprojPath</code> points to the matching multimodal projector file;</li>
        <li><code>imageBytes.length == width * height * 3</code>;</li>
        <li>camera or file permissions are handled by the app.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>imageBytes</code></td>
              <td><code>Uint8List</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>RGB888 image bytes.</td>
              <td>Must contain exactly <code>width * height * 3</code> bytes.</td>
            </tr>
            <tr>
              <td><code>width</code></td>
              <td><code>int</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Image width in pixels.</td>
              <td>Must match <code>imageBytes</code>.</td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td><code>int</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Image height in pixels.</td>
              <td>Must match <code>imageBytes</code>.</td>
            </tr>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>No</td>
              <td><code>'Describe this image.'</code></td>
              <td>Text prompt for the VLM.</td>
              <td>Use task-specific prompts for better output.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions(maxTokens: 256)</code></td>
              <td>Generation controls such as <code>maxTokens</code>, <code>temperature</code>, <code>topP</code>, <code>topK</code>, and <code>repeatPenalty</code>.</td>
              <td>Some text-only options may not affect vision output.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Future&lt;String&gt;</code> — a future that resolves to the generated text description.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>—</td>
              <td><code>String</code></td>
              <td>Generated text description of the image.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>VisionException</code></td>
              <td>Vision is not initialized, image byte count mismatches RGB size, native vision init fails, or native describe fails.</td>
              <td>Call <code>initVision()</code>, validate image format/dimensions, and use compatible VLM files.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code> / <code>EdgeVedaException</code></td>
              <td>Invalid generation options or SDK-level failure.</td>
              <td>Validate options and handle typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Vision model/projector or image processing exceeds memory.</td>
              <td>Reduce resolution, choose a smaller VLM, or lower memory settings.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  useGpu: true,
));

final description = await edgeVeda.describeImage(
  rgbBytes,
  width: 640,
  height: 480,
  prompt: 'What objects are visible in this image?',
);

print(description);`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> describeCameraFrame(
  EdgeVeda edgeVeda,
  Uint8List rgbBytes,
  int width,
  int height,
) async {
  final expectedBytes = width * height * 3;
  if (rgbBytes.length != expectedBytes) {
    throw ArgumentError('Expected $expectedBytes RGB bytes, got \${rgbBytes.length}');
  }

  try {
    return await edgeVeda.describeImage(
      rgbBytes,
      width: width,
      height: height,
      prompt: 'Describe the scene and mention safety-relevant objects.',
      options: const GenerateOptions(maxTokens: 120, temperature: 0.2),
    );
  } on VisionException catch (error) {
    throw Exception('Vision inference failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Not applicable. <code>describeImage()</code> does not emit a stream.</p>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>describeImage()</code> uses the vision configuration set by <code>initVision()</code>.</li>
        <li>Vision context is separate from the core text runtime initialized by <code>init()</code>.</li>
        <li>The method expects RGB888 bytes and validates byte length before native inference.</li>
        <li>Native vision work runs in a background isolate to avoid blocking the UI.</li>
        <li>The method returns text only; timing details are available from lower-level <code>VisionWorker.describeFrame()</code> responses.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Image resolution</td>
              <td>Larger images increase encoding and inference cost.</td>
              <td>Start with 640px or lower for mobile vision tasks.</td>
            </tr>
            <tr>
              <td>VLM size</td>
              <td>Larger VLMs increase memory and latency.</td>
              <td>Use SmolVLM-class models for mobile-first scenarios.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Higher values increase decode time.</td>
              <td>Use task-specific short limits for camera flows.</td>
            </tr>
            <tr>
              <td>Repeated frames</td>
              <td>One-off calls may reinitialize context.</td>
              <td>Use <code>VisionWorker.describeFrame()</code> for continuous vision.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF vision-language model + mmproj</td>
              <td>Yes</td>
              <td>Requires matching VLM and multimodal projector files.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>No for image input</td>
              <td>Use text generation APIs for text-only prompts.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No</td>
              <td>Use embeddings APIs for text vectors.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Use image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target for on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior may be slower.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate file access and sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Test on target hardware before publishing performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency is not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: RGB image bytes and prompt text.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: VLM model and mmproj files.</li>
        <li>Sensitive data considerations: images may contain faces, documents, screens, addresses, or other private content; avoid logging raw images or generated descriptions unless needed.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Vision not initialized</code></td>
              <td><code>initVision()</code> was not called or failed.</td>
              <td>Initialize vision first and verify both model files exist.</td>
            </tr>
            <tr>
              <td>Byte count mismatch</td>
              <td>Image is not RGB888 or dimensions are wrong.</td>
              <td>Convert camera frames to RGB888 and pass correct width/height.</td>
            </tr>
            <tr>
              <td>Slow response</td>
              <td>Image is too large or VLM is large.</td>
              <td>Reduce resolution or lower <code>maxTokens</code>.</td>
            </tr>
            <tr>
              <td>Poor description</td>
              <td>Prompt is too vague or VLM is not suited to the task.</td>
              <td>Use a targeted prompt and compatible VLM/mmproj pair.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li><code>EdgeVeda.initVision()</code> — initializes the VLM and mmproj configuration.</li>
        <li><code>EdgeVeda.disposeVision()</code> — releases vision resources.</li>
        <li><code>VisionWorker.describeFrame()</code> — lower-level persistent-worker API with timing metadata.</li>
        <li><code>CameraUtils.convertBgraToRgb()</code> / <code>convertYuv420ToRgb()</code> — converts camera data to RGB888.</li>
      </ul>
    </>
  );
}

function EdgevedaDescribeImageUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>describeImage()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Vision / Image understanding</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes — vision runtime через <code>initVision()</code></td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<String> describeImage(
  Uint8List imageBytes, {
  required int width,
  required int height,
  String prompt = 'Describe this image.',
  GenerateOptions? options,
});`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>describeImage()</code> перевіряє, що vision initialized, перевіряє <code>imageBytes.length == width * height * 3</code>, ініціалізує native vision context у background isolate, запускає visual-language inference з prompt/options і повертає generated text description. Image має бути RGB888 bytes, а не JPEG, PNG, BGRA або YUV420 напряму.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>describeImage()</code>, коли потрібно:</p>
      <ul>
        <li>описати still image локально;</li>
        <li>поставити visual question до image через custom prompt;</li>
        <li>обробляти converted camera frames без відправки images на server;</li>
        <li>будувати accessibility, inspection, document understanding або camera-assistant features.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>vision не ініціалізовано через <code>initVision()</code>;</li>
        <li>image не у RGB888 format;</li>
        <li>потрібна continuous frame processing з persistent worker; використовуйте <code>VisionWorker.describeFrame()</code>;</li>
        <li>потрібна text-only generation; використовуйте <code>generate()</code> або <code>generateStream()</code>.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li><code>await edgeVeda.initVision(config)</code> успішно завершився;</li>
        <li><code>VisionConfig.modelPath</code> вказує на VLM GGUF file;</li>
        <li><code>VisionConfig.mmprojPath</code> вказує на matching multimodal projector file;</li>
        <li><code>imageBytes.length == width * height * 3</code>;</li>
        <li>camera/file permissions оброблені application layer.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>imageBytes</code></td>
              <td><code>Uint8List</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>RGB888 image bytes.</td>
              <td>Має містити рівно <code>width * height * 3</code> bytes.</td>
            </tr>
            <tr>
              <td><code>width</code></td>
              <td><code>int</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Image width in pixels.</td>
              <td>Має відповідати <code>imageBytes</code>.</td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td><code>int</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Image height in pixels.</td>
              <td>Має відповідати <code>imageBytes</code>.</td>
            </tr>
            <tr>
              <td><code>prompt</code></td>
              <td><code>String</code></td>
              <td>No</td>
              <td><code>'Describe this image.'</code></td>
              <td>Text prompt для VLM.</td>
              <td>Для кращого output використовуйте task-specific prompts.</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>GenerateOptions?</code></td>
              <td>No</td>
              <td><code>const GenerateOptions(maxTokens: 256)</code></td>
              <td>Generation controls: <code>maxTokens</code>, <code>temperature</code>, <code>topP</code>, <code>topK</code>, <code>repeatPenalty</code>.</td>
              <td>Деякі text-only options можуть не впливати на vision output.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Future&lt;String&gt;</code> — future, що повертає generated text description.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>—</td>
              <td><code>String</code></td>
              <td>Generated text description of the image.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>VisionException</code></td>
              <td>Vision не initialized, image byte count mismatch, native vision init fails або native describe fails.</td>
              <td>Викличте <code>initVision()</code>, validate image format/dimensions і use compatible VLM files.</td>
            </tr>
            <tr>
              <td><code>ConfigurationException</code> / <code>EdgeVedaException</code></td>
              <td>Invalid generation options або SDK-level failure.</td>
              <td>Validate options і handle typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Vision model/projector або image processing перевищує memory.</td>
              <td>Reduce resolution, choose smaller VLM або lower memory settings.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`await edgeVeda.initVision(VisionConfig(
  modelPath: vlmModelPath,
  mmprojPath: mmprojPath,
  numThreads: 4,
  useGpu: true,
));

final description = await edgeVeda.describeImage(
  rgbBytes,
  width: 640,
  height: 480,
  prompt: 'What objects are visible in this image?',
);

print(description);`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<String> describeCameraFrame(
  EdgeVeda edgeVeda,
  Uint8List rgbBytes,
  int width,
  int height,
) async {
  final expectedBytes = width * height * 3;
  if (rgbBytes.length != expectedBytes) {
    throw ArgumentError('Expected $expectedBytes RGB bytes, got \${rgbBytes.length}');
  }

  try {
    return await edgeVeda.describeImage(
      rgbBytes,
      width: width,
      height: height,
      prompt: 'Describe the scene and mention safety-relevant objects.',
      options: const GenerateOptions(maxTokens: 120, temperature: 0.2),
    );
  } on VisionException catch (error) {
    throw Exception('Vision inference failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Не застосовується. <code>describeImage()</code> не повертає stream.</p>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>describeImage()</code> використовує vision configuration, встановлену через <code>initVision()</code>.</li>
        <li>Vision context окремий від core text runtime, ініціалізованого через <code>init()</code>.</li>
        <li>Метод очікує RGB888 bytes і валідовує byte length before native inference.</li>
        <li>Native vision work виконується в background isolate, щоб не блокувати UI.</li>
        <li>Метод повертає тільки text; timing details доступні через lower-level <code>VisionWorker.describeFrame()</code> responses.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Image resolution</td>
              <td>Larger images збільшують encoding і inference cost.</td>
              <td>Починайте з 640px або нижче для mobile vision tasks.</td>
            </tr>
            <tr>
              <td>VLM size</td>
              <td>Larger VLMs збільшують memory і latency.</td>
              <td>Використовуйте SmolVLM-class models для mobile-first scenarios.</td>
            </tr>
            <tr>
              <td><code>maxTokens</code></td>
              <td>Higher values збільшують decode time.</td>
              <td>Use task-specific short limits for camera flows.</td>
            </tr>
            <tr>
              <td>Repeated frames</td>
              <td>One-off calls можуть reinitialize context.</td>
              <td>Для continuous vision використовуйте <code>VisionWorker.describeFrame()</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF vision-language model + mmproj</td>
              <td>Yes</td>
              <td>Requires matching VLM and multimodal projector files.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>No for image input</td>
              <td>Use text generation APIs for text-only prompts.</td>
            </tr>
            <tr>
              <td>GGUF embedding model</td>
              <td>No</td>
              <td>Use embeddings APIs for text vectors.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Use image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target для on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior може бути повільним.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте file access і sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Тестуйте на target hardware перед performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency не web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: RGB image bytes і prompt text.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: VLM model і mmproj files.</li>
        <li>Sensitive data considerations: images можуть містити faces, documents, screens, addresses або private content; не логуйте raw images/generated descriptions без потреби.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Vision not initialized</code></td>
              <td><code>initVision()</code> не викликано або failed.</td>
              <td>Initialize vision first and verify both model files exist.</td>
            </tr>
            <tr>
              <td>Byte count mismatch</td>
              <td>Image не RGB888 або dimensions wrong.</td>
              <td>Convert camera frames to RGB888 and pass correct width/height.</td>
            </tr>
            <tr>
              <td>Slow response</td>
              <td>Image too large або VLM large.</td>
              <td>Reduce resolution або lower <code>maxTokens</code>.</td>
            </tr>
            <tr>
              <td>Poor description</td>
              <td>Prompt too vague або VLM not suited to task.</td>
              <td>Use targeted prompt and compatible VLM/mmproj pair.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li><code>EdgeVeda.initVision()</code> — initializes the VLM and mmproj configuration.</li>
        <li><code>EdgeVeda.disposeVision()</code> — releases vision resources.</li>
        <li><code>VisionWorker.describeFrame()</code> — lower-level persistent-worker API with timing metadata.</li>
        <li><code>CameraUtils.convertBgraToRgb()</code> / <code>convertYuv420ToRgb()</code> — converts camera data to RGB888.</li>
      </ul>
    </>
  );
}

function EdgevedaEmbedEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>embed()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Embeddings / RAG</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future&lt;EmbeddingResult&gt; embed(String text);`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>embed()</code> validates that the <code>EdgeVeda</code> instance is initialized, validates the input text, loads the configured GGUF model in a background isolate, calls the native embedding API, copies the L2-normalized embedding vector into Dart memory, and returns an <code>EmbeddingResult</code>. Use a real embedding model; using a generative model can produce meaningless embeddings.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>embed()</code> when you need to:</p>
      <ul>
        <li>convert a single query or document chunk into a vector;</li>
        <li>search a local <code>VectorIndex</code> by semantic similarity;</li>
        <li>build or query an on-device RAG pipeline;</li>
        <li>compare two pieces of text by vector similarity.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>you need to embed many texts at once; use <code>embedBatch()</code>;</li>
        <li>the current model is a chat/generation model rather than an embedding model;</li>
        <li>you need natural-language generation; use <code>generate()</code> or <code>generateStream()</code>.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> has completed successfully;</li>
        <li><code>config.modelPath</code> points to a GGUF embedding model;</li>
        <li><code>text</code> is not empty;</li>
        <li>the downstream vector index uses the same embedding dimensions as the model.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>text</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Text to embed.</td>
              <td>Must not be empty; keep chunks within model context length.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Future&lt;EmbeddingResult&gt;</code> — a future that resolves to one embedding result.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>embedding</code></td>
              <td><code>List&lt;double&gt;</code></td>
              <td>L2-normalized vector copied into Dart memory.</td>
            </tr>
            <tr>
              <td><code>tokenCount</code></td>
              <td><code>int</code></td>
              <td>Number of tokens in the input text.</td>
            </tr>
            <tr>
              <td><code>dimensions</code></td>
              <td><code>int</code></td>
              <td>Convenience property returning vector dimension count.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>EmbeddingException</code></td>
              <td><code>text</code> is empty or native embedding fails.</td>
              <td>Validate input and confirm model compatibility.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>The configured model cannot be loaded for embedding.</td>
              <td>Verify <code>modelPath</code>, model type, and memory budget.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime is not initialized or another SDK-level failure occurs.</td>
              <td>Call <code>init()</code> first and handle typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Model or context exceeds memory limits.</td>
              <td>Use a smaller embedding model or lower context/memory settings.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: \${result.dimensions}');
print('Tokens: \${result.tokenCount}');
print('Vector head: \${result.embedding.take(5)}');`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<EmbeddingResult> embedQuery(EdgeVeda edgeVeda, String query) async {
  final normalized = query.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('query must not be empty');
  }

  try {
    return await edgeVeda.embed(normalized);
  } on EmbeddingException catch (error) {
    throw Exception('Could not embed query: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Not applicable. <code>embed()</code> does not emit a stream.</p>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>embed()</code> requires the core runtime to be initialized with <code>init()</code>.</li>
        <li>Native work runs in a background isolate to avoid blocking the UI.</li>
        <li>The native model context is created for the call and freed after the embedding is copied.</li>
        <li>The returned embedding is a Dart-owned <code>List&lt;double&gt;</code>.</li>
        <li>Embedding dimensions depend on the selected model and must match the target <code>VectorIndex</code>.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Model type</td>
              <td>Embedding models are usually smaller and faster than chat models.</td>
              <td>Use a dedicated embedding model for RAG.</td>
            </tr>
            <tr>
              <td>Chunk length</td>
              <td>Longer text increases tokenization and compute time.</td>
              <td>Split documents into consistent semantic chunks.</td>
            </tr>
            <tr>
              <td>Single-call model load</td>
              <td><code>embed()</code> loads for a single input.</td>
              <td>Use <code>embedBatch()</code> for indexing many chunks.</td>
            </tr>
            <tr>
              <td>Vector dimensions</td>
              <td>Higher dimensions increase index size and search cost.</td>
              <td>Do not mix different embedding models in one index.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF embedding model</td>
              <td>Yes</td>
              <td>Primary supported use case.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Not recommended</td>
              <td>Can produce meaningless embeddings.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No</td>
              <td>Use vision APIs for image understanding.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Use image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target for on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior may be slower.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate file access and sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Test on target hardware before publishing performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency is not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: input text.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file and optional app-managed vector index.</li>
        <li>Sensitive data considerations: embeddings can encode private content; protect persisted vectors and metadata.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Text cannot be empty</code></td>
              <td>Empty string passed to <code>embed()</code>.</td>
              <td>Trim and validate input.</td>
            </tr>
            <tr>
              <td>Vector dimensions do not match index</td>
              <td>Index was created for a different embedding model.</td>
              <td>Rebuild the index with one consistent model.</td>
            </tr>
            <tr>
              <td>Poor retrieval quality</td>
              <td>Wrong model type or poor chunking.</td>
              <td>Use a real embedding model and tune chunking.</td>
            </tr>
            <tr>
              <td>Slow indexing</td>
              <td>Calling <code>embed()</code> repeatedly loads the model for each text.</td>
              <td>Use <code>embedBatch()</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li><code>EdgeVeda.embedBatch()</code> — embeds multiple texts with one model load/unload cycle.</li>
        <li><code>VectorIndex.add()</code> — stores embedding vectors for local similarity search.</li>
        <li><code>RagPipeline.query()</code> — runs retrieval-augmented generation using embeddings.</li>
      </ul>
    </>
  );
}

function EdgevedaEmbedUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>embed()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Embeddings / RAG</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future&lt;EmbeddingResult&gt; embed(String text);`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>embed()</code> перевіряє, що <code>EdgeVeda</code> instance ініціалізований, валідовує input text, завантажує configured GGUF model у background isolate, викликає native embedding API, копіює L2-normalized embedding vector у Dart memory і повертає <code>EmbeddingResult</code>. Використовуйте реальну embedding model; generative model може дати семантично некорисні vectors.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>embed()</code>, коли потрібно:</p>
      <ul>
        <li>перетворити один query або document chunk на vector;</li>
        <li>шукати в локальному <code>VectorIndex</code> за semantic similarity;</li>
        <li>будувати або запитувати on-device RAG pipeline;</li>
        <li>порівнювати два тексти через vector similarity.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>потрібно embed-ити багато текстів за раз; використовуйте <code>embedBatch()</code>;</li>
        <li>current model є chat/generation model, а не embedding model;</li>
        <li>потрібна natural-language generation; використовуйте <code>generate()</code> або <code>generateStream()</code>.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> успішно завершився;</li>
        <li><code>config.modelPath</code> вказує на GGUF embedding model;</li>
        <li><code>text</code> не порожній;</li>
        <li>downstream vector index використовує ті самі embedding dimensions.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>text</code></td>
              <td><code>String</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Текст для embedding.</td>
              <td>Не має бути empty; тримайте chunks у межах model context length.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Future&lt;EmbeddingResult&gt;</code> — future, що повертає один embedding result.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>embedding</code></td>
              <td><code>List&lt;double&gt;</code></td>
              <td>L2-normalized vector, скопійований у Dart memory.</td>
            </tr>
            <tr>
              <td><code>tokenCount</code></td>
              <td><code>int</code></td>
              <td>Кількість tokens у input text.</td>
            </tr>
            <tr>
              <td><code>dimensions</code></td>
              <td><code>int</code></td>
              <td>Convenience property з кількістю vector dimensions.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>EmbeddingException</code></td>
              <td><code>text</code> empty або native embedding fails.</td>
              <td>Валідуйте input і підтвердьте model compatibility.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>Configured model не може бути loaded for embedding.</td>
              <td>Перевірте <code>modelPath</code>, model type і memory budget.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime не initialized або SDK-level failure.</td>
              <td>Спочатку викличте <code>init()</code> і обробіть typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Model/context перевищує memory limits.</td>
              <td>Use smaller embedding model або lower context/memory settings.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final result = await edgeVeda.embed('The quick brown fox');

print('Dimensions: \${result.dimensions}');
print('Tokens: \${result.tokenCount}');
print('Vector head: \${result.embedding.take(5)}');`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<EmbeddingResult> embedQuery(EdgeVeda edgeVeda, String query) async {
  final normalized = query.trim();
  if (normalized.isEmpty) {
    throw ArgumentError('query must not be empty');
  }

  try {
    return await edgeVeda.embed(normalized);
  } on EmbeddingException catch (error) {
    throw Exception('Could not embed query: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Не застосовується. <code>embed()</code> не повертає stream.</p>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>embed()</code> потребує core runtime, ініціалізований через <code>init()</code>.</li>
        <li>Native work виконується в background isolate, щоб не блокувати UI.</li>
        <li>Native model context створюється для call і звільняється після копіювання embedding.</li>
        <li>Returned embedding — Dart-owned <code>List&lt;double&gt;</code>.</li>
        <li>Embedding dimensions залежать від selected model і мають збігатися з target <code>VectorIndex</code>.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Model type</td>
              <td>Embedding models зазвичай менші й швидші за chat models.</td>
              <td>Для RAG використовуйте dedicated embedding model.</td>
            </tr>
            <tr>
              <td>Chunk length</td>
              <td>Longer text збільшує tokenization і compute time.</td>
              <td>Розбивайте documents на consistent semantic chunks.</td>
            </tr>
            <tr>
              <td>Single-call model load</td>
              <td><code>embed()</code> load-ить model для одного input.</td>
              <td>Для indexing багатьох chunks використовуйте <code>embedBatch()</code>.</td>
            </tr>
            <tr>
              <td>Vector dimensions</td>
              <td>Higher dimensions збільшують index size і search cost.</td>
              <td>Не змішуйте різні embedding models в одному index.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF embedding model</td>
              <td>Yes</td>
              <td>Основний supported use case.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Not recommended</td>
              <td>Може давати meaningless embeddings.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No</td>
              <td>Для image understanding використовуйте vision APIs.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Для цього є image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target для on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior може бути повільним.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте file access і sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Тестуйте на target hardware перед performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency не web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: input text.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file і optional app-managed vector index.</li>
        <li>Sensitive data considerations: embeddings можуть кодувати private content; захищайте persisted vectors і metadata.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>Text cannot be empty</code></td>
              <td>Передано empty string.</td>
              <td>Trim and validate input.</td>
            </tr>
            <tr>
              <td>Vector dimensions do not match index</td>
              <td>Index створено для іншої embedding model.</td>
              <td>Rebuild index з однією consistent model.</td>
            </tr>
            <tr>
              <td>Poor retrieval quality</td>
              <td>Wrong model type або poor chunking.</td>
              <td>Use real embedding model і tune chunking.</td>
            </tr>
            <tr>
              <td>Slow indexing</td>
              <td>Repeated <code>embed()</code> load-ить model для кожного text.</td>
              <td>Використовуйте <code>embedBatch()</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li><code>EdgeVeda.embedBatch()</code> — embeds multiple texts with one model load/unload cycle.</li>
        <li><code>VectorIndex.add()</code> — stores embedding vectors for local similarity search.</li>
        <li><code>RagPipeline.query()</code> — runs retrieval-augmented generation using embeddings.</li>
      </ul>
    </>
  );
}

function EdgevedaEmbedBatchEn() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Value</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>embedBatch()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Embeddings / RAG</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; source review required before publishing</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Documented in <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface with validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<List<EmbeddingResult>> embedBatch(
  List<String> texts, {
  void Function(int completed, int total)? onProgress,
});`}</code></pre>
      <h2 id="what-it-does">What it does</h2>
      <p><code>embedBatch()</code> validates that the <code>EdgeVeda</code> instance is initialized, then embeds all input texts in one background-isolate operation. The model is loaded once, reused for every text, and freed after the batch completes. Results are returned in the same order as the input list.</p>
      <h2 id="when-to-use">When to use it</h2>
      <p>Use <code>embedBatch()</code> when you need to:</p>
      <ul>
        <li>build a local vector index from document chunks;</li>
        <li>embed notes, pages, records, or search candidates in bulk;</li>
        <li>prepare a data set for on-device RAG;</li>
        <li>improve throughput compared with repeated <code>embed()</code> calls.</li>
      </ul>
      <p>Do not use this method when:</p>
      <ul>
        <li>you only need one query vector; use <code>embed()</code>;</li>
        <li>you need generated text; use <code>generate()</code> or <code>generateStream()</code>;</li>
        <li>the configured model is not an embedding model;</li>
        <li>you need guaranteed per-item progress UI before confirming current callback behavior.</li>
      </ul>
      <h2 id="prerequisites">Prerequisites</h2>
      <p>Before calling this method, make sure that:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> has completed successfully;</li>
        <li><code>config.modelPath</code> points to a GGUF embedding model;</li>
        <li>input strings are pre-trimmed and chunked to fit the model context length;</li>
        <li>the app has enough memory for the model and result list.</li>
      </ul>
      <h2 id="parameters">Parameters</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>texts</code></td>
              <td><code>List&lt;String&gt;</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Text items to embed.</td>
              <td>Empty list returns <code>[]</code>. Review empty-string behavior before publishing.</td>
            </tr>
            <tr>
              <td><code>onProgress</code></td>
              <td><code>void Function(int completed, int total)?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional progress callback declared by the API.</td>
              <td>Public docs describe per-text progress; confirm actual invocation during source review.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Returns</h2>
      <p><code>Future&lt;List<EmbeddingResult>&gt;</code> — a future that resolves to embedding results in input order.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>embedding</code></td>
              <td><code>List&lt;double&gt;</code></td>
              <td>L2-normalized vector copied into Dart memory.</td>
            </tr>
            <tr>
              <td><code>tokenCount</code></td>
              <td><code>int</code></td>
              <td>Number of tokens in the corresponding input text.</td>
            </tr>
            <tr>
              <td><code>dimensions</code></td>
              <td><code>int</code></td>
              <td>Convenience property returning vector dimensions.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Errors and exceptions</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>EmbeddingException</code></td>
              <td>Native embedding fails for one text.</td>
              <td>Validate inputs, split long chunks, and retry the failed batch or item.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>The configured model cannot be loaded.</td>
              <td>Verify <code>modelPath</code>, model type, and memory budget.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime is not initialized or SDK-level failure occurs.</td>
              <td>Call <code>init()</code> first and handle typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Batch/model exceeds memory limits.</td>
              <td>Reduce batch size or use a smaller embedding model.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Examples</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final results = await edgeVeda.embedBatch([
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
]);

print('Embedded \${results.length} texts');`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<List<EmbeddingResult>> embedChunks(
  EdgeVeda edgeVeda,
  List<String> chunks,
) async {
  final cleanChunks = chunks.map((c) => c.trim()).where((c) => c.isNotEmpty).toList();
  if (cleanChunks.isEmpty) return [];

  try {
    return await edgeVeda.embedBatch(
      cleanChunks,
      onProgress: (completed, total) {
        print('Embedding progress: $completed / $total');
      },
    );
  } on EmbeddingException catch (error) {
    throw Exception('Batch embedding failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Not applicable. <code>embedBatch()</code> does not emit a stream.</p>
      <h2 id="behavior">Behavior notes</h2>
      <ul>
        <li><code>embedBatch()</code> requires the core runtime initialized with <code>init()</code>.</li>
        <li>Empty input list returns an empty result list.</li>
        <li>The whole batch runs in one background isolate.</li>
        <li>The native model context is created once and reused for all texts.</li>
        <li>Results preserve input order.</li>
        <li>Review note: confirm <code>onProgress</code> callback behavior against current source before documenting UI guarantees.</li>
      </ul>
      <h2 id="performance">Performance notes</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Batch size</td>
              <td>Larger batches reduce load overhead but increase result memory.</td>
              <td>Use moderate batches when indexing large corpora.</td>
            </tr>
            <tr>
              <td>Chunk length</td>
              <td>Longer chunks increase embedding latency.</td>
              <td>Use consistent chunking with overlap where needed.</td>
            </tr>
            <tr>
              <td>Model load reuse</td>
              <td>One load per batch is faster than one load per text.</td>
              <td>Prefer <code>embedBatch()</code> for indexing workflows.</td>
            </tr>
            <tr>
              <td>Vector persistence</td>
              <td>Persisting many vectors increases storage use.</td>
              <td>Store metadata compactly and protect private content.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Model & platform compatibility</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF embedding model</td>
              <td>Yes</td>
              <td>Primary supported use case.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Not recommended</td>
              <td>Can produce meaningless embeddings.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No</td>
              <td>Use vision APIs for image understanding.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Use image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Platform compatibility</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target for on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior may be slower.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Validate file access and sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Test on target hardware before publishing performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency is not web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Privacy and security</h2>
      <ul>
        <li>Input data processed: list of text strings.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file and any app-managed vector index.</li>
        <li>Sensitive data considerations: stored vectors and metadata may reveal semantic information from private documents.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Returns <code>[]</code></td>
              <td>Input list is empty.</td>
              <td>Check upstream chunking and filtering logic.</td>
            </tr>
            <tr>
              <td>Batch fails partway</td>
              <td>One input may be malformed, too long, or unsupported.</td>
              <td>Validate and chunk inputs before embedding.</td>
            </tr>
            <tr>
              <td>High memory use</td>
              <td>Batch is too large or vectors are high-dimensional.</td>
              <td>Reduce batch size or choose a smaller embedding model.</td>
            </tr>
            <tr>
              <td>Progress UI does not update</td>
              <td>Callback behavior needs source verification.</td>
              <td>Do not depend on progress UI until implementation is confirmed.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Related APIs</h2>
      <ul>
        <li><code>EdgeVeda.embed()</code> — embeds one text string.</li>
        <li><code>VectorIndex.add()</code> — stores vectors for local search.</li>
        <li><code>RagPipeline.query()</code> — uses embeddings for retrieval-augmented generation.</li>
      </ul>
    </>
  );
}

function EdgevedaEmbedBatchUa() {
  return (
    <>
      <h2 id="api-summary">API summary</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Поле</th>
            <th>Значення</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>API surface</td>
              <td>Public Dart SDK</td>
            </tr>
            <tr>
              <td>Class / extension</td>
              <td><code>EdgeVeda</code></td>
            </tr>
            <tr>
              <td>Method</td>
              <td><code>embedBatch()</code></td>
            </tr>
            <tr>
              <td>Category</td>
              <td>Embeddings / RAG</td>
            </tr>
            <tr>
              <td>Stability</td>
              <td>Stable API surface; перед публікацією потрібен source review</td>
            </tr>
            <tr>
              <td>Since</td>
              <td>Задокументовано в <code>edge_veda</code> 2.5.0 API reference</td>
            </tr>
            <tr>
              <td>Platforms</td>
              <td>iOS/macOS package surface; Android package surface з validation caveats</td>
            </tr>
            <tr>
              <td>Requires initialized runtime</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Supports streaming</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Runs on device</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="signature">Signature</h2>
      <pre className="code-block"><code>{`Future<List<EmbeddingResult>> embedBatch(
  List<String> texts, {
  void Function(int completed, int total)? onProgress,
});`}</code></pre>
      <h2 id="what-it-does">Що робить</h2>
      <p><code>embedBatch()</code> перевіряє, що <code>EdgeVeda</code> instance ініціалізований, і embed-ить усі input texts в одній background-isolate operation. Model load-иться один раз, reuse-иться для кожного text і звільняється після завершення batch. Results повертаються в тому самому порядку, що й input list.</p>
      <h2 id="when-to-use">Коли використовувати</h2>
      <p>Використовуйте <code>embedBatch()</code>, коли потрібно:</p>
      <ul>
        <li>побудувати local vector index з document chunks;</li>
        <li>embed-ити notes, pages, records або search candidates bulk-ом;</li>
        <li>підготувати data set для on-device RAG;</li>
        <li>покращити throughput порівняно з repeated <code>embed()</code> calls.</li>
      </ul>
      <p>Не використовуйте цей метод, коли:</p>
      <ul>
        <li>потрібен лише один query vector; використовуйте <code>embed()</code>;</li>
        <li>потрібен generated text; використовуйте <code>generate()</code> або <code>generateStream()</code>;</li>
        <li>configured model не є embedding model;</li>
        <li>потрібна гарантована per-item progress UI до підтвердження callback behavior.</li>
      </ul>
      <h2 id="prerequisites">Передумови</h2>
      <p>Перед викликом методу переконайтесь, що:</p>
      <ul>
        <li><code>await edgeVeda.init(config)</code> успішно завершився;</li>
        <li><code>config.modelPath</code> вказує на GGUF embedding model;</li>
        <li>input strings pre-trimmed і chunked до model context length;</li>
        <li>app має достатньо memory для model і result list.</li>
      </ul>
      <h2 id="parameters">Параметри</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Constraints / notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>texts</code></td>
              <td><code>List&lt;String&gt;</code></td>
              <td>Yes</td>
              <td>—</td>
              <td>Text items для embedding.</td>
              <td>Empty list повертає <code>[]</code>. Перед публікацією review empty-string behavior.</td>
            </tr>
            <tr>
              <td><code>onProgress</code></td>
              <td><code>void Function(int completed, int total)?</code></td>
              <td>No</td>
              <td><code>null</code></td>
              <td>Optional progress callback у public API.</td>
              <td>Public docs описують per-text progress; підтвердьте actual invocation during source review.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="returns">Повертає</h2>
      <p><code>Future&lt;List<EmbeddingResult>&gt;</code> — future, що повертає embedding results у input order.</p>
      <h3>Return object fields</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>embedding</code></td>
              <td><code>List&lt;double&gt;</code></td>
              <td>L2-normalized vector copied into Dart memory.</td>
            </tr>
            <tr>
              <td><code>tokenCount</code></td>
              <td><code>int</code></td>
              <td>Number of tokens in the corresponding input text.</td>
            </tr>
            <tr>
              <td><code>dimensions</code></td>
              <td><code>int</code></td>
              <td>Convenience property returning vector dimensions.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="errors">Помилки та винятки</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Error / exception</th>
            <th>When it happens</th>
            <th>How to handle it</th>
          </tr></thead>
          <tbody>
            <tr>
              <td><code>EmbeddingException</code></td>
              <td>Native embedding fails для одного text.</td>
              <td>Validate inputs, split long chunks і retry failed batch/item.</td>
            </tr>
            <tr>
              <td><code>ModelLoadException</code></td>
              <td>Configured model не може бути loaded.</td>
              <td>Перевірте <code>modelPath</code>, model type і memory budget.</td>
            </tr>
            <tr>
              <td><code>InitializationException</code> / <code>EdgeVedaException</code></td>
              <td>Runtime не initialized або SDK-level failure.</td>
              <td>Спочатку викличте <code>init()</code> і обробіть typed exceptions.</td>
            </tr>
            <tr>
              <td><code>MemoryException</code></td>
              <td>Batch/model перевищує memory limits.</td>
              <td>Reduce batch size або use smaller embedding model.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="examples">Приклади</h2>
      <pre className="code-block"><code>{`final edgeVeda = EdgeVeda();

await edgeVeda.init(EdgeVedaConfig(
  modelPath: embeddingModelPath,
  contextLength: 512,
  useGpu: true,
));

final results = await edgeVeda.embedBatch([
  'Flutter is a UI framework.',
  'Dart is a programming language.',
  'Edge Veda runs AI models on device.',
]);

print('Embedded \${results.length} texts');`}</code></pre>
      <h3>Production-style example</h3>
      <pre className="code-block"><code>{`Future<List<EmbeddingResult>> embedChunks(
  EdgeVeda edgeVeda,
  List<String> chunks,
) async {
  final cleanChunks = chunks.map((c) => c.trim()).where((c) => c.isNotEmpty).toList();
  if (cleanChunks.isEmpty) return [];

  try {
    return await edgeVeda.embedBatch(
      cleanChunks,
      onProgress: (completed, total) {
        print('Embedding progress: $completed / $total');
      },
    );
  } on EmbeddingException catch (error) {
    throw Exception('Batch embedding failed: \${error.message}');
  } on EdgeVedaException catch (error) {
    throw Exception('Edge Veda runtime error: \${error.message}');
  }
}`}</code></pre>
      <h3>Streaming example</h3>
      <p>Не застосовується. <code>embedBatch()</code> не повертає stream.</p>
      <h2 id="behavior">Поведінка</h2>
      <ul>
        <li><code>embedBatch()</code> потребує core runtime, ініціалізований через <code>init()</code>.</li>
        <li>Empty input list повертає empty result list.</li>
        <li>Увесь batch виконується в одному background isolate.</li>
        <li>Native model context створюється один раз і reuse-иться для всіх texts.</li>
        <li>Results preserve input order.</li>
        <li>Review note: confirm <code>onProgress</code> callback behavior against current source before UI guarantees.</li>
      </ul>
      <h2 id="performance">Продуктивність</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Factor</th>
            <th>Impact</th>
            <th>Recommendation</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Batch size</td>
              <td>Larger batches зменшують load overhead, але збільшують result memory.</td>
              <td>Для великих corpora використовуйте moderate batches.</td>
            </tr>
            <tr>
              <td>Chunk length</td>
              <td>Longer chunks збільшують embedding latency.</td>
              <td>Use consistent chunking з overlap where needed.</td>
            </tr>
            <tr>
              <td>Model load reuse</td>
              <td>One load per batch швидше, ніж one load per text.</td>
              <td>Для indexing workflows використовуйте <code>embedBatch()</code>.</td>
            </tr>
            <tr>
              <td>Vector persistence</td>
              <td>Persisting many vectors збільшує storage use.</td>
              <td>Store metadata compactly і protect private content.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="compatibility">Сумісність моделей і платформ</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Model family / format</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>GGUF embedding model</td>
              <td>Yes</td>
              <td>Primary supported use case.</td>
            </tr>
            <tr>
              <td>GGUF chat/instruct LLM</td>
              <td>Not recommended</td>
              <td>Can produce meaningless embeddings.</td>
            </tr>
            <tr>
              <td>Vision-language model</td>
              <td>No</td>
              <td>Use vision APIs for image understanding.</td>
            </tr>
            <tr>
              <td>Stable Diffusion model</td>
              <td>No</td>
              <td>Use image generation APIs.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Платформи</h3>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Platform</th>
            <th>Supported</th>
            <th>Notes</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>iOS device</td>
              <td>Yes</td>
              <td>Primary validated target для on-device inference.</td>
            </tr>
            <tr>
              <td>iOS simulator</td>
              <td>Partial</td>
              <td>CPU-only behavior може бути повільним.</td>
            </tr>
            <tr>
              <td>macOS</td>
              <td>Yes / package surface</td>
              <td>Перевірте file access і sandbox behavior.</td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Partial / validation pending</td>
              <td>Тестуйте на target hardware перед performance claims.</td>
            </tr>
            <tr>
              <td>Web</td>
              <td>No</td>
              <td>Native runtime dependency не web-oriented.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="privacy">Приватність та безпека</h2>
      <ul>
        <li>Input data processed: list of text strings.</li>
        <li>Network access during inference: none.</li>
        <li>Local storage used: local model file і app-managed vector index.</li>
        <li>Sensitive data considerations: stored vectors і metadata можуть розкривати semantic information з private documents.</li>
      </ul>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <div className="api-summary-table">
        <table>
          <thead><tr>
            <th>Symptom</th>
            <th>Possible cause</th>
            <th>Fix</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>Returns <code>[]</code></td>
              <td>Input list is empty.</td>
              <td>Перевірте upstream chunking/filtering logic.</td>
            </tr>
            <tr>
              <td>Batch fails partway</td>
              <td>Один input може бути malformed, too long або unsupported.</td>
              <td>Validate and chunk inputs before embedding.</td>
            </tr>
            <tr>
              <td>High memory use</td>
              <td>Batch too large або vectors high-dimensional.</td>
              <td>Reduce batch size або choose smaller embedding model.</td>
            </tr>
            <tr>
              <td>Progress UI does not update</td>
              <td>Callback behavior needs source verification.</td>
              <td>Не залежте від progress UI, доки implementation не підтверджено.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 id="related">Пов'язані API</h2>
      <ul>
        <li><code>EdgeVeda.embed()</code> — embeds one text string.</li>
        <li><code>VectorIndex.add()</code> — stores vectors for local search.</li>
        <li><code>RagPipeline.query()</code> — uses embeddings for retrieval-augmented generation.</li>
      </ul>
    </>
  );
}
/* ---------- API Doc Content Map ---------- */
const API_DOC_CONTENT = {
  "edgeveda-init": {
    en: <EdgevedaInitEn />,
    ua: <EdgevedaInitUa />,
  },
  "edgeveda-generate": {
    en: <EdgevedaGenerateEn />,
    ua: <EdgevedaGenerateUa />,
  },
  "edgeveda-generate-stream": {
    en: <EdgevedaGenerateStreamEn />,
    ua: <EdgevedaGenerateStreamUa />,
  },
  "edgeveda-describe-image": {
    en: <EdgevedaDescribeImageEn />,
    ua: <EdgevedaDescribeImageUa />,
  },
  "edgeveda-embed": {
    en: <EdgevedaEmbedEn />,
    ua: <EdgevedaEmbedUa />,
  },
  "edgeveda-embed-batch": {
    en: <EdgevedaEmbedBatchEn />,
    ua: <EdgevedaEmbedBatchUa />,
  },
};


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
