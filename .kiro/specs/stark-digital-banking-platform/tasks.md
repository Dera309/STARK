# Implementation Plan: STARK Digital Banking Platform

## Overview

Full-stack monorepo implementation of the STARK digital banking platform. Stack: React + TypeScript + Tailwind CSS (client), Node.js + Express (server), MongoDB + Mongoose (database), Socket.io (real-time). Tasks are ordered so each step builds on the previous, ending with full integration.

---

## Tasks

- [ ] 1. Project Setup & Infrastructure
  - [x] 1.1 Initialise monorepo with three workspaces: `client/`, `server/`, `shared/`
    - Create root `package.json` with npm/yarn workspaces config
    - Add `.gitignore`, `tsconfig.base.json` with path aliases for `@shared/*`
    - _Requirements: Design §Monorepo Structure_

  - [x] 1.2 Scaffold `server/` — Express + TypeScript
    - Install express, mongoose, jsonwebtoken, bcryptjs, socket.io, pdfkit, nodemailer, fast-check, jest, supertest, mongodb-memory-server
    - Create `server/src/index.ts` with Express app, Socket.io attachment, and MongoDB connection
    - _Requirements: Design §Architecture_

  - [x] 1.3 Scaffold `client/` — Vite + React + TypeScript + Tailwind
    - Bootstrap with `npm create vite` (react-ts template)
    - Install tailwindcss, socket.io-client, axios, react-router-dom, vitest, fast-check
    - Configure `tailwind.config.ts` with Digital Vault design tokens (colors, borderRadius, fontFamily)
    - _Requirements: Design §Design System (Digital Vault)_

  - [x] 1.4 Scaffold `shared/` — TypeScript types package
    - Create `shared/types/index.ts` exporting all interfaces: `User`, `Account`, `Transaction`, `Loan`, `FixedDeposit`, `Settlement`, `Notification`, `Role`, `KycSubmission`, `Session`, `ErrorResponse`
    - _Requirements: Design §Data Models_

  - [x] 1.5 Implement global error-handling middleware
    - Create `server/src/middleware/errorHandler.ts` returning `{ error: { code, message, details } }`
    - Map HTTP status codes per the error conventions table (400, 401, 403, 404, 409, 422, 500)
    - _Requirements: Design §HTTP Error Conventions_

  - [x] 1.6 Set up Jest + mongodb-memory-server test infrastructure
    - Configure `jest.config.ts`, global test setup that starts/stops in-memory MongoDB
    - Add supertest helper wrapping the Express app
    - _Requirements: Design §Test Infrastructure_

- [ ] 2. Authentication & Session Management
  - [x] 2.1 Create `User` and `Session` Mongoose schemas
    - `users`: `email` (unique index), `passwordHash`, `kycStatus`, `kycTier`, `status`, `failedLoginAttempts`, `lockedUntil`, `registeredDevices`
    - `sessions`: `userId` (indexed), `token` (indexed), `deviceFingerprint`, `isImpersonation`, `expiresAt` (TTL index), `invalidatedAt`
    - _Requirements: 1.1, 1.2, 1.3, 1.6 — Design §users, §sessions_

  - [x] 2.2 Implement `POST /api/v1/auth/login`
    - Check `lockedUntil`; compare bcrypt hash; on success reset `failedLoginAttempts`, create Session, sign JWT (24 h, include `jti`)
    - On 5th failure set `lockedUntil = now + 30 min` and send lockout email
    - Detect unrecognised device fingerprint and queue SECURITY_ALERT notification
    - _Requirements: 1.1, 1.2, 15.5_

  - [x] 2.3 Implement `POST /api/v1/auth/logout`
    - Set `Session.invalidatedAt = now` for the session identified by JWT `jti`
    - _Requirements: 1.6_

  - [x] 2.4 Implement password reset flow
    - `POST /api/v1/auth/reset-password/request` — generate signed token (15 min expiry), send email
    - `POST /api/v1/auth/reset-password/confirm` — validate token age, update `passwordHash`, invalidate token
    - _Requirements: 1.4_

  - [x] 2.5 Implement JWT auth middleware (`server/src/middleware/auth.ts`)
    - Verify JWT signature and expiry; look up Session by `jti`; reject with 401 if `invalidatedAt` is set
    - Attach `req.user` on success
    - _Requirements: 1.3, 1.6_

  - [x]* 2.6 Write property test — Property 1: JWT token lifecycle
    - **Property 1: JWT token lifecycle**
    - **Validates: Requirements 1.3, 1.6**

  - [x]* 2.7 Write property test — Property 2: Account lockout after failed logins
    - **Property 2: Account lockout after failed logins**
    - **Validates: Requirements 1.2**

  - [x]* 2.8 Write property test — Property 3: Password reset token expiry
    - **Property 3: Password reset token expiry**
    - **Validates: Requirements 1.4**

  - [x]* 2.9 Write unit tests for auth controllers
    - Test successful login, locked account, invalid credentials, logout invalidation, reset link expiry
    - _Requirements: 1.1–1.6_

