import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { API_URL } from './api.config'

export type OrderItemResponse = {
  id: number
  productName: string
  quantity: number
  priceAtPurchase: number
}

export type OrderResponse = {
  id: number
  status: string
  totalPrice: number
  deliveryAddress: string
  createdAt: string
  items: OrderItemResponse[]
}

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private http = inject(HttpClient)
  private base = `${API_URL}/api/orders`

  getMyOrders() {
    return this.http.get<OrderResponse[]>(this.base)
  }

  getById(id: number) {
    return this.http.get<OrderResponse>(`${this.base}/${id}`)
  }

  create(deliveryAddress: string) {
    return this.http.post<OrderResponse>(this.base, { deliveryAddress })
  }

  cancel(id: number) {
    return this.http.patch<OrderResponse>(`${this.base}/${id}/cancel`, {})
  }
}
