Update authentication to remove Firebase and Google login, and replace it with normal backend email/password authentication using custom email verification and password reset emails.

Do not use mock data. Apply this to the real current frontend and backend.

Main goals:
1. Remove Firebase authentication.
3. Use backend email/password authentication.
4. Send email verification code during registration.
5. User must verify email before accessing dashboard.
6. Use custom email service for verification code and reset password.
7. Keep existing users, roles, subscriptions, invoices, tickets, notifications, and permissions.

---

1. Remove Firebase Auth

Remove or disable:
- Firebase client auth setup
- Google sign-in button
- Firebase token authentication
- Firebase Admin SDK middleware
- Firebase email verification
- Firebase password reset
- Firebase environment variables if no longer used

Remove frontend env usage:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Remove backend env usage:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

---

2. User Model Updates

Update users table/model.

Fields:
- id
- name
- email unique
- phone
- user_type
- password_hash
- email_verified boolean default false
- email_verified_at nullable
- verification_code_hash nullable
- verification_code_expires_at nullable
- reset_password_code_hash nullable
- reset_password_code_expires_at nullable
- role default user
- plan/subscription fields as currently used
- created_at
- updated_at

Remove or stop relying on:
- firebase_uid
- Firebase-specific email_verified source

---

3. Password Security

Use secure password hashing.

Backend:
- Use bcrypt or argon2.
- Never store plain passwords.
- Enforce minimum password length, at least 8 characters.
- Validate password confirmation on frontend and backend.

Login should compare submitted password with password_hash.

---

4. Email Verification Code Flow

Registration flow:

1. User fills:
   - Full name
   - Email
   - Phone number
   - User type
   - Password
   - Confirm password

2. Backend creates user with:
   - email_verified: false
   - password_hash
   - role: user

3. Backend generates 6-digit verification code.

Example:
123456

4. Store hashed verification code in database:
   - verification_code_hash
   - verification_code_expires_at

Expiration:
- 10 minutes recommended

5. Send verification code email using custom email service.

6. Frontend redirects to:
`/verify-email`

7. User enters code.

8. Backend verifies code.

9. If valid:
   - email_verified: true
   - email_verified_at: current date
   - clear verification_code_hash
   - clear verification_code_expires_at
   - create Free Trial subscription if not already created
   - return success

10. User can now log in and access dashboard.

Important:
Do not allow dashboard access until email_verified is true.

---

5. Email Verification APIs

Create backend endpoints:

POST /api/auth/register

Request:
- name
- email
- phone
- user_type
- password
- password_confirmation

Response:
- message: Verification code sent. Please check your email.
- email

Behavior:
- If email already exists and verified, return error.
- If email exists but not verified, update user info/password if needed and resend verification code.
- Send new verification code.

POST /api/auth/verify-email

Request:
- email
- code

Behavior:
- Find user by email.
- Check verification code hash.
- Check expiration.
- If valid, mark email verified.
- Clear verification code fields.
- Create Free Trial subscription if needed.
- Return success.

POST /api/auth/resend-verification-code

Request:
- email

Behavior:
- If user exists and not verified, generate new code.
- Send verification email.
- Return success message.
- Add rate limit.

---

6. Login Flow

Create endpoint:

POST /api/auth/login

Request:
- email
- password

Behavior:
- Find user by email.
- Compare password with password_hash.
- If invalid, return generic error:
  Invalid email or password.
- If email is not verified, return:
  Please verify your email before logging in.
- If valid and verified:
  - Create auth token/session.
  - Return user and token.

Use JWT or secure httpOnly cookie.

Recommended:
Use JWT access token for API auth if current app is token-based.

Token payload:
- user_id
- role
- email

Do not put subscription permissions directly in token unless needed.

Backend should still load user from database on protected routes.

---

7. Auth Middleware

Replace Firebase token middleware with custom auth middleware.

Middleware should:
- Read token from Authorization header or httpOnly cookie.
- Verify token.
- Load user from database.
- Check user exists.
- Attach user to req.user.

