// Edge Veda documentation pages metadata (non-API)
// Each entry: { slug, category, title: {en, ua} }

const EDGE_VEDA_DOCS = {
  categories: [
    {
      id: "getting-started",
      title: { en: "Getting Started", ua: "Початок роботи" },
      icon: "🚀",
      docs: [
        { slug: "gs-overview", title: { en: "Overview", ua: "Огляд" }, file: { en: "overview_en.md", ua: "overview_ua.md" } },
        { slug: "gs-installation", title: { en: "Installation", ua: "Встановлення" }, file: { en: "installation_en.md", ua: "installation_ua.md" } },
        { slug: "gs-model-setup", title: { en: "Model Setup", ua: "Налаштування моделі" }, file: { en: "model-setup_en.md", ua: "model-setup_ua.md" } },
        { slug: "gs-first-text-generation", title: { en: "First Text Generation", ua: "Перша генерація тексту" }, file: { en: "first-text-generation_en.md", ua: "first-text-generation_ua.md" } },
        { slug: "gs-first-streaming-chat", title: { en: "First Streaming Chat", ua: "Перший стрімінговий чат" }, file: { en: "first-streaming-chat_en.md", ua: "first-streaming-chat_ua.md" } },
        { slug: "gs-ios-device-setup", title: { en: "iOS Device Setup", ua: "Налаштування iOS-пристрою" }, file: { en: "ios-device-setup_en.md", ua: "ios-device-setup_ua.md" } },
        { slug: "gs-quickstart-troubleshooting", title: { en: "Quickstart Troubleshooting", ua: "Troubleshooting швидкого старту" }, file: { en: "quickstart-troubleshooting_en.md", ua: "quickstart-troubleshooting_ua.md" } },
      ]
    },
    {
      id: "concepts",
      title: { en: "Concepts", ua: "Концепції" },
      icon: "💡",
      docs: [
        { slug: "c-what-is-edge-veda", title: { en: "What Is Edge Veda", ua: "Що таке Edge Veda" } },
        { slug: "c-on-device-ai", title: { en: "On-Device AI", ua: "AI на пристрої" } },
        { slug: "c-architecture", title: { en: "Architecture", ua: "Архітектура" } },
        { slug: "c-model-compatibility", title: { en: "Model Compatibility", ua: "Сумісність моделей" } },
        { slug: "c-model-management", title: { en: "Model Management", ua: "Управління моделями" } },
        { slug: "c-quantization", title: { en: "Quantization", ua: "Квантизація" } },
        { slug: "c-embeddings-and-rag", title: { en: "Embeddings & RAG", ua: "Embeddings та RAG" } },
        { slug: "c-function-calling", title: { en: "Function Calling", ua: "Виклик функцій" } },
        { slug: "c-structured-output", title: { en: "Structured Output", ua: "Структурований вивід" } },
        { slug: "c-workers-and-isolates", title: { en: "Workers & Isolates", ua: "Workers та Isolates" } },
        { slug: "c-runtime-supervision", title: { en: "Runtime Supervision", ua: "Супервізія runtime" } },
        { slug: "c-privacy-and-offline-inference", title: { en: "Privacy & Offline Inference", ua: "Приватність і офлайн-інференс" } },
        { slug: "c-observability", title: { en: "Observability", ua: "Спостережуваність" } },
      ]
    },
    {
      id: "guides",
      title: { en: "Guides", ua: "Гайди" },
      icon: "📖",
      docs: [
        { slug: "g-text-generation", title: { en: "Text Generation", ua: "Генерація тексту" } },
        { slug: "g-streaming-generation", title: { en: "Streaming Generation", ua: "Стрімінгова генерація" } },
        { slug: "g-chat-sessions", title: { en: "Chat Sessions", ua: "Чат-сесії" } },
        { slug: "g-structured-output", title: { en: "Structured Output", ua: "Структурований вивід" } },
        { slug: "g-function-calling", title: { en: "Function Calling", ua: "Виклик функцій" } },
        { slug: "g-embeddings", title: { en: "Embeddings", ua: "Embeddings" } },
        { slug: "g-vector-index", title: { en: "Vector Index", ua: "Векторний індекс" } },
        { slug: "g-rag-pipeline", title: { en: "RAG Pipeline", ua: "RAG Pipeline" } },
        { slug: "g-vision-inference", title: { en: "Vision Inference", ua: "Vision-інференс" } },
        { slug: "g-image-generation", title: { en: "Image Generation", ua: "Генерація зображень" } },
        { slug: "g-speech-to-text", title: { en: "Speech-to-Text", ua: "Speech-to-Text" } },
        { slug: "g-text-to-speech", title: { en: "Text-to-Speech", ua: "Text-to-Speech" } },
        { slug: "g-voice-pipeline", title: { en: "Voice Pipeline", ua: "Voice Pipeline" } },
        { slug: "g-memory-management", title: { en: "Memory Management", ua: "Управління пам'яттю" } },
        { slug: "g-error-handling", title: { en: "Error Handling", ua: "Обробка помилок" } },
        { slug: "g-performance-tuning", title: { en: "Performance Tuning", ua: "Тюнінг продуктивності" } },
        { slug: "g-scheduler-and-budgets", title: { en: "Scheduler & Budgets", ua: "Планувальник і бюджети" } },
        { slug: "g-runtime-policy", title: { en: "Runtime Policy", ua: "Runtime Policy" } },
        { slug: "g-telemetry-and-tracing", title: { en: "Telemetry & Tracing", ua: "Телеметрія і трейсинг" } },
        { slug: "g-model-advisor", title: { en: "Model Advisor", ua: "Model Advisor" } },
        { slug: "g-model-manager", title: { en: "Model Manager", ua: "Model Manager" } },
        { slug: "g-production-readiness", title: { en: "Production Readiness", ua: "Production Readiness" } },
      ]
    },
    {
      id: "examples",
      title: { en: "Examples", ua: "Приклади" },
      icon: "⚡",
      docs: [
        { slug: "e-index", title: { en: "Examples Index", ua: "Індекс прикладів" } },
        { slug: "e-basic-text-generation", title: { en: "Basic Text Generation", ua: "Базова генерація тексту" } },
        { slug: "e-streaming-chat", title: { en: "Streaming Chat", ua: "Стрімінговий чат" } },
        { slug: "e-document-qa", title: { en: "Document Q&A", ua: "Document Q&A" } },
        { slug: "e-rag-document-search", title: { en: "RAG Document Search", ua: "RAG-пошук документів" } },
        { slug: "e-tool-calling-app", title: { en: "Tool-Calling App", ua: "Tool-Calling додаток" } },
        { slug: "e-image-generation-demo", title: { en: "Image Generation Demo", ua: "Демо генерації зображень" } },
        { slug: "e-health-advisor", title: { en: "Health Advisor", ua: "Health Advisor" } },
        { slug: "e-smart-home-control", title: { en: "Smart Home Control", ua: "Розумний дім" } },
        { slug: "e-offline-voice-assistant", title: { en: "Offline Voice Assistant", ua: "Офлайн голосовий асистент" } },
        { slug: "e-voice-journal", title: { en: "Voice Journal", ua: "Голосовий журнал" } },
      ]
    },
    {
      id: "mcp",
      title: { en: "MCP Server", ua: "MCP Server" },
      icon: "🔌",
      docs: [
        { slug: "mcp-overview", title: { en: "Overview", ua: "Огляд" } },
        { slug: "mcp-installation", title: { en: "Installation", ua: "Встановлення" } },
        { slug: "mcp-create-project", title: { en: "Create Project", ua: "Створення проєкту" } },
        { slug: "mcp-download-model", title: { en: "Download Model", ua: "Завантаження моделі" } },
        { slug: "mcp-add-capability", title: { en: "Add Capability", ua: "Додавання capability" } },
        { slug: "mcp-available-tools", title: { en: "Available Tools", ua: "Доступні інструменти" } },
        { slug: "mcp-troubleshooting", title: { en: "Troubleshooting", ua: "Troubleshooting" } },
      ]
    },
    {
      id: "platforms",
      title: { en: "Platforms", ua: "Платформи" },
      icon: "📱",
      docs: [
        { slug: "p-ios", title: { en: "iOS", ua: "iOS" } },
        { slug: "p-macos", title: { en: "macOS", ua: "macOS" } },
        { slug: "p-device-requirements", title: { en: "Device Requirements", ua: "Вимоги до пристроїв" } },
        { slug: "p-android-roadmap", title: { en: "Android Roadmap", ua: "Android Roadmap" } },
      ]
    },
    {
      id: "reference",
      title: { en: "Reference", ua: "Довідник" },
      icon: "📋",
      docs: [
        { slug: "r-supported-models", title: { en: "Supported Models", ua: "Підтримувані моделі" } },
        { slug: "r-model-formats", title: { en: "Model Formats", ua: "Формати моделей" } },
        { slug: "r-quantization-levels", title: { en: "Quantization Levels", ua: "Рівні квантизації" } },
        { slug: "r-configuration-options", title: { en: "Configuration Options", ua: "Параметри конфігурації" } },
        { slug: "r-environment-variables", title: { en: "Environment Variables", ua: "Змінні середовища" } },
        { slug: "r-permissions", title: { en: "Permissions", ua: "Дозволи" } },
        { slug: "r-storage-and-memory", title: { en: "Storage & Memory", ua: "Сховище і пам'ять" } },
        { slug: "r-performance-metrics", title: { en: "Performance Metrics", ua: "Метрики продуктивності" } },
        { slug: "r-glossary", title: { en: "Glossary", ua: "Глосарій" } },
        { slug: "r-faq", title: { en: "FAQ", ua: "FAQ" } },
      ]
    },
    {
      id: "troubleshooting",
      title: { en: "Troubleshooting", ua: "Troubleshooting" },
      icon: "🔧",
      docs: [
        { slug: "t-installation-issues", title: { en: "Installation Issues", ua: "Проблеми встановлення" } },
        { slug: "t-model-loading-issues", title: { en: "Model Loading Issues", ua: "Проблеми завантаження моделей" } },
        { slug: "t-memory-issues", title: { en: "Memory Issues", ua: "Проблеми з пам'яттю" } },
        { slug: "t-performance-issues", title: { en: "Performance Issues", ua: "Проблеми продуктивності" } },
        { slug: "t-streaming-issues", title: { en: "Streaming Issues", ua: "Проблеми стрімінгу" } },
        { slug: "t-ios-build-issues", title: { en: "iOS Build Issues", ua: "Проблеми збірки iOS" } },
        { slug: "t-rag-issues", title: { en: "RAG Issues", ua: "Проблеми RAG" } },
        { slug: "t-stt-tts-issues", title: { en: "STT/TTS Issues", ua: "Проблеми STT/TTS" } },
        { slug: "t-thermal-throttling", title: { en: "Thermal Throttling", ua: "Thermal Throttling" } },
      ]
    },
  ]
};

window.EDGE_VEDA_DOCS = EDGE_VEDA_DOCS;
