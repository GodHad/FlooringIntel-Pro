# Subscription Flow

This document describes the current plan-based subscription flow across frontend and backend.

## Roles

Admin and Partner accounts bypass subscription pricing and limits.

User accounts use plan-based subscriptions:

- Free Trial
- Starter
- Pro
- Business

## Plan Setup

Backend seeds plans from:

- `backend/data/subscriptionPlans.js`
- `backend/utils/seedSubscriptionPlans.js`

Plans are seeded when MongoDB connects in:

- `backend/config/db.js`

Admin can edit plan price, website limit, user limit, export limit, features, and active status from:

- `/dashboard/admin-settings`

## New User Registration

When a User registers:

1. Backend creates the user with role `User`.
2. Backend creates a Free Trial user subscription.
3. Backend selects up to 2 enabled websites.
4. Backend creates active subscription site records for those websites.
5. Trial status is `trialing`.
6. Trial duration is 14 days.
7. Export limit is 50 products per export.

Admin and Partner do not receive trial subscriptions because they have unlimited access.

## User Subscription Page

Frontend route:

- `/dashboard/subscriptions`

Main sections:

- My Subscription
- Plan cards
- Website selection
- Email alert notice

The page calls:

- `GET /api/subscriptions`

Backend returns:

- Current subscription
- Available plans
- Websites
- Active website access
- Pending invoice state
- Export limit / remaining exports

User flow:

1. User chooses a plan.
2. User selects websites.
3. UI validates selected count against plan website limit.
4. Active websites are disabled.
5. Websites in pending invoice flow are disabled.
6. User clicks Checkout.

## Billing Preview

Frontend calls:

- `GET /api/billing/preview?planId=pro&siteIds=site1,site2`

Billing preview returns:

- Selected plan
- Selected websites
- Already active websites
- Pending websites
- Plan price
- Subtotal
- Final total
- Expiration date

Plan pricing is fixed by selected plan.

There is no per-site annual price calculation and no multi-site discount calculation.

Example:

```text
Pro plan
Selected websites: 7
Plan price: $79/month
Total: $79
```

## Checkout

Frontend route:

- `/dashboard/subscriptions/checkout`

Checkout shows:

- Selected plan
- Billing cycle
- Selected websites
- Website usage
- Plan features
- Total due
- Payment type
- Bill To info
- User note

Frontend submits:

- `POST /api/billing/checkout`

Request body:

```json
{
  "plan_id": "pro",
  "selected_website_ids": ["shawfloors", "mohawk"],
  "payment_type": "PayPal",
  "bill_to": {
    "fullName": "Customer Name",
    "company": "Company",
    "email": "customer@example.com",
    "address": "Billing address"
  },
  "user_note": "Optional note"
}
```

Backend validation:

- Plan must exist and be active.
- Selected website count must be within plan website limit.
- Selected websites cannot already be active.
- Selected websites cannot already be in Pending Payment, Paid, or Validating invoice flow.
- Payment method must be configured in admin billing settings.

When checkout succeeds:

1. Backend creates `userSubscriptions` record with status `pending_payment`.
2. Backend creates `subscriptionSites` records with status `pending`.
3. Backend creates invoice with status `Pending Payment`.
4. Backend returns invoice, preview, pending subscription, and pending sites.

## Invoice Payment Flow

User invoice pages:

- `/dashboard/invoices`
- `/dashboard/invoices/$invoiceId`

Admin invoice page:

- `/dashboard/admin/invoices`

Invoice statuses:

- Pending Payment
- Paid
- Validating
- Completed
- Rejected

Flow:

1. Invoice is created as `Pending Payment`.
2. User marks invoice as paid.
3. Invoice becomes `Paid`.
4. Admin reviews invoice.
5. Admin can mark it `Validating`.
6. Admin can mark it `Completed`.
7. Admin can mark it `Rejected`.

## Completed Invoice Activation

When Admin marks invoice `Completed`:

