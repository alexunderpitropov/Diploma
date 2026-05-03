import { Component, inject, OnInit, signal } from '@angular/core'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../core/auth/auth.service'
import { ThemeService } from '../../core/theme.service'
import { CartCountService } from '../../core/cart-count.service'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  auth = inject(AuthService)
  themeService = inject(ThemeService)
  cartCount = inject(CartCountService)
  private router = inject(Router)

  menuOpen = signal(false)

  ngOnInit() {
    this.cartCount.refresh()
  }

  toggleMenu() {
    this.menuOpen.update(v => !v)
  }

  closeMenu() {
    this.menuOpen.set(false)
  }

  logout() {
    this.auth.logout()
    this.cartCount.clear()
    this.closeMenu()
    this.router.navigateByUrl('/platforms')
  }
}
