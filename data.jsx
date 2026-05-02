// Basic content model used by the portfolio UI
window.I18N = {
  en: {
    nav: { home: 'Home', work: 'Work', workflow: 'Workflow', about: 'About', contact: 'Contact', cv: 'CV' },
    hero: {
      eyebrow: 'AI Technical Writing',
      lede: 'I create developer documentation from code and product context.',
      ctaPrimary: 'View work', ctaSecondary: 'Workflow',
      meta: [{ k: 'Focus', v: 'API & code docs' }, { k: 'Format', v: 'Docs-as-code' }]
    },
    whatIDocument: {
      title: 'What I document',
      subtitle: 'Core areas I cover.',
      cards: [
        { num: '01', title: 'REST API reference', body: 'Endpoint docs, auth guides, error catalogs from OpenAPI and source.' },
        { num: '02', title: 'SDK & library docs', body: 'Method-level reference with examples, types, errors and platform notes.' },
        { num: '03', title: 'Architecture docs', body: 'System diagrams, data flows, component responsibilities from codebase.' },
        { num: '04', title: 'Developer onboarding', body: 'Quickstarts, setup guides, first-run tutorials for new team members.' },
        { num: '05', title: 'AI-assisted workflows', body: 'Prompt design, validation checklists, hybrid AI+human doc pipelines.' },
        { num: '06', title: 'Internal runbooks', body: 'Operational procedures, troubleshooting trees, deployment checklists.' },
      ]
    },
    featured: { title: 'Featured samples', subtitle: 'Selected portfolio pieces.', viewAll: 'All samples' },
    workflow: { title: 'Workflow', subtitle: 'From input to validated docs.', cta: 'Open workflow' },
    tools: {
      title: 'Tooling',
      groups: [
        { label: 'Writing', items: ['Markdown', 'Confluence', 'Docusaurus'] },
        { label: 'Code', items: ['Git', 'GitHub', 'GitLab'] },
        { label: 'API', items: ['OpenAPI', 'Swagger', 'Postman'] },
        { label: 'AI', items: ['Claude', 'GPT-4', 'Prompting'] },
        { label: 'Build', items: ['Jekyll', 'GitHub Pages', 'CI/CD'] },
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
      title: 'Documentation workflow',
      lede: 'A repeatable, AI-assisted process that turns code and product context into validated technical documentation.',
      tocTitle: 'On this page',
      principles: {
        title: 'Operating principles',
        items: [
          { k: 'Accuracy first', v: 'Every claim is verified against source code, API behavior, or SME feedback before publishing.' },
          { k: 'Docs as code', v: 'Documentation lives in Git, ships through PRs, and follows the same review process as product code.' },
          { k: 'AI as hypothesis', v: 'AI drafts are treated as unverified hypotheses until every fact is checked against a ground-truth source.' },
        ]
      },
      checklist: {
        title: 'Hallucination checklist',
        items: [
          'Every API path, method, and status code matches the source or OpenAPI spec.',
          'Every code snippet compiles or runs locally before merge.',
          'Every default value and parameter type is confirmed in source.',
          'No feature is described that does not exist in the current release.',
          'Error names match typed exceptions in the codebase.',
          'Platform support claims are verified on physical devices.',
          'AI-generated content is explicitly marked as draft until validated.',
        ]
      },
      prompts: {
        title: 'Example prompts',
      },
    },

    // ── About page (full structure expected by AboutPage component) ──
    aboutPage: {
      title: 'About me',
      bio: 'I\u2019m an AI-assisted technical writer who creates developer documentation from source code, product context, and engineering conversations. I focus on API references, SDK docs, architecture documentation, and developer onboarding \u2014 the kind of docs that reduce support tickets and help engineers ship faster.',
      bio2: 'My workflow combines direct code analysis with AI-assisted drafting and rigorous technical validation. Every claim in my documentation is checked against source code or confirmed by a subject-matter expert before it ships.',
      coreSkillsTitle: 'Core skills',
      coreSkills: [
        'REST API documentation', 'SDK & library reference', 'OpenAPI / Swagger',
        'Docs-as-code', 'Markdown / Git', 'Confluence & Jira',
        'AI-assisted drafting', 'Prompt engineering', 'Code reading (Dart, JS, Python)',
        'Information architecture', 'Developer onboarding', 'Technical editing',
      ],
      experienceTitle: 'Experience',
      experience: [
        {
          period: '2024 \u2013 present',
          role: 'Lead Technical Writer',
          org: 'NovaDigital',
          body: 'API Gateway documentation, AI-assisted doc generation pipelines, Confluence publishing, team of technical writers.',
        },
        {
          period: '2024 \u2013 present',
          role: 'Technical Writer (part-time)',
          org: 'Neuroshop',
          body: 'AI agent-driven documentation automation, hardware assembly docs, micromarket controller documentation.',
        },
        {
          period: '2023 \u2013 2024',
          role: 'Technical Writer',
          org: 'Freelance / Contract',
          body: 'REST API docs, SDK references, developer onboarding guides for SaaS and fintech products.',
        },
      ],
      engagementTitle: 'Engagement models',
      engagement: [
        'Full-time', 'Part-time / contract', 'Project-based', 'Doc audit & review',
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
      meta: [{ k: 'Фокус', v: 'API та code docs' }, { k: 'Формат', v: 'Docs-as-code' }]
    },
    whatIDocument: {
      title: 'Що документую',
      subtitle: 'Основні напрями.',
      cards: [
        { num: '01', title: 'REST API reference', body: 'Документація endpoint-ів, auth-гайди, каталоги помилок з OpenAPI та коду.' },
        { num: '02', title: 'SDK та бібліотеки', body: 'Довідник методів з прикладами, типами, помилками та платформними нотатками.' },
        { num: '03', title: 'Архітектурні доки', body: 'Діаграми систем, потоки даних, відповідальності компонентів із кодової бази.' },
        { num: '04', title: 'Developer onboarding', body: 'Quickstart-и, гайди налаштування, туторіали першого запуску для нових членів команди.' },
        { num: '05', title: 'AI-assisted workflows', body: 'Промпт-дизайн, чекліси валідації, гібридні AI+людина doc-пайплайни.' },
        { num: '06', title: 'Внутрішні runbooks', body: 'Операційні процедури, дерева troubleshooting, чекліси деплою.' },
      ]
    },
    featured: { title: 'Обрані приклади', subtitle: 'Кейси з портфоліо.', viewAll: 'Усі приклади' },
    workflow: { title: 'Процес', subtitle: 'Від вхідних матеріалів до валідації.', cta: 'Відкрити процес' },
    tools: {
      title: 'Інструменти',
      groups: [
        { label: 'Написання', items: ['Markdown', 'Confluence', 'Docusaurus'] },
        { label: 'Код', items: ['Git', 'GitHub', 'GitLab'] },
        { label: 'API', items: ['OpenAPI', 'Swagger', 'Postman'] },
        { label: 'AI', items: ['Claude', 'GPT-4', 'Prompting'] },
        { label: 'Збірка', items: ['Jekyll', 'GitHub Pages', 'CI/CD'] },
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
      title: 'Процес документації',
      lede: 'Повторюваний AI-assisted процес, який перетворює код і продуктовий контекст на валідовану технічну документацію.',
      tocTitle: 'На цій сторінці',
      principles: {
        title: 'Робочі принципи',
        items: [
          { k: 'Точність понад усе', v: 'Кожне твердження звіряється з кодом, поведінкою API або SME-фідбеком до публікації.' },
          { k: 'Docs as code', v: 'Документація живе в Git, доставляється через PR-и і проходить той самий review, що й код продукту.' },
          { k: 'AI як гіпотеза', v: 'AI-драфти трактуються як неперевірені гіпотези, доки кожен факт не звірено з ground-truth джерелом.' },
        ]
      },
      checklist: {
        title: 'Чекліст галюцинацій',
        items: [
          'Кожен API path, method і status code збігається з кодом або OpenAPI-специфікацією.',
          'Кожен code-сніпет компілюється або запускається локально до merge.',
          'Кожне default value і тип параметра підтверджено в source.',
          'Жодна feature не описана, якщо її немає в поточному релізі.',
          'Назви помилок збігаються з typed exceptions у кодовій базі.',
          'Platform support claims перевірено на фізичних пристроях.',
          'AI-згенерований контент явно позначено як draft до валідації.',
        ]
      },
      prompts: {
        title: 'Приклади промптів',
      },
    },

    // ── About page (full structure) ──
    aboutPage: {
      title: 'Про мене',
      bio: 'Я AI-assisted технічний письменник, який створює документацію для розробників із вихідного коду, продуктового контексту та інженерних розмов. Фокусуюсь на API-довідниках, SDK-документації, архітектурних доках і developer onboarding \u2014 документації, яка зменшує support-тікети і допомагає інженерам швидше релізити.',
      bio2: 'Мій workflow поєднує прямий аналіз коду з AI-assisted драфтингом і строгою технічною валідацією. Кожне твердження в моїй документації перевіряється по source code або підтверджується subject-matter expert-ом до публікації.',
      coreSkillsTitle: 'Ключові навички',
      coreSkills: [
        'REST API документація', 'SDK та library reference', 'OpenAPI / Swagger',
        'Docs-as-code', 'Markdown / Git', 'Confluence та Jira',
        'AI-assisted драфтинг', 'Prompt engineering', 'Читання коду (Dart, JS, Python)',
        'Інформаційна архітектура', 'Developer onboarding', 'Технічне редагування',
      ],
      experienceTitle: 'Досвід',
      experience: [
        {
          period: '2024 \u2013 зараз',
          role: 'Lead Technical Writer',
          org: 'NovaDigital',
          body: 'Документація API Gateway, AI-assisted пайплайни генерації документації, публікація в Confluence, керівництво командою технічних письменників.',
        },
        {
          period: '2024 \u2013 зараз',
          role: 'Technical Writer (part-time)',
          org: 'Neuroshop',
          body: 'AI-агентна автоматизація документації, документація збірки обладнання, документація контролерів мікромаркетів.',
        },
        {
          period: '2023 \u2013 2024',
          role: 'Technical Writer',
          org: 'Фріланс / контракт',
          body: 'REST API документація, SDK-довідники, гайди developer onboarding для SaaS і фінтех-продуктів.',
        },
      ],
      engagementTitle: 'Моделі співпраці',
      engagement: [
        'Full-time', 'Part-time / контракт', 'Проєктна робота', 'Doc audit та review',
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
    input:{en:['Codebase','README','SME notes'], ua:['Кодова база','README','Нотатки SME']},
    output:{en:['Architecture docs','Runbooks','Onboarding'], ua:['Архітектурні доки','Runbook','Onboarding']} }
];
