# Requirements Document

## Introduction

STARK is a full-stack online banking platform consisting of two surfaces: a customer-facing mobile-first web app and an admin dashboard for internal operations. The customer surface enables account management, money movement, loans, and investments. The admin surface provides oversight, analytics, user management, and transaction operations. The platform uses MongoDB as its database and adopts the existing "Digital Vault" UI design system (deep navy, gold accents, Manrope/Inter typography) implemented across eight pre-built HTML screens.

---

## Glossary

- **Platform**: The STARK online banking system as a whole, encompassing both customer and admin surfaces.
- **Customer**: An authenticated end-user who holds one or more bank accounts on the Platform.
- **Admin**: An authenticated internal operator with elevated permissions to manage users and transactions.
- **Account**: A financial account (Savings, Current, Domiciliary, Fixed Deposit) owned by a Customer.
- **Transaction**: Any financial event recorded on the Platform — transfers, payments, credits, debits, refunds.
- **Transfer**: A money movement operation initiated by a Customer or Admin between accounts.
- **Intra-bank Transfer**: A Transfer between two accounts held within the STARK Platform.
- **Statement**: A downloadable PDF document summarising Account activity over a defined period.
- **KYC**: Know Your Customer — the identity verification process required before a Customer can transact.
- **Loan**: A credit product (Quick Loan, Salary Advance, Device Financing) offered to eligible Customers.
- **Fixed_Deposit**: A time-locked savings product that earns interest over a defined tenure.
- **Investment**: A wealth product (Fixed Deposit or other instrument) managed through the Platform.
- **Dashboard**: The Customer's home screen showing live account balances and recent Transactions.
- **Admin_Dashboard**: The internal operator screen showing platform-wide metrics and activity.
- **Role**: A named permission set assigned to an Admin (e.g., Super Admin, Support, Finance).
- **Session**: An authenticated user session tracked by the Platform.
- **Activity_Feed**: A real-time stream of platform events visible to Admins.
- **Settlement**: The process of reconciling funds owed to merchants or vendors.
- **Approval_Queue**: The set of Transactions flagged for manual Admin review before processing.

---

## Requirements

### Requirement 1: Customer Authentication & Session Management

**User Story:** As a Customer, I want to securely log in and maintain a session, so that I can access my accounts without re-authenticating on every action.

#### Acceptance Criteria

1. WHEN a Customer submits valid credentials, THE Platform SHALL authenticate the Customer and create a Session with a JWT token valid for 24 hours.
2. WHEN a Customer submits invalid credentials 5 consecutive times, THE Platform SHALL lock the account for 30 minutes and notify the Customer via email.
3. WHEN a Session token expires, THE Platform SHALL redirect the Customer to the login screen and invalidate the token.
4. IF a Customer requests a password reset, THEN THE Platform SHALL send a one-time reset link to the registered email address that expires after 15 minutes.
5. THE Platform SHALL enforce HTTPS for all authentication endpoints.
6. WHEN a Customer logs out, THE Platform SHALL invalidate the active Session token immediately.

---

### Requirement 2: Customer Dashboard & Account Overview

**User Story:** As a Customer, I want to see all my account balances in real time on a single dashboard, so that I can understand my financial position at a glance.

#### Acceptance Criteria

1. WHEN a Customer opens the Dashboard, THE Dashboard SHALL display the live balance for each Account owned by the Customer within 2 seconds.
2. THE Dashboard SHALL display Savings, Current, and Domiciliary Accounts in a horizontally scrollable card carousel.
3. WHEN a Customer's Account balance changes due to a Transaction, THE Dashboard SHALL reflect the updated balance within 5 seconds without requiring a full page reload.
4. THE Dashboard SHALL display the three most recent Transactions grouped by date (Today, Yesterday, Earlier).
5. WHEN a Customer taps "View All" on the Dashboard, THE Platform SHALL navigate the Customer to the full Transaction history screen.
6. THE Dashboard SHALL display a Savings Goal progress indicator showing the amount saved against the Customer's defined target.
7. IF a Customer has no Accounts, THEN THE Dashboard SHALL display a prompt to open a new Account.

---

### Requirement 3: Transaction History

**User Story:** As a Customer, I want to search and filter my full transaction history, so that I can find specific payments and understand my spending patterns.

#### Acceptance Criteria

