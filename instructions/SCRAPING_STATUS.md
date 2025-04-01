Update the Scraping Status page and related backend APIs.

Do not use mock data. Apply this to the real current app.

Page:
`/dashboard/scraping-status`

Main goals:
1. Fix scraping logs modal overflow.
2. Show all available sites with their scraper/site status.
3. For admin only, add Scrape Now button per site.
4. Below the site list, show scraping request logs.

---

1. Fix Scraping Logs Modal

Current bug:
The scraping logs modal is showing all logs related to the site, but the logs card overflows outside the modal.

Fix:
- Make the modal content scrollable.
- Set max height for the modal body.
- Logs list/card should stay inside the modal.
- Long log messages should wrap properly.
- Add vertical scroll inside the modal if there are many logs.
- Do not let logs overflow outside the screen.

Recommended UI:
- Modal max height: 80vh
- Logs container: overflow-y-auto
- Long text: break-words / whitespace-pre-wrap

---

2. Show All Available Sites And Status

On Scraping Status page, show all available sites.

Use the Site model status field.

Site model already has:
- status: Active

Show site list/table with columns:
- Site name
- Domain
- Status
- Last update
- Last scraping request status
- Last scraping time
- Actions

Status badge:
- If site.status is Active, show Active badge.
- If other statuses exist, show them with proper badge styling.

This page should show all available sites, not only sites with recent scraping logs.

---

3. Admin Only Scrape Now Button

For admin users only, add Scrape Now button for each site.

Button:
Scrape Now

Behavior:
- Visible only to admin.
- Hidden for normal users and partners if they should not trigger scraping.
- When admin clicks Scrape Now, call backend API to create/send scraping request for that site.
- Show loading state while request is being sent.
- Disable button while request is pending.
- Show success toast:
  Scraping request sent.
- Show error toast if request fails.

Backend endpoint:

POST /api/admin/scraping-requests

Request body:
{
  siteId
}

Backend behavior:
- Admin only.
- Validate site exists.
- Create scraping request record.
- Trigger scraping job or queue.
- Return created scraping request.

If existing scraping request API already exists, use that instead of creating a duplicate endpoint.

---

4. Scraping Request Logs Section

Below the site list, add a scraping request logs section.

Section title:
Scraping Request Logs

Show table/list:
- Request ID
- Site name
- Requested by
- Status
- Started at
- Finished at
- Added count
- Removed count
- Error message if failed
- Actions

Actions:
- View Logs

View Logs should open the fixed scraping logs modal.

Request statuses:
- Pending
- Running
- Completed
- Failed

Show newest requests first.

Add filters if simple:
- Status filter
- Site filter

---

5. Backend API Updates

Add or update APIs:

GET /api/scraping-status/sites

Return all available sites with:
- id
- name
- domain
- status
- lastScrapeAt
- lastRequestStatus
- lastRequestId

GET /api/scraping-requests

Return scraping request logs:
- id
- siteId
- siteName
- requestedBy
- status
- startedAt
- finishedAt
- addedCount
- removedCount
- errorMessage
- createdAt

GET /api/scraping-requests/:id/logs

Return logs for one scraping request.

Important:
The logs modal should show logs for the selected scraping request if opened from request logs.

If opened from site row, show recent logs for that site, but keep the modal scrollable.

POST /api/admin/scraping-requests

Admin only.
Create and trigger scraping request for selected site.

---

6. Frontend Behavior

Scraping Status page layout:

Top:
Page title:
Scraping Status

Subtitle:
Monitor available sites, scraper status, and recent scraping requests.

First section:
Available Sites

Second section:
Scraping Request Logs

For normal users:
- Show site list and request logs if allowed.
- Do not show Scrape Now button.

For admin users:
- Show Scrape Now button per site.
- Show full request logs.

---

7. Final Expected Result

After update:

- Scraping logs modal no longer overflows.
- Logs are scrollable inside the modal.
- Scraping Status page shows all available sites.
- Site status uses Site model status field such as Active.
- Admin users can click Scrape Now to send a scraping request.
- Normal users cannot see Scrape Now.
- Scraping request logs are shown below the site list.
- View Logs opens a clean scrollable modal.