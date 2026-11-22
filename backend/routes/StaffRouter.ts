import express, { Request, Response, Router } from "express"
// import { getProfileDetail, getU;serData } from "#controllers/ProfileController"
import { cooldown } from "#core/cooldown"
import { isStaff } from "#core/middlewares"
import { rep } from "#lib/gen"
import { getUserData } from "#controllers/ProfileController"
import { getDataBalance, getDataBills, getDataConvo, getDataMessage, getDataOrders, getDataOverview, getDataTransactions, getDataUsers } from "#controllers/StaffController"

const router: Router = express.Router()

router.use(isStaff)

router.get("/details", cooldown.user("user", 2000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const userData = rep(await getUserData(req.user!.id))

  return res.status(userData.status).json(userData)
})

router.get("/data/overview", cooldown.user("data", 2000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const overviewData = rep(await getDataOverview(req.user!.id))

  return res.status(overviewData.status).json(overviewData)
})

router.get("/data/balance", cooldown.user("data", 2000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const balanceData = rep(await getDataBalance(req.user!.id))

  return res.status(balanceData.status).json(balanceData)
})

router.get("/data/transaction/:page", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { page } = req.params

  const transactionData = rep(await getDataTransactions(req.user!.id, page?.toString()))

  return res.status(transactionData.status).json(transactionData)
})

router.get("/data/orders/:page", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { page } = req.params

  const ordersData = rep(await getDataOrders(req.user!.id, page?.toString()))

  return res.status(ordersData.status).json(ordersData)
})

router.get("/data/bills/:page", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { page } = req.params

  const ordersData = rep(await getDataBills(req.user!.id, page?.toString()))

  return res.status(ordersData.status).json(ordersData)
})

router.get("/data/users/:page", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { page } = req.params

  const usersData = rep(await getDataUsers(req.user!.id, page?.toString()))

  return res.status(usersData.status).json(usersData)
})

router.get("/data/convo{/:cursor}", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { cursor } = req.params

  const convoData = rep(await getDataConvo(req.user!.id, cursor?.toString()))

  return res.status(convoData.status).json(convoData)
})

router.get("/data/messages/:roomId{/:cursor}", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId, cursor } = req.params

  const messageData = rep(await getDataMessage(req.user!.id, roomId?.toString(), cursor?.toString()))

  return res.status(messageData.status).json(messageData)
})

export default router
