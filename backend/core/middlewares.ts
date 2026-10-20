import { NextFunction, Request, Response } from "express"

export async function isUser(req: Request, res: Response, next: NextFunction) {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"

  const noCookie = !req.user || !req.user.id

  if (noCookie) {
    if (isJsonRequest) {
      return res.status(401).json({ ok: false, code: 401, msg: "unauthorized" })
    }

    return res.redirect("/portal")
  }

  next()
}
