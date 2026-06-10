# 🎮 Console Shop 

---

## 🔷 Что это вообще такое

**Console Shop** — интернет-магазин игровых консолей и игр (PlayStation, Xbox, Nintendo).  
Мотивация: в Молдове нет специализированных онлайн-магазинов в этой нише.  
Стек: **Java 17 + Spring Boot 3.5** (бэкенд) + **Angular 21** (фронтенд) + **PostgreSQL 15** (БД в Docker).

---

## 🔷 Стек — кратко зачем что

| Технология | Зачем |
|---|---|
| Spring Boot 3.5 | Быстрый старт REST API, встроенный Tomcat, convention over configuration |
| Spring Security + JWT | Аутентификация без хранения сессий на сервере (stateless) |
| Spring Data JPA + Hibernate | ORM, работа с БД без написания SQL вручную |
| PostgreSQL 15 | Реляционная СУБД, запускается в Docker |
| Angular 21 | SPA, встроенный Router, Guards, HttpClient, TypeScript |
| Docker Compose | Запуск PostgreSQL одной командой, воспроизводимое окружение |
| Lombok | Убирает boilerplate: @Getter, @Setter, @Builder и т.д. |

---

## 🔷 Архитектура бэкенда (4 слоя)

```
Controller → Service → Repository → Entity (→ PostgreSQL)
```

- **Controller** (`@RestController`) — принимает HTTP, делегирует сервису, никакой логики
- **Service** (`@Service`) — вся бизнес-логика: проверки, расчёты, транзакции
- **Repository** (`JpaRepository`) — доступ к данным, генерирует SQL по имени метода
- **Entity** (`@Entity`) — Java-класс = таблица в БД

**Пакет:** `com.consoleshop`  
**Точка входа:** `ConsoleShopApplication` (`@SpringBootApplication`)

---

## 🔷 База данных — 10 таблиц

| Таблица | Что хранит |
|---|---|
| `users` | Пользователи (email, username, password hash, role, phone) |
| `platforms` | PlayStation, Xbox, Nintendo |
| `categories` | Категории товаров, связаны с платформой |
| `products` | Товары (name, price, stock, image_url, specs) |
| `product_platforms` | Many-to-Many между products и platforms |
| `carts` | Корзина — One-to-One с user |
| `cart_items` | Позиции корзины (cart_id, product_id, quantity) |
| `orders` | Заказы (status, total_price, delivery_address) |
| `order_items` | Позиции заказа + **price_at_purchase** (цена зафиксирована!) |
| `wishlist_items` | Список желаемого (user_id, product_id, added_at) |

**Важно:** `price_at_purchase` в order_items — это специальное поле, которое фиксирует цену товара на момент покупки. Если потом цена изменится в каталоге — старые заказы не затронуты.

**Роли:** `USER` и `ADMIN` — хранятся как строки (`@Enumerated(EnumType.STRING)`)

