import nodemailer from 'nodemailer';
import { io } from '../socket';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { Role } from '../models/Role';

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    // In a real app we'd use process.env.SMTP_URL etc.
    // Setting up a dummy transporter for console logging
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('Email service not configured. Emails will be logged to console only.');
      this.transporter = null;
    }
  }

  /**
   * Send a notification to a specific user
   */
  async notifyUser(
    userId: string,
    type: 'TRANSACTION' | 'LOW_BALANCE' | 'LOAN_REMINDER' | 'FD_MATURITY' | 'SECURITY_ALERT' | 'KYC_UPDATE' | 'SYSTEM',
    title: string,
    body: string,
    channel: 'IN_APP' | 'EMAIL' | 'BOTH' = 'IN_APP'
  ) {
    try {
      // 1. Save to DB (In-App)
      if (channel === 'IN_APP' || channel === 'BOTH') {
        const notification = new Notification({
          userId,
          type,
          title,
          body,
          channel,
        });
        await notification.save();

        // 2. Emit Real-time Socket Event
        if (io) {
          console.log(`Emitting notification to user:${userId}:`, { title, body });
          io.to(`user:${userId}`).emit('notification:new', notification);
        } else {
          console.log('Socket.io not available, skipping real-time notification');
        }
      }

      // 3. Send Email
      if (channel === 'EMAIL' || channel === 'BOTH') {
        const user = await User.findById(userId);
        if (user && user.email) {
          await this.sendEmail(user.email, title, body);
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Notify all users with administrative roles
   */
  async notifyAdmins(type: any, title: string, body: string) {
    try {
      const adminRole = await Role.findOne({ name: 'ADMIN' });
      if (!adminRole) return;

      const admins = await User.find({ roleId: adminRole._id });
      
      await Promise.all(admins.map(admin => 
        this.notifyUser(admin._id.toString(), type, title, body, 'IN_APP')
      ));
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }

  private async sendEmail(to: string, subject: string, body: string) {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: '"STARK Digital" <noreply@stark-bank.com>',
        to,
        subject,
        text: body,
      });
    } else {
      console.log(`[DRY RUN EMAIL]\nTo: ${to}\nSubject: ${subject}\nBody: ${body}\n`);
    }
  }

  /**
   * Helper for transaction notifications
   */
  async notifyTransaction(userId: string, amount: number, currency: string, type: 'DEBIT' | 'CREDIT', counterpartyInfo?: { name: string, accountNumber: string }) {
    const amountStr = (amount / 100).toLocaleString();
    const title = type === 'DEBIT' ? 'Money Sent' : 'Money Received';
    
    let body: string;
    if (type === 'DEBIT') {
      if (counterpartyInfo) {
        body = `You sent ${amountStr} ${currency} to ${counterpartyInfo.name} (Account: ${counterpartyInfo.accountNumber}).`;
      } else {
        body = `A debit of ${amountStr} ${currency} was made from your account.`;
      }
    } else {
      if (counterpartyInfo) {
        body = `You received ${amountStr} ${currency} from ${counterpartyInfo.name} (Account: ${counterpartyInfo.accountNumber}).`;
      } else {
        body = `Your account was credited with ${amountStr} ${currency}.`;
      }
    }

    await this.notifyUser(userId, 'TRANSACTION', title, body, 'BOTH');
    
    // Notify admins of high-value transactions
    if (amount >= 500000) { // Only notify for high-value transactions
      await this.notifyAdmins('TRANSACTION', `High Value ${type}`, `${body} (User ID: ${userId})`);
    }
  }

  /**
   * Helper for KYC updates
   */
  async notifyKycUpdate(userId: string, status: 'VERIFIED' | 'REJECTED') {
    const title = status === 'VERIFIED' ? 'KYC Verified' : 'KYC Rejected';
    const body = status === 'VERIFIED'
      ? 'Congratulations! Your identity has been verified and your account is now fully active.'
      : 'Unfortunately, your KYC submission was rejected. Please review the requirements and re-submit.';

    await this.notifyUser(userId, 'KYC_UPDATE', title, body, 'BOTH');
    await this.notifyAdmins('KYC_UPDATE', `Admin Action: KYC ${status}`, `User ${userId} KYC was ${status.toLowerCase()}.`);
  }

  /**
   * Helper for loan disbursement
   */
  async notifyLoanDisbursed(userId: string, amount: number, currency: string, product: string) {
    const amountStr = (amount / 100).toLocaleString();
    const title = 'Loan Disbursed';
    const body = `Your ${product} of ${amountStr} ${currency} has been approved and disbursed to your account.`;

    await this.notifyUser(userId, 'TRANSACTION', title, body, 'BOTH');
    await this.notifyAdmins('SYSTEM', 'Global Loan Alert', `Loan of ${amountStr} ${currency} disbursed to ${userId}.`);
  }

  /**
   * Helper for loan repayment
   */
  async notifyLoanRepayment(userId: string, amount: number, currency: string, outstanding: number) {
    const amountStr = (amount / 100).toLocaleString();
    const outstandingStr = (outstanding / 100).toLocaleString();
    const title = 'Loan Repayment Successful';
    const body = `Your repayment of ${amountStr} ${currency} was successful. Current outstanding balance: ${outstandingStr} ${currency}.`;

    await this.notifyUser(userId, 'TRANSACTION', title, body, 'BOTH');
  }

  async sendLockoutEmail(user: any) {
    const title = 'Account Temporarily Locked';
    const body = `Your account has been locked for 30 minutes due to multiple failed login attempts. If this wasn't you, please contact support.`;
    await this.notifyUser(user._id.toString(), 'SECURITY_ALERT', title, body, 'BOTH');
  }

  async sendSecurityAlert(user: any, deviceFingerprint: string) {
    const title = 'New Device Login';
    const body = `We detected a login to your account from a new device (${deviceFingerprint}). If this wasn't you, please secure your account immediately.`;
    await this.notifyUser(user._id.toString(), 'SECURITY_ALERT', title, body, 'BOTH');
  }

  async sendPasswordResetEmail(user: any, token: string) {
    const title = 'Password Reset Request';
    const body = `You requested a password reset. Use the following token to reset your password: ${token}`;
    // For reset, we only send email as user might be logged out
    await this.sendEmail(user.email, title, body);
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;
