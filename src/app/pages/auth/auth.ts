import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private auth = inject(AuthService)
  private router = inject(Router)

  isLogin = true

  email = ''
  password = ''

  firstName = ''
  lastName = ''
  username = ''
  phoneNumber = ''
  confirmPassword = ''

  private digitsOnly(s: string) {
    return (s || '').replace(/\D/g, '')
  }

  private noSpaces(s: string) {
    return (s || '').replace(/\s+/g, '')
  }

  submit() {

    this.email = this.noSpaces(this.email)
    this.password = this.noSpaces(this.password)
    this.confirmPassword = this.noSpaces(this.confirmPassword)
    this.phoneNumber = this.digitsOnly(this.phoneNumber)

    if (this.isLogin) {
      this.auth.login(this.email, this.password)
        .subscribe(() => this.router.navigateByUrl('/platforms'))
    } else {
      if (this.password !== this.confirmPassword) return
      if (!/^\+?\d{8,15}$/.test(this.phoneNumber)) return

      this.auth.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        phoneNumber: this.phoneNumber,
      }).subscribe(() => this.router.navigateByUrl('/platforms'))
    }
  }
}
