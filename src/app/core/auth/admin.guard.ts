import { CanActivateFn, Router } from '@angular/router'
import { inject } from '@angular/core'
import { map, take } from 'rxjs'
import { AuthService } from './auth.service'

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  auth.loadMe().subscribe({ error: () => {} })

  return auth.user$.pipe(
    take(1),
    map((u) => {
      const ok = !!u && u.role === 'ADMIN'
      if (ok) return true
      router.navigateByUrl('/platforms')
      return false
    })
  )
}
