import { Request, Response, NextFunction } from "express"

type CoolDownReturn = (req: Request, res: Response, next: NextFunction) => void

type CoolDownMap = Map<string, number>

type ICoolDownData = Record<string, CoolDownMap>

class CoolDown {
  private data: ICoolDownData = {}

  private getUserId(req: Request): string[] {
    if (req.user && req.user.id) return [req.user.id]

    const user_ips: string | string[] = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"] || req.socket.remoteAddress || "unknown"

    const ip = typeof user_ips === "string" ? [user_ips] : user_ips

    return ip
  }

  private del(key: string, id: string): void {
    if (this.data[key].has(id)) this.data[key].delete(id)
  }

  private add(key: string, id: string, ms: number): void {
    if (!this.data[key]) this.data[key] = new Map()

    const expireAt = Date.now() + ms

    this.data[key].set(id, expireAt)

    const timeOut = ms + 10000

    setTimeout(() => this.del(key, id), timeOut)
  }

  user(key: string = "global", ms: number = 500): CoolDownReturn {
    return (req, res, next) => {
      const userIds = this.getUserId(req)

      for (const userId of userIds) {
        const item = this.data[key]

        if (item && (item.get(userId) || 0) > Date.now()) {
          return res.status(429).json({ ok: false, code: 429, msg: "too_many_request" })
        }

        if (item && item.has(userId)) {
          this.del(key, userId)
        }

        this.add(key, userId, ms)
      }

      next()
    }
  }
}

export const cooldown = new CoolDown()
