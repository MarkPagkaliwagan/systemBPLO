-- Fix OTP tables and user email verification
-- Run this script in your database

-- 1. Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create login 2FA OTP table  
CREATE TABLE IF NOT EXISTS login_2fa_otp (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for email_verification_codes table
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_email ON email_verification_codes(user_id, email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON email_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code, is_used);

-- 4. Create indexes for login_2fa_otp table
CREATE INDEX IF NOT EXISTS idx_login_2fa_otp_user_email ON login_2fa_otp(user_id, email);
CREATE INDEX IF NOT EXISTS idx_login_2fa_otp_expires_at ON login_2fa_otp(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_2fa_otp_code ON login_2fa_otp(code, is_used);

-- 5. Create triggers for updated_at timestamps
CREATE TRIGGER update_email_verification_codes_updated_at 
    BEFORE UPDATE ON email_verification_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_login_2fa_otp_updated_at 
    BEFORE UPDATE ON login_2fa_otp 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Fix user email verification status
UPDATE users 
SET email_verified = true 
WHERE email = 'guevarairoh6@gmail.com';

-- 7. Show current status
SELECT id, email, email_verified, created_at FROM users WHERE email = 'guevarairoh6@gmail.com';
