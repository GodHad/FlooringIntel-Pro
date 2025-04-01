Update both frontend and backend to integrate PayPal auto-renewal subscriptions.

Current app behavior:
- User selects subscription plan and websites.
- User generates invoice manually.
- User selects payment method.
- User marks invoice as paid manually.
- Admin validates invoice and marks it Completed.
- Completed invoice activates subscription.

New required behavior:
Add PayPal automatic recurring subscriptions.

Important:
- PayPal should support automatic recurring billing.
- Payoneer and Crypto should continue using the current manual invoice flow.
- PayPal should no longer require user to manually mark invoice as paid.
- PayPal payment success should activate subscription automatically through backend webhook verification.

1. Subscription payment methods

Payment options:
- PayPal Subscription: automatic recurring billing
- Payoneer: manual invoice
- Crypto: manual invoice

Frontend checkout behavior:
- If user selects PayPal:
  - Show PayPal subscription checkout button.
  - Do not show Mark as Paid button.
  - Do not require admin manual validation after successful PayPal activation.
- If user selects Payoneer or Crypto:
  - Keep current invoice generation and manual payment flow.
  - User can download invoice.
  - User marks invoice as paid.
  - Admin validates, completes, or rejects.

2. PayPal developer setup

Add backend environment variables:

PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
PAYPAL_ENV=sandbox or live

Frontend environment variable:

VITE_PAYPAL_CLIENT_ID

Use sandbox mode for testing first.
Use live mode only after sandbox subscription flow works.

3. PayPal plan mapping

Each paid app plan should map to a PayPal subscription plan.

Plans:
- Starter: $29/month
- Pro: $79/month
- Business: $149/month
- Enterprise: no normal PayPal checkout, contact sales

Add PayPal plan ID fields to subscription_plans table/model:

paypal_plan_id_sandbox nullable
paypal_plan_id_live nullable

Example:
Starter has PayPal plan ID from PayPal.
Pro has PayPal plan ID from PayPal.
Business has PayPal plan ID from PayPal.

Free Trial:
- Do not require PayPal unless we decide to collect payment method before trial.
- For now, keep Free Trial as internal app trial.

Enterprise:
- No PayPal button.
- Show Contact Sales / Create Ticket.

4. Backend database updates

Update user_subscriptions table/model:

Add fields:
- payment_provider nullable
- paypal_subscription_id nullable
- paypal_plan_id nullable
- paypal_status nullable
- current_period_start nullable
- current_period_end nullable
- cancelled_at nullable
- last_payment_at nullable
- next_billing_at nullable

Update invoices table/model:

Add fields:
- payment_provider nullable
- paypal_subscription_id nullable
- paypal_order_id nullable
- paypal_capture_id nullable
- paypal_status nullable
- paid_at nullable

Create paypal_webhook_events table/model:

Fields:
- id
- paypal_event_id unique
- event_type
- resource_id nullable
- payload JSON
- processed boolean default false
- processed_at nullable
- created_at
- updated_at

Purpose:
Prevent duplicate webhook processing.

5. Backend PayPal APIs

Create endpoints:

GET /api/paypal/config
Return frontend-safe config:
- clientId
- environment

POST /api/paypal/subscriptions/prepare
Authenticated user only.

Request:
- plan_id
- selected_website_ids
- bill_to info optional
- user_note optional

Backend should:
- Validate selected app plan.
- Validate selected website count is within plan website_limit.
- Validate selected websites are not already active or locked by pending/active subscription.
- Find the correct paypal_plan_id for sandbox/live.
- Create pending user_subscription with status pending_payment.
- Create pending subscription_sites.
- Create pending invoice or checkout record.
- Return:
  - paypal_plan_id
  - internal_subscription_id
  - invoice_id
  - selected websites
  - plan details

POST /api/paypal/webhook
Public endpoint for PayPal webhooks.

Must:
- Verify webhook signature using PayPal webhook verification.
- Store webhook event in paypal_webhook_events.
- Ignore duplicate paypal_event_id.
- Process important PayPal subscription events.

6. Frontend PayPal checkout

On checkout page, when payment method is PayPal:

- Call POST /api/paypal/subscriptions/prepare
- Load PayPal JavaScript SDK with:
  client-id
  vault=true
  intent=subscription

Render PayPal Buttons.

PayPal button createSubscription:
- Use paypal_plan_id returned by backend.
- Include custom_id or custom metadata if supported:
  - internal_subscription_id
  - invoice_id
  - user_id

On approve:
- Send PayPal subscription ID to backend endpoint:
  POST /api/paypal/subscriptions/approved

Request:
- internal_subscription_id
- invoice_id
- paypal_subscription_id

Backend should:
- Save paypal_subscription_id
- Keep status as pending_payment or activating until webhook confirms activation/payment
- Return success message:
  PayPal subscription approved. We are confirming your subscription.

Frontend should show:
- Confirmation screen
- Subscription is being activated
- Do not activate paid access only from frontend approval

Important:
Frontend approval alone is not enough. Final activation must happen from verified backend PayPal webhook or backend PayPal API verification.

7. Backend approved endpoint

Create:

POST /api/paypal/subscriptions/approved

Authenticated user only.

Request:
- internal_subscription_id
- invoice_id
- paypal_subscription_id

Backend:
- Verify the internal subscription belongs to the logged-in user.
- Save PayPal subscription ID.
- Optionally call PayPal API to get subscription details.
- Do not fully activate unless PayPal status is ACTIVE or webhook confirms activation.
- Update invoice payment_provider to PayPal.
- Update invoice paypal_subscription_id.
- Return current status.

