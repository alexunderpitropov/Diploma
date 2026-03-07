import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, of, tap } from 'rxjs'
import { AuthResponse, UserInfo } from './auth.types'
import { API_URL } from '../api/api.config'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${API_URL}/api/auth`

  private tokenKey = 'token'
  private userKey = 'user'

  user$ = new BehaviorSubject<UserInfo | null>(this.readUser())

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadMe().subscribe()
    }
  }

  register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
    phoneNumber: string
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, data)
      .pipe(tap((r) => this.setToken(r.token)))
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((r) => this.setToken(r.token)))
  }

  loadMe(): Observable<UserInfo | null> {
    if (!this.getToken()) return of(null)

    return this.http.get<UserInfo>(`${this.api}/me`).pipe(
      tap((serverUser) => {
        const current = this.user$.value
        const merged: UserInfo = { ...(current ?? ({} as UserInfo)), ...serverUser }
        this.setUser(merged)
      })
    )
  }

  logout() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    this.user$.next(null)
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  isLoggedIn() {
    return !!this.getToken()
  }

  isAdmin(): boolean {
    const token = this.getToken()
    if (!token) return false

    const fromToken = this.decode(token)?.role
    if (fromToken) return fromToken === 'ADMIN'

    return this.user$.value?.role === 'ADMIN'
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token)

    const base = this.decode(token)
    this.setUser(base)

    this.loadMe().subscribe()
  }

  private setUser(user: UserInfo) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
    this.user$.next(user)
  }

  private readUser(): UserInfo | null {
    const raw = localStorage.getItem(this.userKey)
    return raw ? (JSON.parse(raw) as UserInfo) : null
  }

  private decode(token: string): UserInfo {
    const payload = token.split('.')[1] || ''
    const json = JSON.parse(base64UrlDecode(payload))

    const role = extractRole(json)
    const email = (json.sub ?? json.email ?? '') as string

    return { email, role }
  }
}

function extractRole(json: any): 'USER' | 'ADMIN' {
  const candidates: any[] = []

  if (json?.role != null) candidates.push(json.role)
  if (Array.isArray(json?.roles)) candidates.push(...json.roles)
  if (Array.isArray(json?.authorities)) candidates.push(...json.authorities)

  const normalized = candidates
    .map((x) => String(x ?? '').toUpperCase())
    .map((x) => x.replace('ROLE_', ''))
    .filter((x) => x.length > 0)

  if (normalized.some((x) => x.includes('ADMIN'))) return 'ADMIN'
  return 'USER'
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return atob(padded)
}
