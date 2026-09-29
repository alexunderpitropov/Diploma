# 🎮 Console Shop

---

## 🔷 What Is This, Exactly

**Console Shop** is an online store for game consoles and games (PlayStation, Xbox, Nintendo).  
Motivation: there are no specialized online stores in this niche in Moldova.  
Stack: **Java 17 + Spring Boot 3.5** (backend) + **Angular 21** (frontend) + **PostgreSQL 15** (DB in Docker).

---

## 🔷 Stack — Briefly, What Is Used for What

| Technology | Purpose |
|---|---|
| Spring Boot 3.5 | Quick start for a REST API, built-in Tomcat, convention over configuration |
| Spring Security + JWT | Authentication without storing sessions on the server (stateless) |
| Spring Data JPA + Hibernate | ORM, working with the DB without writing SQL by hand |
| PostgreSQL 15 | Relational DBMS, runs in Docker |
| Angular 21 | SPA, built-in Router, Guards, HttpClient, TypeScript |
| Docker Compose | Start PostgreSQL with one command, reproducible environment |
| Lombok | Removes boilerplate: @Getter, @Setter, @Builder, etc. |

---

## 🔷 Backend Architecture (4 Layers)

```
Controller → Service → Repository → Entity (→ PostgreSQL)
```

- **Controller** (`@RestController`) — accepts HTTP, delegates to the service, no logic
- **Service** (`@Service`) — all business logic: validation, calculations, transactions
- **Repository** (`JpaRepository`) — data access, generates SQL from the method name
- **Entity** (`@Entity`) — a Java class = a table in the DB

**Package:** `com.consoleshop`  
**Entry point:** `ConsoleShopApplication` (`@SpringBootApplication`)

---

## 🔷 Database — 10 Tables

| Table | What it stores |
|---|---|
| `users` | Users (email, username, password hash, role, phone) |
| `platforms` | PlayStation, Xbox, Nintendo |
| `categories` | Product categories, linked to a platform |
| `products` | Products (name, price, stock, image_url, specs) |
| `product_platforms` | Many-to-Many between products and platforms |
| `carts` | Cart — One-to-One with user |
| `cart_items` | Cart items (cart_id, product_id, quantity) |
| `orders` | Orders (status, total_price, delivery_address) |
| `order_items` | Order items + **price_at_purchase** (the price is locked in!) |
| `wishlist_items` | Wishlist (user_id, product_id, added_at) |

**Important:** `price_at_purchase` in order_items is a special field that records the product's price at the moment of purchase. If the price later changes in the catalog, old orders are not affected.

**Roles:** `USER` and `ADMIN` — stored as strings (`@Enumerated(EnumType.STRING)`)

**Order statuses:** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, and `CANCELLED` is possible at any time

---

## 🔷 REST API — Main Groups

All endpoints start with `/api`.

| Group | Access | What it does |
|---|---|---|
| `POST /api/auth/register` | Public | Registration, returns a JWT right away |
| `POST /api/auth/login` | Public | Login, returns a JWT |
| `GET /api/auth/me` | USER/ADMIN | Current user's data |
| `GET /api/products/**` | Public | Catalog, filtering, search |
| `GET /api/platforms` | Public | List of platforms |
| `/api/cart/**` | USER/ADMIN | Cart (get/add/update/remove/clear) |
| `POST /api/orders` | USER/ADMIN | Place an order |
| `GET /api/orders` | USER/ADMIN | Order history |
| `PATCH /api/orders/{id}/cancel` | USER/ADMIN | Cancel an order (PENDING only) |
| `/api/wishlist/**` | USER/ADMIN | Wishlist |
| `/api/admin/**` | ADMIN only | Everything administrative |

**31 endpoints in total.**

---

## 🔷 JWT — How It Works

1. The client sends `POST /api/auth/login` with email+password
2. The server verifies via `AuthenticationManager` → `BCrypt`
3. `JwtTokenProvider.generateToken(email, role)` creates a token (algorithm **HMAC SHA-256**, lifetime **24 hours = 86400000 ms**)
4. The token contains: `subject=email`, `role`, `authorities`
5. The client stores the token in `localStorage`
6. On every request, the Angular interceptor adds `Authorization: Bearer {token}`
7. On the server, `JwtAuthFilter` (extends `OncePerRequestFilter`) intercepts the request, extracts the email, validates the token, and sets the authentication in `SecurityContextHolder`

**Why JWT and not sessions?** The server doesn't store state → easier to scale horizontally.

**CSRF is disabled** — because session cookies are not used, there is nothing for CSRF to protect.

---

## 🔷 Security Config — Who Can Go Where

