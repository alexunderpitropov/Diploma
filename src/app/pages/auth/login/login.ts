import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../core/auth/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService)
  private router = inject(Router)

  email = ''
  password = ''

  submit() {
    this.auth.login(this.email, this.password).subscribe(() => this.router.navigateByUrl('/platforms'))
  }
}
