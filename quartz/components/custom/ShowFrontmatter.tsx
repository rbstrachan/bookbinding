import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../../util/lang"
import { transformLink } from "../../util/path"

interface Options {
  includeKeys?: string[]
  excludeKeys?: string[]
}

const defaultOptions: Options = {
  excludeKeys: ["title", "draft", "comments", "enableToc", "cssclasses", "tags"],
}

// Regex to capture Obsidian/Quartz wikilinks: [[target]] or [[target|alias]]
const WIKILINK_REGEX = /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g

export default ((userOpts?: Options) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Frontmatter: QuartzComponent = ({
    fileData,
    cfg,
    allSlugs,
    displayClass,
  }: QuartzComponentProps) => {
    const frontmatter = fileData.frontmatter
    if (!frontmatter) return null

    const cssClasses = frontmatter.cssclasses
    if (cssClasses) {
      const classList = Array.isArray(cssClasses) ? cssClasses : String(cssClasses).split(" ")
      if (classList.includes("no-frontmatter")) {
        return null
      }
    }

    // Filter out keys based on options and internal properties
    const entries = Object.entries(frontmatter).filter(([key]) => {
      if (key === "cssclasses") return false
      if (opts.excludeKeys?.includes(key)) return false
      if (opts.includeKeys && !opts.includeKeys.includes(key)) return false
      return true
    })

    const count = entries.length
    if (count === 0) return null

    // Helper to replace [[target|alias]] strings with HTML <a> elements
    const formatValueWithLinks = (val: string) => {
      const matches = [...val.matchAll(WIKILINK_REGEX)]
      if (matches.length === 0) return val

      const parts: (string | JSX.Element)[] = []
      let lastIndex = 0

      matches.forEach((match, idx) => {
        const fullMatch = match[0]
        const rawTarget = match[1].trim()
        const alias = match[2] ? match[2].trim() : rawTarget
        const matchIndex = match.index ?? 0

        // Push text preceding the wikilink
        if (matchIndex > lastIndex) {
          parts.push(val.slice(lastIndex, matchIndex))
        }

        // Pass fileData.slug, target, and the configuration options required by Quartz v4
        const targetHref = transformLink(fileData.slug!, rawTarget, {
          allSlugs,
          strategy: cfg?.baseUrl ? "absolute" : "shortest",
          ...cfg,
        })

        parts.push(
          <a key={idx} href={targetHref} class="internal">
            {alias}
          </a>
        )

        lastIndex = matchIndex + fullMatch.length
      })

      // Push remaining text after the last match
      if (lastIndex < val.length) {
        parts.push(val.slice(lastIndex))
      }

      return parts
    }

    return (
      <div class={classNames(displayClass, "frontmatter-container")}>
        <details class="frontmatter-details">
          <summary class="frontmatter-summary">
            <div class="frontmatter-summary-content">
              <span class="frontmatter-title">Properties</span>
              <span class="frontmatter-count">{count}</span>
            </div>
          </summary>
          <table class="frontmatter-table">
            <tbody>
              {entries.map(([key, value]) => {
                let formattedContent: string | JSX.Element | (string | JSX.Element)[] = ""

                if (Array.isArray(value)) {
                  formattedContent = value.map((item, idx) => (
                    <span key={idx}>
                      {typeof item === "string" ? formatValueWithLinks(item) : String(item)}
                      {idx < value.length - 1 ? ", " : ""}
                    </span>
                  ))
                } else if (typeof value === "object" && value !== null) {
                  formattedContent = JSON.stringify(value)
                } else {
                  formattedContent = formatValueWithLinks(String(value))
                }

                return (
                  <tr key={key}>
                    <td class="frontmatter-key">{key}</td>
                    <td class="frontmatter-value">{formattedContent}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </details>
      </div>
    )
  }

  return Frontmatter
}) satisfies QuartzComponentConstructor
