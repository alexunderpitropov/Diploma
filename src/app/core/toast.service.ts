import { Injectable, signal } from '@angular/core'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([])
  private counter = 0

  show(message: string, type: ToastType = 'success') {
    const id = ++this.counter
    this.toasts.update(t => [...t, { id, message, type }])
    setTimeout(() => this.remove(id), 3000)
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id))
  }
}
