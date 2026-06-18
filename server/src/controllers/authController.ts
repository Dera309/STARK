import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { Role } from '../models/Role';
import { Account, generateAccountNumber } from '../models/Account';
import { tokenService } from '../services/tokenService';
import { notificationService } from '../services/notificationService';
import { Unauthorized, Forbidden, UnprocessableEntity, Conflict } from '../middleware/errorHandler';
import firebaseAdmin from '../config/firebase';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!firstName || !lastName || !email || !phone || !password) {
      throw UnprocessableEntity('All fields are required');
    }

    if (password.length < 8) {
      throw UnprocessableEntity('Password must be at least 8 characters');
    }

    // Check if email already registered (case insensitive)
    const existing = await User.findOne({ email });
    if (existing) {
      throw Conflict('An account with this email already exists');
    }

    // Assign CUSTOMER role
    const customerRole = await Role.findOne({ name: 'CUSTOMER' });

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash: password, // pre-save hook will hash it
      roleId: customerRole?._id || null,
      kycStatus: 'VERIFIED', // Ensure user is verified so they can transfer
      status: 'ACTIVE', // Set status to ACTIVE for verified users
    });

    // Auto-create initial SAVINGS account
    const accountNumber = generateAccountNumber();
    await Account.create({
      userId: user._id,
      accountNumber,
      type: 'SAVINGS',
      currency: 'USD',
      balance: 0,
      status: 'ACTIVE',
    });

    // Auto-login: generate token
    const jti = uuidv4();
    const token = tokenService.generateToken(user._id.toString(), jti);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let deviceFingerprint = `device-${uuidv4().substring(0, 9)}`;
    const session = new Session({
      userId: user._id,
      token: jti,
      deviceFingerprint,
      ipAddress: req.ip || '0.0.0.0',
      expiresAt,
    });
    await session.save();

    res.status(201).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus: user.kycStatus,
        kycTier: user.kycTier,
        status: user.status,
        role: 'CUSTOMER',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    // Accept a provided fingerprint or generate a fallback so the field is never missing
    const deviceFingerprint: string = req.body.deviceFingerprint || `device-${uuidv4().substring(0, 9)}`;

    if (!email || !password) {
      throw UnprocessableEntity('Email and password are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw Unauthorized('Invalid email or password');
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      throw Unauthorized('Account is not active. Please contact support.');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Forbidden('Your account is temporarily locked. Please try again later.');
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();

        // Notify user via email
        if (notificationService) {
          await notificationService.sendLockoutEmail(user);
        }

        throw Forbidden('Your account has been locked due to multiple failed login attempts. An email has been sent.');
      }

      await user.save();
      throw Unauthorized('Invalid email or password');
    }

    // Successful login: Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    // Check device fingerprint
    let isNewDevice = false;
    if (!user.registeredDevices.includes(deviceFingerprint)) {
      user.registeredDevices.push(deviceFingerprint);
      isNewDevice = true;
    }

    await user.save();

    // Notify if new device
    if (isNewDevice && notificationService) {
      await notificationService.sendSecurityAlert(user, deviceFingerprint);
    }

    // Generate token and session
    const jti = uuidv4();
    const token = tokenService.generateToken(user._id.toString(), jti);

    // Calculate expiry (24h)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = new Session({
      userId: user._id,
      token: jti,
      deviceFingerprint,
      ipAddress: req.ip || '0.0.0.0',
      expiresAt,
    });

    await session.save();

    // Populate role to get its name
    await user.populate('roleId');
    const role = user.roleId as any;

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus: user.kycStatus,
        kycTier: user.kycTier,
        status: user.status,
        role: role?.name || 'CUSTOMER',
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jti } = (req as any).sessionInfo;

    // Set invalidatedAt field to now
    await Session.findOneAndUpdate(
      { token: jti },
      { $set: { invalidatedAt: new Date() } }
    );

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      throw UnprocessableEntity('Email is required');
    }

    const user = await User.findOne({ email });

    // Per security best practices, don't reveal if user exists
    if (user) {
      const resetToken = uuidv4(); // In a real app, maybe use a signed short-lived JWT
      // For this implementation, we'll use a signed token as per spec
      const signedToken = tokenService.generateToken(user._id.toString(), `reset-${resetToken}`);
      
      if (notificationService) {
        await notificationService.sendPasswordResetEmail(user, signedToken);
      }
    }

    res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const confirmPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw UnprocessableEntity('Token and new password are required');
    }

    let payload;
    try {
      payload = tokenService.verifyToken(token);
    } catch (error) {
      throw Unauthorized('Invalid or expired reset token');
    }

    if (!payload.jti.startsWith('reset-')) {
      throw Unauthorized('Invalid reset token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw Unauthorized('User not found');
    }

    // Update password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    await user.save();

    // Invalidate the reset "session" if we were tracking it, 
    // but here we just successfully updated the password.

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const firebaseSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      throw UnprocessableEntity('Firebase UID and email are required');
    }

    console.log('Firebase sync request:', { uid, email, displayName });

    // Check if user exists by Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if user exists by email (for migration from old auth)
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Update existing user with Firebase UID
        user.firebaseUid = uid;
        await user.save();
        console.log('Updated existing user with Firebase UID:', user._id);
      } else {
        // Create new user from Firebase
        const customerRole = await Role.findOne({ name: 'CUSTOMER' });

        const nameParts = displayName ? displayName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = await User.create({
          firebaseUid: uid,
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone: '0000000000', // Default phone for Firebase users
          passwordHash: '', // Empty password for Firebase users
          roleId: customerRole?._id || null,
          kycStatus: 'VERIFIED',
          status: 'ACTIVE',
          kycTier: 0,
        });

        // Auto-create initial SAVINGS account
        const accountNumber = generateAccountNumber();
        await Account.create({
          userId: user._id,
          accountNumber,
          type: 'SAVINGS',
          currency: 'USD',
          balance: 0,
          status: 'ACTIVE',
        });

        console.log('Created new user from Firebase:', user._id);
      }
    }

    // Populate role to get its name
    await user.populate('roleId');
    const role = user.roleId as any;

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus: user.kycStatus,
        kycTier: user.kycTier,
        status: user.status,
        role: role?.name || 'CUSTOMER',
      },
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    next(error);
  }
};
