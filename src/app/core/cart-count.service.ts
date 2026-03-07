import { Injectable, inject, signal } from '@angular/core'
import { CartApi } from './api/cart.api'
import { AuthService } from './auth/auth.service'

@Injectable({ providedIn: 'root' })
export class CartCountService {
  private cartApi = inject(CartApi)
  private auth = inject(AuthService)

  readonly count = signal(0)

  refresh() {
    if (!this.auth.isLoggedIn()) {
      this.count.set(0)
      return
    }
    this.cartApi.getCart().subscribe({
      next: r => {
        const total = (r.items || []).reduce((sum, i) => sum + i.quantity, 0)
        this.count.set(total)
      },
      error: () => this.count.set(0)
    })
  }

  increment(by = 1) {
    this.count.update(n => n + by)
  }

  decrement(by = 1) {
    this.count.update(n => Math.max(0, n - by))
  }

  clear() {
    this.count.set(0)
  }
}
