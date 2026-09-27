import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function LanguagePicker({ displayClass }: QuartzComponentProps) {
  return (
    <div class={`lang-picker-container ${displayClass ?? ""}`}>
      <button class="lang-button" aria-label="Change Language" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
      </button>
      <ul class="lang-menu">
        <li><button data-lang="en" type="button">English</button></li>
        <li><button data-lang="fr" type="button">Français</button></li>
        {/*<li><button data-lang="ja" type="button">日本語</button></li>*/}
      </ul>

      <script dangerouslySetInnerHTML={{
        __html: `
        document.addEventListener("click", (e) => {
          const btn = e.target.closest('.lang-menu button[data-lang]');
          if (!btn) return;

          e.preventDefault();
          const newLang = btn.getAttribute('data-lang');

          let parts = window.location.pathname.split('/').filter(Boolean);

          const knownLangs = ['fr', 'ja'];
          const langIndex = parts.findIndex(p => knownLangs.includes(p));

          if (newLang === 'en') {
            if (langIndex !== -1) parts.splice(langIndex, 1);
          } else {
            if (langIndex !== -1) {
              parts[langIndex] = newLang;
            } else {
              parts.unshift(newLang);
            }
          }

          let targetPath = '/' + parts.join('/');

          if (parts.length === 1 && knownLangs.includes(parts[0])) {
            targetPath += '/';
          }

          window.location.href = targetPath;
        });
      `}} />
    </div>
  )
}

export default (() => LanguagePicker) satisfies QuartzComponentConstructor
