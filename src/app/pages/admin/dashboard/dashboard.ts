import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { catchError, map, of, startWith } from 'rxjs'
import { AdminApi, AdminStats } from '../../../core/api/admin.api'

type Vm =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; stats: AdminStats }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly vm$

  constructor(private api: AdminApi) {
    this.vm$ = this.api.getStats().pipe(
      map((stats) => ({ state: 'ready', stats } as Vm)),
      startWith({ state: 'loading' } as Vm),
      catchError(() => of({ state: 'error' } as Vm))
    )
  }
}