1. THE Platform SHALL store every Transaction associated with a Customer's Account in MongoDB with a unique Transaction ID, timestamp, amount, type, status, and category.
2. WHEN a Customer opens the transaction history screen, THE Platform SHALL display all Transactions for the selected Account in reverse chronological order.
3. WHEN a Customer enters a search term, THE Platform SHALL filter Transactions by merchant name, Transaction ID, or amount and return results within 1 second.
4. WHEN a Customer applies a category filter, THE Platform SHALL display only Transactions matching the selected category.
5. WHEN a Customer applies a date range filter, THE Platform SHALL display only Transactions within the specified date range.
6. THE Platform SHALL paginate Transaction results in sets of 20 records per page.
7. WHEN a Customer selects a Transaction, THE Platform SHALL display the full Transaction detail including merchant, amount, date, time, status, and category.

---

### Requirement 4: Account Statements

**User Story:** As a Customer, I want to download my account statement as a PDF, so that I can share it with third parties or keep records.

#### Acceptance Criteria

1. WHEN a Customer requests a statement, THE Platform SHALL offer period options of last 3 months, last 6 months, and last 1 year.
2. WHEN a Customer selects a period and confirms, THE Platform SHALL generate a PDF Statement containing all Transactions for that Account within the selected period.
3. THE Platform SHALL generate the PDF Statement within 10 seconds of the Customer's request.
4. THE PDF Statement SHALL include the Account holder's name, Account number (masked to last 4 digits), statement period, opening balance, closing balance, and an itemised Transaction list.
5. IF no Transactions exist for the selected period, THEN THE Platform SHALL generate a PDF Statement indicating a zero-activity period rather than returning an error.

---

### Requirement 5: Open New Account

**User Story:** As a Customer, I want to open a new bank account instantly from the app, so that I can diversify my banking products without visiting a branch.

#### Acceptance Criteria

1. WHEN a KYC-verified Customer requests to open a new Account, THE Platform SHALL present account type options including Savings, Current, Domiciliary, and Fixed Deposit.
2. WHEN a Customer selects an account type and confirms, THE Platform SHALL create the Account in MongoDB and assign a unique account number within 5 seconds.
3. WHEN a new Account is created, THE Platform SHALL display the new Account on the Customer's Dashboard immediately.
4. IF a Customer's KYC status is not verified, THEN THE Platform SHALL block Account creation and display a message directing the Customer to complete KYC verification.
5. WHERE a Domiciliary Account is selected, THE Platform SHALL require the Customer to specify the foreign currency (USD, GBP, EUR) before creation.

---

### Requirement 6: Intra-bank Transfers

**User Story:** As a Customer, I want to send money to another STARK account holder instantly, so that I can move funds without fees or delays.

#### Acceptance Criteria

1. WHEN a Customer initiates an intra-bank Transfer, THE Platform SHALL verify that the destination account number exists within the Platform before processing.
2. WHEN a Customer confirms a Transfer, THE Platform SHALL debit the source Account and credit the destination Account atomically within 3 seconds.
3. THE Platform SHALL process intra-bank Transfers with zero transaction fees.
4. WHEN a Transfer is completed, THE Platform SHALL send a push notification and in-app confirmation to both the sender and recipient.
5. IF the source Account has insufficient funds, THEN THE Platform SHALL reject the Transfer and display an insufficient funds message to the Customer.
6. IF the destination account number does not exist, THEN THE Platform SHALL reject the Transfer and display an account-not-found message.
7. WHEN a Transfer is completed, THE Platform SHALL record the Transaction with status SUCCESS in MongoDB.
8. IF a Transfer fails after debiting the source Account, THEN THE Platform SHALL reverse the debit and record the Transaction with status FAILED within 30 seconds.

---

### Requirement 7: Loan Applications

**User Story:** As a Customer, I want to apply for a loan from my phone, so that I can access credit quickly without visiting a branch.

#### Acceptance Criteria

1. THE Platform SHALL offer the following Loan products: Quick Loan, Salary Advance, and Device Financing.
2. WHEN a Customer selects a Loan product, THE Platform SHALL display the applicable interest rate, maximum amount, and repayment tenure before the Customer submits an application.
3. WHEN a Customer submits a Loan application, THE Platform SHALL record the application in MongoDB with status PENDING and notify the Admin team.
4. WHEN an Admin approves a Loan application, THE Platform SHALL disburse the Loan amount to the Customer's designated Account within 60 seconds.
5. IF a Customer has an existing active Loan of the same product type, THEN THE Platform SHALL block a new application for that product and display the outstanding balance.
6. WHEN a Loan repayment is due, THE Platform SHALL send a reminder notification to the Customer 3 days before the due date.
7. WHEN a Loan repayment is processed, THE Platform SHALL record the repayment Transaction and update the outstanding Loan balance in MongoDB.

---

### Requirement 8: Fixed Deposits

