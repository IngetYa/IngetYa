import express, { Request, Response, Router } from "express"
import { cooldown } from "#core/cooldown"
import { isUser } from "#core/middlewares"
import { rep } from "#lib/gen"
import { sendUserChatMessage } from "#controllers/MessageController"

const router: Router = express.Router()

router.use(isUser)

router.post("/send/:roomId", cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId } = req.params

  const message = rep(await sendUserChatMessage(req.user!.id, roomId.toString(), req.body))

  return res.status(message.status).json(message)
})

router.post("/staff-send/:roomId", cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId } = req.params

  const message = rep(await sendUserChatMessage(req.user!.id, roomId.toString(), req.body))

  return res.status(message.status).json(message)
})

export default router