- [ ] 3. Checkpoint — Auth layer complete
  - Ensure all auth tests pass. Ask the user if questions arise.

- [ ] 4. Customer Account Management
  - [x] 4.1 Create `Account` Mongoose schema
    - Fields: `userId` (indexed), `accountNumber` (unique), `type`, `currency`, `balance` (minor units), `status`
    - Pre-save hook generates unique 10-digit account number
    - _Requirements: 5.2 — Design §accounts_

  - [x] 4.2 Implement `GET /api/v1/accounts`
    - Return all accounts owned by `req.user._id` with non-null `balance`
    - _Requirements: 2.1, 2.4_

  - [x] 4.3 Implement `POST /api/v1/accounts`
    - Reject with 422 if `kycStatus !== 'VERIFIED'`; require `currency` for DOMICILIARY type
    - Create account; emit `user:{userId}` socket event with updated account list
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.4 Build `AccountCarousel` component (`client/src/components/features/AccountCarousel.tsx`)
    - Horizontally scrollable cards (SAVINGS / CURRENT / DOMICILIARY), masked account number, live balance
    - Subscribe to `user:{userId}` Socket.io room; update balance on `balance:updated` event
    - _Requirements: 2.1, 2.2, 2.3 — Design §AccountCarousel_

  - [x] 4.5 Build `CustomerDashboard` page (`client/src/pages/customer/Dashboard.tsx`)
    - Compose `AccountCarousel`, `QuickActionsGrid`, `SavingsGoalMeter`, `RecentTransactions`, `FABQRScanner`
    - Show empty-state prompt when no accounts exist
    - _Requirements: 2.1–2.7 — Design §CustomerDashboard_

  - [x]* 4.6 Write property test — Property 4: Dashboard returns all customer accounts with balances
    - **Property 4: Dashboard returns all customer accounts with balances**
    - **Validates: Requirements 2.1, 2.4**

  - [x]* 4.7 Write property test — Property 5: Savings goal data integrity
    - **Property 5: Savings goal data integrity**
    - **Validates: Requirements 2.6**

  - [x]* 4.8 Write property test — Property 12: Account number uniqueness
    - **Property 12: Account number uniqueness**
    - **Validates: Requirements 5.2**

  - [x]* 4.9 Write property test — Property 13: KYC gate on account creation
    - **Property 13: KYC gate on account creation**
    - **Validates: Requirements 5.4**

  - [x]* 4.10 Write property test — Property 14: Domiciliary account requires currency
    - **Property 14: Domiciliary account requires currency**
    - **Validates: Requirements 5.5**

  - [x]* 4.11 Write unit tests for account controllers
    - Test account list, creation success, KYC rejection, domiciliary currency validation, duplicate account number
    - _Requirements: 5.1–5.5_

- [ ] 5. Transaction History & Statements
  - [x] 5.1 Create `Transaction` Mongoose schema
    - Fields: `transactionId` (unique, indexed), `accountId` (indexed), `userId` (indexed), `type`, `amount`, `currency`, `status`, `category`, `merchantName`, `isHighValue`, `initiatedBy`, `adminId`, `adminReason`, `createdAt` (indexed)
    - _Requirements: 3.1 — Design §transactions_

  - [x] 5.2 Implement `GET /api/v1/transactions`
    - Query params: `accountId`, `search` (merchant / txn ID / amount), `filter` (category), `startDate`, `endDate`, `page`
    - Sort by `createdAt` DESC; paginate at 20 per page
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 5.3 Implement `GET /api/v1/transactions/:id`
    - Return full transaction detail; 404 if not found or not owned by `req.user`
    - _Requirements: 3.7_

  - [/] 5.4 Build `TransactionHistory` page (`client/src/pages/customer/TransactionHistory.tsx`)
    - Compose `TransactionSearchBar` (300 ms debounce), `FilterChips`, `StatementDownloadCard`, `TransactionList` (date-grouped), `MonthlyLimitMeter`
    - _Requirements: 3.2–3.7 — Design §TransactionHistory_

  - [ ] 5.5 Implement `GET /api/v1/statements` PDF generation
    - Accept `accountId` and `period` (3m / 6m / 1y); query transactions within period
    - Generate PDF with pdfkit: account holder name, masked account number (last 4), period, opening balance, closing balance, itemised list
    - Return zero-activity statement if no transactions exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.6 Write property test — Property 6: Transaction record completeness
    - **Property 6: Transaction record completeness**
    - **Validates: Requirements 3.1, 3.7**

  - [ ]* 5.7 Write property test — Property 7: Transaction list ordering
    - **Property 7: Transaction list ordering**
    - **Validates: Requirements 3.2, 15.6**

  - [ ]* 5.8 Write property test — Property 8: Transaction filter correctness
    - **Property 8: Transaction filter correctness**
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ]* 5.9 Write property test — Property 9: Pagination page size invariant
    - **Property 9: Pagination page size invariant**
    - **Validates: Requirements 3.6, 10.1, 12.1**

  - [ ]* 5.10 Write property test — Property 10: Statement contains all transactions in period
    - **Property 10: Statement contains all transactions in period**
    - **Validates: Requirements 4.2**

  - [ ]* 5.11 Write property test — Property 11: Statement required fields
    - **Property 11: Statement required fields**
    - **Validates: Requirements 4.4**

  - [ ]* 5.12 Write unit tests for transaction and statement controllers
    - Test search/filter combinations, pagination boundary, zero-activity statement, PDF field presence
    - _Requirements: 3.1–3.7, 4.1–4.5_

