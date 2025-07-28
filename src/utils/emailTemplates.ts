// Email templates for OTP password reset
export const createOTPEmailTemplate = (otpCode: string, email: string) => {
  // Use the actual website domain instead of localhost
  const websiteUrl = 'https://ufsbd34.fr';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .otp-code {
            background-color: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            letter-spacing: 4px;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">UFSBD34</div>
            <h1>Password Reset Request</h1>
        </div>
        
        <p>Hello,</p>
        
        <p>We received a request to reset your password for your account at <strong>ufsbd34.fr</strong>.</p>
        
        <p>Your One-Time Password (OTP) is:</p>
        
        <div class="otp-code">${otpCode}</div>
        
        <p>Please enter this code on the password reset page to complete your password reset.</p>
        
        <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
                <li>This code will expire in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this reset, please ignore this email</li>
            </ul>
        </div>
        
        <p>If you're having trouble, you can also click the button below to go directly to the reset page:</p>
        
        <div style="text-align: center;">
            <a href="${websiteUrl}/simple-otp-reset" class="button">Reset Password</a>
        </div>
        
        <div class="footer">
            <p>This email was sent to: ${email}</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2025 UFSBD34. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const createPlainTextOTPEmail = (otpCode: string, email: string) => {
  // Use the actual website domain instead of localhost
  const websiteUrl = 'https://ufsbd34.fr';
  
  return `
Password Reset Request - UFSBD34

Hello,

We received a request to reset your password for your account at ufsbd34.fr.

Your One-Time Password (OTP) is: ${otpCode}

Please enter this code on the password reset page to complete your password reset.

IMPORTANT:
- This code will expire in 10 minutes
- Do not share this code with anyone
- If you didn't request this reset, please ignore this email

Reset page: ${websiteUrl}/simple-otp-reset

This email was sent to: ${email}

If you have any questions, please contact our support team.

© 2025 UFSBD34. All rights reserved.
  `;
};