**User Story:** As a Customer, I want to create and liquidate fixed deposits from my phone, so that I can grow my savings with minimal friction.

#### Acceptance Criteria

1. WHEN a Customer creates a Fixed_Deposit, THE Platform SHALL require the Customer to specify the principal amount, tenure (in months), and source Account.
2. WHEN a Fixed_Deposit is created, THE Platform SHALL debit the principal from the source Account, record the Fixed_Deposit in MongoDB, and display the projected maturity amount and date.
3. WHEN a Fixed_Deposit reaches its maturity date, THE Platform SHALL automatically credit the principal plus accrued interest to the Customer's designated Account.
4. WHEN a Customer requests early liquidation of a Fixed_Deposit, THE Platform SHALL display the applicable early-withdrawal penalty before the Customer confirms.
5. WHEN a Customer confirms early liquidation, THE Platform SHALL credit the net amount (principal minus penalty) to the Customer's Account and close the Fixed_Deposit record in MongoDB.
6. IF the source Account has insufficient funds to cover the Fixed_Deposit principal, THEN THE Platform SHALL reject the creation request and display an insufficient funds message.

---

### Requirement 9: Admin Dashboard Overview & Analytics

**User Story:** As an Admin, I want to see key platform metrics and a real-time activity feed on a single screen, so that I can monitor platform health and respond to issues quickly.

#### Acceptance Criteria

1. WHEN an Admin opens the Admin_Dashboard, THE Admin_Dashboard SHALL display total registered users, revenue for the current day, count of active orders, and a user growth percentage within 3 seconds.
2. THE Admin_Dashboard SHALL display a real-time Activity_Feed showing new signups, high-value Transactions, security events, and system errors as they occur, with a maximum latency of 10 seconds.
3. WHEN an Admin selects a time range (7 days, 30 days, 1 year), THE Admin_Dashboard SHALL update the user retention chart to reflect the selected period within 2 seconds.
4. THE Admin_Dashboard SHALL display revenue reports filterable by daily, weekly, and monthly periods.
5. THE Admin_Dashboard SHALL display Daily Active Users (DAU), Monthly Active Users (MAU), churn rate, and conversion funnel metrics.
6. WHEN a new platform event occurs (signup, Transaction, error), THE Activity_Feed SHALL append the event to the feed without requiring a page reload.

---

### Requirement 10: Admin User & Account Management

**User Story:** As an Admin, I want to search, view, and manage all customer accounts, so that I can resolve issues and enforce platform policies.

#### Acceptance Criteria

1. WHEN an Admin opens the user management screen, THE Platform SHALL display a paginated list of all Customers with name, email, status, KYC level, and date joined.
2. WHEN an Admin enters a search term, THE Platform SHALL filter Customers by name, email, or account ID and return results within 1 second.
3. WHEN an Admin applies a status filter (Active, Pending KYC, Suspended), THE Platform SHALL display only Customers matching the selected status.
4. WHEN an Admin selects a Customer, THE Platform SHALL display the Customer's full profile including personal details, all Accounts, Transaction history, and login activity.
5. WHEN an Admin suspends a Customer account, THE Platform SHALL immediately block all Sessions for that Customer, prevent new logins, and record the suspension with a timestamp and reason in MongoDB.
6. WHEN an Admin reinstates a suspended Customer account, THE Platform SHALL restore the Customer's ability to log in and transact.
7. WHEN an Admin initiates an impersonation Session for a Customer, THE Platform SHALL create a read-only audited Session that logs all actions taken under the impersonated identity.
8. IF an Admin attempts to impersonate another Admin account, THEN THE Platform SHALL reject the request and log the attempt.

---

### Requirement 11: Admin Role Management

**User Story:** As a Super Admin, I want to create and assign roles with specific permissions, so that I can control what each internal operator can see and do.

#### Acceptance Criteria

1. THE Platform SHALL support the following built-in Roles: Super Admin, Finance, and Support, each with a distinct permission set.
2. WHEN a Super Admin creates a new Role, THE Platform SHALL require a role name and a selection of permissions from the defined permission catalogue.
3. WHEN a Role is assigned to an Admin, THE Platform SHALL enforce the Role's permissions on all subsequent requests made by that Admin.
4. WHEN an Admin attempts an action outside their Role's permissions, THE Platform SHALL reject the request with a 403 response and log the attempt.
5. THE Platform SHALL prevent deletion of the Super Admin Role.
6. WHEN a Role's permissions are updated, THE Platform SHALL apply the updated permissions to all Admins holding that Role within 60 seconds without requiring those Admins to log out.

---

### Requirement 12: Admin Transaction Operations

