import { getExploreProducts } from "#controllers/ExploreController"
import { cooldown } from "#core/cooldown"
import { isUser } from "#core/middlewares"
import { rep } from "#lib/gen"
import express, { NextFunction, Request, Response, Router } from "express"

const router: Router = express.Router()

router.get("/products", /* isUser, */ express.json({ limit: "100KB" }), cooldown.user("products", 2000), async (req: Request, res: Response) => {
  const products = rep(await getExploreProducts())

  return res.status(products.status).json(products)
})

export default router
