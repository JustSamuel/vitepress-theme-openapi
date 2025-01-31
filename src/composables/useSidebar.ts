import { OpenApi, httpVerbs, useOpenapi } from 'vitepress-theme-openapi'

interface GenerateSidebarGroupsOptions {
  tags?: string[] | null
  linkPrefix?: string | null
}

interface GenerateSidebarGroupOptions {
  tag: string | string[]
  text?: string
  linkPrefix?: string
  addedOperations?: Set<string>
}

const defaultOptions = {
  spec: null,
  linkPrefix: '/operations/',
}

export function useSidebar({
  spec,
  linkPrefix,
} = {
  ...defaultOptions,
}) {
  const options = {
    spec: spec || useOpenapi().json,
    linkPrefix: linkPrefix || defaultOptions.linkPrefix,
  }

  const openapi = OpenApi({ spec: options.spec })

  function sidebarItemTemplate(method: string, title: string) {
    return `<span class="OASidebarItem">
        <span class="OASidebarItem-badge OAMethodBadge--${method.toLowerCase()}">${method.toUpperCase()}</span>
        <span class="OASidebarItem-text">${title}</span>
      </span>`
  }

  function generateSidebarItem(method: string, path: string, linkPrefix = options.linkPrefix) {
    const operation = openapi.getPaths()?.[path]?.[method]
    if (!operation) {
      return null
    }

    const { operationId, summary } = operation
    const sidebarTitle = operation['x-sidebar-title'] || summary || `${method.toUpperCase()} ${path}`

    return {
      text: sidebarItemTemplate(method, sidebarTitle),
      link: `${linkPrefix}${operationId}`,
    }
  }

  function generateSidebarGroup({
    tag,
    text,
    linkPrefix,
    addedOperations,
  }: GenerateSidebarGroupOptions = {}) {
    tag = tag || []
    text = text || ''
    linkPrefix = linkPrefix || options.linkPrefix
    addedOperations = addedOperations || new Set()

    if (!openapi.getPaths()) {
      return []
    }

    const includeTags = Array.isArray(tag) ? tag : [tag]

    const sidebarGroupElements = Object.keys(openapi.getPaths())
      .flatMap((path) => {
        return httpVerbs
          .map((method) => {
            const operation = openapi.getPaths()[path][method]
            if (operation && !addedOperations.has(operation.operationId) && (includeTags.length === 0 || includeTags.every(tag => operation.tags?.includes(tag)))) {
              addedOperations.add(operation.operationId)
              return generateSidebarItem(method, path, linkPrefix)
            }
            return null
          })
          .filter(Boolean)
      })

    return {
      text: text !== undefined ? text : includeTags.join(', ') || '',
      items: sidebarGroupElements,
    }
  }

  function generateSidebarGroups({
    tags,
    linkPrefix,
  }: GenerateSidebarGroupsOptions = {}) {
    tags = tags || getTags()
    linkPrefix = linkPrefix || options.linkPrefix

    if (!openapi.getPaths()) {
      return []
    }

    const addedOperations = new Set()
    const groups = tags.map(tag => generateSidebarGroup({
      tag,
      text: tag,
      linkPrefix,
      addedOperations,
    }))

    // Add a group for operations without tags
    const noTagGroup = generateSidebarGroup({
      tag: [],
      text: '',
      linkPrefix,
      addedOperations,
    })
    if (noTagGroup.items.length > 0) {
      groups.push(noTagGroup)
    }

    return groups
  }

  function getTags(): string[] {
    if (!openapi.getPaths()) {
      return []
    }

    return Object.values(openapi.getPaths()).reduce((tags, path: any) => {
      for (const verb of httpVerbs) {
        if (path[verb]?.tags) {
          path[verb].tags.forEach((tag: string) => {
            if (!tags.includes(tag)) {
              tags.push(tag)
            }
          })
        }
      }
      return tags
    }, [])
  }

  return {
    sidebarItemTemplate,
    generateSidebarItem,
    generateSidebarGroup,
    generateSidebarGroups,
    getTags,
  }
}
