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

export const HashList: IHashItem[] = [
  {
    hash: "explore",
    childType: "fixed",
    children: [
      {
        hash: "buy",
        childType: "id"
      }
    ],
    isRoot: true
  },
  {
    hash: "orders",
    childType: "fixed",
    children: [
      {
        hash: "pay",
        childType: "id"
      },
      {
        hash: "talk",
        childType: "id"
      }
    ]
  },
  {
    hash: "bills",
    childType: "fixed",
    children: [
      {
        hash: "peek",
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
    hash: "me",
    childType: null
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
