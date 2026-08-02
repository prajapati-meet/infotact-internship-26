<div align="center">

# 💳 Core Payment Ledger & Wallet System

**A production-grade fintech backend and frontend application built during the Software Engineering Internship at Infotact Solutions.**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#-api-reference)
- [Key Design Decisions](#-key-design-decisions)
- [Testing](#-testing)
- [Internship Context](#-internship-context)

---

## 📖 About the Project

The **Core Payment Ledger & Wallet System** is a full-stack financial platform engineered to handle high-frequency, secure monetary transactions. It is built around the principles of **double-entry bookkeeping**, **ACID-compliant transactions**, and **distributed concurrency control** — the same foundational concepts used in production systems at companies like Stripe, Wise, and Revolut.

The system exposes a RESTful API backend consumed by a modern React dashboard, giving users a full end-to-end experience from account creation to money transfer and transaction history.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                    │
│  LoginPage │ RegisterPage │ OtpVerification │ Dashboard │ ...   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (Axios + JWT)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend (Port 8080)                │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Auth      │  │  Wallet &    │  │  Transfer &          │   │
│  │  Controller│  │  User APIs   │  │  Ledger APIs         │   │
│  └────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │  Spring Security    │  │  Idempotency Service (Redis)    │  │
│  │  (JWT + BCrypt)     │  │  (SETNX Atomic Locking)         │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Transfer Service                                       │   │
│  │  → Pessimistic Locking (SELECT FOR UPDATE)              │   │
│  │  → Double-Entry Ledger (DEBIT + CREDIT pair)            │   │
│  │  → Deadlock-Safe Lock Ordering (UUID comparison)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────┐            ┌─────────────────────┐
│     PostgreSQL      │            │        Redis         │
│  ┌───────────────┐  │            │  ┌───────────────┐  │
│  │    users      │  │            │  │  Idempotency  │  │
│  │    wallets    │  │            │  │  Keys (24h)   │  │
│  │ ledger_entries│  │            │  │  OTP Codes    │  │
│  │ notifications │  │            │  │  (5min TTL)   │  │
│  └───────────────┘  │            │  └───────────────┘  │
└─────────────────────┘            └─────────────────────┘
```

---

## ✨ Features

### 🔐 Security & Authentication
- **JWT-based stateless authentication** — HMAC-SHA256 signed tokens
- **OTP Email Verification** — Two-step registration via Gmail SMTP; accounts activate only after OTP confirmation
- **BCrypt Password Hashing** — Industry-standard password storage
- **Brute-Force Protection** — Automatic account lockout after 5 failed login attempts with a 15-minute time-based cooldown
- **Password Expiry Policy** — 90-day credential validity enforcement

### 💰 Wallet & Ledger
- **Double-Entry Accounting** — Every transfer produces exactly one `DEBIT` and one `CREDIT` ledger entry sharing a `reference_id`, maintaining a complete and immutable audit trail
- **Monetary Precision** — Balances stored as `BigDecimal(19,4)` to eliminate floating-point errors
- **Wallet Provisioning** — Wallets are created atomically with user registration, only after OTP verification

### ⚡ Concurrency & Integrity
- **Pessimistic Locking (`SELECT FOR UPDATE`)** — Prevents race conditions and lost updates during simultaneous wallet operations
- **Deadlock-Safe Lock Ordering** — Wallets are always locked in a deterministic order based on UUID comparison, regardless of the transfer direction
- **`@Transactional(Isolation.REPEATABLE_READ)`** — Strict transaction boundaries on all balance-mutating operations

### 🔁 Idempotency
- **Redis-backed Idempotency Keys** — Protects against double-spending from network retries, double-clicks, or gateway replays
- **Two-Key Strategy** — A short-lived processing lock (30s TTL) combined with a long-lived cached response (24h TTL), mirroring Stripe's approach
- **Atomic SETNX** — Eliminates the check-then-act race condition of a naive `EXISTS` + `SET` pattern

### 🖥️ React Dashboard
- **Interactive UI** — Full dashboard with wallet balance, transaction history, and money transfer form
- **Color-Coded Transactions** — DEBIT entries in red, CREDIT entries in green
- **Protected Routes** — Unauthenticated users are redirected to login
- **Auto Token Refresh** — Axios interceptors automatically attach JWT headers and redirect on 401/403
- **Client-side Idempotency** — Transfer form generates a fresh `crypto.randomUUID()` per submission

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Java 21, Spring Boot 3.2.5 | Core application framework |
| **Security** | Spring Security, JJWT 0.12.5 | Authentication & authorization |
| **ORM** | Spring Data JPA / Hibernate | Database interaction |
| **Primary DB** | PostgreSQL | Persistent relational data store |
| **Cache / Locks** | Redis 7 (via Spring Data Redis) | Idempotency keys, OTP storage |
| **Email** | Spring Mail + Gmail SMTP | OTP delivery |
| **Frontend** | React 19, Vite 8 | UI client |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Routing** | React Router DOM 7 | Client-side navigation |
| **HTTP Client** | Axios 1.x | API communication |
| **Testing** | JUnit 5, Mockito, Testcontainers | Unit & integration testing |
| **Build Tool** | Maven (mvnw wrapper) | Backend dependency management |

---

## 📁 Project Structure

```
infotact-internship-26_1/
│
├── Finance_and_Banking-Core_Payment_Ledger_and_Wallet_System/   # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/payment/ledger/
│   │   │   │   ├── LedgerApplication.java
│   │   │   │   ├── config/          # Security, Redis, Mail, CORS config
│   │   │   │   ├── controller/      # REST API endpoints
│   │   │   │   │   ├── AdminController.java
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   ├── TransferController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── WalletController.java
│   │   │   │   ├── dto/             # Request/Response data objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Wallet.java
│   │   │   │   │   ├── LedgerEntry.java
│   │   │   │   │   └── Notification.java
│   │   │   │   ├── enums/           # AccountStatus, EntryType, Role...
│   │   │   │   ├── exception/       # Custom exceptions & GlobalExceptionHandler
│   │   │   │   ├── repository/      # Spring Data JPA repositories
│   │   │   │   └── service/         # Business logic (interface + impl)
│   │   │   └── resources/
│   │   │       ├── application.yml           # Active config (gitignored)
│   │   │       └── Example_application.yml   # Configuration template
│   │   └── test/                    # JUnit 5 + Mockito + Testcontainers tests
│   └── pom.xml
│
├── Finance_and_Banking-Core_Payment_Ledger_and_Wallet_System_frontend/
│   └── ledger-frontend/             # React + Vite Frontend
│       ├── src/
│       │   ├── api/                 # Axios instance with interceptors
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── TransactionRow.jsx
│       │   ├── context/             # AuthContext (useAuth hook)
│       │   ├── pages/
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── OtpVerificationPage.jsx
│       │   │   ├── DashboardPage.jsx
│       │   │   ├── TransferPage.jsx
│       │   │   ├── TransactionsPage.jsx
│       │   │   ├── AccountPage.jsx
│       │   │   └── AdminDashboardPage.jsx
│       │   ├── utils/
│       │   └── App.jsx
│       └── package.json
│
└── Internship_Project_Report_Ledger.md   # Full technical project report
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed and running on your machine:

- **Java 21+** — [Download](https://openjdk.org/projects/jdk/21/)
- **Maven** — Bundled via `mvnw` wrapper (no separate install needed)
- **PostgreSQL 16+** — [Download](https://www.postgresql.org/download/)
- **Redis 7+** — [Download](https://redis.io/download/) or run via Docker:
  ```bash
  docker run -d --name redis -p 6379:6379 redis:7
  ```
- **Node.js 18+** & **npm** — [Download](https://nodejs.org/)
- A **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) configured for SMTP

---

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/infotact-internship-26.git
cd infotact-internship-26/Finance_and_Banking-Core_Payment_Ledger_and_Wallet_System
```

**2. Create a PostgreSQL database**
```sql
CREATE DATABASE ledger_db;
```

**3. Configure the application**

Copy the example config and fill in your values:
```bash
cp src/main/resources/Example_application.yml src/main/resources/application.yml
```

Edit `application.yml`:
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ledger_db
    username: your_postgres_username
    password: your_postgres_password

  redis:
    host: localhost
    port: 6379

  mail:
    host: smtp.gmail.com
    port: 587
    username: your_gmail@gmail.com
    password: your_gmail_app_password

application:
  security:
    jwt:
      secret-key: your_256_bit_secret_key_here
      expiration: 3600000  # 1 hour in ms
```

**4. Run the backend**
```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

---

### Frontend Setup

**1. Navigate to the frontend directory**
```bash
cd ../Finance_and_Banking-Core_Payment_Ledger_and_Wallet_System_frontend/ledger-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure the backend URL**

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

**4. Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register/initiate` | Start registration — creates `PENDING` user & sends OTP email | ❌ |
| `POST` | `/api/auth/register/verify` | Verify OTP — activates account, provisions wallet, returns JWT | ❌ |
| `POST` | `/api/auth/login` | Authenticate user, returns JWT | ❌ |

### Wallet

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/wallets/me` | Get authenticated user's wallet balance | ✅ |
| `GET` | `/api/wallets/{walletId}` | Get wallet by ID | ✅ |

### Transfers & Ledger

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/transfers/deposit` | Deposit funds to wallet | ✅ |
| `POST` | `/api/transfers/withdraw` | Withdraw funds from wallet | ✅ |
| `POST` | `/api/transfers/send` | Transfer funds between wallets (requires `Idempotency-Key` header) | ✅ |
| `GET` | `/api/wallets/me/transactions` | Get transaction history (ledger entries) | ✅ |

### Users & Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/users/me` | Get authenticated user's profile | ✅ |
| `GET` | `/api/admin/users` | List all users (Admin only) | ✅ ADMIN |
| `GET` | `/api/notifications` | Get user's notifications | ✅ |

> **📌 Note:** All protected endpoints require the `Authorization: Bearer <jwt_token>` header.  
> Transfer endpoints additionally require the `Idempotency-Key: <uuid>` header.

---

## 🧠 Key Design Decisions

### Why Pessimistic Locking over Optimistic?
Payment transfers are high-contention, high-stakes operations. Optimistic locking fails and requires a client retry when a conflict occurs — unacceptable in a payment context as it creates retry storms and poor UX. Pessimistic locking (`SELECT ... FOR UPDATE`) makes a second concurrent request **wait** for the first to complete, guaranteeing sequential, correct processing.

### Why Redis for Idempotency instead of a database table?
Redis provides sub-millisecond key lookups, native TTL-based expiry without manual cleanup jobs, and atomic `SETNX` semantics. A relational database would require an explicit unique constraint or application-level lock to replicate this behaviour, adding latency and table bloat.

### Why a time-based account lock instead of a permanent lock?
A permanent lock stops brute-force just as effectively as a timed one — but generates operational overhead: every typo becomes a support ticket. Time-based expiry (`lockedUntil` timestamp) is computed on read, avoiding a background scheduled unlock job and giving users automatic recovery after 15 minutes.

---

## 🧪 Testing

Run all backend tests:
```bash
./mvnw test
```

**Test Coverage Includes:**
- `TransferServiceTest` — Successful transfer, insufficient balance, self-transfer, zero amount, missing/suspended wallet
- `WalletServiceImplTest` — Wallet creation defaults, retrieval, not-found exceptions
- `IdempotencyServiceImplTest` (Mocked) — First execution, cached duplicate, lock contention, lock release on failure
- `IdempotencyIntegrationTest` (Testcontainers) — Real Redis container, 10-thread concurrency race proving `SETNX` atomicity
- `AuthServiceTest` — Account lockout threshold, automatic unlock after cooldown, credential/account expiry

---

## 🎓 Internship Context

| Field | Detail |
|---|---|
| **Organization** | Infotact Solutions |
| **Program** | Software Engineering Internship — Cohort 26 |
| **Intern** | Meet Prajapati |
| **Project Reference** | P1 — Core Payment Ledger & Wallet System |
| **Duration** | 4 Weeks (July 2026) |
| **Full Report** | [`Internship_Project_Report_Ledger.md`](./Internship_Project_Report_Ledger.md) |

---

<div align="center">

*Built with ❤️ during the Infotact Solutions Internship Program, 2026*

</div>
