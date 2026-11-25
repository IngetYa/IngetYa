import express, { Request, Response, Router } from "express"
import { cooldown } from "#core/cooldown"
import { isStaff, isUser } from "#core/middlewares"
import { rep } from "#lib/gen"
import { getUserConvo, getUserMessage, sendUserChatMessage } from "#controllers/MessageController"

const router: Router = express.Router()

router.post("/send/:roomId", isUser, cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId } = req.params

  const message = rep(await sendUserChatMessage(req.user!.id, roomId.toString(), req.body))

  return res.status(message.status).json(message)
})

router.post("/staff-send/:roomId", isStaff, cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId } = req.params

  const message = rep(await sendUserChatMessage(req.user!.id, roomId.toString(), req.body))

  return res.status(message.status).json(message)
})

router.get("/data/convo{/:cursor}", cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { cursor } = req.params

  const convoData = rep(await getUserConvo(req.user!.id, cursor?.toString()))

  return res.status(convoData.status).json(convoData)
})

router.get("/data/messages/:roomId{/:cursor}", cooldown.user("data", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId, cursor } = req.params

  const messageData = rep(await getUserMessage(req.user!.id, roomId?.toString(), cursor?.toString()))

  return res.status(messageData.status).json(messageData)
})

export default router
