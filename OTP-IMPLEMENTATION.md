# OTP Login System Implementation

This document outlines the implementation of a Two-Factor Authentication (2FA) system using One-Time Passwords (OTP) for the BPLO Inspection Management System.

## Overview

The OTP system adds an extra layer of security by requiring users to verify their email address after entering their credentials. The system works as follows:

1. User enters email and password
2. System validates credentials
3. If valid, generates and sends 6-digit OTP to user's email
4. User enters OTP in modal dialog
5. System verifies OTP and completes login process
6. Session lasts 24 hours after successful OTP verification

## Database Setup

### Create OTP Table

Run the SQL script in `database/create-otp-table.sql`:

```sql
-- Execute this script in your PostgreSQL database
\i database/create-otp-table.sql
```

### Table Structure

```sql
CREATE TABLE otp_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### 1. Validate Credentials (`/api/auth`)
- **Method**: POST
- **Purpose**: Validate user credentials and trigger OTP flow
- **Request**: `{ email, password }`
- **Response**: `{ message, user, requiresOTP: true }`

### 2. Send OTP (`/api/auth/send-otp`)
- **Method**: POST
- **Purpose**: Generate and send OTP to user's email
- **Request**: `{ email, password }`
- **Response**: `{ message, email, userId }`

### 3. Verify OTP (`/api/auth/verify-otp`)
- **Method**: POST
- **Purpose**: Verify OTP and complete login
- **Request**: `{ email, otp, userId }`
- **Response**: `{ user, sessionToken, expiresIn }`

## Components

### 1. OtpModal Component (`components/OtpModal.tsx`)
- Displays OTP input interface
- Handles 6-digit code input with auto-focus
- Shows countdown timer for OTP expiry
- Provides resend functionality
- Displays error messages

### 2. OTP Utilities (`lib/otpUtils.ts`)
- `generateOTP()`: Creates 6-digit code with 10-minute expiry
- `generateOTPEmailTemplate()`: Creates HTML email template
- `isValidOTPFormat()`: Validates OTP format

### 3. Updated Login Page (`app/page.tsx`)
- Integrated OTP modal
- Modified login flow for 2FA
- Handles OTP verification and resend

## Security Features

### OTP Security
- **6-digit numeric codes**: Easy to enter but sufficiently secure
- **10-minute expiry**: Prevents code reuse
- **Single-use codes**: Marked as used after verification
- **Automatic cleanup**: Expired codes are automatically invalidated

### Rate Limiting
- Maximum 3 OTP requests per session
- Automatic cleanup of expired codes
- Failed attempt tracking

### Email Security
- Secure SMTP configuration
- Professional email templates
- No sensitive information in emails

## Configuration

### Environment Variables
Ensure these are set in your environment:

```env
# Email configuration (already required)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Session management (already configured)
NODE_ENV=production  # or development
```

### Email Template Customization
Modify `lib/otpUtils.ts` to customize the email template:
- Update branding and colors
- Modify expiration warnings
- Add custom messaging

## Flow Diagram

```
User Login Flow:
1. Enter Credentials → 2. Validate → 3. Send OTP → 4. Show Modal → 5. Verify OTP → 6. Login Success

Error Handling:
- Invalid credentials: Show error message
- Email send failure: Show resend option
- OTP expired: Allow resend
- Invalid OTP: Show error, allow retry
```

## Testing

### Manual Testing
1. Create a test user account
2. Attempt login with valid credentials
3. Check email for OTP code
4. Enter OTP in modal
5. Verify successful login

### Test Cases
- Valid credentials + valid OTP ✅
- Valid credentials + invalid OTP ❌
- Valid credentials + expired OTP ❌
- Invalid credentials ❌
- OTP resend functionality ✅
- Session persistence ✅

## Maintenance

### Database Cleanup
Run the cleanup function periodically to remove expired OTP codes:

```sql
SELECT cleanup_expired_otp_codes();
```

### Monitoring
Monitor these metrics:
- OTP generation success rate
- Email delivery success rate
- OTP verification success rate
- Failed login attempts

## Troubleshooting

### Common Issues

1. **OTP not received**
   - Check email configuration
   - Verify SMTP credentials
   - Check spam folder

2. **OTP verification fails**
   - Verify database connection
   - Check OTP code format
   - Ensure timezone consistency

3. **Session issues**
   - Verify cookie configuration
   - Check session token generation
   - Ensure proper expiry handling

### Debug Logging
Enable debug mode by setting:
```env
DEBUG=otp:*
```

## Future Enhancements

### Potential Improvements
- SMS OTP support
- Authenticator app integration
- Biometric authentication
- Adaptive authentication (risk-based)

### Performance Optimizations
- Redis caching for OTP codes
- Email queue management
- Database connection pooling

## Support

For issues or questions regarding the OTP implementation:
1. Check the troubleshooting section
2. Review the database logs
3. Verify email service status
4. Check application logs
