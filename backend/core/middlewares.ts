import UserModel from "#models/UserModel"
import { NextFunction, Request, Response } from "express"

export async function isUser(req: Request, res: Response, next: NextFunction) {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"

  const noCookie = !req.user || !req.user.id

  if (noCookie) {
    if (isJsonRequest) {
      return res.status(401).json({ ok: false, status: 401, code: "unauthorized", msg: "Unauthorized" })
    }

    return res.redirect("/portal")
  }

  const userId = req.user!.id

  const userExists = await UserModel.exists({ id: userId })

  if (!userExists) {
    if (isJsonRequest) {
      return res.status(401).json({ ok: false, status: 401, code: "unauthorized", msg: "Unauthorized" })
    }

    return res.redirect("/portal")
  }

  next()
}