- [ ] 6. Checkpoint — Transaction history & statements complete
  - Ensure all tests pass. Ask the user if questions arise.

- [ ] 7. Money Movement — Intra-bank Transfers
  - [x] 7.1 Implement transfer service (`server/src/services/transferService.ts`)
    - Two-phase approach: validate source balance and destination account existence before any writes
    - Use MongoDB session with `startTransaction()` to debit source and credit destination atomically
    - On commit failure: abort session, write FAILED transaction record, trigger compensating retry (up to 3x within 30 s)
    - Set `isHighValue = true` when `amount > 10_000` (minor units equivalent)
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8 — Design §Transfer Error Handling_

  - [x] 7.2 Implement `POST /api/v1/transfers`
    - Validate request body; call transfer service; emit `balance:updated` to `user:{senderId}` and `user:{recipientId}` rooms
    - Create TRANSACTION notifications for both sender and recipient
    - Reject with 422 (`INSUFFICIENT_FUNDS`) or 404 (`ACCOUNT_NOT_FOUND`) as appropriate
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 7.3 Build `TransferHub` page (`client/src/pages/customer/TransferHub.tsx`)
    - Compose `TransferTypeToggle`, `RecentRecipientsCarousel`, `AmountEntryForm`, `TransactionSummaryPanel`, `InitializeTransferButton`
    - _Requirements: 6.1–6.8 — Design §TransferHub_

  - [ ]* 7.4 Write property test — Property 15: Transfer atomicity and fund conservation
    - **Property 15: Transfer atomicity and fund conservation**
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 7.5 Write property test — Property 16: Transfer to non-existent account is rejected
    - **Property 16: Transfer to non-existent account is rejected**
    - **Validates: Requirements 6.1, 6.6**

  - [ ]* 7.6 Write property test — Property 17: Transfer notifications created for both parties
    - **Property 17: Transfer notifications created for both parties**
    - **Validates: Requirements 6.4, 15.1**

  - [ ]* 7.7 Write property test — Property 18: Failed transfer debit reversal
    - **Property 18: Failed transfer debit reversal**
    - **Validates: Requirements 6.8**

  - [ ]* 7.8 Write unit tests for transfer controller
    - Test successful transfer, insufficient funds, non-existent destination, atomicity on simulated commit failure
    - _Requirements: 6.1–6.8_

