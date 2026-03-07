import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { OrderApi, OrderResponse } from '../../core/api/order.api'
import { ToastService } from '../../core/toast.service'

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderApi = inject(OrderApi)
  private cdr = inject(ChangeDetectorRef)
  private toast = inject(ToastService)

  orders: OrderResponse[] = []
  loading = true
  expanded: number | null = null
  cancellingId: number | null = null

  ngOnInit() {
    this.orderApi.getMyOrders().subscribe({
      next: o => {
        this.orders = o || []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  toggle(id: number) {
    this.expanded = this.expanded === id ? null : id
  }

  canCancel(status: string): boolean {
    return status === 'PENDING'
  }

  cancel(event: Event, orderId: number) {
    event.stopPropagation()
    if (this.cancellingId) return
    this.cancellingId = orderId
    this.orderApi.cancel(orderId).subscribe({
      next: updated => {
        this.orders = this.orders.map(o => o.id === orderId ? updated : o)
        this.cancellingId = null
        this.toast.show('Заказ отменён')
        this.cdr.detectChanges()
      },
      error: () => {
        this.cancellingId = null
        this.toast.show('Не удалось отменить заказ', 'error')
        this.cdr.detectChanges()
      }
    })
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Ожидает',
      PROCESSING: 'В обработке',
      SHIPPED: 'Отправлен',
      DELIVERED: 'Доставлен',
      CANCELLED: 'Отменён',
    }
    return map[status] ?? status
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'status--pending',
      PROCESSING: 'status--processing',
      SHIPPED: 'status--shipped',
      DELIVERED: 'status--delivered',
      CANCELLED: 'status--cancelled',
    }
    return map[status] ?? ''
  }
}
