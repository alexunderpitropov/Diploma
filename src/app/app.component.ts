import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Header } from './layout/header/header'
import { Footer } from './layout/footer/footer'
import { ToastComponent } from './shared/toast/toast'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, ToastComponent],
  templateUrl: './app.html',
})
export class App {}
