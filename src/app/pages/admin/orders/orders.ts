import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminApi, AdminOrder } from '../../../core/api/admin.api'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private adminApi = inject(AdminApi)
  private cdr = inject(ChangeDetectorRef)

  orders: AdminOrder[] = []
  loading = false
  expandedId: number | null = null
  statuses = Object.keys(STATUS_LABELS)

  ngOnInit() {
    this.load()
  }

  load() {
    this.loading = true
    this.adminApi.getAllOrders().subscribe({
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
    this.expandedId = this.expandedId === id ? null : id
  }

  changeStatus(order: AdminOrder, status: string) {
    this.adminApi.updateOrderStatus(order.id, status).subscribe(() => {
      order.status = status
      this.cdr.detectChanges()
    })
  }

  label(status: string) {
    return STATUS_LABELS[status] || status
  }
}
