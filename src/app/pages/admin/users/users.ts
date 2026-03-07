import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AdminApi, AdminUser } from '../../../core/api/admin.api'

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private adminApi = inject(AdminApi)
  private cdr = inject(ChangeDetectorRef)

  users: AdminUser[] = []
  loading = true

  ngOnInit() {
    this.adminApi.getUsers().subscribe({
      next: u => {
        this.users = u ?? []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  delete(id: number) {
    if (!confirm('Удалить пользователя?')) return
    this.adminApi.deleteUser(id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== id)
      this.cdr.detectChanges()
    })
  }
}
