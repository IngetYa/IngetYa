import express, { Request, Response, Router } from "express"
import { cooldown } from "#core/cooldown"
import { isUser } from "#core/middlewares"
import { rep } from "#lib/gen"
import { getPresignURL } from "#core/s3"

const router: Router = express.Router()

router.use(isUser)

router.post("/message-presign/:roomId", cooldown.user("live-chat", 1000), express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { roomId } = req.params

  const presigned = rep(await getPresignURL("messages", req.user!.id, roomId.toString(), req.body))

  return res.status(presigned.status).json(presigned)
})

export default router
