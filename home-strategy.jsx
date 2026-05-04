// Home page override.
// Purpose: present the portfolio as an AI Documentation Strategist landing page.
// Loaded after components.jsx and before app.jsx.

const HOME_STRATEGY = {
  en: {
    eyebrow: "AI Documentation Strategist",
    heroTitle: <>I design <em>documentation systems</em> for engineering teams.</>,
    lede: "I help teams turn source code, APIs, product logic, and scattered engineering knowledge into documentation that is structured, validated, and maintainable — with AI used as a controlled acceleration layer, not as an unchecked text generator.",
    ctaPrimary: "View work samples",
    ctaSecondary: "See AI workflow",
    meta: [
      { k: "Positioning", v: "AI Documentation Strategist" },
      { k: "Core value", v: "Code → docs → workflow" },
      { k: "Collaboration", v: "Remote · B2B · Vendor · Contract" }
    ],
    panel: {
      title: "Documentation operating model",
      rows: [
        { k: "01 / diagnose", v: "Audit docs, code sources, gaps, owners, and review paths." },
        { k: "02 / design", v: "Create IA, templates, style rules, and update workflow." },
        { k: "03 / produce", v: "Generate drafts from code, OpenAPI, tickets, and SME notes." },
        { k: "04 / validate", v: "Check every technical claim against source code or SME feedback." },
        { k: "05 / maintain", v: "Ship through Git, PR review, changelog, and reusable checklists." }
      ]
    },
    problem: {
      eyebrow: "Problem I solve",
      title: "Engineering teams do not need more random pages. They need a documentation system.",
      subtitle: "Most documentation problems are not writing problems. They are structure, ownership, validation, and maintenance problems.",
      cards: [
        { num: "01", title: "Knowledge is scattered", body: "Important behavior lives in source code, tickets, Slack threads, outdated README files, and individual engineers’ memory." },
        { num: "02", title: "Docs are not trusted", body: "Teams stop using documentation when examples are stale, API details are guessed, and ownership is unclear." },
        { num: "03", title: "AI speeds up drafts, but increases risk", body: "Without a validation workflow, AI-generated docs can introduce hallucinated parameters, wrong flows, or outdated assumptions." }
      ]
    },
    services: {
      eyebrow: "What I build",
      title: "From code and context to reviewed developer documentation",
      subtitle: "I combine technical writing, code analysis, information architecture, and AI-assisted workflows.",
      cards: [
        { num: "01", title: "Documentation strategy & audit", body: "Audit current docs, define gaps, prioritize pages, and create a realistic roadmap for documentation improvements." },
        { num: "02", title: "API & SDK documentation", body: "Write API references, SDK method pages, auth guides, error catalogs, request/response examples, and quickstarts." },
        { num: "03", title: "Code-to-docs workflow", body: "Turn source code, README files, tickets, and SME notes into architecture docs, module references, and runbooks." },
        { num: "04", title: "Developer onboarding", body: "Design setup guides, repo tours, first-run paths, first-PR checklists, and common failure paths for engineers." },
        { num: "05", title: "AI documentation workflow", body: "Create prompt templates, CLARIFY files, validation checklists, review stages, and hallucination controls." },
        { num: "06", title: "Internal engineering docs", body: "Structure Confluence spaces, API Gateway route docs, deployment checklists, release notes, and operational runbooks." }
      ]
    },
    operatingModel: {
      eyebrow: "How I work",
      title: "AI-assisted, human-validated, docs-as-code ready",
      subtitle: "The goal is not to make AI write more text. The goal is to make documentation faster to produce, easier to verify, and safer to maintain.",
      steps: [
        { num: "01", title: "Map the system", body: "Identify audiences, source files, APIs, modules, existing docs, owners, and update triggers.", kind: "input" },
        { num: "02", title: "Create the structure", body: "Define the information architecture, templates, glossary, style rules, and review checklist.", kind: "input" },
        { num: "03", title: "Draft with AI", body: "Use AI to summarize code, compare sources, generate outlines, and produce first drafts as hypotheses.", kind: "ai", badge: "AI" },
        { num: "04", title: "Validate facts", body: "Check endpoints, parameters, DTOs, status codes, examples, configuration, and edge cases against source code.", kind: "validate", badge: "VALIDATE" },
        { num: "05", title: "Publish and maintain", body: "Ship through Markdown, Git, PR review, Confluence, GitHub Pages, update logs, and recurring docs audits.", kind: "input" }
      ]
    },
    samples: {
      eyebrow: "Selected proof",
      title: "Portfolio samples that support this positioning",
      subtitle: "The strongest samples should show process, inputs, validation, and final deliverables — not only finished text.",
      viewAll: "All work samples"
    },
    tools: {
      eyebrow: "Stack",
      title: "Tools and sources I work with",
      groups: [
        { label: "Strategy", items: ["Docs audit", "IA", "Roadmaps", "Style guide"] },
        { label: "Sources", items: ["Source code", "OpenAPI", "README", "Jira", "SME notes"] },
        { label: "Delivery", items: ["Markdown", "Git", "GitHub Pages", "Confluence"] },
        { label: "API / SDK", items: ["REST", "Swagger", "Postman", "DTOs"] },
        { label: "AI / QA", items: ["ChatGPT", "ampcode", "MCP", "Validation checklist"] }
      ]
    },
    finalCta: {
      title: "Need a documentation system, not another scattered wiki?",
      body: "I can help audit your documentation, design a maintainable structure, and build an AI-assisted workflow that turns code and engineering context into reliable developer docs.",
      ctaPrimary: "Contact me",
      ctaSecondary: "See workflow"
    }
  },
  ua: {
    eyebrow: "AI Documentation Strategist",
    heroTitle: <>Проєктую <em>documentation systems</em> для інженерних команд.</>,
    lede: "Допомагаю командам перетворювати source code, API, product logic і розкидані engineering knowledge на документацію зі структурою, validation і зрозумілим maintenance process. AI використовую як контрольований шар прискорення, а не як неконтрольований генератор тексту.",
    ctaPrimary: "Дивитися приклади",
    ctaSecondary: "Дивитися AI workflow",
    meta: [
      { k: "Позиціонування", v: "AI Documentation Strategist" },
      { k: "Цінність", v: "Code → docs → workflow" },
      { k: "Співпраця", v: "Remote · B2B · Vendor · Contract" }
    ],
    panel: {
      title: "Documentation operating model",
      rows: [
        { k: "01 / diagnose", v: "Audit docs, code sources, gaps, owners і review paths." },
        { k: "02 / design", v: "Information architecture, templates, style rules і update workflow." },
        { k: "03 / produce", v: "Drafts із code, OpenAPI, tickets і SME notes." },
        { k: "04 / validate", v: "Кожне technical claim перевіряється по source code або SME feedback." },
        { k: "05 / maintain", v: "Git, PR review, changelog і reusable checklists." }
      ]
    },
    problem: {
      eyebrow: "Проблема, яку вирішую",
      title: "Інженерним командам потрібні не випадкові сторінки, а documentation system.",
      subtitle: "Більшість проблем документації — це не проблема тексту. Це проблема структури, ownership, validation і maintenance.",
      cards: [
        { num: "01", title: "Знання розкидані", body: "Важлива поведінка живе в source code, tickets, Slack threads, застарілих README і пам’яті окремих інженерів." },
        { num: "02", title: "Docs не викликають довіри", body: "Команди перестають користуватися документацією, коли examples застарілі, API details додумані, а ownership нечіткий." },
        { num: "03", title: "AI прискорює drafts, але додає ризик", body: "Без validation workflow AI-generated docs можуть принести вигадані parameters, неправильні flows або застарілі assumptions." }
      ]
    },
    services: {
      eyebrow: "Що я створюю",
      title: "Від code і context до відрев’юваної developer documentation",
      subtitle: "Поєдную technical writing, code analysis, information architecture і AI-assisted workflows.",
      cards: [
        { num: "01", title: "Documentation strategy & audit", body: "Проводжу audit поточних docs, визначаю gaps, пріоритезую сторінки і створюю реалістичний documentation roadmap." },
        { num: "02", title: "API & SDK documentation", body: "Пишу API references, SDK method pages, auth guides, error catalogs, request/response examples і quickstarts." },
        { num: "03", title: "Code-to-docs workflow", body: "Перетворюю source code, README, tickets і SME notes на architecture docs, module references і runbooks." },
        { num: "04", title: "Developer onboarding", body: "Проєктую setup guides, repo tours, first-run paths, first-PR checklists і common failure paths для інженерів." },
        { num: "05", title: "AI documentation workflow", body: "Створюю prompt templates, CLARIFY files, validation checklists, review stages і hallucination controls." },
        { num: "06", title: "Internal engineering docs", body: "Структурую Confluence spaces, API Gateway route docs, deployment checklists, release notes і operational runbooks." }
      ]
    },
    operatingModel: {
      eyebrow: "Як я працюю",
      title: "AI-assisted, human-validated, docs-as-code ready",
      subtitle: "Мета не в тому, щоб AI писав більше тексту. Мета — швидше створювати docs, легше їх перевіряти і безпечніше підтримувати.",
      steps: [
        { num: "01", title: "Map the system", body: "Визначаю audiences, source files, APIs, modules, existing docs, owners і update triggers.", kind: "input" },
        { num: "02", title: "Create the structure", body: "Проєктую information architecture, templates, glossary, style rules і review checklist.", kind: "input" },
        { num: "03", title: "Draft with AI", body: "Використовую AI для summaries, порівняння sources, outlines і first drafts як hypotheses.", kind: "ai", badge: "AI" },
        { num: "04", title: "Validate facts", body: "Перевіряю endpoints, parameters, DTOs, status codes, examples, configuration і edge cases проти source code.", kind: "validate", badge: "VALIDATE" },
        { num: "05", title: "Publish and maintain", body: "Публікую через Markdown, Git, PR review, Confluence, GitHub Pages, update logs і регулярні docs audits.", kind: "input" }
      ]
    },
    samples: {
      eyebrow: "Докази",
      title: "Приклади портфоліо під це позиціонування",
      subtitle: "Найсильніші samples мають показувати process, inputs, validation і deliverables — не лише готовий текст.",
      viewAll: "Усі приклади"
    },
    tools: {
      eyebrow: "Stack",
      title: "Tools і sources, з якими працюю",
      groups: [
        { label: "Strategy", items: ["Docs audit", "IA", "Roadmaps", "Style guide"] },
        { label: "Sources", items: ["Source code", "OpenAPI", "README", "Jira", "SME notes"] },
        { label: "Delivery", items: ["Markdown", "Git", "GitHub Pages", "Confluence"] },
        { label: "API / SDK", items: ["REST", "Swagger", "Postman", "DTOs"] },
        { label: "AI / QA", items: ["ChatGPT", "ampcode", "MCP", "Validation checklist"] }
      ]
    },
    finalCta: {
      title: "Потрібна documentation system, а не ще одна розкидана wiki?",
      body: "Допоможу провести documentation audit, спроєктувати підтримувану структуру і побудувати AI-assisted workflow, який перетворює code та engineering context на надійні developer docs.",
      ctaPrimary: "Написати",
      ctaSecondary: "Дивитися workflow"
    }
  }
};

