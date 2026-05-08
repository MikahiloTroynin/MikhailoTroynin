// Home page override.
// Purpose: present the portfolio as an AI Documentation Strategist landing page.
// Loaded after components.jsx and before app.jsx.

const HOME_STRATEGY = {
  en: {
    eyebrow: "AI Product Documentation Strategist",
    heroTitle: <>I design <em>AI documentation systems</em> for engineering teams.</>,
    lede: "7 years in tech writing, 2 with AI. I help engineering teams ship API references, SDK docs, and onboarding developers trust — 5× faster with AI, validated against source code.",
    ctaPrimary: "View work samples",
    ctaSecondary: "See AI workflow",
    meta: [
      { k: "Location", v: "Remote · EU / US time zones" },
      { k: "Engagement", v: "B2B · Contract · Vendor" },
      { k: "Response time", v: "Within 24 hours" }
    ],
    impact: {
      eyebrow: "Impact",
      title: "Proof in numbers",
      subtitle: "Real results from AI-assisted documentation work.",
      items: [
        { value: "100+", label: "Documents built with AI" },
        { value: "5×", label: "Faster than manual drafting" },
        { value: "40%", label: "Faster developer onboarding" },
        { value: "15+", label: "Custom AI skills built" }
      ]
    },
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
        { num: "01", title: "API & SDK documentation", body: "REST API references and SDK docs for 25+ projects. Validated against OpenAPI specs and real API responses, not guessed." },
        { num: "02", title: "Codebase documentation", body: "Architecture docs for 15+ microservices. Module references, data flows, and component responsibilities mapped from source code." },
        { num: "03", title: "Developer onboarding", body: "Onboarding docs for platforms with 40M+ users — FHIR, eHealth, fintech. Setup guides that cut ramp time by 40%." },
        { num: "04", title: "Internal engineering docs", body: "Confluence structures, module references, deployment checklists, and runbooks for enterprise engineering teams." },
        { num: "05", title: "AI documentation workflow", body: "Claude Code, 5 MCP servers, 15+ custom skills. Hallucination prevention built into every step of the workflow." },
        { num: "06", title: "Documentation strategy & audit", body: "Gap analysis, IA design, style guides, and roadmaps for teams that outgrew scattered wikis and README files." }
      ]
    },
    operatingModel: {
      eyebrow: "How I work",
      title: "AI-assisted, human-validated, docs-as-code ready",
      subtitle: "The goal is not to make AI write more text. The goal is to make documentation faster to produce, easier to verify, and safer to maintain.",
      steps: [
        { num: "01", title: "Map the system", body: "Identify audiences, source files, public interfaces, modules, existing docs, owners, and update triggers.", kind: "input" },
        { num: "02", title: "Create the structure", body: "Define the information architecture, templates, glossary, style rules, and review checklist.", kind: "input" },
        { num: "03", title: "Interview SMEs (CLARIFY)", body: "Generate a CLARIFY file with closed questions for the subject-matter expert and explicit fallback assumptions for unanswered items.", kind: "input" },
        { num: "04", title: "Draft with AI", body: "Use AI to summarize code, compare sources, generate outlines, and produce first drafts as hypotheses anchored to the source.", kind: "ai", badge: "AI" },
        { num: "05", title: "Validate facts", body: "Check every claim — entities, parameters, types, status codes, examples, configuration, edge cases — against source code or recorded SME answers.", kind: "validate", badge: "VALIDATE" },
        { num: "06", title: "Publish and maintain", body: "Ship through Markdown, Git, PR review, Confluence, GitHub Pages, update logs, and recurring docs audits.", kind: "input" }
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
        { label: "Strategy", items: ["Docs audit", "IA", "Roadmaps", "Style guide", "Templates"] },
        { label: "Sources", items: ["Source code", "OpenAPI", "README", "Jira", "GitLab", "Confluence", "Slack threads"] },
        { label: "Delivery", items: ["Markdown", "Git", "GitHub Pages", "Confluence", "MR review", "Impact Log"] },
        { label: "API / SDK", items: ["REST", "Swagger", "Postman", "DTOs", "OpenAPI 3.0", "YAML"] },
        { label: "AI / QA", items: ["Claude Code", "ampcode", "Gemini", "Qwen", "Kimi", "MCP", "CLARIFY"] }
      ]
    },
    finalCta: {
      title: "Need an AI documentation strategy, not just a writer?",
      body: "I design workflows, build templates, and ship validated docs from your code — at 5× the speed of manual writing.",
      ctaPrimary: "Contact me",
      ctaSecondary: "See AI workflow"
    }
  },
  ua: {
    eyebrow: "AI Product Documentation Strategist",
    heroTitle: <>Проєктую <em>AI documentation systems</em> для інженерних команд.</>,
    lede: "7 років у technical writing, 2 з AI. Допомагаю інженерним командам публікувати API references, SDK docs і onboarding, яким довіряють розробники — у 5× швидше з AI, валідовано по source code.",
    ctaPrimary: "Дивитися приклади",
    ctaSecondary: "Дивитися AI workflow",
    meta: [
      { k: "Локація", v: "Remote · EU / US timezone" },
      { k: "Формат", v: "B2B · Контракт · Vendor" },
      { k: "Відповідь", v: "Протягом 24 годин" }
    ],
    impact: {
      eyebrow: "Результати",
      title: "Цифри замість слів",
      subtitle: "Реальні дані з AI-assisted документаційних проєктів.",
      items: [
        { value: "100+", label: "Документів створено з AI" },
        { value: "5×", label: "Швидше за ручний процес" },
        { value: "40%", label: "Швидше onboarding" },
        { value: "15+", label: "Власних AI-скілів" }
      ]
    },
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
        { num: "01", title: "API & SDK documentation", body: "REST API references і SDK docs для 25+ проєктів. Валідовано по OpenAPI specs і реальних API responses — без додумування." },
        { num: "02", title: "Codebase documentation", body: "Архітектурні docs для 15+ мікросервісів. Module references, data flows і відповідальності компонентів із source code." },
        { num: "03", title: "Developer onboarding", body: "Onboarding docs для платформ з 40M+ користувачів — FHIR, eHealth, fintech. Setup guides, що скорочують onboarding на 40%." },
        { num: "04", title: "Internal engineering docs", body: "Confluence structures, module references, deployment checklists і runbooks для enterprise інженерних команд." },
        { num: "05", title: "AI documentation workflow", body: "Claude Code, 5 MCP серверів, 15+ власних скілів. Hallucination prevention вбудований у кожен крок workflow." },
        { num: "06", title: "Documentation strategy & audit", body: "Gap analysis, IA-дизайн, style guides і roadmaps для команд, що переросли розкидані wiki та README файли." }
      ]
    },
    operatingModel: {
      eyebrow: "Як я працюю",
      title: "AI-assisted, human-validated, docs-as-code ready",
      subtitle: "Мета не в тому, щоб AI писав більше тексту. Мета — швидше створювати docs, легше їх перевіряти і безпечніше підтримувати.",
      steps: [
        { num: "01", title: "Досліджую систему", body: "Визначаю audiences, source files, публічні інтерфейси, modules, existing docs, owners і update triggers.", kind: "input" },
        { num: "02", title: "Створюю структуру", body: "Проєктую information architecture, templates, glossary, style rules і review checklist.", kind: "input" },
        { num: "03", title: "Опитую SME (CLARIFY)", body: "Генерую CLARIFY-файл із закритими питаннями до SME та явними fallback-припущеннями для пунктів без відповіді.", kind: "input" },
        { num: "04", title: "Генерую чернетки з AI", body: "Використовую AI для summaries, порівняння sources, outlines і first drafts як hypotheses, прив’язаних до джерел.", kind: "ai", badge: "AI" },
        { num: "05", title: "Перевіряю факти", body: "Перевіряю кожне твердження — сутності, parameters, типи, status codes, examples, configuration, edge cases — проти source code або зафіксованих відповідей SME.", kind: "validate", badge: "VALIDATE" },
        { num: "06", title: "Публікую і підтримую", body: "Публікую через Markdown, Git, PR review, Confluence, GitHub Pages, update logs і регулярні docs audits.", kind: "input" }
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
        { label: "Strategy", items: ["Docs audit", "IA", "Roadmaps", "Style guide", "Templates"] },
        { label: "Sources", items: ["Source code", "OpenAPI", "README", "Jira", "GitLab", "Confluence", "Slack threads"] },
        { label: "Delivery", items: ["Markdown", "Git", "GitHub Pages", "Confluence", "MR review", "Impact Log"] },
        { label: "API / SDK", items: ["REST", "Swagger", "Postman", "DTOs", "OpenAPI 3.0", "YAML"] },
        { label: "AI / QA", items: ["Claude Code", "ampcode", "Gemini", "Qwen", "Kimi", "MCP", "CLARIFY"] }
      ]
    },
    finalCta: {
      title: "Потрібна AI documentation strategy, а не просто райтер?",
      body: "Проєктую workflows, будую шаблони і публікую валідовані docs з вашого коду — у 5× швидше за ручний процес.",
      ctaPrimary: "Написати",
      ctaSecondary: "Дивитися AI workflow"
    }
  }
};

function ImpactSection({ data }) {
  return (
    <section className="section section--tight">
      <div className="container">
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{data.title}</h2>
        <p className="section-subtitle">{data.subtitle}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "24px", marginTop: "32px" }}>
          {data.items.map((item) => (
            <div key={item.label} style={{ textAlign: "center", padding: "24px 16px", border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "2.5rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>{item.value}</div>
              <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--color-text-muted)", letterSpacing: ".04em" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
          <div className="rise" style={{ animationDelay: "120ms", paddingTop: "38px" }}>
            <StrategyPanel data={data.panel}/>
          </div>
        </div>
      </section>

      <ImpactSection data={data.impact}/>

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
  window.I18N.en.hero.eyebrow = "AI Product Documentation Strategist";
  window.I18N.ua.nav.work = "Приклади робіт";
  window.I18N.ua.nav.workflow = "AI Workflow";
  window.I18N.ua.hero.eyebrow = "AI Product Documentation Strategist";
}