**Статусы заказа:** `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, в любой момент можно `CANCELLED`

---

## 🔷 REST API — основные группы

Все эндпоинты начинаются с `/api`.

| Группа | Доступ | Что делает |
|---|---|---|
| `POST /api/auth/register` | Публичный | Регистрация, сразу возвращает JWT |
| `POST /api/auth/login` | Публичный | Вход, возвращает JWT |
| `GET /api/auth/me` | USER/ADMIN | Данные текущего пользователя |
| `GET /api/products/**` | Публичный | Каталог, фильтрация, поиск |
| `GET /api/platforms` | Публичный | Список платформ |
| `/api/cart/**` | USER/ADMIN | Корзина (get/add/update/remove/clear) |
| `POST /api/orders` | USER/ADMIN | Оформить заказ |
| `GET /api/orders` | USER/ADMIN | История заказов |
| `PATCH /api/orders/{id}/cancel` | USER/ADMIN | Отменить заказ (только PENDING) |
| `/api/wishlist/**` | USER/ADMIN | Вишлист |
| `/api/admin/**` | ADMIN only | Всё административное |

**Всего 31 эндпоинт.**

---

## 🔷 JWT — как работает

1. Клиент отправляет `POST /api/auth/login` с email+password
2. Сервер проверяет через `AuthenticationManager` → `BCrypt`
3. `JwtTokenProvider.generateToken(email, role)` создаёт токен (алгоритм **HMAC SHA-256**, срок **24 часа = 86400000 мс**)
4. Токен содержит: `subject=email`, `role`, `authorities`
5. Клиент сохраняет токен в `localStorage`
6. На каждый запрос Angular-интерцептор добавляет `Authorization: Bearer {token}`
7. На сервере `JwtAuthFilter` (extends `OncePerRequestFilter`) перехватывает запрос, извлекает email, валидирует токен, устанавливает аутентификацию в `SecurityContextHolder`

**Почему JWT а не сессии?** Сервер не хранит состояние → легче масштабировать горизонтально.

**CSRF отключён** — потому что сессионные куки не используются, CSRF защищать нечего.

---

## 🔷 Security Config — кто куда может

```
/api/auth/login, /api/auth/register  → permitAll
GET /api/products/**, /api/platforms/**  → permitAll
GET /images/**  → permitAll
/api/admin/**  → hasRole("ADMIN")
всё остальное  → authenticated
```

Сессии: `STATELESS` — Spring не создаёт сессии вообще.  
CORS: разрешены запросы с `localhost:*` и `127.0.0.1:*`.

---

## 🔷 Ключевые классы бэкенда

### AuthServiceImpl
- При регистрации: проверяет уникальность email/username/phone → хэширует пароль BCrypt → сохраняет User → **автоматически создаёт Cart** → генерирует JWT
- При входе: `AuthenticationManager.authenticate()` → загружает User → генерирует JWT

### OrderServiceImpl (самый сложный)
- Проверяет что корзина не пуста
- Проверяет остатки каждого товара на складе
- Создаёт `OrderItem` с `priceAtPurchase = product.getPrice()`
- Считает total через `reduce`
- Уменьшает `stock` у каждого товара
- Очищает корзину
- **Всё в одной транзакции** `@Transactional`
- Отмена — только если `status == PENDING`, возвращает stock обратно

### CartServiceImpl
- `addItem`: проверяет stock, если товар уже в корзине — увеличивает quantity (`ifPresentOrElse`)
- `removeItem`: после удаления вызывает `flush()` для синхронизации
- `clearCart`: `cart.getItems().clear()` → `orphanRemoval=true` удалит всё сам

### ProductRepository — кастомные запросы
- `findAllWithPlatforms` — `LEFT JOIN FETCH` чтобы не было N+1 запросов
- `findByPlatformsId` — товары по платформе через промежуточную таблицу
- `findByNameContainingIgnoreCase` — поиск без учёта регистра

---

## 🔷 Фронтенд (Angular 21)

**SPA** — браузер загружает страницу один раз, навигация через Angular Router.

**Lazy loading** — каждый компонент загружается только при первом переходе на маршрут (`loadComponent`). Ускоряет первый запуск.

### Структура папок
```
src/app/
  core/api/          — API-сервисы (product, cart, order, wishlist...)
  core/auth/         — AuthService, authGuard, adminGuard, authInterceptor
  core/              — CartCountService, ThemeService, ToastService
  layout/            — Header, Footer
  pages/             — все страницы (catalog, cart, orders, wishlist, admin/...)
  shared/            — Toast компонент
```

### Guards
- `authGuard` — проверяет `isLoggedIn()` (есть ли токен в localStorage). Нет → редирект на `/auth`
- `adminGuard` — читает `user$` (BehaviorSubject), проверяет `role === 'ADMIN'`. Нет → редирект на `/platforms`

### JWT Interceptor
```typescript
// auth.interceptor.ts — функциональный interceptor
const token = localStorage.getItem('token')
if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
```
Работает автоматически для всех HTTP-запросов.

### AuthService
- `user$` — `BehaviorSubject<UserInfo | null>` — реактивное состояние пользователя
- При получении токена — декодирует payload (base64), достаёт email и role
- `loadMe()` — подгружает полные данные с `/api/auth/me`

### Темизация
- `ThemeService` использует Angular **Signals** (`signal<PlatformTheme>`)
- PlayStation → синий (`theme-ps`), Xbox → зелёный (`theme-xbox`), Nintendo → красный (`theme-nintendo`)
- При уходе из каталога — `themeService.clear()` в `ngOnDestroy`

### ToastService
- Тоже на Signals — массив `toasts`
- Через `setTimeout(3000)` автоматически удаляет уведомление

---

## 🔷 Запуск (порядок важен!)

```bash
# 1. База данных
docker-compose up -d        # поднимает PostgreSQL 15 на порту 5432

# 2. Бэкенд
mvn spring-boot:run         # Spring Boot на localhost:8080
# Hibernate автоматически создаёт таблицы (ddl-auto: update)

# 3. Фронтенд
npm install                 # первый раз
ng serve                    # Angular на localhost:4200
```

**Важно:** Spring Boot при старте сразу коннектится к БД — если PostgreSQL не запущен, упадёт с ошибкой.

**application.yaml — ключевые параметры:**
- `ddl-auto: update` — Hibernate сам создаёт/обновляет таблицы
- `open-in-view: false` — предотвращает ленивую загрузку при сериализации
- `show-sql: true` — выводит SQL в лог (для отладки)
- JWT expiration: `86400000` мс = 24 часа

---

## 🔷 Что может спросить комиссия

**"Зачем JWT, а не сессии?"**  
→ Stateless — сервер не хранит состояние. Легко масштабировать. Токен самодостаточен.

**"Как защищены пароли?"**  
→ BCrypt хэширование. В БД хранится только хэш, исходный пароль нигде не сохраняется.

**"Что такое N+1 проблема и как ты её решил?"**  
→ При ленивой загрузке для каждого товара шёл бы отдельный запрос за платформами. Решение: `JOIN FETCH` в `@Query` — загружает всё одним запросом.

**"Почему отключён CSRF?"**  
→ CSRF актуален когда браузер автоматически отправляет куки. Здесь аутентификация через JWT в заголовке Authorization — браузер его не отправляет автоматически, поэтому CSRF не нужен.

**"Что такое price_at_purchase?"**  
→ Цена товара фиксируется в момент оформления заказа. Если потом в каталоге цену изменят, это не затронет уже созданные заказы.

**"Как работает корзина?"**  
→ Создаётся автоматически при регистрации пользователя (One-to-One). Хранится в БД. При оформлении заказа — очищается.

**"Зачем Angular а не React?"**  
→ Полноценный фреймворк: встроенный Router, Guards, HttpClient, DI — всё из коробки. React — библиотека, нужно собирать экосистему вручную. Для проекта с ролями и защитой маршрутов Angular логичнее.

**"Что такое SPA и lazy loading?"**  
→ SPA — браузер загружает HTML один раз, навигация без перезагрузки. Lazy loading — код компонента скачивается только при первом переходе на маршрут, не всё сразу.

**"Как работает adminGuard?"**  
→ Читает `user$` (BehaviorSubject), через `pipe(take(1), map(...))` проверяет что `role === 'ADMIN'`. Если нет — редирект на `/platforms`.

**"Почему порт 5432/5433?"**  
→ В docker-compose маппинг `5432:5432`. (В тексте диплома упомянут 5433 как вариант для избежания конфликта с локальным PostgreSQL — но в реальном коде стоит 5432.)

---

## 🔷 Функционал приложения

**Для всех (без авторизации):**
- Главная: выбор платформы (PlayStation / Xbox / Nintendo)
- Каталог с фильтрацией по платформе, категории, поиском и сортировкой
- Детальная страница товара

**Для USER:**
- Корзина (add/update/remove/clear)
- Оформление заказа (адрес доставки, способ оплаты)
- История заказов с цветными статусами, отмена PENDING заказов
- Список желаемого
- Профиль

**Для ADMIN:**
- Дашборд со статистикой (пользователи, товары, заказы, ожидающие заказы, выручка)
- Управление товарами (CRUD + загрузка изображений)
- Управление заказами (изменение статуса)
- Управление пользователями (просмотр, удаление)
