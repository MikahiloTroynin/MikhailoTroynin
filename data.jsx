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
    whatIDocument: { title: 'What I document', subtitle: 'Core areas I cover.', cards: [1,2,3,4,5,6].map((n)=>({num:String(n).padStart(2,'0'), title:'Documentation area', body:'API, onboarding, architecture, workflows.'})) },
    featured: { title: 'Featured samples', subtitle: 'Selected portfolio pieces.', viewAll: 'All samples' },
    workflow: { title: 'Workflow', subtitle: 'From input to validated docs.', cta: 'Open workflow' },
    tools: { title: 'Tooling', groups: [{label:'Docs',items:['Markdown','GitHub Pages']},{label:'AI',items:['ChatGPT','Prompting']}] },
    finalCta: { title: 'Need documentation?', body: 'Let’s discuss your docs tasks.', ctaPrimary: 'Contact', ctaSecondary: 'Download CV' },
    workPage: { title:'Work samples', subtitle:'Documentation examples.', filters:['All','API Docs','Code-to-Docs','Developer Onboarding','AI Workflow','Internal Docs'], input:'Input', output:'Output', view:'View case', github:'Open on GitHub' },
    workflowPage: { title:'Documentation workflow', subtitle:'A repeatable process.', steps:[{title:'Collect input',body:'Code, tasks, SME context.'},{title:'Draft',body:'Structure and first draft with AI.'},{title:'Validate',body:'Verify all claims in code.'},{title:'Publish',body:'Deliver docs and maintain.'}], principles:['Accuracy first','Docs as code','Fast iterations'] },
    aboutPage: { title:'About me', subtitle:'AI technical writer.', paragraphs:['I write practical technical docs.','I focus on clarity and correctness.'] },
    contactPage: { title:'Contact', subtitle:'Open for projects.', email:'mikhailo@example.com', telegram:'@mikhailo', cta:'Send message' }
  },
  ua: {
    nav: { home: 'Головна', work: 'Роботи', workflow: 'Процес', about: 'Про мене', contact: 'Контакти', cv: 'CV' },
    hero: { eyebrow: 'AI Technical Writing', lede: 'Створюю документацію для розробників на основі коду.', ctaPrimary: 'Дивитися роботи', ctaSecondary: 'Процес', meta: [{ k: 'Фокус', v: 'API та code docs' }, { k: 'Формат', v: 'Docs-as-code' }] },
    whatIDocument: { title: 'Що документую', subtitle: 'Основні напрями.', cards: [1,2,3,4,5,6].map((n)=>({num:String(n).padStart(2,'0'), title:'Напрям документації', body:'API, onboarding, архітектура, процеси.'})) },
    featured: { title: 'Обрані приклади', subtitle: 'Кейси з портфоліо.', viewAll: 'Усі приклади' },
    workflow: { title: 'Процес', subtitle: 'Від вхідних матеріалів до валідації.', cta: 'Відкрити процес' },
    tools: { title: 'Інструменти', groups: [{label:'Docs',items:['Markdown','GitHub Pages']},{label:'AI',items:['ChatGPT','Prompting']}] },
    finalCta: { title: 'Потрібна документація?', body: 'Обговоримо ваше завдання.', ctaPrimary: 'Контакти', ctaSecondary: 'Завантажити CV' },
    workPage: { title:'Приклади робіт', subtitle:'Приклади технічної документації.', filters:['Усі','API Docs','Code-to-Docs','Developer Onboarding','AI Workflow','Internal Docs'], input:'Вхід', output:'Вихід', view:'Дивитися кейс', github:'Відкрити на GitHub' },
    workflowPage: { title:'Процес документації', subtitle:'Повторюваний підхід.', steps:[{title:'Збір даних',body:'Код, задачі, контекст SME.'},{title:'Драфт',body:'Структура і перший драфт з AI.'},{title:'Валідація',body:'Перевірка всіх тверджень у коді.'},{title:'Публікація',body:'Поставка і підтримка документації.'}], principles:['Точність', 'Docs as code', 'Швидкі ітерації'] },
    aboutPage: { title:'Про мене', subtitle:'AI technical writer.', paragraphs:['Пишу практичну технічну документацію.','Фокус на ясності та коректності.'] },
    contactPage: { title:'Контакти', subtitle:'Відкритий до проєктів.', email:'mikhailo@example.com', telegram:'@mikhailo', cta:'Написати' }
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