- [ ] 8. Loans & Credit
  - [x] 8.1 Create `Loan` Mongoose schema
    - Fields: `userId` (indexed), `productType`, `principalAmount`, `interestRate`, `tenureMonths`, `monthlyPayment`, `outstandingBalance`, `status`, `disbursedToAccountId`, `nextRepaymentDate`, `approvedByAdminId`
    - _Requirements: 7.1, 7.3 — Design §loans_

  - [x] 8.2 Implement `GET /api/v1/loans/products`
    - Return static product catalogue (Quick Loan, Salary Advance, Device Financing) with interest rate, max amount, tenure
    - _Requirements: 7.1, 7.2_

  - [x] 8.3 Implement `POST /api/v1/loans/apply`
    - Reject if customer already has an ACTIVE loan of the same `productType` (409 `DUPLICATE_ACTIVE_LOAN`)
    - Create loan record with status PENDING; notify admin team via socket event to `admin:approvals` room
    - _Requirements: 7.3, 7.5_

  - [x] 8.4 Implement loan repayment processing
    - Create a `POST /api/v1/loans/:id/repay` endpoint
    - Debit customer account, update `outstandingBalance`, record LOAN_REPAYMENT transaction
    - _Requirements: 7.7_

  - [x] 8.5 Build `LoansCredit` page (`client/src/pages/customer/Loans.tsx`)
    - Compose `CreditLimitHero`, `LoanCalculator`, `SalaryAdvanceCard`, `DeviceFinancingCard`, `BusinessGrowthLoanCard`
    - _Requirements: 7.1–7.7 — Design §LoansCredit_

  - [ ]* 8.6 Write property test — Property 19: Loan product details completeness
    - **Property 19: Loan product details completeness**
    - **Validates: Requirements 7.2**

  - [ ]* 8.7 Write property test — Property 20: Loan application creates PENDING record
    - **Property 20: Loan application creates PENDING record**
    - **Validates: Requirements 7.3**

  - [ ]* 8.8 Write property test — Property 22: Duplicate active loan blocked
    - **Property 22: Duplicate active loan blocked**
    - **Validates: Requirements 7.5**

  - [ ]* 8.9 Write property test — Property 23: Loan repayment reduces outstanding balance
    - **Property 23: Loan repayment reduces outstanding balance**
    - **Validates: Requirements 7.7**

  - [ ]* 8.10 Write unit tests for loan controllers
    - Test product list, application success, duplicate loan rejection, repayment balance update
    - _Requirements: 7.1–7.7_

- [ ] 9. Fixed Deposits & Investments
  - [x] 9.1 Create `FixedDeposit` Mongoose schema
    - Fields: `userId` (indexed), `depositRef` (unique), `principalAmount`, `interestRate`, `tenureMonths`, `maturityDate` (indexed), `projectedMaturityAmount`, `status`, `sourceAccountId`, `destinationAccountId`, `earlyWithdrawalPenaltyRate`, `createdAt`
    - _Requirements: 8.1 — Design §fixed-deposits_

  - [x] 9.2 Implement `POST /api/v1/investments/fixed-deposit`
    - Transfer principal from `sourceAccountId` to investment ledger; calculate `maturityDate` and `projectedMaturityAmount`
    - _Requirements: 8.1, 8.2_

  - [x] 9.3 Implement `GET /api/v1/investments/fixed-deposit`
    - Return user's investments; sort by `createdAt` DESC
    - _Requirements: 8.1, 8.3_

  - [x] 9.4 Implement `POST /api/v1/investments/liquidate`
    - Calculate payout (Principal + Interest - Penalty if early); move funds to `destinationAccountId`; set status to LIQUIDATED
    - _Requirements: 8.4, 8.5_

  - [x] 9.5 Build `Investments` page (`client/src/pages/customer/Investments.tsx`)
    - Compose `AssetAllocationHero`, `InvestmentTenureSelect`, `PrincipalEntryForm`, `MaturityCalculatorPreview`, `InvestmentPortfolioList`
    - _Requirements: 8.1–8.6 — Design §Investments_

  - [x] 9.6 Implement FD maturity cron job (`server/src/services/fdMaturityJob.ts`)
    - Query FDs where `maturityDate <= now` and `status === 'ACTIVE'`
    - Credit `principal + accrued interest` to destination account; set status to MATURED; create FD_MATURITY notification
    - _Requirements: 8.3, 15.4_

  - [ ] 9.6 Build `InvestmentCenter` page (`client/src/pages/customer/Investments.tsx`)
    - Compose `PortfolioValueHero`, `ProjectedWealthChart`, `ActiveDepositsList`, `CreateDepositButton`
    - _Requirements: 8.1–8.6 — Design §InvestmentCenter_

  - [ ]* 9.7 Write property test — Property 24: Fixed deposit creation invariant
    - **Property 24: Fixed deposit creation invariant**
    - **Validates: Requirements 8.2**

  - [ ]* 9.8 Write property test — Property 25: Fixed deposit maturity credit
    - **Property 25: Fixed deposit maturity credit**
    - **Validates: Requirements 8.3**

  - [ ]* 9.9 Write property test — Property 26: Early liquidation net amount
    - **Property 26: Early liquidation net amount**
    - **Validates: Requirements 8.5**

  - [ ]* 9.10 Write unit tests for fixed deposit controllers and cron job
    - Test creation, insufficient funds rejection, maturity credit, early liquidation penalty calculation
    - _Requirements: 8.1–8.6_

