import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {}
