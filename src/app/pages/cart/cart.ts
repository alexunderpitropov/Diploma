import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CartApi, CartItemResponse } from '../../core/api/cart.api'
import { CartCountService } from '../../core/cart-count.service'
import { ToastService } from '../../core/toast.service'

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartApi = inject(CartApi)
  private cdr = inject(ChangeDetectorRef)
  private cartCount = inject(CartCountService)
  private toast = inject(ToastService)

  items: CartItemResponse[] = []
  loading = true

  ngOnInit() {
    this.cartApi.getCart().subscribe({
      next: r => {
        this.items = r.items || []
        this.loading = false
        this.syncCount()
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  increase(item: CartItemResponse) {
    this.cartApi.updateItem(item.cartItemId, item.quantity + 1).subscribe(r => {
      this.items = r.items || []
      this.syncCount()
      this.cdr.detectChanges()
    })
  }

  decrease(item: CartItemResponse) {
    if (item.quantity <= 1) { this.remove(item); return }
    this.cartApi.updateItem(item.cartItemId, item.quantity - 1).subscribe(r => {
      this.items = r.items || []
      this.syncCount()
      this.cdr.detectChanges()
    })
  }

  remove(item: CartItemResponse) {
    this.cartApi.removeItem(item.cartItemId).subscribe(r => {
      this.items = r.items || []
      this.syncCount()
      this.toast.show('Товар удалён из корзины', 'info')
      this.cdr.detectChanges()
    })
  }

  clear() {
    this.cartApi.clearCart().subscribe(() => {
      this.items = []
      this.cartCount.clear()
      this.toast.show('Корзина очищена', 'info')
      this.cdr.detectChanges()
    })
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  }

  private syncCount() {
    const total = this.items.reduce((sum, i) => sum + i.quantity, 0)
    this.cartCount.count.set(total)
  }
}