```
/api/auth/login, /api/auth/register  → permitAll
GET /api/products/**, /api/platforms/**  → permitAll
GET /images/**  → permitAll
/api/admin/**  → hasRole("ADMIN")
everything else  → authenticated
```

Sessions: `STATELESS` — Spring doesn't create sessions at all.  
CORS: requests from `localhost:*` and `127.0.0.1:*` are allowed.

---

## 🔷 Key Backend Classes

### AuthServiceImpl
- On registration: checks uniqueness of email/username/phone → hashes the password with BCrypt → saves the User → **automatically creates a Cart** → generates a JWT
- On login: `AuthenticationManager.authenticate()` → loads the User → generates a JWT

### OrderServiceImpl (the most complex)
- Checks that the cart is not empty
- Checks the stock of each product in the warehouse
- Creates an `OrderItem` with `priceAtPurchase = product.getPrice()`
- Calculates the total via `reduce`
- Decreases `stock` for each product
- Clears the cart
- **Everything in a single transaction** `@Transactional`
- Cancellation — only if `status == PENDING`, returns the stock back

### CartServiceImpl
- `addItem`: checks stock; if the product is already in the cart — increases quantity (`ifPresentOrElse`)
- `removeItem`: after removal calls `flush()` for synchronization
- `clearCart`: `cart.getItems().clear()` → `orphanRemoval=true` deletes everything by itself

### ProductRepository — Custom Queries
- `findAllWithPlatforms` — `LEFT JOIN FETCH` to avoid N+1 queries
- `findByPlatformsId` — products by platform via the join table
- `findByNameContainingIgnoreCase` — case-insensitive search

---

## 🔷 Frontend (Angular 21)

**SPA** — the browser loads the page once, navigation happens via Angular Router.

**Lazy loading** — each component is loaded only on the first navigation to its route (`loadComponent`). Speeds up the initial load.

### Folder Structure
```
src/app/
  core/api/          — API services (product, cart, order, wishlist...)
  core/auth/         — AuthService, authGuard, adminGuard, authInterceptor
  core/              — CartCountService, ThemeService, ToastService
  layout/            — Header, Footer
  pages/             — all pages (catalog, cart, orders, wishlist, admin/...)
  shared/            — Toast component
```

### Guards
- `authGuard` — checks `isLoggedIn()` (whether a token exists in localStorage). If not → redirect to `/auth`
- `adminGuard` — reads `user$` (BehaviorSubject), checks `role === 'ADMIN'`. If not → redirect to `/platforms`

### JWT Interceptor
```typescript
// auth.interceptor.ts — functional interceptor
const token = localStorage.getItem('token')
if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
```
Works automatically for all HTTP requests.

### AuthService
- `user$` — `BehaviorSubject<UserInfo | null>` — reactive user state
- When a token is received — decodes the payload (base64), extracts email and role
- `loadMe()` — loads full data from `/api/auth/me`

### Theming
- `ThemeService` uses Angular **Signals** (`signal<PlatformTheme>`)
- PlayStation → blue (`theme-ps`), Xbox → green (`theme-xbox`), Nintendo → red (`theme-nintendo`)
- When leaving the catalog — `themeService.clear()` in `ngOnDestroy`

### ToastService
- Also built on Signals — a `toasts` array
- Via `setTimeout(3000)` it automatically removes the notification

---

## 🔷 Running the Project (Order Matters!)

```bash
# 1. Database
docker-compose up -d        # starts PostgreSQL 15 on port 5432

# 2. Backend
mvn spring-boot:run         # Spring Boot on localhost:8080
# Hibernate automatically creates the tables (ddl-auto: update)

# 3. Frontend
npm install                 # first time only
ng serve                    # Angular on localhost:4200
```

**Important:** Spring Boot connects to the DB immediately on startup — if PostgreSQL is not running, it will crash with an error.

**application.yaml — key parameters:**
- `ddl-auto: update` — Hibernate creates/updates the tables itself
- `open-in-view: false` — prevents lazy loading during serialization
- `show-sql: true` — prints SQL to the log (for debugging)
- JWT expiration: `86400000` ms = 24 hours

---

## 🔷 Application Functionality

**For everyone (no authentication):**
- Home: platform selection (PlayStation / Xbox / Nintendo)
- Catalog with filtering by platform, category, search, and sorting
- Product detail page

**For USER:**
- Cart (add/update/remove/clear)
- Checkout (delivery address, payment method)
- Order history with color-coded statuses, cancellation of PENDING orders
- Wishlist
- Profile

**For ADMIN:**
- Dashboard with statistics (users, products, orders, pending orders, revenue)
- Product management (CRUD + image upload)
- Order management (status changes)
- User management (view, delete)
