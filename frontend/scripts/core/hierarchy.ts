export interface IStackHierarchy {
  root: string
  section?: string
  sub?: string
}

// pecah hash: "#root/section/sub" >> ["root", "section", "sub"]
export function getHierarchy(rawPath: string): IStackHierarchy {
  const path = rawPath.replace("#", "")

  const parts = path.split("/")

  return { root: parts[0], section: parts[1], sub: parts[2] }
}
