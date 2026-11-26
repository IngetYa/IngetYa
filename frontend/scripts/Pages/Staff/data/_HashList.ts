export interface IHashChild {
  hash: string
  childType: "id" | null
}

export interface IHashItem {
  hash: string
  childType: "fixed" | null
  children?: IHashChild[]
  isRoot?: boolean
}

export const HashList = [
  {
    hash: "overview",
    childType: null,
    isRoot: true
  },
  {
    hash: "balance",
    childType: null,
    isRoot: true
  },
  {
    hash: "products",
    childType: "fixed",
    children: [
      {
        hash: "edit",
        childType: "id"
      }
    ]
  },
  {
    hash: "chats",
    childType: "fixed",
    children: [
      {
        hash: "room",
        childType: "id"
      }
    ]
  },
  {
    hash: "orders",
    childType: null,
    isRoot: true
  },
  {
    hash: "bills",
    childType: null,
    isRoot: true
  },
  {
    hash: "users",
    childType: null,
    isRoot: true
  },
  {
    hash: "me",
    childType: null,
    isRoot: true
  }
]

export function isValidHash(rawPath: string): boolean {
  const path = rawPath.replace(/^#/, "").trim()
  if (!path) return false

  const parts = path.split("/")
  if (parts.length > 3) return false

  const [root, section, sub] = parts
  const rootItem = HashList.find((item) => item.hash === root)
  if (!rootItem) return false

  if (parts.length === 1) return true

  if (rootItem.childType !== "fixed" || !rootItem.children || !section) return false

  const childItem = rootItem.children.find((child) => child.hash === section)
  if (!childItem) return false

  if (parts.length === 2) return childItem.childType !== "id"

  return childItem.childType === "id" && Boolean(sub)
}
