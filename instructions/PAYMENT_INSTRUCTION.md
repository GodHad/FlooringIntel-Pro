Update the payment and subscription system to use Stripe only.

Do not use mock data. Apply this to the real current frontend and backend.

Main goal:
Replace all PayPal, Payoneer, Crypto, and manual invoice/payment validation flows with Stripe subscriptions.

Stripe should be the only payment provider.

Subscriptions must support:
- Monthly billing
- Annual billing
- Admin-customizable pricing
- Automatic payment confirmation through Stripe webhooks
- Automatic subscription activation after successful Stripe checkout
- Automatic cancellation/expiration handling
- No manual “Mark as Paid”
- No manual “Validating”
- No manual “Reject”
- No manual admin payment confirmation

---

1. Remove old payment methods

Remove or disable these payment methods from frontend and backend:

- PayPal Subscription
- PayPal Manual Payment
- Payoneer Manual Payment
- Crypto Manual Payment

Remove these manual invoice/payment actions from user UI:

- Mark as Paid

Remove these manual admin actions:

- Mark as Validating
- Mark as Completed manually for payment confirmation
- Reject invoice because payment was not received

Admin should no longer manually validate payments.

Payment status should come from Stripe webhook events only.

---

2. Stripe setup

Add Stripe backend environment variables:

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=
STRIPE_CANCEL_URL=

Add frontend environment variable if needed:

VITE_STRIPE_PUBLISHABLE_KEY=

Install Stripe SDK on backend.

Use Stripe Checkout for subscription checkout.

Use Stripe webhooks to confirm payments and subscription status.

Do not trust frontend success page alone.

---

3. Subscription plans and pricing

Subscription should support monthly and annual billing.

Admin should be able to customize prices from Admin Settings.

Update subscription plan model/table:

subscription_plans:
- id
- name
- slug
- description
- monthly_price
- annual_price
- currency
- website_limit
- user_limit
- export_limit
- features JSON
- is_active
- sort_order
- stripe_monthly_price_id nullable
- stripe_annual_price_id nullable
- stripe_product_id nullable
- created_at
- updated_at

Important:
Admin can update monthly_price and annual_price in app settings.

When admin updates a plan price:
- Backend should create or update Stripe Product/Price records as needed.
- Since Stripe Price objects are usually immutable, create a new Stripe Price when price amount changes.
- Save the latest stripe_monthly_price_id or stripe_annual_price_id to the subscription plan.
- Existing active subscriptions should continue using their original Stripe price unless upgrade/change flow is implemented later.

Plans:
- Free Trial
- Starter
- Pro
- Business

Free Trial:
- No Stripe checkout required.
- Keep internal free trial logic.

Paid plans:
- Starter
- Pro
- Business

Each paid plan should support:
- Monthly
- Annual

---

4. Admin pricing settings

Update Admin Settings or Admin Plans page.

Admin should be able to edit:

- Plan name
- Monthly price
- Annual price
- Website limit
- User limit
- Export limit
- Features
- Active/inactive status

Add Save button.

When admin saves plan pricing:
- Save to database.
- Sync related Stripe product/price IDs.
- Show success toast:
  Plan pricing updated successfully.

Add warning text:
Changing prices will apply to new checkouts. Existing active subscriptions will continue on their current Stripe billing price unless changed manually.

---

5. Checkout flow

Update frontend checkout flow.

User flow:

1. User chooses a plan.
2. User chooses billing cycle:
   - Monthly
   - Annual
3. User selects websites within plan limit.
4. User clicks Subscribe with Stripe.
5. Backend creates Stripe Checkout Session.
6. User is redirected to Stripe Checkout.
7. Stripe handles payment.
8. Stripe redirects user to success/cancel page.
9. Backend activates subscription only after webhook confirms payment/subscription.

Frontend checkout page should show:

- Selected plan
- Billing cycle
- Selected websites
- Website usage count
- Total price
- Subscribe with Stripe button

Remove:
- Payment method selection
- Manual payment instructions
- Mark as Paid button
- Manual invoice preview before payment unless keeping invoice records internally

Button:
Subscribe with Stripe

---

6. Backend checkout endpoint

Create or update endpoint:

POST /api/billing/stripe/create-checkout-session

Authenticated user only.

Request body:
- plan_id
- billing_cycle: monthly or annual
- selected_website_ids

