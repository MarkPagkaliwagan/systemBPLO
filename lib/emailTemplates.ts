/**
 * Email templates for BPLO Inspection Management System
 */

export const generateWelcomeEmailTemplate = (userName: string, userEmail: string, temporaryPassword: string, resetUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BPLO Inspection Management System</title>
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
        .password-box {
          background: white;
          border: 2px solid #059669;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .password {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #059669;
          background: #f0fdf4;
          padding: 10px;
          border-radius: 4px;
          letter-spacing: 2px;
        }
        .reset-button {
          display: inline-block;
          background-color: #059669;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Business Permit and Licensing Office</h1>
        <p>Inspection Management System</p>
      </div>
      
      <div class="content">
        <h2>Welcome to the Team!</h2>
        
        <p>Hello ${userName},</p>
        
        <p>Your account has been successfully created in the BPLO Inspection Management System. We're excited to have you join our team!</p>
        
        <div class="password-box">
          <h3>Your Temporary Password</h3>
          <p class="password">${temporaryPassword}</p>
          <p><small>Please keep this password secure and change it immediately.</small></p>
        </div>
        
        <div class="warning">
          <strong>Important Security Notice:</strong> For your security, please reset your password immediately using the button below. Your temporary password should only be used once.
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" class="reset-button">
            Reset Your Password
          </a>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Click the button above to set your permanent password</li>
          <li>Verify your email address when prompted</li>
          <li>Log in with your new credentials</li>
        </ol>
        
        <p>If you have any questions or need assistance, please contact your system administrator.</p>
        
        <p>Welcome aboard!</p>
      </div>
      
      <div class="footer">
        <p>© 2024 Business Permit and Licensing Office</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

export const generateEmailVerificationTemplate = (verificationCode: string, userEmail: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - BPLO</title>
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
        .verification-code {
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
        <h2>Email Verification Required</h2>
        
        <p>Hello,</p>
        
        <p>Please verify your email address to complete your account setup for the BPLO Inspection Management System.</p>
        
        <div class="verification-code">${verificationCode}</div>
        
        <div class="warning">
          <strong>Important:</strong> This verification code will expire in 2 minutes for security reasons. Please use it immediately.
        </div>
        
        <p><strong>How to verify:</strong></p>
        <ol>
          <li>Return to the login page</li>
          <li>Enter your credentials</li>
          <li>Use this verification code when prompted</li>
        </ol>
        
        <p>If you did not request this verification, please ignore this email or contact our support team immediately.</p>
        
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

export const generateVerificationSuccessTemplate = (userName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified - BPLO</title>
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
        .success-box {
          background: #d1fae5;
          border: 2px solid #059669;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
          color: #065f46;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Business Permit and Licensing Office</h1>
        <p>Inspection Management System</p>
      </div>
      
      <div class="content">
        <h2>Email Successfully Verified!</h2>
        
        <p>Hello ${userName},</p>
        
        <div class="success-box">
          <h3>✅ Verification Complete</h3>
          <p>Your email address has been successfully verified.</p>
        </div>
        
        <p>Your account is now fully set up and ready to use. You can now log in to the BPLO Inspection Management System with your credentials.</p>
        
        <p><strong>What's next?</strong></p>
        <ul>
          <li>Log in to your account</li>
          <li>Explore the system features</li>
          <li>Contact your administrator if you need assistance</li>
        </ul>
        
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        
        <p>Welcome to the BPLO Inspection Management System!</p>
      </div>
      
      <div class="footer">
        <p>© 2024 Business Permit and Licensing Office</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};
