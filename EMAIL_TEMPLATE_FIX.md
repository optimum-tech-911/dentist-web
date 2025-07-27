# 📧 Fix Email Template - Show OTP Instead of Magic Link

## 🎯 **Issue**
Your email shows "Magic Link" and "Follow this link to login" instead of the 6-digit OTP code.

## ✅ **Solution: Update Email Template in Supabase Dashboard**

The local template file doesn't automatically sync to your hosted Supabase project. You need to update it manually in the dashboard.

### **Steps to Fix:**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk
   - Login to your account

2. **Navigate to Email Templates**
   - Click **Authentication** in sidebar
   - Click **Email Templates**
   - Find **Magic Link** template

3. **Update the Magic Link Template**
   Replace the content with this OTP-focused template:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification - UFSBD Hérault</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: #2563eb; color: white; text-align: center; padding: 30px 20px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .otp-code { background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 15px 25px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; }
        .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UFSBD Hérault</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Union Française pour la Santé Bucco-Dentaire</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">Code de vérification</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte UFSBD Hérault.</p>
            
            <div class="otp-code">
                <h2>Votre code de vérification :</h2>
                <div class="code">{{ .Token }}</div>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
                <h3>Comment utiliser ce code :</h3>
                <ol>
                    <li>Retournez sur <a href="https://ufsbd34.fr/auth" style="color: #2563eb;">ufsbd34.fr/auth</a></li>
                    <li>Cliquez sur "Mot de passe oublié"</li>
                    <li>Entrez votre adresse email</li>
                    <li>Saisissez ce code à 6 chiffres</li>
                    <li>Vous serez connecté automatiquement</li>
                </ol>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ Important :</strong> Ce code expire dans 1 heure pour des raisons de sécurité.
                </p>
            </div>
            
            <p>Cordialement,<br>L'équipe UFSBD Hérault</p>
        </div>
        
        <div class="footer">
            <p><strong>UFSBD Hérault</strong></p>
            <p>Email: <a href="mailto:ufsbd34@ufsbd.fr">ufsbd34@ufsbd.fr</a></p>
            <p>Site web: <a href="https://ufsbd34.fr">ufsbd34.fr</a></p>
        </div>
    </div>
</body>
</html>
```

4. **Update Subject Line**
   - Set subject to: `Code de vérification - UFSBD Hérault`

5. **Save Changes**
   - Click **Save** to apply the template

## 🧪 **Test After Updating**

After updating the template in the dashboard:
1. Wait 2-3 minutes for changes to take effect
2. Go to `/auth` → "Forgot Password"
3. Enter your email
4. Check your email - should now show the 6-digit OTP code!

## 🎯 **Expected Result**

Your email will now show:
- **Subject**: "Code de vérification - UFSBD Hérault"
- **Content**: Large 6-digit code like `123456`
- **Instructions**: Clear steps to use the code
- **No more magic links** - just the OTP code!

---

**Update the template in the dashboard and you'll get proper OTP emails!** 🎉