Backend validation:
- User must be authenticated.
- Plan must exist and be active.
- Plan cannot be Enterprise.
- Billing cycle must be monthly or annual.
- Selected website count must not exceed plan.website_limit.
- Selected websites must not already be active for the user.
- Selected websites must not be locked by another active/pending Stripe checkout if that logic exists.

Backend behavior:
- Find Stripe price ID:
  - monthly → stripe_monthly_price_id
  - annual → stripe_annual_price_id
- Create pending user_subscription record.
- Create pending subscription_sites records.
- Create internal invoice/order record with status:
  Pending Stripe Checkout
- Create Stripe Checkout Session with mode subscription.
- Add metadata:
  - user_id
  - plan_id
  - billing_cycle
  - internal_subscription_id
  - invoice_id
  - selected_website_ids as JSON/string
- Return checkout URL.

Frontend:
- Redirect user to returned Stripe checkout URL.

---

7. Stripe webhook endpoint

Create endpoint:

POST /api/stripe/webhook

This endpoint must use raw request body for Stripe signature verification.

Backend must:
- Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET.
- Store processed event IDs to avoid duplicate processing.
- Ignore duplicate events safely.

Create stripe_events table/model:

- id
- stripe_event_id unique
- event_type
- payload JSON
- processed boolean default false
- processed_at nullable
- created_at
- updated_at

Handle these Stripe events:

checkout.session.completed:
- Find internal subscription/invoice from metadata.
- Save stripe_customer_id.
- Save stripe_subscription_id.
- Mark invoice as Paid or Completed.
- Activate user subscription.
- Activate selected subscription_sites.
- Set subscription status active.
- Set billing cycle.
- Set current period start/end if available.
- Send subscription activated notification/email.

customer.subscription.created:
- Store Stripe subscription info if needed.

customer.subscription.updated:
- Sync subscription status.
- Update current_period_start/current_period_end.
- Handle status changes:
  - active
  - trialing
  - past_due
  - unpaid
  - canceled
  - incomplete

customer.subscription.deleted:
- Mark user subscription cancelled or expired.
- Expire subscription_sites.
- Disable paid access.
- Notify user.

invoice.paid:
- Create internal invoice/payment record for renewal.
- Mark renewal invoice Completed.
- Update last_payment_at.
- Keep subscription active.
- Send receipt/subscription renewal notification if needed.

invoice.payment_failed:
- Mark subscription past_due or payment_failed.
- Notify user.
- Optionally keep access until current period end.

---

8. Subscription model updates

Update user_subscriptions table/model:

Add fields:
- stripe_customer_id nullable
- stripe_subscription_id nullable
- stripe_price_id nullable
- stripe_product_id nullable
- stripe_status nullable
- payment_provider default stripe
- billing_cycle
- current_period_start nullable
- current_period_end nullable
- cancel_at_period_end boolean default false
- cancelled_at nullable
- last_payment_at nullable

Subscription statuses:
- trialing
- pending_checkout
- active
- past_due
- unpaid
- cancelled
- expired

Remove or stop using manual payment statuses for subscriptions.

---

9. Invoice model updates

Keep internal invoices for records, but remove manual validation flow.

Invoice statuses:

- Pending Stripe Checkout
- Paid
- Completed
- Failed
- Cancelled
- Refunded if needed later

Invoice fields:
- payment_provider: stripe
- stripe_checkout_session_id
- stripe_customer_id
- stripe_subscription_id
- stripe_invoice_id nullable
- stripe_payment_intent_id nullable
- billing_cycle
- plan_id
- selected_website_ids
- amount
- currency
- paid_at nullable
- created_at
- updated_at

User invoices page should show Stripe invoices/payment records.

Do not show:
- Mark as Paid
- Manual payment instructions

Show:
- Stripe payment status
- Billing cycle
- Plan
- Amount
- Created date
- Download invoice/receipt if available
- Stripe hosted invoice URL if available

---

10. User subscription page

Update My Subscription page.

Show:
- Current plan
- Status
- Billing cycle
- Websites used / website limit
- Current period end
- Stripe subscription status
- Cancel subscription button
- Manage billing button

Add Stripe Customer Portal:

Create endpoint:

POST /api/billing/stripe/create-portal-session

Backend:
- User must have stripe_customer_id.
- Create Stripe Billing Portal session.
- Return portal URL.

