import express, { Request, Response, Router } from "express"
import { rep } from "#lib/gen"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.post("/sign-in", async (req: Request, res: Response) => {
  // const signIn = rep(await authLogin(req.body))
  // res.status(signIn.code).json(signIn);

  const signIn = rep({ status: 404 })

  res.status(signIn.status).json(signIn)
  return
})

export default router
