import cfg from "#cfg"
import logger from "#lib/logger"
import MongoConnection from "#core/database"
import ProductModel from "#models/ProductModel"
import { IProduct } from "#types/ServiceTypes"
import { genhex, rNumber, rUid } from "#lib/gen"
import { IUser } from "#types/UserTypes"
import UserModel from "#models/UserModel"
import waittime from "#core/waittime"
import { question } from "#lib/question"
import BalanceModel from "#models/BalanceModel"
import TransactionModel from "#models/TransactionModel"
import MessageModel from "#models/MessageModel"
import RoomModel from "#models/RoomModel"

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
    access: ["staff", "support", "products", "orders", "bills", "accounts"]
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

async function createBalance(): Promise<void> {
  const balanceExists = await BalanceModel.exists({ isTotal: true })

  if (balanceExists) {
    logger.info("Balance had already existed")
    await waittime(2000)
    console.log(" ")
    return
  }

  logger.info("Creating initial balance")
  await waittime(1000)
  console.log(" ")

  await BalanceModel.create(
    {
      amount: 0,
      type: "none",
      isRoot: true,
      isOrg: true,
      createdAt: new Date()
    },
    {
      amount: 0,
      type: "income",
      isRoot: true,
      createdAt: new Date()
    },
    {
      amount: 0,
      type: "expense",
      isRoot: true,
      createdAt: new Date()
    }
  )

  logger.success(`Initial balance created.`)

  await waittime(2000)
  console.log(" ")
}

// async function createTransaction(): Promise<void> {
//   await TransactionModel.create(
//     {
//       amount: 90000,
//       author: "761761",
//       name: "1 Uang Pegangan Pertama",
//       desc: "Isi saldo organisasi pertama kali",
//       id: rUid(),
//       timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
//       type: "income"
//     },
//     {
//       amount: 88000,
//       author: "761761",
//       name: "2 Bayar tagihan VPS",
//       desc: "Pembayaran bulanan server dan database",
//       id: rUid(),
//       timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
//       type: "expense"
//     },
//     {
//       amount: 130000,
//       author: "761761",
//       name: "3 Uang Pegangan Pertama",
//       desc: "Isi saldo organisasi pertama kali",
//       id: rUid(),
//       timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
//       type: "income"
//     },
//     {
//       amount: 132000,
//       author: "761761",
//       name: "4 Bayar tagihan VPS",
//       desc: "Pembayaran bulanan server dan database",
//       id: rUid(),
//       timestamp: new Date(),
//       type: "expense"
//     }
//   )
// }

async function createChat(): Promise<void> {
  const id_1 = rUid()
  const id_2 = rUid()
  await MessageModel.create(
    {
      id: id_1,
      userId: "7915790",
      roomId: "8370",
      text: "Aihihihi"
    },
    {
      id: id_2,
      userId: "7915790",
      roomId: "9999",
      text: "Kocak",
      fileName: "olive.png",
      fileUrl: "/assets/example/olive.png"
    }
  )

  await RoomModel.create(
    {
      id: "9999",
      type: "support",
      userId: "7915790",
      latestChatId: id_2
    },
    {
      id: "8370",
      type: "order",
      userId: "7915790",
      latestChatId: id_1
    }
  )
}

let dev: boolean = true

async function createDatabase(): Promise<void> {
  // await createTransaction()
  await createChat()

  if (dev) return process.exit(0)

  dev = false

  await waittime(2000)
  console.log(" ")

  const { userId, userHex } = await createUser()
  await createProducts(userId)
  await createBalance()

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
