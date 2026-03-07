import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { switchMap } from 'rxjs'
import { ProductApi } from '../../core/api/product.api'
import { PlatformApi } from '../../core/api/platform.api'
import { Product } from '../../core/api/product.model'
import { Platform } from '../../core/api/platform.model'
import { ThemeService, PlatformTheme } from '../../core/theme.service'

type CategoryKey = 'all' | 'consoles' | 'games' | 'devices'
type SortKey = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private productApi = inject(ProductApi)
  private platformApi = inject(PlatformApi)
  private cdr = inject(ChangeDetectorRef)
  private themeService = inject(ThemeService)

  platformName = ''
  themeClass = ''

  query = ''
  category: CategoryKey = 'all'
  sort: SortKey = 'default'

  products: Product[] = []
  loading = false

  readonly pageSize = 8
  currentPage = 1

  sortOptions: { value: SortKey; label: string }[] = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Цена: дешевле' },
    { value: 'price_desc', label: 'Цена: дороже' },
    { value: 'name_asc', label: 'Название: А–Я' },
    { value: 'name_desc', label: 'Название: Я–А' },
  ]

  private platforms: Platform[] = []

  ngOnInit() {
    this.platformApi.getAll().pipe(
      switchMap(platforms => {
        this.platforms = platforms || []
        return this.route.queryParams
      })
    ).subscribe(params => {
      const raw = params['platformIds'] || params['platformId']
      this.category = 'all'
      this.query = ''
      this.sort = 'default'
      this.currentPage = 1

      if (!raw) {
        this.platformName = 'Все товары'
        this.themeClass = ''
        this.themeService.set('' as PlatformTheme)
        this.loadAll()
      } else {
        const ids: number[] = raw.toString().split(',').map(Number)
        const matched = this.platforms.filter(x => ids.includes(Number(x.id)))
        const firstName = matched[0]?.name || ''
        const n = firstName.toLowerCase()

        this.platformName = n.includes('playstation') ? 'PlayStation'
          : n.includes('xbox') ? 'Xbox'
            : n.includes('nintendo') ? 'Nintendo'
              : firstName || 'Платформа'

        if (n.includes('playstation') || n.includes('sony')) {
          this.themeClass = 'theme-ps'
        } else if (n.includes('xbox') || n.includes('microsoft')) {
          this.themeClass = 'theme-xbox'
        } else if (n.includes('nintendo') || n.includes('switch')) {
          this.themeClass = 'theme-nintendo'
        } else {
          this.themeClass = 'theme-default'
        }

        this.themeService.set(this.themeClass as PlatformTheme)
        this.loadByPlatforms(ids)
      }
    })
  }

  ngOnDestroy() {
    this.themeService.clear()
  }

  private loadAll() {
    this.loading = true
    this.products = []
    this.cdr.detectChanges()
    this.productApi.getAll().subscribe({
      next: items => {
        this.products = items || []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  private loadByPlatforms(ids: number[]) {
    this.loading = true
    this.products = []
    this.cdr.detectChanges()

    if (ids.length === 1) {
      this.productApi.getByPlatformId(ids[0]).subscribe({
        next: items => {
          this.products = items || []
          this.loading = false
          this.cdr.detectChanges()
        },
        error: () => {
          this.loading = false
          this.cdr.detectChanges()
        }
      })
    } else {
      this.productApi.getAll().subscribe({
        next: items => {
          this.products = (items || []).filter(p =>
            (p.platformNames || []).some(n =>
              n.toLowerCase().includes(this.platformName.toLowerCase())
            )
          )
          this.loading = false
          this.cdr.detectChanges()
        },
        error: () => {
          this.loading = false
          this.cdr.detectChanges()
        }
      })
    }
  }

  setCategory(c: CategoryKey) {
    this.category = c
    this.currentPage = 1
  }

  setQuery(v: string) {
    this.query = v
    this.currentPage = 1
  }

  setSort(v: SortKey) {
    this.sort = v
    this.currentPage = 1
  }

  get filtered(): Product[] {
    const q = this.query.trim().toLowerCase()
    let result = this.products
      .filter(p => !q || (p.name ?? '').toLowerCase().includes(q))
      .filter(p => {
        if (this.category === 'all') return true
        const t = this.getType(p)
        if (this.category === 'consoles') return t === 'console'
        if (this.category === 'games') return t === 'game'
        if (this.category === 'devices') return t === 'device'
        return true
      })

    switch (this.sort) {
      case 'price_asc':
        return [...result].sort((a, b) => Number(a.price) - Number(b.price))
      case 'price_desc':
        return [...result].sort((a, b) => Number(b.price) - Number(a.price))
      case 'name_asc':
        return [...result].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ru'))
      case 'name_desc':
        return [...result].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? '', 'ru'))
      default:
        return result
    }
  }

  get paginated(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize
    return this.filtered.slice(start, start + this.pageSize)
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize)
  }

  get pageNumbers(): number[] {
    const total = this.totalPages
    const current = this.currentPage
    const delta = 2
    const pages: number[] = []

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i)
    }

    if (pages[0] > 1) {
      pages.unshift(-1)
      pages.unshift(1)
    }

    if (pages[pages.length - 1] < total) {
      pages.push(-2)
      pages.push(total)
    }

    return pages
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return
    this.currentPage = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
    this.cdr.detectChanges()
  }

  private getType(p: Product): 'console' | 'game' | 'device' | 'unknown' {
    const raw = (p.categoryName ?? '').toLowerCase()
    if (raw.includes('консол')) return 'console'
    if (raw.includes('игр')) return 'game'
    if (raw.includes('аксесс') || raw.includes('девайс') || raw.includes('геймпад')) return 'device'
    return 'unknown'
  }
}
