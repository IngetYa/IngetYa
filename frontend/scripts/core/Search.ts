import type { IAny } from "@/types/LibTypes"

export function debounce<F extends (...args: IAny[]) => IAny>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, waitFor)
  }
}

function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i)
  let currRow = new Array(b.length + 1).fill(0)

  for (let i = 0; i < a.length; i++) {
    currRow[0] = i + 1
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1
      currRow[j + 1] = Math.min(
        currRow[j] + 1, // Insertion
        prevRow[j + 1] + 1, // Deletion
        prevRow[j] + cost // Substitution
      )
    }
    ;[prevRow, currRow] = [currRow, prevRow]
  }

  return prevRow[b.length]
}

function getFuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase().trim()

  if (t.includes(q)) return 0

  const words = t.split(/\s+/)
  let minDistance = Infinity

  for (const word of words) {
    const targetSubstring = word.slice(0, q.length)
    const distance = getLevenshteinDistance(q, targetSubstring)

    if (distance < minDistance) {
      minDistance = distance
    }
  }

  return minDistance
}

interface ISearchOrder {
  id: string
  name: string
}

export function searchOrders(query: string, items: ISearchOrder[], maxTypo: number = 2): string[] {
  if (!query) return items.map((k) => k.id)

  const scoredItems = items
    .map((item) => ({
      item,
      score: getFuzzyScore(query, item.name)
    }))
    .filter((scored) => scored.score <= maxTypo)
    .sort((a, b) => a.score - b.score)

  const itemIds = scoredItems.map((scored) => scored.item.id)

  const foundById = items.find((k) => k.id === query)
  if (foundById) itemIds.push(foundById.id)

  return itemIds
}
