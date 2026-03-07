import { CommonModule } from '@angular/common'
import { Component, inject, ChangeDetectorRef } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AdminApi, AdminProductRequest, AdminCategory } from '../../../core/api/admin.api'
import { ProductApi } from '../../../core/api/product.api'
import { PlatformApi } from '../../../core/api/platform.api'
import { Platform } from '../../../core/api/platform.model'
import { Product } from '../../../core/api/product.model'
import { RouterLink } from '@angular/router'

type SpecField = { key: string; label: string }

const GAME_SPECS: SpecField[] = [
  { key: 'genre', label: 'Жанр' },
  { key: 'year', label: 'Год выхода' },
  { key: 'publisher', label: 'Издатель' },
  { key: 'developer', label: 'Разработчик' },
  { key: 'ageRating', label: 'Возрастной рейтинг' },
  { key: 'players', label: 'Количество игроков' },
]

const CONSOLE_SPECS: SpecField[] = [
  { key: 'manufacturer', label: 'Производитель' },
  { key: 'storage', label: 'Объём памяти' },
  { key: 'color', label: 'Цвет' },
  { key: 'edition', label: 'Комплектация' },
  { key: 'warranty', label: 'Гарантия' },
]

const DEVICE_SPECS: SpecField[] = [
  { key: 'brand', label: 'Бренд' },
  { key: 'type', label: 'Тип' },
  { key: 'color', label: 'Цвет' },
  { key: 'connection', label: 'Тип подключения' },
  { key: 'compatibility', label: 'Совместимость' },
]

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  private adminApi = inject(AdminApi)
  private productApi = inject(ProductApi)
  private platformApi = inject(PlatformApi)
  private cdr = inject(ChangeDetectorRef)

  products: Product[] = []
  platforms: Platform[] = []
  categories: AdminCategory[] = []
  filteredCategories: AdminCategory[] = []

  loading = false
  showForm = false
  editingId: number | null = null
  saving = false
  uploading = false
  error = ''
  openDropdownId: number | null = null
  platformMenuOpen = false

  imagePreview: string | null = null
  form: AdminProductRequest = this.emptyForm()
  specFields: SpecField[] = []
  specValues: Record<string, string> = {}

  sortCol: 'id' | 'name' | 'platform' | 'category' | 'price' | 'stock' = 'id'
  sortDir: 'asc' | 'desc' = 'asc'

  stockStatuses = [
    { value: 1, label: 'В наличии' },
    { value: 0, label: 'Нет в наличии' },
    { value: -1, label: 'Ожидается' },
  ]

  constructor() {
    this.load()
    this.platformApi.getAll().subscribe(p => {
      this.platforms = p || []
      this.cdr.detectChanges()
    })
    this.adminApi.getCategories().subscribe(c => {
      this.categories = c || []
      this.filteredCategories = []
      this.cdr.detectChanges()
    })
    if (typeof document !== 'undefined') {
      document.addEventListener('click', () => {
        this.openDropdownId = null
        this.platformMenuOpen = false
        this.cdr.detectChanges()
      })
    }
  }

  get sortedProducts(): Product[] {
    return [...this.products].sort((a, b) => {
      let valA: any, valB: any
      switch (this.sortCol) {
        case 'id': valA = a.id; valB = b.id; break
        case 'name': valA = a.name?.toLowerCase(); valB = b.name?.toLowerCase(); break
        case 'platform': valA = (a.platformNames || []).join(', ').toLowerCase(); valB = (b.platformNames || []).join(', ').toLowerCase(); break
        case 'category': valA = a.categoryName?.toLowerCase(); valB = b.categoryName?.toLowerCase(); break
        case 'price': valA = a.price; valB = b.price; break
        case 'stock': valA = this.stockValue(a.stock); valB = this.stockValue(b.stock); break
      }
      if (valA < valB) return this.sortDir === 'asc' ? -1 : 1
      if (valA > valB) return this.sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  sort(col: typeof this.sortCol) {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortCol = col
      this.sortDir = 'asc'
    }
    this.cdr.detectChanges()
  }

  sortIcon(col: typeof this.sortCol): string {
    if (this.sortCol !== col) return '↕'
    return this.sortDir === 'asc' ? '↑' : '↓'
  }

  load() {
    this.loading = true
    this.productApi.getAll().subscribe({
      next: p => {
        this.products = p || []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  togglePlatformMenu() {
    this.platformMenuOpen = !this.platformMenuOpen
    this.cdr.detectChanges()
  }

  selectedPlatformNames(): string {
    return this.platforms
      .filter(pl => this.form.platformIds.includes(pl.id))
      .map(pl => pl.name)
      .join(', ')
  }

  togglePlatform(id: number) {
    const ids = this.form.platformIds
    const idx = ids.indexOf(id)
    if (idx === -1) {
      this.form.platformIds = [...ids, id]
    } else {
      this.form.platformIds = ids.filter(x => x !== id)
    }
    this.updateFilteredCategories()
    this.cdr.detectChanges()
  }

  isPlatformSelected(id: number): boolean {
    return this.form.platformIds.includes(id)
  }

  private updateFilteredCategories() {
    const ids = this.form.platformIds
    if (ids.length === 0) {
      this.filteredCategories = []
    } else {
      const seen = new Set<string>()
      this.filteredCategories = this.categories
        .filter(c => ids.includes(Number(c.platformId)))
        .filter(c => {
          if (seen.has(c.name)) return false
          seen.add(c.name)
          return true
        })
    }
    if (!this.filteredCategories.find(c => c.id === Number(this.form.categoryId))) {
      this.form.categoryId = 0
    }
    this.updateSpecFields()
  }

  onCategoryChange() {
    this.updateSpecFields()
    this.cdr.detectChanges()
  }

  private updateSpecFields() {
    const cat = this.filteredCategories.find(c => c.id === Number(this.form.categoryId))
    const name = (cat?.name || '').toLowerCase().trim()
    if (name.includes('игр')) {
      this.specFields = GAME_SPECS
    } else if (name.includes('консол')) {
      this.specFields = CONSOLE_SPECS
    } else if (name.includes('аксес') || name.includes('девайс') || name.includes('геймпад')) {
      this.specFields = DEVICE_SPECS
    } else {
      this.specFields = []
    }
    this.cdr.detectChanges()
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) return
    const file = input.files[0]

    const reader = new FileReader()
    reader.onload = e => {
      this.imagePreview = e.target?.result as string
      this.cdr.detectChanges()
    }
    reader.readAsDataURL(file)

    this.uploading = true
    this.adminApi.uploadImage(file).subscribe({
      next: res => {
        this.form.imageUrl = res.url
        this.uploading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.uploading = false
        this.error = 'Ошибка загрузки фото'
        this.cdr.detectChanges()
      }
    })
  }

  openAdd() {
    this.editingId = null
    this.form = this.emptyForm()
    this.filteredCategories = []
    this.specFields = []
    this.specValues = {}
    this.imagePreview = null
    this.platformMenuOpen = false
    this.showForm = true
    this.error = ''
  }

  openEdit(p: Product) {
    this.editingId = p.id

    const platformIds = this.platforms
      .filter(pl => (p.platformNames || []).includes(pl.name))
      .map(pl => pl.id)

    this.form.platformIds = platformIds
    this.updateFilteredCategories()

    const category = this.filteredCategories.find(c => c.name === p.categoryName)

    this.form = {
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock ?? 0,
      imageUrl: p.imageUrl || '',
      platformIds,
      categoryId: category?.id || 0,
      specs: p.specs || '',
    }

    try {
      this.specValues = p.specs ? JSON.parse(p.specs) : {}
    } catch {
      this.specValues = {}
    }

    this.updateSpecFields()
    this.imagePreview = p.imageUrl || null
    this.platformMenuOpen = false
    this.showForm = true
    this.error = ''
  }

  closeForm() {
    this.showForm = false
    this.editingId = null
    this.imagePreview = null
    this.specValues = {}
    this.specFields = []
    this.platformMenuOpen = false
    this.error = ''
  }

  save() {
    if (!this.form.name || !this.form.price || this.form.platformIds.length === 0 || !this.form.categoryId) {
      this.error = 'Заполните все обязательные поля'
      return
    }

    const specsObj: Record<string, string> = {}
    for (const f of this.specFields) {
      if (this.specValues[f.key]) {
        specsObj[f.key] = this.specValues[f.key]
      }
    }
    this.form.specs = Object.keys(specsObj).length > 0 ? JSON.stringify(specsObj) : undefined

    this.saving = true
    this.error = ''

    const req$ = this.editingId
      ? this.adminApi.updateProduct(this.editingId, this.form)
      : this.adminApi.createProduct(this.form)

    req$.subscribe({
      next: () => {
        this.saving = false
        this.cdr.detectChanges()
        this.closeForm()
        this.load()
      },
      error: () => {
        this.saving = false
        this.error = 'Ошибка при сохранении'
        this.cdr.detectChanges()
      }
    })
  }

  toggleDropdown(id: number | null) {
    this.openDropdownId = this.openDropdownId === id ? null : id
    this.cdr.detectChanges()
  }

  changeStock(p: Product, value: number) {
    const platformIds = this.platforms
      .filter(pl => (p.platformNames || []).includes(pl.name))
      .map(pl => pl.id)

    const category = this.categories.find(c => c.name === p.categoryName)

    const req: AdminProductRequest = {
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: value,
      imageUrl: p.imageUrl || '',
      platformIds,
      categoryId: category?.id || 0,
      specs: p.specs || undefined,
    }
    this.adminApi.updateProduct(p.id, req).subscribe(() => this.load())
  }

  stockLabel(stock: number | null | undefined): string {
    if (stock === -1) return 'Ожидается'
    if ((stock ?? 0) > 0) return 'В наличии'
    return 'Нет в наличии'
  }

  stockValue(stock: number | null | undefined): number {
    if (stock === -1) return -1
    if ((stock ?? 0) > 0) return 1
    return 0
  }

  delete(id: number) {
    if (!confirm('Удалить товар?')) return
    this.adminApi.deleteProduct(id).subscribe(() => this.load())
  }

  private emptyForm(): AdminProductRequest {
    return { name: '', description: '', price: 0, stock: 1, imageUrl: '', platformIds: [], categoryId: 0 }
  }
}