**User Story:** As an Admin, I want to view, approve, refund, and investigate all platform transactions, so that I can maintain financial integrity and resolve disputes.

#### Acceptance Criteria

1. WHEN an Admin opens the transaction operations screen, THE Platform SHALL display a paginated log of all Transactions with ID, beneficiary, type, amount, and status.
2. WHEN an Admin applies a filter (All Logs, Manual Approvals, Failed Transactions), THE Platform SHALL display only Transactions matching the selected filter within 1 second.
3. WHEN a Transaction exceeds the high-value threshold of $10,000, THE Platform SHALL place the Transaction in the Approval_Queue with status PENDING and notify the Admin team.
4. WHEN an Admin approves a Transaction in the Approval_Queue, THE Platform SHALL process the Transaction and update its status to SUCCESS in MongoDB.
5. WHEN an Admin flags a Transaction in the Approval_Queue, THE Platform SHALL update the Transaction status to FLAGGED and prevent further processing until reviewed.
6. WHEN an Admin initiates a refund on a completed Transaction, THE Platform SHALL reverse the Transaction amount to the originating Account and record a new refund Transaction in MongoDB.
7. WHEN an Admin voids a pending Transaction, THE Platform SHALL cancel the Transaction, release any held funds, and update the status to VOIDED in MongoDB.
8. WHEN an Admin credits a Customer's Account, THE Platform SHALL record the credit as an Admin-initiated Transaction with the Admin's identity, amount, reason, and timestamp in MongoDB.
9. WHEN an Admin suspends a Transaction, THE Platform SHALL place the Transaction on hold, preventing settlement until the Admin explicitly releases or voids it.
10. WHEN an Admin selects a failed Transaction, THE Platform SHALL display the failure reason and provide options to retry or resolve the Transaction.
11. WHEN an Admin exports the transaction ledger, THE Platform SHALL generate a downloadable CSV file containing all Transactions matching the current filter within 15 seconds.

---

### Requirement 13: Settlement Tracking

**User Story:** As an Admin, I want to track settlement status for merchant and vendor payments, so that I can ensure funds are correctly reconciled.

#### Acceptance Criteria

1. THE Platform SHALL record a Settlement record in MongoDB for each Transaction involving a merchant or vendor, including the amount owed, due date, and settlement status.
2. WHEN a Settlement is processed, THE Platform SHALL update the Settlement status to SETTLED and record the settlement timestamp.
3. WHEN a Settlement is overdue by more than 24 hours, THE Platform SHALL flag the Settlement record and surface it in the Admin_Dashboard.
4. WHEN an Admin views the settlement tracking screen, THE Platform SHALL display all pending, settled, and overdue Settlements filterable by date range and merchant.

---

### Requirement 14: KYC Verification Workflow

**User Story:** As an Admin, I want to review and approve customer KYC submissions, so that I can onboard verified customers and maintain regulatory compliance.

#### Acceptance Criteria

1. WHEN a Customer submits KYC documents, THE Platform SHALL store the submission in MongoDB with status PENDING and surface it in the Admin user management screen.
2. WHEN an Admin approves a KYC submission, THE Platform SHALL update the Customer's KYC status to VERIFIED and unlock full transactional capabilities for that Customer.
3. WHEN an Admin rejects a KYC submission, THE Platform SHALL update the Customer's KYC status to REJECTED, notify the Customer with a reason, and allow the Customer to resubmit.
4. THE Platform SHALL support KYC Tier levels (Tier 1, Tier 2, Tier 3) with progressively higher transaction limits applied per tier.
5. WHILE a Customer's KYC status is PENDING, THE Platform SHALL restrict the Customer's daily transfer limit to $500.

---

### Requirement 15: Notifications

**User Story:** As a Customer, I want to receive timely notifications for account activity, so that I can stay informed and detect unauthorised transactions.

#### Acceptance Criteria

1. WHEN a Transaction is recorded on a Customer's Account, THE Platform SHALL send an in-app notification to the Customer within 5 seconds.
2. WHEN a Customer's Account balance falls below $100, THE Platform SHALL send a low-balance in-app notification to the Customer.
3. WHEN a Loan repayment is due within 3 days, THE Platform SHALL send a repayment reminder notification to the Customer.
4. WHEN a Fixed_Deposit matures, THE Platform SHALL send a maturity notification to the Customer on the maturity date.
5. IF a login attempt is made from an unrecognised device, THEN THE Platform SHALL send a security alert notification to the Customer's registered email address within 60 seconds.
6. THE Platform SHALL allow Customers to view all notifications in a notification centre within the app, ordered by most recent first.
