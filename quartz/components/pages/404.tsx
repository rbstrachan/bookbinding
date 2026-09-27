import { i18n, ValidLocale } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// Map your URL prefixes ('fr', 'ja') to Quartz's internal ValidLocale codes
const LOCALE_MAP: Record<string, ValidLocale> = {
  en: "en-US",
  fr: "fr-FR",
  ja: "ja-JP",
}

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  // Compile translation strings for all supported languages into a JSON dictionary at build time
  const translations: Record<string, { notFound: string; home: string; homeUrl: string }> = {}

  for (const [langPrefix, localeKey] of Object.entries(LOCALE_MAP)) {
    const errorDict = i18n(localeKey).pages.error
    translations[langPrefix] = {
      notFound: errorDict.notFound,
      home: errorDict.home,
      homeUrl: langPrefix === "en" ? baseDir : `${baseDir.replace(/\/$/, "")}/${langPrefix}/`,
    }
  }

  return (
    <article class="popover-hint">
      <h1>404</h1>
      <p id="error-not-found">{i18n(cfg.locale).pages.error.notFound}</p>
      <a id="error-home-link" href={baseDir}>{i18n(cfg.locale).pages.error.home}</a>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener("DOMContentLoaded", () => {
            const translations = ${JSON.stringify(translations)};
            const parts = window.location.pathname.split('/').filter(Boolean);

            // Check if any path segment matches a known language prefix
            const currentLang = Object.keys(translations).find(lang => parts.includes(lang)) || 'en';
            const t = translations[currentLang];

            if (t) {
              const msgEl = document.getElementById('error-not-found');
              const linkEl = document.getElementById('error-home-link');

              if (msgEl) msgEl.textContent = t.notFound;
              if (linkEl) {
                linkEl.textContent = t.home;
                linkEl.setAttribute('href', t.homeUrl);
              }
            }
          });
        `,
        }}
      />
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
