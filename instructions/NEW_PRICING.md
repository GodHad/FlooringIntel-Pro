Update the pricing card design and subscription logic for FlooringIntel.

Do not use mock data. Apply this to the real current frontend and backend.

Main goals:

1. Update the pricing card UI to match the new reference design.
2. Add Monthly / Yearly toggle.
3. Add dynamic site count selector for both Starter and Pro plans.
4. Use existing monthly_price and annual_price fields from the backend.
5. Each additional site costs +$5/month.
6. Pricing should update dynamically based on selected billing cycle and selected site count.

---

1. Pricing Card Design Update

Update the pricing cards to visually match the first reference image style.

Use this design direction:

* Modern SaaS pricing card
* Larger price text
* Clear plan title and description
* Monthly / Yearly toggle
* CTA button
* Site count select box
* Feature list below
* Rounded card corners
* Better spacing and typography
* Soft border and clean background
* Professional B2B style

Card layout:

Top:

* Plan name
* Short plan description

Middle:

* Large dynamic price
* Billing period text

Then:

* Monthly / Yearly toggle

Then:

* CTA button

Then:

* Site count select box

Then:

* Feature list

Keep the design consistent with current FlooringIntel branding, but use the new layout style from the reference image.

---

2. Monthly / Yearly Toggle

Add a Monthly / Yearly toggle.

Options:

* Monthly
* Yearly

Behavior:

* Toggle updates displayed prices for all plans.
* Toggle updates checkout/subscription calculation.
* Toggle uses existing backend values:

  * monthly_price
  * annual_price

Do not create new pricing fields.
Do not hardcode base prices in frontend.
Use the plan prices already returned from backend.

If Yearly is selected:

* Show annual price.
* Show billing label as `/ year`.
* Show savings badge if available or easy to calculate.

Example:
Save $XX

Savings can be calculated from:
(monthly_price * 12) - annual_price

---

3. Base Pricing

Use existing backend fields:

Starter:

* monthly_price already exists
* annual_price already exists

Pro:

* monthly_price already exists
* annual_price already exists

Current expected base prices:

* Starter monthly base price: $29
* Pro monthly base price: $79

But frontend should not hardcode these.
Frontend should display the values from backend plan data.

---

4. Dynamic Site Count Selector

Both Starter and Pro plans should have a site count selector.

Each plan has a base included site count.

Recommended backend fields if already available:

* website_limit
* included_site_count

Use whichever field already exists in the current system.

If the current system uses website_limit, treat it as included_site_count.

Examples:
Starter:

* included sites = plan.website_limit

Pro:

* included sites = plan.website_limit

For Pro, current included site count should be 10.

If user wants more sites than included:

* User can select additional site count from the select box.
* Each additional site costs +$5/month.

The select box should show total site count clearly.

Example options:

* 3 sites included
* 4 sites total (+$5/month)
* 5 sites total (+$10/month)
* 6 sites total (+$15/month)

For Pro:

* 10 sites included
* 11 sites total (+$5/month)
* 12 sites total (+$10/month)
* 13 sites total (+$15/month)

Use a reasonable maximum, for example:

* included count up to included count + 20

---

5. Additional Site Pricing Logic

Each extra site costs:

$5 per month

Use this formula:

extra_sites = selected_site_count - included_site_count

If extra_sites is less than 0, use 0.

Monthly total:
monthly_total = monthly_price + (extra_sites * 5)

Annual total:
annual_total = annual_price + (extra_sites * 5 * 12)

Examples:

Starter:
If monthly_price is $29 and included sites are 3:

* 3 sites = $29/month
* 4 sites = $34/month
* 5 sites = $39/month

Pro:
If monthly_price is $79 and included sites are 10:

* 10 sites = $79/month
* 11 sites = $84/month
* 12 sites = $89/month

For annual billing:

* Use plan.annual_price as the base annual price.
* Add $60/year for each extra site.
* Do not apply annual discount to extra sites unless later configured in backend.

---

6. Frontend Pricing Behavior

Frontend should:

* Load plan data from backend.
* Use existing monthly_price and annual_price.
* Use website_limit or included_site_count as included site count.
* Show Monthly / Yearly toggle.
* Show site count selector for both Starter and Pro.
* Dynamically update price when billing cycle changes.
* Dynamically update price when site count changes.
* Send selected billing cycle and selected site count to checkout.

Displayed price examples:

Monthly:
$34 / month
for 4 sites

Yearly:
$408 / year
for 4 sites

Add helper text:
Includes {{included_site_count}} sites. Add more sites for $5/month each.

---

7. Checkout Payload Update

When user clicks the CTA button, send:

{
plan_id,
billing_cycle,
selected_site_count
}

billing_cycle values:

* monthly
* annual

selected_site_count:

* total number of sites user selected
* not only the extra site count

Backend must calculate final price again.
Do not trust frontend price calculation.

---

8. Backend Checkout Logic

Update checkout/subscription backend to support dynamic site count.

Backend should:

* Get plan by plan_id.
* Use plan.monthly_price or plan.annual_price based on billing_cycle.
* Determine included_site_count from existing field:

  * included_site_count if exists
  * otherwise website_limit
* Calculate extra_sites:
  extra_sites = Math.max(selected_site_count - included_site_count, 0)
* Calculate extra site cost:

  * monthly: extra_sites * 5
  * annual: extra_sites * 5 * 12
* Calculate final total.
* Save selected_site_count in subscription/order/invoice/Stripe metadata.
* Use final total for Stripe checkout if Stripe is already implemented.

Important:
Backend should validate:

* Plan exists.
* Plan is active.
* Billing cycle is monthly or annual.
* selected_site_count is valid.
* selected_site_count is not below included_site_count unless allowed.
* selected_site_count does not exceed maximum allowed value.

---

9. Stripe Integration Note

If Stripe checkout is used:

* Stripe checkout price should reflect the calculated final amount.
* If using dynamic pricing, create Stripe Checkout Session with dynamic price_data.
* Or create/update Stripe Price records according to the current architecture.
* Metadata should include:

  * plan_id
  * billing_cycle
  * selected_site_count
  * included_site_count
  * extra_sites
  * extra_site_price_monthly
  * final_total

Do not use old manual payment logic.

---

10. Pricing Card Content

Each plan card should show:

* Plan name
* Description
* Dynamic price
* Monthly / Yearly toggle state
* Selected site count
* Site count select box
* Users count if applicable
* Export count if applicable
* Feature list
* CTA button

For Starter and Pro, both should show the site count selector.

Button text examples:

* Choose Starter
* Choose Pro
* Current Plan

If the user is already on that plan:

* Show Current badge.
* Disable CTA or show Manage Subscription depending on current app behavior.

---

11. Final Expected Result

After this update:

* Pricing card design looks like the new reference design.
* Monthly / Yearly toggle is available.
* Existing monthly_price and annual_price fields are used.
* No new monthly_price or annual_price fields are created.
* Starter has dynamic site count selector.
* Pro has dynamic site count selector.
* Each extra site costs +$5/month.
* Annual extra site cost is +$60/year per site.
* Price updates dynamically in the UI.
* Backend recalculates price securely.
* Checkout receives selected billing cycle and selected site count.
* Stripe checkout uses the correct final calculated amount.
