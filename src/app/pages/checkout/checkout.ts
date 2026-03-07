import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink, Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { OrderApi } from '../../core/api/order.api'
import { CartApi, CartItemResponse } from '../../core/api/cart.api'
import { CartCountService } from '../../core/cart-count.service'
import { ToastService } from '../../core/toast.service'

type PaymentMethod = 'card_online' | 'card_on_delivery' | 'cash'

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private orderApi = inject(OrderApi)
  private cartApi = inject(CartApi)
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef)
  private cartCount = inject(CartCountService)
  private toast = inject(ToastService)

  items: CartItemResponse[] = []
  loading = true
  saving = false
  error = ''
  address = ''
  paymentMethod: PaymentMethod = 'card_online'

  // Card fields
  cardNumber = ''
  cardExpiry = ''
  cardCvv = ''
  cardHolder = ''

  paymentOptions: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { value: 'card_online', label: 'Картой онлайн', icon: '💳', desc: 'Оплата при оформлении заказа' },
    { value: 'card_on_delivery', label: 'Картой при получении', icon: '🏦', desc: 'Оплата картой курьеру' },
    { value: 'cash', label: 'Наличными', icon: '💵', desc: 'Оплата наличными при получении' },
  ]

  ngOnInit() {
    this.cartApi.getCart().subscribe({
      next: r => {
        this.items = r.items || []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  }

  selectPayment(method: PaymentMethod) {
    this.paymentMethod = method
    this.error = ''
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '').substring(0, 16)
    this.cardNumber = value.replace(/(.{4})/g, '$1 ').trim()
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement
    let value = input.value.replace(/\D/g, '').substring(0, 4)
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    this.cardExpiry = value
  }

  formatCvv(event: Event) {
    const input = event.target as HTMLInputElement
    this.cardCvv = input.value.replace(/\D/g, '').substring(0, 3)
  }

  submit() {
    if (!this.address.trim()) {
      this.error = 'Укажите адрес доставки'
      return
    }
    if (this.items.length === 0) {
      this.error = 'Корзина пуста'
      return
    }
    if (this.paymentMethod === 'card_online') {
      if (!this.cardHolder.trim()) {
        this.error = 'Укажите имя владельца карты'
        return
      }
      if (this.cardNumber.replace(/\s/g, '').length < 16) {
        this.error = 'Введите корректный номер карты'
        return
      }
      if (this.cardExpiry.length < 5) {
        this.error = 'Введите срок действия карты'
        return
      }
      if (this.cardCvv.length < 3) {
        this.error = 'Введите CVV код'
        return
      }
    }

    this.saving = true
    this.error = ''
    this.orderApi.create(this.address).subscribe({
      next: () => {
        this.saving = false
        this.cartCount.clear()
        this.toast.show('Заказ успешно оформлен!')
        this.router.navigate(['/orders'])
      },
      error: () => {
        this.saving = false
        this.error = 'Ошибка при оформлении заказа'
        this.toast.show('Ошибка при оформлении заказа', 'error')
        this.cdr.detectChanges()
      }
    })
  }
}