8. PayPal webhook events to handle

Handle at minimum:

BILLING.SUBSCRIPTION.ACTIVATED
- Find internal subscription by paypal_subscription_id or custom_id.
- Set user_subscription status to active.
- Set payment_provider to paypal.
- Set paypal_status to ACTIVE.
- Activate selected subscription_sites.
- Set invoice status to Completed.
- Set paid_at if available.
- Create notification:
  Your PayPal subscription is active.

BILLING.SUBSCRIPTION.CANCELLED
- Set user_subscription status to cancelled.
- Set subscription_sites status to cancelled or expire at current_period_end depending business rule.
- Create notification:
  Your PayPal subscription was cancelled.

BILLING.SUBSCRIPTION.SUSPENDED
- Set subscription status to suspended or past_due.
- Disable paid features if desired.
- Create notification:
  Your PayPal subscription needs attention.

BILLING.SUBSCRIPTION.EXPIRED
- Set subscription status to expired.
- Expire subscription_sites.
- Create notification.

PAYMENT.SALE.COMPLETED or payment completed event for recurring payment
- Update last_payment_at.
- Extend current_period_end / next_billing_at if provided.
- Create invoice/payment record for renewal.
- Keep subscription active.

PAYMENT.SALE.DENIED or failed payment event if available
- Mark subscription as past_due or payment_failed.
- Notify user.

Use PayPal’s current webhook names from their Subscriptions docs.

9. Renewal invoice/payment records

For each successful recurring PayPal payment:
- Create a renewal invoice or payment record.
- Mark it Completed automatically.
- Store:
  - paypal_subscription_id
  - paypal_transaction_id
  - amount
  - currency
  - paid_at
  - billing period
  - plan
  - websites included

User invoices page should show:
- Manual invoices
- PayPal auto-renewal invoices/payments

For PayPal invoices:
- Status should be Completed when payment is confirmed.
- No Mark as Paid button.
- Show badge:
  Auto-paid by PayPal

10. Subscription cancellation

Add user cancellation flow for PayPal subscriptions.

Frontend:
- My Subscription page should show:
  Cancel Subscription button for PayPal active subscriptions.

Backend:
POST /api/paypal/subscriptions/:id/cancel

Backend should:
- Verify subscription belongs to current user.
- Call PayPal cancel subscription API.
- Update local status to cancellation_pending or cancelled based on PayPal response.
- Keep access until current_period_end if possible.
- Notify user.

Admin:
- Admin can view PayPal subscription ID.
- Admin can see PayPal status.
- Admin can cancel or suspend only if implemented safely.

11. Upgrade/downgrade plan

For first version:
- Do not implement automatic upgrade/downgrade.
- Show message:
  To change your plan, cancel your current PayPal subscription and start a new one.
- Later, implement PayPal revise subscription API if needed.

12. Frontend changes

Update checkout page:

Payment method section:
- PayPal Auto-Renewal
  Description:
  Pay securely with PayPal. Your subscription renews automatically each month.
- Payoneer Manual Invoice
- Crypto Manual Invoice

If PayPal selected:
- Show PayPal button
- Hide Generate Invoice button unless invoice is created internally by prepare API
- Hide Mark as Paid button
- Show automatic renewal notice:
  Your subscription will renew monthly until cancelled.

If Payoneer or Crypto selected:
- Keep current invoice flow.

Update invoices page:
- For PayPal invoices:
  - Show payment provider: PayPal
  - Show PayPal subscription ID
  - Hide Mark as Paid
  - Show Auto-paid badge

Update My Subscription page:
Show:
- Plan
- Status
- Payment provider
- PayPal subscription ID
- Next billing date
- Current period end
- Cancel subscription button

13. Backend access control

Paid access should be granted only when:
- PayPal webhook confirms subscription activation, or
- Backend PayPal API confirms subscription is ACTIVE

Do not activate access from frontend success alone.

If PayPal subscription is cancelled, suspended, expired, or payment failed:
- Update local subscription status.
- Apply access rules.
- Notify user.

14. Security requirements

- Verify every PayPal webhook signature.
- Store webhook event IDs and ignore duplicates.
- Do not trust frontend approval alone.
- Do not expose PayPal client secret to frontend.
- Use sandbox credentials in development and live credentials in production.
- Keep PayPal plan IDs environment-specific.
- Validate user ownership of subscription/invoice records.

15. Testing checklist

Test in PayPal sandbox:

- Starter subscription creation
- Pro subscription creation
- Business subscription creation
- PayPal approval callback
- Webhook activation
- Subscription becomes active
- Selected websites become active
- Invoice becomes Completed
- User invoices page shows PayPal auto-paid invoice
- User cannot click Mark as Paid for PayPal invoice
- User can cancel PayPal subscription
- Cancel webhook updates local subscription
- Manual Payoneer/Crypto invoice flow still works
- Webhook duplicate event does not duplicate activation
- Invalid webhook is rejected

16. Final expected result

The app should support:
- PayPal automatic recurring subscriptions
- Manual invoice flow for Payoneer and Crypto
- PayPal plan mapping for Starter, Pro, and Business
- Backend verified PayPal webhooks
- Automatic subscription activation after PayPal confirmation
- Automatic renewal payment records
- User cancellation flow
- Updated invoices and subscription UI
- Secure handling of PayPal secrets and webhook verification
- No manual Mark as Paid needed for PayPal