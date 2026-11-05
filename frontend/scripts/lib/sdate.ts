import { browserLocale, lang } from "@/core/languages"

const sdate = {
  sameday(t1: string | number | Date, t2: string | number | Date): boolean {
    t1 = new Date(t1)
    t2 = new Date(t2)
    return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate()
  },
  time(ts: string | number | Date = Date.now(), useSeconds?: boolean): string {
    return new Date(ts).toLocaleTimeString(browserLocale(), {
      hour: "2-digit",
      minute: "2-digit",
      second: useSeconds ? "2-digit" : undefined
    })
  },
  date(ts: string | number | Date = Date.now()): string {
    return new Date(ts).toLocaleDateString(browserLocale(), { year: "numeric", month: "short", day: "numeric" })
  },
  parseTime(ts: string | number | Date = Date.now()): string {
    const sameday = sdate.sameday(Date.now(), ts)

    return sameday ? sdate.time(ts) : sdate.datetime(ts)
  },
  dateOrTime(ts?: string | number | Date) {
    const isDate = ts instanceof Date
    const isString = typeof ts === "string"
    const isNumber = typeof ts === "number" && !isNaN(ts) && ts !== Infinity

    if (!isDate && !isString && !isNumber) return ""

    const sameday = sdate.sameday(Date.now(), ts)
    return sameday ? sdate.time(ts) : sdate.date(ts)
  },
  remain(expiryTime: string | number | Date, isFull?: boolean): string | null {
    const time = new Date(expiryTime).getTime()
    const remaining = time - Date.now()
    return remaining > 0 ? sdate.durrTime(remaining, isFull) : null
  },
  datetime(ts: string | number | Date = Date.now(), pq = null): string {
    return this.date(ts) + (pq ? " " + pq + " " : " ") + this.time(ts)
  },
  timeago(ts: string | number | Date, islong = false): string {
    const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) return `${interval} ${lang("sdate_years")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) return `${interval} ${lang("sdate_months")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 604800)
    if (interval >= 1) return `${interval} ${lang("sdate_weeks")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return `${interval} ${lang("sdate_days")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return `${interval} ${lang("sdate_hours")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 60)
    if (interval >= 1) return `${interval} ${lang("sdate_minutes")}${islong ? " " + lang("sdate_ago") : ""}`

    interval = Math.floor(seconds / 1)
    if (interval >= 1) return `${seconds} ${lang("sdate_seconds")}${islong ? " " + lang("sdate_ago") : ""}`

    return `${lang("sdate_justnow")}`
  },
  durrTime(ms: number, isFull?: boolean): string {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 3600 / 24)
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    let result = ""
    if (days > 0) {
      result += `${days}${isFull ? " " + lang("sdate_days") : lang("sdate_sdays")} `
    }
    if (hours > 0) {
      result += `${hours}${isFull ? " " + lang("sdate_hours") : lang("sdate_shours")} `
    }
    if (minutes > 0) {
      result += `${minutes}${isFull ? " " + lang("sdate_minutes") : lang("sdate_sminutes")} `
    }
    if (seconds > 0 || result === "") {
      result += `${seconds}${isFull ? " " + lang("sdate_seconds") : lang("sdate_sseconds")}`
    }
    return result.trim()
  },
  durrNumber(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    if (ms > 1000 * 60 * 45) return "0:00"

    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const result = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
    return result.trim()
  }
}

export default sdate