- [ ] 10. Checkpoint — Customer surface complete
  - Ensure all customer-facing tests pass. Ask the user if questions arise.

- [x] 11. Admin Dashboard & Analytics
  - [x] 11.1 Implement RBAC middleware (`server/src/middleware/rbac.ts`)
    - Accept a required permission string; look up `req.user.roleId` in `roles` collection; reject with 403 if permission not in role's `permissions` array
    - Log rejected attempts
    - _Requirements: 11.3, 11.4_

  - [x] 11.2 Create `Role` Mongoose schema and seed built-in roles
    - Fields: `name` (unique), `permissions` (string array), `isBuiltIn`
    - Seed Super Admin, Finance, Support roles with their permission sets on server startup
    - _Requirements: 11.1 — Design §roles, §Permission Catalogue_

  - [x] 11.3 Implement `GET /api/v1/admin/analytics`
    - Accept `period` query param (7D, 30D, 1Y, daily, weekly, monthly)
    - Return: total users, revenue today, active orders, user growth %, DAU, MAU, churn rate, conversion funnel, user retention chart data
    - All data points must fall within the specified period
    - _Requirements: 9.1, 9.3, 9.4, 9.5_

  - [ ] 11.4 Implement Socket.io admin activity feed
    - Create `server/src/sockets/adminActivity.ts`; emit events to `admin:activity` room on: new signup, high-value transaction, security event, system error
    - Emit to `admin:approvals` room when a new loan application or high-value transaction enters the queue
    - _Requirements: 9.2, 9.6, 12.3_

  - [x] 11.5 Build `AdminOverview` page (`client/src/pages/admin/Overview.tsx`)
    - Compose `AdminSidebar`, `MetricsBentoGrid`, `UserRetentionChart` (7D/30D/1Y toggle), `SecurityHealthCards`, `ActivityFeed`
    - `ActivityFeed` subscribes to `admin:activity` socket room and appends events without page reload
    - _Requirements: 9.1–9.6 — Design §AdminOverview_

  - [ ]* 11.6 Write property test — Property 27: Activity feed events emitted to admin room
    - **Property 27: Activity feed events emitted to admin room**
    - **Validates: Requirements 9.2, 9.6**

  - [ ]* 11.7 Write property test — Property 28: Analytics period filter correctness
    - **Property 28: Analytics period filter correctness**
    - **Validates: Requirements 9.3, 9.4**

  - [ ]* 11.8 Write unit tests for analytics controller
    - Test each period filter, metric presence, data point range correctness
    - _Requirements: 9.1–9.6_

- [x] 12. Admin User & Account Management
  - [x] 12.1 Implement `GET /api/v1/admin/users`
    - Query params: `search` (name / email / account ID), `status` (Active / Pending KYC / Suspended), `page`
    - Return paginated list (20 per page) with name, email, status, KYC level, date joined
    - Requires `users:read` permission
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 12.2 Implement `GET /api/v1/admin/users/:id`
    - Return full customer profile: personal details, all accounts, transaction history, login activity
    - Requires `users:read` permission
    - _Requirements: 10.4_

  - [ ] 12.3 Implement `PATCH /api/v1/admin/users/:id/suspend`
    - Set user `status = 'SUSPENDED'`; invalidate all active sessions for that user; record suspension with timestamp and reason
    - Requires `users:suspend` permission
    - _Requirements: 10.5_

  - [ ] 12.4 Implement `PATCH /api/v1/admin/users/:id/reinstate`
    - Set user `status = 'ACTIVE'`; restore login capability
    - Requires `users:reinstate` permission
    - _Requirements: 10.6_

  - [ ] 12.5 Implement `POST /api/v1/admin/users/:id/impersonate`
    - Reject if target user is an admin (403 `CANNOT_IMPERSONATE_ADMIN`); log the attempt
    - Create read-only Session with `isImpersonation = true`, `impersonatedByAdminId` set
    - Requires `users:impersonate` permission
    - _Requirements: 10.7, 10.8_

  - [ ] 12.6 Implement admin role management endpoints
    - `GET /api/v1/admin/roles` — list all roles (requires `roles:read`)
    - `POST /api/v1/admin/roles` — create role with name + permissions (requires `roles:create`)
    - `PATCH /api/v1/admin/roles/:id` — update permissions (requires `roles:update`)
    - `DELETE /api/v1/admin/roles/:id` — reject if `isBuiltIn = true` (requires `roles:delete`)
    - _Requirements: 11.2, 11.3, 11.5, 11.6_

  - [x] 12.7 Build `UserManagement` page (`client/src/pages/admin/UserManagement.tsx`)
    - Compose `UserStatsBento`, `UserSearchFilterBar`, `UserTable`, `MassActionBar`
    - _Requirements: 10.1–10.8, 11.1–11.6 — Design §UserManagement_

  - [ ]* 12.8 Write property test — Property 29: Admin user filter correctness
    - **Property 29: Admin user filter correctness**
    - **Validates: Requirements 10.2, 10.3**

  - [ ]* 12.9 Write property test — Property 30: Customer profile completeness
    - **Property 30: Customer profile completeness**
    - **Validates: Requirements 10.4**

  - [ ]* 12.10 Write property test — Property 31: Suspension blocks all sessions and logins
    - **Property 31: Suspension blocks all sessions and logins**
    - **Validates: Requirements 10.5**

  - [ ]* 12.11 Write property test — Property 32: Reinstatement restores login capability
    - **Property 32: Reinstatement restores login capability**
    - **Validates: Requirements 10.6**

  - [ ]* 12.12 Write property test — Property 33: Impersonation session is audited
    - **Property 33: Impersonation session is audited**
    - **Validates: Requirements 10.7**

  - [ ]* 12.13 Write property test — Property 34: RBAC enforcement
    - **Property 34: RBAC enforcement**
    - **Validates: Requirements 11.3, 11.4**

  - [ ]* 12.14 Write property test — Property 35: Super Admin role is undeletable
    - **Property 35: Super Admin role is undeletable**
    - **Validates: Requirements 11.5**

  - [ ]* 12.15 Write property test — Property 36: Role permission update propagates immediately
    - **Property 36: Role permission update propagates immediately**
    - **Validates: Requirements 11.6**

  - [ ]* 12.16 Write unit tests for admin user and role management
    - Test search/filter, suspension/reinstatement, impersonation rejection, role CRUD, built-in role protection
    - _Requirements: 10.1–10.8, 11.1–11.6_

