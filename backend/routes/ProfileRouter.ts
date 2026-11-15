import express, { Request, Response, Router } from "express"
import { getProfileDetail, getUserData } from "#controllers/ProfileController"
import { cooldown } from "#core/cooldown"
import { isUser } from "#core/middlewares"
import { rep } from "#lib/gen"

const router: Router = express.Router()

router.get("/me", isUser, express.json({ limit: "100KB" }), cooldown.user("user", 2000), async (req: Request, res: Response) => {
  const products = rep(await getProfileDetail(req.user!.id))

  return res.status(products.status).json(products)
})

router.get("/details", isUser, express.json({ limit: "100KB" }), cooldown.user("user", 2000), async (req: Request, res: Response) => {
  const userData = rep(await getUserData(req.user!.id))

  return res.status(userData.status).json(userData)
})

export default router
