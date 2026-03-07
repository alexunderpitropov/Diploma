import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'
import { UserInfo } from '../../core/auth/auth.types'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService)
  private cdr = inject(ChangeDetectorRef)

  user: UserInfo | null = null
  isAdmin = false

  ngOnInit() {
    this.authService.user$.subscribe(u => {
      this.user = u
      this.isAdmin = this.authService.isAdmin()
      this.cdr.detectChanges()
    })
  }

  get displayName(): string {
    if (!this.user) return ''
    if (this.user.firstName && this.user.lastName) return `${this.user.firstName} ${this.user.lastName}`
    if (this.user.username) return this.user.username
    return this.user.email
  }

  get initials(): string {
    if (!this.user) return '?'
    if (this.user.firstName && this.user.lastName) return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase()
    if (this.user.username) return this.user.username[0].toUpperCase()
    return this.user.email[0].toUpperCase()
  }

  logout() {
    this.authService.logout()
  }
}
