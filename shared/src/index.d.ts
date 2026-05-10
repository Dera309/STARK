export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone: string;
    kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    kycTier: 0 | 1 | 2 | 3;
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_KYC';
    roleId: string | null;
    role?: string;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    registeredDevices: string[];
    savingsGoalTarget: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Account {
    _id: string;
    userId: string;
    accountNumber: string;
    type: 'SAVINGS' | 'CURRENT' | 'DOMICILIARY' | 'FIXED_DEPOSIT';
    currency: 'USD' | 'GBP' | 'EUR';
    balance: number;
    status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
    createdAt: Date;
    updatedAt: Date;
}
export interface Transaction {
    _id: string;
    transactionId: string;
    accountId: string;
    userId: string;
    type: 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'REFUND' | 'ADMIN_CREDIT' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'FD_DEBIT' | 'FD_CREDIT';
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'FLAGGED' | 'VOIDED' | 'SUSPENDED';
    category: string;
    merchantName: string;
    counterpartyAccountId: string | null;
    counterpartyAccountNumber: string | null;
    fee: number;
    failureReason: string | null;
    initiatedBy: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
    adminId: string | null;
    adminReason: string | null;
    isHighValue: boolean;
    settlementId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Loan {
    _id: string;
    userId: string;
    productType: 'QUICK_LOAN' | 'SALARY_ADVANCE' | 'DEVICE_FINANCING';
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    monthlyPayment: number;
    outstandingBalance: number;
    status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'REJECTED';
    disbursedToAccountId: string | null;
    nextRepaymentDate: Date | null;
    approvedByAdminId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface FixedDeposit {
    _id: string;
    userId: string;
    depositRef: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    maturityDate: Date;
    projectedMaturityAmount: number;
    currentValue: number;
    sourceAccountId: string;
    destinationAccountId: string;
    status: 'ACTIVE' | 'MATURED' | 'LIQUIDATED';
    earlyWithdrawalPenaltyRate: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Settlement {
    _id: string;
    transactionId: string;
    merchantName: string;
    amountOwed: number;
    currency: string;
    dueDate: Date;
    status: 'PENDING' | 'SETTLED' | 'OVERDUE' | 'FLAGGED';
    settledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface Notification {
    _id: string;
    userId: string;
    type: 'TRANSACTION' | 'LOW_BALANCE' | 'LOAN_REMINDER' | 'FD_MATURITY' | 'SECURITY_ALERT' | 'KYC_UPDATE' | 'SYSTEM';
    title: string;
    body: string;
    read: boolean;
    channel: 'IN_APP' | 'EMAIL' | 'BOTH';
    createdAt: Date;
}
export interface Role {
    _id: string;
    name: string;
    permissions: string[];
    isBuiltIn: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface KycDocument {
    type: string;
    fileUrl: string;
    uploadedAt: Date;
}
export interface KycSubmission {
    _id: string;
    userId: string;
    tier: 1 | 2 | 3;
    documents: KycDocument[];
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    reviewedByAdminId: string | null;
    rejectionReason: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
}
export interface Session {
    _id: string;
    userId: string;
    token: string;
    deviceFingerprint: string;
    ipAddress: string;
    isImpersonation: boolean;
    impersonatedByAdminId: string | null;
    expiresAt: Date;
    invalidatedAt: Date | null;
    createdAt: Date;
}
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export interface LoanProduct {
    productType: 'QUICK_LOAN' | 'SALARY_ADVANCE' | 'DEVICE_FINANCING';
    name: string;
    interestRate: number;
    maxAmount: number;
    tenureMonths: number;
    description: string;
}
//# sourceMappingURL=index.d.ts.map