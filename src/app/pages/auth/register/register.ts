import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../core/auth/auth.service'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(AuthService)
  private router = inject(Router)

  email = ''
  password = ''
  firstName = ''
  lastName = ''
  username = ''
  phoneNumber = ''
  confirmPassword = ''

  submit() {
    if (this.password !== this.confirmPassword) return

    this.auth.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      phoneNumber: this.phoneNumber,
    }).subscribe(() => {
      this.router.navigateByUrl('/platforms')
    })
  }
}