- [ ] 13. Admin Transaction Operations
  - [ ] 13.1 Implement `GET /api/v1/admin/transactions`
    - Query params: `filter` (all / manual_approvals / failed), `page`; return paginated list (20 per page)
    - Requires `transactions:read` permission
    - _Requirements: 12.1, 12.2_

  - [ ] 13.2 Implement high-value transaction approval queue
    - In transfer service: when `isHighValue = true`, set status to PENDING and emit to `admin:approvals` room
    - `POST /api/v1/admin/transactions/:id/approve` — set status SUCCESS; requires `transactions:approve`
    - `POST /api/v1/admin/transactions/:id/flag` — set status FLAGGED, block further processing; requires `transactions:flag`
    - _Requirements: 12.3, 12.4, 12.5_

  - [ ] 13.3 Implement refund, void, and credit endpoints
    - `POST /api/v1/admin/transactions/:id/refund` — credit originating account by transaction amount; create REFUND transaction record; requires `transactions:refund`
    - `POST /api/v1/admin/transactions/:id/void` — cancel pending transaction, release held funds, set status VOIDED; requires `transactions:void`
    - `POST /api/v1/admin/transactions/:id/credit` — create ADMIN_CREDIT transaction with `adminId`, `adminReason`, `amount`, `createdAt`; requires `transactions:credit`
    - _Requirements: 12.6, 12.7, 12.8_

  - [ ] 13.4 Implement transaction suspend and failed-transaction resolution
    - `POST /api/v1/admin/transactions/:id/suspend` — place transaction on hold, prevent settlement
    - Failed transaction detail endpoint: return `failureReason` and retry/resolve options
    - _Requirements: 12.9, 12.10_

  - [ ] 13.5 Implement `GET /api/v1/admin/transactions/export` CSV generation
    - Apply current filter; stream CSV with all matching transactions; complete within 15 s
    - Requires `transactions:export` permission
    - _Requirements: 12.11_

  - [ ] 13.6 Create `Settlement` Mongoose schema and settlement tracking
    - Fields: `transactionId` (indexed), `merchantName`, `amountOwed`, `currency`, `dueDate`, `status`, `settledAt`
    - Create settlement record for each merchant/vendor transaction
    - Cron job: flag settlements overdue by more than 24 h
    - _Requirements: 13.1, 13.2, 13.3 — Design §settlements_

  - [ ] 13.7 Build `AdminOperations` page (`client/src/pages/admin/Operations.tsx`)
    - Compose `FinancialOverviewStats`, `TransactionLogTabs`, `FilterExportBar`, `LedgerTable`
    - _Requirements: 12.1–12.11, 13.1–13.4 — Design §AdminOperations_

  - [ ]* 13.8 Write property test — Property 37: High-value transaction enters approval queue
    - **Property 37: High-value transaction enters approval queue**
    - **Validates: Requirements 12.3**

  - [ ]* 13.9 Write property test — Property 38: Transaction status transitions are valid
    - **Property 38: Transaction status transitions are valid**
    - **Validates: Requirements 12.4, 12.5, 12.7**

  - [ ]* 13.10 Write property test — Property 39: Refund restores originating account balance
    - **Property 39: Refund restores originating account balance**
    - **Validates: Requirements 12.6**

  - [ ]* 13.11 Write property test — Property 40: Admin credit is fully audited
    - **Property 40: Admin credit is fully audited**
    - **Validates: Requirements 12.8**

  - [ ]* 13.12 Write property test — Property 41: CSV export contains all filtered transactions
    - **Property 41: CSV export contains all filtered transactions**
    - **Validates: Requirements 12.11**

  - [ ]* 13.13 Write property test — Property 42: Settlement lifecycle round-trip
    - **Property 42: Settlement lifecycle round-trip**
    - **Validates: Requirements 13.1, 13.2**

  - [ ]* 13.14 Write property test — Property 43: Overdue settlement flagging
    - **Property 43: Overdue settlement flagging**
    - **Validates: Requirements 13.3**

  - [ ]* 13.15 Write unit tests for admin transaction operations
    - Test approval, flag, refund, void, credit, CSV export, settlement creation and overdue flagging
    - _Requirements: 12.1–12.11, 13.1–13.4_