Protected APIs:
- /api/products
- /api/websites
- /api/subscriptions
- /api/invoices
- /api/tickets
- /api/notifications
- /api/admin/*

Rules:
- If no token, return 401.
- If invalid token, return 401.
- If user email is not verified, return 403.
- Admin routes still require role admin.

---

8. Forgot Password Flow

Frontend page:
`/forgot-password`

Step 1:
User enters email.

Backend endpoint:
POST /api/auth/forgot-password

Request:
- email

Behavior:
- If user exists, generate 6-digit reset code.
- Store hashed reset code:
  - reset_password_code_hash
  - reset_password_code_expires_at
- Send reset password email.
- Always return generic success:
  If this email exists, a password reset code has been sent.

Do not reveal whether email exists.

Step 2:
User enters:
- email
- reset code
- new password
- confirm password

Backend endpoint:
POST /api/auth/reset-password

Request:
- email
- code
- password
- password_confirmation

Behavior:
- Verify reset code.
- Check expiration.
- Hash new password.
- Save password_hash.
- Clear reset code fields.
- Return success.

---

9. Email Templates

Create backend email templates:

A. Email Verification Code

Subject:
Verify your FlooringIntel email

Body:
Hello {{name}},

Your FlooringIntel verification code is:

{{code}}

This code expires in 10 minutes.

If you did not create this account, you can ignore this email.

B. Password Reset Code

Subject:
Reset your FlooringIntel password

Body:
Hello {{name}},

Your password reset code is:

{{code}}

This code expires in 10 minutes.

If you did not request a password reset, you can ignore this email.

Use existing email provider/service if available.
If not configured, create emailService abstraction:

emailService.sendVerificationCode(user, code)
emailService.sendPasswordResetCode(user, code)

Environment variables:
EMAIL_FROM=
EMAIL_PROVIDER_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

Use whichever email provider the project currently uses.

---

10. Frontend Login Page

Update login page.

Remove:
- Continue with Google button
- Firebase login logic

Keep:
- Email
- Password
- Login button
- Forgot password link
- Register link

On login success:
- Save token/session.
- Load current user.
- Redirect to dashboard.

If backend says email not verified:
- Show message:
  Please verify your email before logging in.
- Show button:
  Resend verification code
- Link to:
  /verify-email

---

11. Frontend Register Page

Update register page.

Remove:
- Continue with Google button
- Firebase registration logic

Fields:
- Full name
- Email
- Phone number
- User type select
- Password
- Confirm password

User type options:
- Flooring Retailer
- Flooring Dealer
- Flooring Store Owner
- Ecommerce Store Owner
- Distributor
- Manufacturer / Brand
- Interior Designer
- Contractor / Installer
- Sales Representative
- Other

On submit:
- Call POST /api/auth/register
- Redirect to /verify-email with email stored in state/query/local storage
- Show toast:
  Verification code sent. Please check your email.

---

12. Verify Email Page

Create route:
`/verify-email`

Fields:
- Email
- Verification code

Buttons:
- Verify Email
- Resend Code

Behavior:
- If email came from registration, prefill it.
- User enters code.
- Call POST /api/auth/verify-email.
- On success:
  Show toast:
  Email verified successfully. You can now log in.
- Redirect to /login or auto-login if backend supports it.

Recommended:
Redirect to login after verification for simpler flow.

---

13. Forgot Password / Reset Password Pages

Forgot password page:
- Email field
- Send reset code button

After sending:
- Show reset form or redirect to:
`/reset-password`

Reset password page:
Fields:
- Email
- Reset code
- New password
- Confirm password

On success:
- Show toast:
  Password reset successfully. Please log in.
- Redirect to /login.

---

14. Auth State Frontend

Update auth provider/context:

Remove Firebase auth listener.

Use backend token/session.

AuthProvider should:
- Check token on app load.
- Call GET /api/auth/me.
- Store current user.
- Store role.
- Store profile_complete.
- Store loading state.
- Logout by clearing token/session and calling backend logout endpoint if implemented.

API client:
- Add Authorization header:
  Authorization: Bearer <token>

If using httpOnly cookies, do not manually attach token. Use credentials include.

---

15. Backend Auth Endpoints Summary

Create or update:

POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-verification-code
POST /api/auth/login
POST /api/auth/logout optional
GET /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password

Optional:
POST /api/auth/change-password

---


18. Route Protection

Public routes:
- /
- /login
- /register
- /verify-email
- /forgot-password
- /reset-password
- /privacy-policy
- /terms
- /cookie-policy
- /about

Protected routes:
- /dashboard/*

Rules:
- If not authenticated, redirect to /login.
- If authenticated but email_verified is false, redirect to /verify-email.
- If profile incomplete, redirect to /complete-profile if still used.
- Admin routes require admin role.

---

19. Final Expected Result

After this update:

- Firebase authentication is removed.
- Google sign-in is removed.
- Users register with email/password.
- Registration sends verification code by custom email service.
- Users must verify email before dashboard access.
- Forgot password uses custom email reset code.
- Login uses backend password validation.
- Protected APIs use custom backend auth middleware.
- Existing users, roles, subscriptions, invoices, tickets, and notifications are preserved.
- No Firebase token validation remains in dashboard APIs.