Update both frontend and backend related code for the following UI, dashboard, website, and XLSX export fixes.

Do not use mock data. Apply these changes to the real current app.

1. Products Page Updates

Product card layout:

In each product card, update the layout like this:

Left side:
- Product name
- Color below product name
- SKU below color

Right side:
- View button
- External product link button

Example layout:

Left:
Product Name
Color: Beige
SKU: ABC-123

Right:
View
Link

Make sure the layout works on mobile too.

Product detail view:

Change label text:
- From: Date scraped
- To: Product Added

Product table view:

Change table heading:
- From: SCRAPED
- To: UPDATED

Make sure this is only the display label unless the backend field name also needs mapping. Do not break existing sorting or data loading.

2. Website Page Updates, User View

On the user-facing Website page:

Fix Export button:
- Export button currently does not work.
- Connect it to the real export/download API.
- When user clicks Export for a website, download products for that website as XLSX.
- Show loading state while exporting.
- Show success toast after export starts/downloads.
- Show error toast if export fails.

Remove Logs button:
- Logs button is not needed for user view.
- Remove it from website cards/table actions.
- If logs are still needed for admin, keep them only in admin/debug view.

Change label text:
- From: Last scrape
- To: Last update

3. Dashboard Fixes

Fix dashboard statistic cards:

New Products This Week card:
- It is currently not working.
- Update backend/API/frontend logic so it shows the real count of products added during the current week.
- Count only active products where is_deleted is false.
- Use product added date field, not updated date, unless added date is unavailable.

Scraping Success Rate card:
- It is currently not working.
- Calculate from real scraping jobs/history.
- Formula:
  completed scraping jobs / total scraping jobs * 100
- Exclude cancelled jobs if the system has cancelled status.
- Show percentage with proper fallback:
  If there are no scraping jobs, show 0% or N/A.

Recent scraping activity card:
- Add and display:
  - Added count
  - Removed count

Each recent scraping row/card should show:
- Website name
- Last update time
- Added count
- Removed count
- Status

Latest New Products card:
- Currently show product info.
- Add:
  - Color
  - SKU

Each latest product should display:
- Product name
- Website
- Color
- SKU
- Product added date

4. XLSX Export Updates

Update exported XLSX columns.

Remove these columns:
- Website ID
- Product Id

Rename column:
- From: Date Scraped
- To: Product Added

Make sure the exported XLSX still includes useful fields like:
- Website name
- Product name
- Color
- SKU
- Price
- Category
- Product URL
- Product Added
- Updated

Do not include internal database IDs in user-facing export files.

5. Backend Updates

Update export generation backend:
- Remove website_id from XLSX output
- Remove product_id/id from XLSX output
- Rename Date Scraped header to Product Added
- Include product added date from correct product created/added field

Update dashboard API:
- Return newProductsThisWeek correctly
- Return scrapingSuccessRate correctly
- Return recentScrapingActivity with added_count and removed_count
- Return latestNewProducts with color and sku

Update website export API:
- Ensure website export endpoint works correctly
- Endpoint should export only products for selected website
- Exclude products where is_deleted is true by default

6. Frontend API/Types Updates

Update TypeScript interfaces if needed:
- Product should include color and sku
- Dashboard stats should include newProductsThisWeek and scrapingSuccessRate
- Recent scraping activity should include added_count and removed_count
- Website export function should return/download XLSX correctly

Update services:
- productService export/download functions
- websiteService exportWebsiteProducts function
- dashboardService stats and activity functions

7. Final Expected Result

After update:

Products page:
- Product card left side shows name, color, SKU
- Product card right side shows View and Link
- Product detail says Product Added instead of Date scraped
- Product table heading says UPDATED instead of SCRAPED

Website page:
- Export button works
- Logs button removed from user view
- Last scrape text changed to Last update

Dashboard:
- New Products This Week works
- Scraping Success Rate works
- Recent scraping activity shows added count and removed count
- Latest new products shows color and SKU

XLSX export:
- Website ID removed
- Product Id removed
- Date Scraped renamed to Product Added
- No internal IDs shown in exported files