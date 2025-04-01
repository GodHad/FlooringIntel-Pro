Update the current subscription system from Free + per-site Pro pricing to the new plan-based subscription model.

This must update both frontend and backend. Do not use mock data.

Current system summary:
- Admin and Partner have unlimited access and should continue bypassing pricing restrictions.
- User accounts currently use Free and Pro.
- Free trial subscriptions are currently created per enabled website.
- Pro access is currently purchased per website annually.
- Checkout uses invoices.
- Admin marks invoice Completed to activate Pro subscriptions.
- Backend enforces download access.
- Pricing settings currently include freeDownloadLimit, freeTrialDays, annualPricePerSite, and discountRules.

New goal:
Replace the current per-site annual Pro pricing model with fixed subscription plans.

New plans:

1. Free Trial
- Price: $0
- Duration: 14 days
- Website limit: 2 websites
- User limit: 1
- Export limit: 50 products per export
- Features:
  - Basic dashboard
  - Latest product view
  - Daily report preview
  - Limited Excel export

2. Starter
- Price: $29/month
- Website limit: 3 websites
- User limit: 1
- Export limit: 3 exports/month
- Features:
  - Daily product updates
  - New product tracking
  - Removed product tracking
  - Basic email notifications
  - Product search and filters

3. Pro
- Price: $79/month
- Website limit: 10 websites
- User limit: 3
- Export limit: unlimited
- Features:
  - Daily and weekly reports
  - New products, removed products, SKU/color updates
  - Unlimited Excel exports
  - Product history
  - Request new website scraping
  - Priority support

4. Business
- Price: $149/month
- Website limit: 25 websites
- User limit: 10
- Export limit: unlimited
- Features:
  - All Pro features
  - Advanced reports
  - Competitor tracking
  - Export by brand/date/change type
  - Custom daily digest
  - Higher priority scraping support

5. Enterprise
- Price: Custom
- Website limit: Custom
- User limit: Custom
- Export limit: Custom
- Features:
  - Custom tracked websites
  - Custom scraping frequency
  - API access
  - Dedicated support
  - White-label reports
  - Custom onboarding

Backend changes:

1. Add subscription_plans table/model

Fields:
- id
- name
- slug
- price
- currency
- billing_cycle
- website_limit
- user_limit
- export_limit
- trial_days
- features JSON
- is_active
- sort_order
- created_at
- updated_at

Seed the new plans:
- free_trial
- starter
- pro
- business
- enterprise

2. Update user subscription model

Replace the old simple Free/Pro logic with plan-based subscription logic.

Create or update user_subscriptions table/model:

Fields:
- id
- user_id
- plan_id
- status
- billing_cycle
- starts_at
- ends_at
- trial_ends_at nullable
- invoice_id nullable
- created_at
- updated_at

Statuses:
- trialing
- pending_payment
- active
- expired
- cancelled

3. Update site subscription records

Keep website-level access, but tie it to the active user subscription plan.

Create or update subscription_sites table/model:

Fields:
- id
- user_subscription_id
- user_id
- website_id
- status
- activated_at nullable
- created_at
- updated_at

Statuses:
- pending
- active
- expired
- cancelled

4. Remove old pricing logic

Remove or stop using:
- annualPricePerSite
- discountRules
- per-site annual price calculations

Keep or migrate:
- freeDownloadLimit can become the Free Trial export limit
- freeTrialDays should change from 7 to 14

Billing preview should no longer calculate:
site count * annualPricePerSite - discount

Instead it should calculate:
selected plan price only

Example:
Starter = $29/month for up to 3 websites
Pro = $79/month for up to 10 websites
Business = $149/month for up to 25 websites

5. Update checkout API

Update checkout flow:

User selects:
- Plan
- Websites to track
- Payment type
- Bill To info
- User note

Validation:
- Selected websites count must not exceed selected plan website_limit
- User cannot select websites already active under current subscription
- User cannot select websites already included in Pending Payment, Paid, or Validating invoice
- Enterprise plan should not create a normal invoice. It should create a contact/request ticket instead.

Update endpoint:
POST /api/billing/checkout

Request body:
- plan_id
- selected_website_ids
- payment_type
- bill_to
- user_note

Response:
- invoice
- billing preview
- pending subscription
- pending subscription sites

6. Invoice logic

Invoice should include:
- selected plan
- plan price
- billing cycle
- selected websites
- total amount
- seller billing info snapshot
- user billing info
- payment type
- status

When invoice is created:
- Create user_subscription with status pending_payment
- Create subscription_sites with status pending
- Create invoice with plan and selected websites

When user marks invoice as paid:
- Invoice status becomes Paid
- Subscription remains pending_payment

When admin marks invoice as Completed:
- Invoice status becomes Completed
- user_subscription becomes active
- subscription_sites become active
- starts_at is current date
- ends_at is one month later for monthly plans
- activated_at is current date
- User gets access to selected websites and plan features

When admin rejects invoice:
- Invoice status becomes Rejected
- Pending subscription becomes cancelled
- Pending subscription_sites become cancelled
- Selected websites become available again for checkout