- [ ] 14. Checkpoint — Admin operations complete
  - Ensure all admin transaction and settlement tests pass. Ask the user if questions arise.

- [ ] 15. KYC Workflow
  - [ ] 15.1 Create `KycSubmission` Mongoose schema
    - Fields: `userId` (indexed), `tier`, `documents` (array of `{ type, fileUrl, uploadedAt }`), `status`, `reviewedByAdminId`, `rejectionReason`, `submittedAt`, `reviewedAt`
    - _Requirements: 14.1 — Design §kyc_submissions_

  - [ ] 15.2 Implement KYC submission endpoint
    - `POST /api/v1/kyc` — store submission with status PENDING; surface in admin user management screen
    - _Requirements: 14.1_

  - [ ] 15.3 Implement `PATCH /api/v1/admin/kyc/:submissionId/approve`
    - Set `KycSubmission.status = 'VERIFIED'`; update `User.kycStatus = 'VERIFIED'` and `kycTier`; unlock full transactional capabilities
    - Requires `kyc:approve` permission
    - _Requirements: 14.2_

  - [ ] 15.4 Implement `PATCH /api/v1/admin/kyc/:submissionId/reject`
    - Set `KycSubmission.status = 'REJECTED'`; update `User.kycStatus = 'REJECTED'`; create KYC_UPDATE notification with rejection reason
    - Requires `kyc:reject` permission
    - _Requirements: 14.3_

  - [ ] 15.5 Enforce KYC tier transfer limits in transfer service
    - Tier 0 / PENDING: daily limit $500; Tier 1 / 2 / 3: progressively higher limits
    - Reject transfer with 422 (`KYC_LIMIT_EXCEEDED`) when daily total would exceed tier limit
    - _Requirements: 14.4, 14.5_

  - [ ]* 15.6 Write property test — Property 44: KYC review outcome
    - **Property 44: KYC review outcome**
    - **Validates: Requirements 14.2, 14.3**

  - [ ]* 15.7 Write property test — Property 45: KYC tier enforces transfer limits
    - **Property 45: KYC tier enforces transfer limits**
    - **Validates: Requirements 14.4, 14.5**

  - [ ]* 15.8 Write unit tests for KYC workflow
    - Test submission creation, approval flow, rejection with notification, tier limit enforcement
    - _Requirements: 14.1–14.5_

  - [ ] 15.9 Implement admin loan approval endpoint
    - `POST /api/v1/admin/loans/:id/approve` — set loan status APPROVED/ACTIVE; disburse principal to `disbursedToAccountId` within 60 s; create LOAN_DISBURSEMENT transaction; requires `loans:approve`
    - `POST /api/v1/admin/loans/:id/reject` — set status REJECTED; requires `loans:reject`
    - _Requirements: 7.4_

  - [ ]* 15.10 Write property test — Property 21: Loan disbursement increases account balance
    - **Property 21: Loan disbursement increases account balance**
    - **Validates: Requirements 7.4**

  - [ ]* 15.11 Write unit tests for loan approval and disbursement
    - Test approval disbursement timing, balance increase, rejection flow
    - _Requirements: 7.4_

