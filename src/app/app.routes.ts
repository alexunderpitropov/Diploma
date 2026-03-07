import { Routes } from '@angular/router'
import { authGuard } from './core/auth/auth.guard'
import { adminGuard } from './core/auth/admin.guard'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'platforms' },
  {
    path: 'platforms',
    loadComponent: () =>
      import('./pages/platforms/platforms').then(m => m.Platforms),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog').then(m => m.Catalog),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart').then(m => m.Cart),
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders').then(m => m.Orders),
    canActivate: [authGuard],
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./pages/wishlist/wishlist').then(m => m.Wishlist),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./pages/help/help').then(m => m.Help),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth').then(m => m.Auth),
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./pages/admin/products/products').then(m => m.Products),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./pages/admin/orders/orders').then(m => m.Orders),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/users').then(m => m.Users),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(m => m.NotFound),
  },
]
