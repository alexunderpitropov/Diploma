import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Product } from './product.model'
import { API_URL } from './api.config'

@Injectable({ providedIn: 'root' })
export class WishlistApi {
  private http = inject(HttpClient)
  private base = `${API_URL}/api/wishlist`

  getWishlist() {
    return this.http.get<Product[]>(this.base)
  }

  add(productId: number) {
    return this.http.post<void>(`${this.base}/add/${productId}`, null)
  }

  remove(productId: number) {
    return this.http.delete<void>(`${this.base}/remove/${productId}`)
  }
}
