import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { API_URL } from './api.config'

export type CartItemResponse = {
  cartItemId: number
  productId: number
  productName: string
  price: number
  quantity: number
  stock: number
}

export type CartResponse = {
  cartId: number
  items: CartItemResponse[]
}

@Injectable({ providedIn: 'root' })
export class CartApi {
  private http = inject(HttpClient)
  private base = `${API_URL}/api/cart`

  getCart() {
    return this.http.get<CartResponse>(this.base)
  }

  addItem(productId: number, quantity: number) {
    return this.http.post<CartResponse>(`${this.base}/add`, null, {
      params: { productId, quantity }
    })
  }

  updateItem(cartItemId: number, quantity: number) {
    return this.http.put<CartResponse>(`${this.base}/update/${cartItemId}`, null, {
      params: { quantity }
    })
  }

  removeItem(cartItemId: number) {
    return this.http.delete<CartResponse>(`${this.base}/remove/${cartItemId}`)
  }

  clearCart() {
    return this.http.delete<void>(`${this.base}/clear`)
  }
}
