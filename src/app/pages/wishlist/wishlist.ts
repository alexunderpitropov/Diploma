import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { WishlistApi } from '../../core/api/wishlist.api'
import { Product } from '../../core/api/product.model'
import { CartApi } from '../../core/api/cart.api'
import { CartCountService } from '../../core/cart-count.service'
import { ToastService } from '../../core/toast.service'

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  private wishlistApi = inject(WishlistApi)
  private cartApi = inject(CartApi)
  private cdr = inject(ChangeDetectorRef)
  private cartCount = inject(CartCountService)
  private toast = inject(ToastService)

  items: Product[] = []
  loading = true
  addingToCart: number[] = []

  ngOnInit() {
    this.wishlistApi.getWishlist().subscribe({
      next: items => {
        this.items = items || []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  remove(productId: number) {
    this.wishlistApi.remove(productId).subscribe(() => {
      this.items = this.items.filter(i => i.id !== productId)
      this.toast.show('Удалено из избранного', 'info')
      this.cdr.detectChanges()
    })
  }

  addToCart(product: Product) {
    this.addingToCart = [...this.addingToCart, product.id]
    this.cartApi.addItem(product.id, 1).subscribe(() => {
      this.addingToCart = this.addingToCart.filter(id => id !== product.id)
      this.cartCount.increment()
      this.toast.show('Добавлено в корзину')
      this.cdr.detectChanges()
    })
  }
}
