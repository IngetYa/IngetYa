import express, { NextFunction, Request, Response, Router } from "express"
import { rep } from "#lib/gen"
import { authLogin, processThirdParty } from "#controllers/AuthController"
import { getOAuthUrl, getOAuthUser, isProviderValid } from "#main/OAuthFind"
import { IUser, UserProvider } from "#types/UserTypes"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.post("/sign-in", async (req: Request, res: Response) => {
  const signIn = rep(await authLogin(req.body, req.query))
  res.status(signIn.status).json(signIn)

  return
})

router.get("/redirect", async (req: Request, res: Response) => {
  const { code, state } = req.query

  if (!code) {
    return res.status(404).json({ ok: false, status: 404, code: "not_found", error: "Not Found" })
  }

  const userCode = code.toString()

  // get user info
  const user = await getOAuthUser(userCode)

  // kalo gada, return error
  if (!user || !user.ok || user.error || user.errors) {
    return res.status(404).json({ ok: false, status: 404, code: "not_found", error: "Not Found" })
  }

  // parse user info jadi IngetYa user
  const verifyUser = rep(await processThirdParty(user))

  if (!verifyUser.ok || verifyUser.status !== 200) {
    return res.render("autherror")
  }

  const userData = verifyUser.data.user as IUser

  // set cookie (req.session.user.<data>)
  req.user = {
    id: userData.id,
    createdAt: userData.createdAt
  }

  if (state) {
    console.log(state)
  }

  // redirect lah
  const redirectURL = "/portal"

  return res.redirect(redirectURL)
})

router.get("/:provider", (req: Request, res: Response, next: NextFunction) => {
  const { provider } = req.params

  if (!isProviderValid(provider.toString())) {
    return next()
  }

  return res.redirect(getOAuthUrl(provider as UserProvider, req.query))
})

export default router
