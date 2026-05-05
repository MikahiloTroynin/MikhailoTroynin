// Basic content model used by the portfolio UI
window.I18N = {
  en: {
    nav: { home: 'Home', work: 'Work', workflow: 'Workflow', about: 'About', contact: 'Contact', cv: 'CV' },
    hero: {
      eyebrow: 'AI Technical Writing',
      lede: 'I create developer documentation from code and product context.',
      ctaPrimary: 'View work', ctaSecondary: 'Workflow',
      meta: [{ k: 'Focus', v: 'API Gateway docs' }, { k: 'Format', v: 'Docs-as-code' }]
    },
    whatIDocument: {
      title: 'What I document',
      subtitle: 'Core areas I cover.',
      cards: [
        { num: '01', title: 'REST API reference', body: 'Endpoint docs, auth guides, error catalogs from OpenAPI and source.' },
        { num: '02', title: 'SDK & library docs', body: 'Method-level reference with examples, types, errors and platform notes.' },
        { num: '03', title: 'Architecture docs', body: 'System diagrams, data flows, component responsibilities from codebase.' },
        { num: '04', title: 'Developer onboarding', body: 'Quickstarts, setup guides, first-run tutorials for new team members.' },
        { num: '05', title: 'AI-assisted workflows', body: 'ampcode pipelines, CLARIFY files, impact logs, validation checklists, and human review.' },
        { num: '06', title: 'Internal runbooks', body: 'Operational procedures, troubleshooting trees, deployment checklists.' },
      ]
    },
    featured: { title: 'Featured samples', subtitle: 'Selected portfolio pieces.', viewAll: 'All samples' },
    workflow: { title: 'API Gateway documentation process', subtitle: 'A Git-based ampcode flow for documenting API Gateway routes by module.', cta: 'Open workflow' },
    tools: {
      title: 'Tooling',
      groups: [
        { label: 'Writing', items: ['Markdown', 'Docs-as-code', 'Templates'] },
        { label: 'Code', items: ['Git', 'GitHub', 'GitLab'] },
        { label: 'API', items: ['Routes', 'DTOs', 'OpenAPI'] },
        { label: 'AI', items: ['ampcode', 'MCP', 'CLARIFY'] },
        { label: 'Delivery', items: ['Git repo', 'MR review', 'Impact Log'] },
      ]
    },
    finalCta: { title: 'Need documentation?', body: 'Let\u2019s discuss your docs tasks.', ctaPrimary: 'Contact', ctaSecondary: 'Download CV' },

    // ── Work page ──
    workPage: {
      title: 'Work samples',
      subtitle: 'Documentation examples.',
      filters: ['All', 'API Docs', 'Code-to-Docs', 'Developer Onboarding', 'AI Workflow', 'Internal Docs'],
      input: 'Input', output: 'Output', view: 'View case', github: 'Open on GitHub'
    },

    // ── Workflow page (full structure expected by WorkflowPage component) ──
    workflowPage: {
      title: 'API Gateway route documentation workflow',
      lede: 'A specialized ampcode workflow for documenting API Gateway routes by module: codebase mapping, CLARIFY questions for SMEs, document generation from a V.4 template, verification, and publication in Git.',
      tocTitle: 'On this page',
      principles: {
        title: 'Operating principles',
        items: [
          { k: 'Map before documenting', v: 'ampcode first builds a code navigation index: route files, modules, Action classes, clients, configuration, middleware, and authorization guards.' },
          { k: 'Interview before generation', v: 'Before drafting, ampcode analyzes code and Jira context, creates a CLARIFY file, and asks closed SME questions with fallback assumptions.' },
          { k: 'Human in the loop', v: 'Every generated module document is checked by the technical writer before commit. Unverified facts stay marked with a warning.' },
        ]
      },
      checklist: {
        title: 'Verification checklist',
        items: [
          'Every documented route URL, HTTP method, channel, middleware, and Action class exists in the source code.',
          'The module document follows AG-Draft_Module_Template_V4.md and covers all required sections.',
          'Request parameters are checked against FormRequest, Request DTOs, validation rules, and glossary entries.',
          'Response structure is checked against Response DTOs, return values, and exception handling.',
          'Proxy chain is verified: Action → Service → Client, raw pass-through, or orchestration with multiple clients.',
          'Feature flags, disabled_routes, environments, DI bindings, Graylog context, and external integrations are verified.',
          'All SME answers from the CLARIFY file are applied; unanswered questions use fallback with a warning marker.',
          'Mermaid sequence diagram renders correctly and reflects the real route-processing flow.',
          'AG-Endpoints_Registry.md and Documentation_Updates_Log.md are updated after publication.',
        ]
      },
      prompts: {
        title: 'Example ampcode prompts',
      },
    },

    // ── About page (full structure expected by AboutPage component) ──
    aboutPage: {
      title: 'About me',
      sidebarRole: 'AI Product Documentation Strategist',
      sidebarEmail: 'mihajlotrojnin@gmail.com',
      sidebarLocation: 'Kyiv, Ukraine (remote, US + EU)',
      bio: 'AI Product Documentation Strategist with 7+ years in technical documentation and 2+ years of active AI tool integration. Created 100+ documents using AI-assisted workflows, developed 15+ custom AI skills for documentation tasks \u2014 achieving 5x+ faster document creation compared to the traditional approach.',
      bio2: 'My specialization is building the full AI documentation cycle: from codebase exploration through MCP server setup and AI agent creation to automated generation and validation. Hands-on experience with Claude Code, AMP Code, Cursor, Codex. Deep understanding of Claude, Gemini, ChatGPT, Qwen, and Kimi models.',
      metricsTitle: 'Key metrics',
      metrics: [
        { k: '100+', v: 'documents created with AI tools' },
        { k: '15+', v: 'custom AI skills for documentation tasks' },
        { k: '5x+', v: 'faster documentation vs. manual process' },
        { k: '5', v: 'MCP servers configured and integrated' },
        { k: '40%', v: 'onboarding time reduction via unified API docs' },
      ],
      coreSkillsTitle: 'Core skills',
      coreSkills: [
        'AI Documentation Strategy', 'Prompt Engineering', 'Claude Code / AMP Code',
        'MCP Servers', 'REST API documentation', 'OpenAPI 3.0 / Swagger',
        'Docs-as-code', 'Hallucination Prevention', 'Codebase-to-Docs',
        'Markdown / Git', 'Confluence & Jira', 'BPMN 2.0 / UML',
        'Docker / Kubernetes', 'Developer Onboarding', 'Technical Editing',
      ],
      experienceTitle: 'Experience',
      experience: [
        {
          period: '2024 \u2013 present',
          role: 'AI Product Documentation Strategist',
          org: 'NovaDigital LLC',
          body: 'AI documentation strategy for 15+ Backend (Java, PHP8) and Frontend (React, TypeScript) projects. Created 100+ documents with 5x+ speed using AI-assisted workflow. Built 15+ custom AI skills, integrated 5 MCP servers (GitHub, GitLab, Atlassian/Jira, Filesystem, Memory). Implemented hallucination prevention checklist. Reduced developer onboarding by 40%.',
        },
        {
          period: '2023 \u2013 2024',
          role: 'Lead Business Analyst / Team Lead Technical Writers',
          org: 'State Enterprise \u201ceHealth\u201d',
          body: 'Managed a team of 7 technical writers. Modelled AS IS / TO BE business processes for 20+ medical applications (UML, BPMN, ER diagrams). API documentation for 15+ medical services per FHIR standards. Documentation for the eHealth system serving 40+ million Ukrainians.',
        },
        {
          period: '2021 \u2013 2022',
          role: 'Technical Writer',
          org: 'Metinvest Digital LLC',
          body: 'User documentation for multi-platform products: Web, Android, iOS, Chatbot. API documentation in Postman for industrial IoT systems. SLA, OLA, Product Passport, Release Notes. Content localisation for international projects.',
        },
      ],
      engagementTitle: 'Engagement models',
      engagement: [
        'Full-time remote', 'Part-time / contract', 'Project-based', 'Doc audit & review',
      ],
      languagesTitle: 'Languages',
      languages: [
        { lang: 'Ukrainian', level: 'Native' },
        { lang: 'English', level: 'Upper-Intermediate (B2)' },
        { lang: 'German', level: 'Intermediate' },
      ],
    },

    // ── Contact page (full structure expected by ContactPage component) ──
    contactPage: {
      title: 'Contact',
      lede: 'Open for documentation projects, contract work, and consulting.',
      formTitle: 'Send a message',
      labels: {
        name: 'Name',
        email: 'Email',
        company: 'Company',
        topic: 'Topic',
        message: 'Message',
        send: 'Send message',
      },
      topics: [
        'API documentation',
        'SDK / library docs',
        'Developer onboarding',
        'Doc audit / review',
        'AI workflow consulting',
        'Other',
      ],
      directTitle: 'Or reach out directly',
      responseNote: 'I usually respond within 24 hours on weekdays.',
    },
  },

  ua: {
    nav: { home: 'Головна', work: 'Роботи', workflow: 'Процес', about: 'Про мене', contact: 'Контакти', cv: 'CV' },
    hero: {
      eyebrow: 'AI Technical Writing',
      lede: 'Створюю документацію для розробників на основі коду та продуктового контексту.',
      ctaPrimary: 'Дивитися роботи', ctaSecondary: 'Процес',
      meta: [{ k: 'Фокус', v: 'API Gateway docs' }, { k: 'Формат', v: 'Docs-as-code' }]
    },
    whatIDocument: {
      title: 'Що документую',
      subtitle: 'Основні напрями.',
      cards: [
        { num: '01', title: 'REST API reference', body: 'Документація endpoint-ів, auth-гайди, каталоги помилок з OpenAPI та коду.' },
        { num: '02', title: 'SDK та бібліотеки', body: 'Довідник методів з прикладами, типами, помилками та платформними нотатками.' },
        { num: '03', title: 'Архітектурні доки', body: 'Діаграми систем, потоки даних, відповідальності компонентів із кодової бази.' },
        { num: '04', title: 'Developer onboarding', body: 'Quickstart-и, гайди налаштування, туторіали першого запуску для нових членів команди.' },
        { num: '05', title: 'AI-assisted workflows', body: 'ampcode pipelines, CLARIFY-файли, impact logs, validation checklists і human review.' },
        { num: '06', title: 'Внутрішні runbooks', body: 'Операційні процедури, дерева troubleshooting, чекліси деплою.' },
      ]
    },
    featured: { title: 'Обрані приклади', subtitle: 'Кейси з портфоліо.', viewAll: 'Усі приклади' },
    workflow: { title: 'Процес документування API Gateway', subtitle: 'Git-based ampcode flow для документування роутів API Gateway по модулях.', cta: 'Відкрити процес' },
    tools: {
      title: 'Інструменти',
      groups: [
        { label: 'Написання', items: ['Markdown', 'Docs-as-code', 'Шаблони'] },
        { label: 'Код', items: ['Git', 'GitHub', 'GitLab'] },
        { label: 'API', items: ['Routes', 'DTOs', 'OpenAPI'] },
        { label: 'AI', items: ['ampcode', 'MCP', 'CLARIFY'] },
        { label: 'Доставка', items: ['Git repo', 'MR review', 'Impact Log'] },
      ]
    },
    finalCta: { title: 'Потрібна документація?', body: 'Обговоримо ваше завдання.', ctaPrimary: 'Контакти', ctaSecondary: 'Завантажити CV' },

    // ── Work page ──
    workPage: {
      title: 'Приклади робіт',
      subtitle: 'Приклади технічної документації.',
      filters: ['Усі', 'API Docs', 'Code-to-Docs', 'Developer Onboarding', 'AI Workflow', 'Internal Docs'],
      input: 'Вхід', output: 'Вихід', view: 'Дивитися кейс', github: 'Відкрити на GitHub'
    },

    // ── Workflow page (full structure) ──
    workflowPage: {
      title: 'Єдиний flow документування роутів API Gateway',
      lede: 'Спеціалізований ampcode workflow для опису роутів API Gateway по модулях: розвідка кодової бази, CLARIFY-питання до SME, генерація документа за шаблоном V.4, верифікація та публікація в Git.',
      tocTitle: 'На цій сторінці',
      principles: {
        title: 'Робочі принципи',
        items: [
          { k: 'Map before documenting', v: 'Перед генерацією ampcode створює навігаційний індекс коду: route-файли, модулі, Action-класи, clients, config, middleware та auth guards.' },
          { k: 'Інтерв\u2019ю перед генерацією', v: 'Після аналізу коду та Jira ampcode створює CLARIFY-файл із закритими питаннями до SME, fallback-припущеннями та готовим prompt для нового треду.' },
          { k: 'Human-in-the-loop', v: 'Кожен згенерований документ перевіряється техрайтером перед commit. Усе непідтверджене залишається з маркером попередження.' },
        ]
      },
      checklist: {
        title: 'Чекліст верифікації',
        items: [
          'Кожен Route URL, HTTP method, channel, middleware та Action class існує в source code.',
          'Документ модуля відповідає AG-Draft_Module_Template_V4.md і заповнює всі потрібні секції.',
          'Request parameters перевірені через FormRequest, Request DTOs, validation rules та glossary.',
          'Response structure перевірена через Response DTOs, return values та exception handling.',
          'Proxy chain перевірений: Action → Service → Client, raw pass-through або orchestration з кількома clients.',
          'Feature flags, disabled_routes, environments, DI bindings, Graylog context та external integrations перевірені.',
          'Відповіді SME з CLARIFY-файлу враховані; питання без відповіді використовують fallback із warning marker.',
          'Mermaid sequence diagram коректно рендериться і відображає реальний route-processing flow.',
          'AG-Endpoints_Registry.md та Documentation_Updates_Log.md оновлені після публікації.',
        ]
      },
      prompts: {
        title: 'Приклади prompt-ів для ampcode',
      },
    },

    // ── About page (full structure) ──
    aboutPage: {
      title: 'Про мене',
      sidebarRole: 'AI Product Documentation Strategist',
      sidebarEmail: 'mihajlotrojnin@gmail.com',
      sidebarLocation: 'Київ, Україна (remote, US + EU)',
      bio: 'AI Product Documentation Strategist із 7+ роками досвіду в технічній документації та 2+ роками активного впровадження AI-інструментів. Створив 100+ документів за допомогою AI-assisted workflow, розробив 15+ власних AI-скілів для документаційних задач \u2014 прискорення у 5x+ порівняно з традиційним підходом.',
      bio2: 'Спеціалізація \u2014 побудова повного циклу AI-документації: від розвідки кодової бази через налаштування MCP-серверів і створення AI-агентів до автоматизованої генерації та валідації. Практичний досвід з Claude Code, AMP Code, Cursor, Codex. Глибоке розуміння моделей Claude, Gemini, ChatGPT, Qwen, Kimi.',
      metricsTitle: 'Ключові метрики',
      metrics: [
        { k: '100+', v: 'документів створено з використанням AI-інструментів' },
        { k: '15+', v: 'власних AI-скілів для документаційних задач' },
        { k: '5x+', v: 'прискорення порівняно з ручним процесом' },
        { k: '5', v: 'MCP-серверів налаштовано та інтегровано' },
        { k: '40%', v: 'скорочення часу onboarding завдяки уніфікованій API-документації' },
      ],
      coreSkillsTitle: 'Ключові навички',
      coreSkills: [
        'AI Documentation Strategy', 'Prompt Engineering', 'Claude Code / AMP Code',
        'MCP-сервери', 'REST API документація', 'OpenAPI 3.0 / Swagger',
        'Docs-as-code', 'Hallucination Prevention', 'Codebase-to-Docs',
        'Markdown / Git', 'Confluence та Jira', 'BPMN 2.0 / UML',
        'Docker / Kubernetes', 'Developer Onboarding', 'Технічне редагування',
      ],
      experienceTitle: 'Досвід',
      experience: [
        {
          period: '2024 \u2013 зараз',
          role: 'AI Product Documentation Strategist',
          org: 'NovaDigital LLC',
          body: 'Розробка стратегії AI-документації для 15+ Backend (Java, PHP8) і Frontend (React, TypeScript) проєктів. Створення 100+ документів із прискоренням 5x+ завдяки AI-assisted workflow. Розробка 15+ AI-скілів, інтеграція 5 MCP-серверів (GitHub, GitLab, Atlassian/Jira, Filesystem, Memory). Впровадження hallucination prevention checklist. Скорочення onboarding розробників на 40%.',
        },
        {
          period: '2023 \u2013 2024',
          role: 'Lead Business Analyst / Team Lead Technical Writers',
          org: 'ДП «Електронне здоров'я»',
          body: 'Управління командою 7 технічних письменників. Моделювання бізнес-процесів AS IS / TO BE для 20+ медичних застосунків (UML, BPMN, ER-діаграми). API-документація для 15+ медичних сервісів відповідно до стандартів FHIR. Документація для системи eHealth, що обслуговує 40+ мільйонів українців.',
        },
        {
          period: '2021 \u2013 2022',
          role: 'Technical Writer',
          org: 'Metinvest Digital LLC',
          body: 'User-документація для мультиплатформних продуктів: Web, Android, iOS, Chatbot. API-документація в Postman для промислових IoT-систем. Документація SLA, OLA, Product Passport, Release Notes. Локалізація контенту для міжнародних проєктів.',
        },
      ],
      engagementTitle: 'Моделі співпраці',
      engagement: [
        'Full-time remote', 'Part-time / контракт', 'Проєктна робота', 'Doc audit та review',
      ],
      languagesTitle: 'Мови',
      languages: [
        { lang: 'Українська', level: 'Рідна' },
        { lang: 'Англійська', level: 'Upper-Intermediate (B2)' },
        { lang: 'Німецька', level: 'Intermediate' },
      ],
    },

    // ── Contact page (full structure) ──
    contactPage: {
      title: 'Контакти',
      lede: 'Відкритий до проєктів з документації, контрактної роботи та консультацій.',
      formTitle: 'Надіслати повідомлення',
      labels: {
        name: "Ім'я",
        email: 'Email',
        company: 'Компанія',
        topic: 'Тема',
        message: 'Повідомлення',
        send: 'Надіслати',
      },
      topics: [
        'API документація',
        'SDK / library docs',
        'Developer onboarding',
        'Doc audit / review',
        'AI workflow консалтинг',
        'Інше',
      ],
      directTitle: 'Або напишіть напряму',
      responseNote: 'Зазвичай відповідаю протягом 24 годин у робочі дні.',
    },
  }
};

window.SAMPLES = [
  { id:'rest-api-docs', featured:true, order:1, category:'API Docs', tools:['Markdown','OpenAPI'], tags:['API','Reference'],
    title:{en:'REST API documentation', ua:'Документація REST API'},
    summary:{en:'Structured API reference and guides.', ua:'Структурована API довідка та гайди.'},
    input:{en:['Source code','PRD','Tickets'], ua:['Вихідний код','PRD','Тікети']},
    output:{en:['Reference','Examples','Changelog'], ua:['Довідка','Приклади','Changelog']} },
  { id:'code-to-docs', featured:true, order:2, category:'Code-to-Docs', tools:['Git','Markdown'], tags:['Architecture','Onboarding'],
    title:{en:'Codebase to docs', ua:'Codebase у документацію'},
    summary:{en:'Turned scattered knowledge into docs.', ua:'Перетворив розрізнені знання у документацію.'},
    input:{en:['Codebase','README','SME notes'], ua:['Кодова база','README','SME-нотатки']},
    output:{en:['Architecture docs','Runbooks','Onboarding'], ua:['Архітектурні доки','Runbook','Onboarding']} }
];