function StrategyPanel({ data }) {
  return (
    <div className="code-panel" role="img" aria-label="Documentation strategy model">
      <div className="code-panel-header">
        <div className="dot-row"><span className="dot"/><span className="dot"/><span className="dot"/></div>
        <div className="code-panel-tabs">
          <button className="code-panel-tab is-active">strategy.md</button>
          <button className="code-panel-tab">review.yml</button>
        </div>
        <div className="code-panel-meta">docs operating model</div>
      </div>
      <div className="code-panel-body">
        <pre style={{ whiteSpace: "pre-wrap" }}>
          <div><span className="tk-comment"># {data.title}</span>{"\n"}</div>
          {data.rows.map((row) => (
            <div key={row.k} style={{ marginTop: 8 }}>
              <span className="tk-key">{row.k}</span>{"\n"}
              <span className="tk-str">  {row.v}</span>{"\n"}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function StrategySampleCard({ sample, lang }) {
  const input = sample.input?.[lang] || [];
  const output = sample.output?.[lang] || [];
  return (
    <button className="sample-card" onClick={() => { window.location.hash = "#/sample/" + sample.id; }} aria-label={sample.title?.[lang] || sample.id}>
      <div className="tag-list">
        {(sample.tags || []).map((tag) => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <h3>{sample.title?.[lang] || sample.id}</h3>
      <p>{sample.summary?.[lang] || ""}</p>
      <div className="sample-meta">
        <strong>{lang === "en" ? "Input" : "Вхід"}</strong>
        <span>{input.slice(0, 3).join(", ")}</span>
        <strong>{lang === "en" ? "Output" : "Вихід"}</strong>
        <span>{output.slice(0, 3).join(", ")}</span>
      </div>
      <div className="sample-actions">
        <span>{lang === "en" ? "View case" : "Дивитися кейс"}</span>
        <span className="arrow">→</span>
      </div>
    </button>
  );
}

function StrategyCardGrid({ cards, featureIndex = -1 }) {
  return (
    <div className="doc-grid">
      {cards.map((card, index) => (
        <article key={card.num + card.title} className={"doc-card" + (index === featureIndex ? " is-feature" : "")}>
          <span className="num">{card.num}</span>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
        </article>
      ))}
    </div>
  );
}

function HomePage({ lang }) {
  const data = HOME_STRATEGY[lang] || HOME_STRATEGY.en;
  const featured = (window.SAMPLES || [])
    .filter((sample) => sample.featured)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4);

  return (
    <main>
      <section className="hero" style={{ padding: "56px 0 72px" }}>
        <div className="container hero-grid">
          <div className="rise">
            <span className="eyebrow">{data.eyebrow}</span>
            <h1 className="hero-title">{data.heroTitle}</h1>
            <p className="hero-lede">{data.lede}</p>
            <div className="hero-ctas">
              <a className="button button-primary" href="#/work">
                {data.ctaPrimary}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a className="button button-secondary" href="#/workflow">{data.ctaSecondary}</a>
            </div>
            <div className="hero-meta">
              {data.meta.map((item) => (
                <div key={item.k}>
                  <span className="k">{item.k}</span>
                  <span className="v">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <StrategyPanel data={data.panel}/>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">{data.problem.eyebrow}</span>
          <h2 className="section-title">{data.problem.title}</h2>
          <p className="section-subtitle">{data.problem.subtitle}</p>
          <StrategyCardGrid cards={data.problem.cards}/>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">{data.services.eyebrow}</span>
          <h2 className="section-title">{data.services.title}</h2>
          <p className="section-subtitle">{data.services.subtitle}</p>
          <StrategyCardGrid cards={data.services.cards} featureIndex={4}/>
        </div>
      </section>

      <section className="section section--tight" id="workflow-preview">
        <div className="container">
          <span className="eyebrow">{data.operatingModel.eyebrow}</span>
          <h2 className="section-title">{data.operatingModel.title}</h2>
          <p className="section-subtitle">{data.operatingModel.subtitle}</p>
          <div className="workflow-rail">
            {data.operatingModel.steps.map((step) => (
              <div key={step.num} className={"workflow-step is-" + step.kind}>
                <div className="num">{step.num}</div>
                <div className="body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                {step.badge && <div className="badge">{step.badge}</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <a className="button button-secondary" href="#/workflow">
              {data.ctaSecondary}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="eyebrow">{data.samples.eyebrow}</span>
              <h2 className="section-title">{data.samples.title}</h2>
              <p className="section-subtitle">{data.samples.subtitle}</p>
            </div>
            <a className="button button-ghost" href="#/work">
              {data.samples.viewAll}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="samples-grid">
            {featured.map((sample) => <StrategySampleCard key={sample.id} sample={sample} lang={lang}/>)}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <span className="eyebrow">{data.tools.eyebrow}</span>
          <h2 className="section-title">{data.tools.title}</h2>
          <div className="tools-grid">
            {data.tools.groups.map((group) => (
              <div key={group.label} className="tools-group">
                <div className="label">{group.label}</div>
                <div className="items">
                  {group.items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="final-cta">
            <div>
              <h2>{data.finalCta.title}</h2>
              <p>{data.finalCta.body}</p>
            </div>
            <div className="ctas">
              <a className="button button-primary" href="#/contact">{data.finalCta.ctaPrimary}</a>
              <a className="button button-secondary" href="#/workflow">{data.finalCta.ctaSecondary}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Keep the rest of the site intact; override only the Home page.
window.HomePage = HomePage;

// Small copy improvements for shared navigation and contact texts.
if (window.I18N) {
  window.I18N.en.nav.work = "Work Samples";
  window.I18N.en.nav.workflow = "AI Workflow";
  window.I18N.en.hero.eyebrow = "AI Documentation Strategist";
  window.I18N.ua.nav.work = "Приклади робіт";
  window.I18N.ua.nav.workflow = "AI Workflow";
  window.I18N.ua.hero.eyebrow = "AI Documentation Strategist";
}