Frontend:
- Button:
  Manage Billing
- Redirect to Stripe portal.

---

11. Cancellation

Use Stripe Billing Portal as the main cancellation method.

Optional direct cancel endpoint:

POST /api/billing/stripe/cancel-subscription

Backend:
- Verify current user owns subscription.
- Cancel at period end by default.
- Update local subscription cancel_at_period_end true.
- Final access should remain active until current_period_end unless business logic says otherwise.

Preferred:
Use Stripe Billing Portal for cancellation and payment method updates.

---

12. Success and cancel pages

Create/update routes:

/dashboard/subscriptions/success
/dashboard/subscriptions/cancel

Success page:
Title:
Payment received

Message:
Your Stripe checkout was completed. We are confirming your subscription. Your plan will activate automatically once Stripe confirms the payment.

CTA:
Go to Dashboard

Important:
Do not activate subscription only from success page.

Cancel page:
Title:
Checkout cancelled

Message:
Your subscription checkout was cancelled. You can return to the subscriptions page and try again.

CTA:
Back to Subscriptions

---

13. Remove manual admin invoice flow

Admin invoices page should no longer show manual payment controls.

Remove:
- Mark as Validating
- Mark as Completed
- Reject

Instead show:
- Stripe status
- Stripe customer ID
- Stripe subscription ID
- Stripe invoice ID
- Billing cycle
- Plan
- Amount
- User
- Created date
- Current period
- Subscription status

Admin can view details but should not manually confirm payment.

Optional admin actions:
- View in Stripe Dashboard if URL is available
- Sync Stripe status
- Cancel subscription if implemented

---

14. Access control

Backend access must be based on subscription status from database synced by Stripe webhooks.

Active access allowed if:
- User role is Admin or Partner, or
- User has active/trialing subscription, and
- Website is included in active subscription_sites

Paid users:
- No export count limit.
- Can only export subscribed websites.

Free users:
- Export limit remains 50 products per export.
- Access only allowed according to free trial rules.

---

15. Email and notifications

Create notifications/emails for:

- Stripe checkout started
- Subscription activated
- Subscription renewed
- Payment failed
- Subscription cancelled
- Subscription expiring/cancel_at_period_end

Invoice email:
For Stripe, invoice/receipt email can be handled by Stripe if enabled.

If internal app sends invoice email:
- Send after checkout.session.completed or invoice.paid, not before payment.
- Email subject:
  Your FlooringIntel subscription is active
- Include plan, billing cycle, amount, and invoice/receipt link.

---

16. Frontend cleanup

Remove from UI:
- PayPal
- Payoneer
- Crypto
- Manual payment method selector
- Manual invoice instructions
- Mark as Paid
- Admin validating/completed/rejected payment controls

Replace with:
- Stripe checkout
- Stripe status
- Manage Billing button
- Subscription status badges

---

17. Backend cleanup

Remove or disable:
- PayPal API integration
- PayPal webhook
- Payoneer payment instructions
- Crypto payment instructions
- Manual invoice validation endpoints if only used for payments:
  - mark paid
  - validating
  - reject
  - manual complete

Keep invoice records if needed for billing history, but they should be Stripe-driven.

---

18. Testing checklist

Test in Stripe test mode:

- Create monthly Starter subscription
- Create annual Starter subscription
- Create monthly Pro subscription
- Create annual Pro subscription
- Checkout success redirect
- Checkout cancel redirect
- checkout.session.completed webhook activates subscription
- invoice.paid creates renewal record
- invoice.payment_failed marks payment problem
- customer.subscription.deleted cancels access
- Stripe Billing Portal opens correctly
- Admin invoice page shows Stripe data
- Manual payment buttons are removed
- Free plan export limit still works
- Paid export only includes subscribed sites

---

19. Final expected result

After this update:

- Stripe is the only payment provider.
- Monthly and annual subscriptions are supported.
- Admin can customize plan pricing.
- Stripe Checkout handles payment.
- Stripe webhooks activate subscriptions automatically.
- Stripe Billing Portal manages billing.
- Manual payment process is removed.
- Users no longer mark invoices as paid.
- Admin no longer validates, rejects, or manually confirms invoice payments.
- Subscription access is based on Stripe-synced subscription status.
- Invoices/payment history are Stripe-driven.