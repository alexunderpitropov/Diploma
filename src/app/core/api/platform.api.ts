import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { API_URL } from './api.config'
import { Platform } from './platform.model'

@Injectable({ providedIn: 'root' })
export class PlatformApi {
  private http = inject(HttpClient)

  getAll() {
    return this.http.get<Platform[]>(`${API_URL}/api/platforms`)
  }
}
