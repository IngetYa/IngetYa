import { Request, Response, NextFunction } from "express"
import "express-session"

export const sessionUserBinder = (req: Request, res: Response, next: NextFunction) => {
  // tambah properti baru buat singkatin properti session user
  Object.defineProperty(req, "user", {
    // ambil nilai `req.session.user`
    get() {
      return req.session.user
    },

    // atur nilai `req.session.user`
    set(user) {
      req.session.user = user
    },

    configurable: true,
    enumerable: true
  })

  next()
}