- [ ] 16. Notifications
  - [ ] 16.1 Create `Notification` Mongoose schema
    - Fields: `userId` (indexed), `type`, `title`, `body`, `read`, `channel`, `createdAt` (indexed)
    - _Requirements: 15.1 — Design §notifications_

  - [ ] 16.2 Implement notification service (`server/src/services/notificationService.ts`)
    - `createNotification(userId, type, title, body, channel)` — insert record; if `channel` includes EMAIL, send via nodemailer
    - Emit `notification:new` event to `user:{userId}` socket room
    - _Requirements: 15.1, 15.5_

  - [ ] 16.3 Wire low-balance notification into transfer and debit flows
    - After any debit, check if resulting balance < 100 (minor units equivalent); if so, call `createNotification` with type LOW_BALANCE
    - _Requirements: 15.2_

  - [ ] 16.4 Wire loan repayment reminder cron job
    - Query loans where `nextRepaymentDate` is within 3 days and status ACTIVE; create LOAN_REMINDER notification
    - _Requirements: 15.3, 7.6_

  - [ ] 16.5 Implement `GET /api/v1/notifications`
    - Return all notifications for `req.user._id` sorted by `createdAt` DESC
    - _Requirements: 15.6_

  - [ ]* 16.6 Write property test — Property 46: Low balance notification
    - **Property 46: Low balance notification**
    - **Validates: Requirements 15.2**

  - [ ]* 16.7 Write property test — Property 47: Fixed deposit maturity notification
    - **Property 47: Fixed deposit maturity notification**
    - **Validates: Requirements 15.4**

  - [ ]* 16.8 Write property test — Property 48: Unrecognised device triggers security alert
    - **Property 48: Unrecognised device triggers security alert**
    - **Validates: Requirements 15.5**

  - [ ]* 16.9 Write unit tests for notification service
    - Test transaction notification, low-balance trigger, loan reminder, FD maturity, security alert email dispatch
    - _Requirements: 15.1–15.6_

- [ ] 17. Checkpoint — Notifications and KYC complete
  - Ensure all notification and KYC tests pass. Ask the user if questions arise.

- [ ] 18. Integration & E2E Testing
  - [ ] 18.1 Write supertest integration tests for the full auth flow
    - Register → login → access protected route → logout → verify token rejected
    - _Requirements: 1.1–1.6_

  - [ ] 18.2 Write supertest integration tests for the transfer flow end-to-end
    - Create two accounts → initiate transfer → verify both balances updated → verify two notifications created
    - _Requirements: 6.1–6.8_

  - [ ] 18.3 Write supertest integration tests for the loan lifecycle
    - Apply → admin approve → verify disbursement → repay → verify outstanding balance
    - _Requirements: 7.1–7.7_

  - [ ] 18.4 Write supertest integration tests for the fixed deposit lifecycle
    - Create FD → verify source account debited → simulate maturity via fake timers → verify destination account credited
    - _Requirements: 8.1–8.6_

  - [ ] 18.5 Write Socket.io integration tests for real-time events
    - Use `socket.io-client` to verify `balance:updated` emitted after transfer, `notification:new` emitted after transaction, `admin:activity` emitted on high-value transaction
    - _Requirements: 2.3, 6.4, 9.2, 9.6_

  - [ ] 18.6 Write supertest integration tests for admin operations
    - Suspend user → verify sessions invalidated → reinstate → verify login succeeds
    - Approve high-value transaction → verify status SUCCESS
    - Refund transaction → verify originating account balance restored
    - _Requirements: 10.5, 10.6, 12.3, 12.4, 12.6_

  - [ ] 18.7 Wire all routes into `server/src/index.ts` and verify no orphaned endpoints
    - Mount all route files under `/api/v1/`; confirm auth and RBAC middleware applied to all protected routes
    - _Requirements: Design §API Interface_

  - [ ] 18.8 Wire all client pages into React Router and verify navigation
    - Customer routes: `/dashboard`, `/transactions`, `/transfer`, `/loans`, `/investments`
    - Admin routes: `/admin/overview`, `/admin/operations`, `/admin/users`
    - Add route guards: redirect unauthenticated users to `/login`; redirect non-admin users away from `/admin/*`
    - _Requirements: Design §Customer Surface Components, §Admin Surface Components_

- [ ] 19. Final Checkpoint — All tests pass
  - Ensure all unit, property, and integration tests pass. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with `numRuns: 100` and the tag format: `// Feature: stark-digital-banking-platform, Property N: <text>`
- Unit tests use Jest (server) and Vitest (client) with mongodb-memory-server for isolation
- Checkpoints ensure incremental validation before moving to the next phase
