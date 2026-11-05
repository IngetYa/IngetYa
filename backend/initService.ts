import cfg from "#cfg"
import logger from "#lib/logger"
import MongoConnection from "#core/database"
import ProductModel from "#models/ProductModel"
import { IProduct } from "#types/ServiceTypes"
import { genhex, rNumber } from "#lib/gen"
import { IUser } from "#types/UserTypes"
import UserModel from "#models/UserModel"
import waittime from "#core/waittime"
import { question } from "#lib/question"

interface IUserOutput {
  userId: string
  userHex: string
}

async function createUser(): Promise<IUserOutput> {
  const userSize = await UserModel.countDocuments()
  logger.info(`Number of Users: ${userSize}`)
  await waittime(500)

  if (userSize > 0) {
    logger.info("Skipping user creation")
    await waittime(500)
    console.log(" ")

    const firstUser = await UserModel.findOne().sort({ createdAt: 1 }).lean()

    const userId = firstUser!.id
    logger.success(`Using first user: ID ${userId}`)
    await waittime(2000)
    console.log(" ")

    return { userId, userHex: firstUser!.hex }
  }

  logger.info("Creating Example User")
  await waittime(1000)
  console.log(" ")

  const inpName = await question("User Name: (admin69) ")
  const name = inpName.length < 1 ? "admin69" : inpName
  await waittime(100)
  console.log(`>> ${name}`)
  await waittime(500)

  const inpEmail = await question("User Email: (admin69@ingetya.net) ")
  const email = inpEmail.length < 1 ? "admin69@ingetya.net" : inpEmail
  await waittime(100)
  console.log(`>> ${email}`)
  await waittime(2000)

  console.log(" ")

  const newUserId = "7" + rNumber(5).toString() + userSize
  const newUserHex = genhex(2).toUpperCase()

  const userData: IUser = {
    id: newUserId,
    luna: "0000",
    email,
    name,
    hex: newUserHex,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    access: ["ADMIN", "DEV"]
  }

  const user = await UserModel.create(userData)

  logger.success(`User created (${user.name} ${user.id})`)
  await waittime(2000)
  console.log(" ")

  return { userId: newUserId, userHex: newUserHex }
}

async function createProducts(uid: string): Promise<void> {
  const productSize = await ProductModel.countDocuments()
  logger.info(`Number of Products: ${productSize}`)
  await waittime(500)

  if (productSize > 0) {
    logger.info("Skipping products creation")
    await waittime(500)
    console.log(" ")

    const firstProducts = await ProductModel.find().limit(10)

    const firstOutput = firstProducts.map((itm) => `${itm.name} (ID ${itm.id})`)
    const firstString = firstOutput.join(" & ")

    logger.success(`Products existed: ${firstString}`)
    await waittime(2000)
    console.log(" ")

    return
  }

  logger.info("Creating 2 example products")
  await waittime(1000)
  console.log(" ")

  const productsData: IProduct[] = [
    {
      id: `8${rNumber(3)}${productSize}`,
      ownerId: uid,
      categories: ["Vintage", "Traditional"],
      image: "/assets/example/olive.png",
      isActive: true,
      name: "Olive",
      previewUrl: "https://groovepublic.com/blog-olive-part-iii/?to=Guest+Name",
      price: 20000,
      templateId: "666",
      updatedAt: new Date()
    },
    {
      id: `8${rNumber(3)}${productSize}`,
      ownerId: uid,
      categories: ["Minimalist", "Modern"],
      image: "/assets/example/reverie.png",
      isActive: true,
      name: "Reverie",
      previewUrl: "https://groovepublic.com/reverie/?to=Guest+Name",
      price: 21500,
      templateId: "667",
      updatedAt: new Date()
    }
  ]

  const products = await ProductModel.create(...productsData)

  const productsOutput = products.map((itm) => `${itm.name} (ID ${itm.id})`)
  const productsString = productsOutput.join(" & ")

  logger.success(`Products created: ${productsString}`)
  await waittime(2000)
  console.log(" ")
}

async function createDatabase(): Promise<void> {
  await waittime(2000)
  console.log(" ")

  const { userId, userHex } = await createUser()
  await createProducts(userId)

  logger.info("DONE!!")
  await waittime(1000)

  console.log(" ")

  console.log("Use this hex as 'Guest Key' to login as the selected user")
  await waittime(200)
  console.log(`>> ${userHex}`)
  await waittime(1000)

  process.exit(0)
}

async function initializeService(): Promise<void> {
  // init mongodb
  const mongoConnection = new MongoConnection(cfg.DB_URI, cfg.DB_NAME)

  // start mongodb, start bot, hell nested function yeahhhhhh brrrr [emot api]
  mongoConnection.connect(() => createDatabase())
}

initializeService()
