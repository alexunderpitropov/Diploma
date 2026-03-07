import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { PlatformApi } from '../../core/api/platform.api'
import { Platform } from '../../core/api/platform.model'

@Component({
  selector: 'app-platforms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platforms.html',
  styleUrl: './platforms.css',
})
export class Platforms {

  private api = inject(PlatformApi)
  private router = inject(Router)

  private platforms: Platform[] = []

  constructor() {
    this.api.getAll().subscribe(data => {
      this.platforms = data || []
    })
  }

  select(key: 'playstation' | 'xbox' | 'nintendo') {
    const matched = this.platforms.filter(p => this.matchPlatform(p.name, key))

    if (matched.length > 0) {
      const ids = matched.map(p => p.id).join(',')
      this.router.navigate(['/catalog'], { queryParams: { platformIds: ids } })
      return
    }

    this.router.navigate(['/catalog'])
  }

  private matchPlatform(name: string, key: string) {
    const n = (name ?? '').toLowerCase()

    if (key === 'playstation') return n.includes('playstation') || n.includes('sony') || n === 'ps'
    if (key === 'xbox') return n.includes('xbox') || n.includes('microsoft')
    if (key === 'nintendo') return n.includes('nintendo') || n.includes('switch')
    return false
  }
}
