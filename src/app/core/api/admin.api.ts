import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { API_URL } from './api.config'

export type AdminStats = {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
}

export type AdminUser = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  role: string
}

export type AdminProductRequest = {
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  platformIds: number[]
  categoryId: number
  specs?: string
}

export type AdminOrder = {
  id: number
  status: string
  totalPrice: number
  deliveryAddress: string
  createdAt: string
  items: { id: number; productName: string; quantity: number; priceAtPurchase: number }[]
}

export type AdminCategory = {
  id: number
  name: string
  platformId: number | null
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient)
  private base = `${API_URL}/api/admin`

  getStats() {
    return this.http.get<AdminStats>(`${this.base}/stats`)
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.base}/users`)
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.base}/users/${id}`)
  }

  createProduct(body: AdminProductRequest) {
    return this.http.post<any>(`${this.base}/products`, body)
  }

  updateProduct(id: number, body: AdminProductRequest) {
    return this.http.put<any>(`${this.base}/products/${id}`, body)
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.base}/products/${id}`)
  }

  getAllOrders() {
    return this.http.get<AdminOrder[]>(`${this.base}/orders`)
  }

  updateOrderStatus(id: number, status: string) {
    return this.http.put<any>(`${this.base}/orders/${id}/status?status=${status}`, null)
  }

  getCategories() {
    return this.http.get<AdminCategory[]>(`${this.base}/categories`)
  }

  createCategory(body: { name: string; platformId: number }) {
    return this.http.post<AdminCategory>(`${this.base}/categories`, body)
  }

  uploadImage(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    return this.http.post<{ url: string }>(`${this.base}/upload`, fd)
  }
}
