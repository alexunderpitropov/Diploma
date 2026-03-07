import { Injectable, signal } from '@angular/core'

export type PlatformTheme = 'theme-ps' | 'theme-xbox' | 'theme-nintendo' | ''

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<PlatformTheme>('')

  set(theme: PlatformTheme) {
    this.theme.set(theme)
  }

  clear() {
    this.theme.set('')
  }
}
