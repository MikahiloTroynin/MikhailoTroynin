// App shell — routing + tweaks panel + theme/lang persistence

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "cyan",
  "theme": "dark",
  "lang": "en"
}/*EDITMODE-END*/;

function App() {
  const route = window.useHashRoute();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useState(false);

  // localStorage for lang/theme so refresh keeps state
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("portfolio-prefs") || "{}");
    if (stored.lang && stored.lang !== tweaks.lang) setTweak("lang", stored.lang);
    if (stored.theme && stored.theme !== tweaks.theme) setTweak("theme", stored.theme);
    if (stored.accent && stored.accent !== tweaks.accent) setTweak("accent", stored.accent);
  // eslint-disable-next-line
  }, []);
  useEffect(() => {
    localStorage.setItem("portfolio-prefs", JSON.stringify({ lang: tweaks.lang, theme: tweaks.theme, accent: tweaks.accent }));
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.setAttribute("data-accent", tweaks.accent);
    document.documentElement.setAttribute("lang", tweaks.lang === "ua" ? "uk" : "en");
  }, [tweaks.lang, tweaks.theme, tweaks.accent]);

  // Edit mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setEditMode(true);
      if (d.type === "__deactivate_edit_mode") setEditMode(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const t = window.I18N[tweaks.lang];

  let pageEl;
  switch (route.page) {
    case "home": pageEl = <window.HomePage lang={tweaks.lang}/>; break;
    case "work": pageEl = <window.WorkPage lang={tweaks.lang}/>; break;
    case "sample": pageEl = <window.SampleDetailPage lang={tweaks.lang} id={route.param}/>; break;
    case "api-docs": pageEl = <window.ApiDocsListPage lang={tweaks.lang}/>; break;
    case "api-doc": pageEl = <window.ApiDocPage lang={tweaks.lang} id={route.param}/>; break;
    case "ev-doc": pageEl = <window.EdgeVedaDocPage lang={tweaks.lang} slug={route.param}/>; break;
    case "workflow": pageEl = <window.WorkflowPage lang={tweaks.lang}/>; break;
    case "about": pageEl = <window.AboutPage lang={tweaks.lang}/>; break;
    case "contact": pageEl = <window.ContactPage lang={tweaks.lang}/>; break;
    default: pageEl = <window.HomePage lang={tweaks.lang}/>;
  }

  return (
    <>
      <window.Header
        t={t}
        lang={tweaks.lang}
        setLang={(l) => setTweak("lang", l)}
        page={route.page}
      />
      {pageEl}
      <window.Footer t={t}/>

      {editMode && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Appearance" />
          <TweakRadio
            label="Accent"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "cyan", label: "Cyan" },
              { value: "emerald", label: "Emerald" },
              { value: "violet", label: "Violet" },
              { value: "amber", label: "Amber" },
            ]}
          />
          <TweakRadio
            label="Theme"
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
          <TweakSection label="Content" />
          <TweakRadio
            label="Language"
            value={tweaks.lang}
            onChange={(v) => setTweak("lang", v)}
            options={[
              { value: "en", label: "EN" },
              { value: "ua", label: "UA" },
            ]}
          />
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
