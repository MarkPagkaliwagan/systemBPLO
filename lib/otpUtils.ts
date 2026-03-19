import crypto from 'crypto';

export interface OTPData {
  code: string;
  expiresAt: Date;
}

export const generateOTP = (): OTPData => {
  // Generate 6-digit numeric code
  const code = crypto.randomInt(100000, 999999).toString();
  
  // Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  return { code, expiresAt };
};

export const generateOTPEmailTemplate = (code: string, userEmail: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BPLO - OTP Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #059669;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 0 0 8px 8px;
        }
        .otp-code {
          background: white;
          border: 2px solid #059669;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #059669;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Business Permit and Licensing Office</h1>
        <p>Inspection Management System</p>
      </div>
      
      <div class="content">
        <h2>One-Time Password (OTP) Verification</h2>
        
        <p>Hello,</p>
        
        <p>You have requested to sign in to the BPLO Inspection Management System. Please use the following OTP code to verify your identity:</p>
        
        <div class="otp-code">${code}</div>
        
        <div class="warning">
          <strong>Important:</strong> This OTP code will expire in 10 minutes for security reasons. Please use it immediately.
        </div>
        
        <p>If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
        
        <p>Thank you for using our system!</p>
      </div>
      
      <div class="footer">
        <p>© 2024 Business Permit and Licensing Office</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

export const isValidOTPFormat = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};
