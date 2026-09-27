import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

function SidebarLinks({ fileData, displayClass, cfg }: QuartzComponentProps) {
  const isFrench = cfg?.locale?.startsWith("fr") ?? false
  const prefix = isFrench ? "/fr" : ""

  return (
    <div class={`sidebar-links ${displayClass ?? ""}`}>
      {fileData?.slug && fileData.slug !== "index" && (
        <a href={`${prefix}/`}>{isFrench ? "À propos" : "About"}</a>
      )}
      <a href={`${prefix}/tags`}>
        {isFrench ? "Rechercher par etiquette" : "Search by Tag"}
      </a>
    </div>
  )
}

export default (() => SidebarLinks) satisfies QuartzComponentConstructor
