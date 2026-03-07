import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Product } from './product.model'
import { API_URL } from './api.config'

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private http = inject(HttpClient)

  getAll() {
    return this.http.get<Product[]>(`${API_URL}/api/products`)
  }

  getById(id: number) {
    return this.http.get<Product>(`${API_URL}/api/products/${id}`)
  }

  getByPlatformId(platformId: number) {
    return this.http.get<Product[]>(`${API_URL}/api/products/platform/${platformId}`)
  }

  getByCategory(categoryId: number) {
    return this.http.get<Product[]>(`${API_URL}/api/products/category/${categoryId}`)
  }

  search(name: string) {
    return this.http.get<Product[]>(`${API_URL}/api/products/search`, {
      params: { name },
    })
  }
}
