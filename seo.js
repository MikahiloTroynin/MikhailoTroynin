// Dynamic SEO meta tag updater — runs on every hash route change.
// Updates document.title, meta[name=description], og:*, twitter:* and canonical.
(function () {
  var BASE_URL = 'https://mikhailotroynin.github.io/MikhailoTroynin';
  var OG_IMAGE = BASE_URL + '/og-image.png';
  var SITE_NAME = 'M. Troynin — AI Technical Writer';

  var STATIC_META = {
    home: {
      title: 'Portfolio · M. Troynin — AI Technical Writer',
      description: 'AI-assisted technical writer for developer documentation, API docs, codebase docs and AI documentation workflows.',
    },
    work: {
      title: 'Work Samples · M. Troynin',
      description: 'Documentation portfolio: REST API reference, codebase-to-docs, developer onboarding, AI-assisted workflows.',
    },
    workflow: {
      title: 'API Gateway Documentation Workflow · M. Troynin',
      description: 'A specialized ampcode workflow for documenting API Gateway routes by module — CLARIFY, generation, verification, Git.',
    },
    about: {
      title: 'About · M. Troynin — AI Documentation Strategist',
      description: 'AI Product Documentation Strategist with 7+ years of experience. 100+ documents, 15+ custom AI skills, 5x faster delivery.',
    },
    contact: {
      title: 'Contact · M. Troynin',
      description: 'Open for documentation projects, contract work, and consulting. Reach out to discuss your docs tasks.',
    },
    'api-docs': {
      title: 'API Reference · Edge Veda',
      description: 'Complete Edge Veda SDK API reference — methods, parameters, return values, and code examples.',
    },
  };

  function lookupApiDoc(slug) {
    if (!window.API_DOCS || !window.API_DOCS.methods) return null;
    var m = window.API_DOCS.methods.find(function (x) { return x.slug === slug; });
    if (!m) return null;
    return {
      title: m.method + ' · Edge Veda API',
      description: 'API reference for ' + m.method + ' — parameters, return type, and usage examples for the Edge Veda SDK.',
    };
  }

  function lookupEvDoc(slug) {
    if (!window.EDGE_VEDA_DOCS || !window.EDGE_VEDA_DOCS.categories) return null;
    var cats = window.EDGE_VEDA_DOCS.categories;
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var docs = cat.docs || [];
      for (var j = 0; j < docs.length; j++) {
        var doc = docs[j];
        if (doc.slug === slug) {
          return {
            title: doc.title.en + ' · Edge Veda Docs',
            description: cat.title.en + ' — ' + doc.title.en + ' documentation for the Edge Veda on-device AI SDK.',
          };
        }
      }
    }
    return null;
  }

  function getMeta(page, param) {
    if (page === 'api-doc' && param) {
      return lookupApiDoc(param) || {
        title: 'API Reference · Edge Veda',
        description: 'Edge Veda SDK API method reference.',
      };
    }
    if (page === 'ev-doc' && param) {
      return lookupEvDoc(param) || {
        title: 'Documentation · Edge Veda',
        description: 'Edge Veda on-device AI SDK documentation.',
      };
    }
    if (page === 'sample' && param) {
      return {
        title: 'Work Sample · M. Troynin',
        description: 'Detailed documentation work sample — process, inputs, and outputs.',
      };
    }
    return STATIC_META[page] || STATIC_META.home;
  }

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setOg(property, content) {
    var el = document.querySelector('meta[property="og:' + property + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', 'og:' + property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setTwitter(name, content) {
    var el = document.querySelector('meta[name="twitter:' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'twitter:' + name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setCanonical(url) {
    var el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  function updateSEO() {
    var hash = window.location.hash.replace(/^#\/?/, '') || 'home';
    var parts = hash.split('/');
    var page = parts[0] || 'home';
    var param = parts.slice(1).join('/') || null;

    var meta = getMeta(page, param);
    var pageUrl = BASE_URL + '/' + (hash === 'home' ? '' : '#/' + hash);

    document.title = meta.title;
    setMeta('description', meta.description);

    setOg('title', meta.title);
    setOg('description', meta.description);
    setOg('url', pageUrl);
    setOg('image', OG_IMAGE);
    setOg('type', 'website');
    setOg('site_name', SITE_NAME);

    setTwitter('card', 'summary_large_image');
    setTwitter('title', meta.title);
    setTwitter('description', meta.description);
    setTwitter('image', OG_IMAGE);

    setCanonical(pageUrl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSEO);
  } else {
    updateSEO();
  }
  window.addEventListener('hashchange', updateSEO);
})();
