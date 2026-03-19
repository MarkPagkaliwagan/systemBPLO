-- Enhanced User Management Schema Updates
-- Add contact_no and email_verified columns to users table

-- Add contact_no column (optional phone number)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS contact_no VARCHAR(20);

-- Add email_verified column for tracking email verification status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add password_reset_token column if it doesn't exist (for new user onboarding)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token TEXT;

-- Add password_reset_expires column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_contact_no ON users(contact_no);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- Grandfather existing users: set email_verified = TRUE for existing accounts
-- This ensures existing users can continue logging in without verification
UPDATE users 
SET email_verified = TRUE 
WHERE email_verified IS NULL OR email_verified = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN users.contact_no IS 'Optional contact phone number for user';
COMMENT ON COLUMN users.email_verified IS 'Tracks if user has verified their email address. FALSE for new users, TRUE for existing/grandfathered users';
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset and new user onboarding';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiration timestamp for password reset token';

-- Add constraint to ensure email_verified is not null for new records
ALTER TABLE users 
ADD CONSTRAINT chk_email_verified_not_null 
CHECK (email_verified IS NOT NULL);

-- Set default values for any existing NULL records
UPDATE users 
SET email_verified = TRUE 
WHERE email_verified IS NULL;

UPDATE users 
SET contact_no = NULL 
WHERE contact_no = '';

-- Add purpose column to otp_codes table for OTP type separation
ALTER TABLE otp_codes 
ADD COLUMN IF NOT EXISTS purpose VARCHAR(20) NOT NULL DEFAULT 'login_2fa';

-- Add constraint to ensure only valid purposes
ALTER TABLE otp_codes 
ADD CONSTRAINT chk_otp_purpose 
CHECK (purpose IN ('email_verification', 'login_2fa', 'password_reset'));

-- Add indexes for better performance on purpose queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_purpose ON otp_codes(purpose);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_purpose ON otp_codes(user_id, purpose);

-- Add comment for documentation
COMMENT ON COLUMN otp_codes.purpose IS 'Purpose of OTP: email_verification, login_2fa, or password_reset';

-- Clean up existing OTP codes to start fresh with proper purpose separation
DELETE FROM otp_codes;
