# Current Subscription Plan And Access Logic

This document records the current subscription, pricing, checkout, and access-control behavior used by the frontend and backend.

## Account Roles

The system supports three user roles:

- Admin
- Partner
- User

Admin and Partner accounts have unlimited access. They do not use pricing plans, free trials, download limits, or paid subscriptions.

User accounts use the pricing and subscription system.

## User Plan Types

User accounts can have one of two plan types:

- Free
- Pro

Every newly registered user starts as a Free user.

When a user receives at least one active Pro site subscription, their user plan becomes Pro. If all Pro subscriptions are removed, cancelled, or expired, the user plan can return to Free.

## Free Plan

New users automatically receive Free trial subscriptions for all enabled websites.

Default Free settings:

- Free trial duration: 7 days
- Free download limit: 50 products per export
- Subscription status: active until expiration
- Download behavior: limited by products per download, not lifetime total

Free users can:

- View product lists from active available websites.
- Download products up to the configured per-export limit.
- Use active Free trial website subscriptions during the trial period.
- Enable email alerts for websites while the Free trial subscription is active.

Free users cannot:

- Download more than the configured per-export product limit.
- Update products for a website after that website subscription expires.
- Enable email alerts for expired subscriptions.
- Use unlimited downloads.

When a Free subscription expires:

- The subscription status becomes expired.
- The website is no longer treated as actively subscribed.
- Email alerts for that website are removed from notification preferences.
- The user cannot re-enable email alerts for that website until they purchase Pro access.

## Pro Plan

Pro access is purchased per website.

Default Pro pricing:

- Annual price per site: $100
- Billing duration: 1 year
- Downloads: unlimited for subscribed Pro sites
- Product updates: allowed for subscribed Pro sites

Pro users can:

- View product lists.
- Download unlimited products from active subscribed Pro websites.
- Update products for active subscribed Pro websites.
- Enable email alerts for active subscribed Pro websites.

Pro users cannot:

- Use Pro actions for websites they have not subscribed to.
- Use Pro actions for expired Pro subscriptions.
- Enable email alerts for expired or unsubscribed websites.

## Pricing Settings

Pricing is stored in the backend pricing settings model.

Default values:

- `freeDownloadLimit`: 50
- `freeTrialDays`: 7
- `annualPricePerSite`: 100
- `discountRules`:
  - 2 sites: 5 percent
  - 3 to 5 sites: 10 percent
  - 6 or more sites: 15 percent

Admin can update these values from the admin settings page.

## Discount Logic

Discounts are calculated only from billable selected sites.

Already active Pro sites are shown as active and are not included in the new payment total unless renewal behavior is explicitly requested.

Formula:

```text
Subtotal = billable site count * annual price per site
Discount = subtotal * discount percent
Final total = subtotal - discount
```

Example:

```text
3 billable sites * $100 = $300 subtotal
10 percent discount = $30
Final total = $270
```

## Subscription Records

Each website subscription stores:

- User ID
- Website ID
- Website name
- Plan type: Free or Pro
- Status: active, expired, or cancelled
- Start date
- Expiration date
- Payment amount
- Discount amount
- Final paid amount
- Download limit
- Unlimited downloads flag
- Activated date
- Invoice ID
- Billing cycle

## Checkout Flow

The current frontend checkout flow uses invoices.

Flow:

1. User selects one or more available websites on the subscriptions page.
2. Frontend calls billing preview to calculate price, discount, and final total.
3. User opens checkout and enters billing information in a multiline billing field.
4. User selects payment method.
5. Frontend creates an invoice through the invoice API.
6. Invoice starts as `Pending Payment`.
7. User marks invoice as paid.
8. Invoice becomes `Paid`.
9. Admin validates the payment.
10. Admin can move invoice to `Validating`, `Completed`, or `Rejected`.
11. When admin marks invoice `Completed`, backend creates or updates Pro subscriptions for the invoice websites.
12. Completed invoice items become active.

Invoice status behavior:

- Pending Payment: user has generated invoice but has not marked it paid.
- Paid: user marked the invoice paid, admin needs to review it.
- Validating: admin is reviewing payment.
- Completed: payment approved and Pro subscriptions are activated.
- Rejected: payment rejected and sites are selectable again for checkout.

Sites with active Pro subscriptions cannot be selected again on the subscription page.

Sites with pending, validating, or rejected invoices can remain selectable unless they already have an active Pro subscription.

## Billing Preview

Billing preview returns:

- Selected sites
- Price per site
- Subtotal
- Applied discount percent
- Discount amount
- Final total
- Duration
- Expiration date
- Whether each selected site is already active
- Whether each selected site is billable

The subscription page and checkout page should use the same billing preview logic so discount totals match.

## Download Access

Download access is enforced in the backend.

Admin and Partner:

- Unlimited downloads.

Pro User:

- Unlimited downloads only for active subscribed Pro websites.
- If the export includes a website outside the active Pro subscription list, backend rejects the request.

Free User:

- Can export up to the configured `freeDownloadLimit` products per export.
- The limit is checked per download request.
- The limit is not tracked as lifetime usage.

## Email Alerts And Subscription Access

Email alerts and subscriptions are related but separate concepts.

Rules:

- User can enable email alerts only for active subscribed websites.
- Free trial websites count as subscribed until expiration.
- Expired subscriptions are removed from alert preferences automatically.
- Expired sites cannot be re-enabled for email alerts until the user purchases Pro access.
- Admin and Partner accounts bypass subscription restrictions.

## Admin Controls

Admin can:

- Manage users.
- Change user role.
- Change user plan type.
- Update pricing settings.
- Update Free trial duration.
- Update Free download limit.
- Update annual price per site.
- Update discount rules.
- Manage available websites.
- Enable or disable websites.
- Assign Pro subscriptions to a user.
- Remove user subscriptions.
- Update invoice status.
- Add admin notes to invoices.

## Important Backend Endpoints

Subscription and pricing:

- `GET /api/subscriptions`
- `POST /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`
- `GET /api/billing/preview`
- `POST /api/billing/checkout`
- `GET /api/billing/settings`
- `PUT /api/billing/settings`

Admin subscription management:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/users/:id/subscriptions`
- `PUT /api/admin/users/:id/subscriptions/:siteId`
- `DELETE /api/admin/users/:id/subscriptions/:siteId`

Invoices:

- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices/:id/mark-paid`
- `GET /api/invoices/:id/download`
- `GET /api/admin/invoices`
- `PATCH /api/admin/invoices/:id/status`

Websites:

- `GET /api/websites`
- `GET /api/websites?includeDisabled=true`
- `POST /api/websites`
- `PATCH /api/websites/:id`

Notifications:

- `GET /api/notification-preferences`
- `PUT /api/notification-preferences`

## Important Frontend Pages

- `/dashboard/subscriptions`
- `/dashboard/subscriptions/checkout`
- `/dashboard/invoices`
- `/dashboard/invoices/$invoiceId`
- `/dashboard/admin/invoices`
- `/dashboard/admin-settings`
- `/dashboard/websites`

## Current Implementation Notes

- Free trials are created automatically during registration.
- Free download limit means maximum products per export, not total products ever downloaded.
- Admin and Partner should see unlimited access messaging on the subscriptions page.
- Partner should not see the invoices page.
- Admin should use the admin invoices page, not the regular invoices page.
- Billing preview and checkout must always use backend pricing calculations.
- Email alerts must be disabled automatically for expired subscriptions.
- Completed invoices activate Pro subscriptions.
- Rejected invoices do not activate subscriptions.
