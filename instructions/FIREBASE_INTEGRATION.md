Update authentication to support:

1. Google login using Firebase
2. In-app email/password registration and login
3. Email confirmation/verification for email/password users

Keep the app backend user system for roles, subscriptions, invoices, tickets, notifications, and permissions.

Frontend requirements:

Add Firebase client config.

Environment variables:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

Enable in Firebase Console:
- Email/Password authentication
- Google authentication

Login page:

Add:
- Email field
- Password field
- Login button
- Continue with Google button
- Forgot password link
- Register link

Register page:

Add:
- Full name
- Email
- Phone number
- Password
- Confirm password
- Register button
- Continue with Google button

Email/password registration flow:

1. User fills name, email, phone, password.
2. Create user with Firebase email/password.
3. Update Firebase display name.
4. Send Firebase email verification email.
5. Save user in backend with:
   - firebase_uid
   - name
   - email
   - phone
   - auth_provider: email
   - email_verified: false
   - role: user
6. Show message:
   Please check your email and verify your account before logging in.
7. Do not allow dashboard access until email is verified.

Email/password login flow:

1. User logs in with Firebase email/password.
2. Check Firebase user.emailVerified.
3. If email is not verified:
   - Show message:
     Please verify your email before continuing.
   - Add button:
     Resend verification email
   - Do not allow dashboard access.
4. If email is verified:
   - Get Firebase ID token.
   - Call backend /api/auth/sync-user or /api/auth/me.
   - Update backend email_verified to true.
   - Redirect to dashboard.

Google login flow:

1. User clicks Continue with Google.
2. Sign in with Firebase Google provider.
3. Get Firebase ID token.
4. Sync user with backend.
5. Since Google emails are already verified, set:
   - auth_provider: google
   - email_verified: true
6. If phone number is missing:
   - Redirect to /complete-profile
   - Ask user to enter phone number
   - Save phone number to backend
7. After phone is saved, redirect to dashboard.

Complete profile page:

Route:
/complete-profile

Fields:
- Phone number required
- Full name optional if missing

User cannot access dashboard until phone exists.

Forgot password:

Use Firebase password reset email.

Flow:
- User enters email.
- Send Firebase password reset email.
- Show success message:
  Password reset email sent. Please check your inbox.

Backend requirements:

Add or update users table/model fields:

- firebase_uid unique
- name
- email unique
- phone
- auth_provider
- email_verified boolean default false
- role default user
- created_at
- updated_at

Auth provider values:
- email
- google

Add Firebase Admin SDK on backend.

Backend middleware:

Verify Firebase ID token from:

Authorization: Bearer <firebase_id_token>

Middleware should:
- Verify token
- Get firebase_uid, email, name, picture, email_verified
- Find backend user by firebase_uid or email
- Attach backend user to request
- Reject invalid token

Backend endpoints:

POST /api/auth/sync-user

Protected by Firebase token.

Purpose:
Create or update backend user after Firebase login/register.

Request body:
- name
- phone
- auth_provider

Behavior:
- If user exists by firebase_uid, update user.
- If user exists by email but firebase_uid is empty, link firebase_uid.
- If user does not exist, create user.
- For email/password users, store email_verified from Firebase token.
- For Google users, store email_verified true.
- Preserve existing roles, subscriptions, invoices, and permissions.
- Do not create duplicate users.

GET /api/auth/me

Protected by Firebase token.

Return:
- backend user
- role
- phone
- email_verified
- subscription status
- permissions

POST /api/auth/complete-profile

Protected by Firebase token.

Request:
- phone
- name optional

Behavior:
- Save phone number to backend user.
- Return updated user.

Route protection:

Public routes:
- /
- /login
- /register
- /forgot-password
- /privacy-policy
- /terms
- /cookie-policy

Protected routes:
- /dashboard/*

Rules:
- If user is not logged in, redirect to /login.
- If email/password user is not email verified, redirect to login or verification notice page.
- If phone number is missing, redirect to /complete-profile.
- If user is verified and profile complete, allow dashboard access.

Email verification page or notice:

Create simple UI state after registration:

Title:
Verify your email

Message:
We sent a verification link to your email. Please verify your email before accessing your dashboard.

Buttons:
- Resend verification email
- I verified, continue

When user clicks I verified, continue:
- Reload Firebase user
- Check emailVerified again
- If verified, sync backend and continue
- If not verified, show message again

Security rules:

- Do not trust frontend role.
- Backend role must come from database.
- Do not expose Firebase Admin credentials to frontend.
- All protected backend APIs must verify Firebase ID token.
- Email/password users cannot access dashboard until email_verified is true.
- Google users can access after phone number is completed.

Final expected result:

The app should support:
- Google login with Firebase
- Email/password registration with Firebase
- Firebase email verification for email/password users
- Resend verification email
- Forgot password email
- Backend user sync
- Phone number collection during registration
- Phone number collection after Google login if missing
- Existing backend roles, subscriptions, invoices, tickets, and permissions preserved