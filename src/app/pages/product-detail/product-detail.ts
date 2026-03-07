import { CommonModule, Location } from '@angular/common'
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { ProductApi } from '../../core/api/product.api'
import { Product } from '../../core/api/product.model'
import { CartApi } from '../../core/api/cart.api'
import { WishlistApi } from '../../core/api/wishlist.api'
import { ThemeService, PlatformTheme } from '../../core/theme.service'
import { CartCountService } from '../../core/cart-count.service'
import { ToastService } from '../../core/toast.service'

const SPEC_LABELS: Record<string, string> = {
  genre: 'Жанр',
  year: 'Год выхода',
  publisher: 'Издатель',
  developer: 'Разработчик',
  ageRating: 'Возрастное ограничение',
  players: 'Количество игроков',
  manufacturer: 'Производитель',
  storage: 'Объём памяти',
  color: 'Цвет',
  edition: 'Комплектация',
  warranty: 'Гарантия',
  brand: 'Бренд',
  type: 'Тип',
  connection: 'Тип подключения',
  compatibility: 'Совместимость',
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private productApi = inject(ProductApi)
  private cartApi = inject(CartApi)
  private wishlistApi = inject(WishlistApi)
  private cdr = inject(ChangeDetectorRef)
  private themeService = inject(ThemeService)
  private cartCount = inject(CartCountService)
  private toast = inject(ToastService)
  private location = inject(Location)

  product: Product | null = null
  allSimilar: Product[] = []
  specs: { key: string; label: string; value: string }[] = []
  loading = true
  error = false
  adding = false
  added = false
  inWishlist = false
  togglingWishlist = false
  themeClass = ''

  similarPage = 0
  readonly pageSize = 4

  get similar(): Product[] {
    const start = this.similarPage * this.pageSize
    return this.allSimilar.slice(start, start + this.pageSize)
  }

  get totalSimilarPages(): number {
    return Math.ceil(this.allSimilar.length / this.pageSize)
  }

  get canPrev(): boolean { return this.similarPage > 0 }
  get canNext(): boolean { return this.similarPage < this.totalSimilarPages - 1 }

  prevSimilar() { if (this.canPrev) { this.similarPage--; this.cdr.detectChanges() } }
  nextSimilar() { if (this.canNext) { this.similarPage++; this.cdr.detectChanges() } }

  goBack() { this.location.back() }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id'])
      this.loadProduct(id)
    })
  }

  private loadProduct(id: number) {
    this.loading = true
    this.error = false
    this.allSimilar = []
    this.similarPage = 0
    this.specs = []
    this.product = null

    this.productApi.getById(id).subscribe({
      next: p => {
        this.product = p
        this.specs = this.parseSpecs(p.specs)
        this.themeClass = this.getTheme(p.platformNames ?? [])
        this.themeService.set(this.themeClass as PlatformTheme)
        this.loading = false
        this.cdr.detectChanges()

        this.wishlistApi.getWishlist().subscribe({
          next: items => {
            this.inWishlist = (items || []).some(i => i.id === p.id)
            this.cdr.detectChanges()
          },
          error: () => {}
        })

        this.loadSimilar(p)
      },
      error: () => {
        this.error = true
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  private loadSimilar(p: Product) {
    const family = this.getPlatformFamily(p.platformNames ?? [])
    if (!family) return

    this.productApi.getAll().subscribe({
      next: items => {
        this.allSimilar = (items || [])
          .filter(i => i.id !== p.id)
          .filter(i => this.getPlatformFamily(i.platformNames ?? []) === family)
        this.cdr.detectChanges()
      },
      error: () => {}
    })
  }

  private getPlatformFamily(platformNames: string[]): string {
    const combined = platformNames.join(' ').toLowerCase()
    if (combined.includes('playstation')) return 'playstation'
    if (combined.includes('xbox')) return 'xbox'
    if (combined.includes('nintendo')) return 'nintendo'
    return ''
  }

  ngOnDestroy() {
    this.themeService.clear()
  }

  private parseSpecs(raw: string | null | undefined): { key: string; label: string; value: string }[] {
    if (!raw) return []
    try {
      const obj = JSON.parse(raw)
      return Object.entries(obj)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ key: k, label: SPEC_LABELS[k] || k, value: String(v) }))
    } catch {
      return []
    }
  }

  private getTheme(platformNames: string[]): string {
    const combined = platformNames.join(' ').toLowerCase()
    if (combined.includes('playstation') || combined.includes('sony')) return 'theme-ps'
    if (combined.includes('xbox') || combined.includes('microsoft')) return 'theme-xbox'
    if (combined.includes('nintendo') || combined.includes('switch')) return 'theme-nintendo'
    return ''
  }

  addToCart() {
    if (!this.product) return
    this.adding = true
    this.cartApi.addItem(this.product.id, 1).subscribe({
      next: () => {
        this.adding = false
        this.added = true
        this.cartCount.increment()
        this.toast.show('Добавлено в корзину')
        this.cdr.detectChanges()
        setTimeout(() => { this.added = false; this.cdr.detectChanges() }, 2000)
      },
      error: () => {
        this.adding = false
        this.toast.show('Ошибка при добавлении', 'error')
        this.cdr.detectChanges()
      }
    })
  }

  toggleWishlist() {
    if (!this.product) return
    this.togglingWishlist = true
    const req$ = this.inWishlist
      ? this.wishlistApi.remove(this.product.id)
      : this.wishlistApi.add(this.product.id)
    req$.subscribe(() => {
      this.inWishlist = !this.inWishlist
      this.togglingWishlist = false
      this.toast.show(this.inWishlist ? 'Добавлено в избранное' : 'Удалено из избранного')
      this.cdr.detectChanges()
    })
  }
}
