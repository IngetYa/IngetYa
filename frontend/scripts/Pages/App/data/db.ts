import { ProductsAPI } from "../API/ProductsAPI"

type LocalDBType = {
  products: ProductsAPI
}

const db: LocalDBType = {
  products: new ProductsAPI()
}

export default db