7. Free Trial behavior

On new user registration:
- Create Free Trial subscription automatically
- Duration: 14 days
- Allow user to select or auto-assign up to 2 enabled websites
- Status: trialing
- Export limit: 50 products per export
- Trial ends after 14 days

After trial expires:
- Subscription status becomes expired
- Website access becomes expired
- Email alerts for expired websites should be disabled
- User must upgrade to Starter, Pro, or Business

8. Access control

Admin and Partner:
- Unlimited access
- No subscription restrictions
- No invoice requirement
- No export limits

User:
- Access is based on current active/trialing plan
- Website access is limited by active subscription_sites
- Export access is limited by plan

Free Trial:
- 2 websites
- 50 products per export

Starter:
- 3 websites
- 3 exports per month

Pro:
- 10 websites
- Unlimited exports

Business:
- 25 websites
- Unlimited exports
- Advanced reports

Enterprise:
- Custom

Backend must enforce:
- Website access
- Export limits
- Email alert access
- Product update access
- Dashboard access by selected websites

9. Frontend changes

Update /dashboard/subscriptions

New flow:
Step 1: Choose plan
Step 2: Select websites within the plan limit
Step 3: Checkout and generate invoice

Show pricing cards:
- Free Trial
- Starter
- Pro
- Business
- Enterprise

Plan card should show:
- Plan name
- Price
- Website limit
- User limit
- Export limit
- Features
- CTA button

Highlight Pro as:
Most Popular

CTA:
- Free Trial: Start Free Trial
- Starter: Choose Starter
- Pro: Choose Pro
- Business: Choose Business
- Enterprise: Contact Sales

Website selection:
- Show selected count:
  Selected 4 of 10 websites
- Disable checkout if user exceeds limit
- Show Pro Active badge for active websites
- Show Pending Payment or Validating badge for websites already in invoice flow
- Disable unavailable websites

10. Checkout page update

Update /dashboard/subscriptions/checkout

Show:
- Selected plan
- Plan price
- Billing cycle
- Selected websites
- Website count
- Total amount
- Payment type
- Bill To info
- Generate invoice button

Invoice should be based on plan price, not per-site total.

Example:
Pro Plan
10 websites allowed
Selected websites: 7
Total: $79/month

11. My Subscription UI

Add or update My Subscription section.

Show:
- Current plan
- Status
- Billing cycle
- Website usage
- Active tracked websites
- Trial end date if trialing
- Subscription start date
- Subscription end date
- Related invoice
- Upgrade button
- Manage websites button

Example:
Current Plan: Pro
Status: Active
Websites: 7 / 10
Exports: Unlimited
Billing: Monthly

12. Admin updates

Update admin settings:
- Replace old annual price per site and discount rules with subscription plan management.
- Admin can edit plan prices, limits, features, and active status.

Admin should be able to:
- View all user subscriptions
- View user plan
- View selected websites
- View invoice
- Cancel subscription
- Expire subscription
- Assign or change plan manually if needed

Add or update route:
 /dashboard/admin/subscriptions

Admin table columns:
- User
- Plan
- Status
- Websites used
- Invoice ID
- Started at
- Ends at
- Actions

13. Update billing settings

Remove old fields from billing settings UI:
- Annual price per site
- Discount rules

Keep or replace with:
- Free trial days
- Plan management
- Export limits by plan
- Website limits by plan
- User limits by plan

14. Update invoices page

User invoice list should show:
- Invoice ID
- Plan
- Selected websites
- Payment type
- Total amount
- Status
- Created date
- Actions

Admin invoice list should show:
- Invoice ID
- User
- Plan
- Selected websites
- Total amount
- Status
- Admin actions

15. Update notifications

Create notifications when:
- Trial starts
- Trial is close to ending
- Subscription invoice is created
- User marks invoice as paid
- Admin marks invoice Validating
- Admin marks invoice Completed
- Admin rejects invoice
- Subscription becomes active
- Subscription expires

16. Migration/backward compatibility

Migrate existing users:

- Admin and Partner remain unlimited.
- Existing Free users should receive Free Trial status if still within trial period, otherwise expired/free limited state.
- Existing active Pro site subscriptions should be mapped to the closest plan based on number of active Pro sites:
  - 1 to 3 active sites: Starter
  - 4 to 10 active sites: Pro
  - 11 to 25 active sites: Business
  - More than 25: Enterprise/custom
- Preserve active website subscriptions.
- Preserve existing invoices.
- Do not delete old invoice history.

17. Final expected result

The app should move from:
Free + annual per-site Pro pricing

To:
Plan-based subscriptions:
Free Trial, Starter, Pro, Business, Enterprise

The new system should support:
- Plan selection
- Website selection within plan limits
- Invoice checkout
- Admin payment validation
- Completed invoice activates selected plan and websites
- Rejected invoice cancels pending subscription
- Backend-enforced access control
- Admin and Partner unlimited access
- Updated frontend pricing, checkout, invoices, and subscription pages
- No mock data