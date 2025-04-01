Update both frontend and backend for export limit behavior and URL product badge support.

Do not use mock data. Apply this to the real current app.

Main goals:
1. Free users can download only 50 products per export.
2. Paid users have no export count limit, but exports must only include products from subscribed websites.
3. Download/export page should only show subscribed websites.
4. Add only product_badge field to URL model.
5. URL product_badge can override frontend product availability badge.
6. Keep upsertUrlsForSite backward-compatible and safe.

---

1. Export Limit Behavior

Free user behavior:

Free users have a download/export limit of 50 products per export.

If a free user tries to export more than 50 products:
- Do not throw an error.
- Do not show a blocking error message.
- Automatically limit the export to the first 50 products.
- Generate XLSX with only those 50 products.

Backend:
- Apply limit at export query level.
- Use plan.exportLimit if available.
- Default free export limit should be 50.
- Return metadata if possible:

{
  limited: true,
  limit: 50,
  exportedCount: 50,
  totalRequested: original count
}

Frontend:
After free user export, show toast:

`Your free plan export includes the first 50 products. Upgrade for unlimited exports.`

Do not show error modal.

---

2. Paid User Export Behavior

Paid users should not have a product count limit.

However, paid users can only export products from websites they are subscribed to.

Backend:
- For paid users, do not apply export count limit.
- Always filter export products by the user’s subscribed website IDs.
- Do not allow paid users to export products from unsubscribed websites, even if the frontend sends those website IDs.
- Subscription/site access validation must happen on backend.

Example backend rule:

Free user:
- Filter by subscribed/allowed websites
- Limit to 50 products

Paid user:
- Filter by subscribed websites only
- No count limit

Admin/Partner:
- Follow existing access rules.

Apply this to:
- Products page export
- Website page export
- Filtered product export
- Selected product export
- Any XLSX product download endpoint

---

3. Download Page Website Selection

In the download/export page, show only websites the current user is subscribed to.

Frontend:
- Website dropdown/filter/select should only contain subscribed websites.
- User should not be able to select unsubscribed websites.
- If the user has no subscribed websites, show empty state:

`You do not have any subscribed websites yet.`

Add CTA if appropriate:

`Subscribe to websites`

Backend:
- Even though frontend filters websites, backend must still validate subscribed site access.
- Never trust website IDs sent from frontend.

---

4. URL Model product_badge Field

Only add one new field to URL model:

- product_badge nullable string

Do not create enum values.

product_badge should be a normal string field.

Allowed expected values for now:
- New Arrival
- Coming Soon
- Discontinued
- Discounted
- Make in order

Important:
These are expected values only.
Do not enforce enum validation because this field should be easy to update later.

Backend model:
Add to URL schema/model:

product_badge: {
  type: String,
  default: null
}

or equivalent depending on current backend structure.

---

5. getUrls Return Format

Don't update scraper URL discovery functions so getUrls(site) can optionally return product_badge. It will be done manually update. just accept the optional prodcut_badge field from getUrls function

Supported return formats:

Old format:

{
  url: "https://example.com/product-1"
}

New format:

{
  url: "https://example.com/product-1",
  product_badge: "New Arrival"
}

---

6. upsertUrlsForSite Safety Migration

Update upsertUrlsForSite safely so it works with both old and new URL formats.

It must support:

[
  { url: "https://example.com/product-1" }
]

[
  { url: "https://example.com/product-1", product_badge: "New Arrival" }
]

Behavior:
- Insert new URL records with product_badge if provided.
- Update existing URL records with latest product_badge if provided.
- If product_badge is missing, do not break old scrapers.
- Do not require product_badge.
- Keep existing missing URL detection logic.
- When URL no longer exists, mark related products as:
  is_deleted: true

Example normalization logic:

const normalizedUrls = urls.map(item => ({
  url: item.url,
  product_badge: item.product_badge || null
}));

Important:
If existing URL has product_badge and new scraper result does not include badge, decide safe behavior:
- Recommended: keep existing product_badge unless scraper explicitly sends product_badge as null or empty string.
- This avoids accidentally deleting badge data from older or partial scraper results.

---

7. Product Badge Display Logic In Frontend

Current frontend behavior:
- If product is deleted, show Stock out badge.
- If product is not deleted, show Availability badge.

New behavior:
Show only one badge.

Badge priority order:

1. Deleted
2. product_badge from URL
3. Availability

Badge logic:

If product.is_deleted is true:
- Show badge:
  Deleted

Else if product.url.product_badge exists or product.product_badge exists:
- Show that badge text.

Else:
- Show Availability badge.

Examples:
- is_deleted true + product_badge New Arrival → show Deleted
- is_deleted false + product_badge New Arrival → show New Arrival
- is_deleted false + product_badge Coming Soon → show Coming Soon
- is_deleted false + no product_badge → show Availability

Do not show multiple badges at the same time for availability/status.

---

8. Product API Response Updates

Update backend product API responses so frontend can access product_badge.

Preferred response:
Each product should include:

product_badge

This value can come from:
- related URL record product_badge
- or product model if already copied there

Recommended simple approach:
- Keep product_badge in URL model.
- When returning products, populate/include related URL product_badge.
- Map it into product response as product_badge for easy frontend use.

Example product response:

{
  id,
  name,
  sku,
  color,
  is_deleted,
  availability,
  product_badge,
  website,
  url
}

Do not require product model migration unless current architecture makes it easier.

---

9. Export Update

In XLSX export, include product_badge if useful.

Column name:
Product Badge

Value:
- Deleted if is_deleted is true
- product_badge if exists
- Availability if no product_badge and not deleted

Use the same priority order:
Deleted → product_badge → Availability

---

10. Frontend Type Updates

Update TypeScript types/interfaces if used:

Url:
- product_badge?: string | null

Product:
- product_badge?: string | null
- is_deleted?: boolean

Export type if applicable:
- product_badge?: string | null

---

11. Final Expected Result

After this update:

- Free users can export only 50 products per download.
- Free users do not see a blocking export error.
- Free users get XLSX with the first 50 products.
- Paid users have no export count limit.
- Paid users can only export products from subscribed websites.
- Download page only shows subscribed websites.
- Backend validates subscribed website access for every export.
- URL model has only one new field: product_badge.
- product_badge is a normal string, not enum.
- upsertUrlsForSite safely supports old and new URL return formats.
- URL results can be:
  { url }
  or
  { url, product_badge }
- Frontend shows only one badge per product.
- Badge priority is:
  Deleted → product_badge → Availability
- XLSX export uses the same badge priority.