1. Invoice status becomes `Completed`.
2. Related `userSubscriptions` record becomes `active`.
3. Related `subscriptionSites` records become `active`.
4. Subscription `startsAt` is set to current date.
5. Subscription `endsAt` is set based on billing cycle.
6. Monthly plans end one month later.
7. Site `activatedAt` is set to current date.
8. User gets access to selected websites.
9. User plan type is updated to Pro for compatibility.

## Rejected Invoice

When Admin marks invoice `Rejected`:

1. Invoice status becomes `Rejected`.
2. Related pending `userSubscriptions` record becomes `cancelled`.
3. Related pending `subscriptionSites` records become `cancelled`.
4. Selected websites become available for checkout again.

## Access Control

Backend enforces access from plan subscriptions.

Admin and Partner:

- Unlimited products
- Unlimited exports
- All websites
- No invoice requirement

User:

- Product list is filtered to active subscription websites.
- Product exports are limited by selected plan.
- Product update/retry actions require active website access.
- Email alerts require active website access.

Free Trial:

- Up to 2 websites
- 50 products per export
- 14 days

Starter:

- Up to 3 websites
- 3 exports per month

Pro:

- Up to 10 websites
- Unlimited exports

Business:

- Up to 25 websites
- Unlimited exports

## Expiration

When a subscription expires:

1. `userSubscriptions.status` becomes `expired`.
2. Related active `subscriptionSites.status` becomes `expired`.
3. Email alert website IDs are removed from notification preferences.
4. User must upgrade or renew to regain access.

## Email Alerts

Email alerts and subscriptions are separate, but email alerts require active website access.

Rules:

- Active or trialing website access can enable alerts.
- Expired websites cannot enable alerts.
- Expired websites are removed from preferences automatically.
- Admin and Partner bypass these restrictions.

## Admin Subscription Management

Frontend route:

- `/dashboard/admin/subscriptions`

Backend endpoint:

- `GET /api/admin/subscriptions`

Admin can review:

- User
- Plan
- Status
- Websites used
- Invoice ID
- Started date
- End date

Admin settings still include per-user subscription management for manual site assignment, but the main review table is now plan-based.

## Backward Compatibility

Old site-level subscriptions are not deleted.

When a user hits subscription-aware endpoints:

1. Backend checks if the user already has a plan subscription.
2. If not, backend reads old active site subscriptions.
3. Active old Pro sites are mapped to closest plan:
   - 1 to 3 sites: Starter
   - 4 to 10 sites: Pro
   - 11 to 25 sites: Business
   - More than 25 sites: Business
4. Old active Free access maps to Free Trial if still valid.
5. Website access is preserved in new `subscriptionSites`.

## Upgrades And Adding Websites

Free Trial websites can be selected during paid checkout.

This means a user can upgrade trial websites into Starter, Pro, or Business before the trial expires.

If a user already has an active paid subscription:

1. User selects their current plan.
2. User selects additional available websites.
3. If the total active websites stays within the plan limit, backend adds those websites directly.
4. No new invoice is created for unused slots in the existing plan.

Example:

```text
User has Pro, limit 10 websites.
User currently tracks 2 websites.
User selects 3 more websites.
Backend adds those websites to the active Pro subscription.
User now tracks 5 / 10 websites.
No second Pro invoice is created.
```

Existing invoice history is preserved.

## Main Backend Files

- `controllers/dashboardController.js`
- `models/subscriptionPlan.js`
- `models/userSubscription.js`
- `models/subscriptionSite.js`
- `models/invoice.js`
- `data/subscriptionPlans.js`
- `utils/seedSubscriptionPlans.js`
- `utils/notificationService.js`

## Main Frontend Files

- `src/routes/dashboard.subscriptions.tsx`
- `src/routes/dashboard.subscriptions.checkout.tsx`
- `src/routes/dashboard.admin.subscriptions.tsx`
- `src/routes/dashboard.admin-settings.tsx`
- `src/routes/dashboard.invoices.tsx`
- `src/routes/dashboard.admin.invoices.tsx`
- `src/services/api.ts`
