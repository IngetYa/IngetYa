import { createOrder, getUserOrdersDetail } from "#controllers/OrderController"
import { cooldown } from "#core/cooldown"
import { isUser } from "#core/middlewares"
import { rep } from "#lib/gen"
import express, { Request, Response, Router } from "express"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/byUser", isUser, cooldown.user("orders", 2000), async (req: Request, res: Response) => {
  const orders = rep(await getUserOrdersDetail(req.user!.id))

  return res.status(orders.status).json(orders)
})

router.post("/create", isUser, cooldown.user("orders", 2000), async (req: Request, res: Response) => {
  const order = rep(await createOrder(req.user!.id, req.body))

  return res.status(order.status).json(order)
})

export default router
