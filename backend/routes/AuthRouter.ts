import express, { NextFunction, Request, Response, Router } from "express"
import { parseBase64, rep } from "#lib/gen"
import { authLogin, getMe, processThirdParty } from "#controllers/AuthController"
import { getOAuthUrl, getOAuthUser, isProviderValid } from "#main/OAuthFind"
import { IUser, UserProvider } from "#types/UserTypes"
import { isUser } from "#core/middlewares"
import { cooldown } from "#core/cooldown"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/get-user", cooldown.user("user", 1000), isUser, async (req: Request, res: Response) => {
  const me = rep(await getMe(req.user!.id))

  return res.status(me.status).json(me)
})

router.post("/sign-in", async (req: Request, res: Response) => {
  const signIn = rep(await authLogin(req.body, req.query))
  res.status(signIn.status).json(signIn)

  return
})

router.get("/redirect", async (req: Request, res: Response) => {
  const { code, state } = req.query

  const userState = (state ? parseBase64(state) : {}) as Record<string, string>

  if (!code) {
    userState.error = "auth_failed"

    const queryString = new URLSearchParams(userState).toString()

    return res.redirect(`/portal?${queryString}`)
  }

  const userCode = code.toString()

  // get user info
  const user = await getOAuthUser(userCode)

  // kalo gada, return error
  if (!user || !user.ok || user.error || user.errors) {
    userState.error = "auth_failed"

    const queryString = new URLSearchParams(userState).toString()

    return res.redirect(`/portal?${queryString}`)
  }

  // parse user info jadi IngetYa user
  const verifyUser = rep(await processThirdParty(user))

  if (!verifyUser.ok || verifyUser.status !== 200) {
    userState.error = "auth_failed"

    const queryString = new URLSearchParams(userState).toString()

    return res.redirect(`/portal?${queryString}`)
  }

  const userData = verifyUser.data.user as IUser

  // set cookie (req.session.user.<data>)
  req.user = {
    id: userData.id,
    createdAt: userData.createdAt
  }

  const queryString = new URLSearchParams(userState).toString()

  // redirect lah
  const redirectURL = "/portal" + (queryString.length >= 1 ? `?${queryString}` : "")

  return res.redirect(redirectURL)
})

router.get("/:provider", (req: Request, res: Response, next: NextFunction) => {
  const { provider } = req.params

  if (!isProviderValid(provider.toString())) {
    return next()
  }

  return res.redirect(getOAuthUrl(provider as UserProvider, req.query))
})

router.get("/logout", (req: Request, res: Response) => {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"

  req.session.destroy(() => {
    if (isJsonRequest) return res.status(200).json({ ok: true, status: 200 })

    const q = req.query.i

    const redirectURL = `/portal${q ? "?i=" + q : ""}`

    return res.redirect(redirectURL)
  })
})

export default router
