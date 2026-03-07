export type Product = {
  id: number
  name: string
  price: number
  description?: string | null
  imageUrl?: string | null
  stock?: number | null
  platformNames?: string[] | null
  categoryName?: string | null
  categoryId?: number | null
  specs?: string | null
}
