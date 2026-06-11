Build a simple admin-only CRM and controlled marketing automation feature for FlooringIntel.

Do not use mock data. Apply this to the real current frontend and backend.

Main goal:
Admin can upload large CSV lead lists, clean and score leads, approve selected leads for outreach, send controlled marketing emails, track opens, and stop outreach automatically when a lead replies, registers, unsubscribes, bounces, or reaches the email limit.

Important strategy:
Do not automatically email all imported leads.

The CRM should treat imported CSV data as a lead database first. Only approved, qualified leads should enter the outreach queue.

---

1. Admin CRM Page

Create a new admin-only page:

/dashboard/admin/crm

Only Admin users can access this page.

If non-admin user tries to access it:

* Redirect to dashboard
* Or show 403 access denied

Add navigation item under Admin menu:

CRM

---

2. CRM Page Frontend Layout

The page should include:

A. Top Summary Cards

Show:

* Total leads
* Qualified leads
* Approved for outreach
* Marketing enabled / disabled
* Emails sent today
* Opened emails
* Replied leads
* Registered leads
* Bounced / failed emails
* Do Not Contact leads

B. Marketing Toggle

At the top right, add a simple button:

If marketing is disabled:
Button text: Enable Marketing

If marketing is enabled:
Button text: Disable Marketing

When clicked:

* Call backend API
* Update global marketing status
* Show success toast

Marketing automation enabled.
Marketing automation disabled.

C. CSV Upload Section

Add CSV upload card.

Title:
Upload Customer CSV

Accepted file:
.csv

CSV columns:

* company_name
* email
* phone
* country
* address
* website_url
* description
* source

Frontend behavior:

* User selects CSV file
* Click Upload
* Show loading state
* Backend imports leads
* Show import result:

  * Total rows
  * Imported rows
  * Skipped duplicate emails
  * Skipped invalid rows
  * Qualified leads created
  * Leads requiring review

Important:
CSV upload should not automatically approve all leads for outreach.

Default:
approved_for_outreach = false

D. Lead Review / Approval Tools

Add controls so Admin can review and approve leads before outreach.

Actions:

* Approve selected leads
* Unapprove selected leads
* Mark selected as Do Not Contact
* Mark selected as Not Interested
* Recalculate lead score

Filters:

* Search by company/email
* Lead score range
* Segment
* Status
* Source
* Approved / Not approved
* Registered
* Opened / Not opened
* Do Not Contact

E. Leads Table

Show CRM leads in a table.

Columns:

* Checkbox
* Lead Score
* Segment
* Company Name
* Email
* Phone
* Country
* Website URL
* Source
* Approved for Outreach
* Marketing Status
* Total Emails Sent
* Report Emails Sent
* Open Count
* First Opened At
* Last Opened At
* Replied
* Registered
* Last Email Sent At
* Next Email At
* Created At
* Actions

Actions:

* View details
* Approve / Unapprove
* Enable / disable lead marketing
* Mark as Not Interested
* Mark as Do Not Contact
* Delete lead optional

Pagination:
Use existing app pagination style.

---

3. Database Models

Create customer_leads table/model.

Fields:

* id
* company_name
* email unique
* phone nullable
* country nullable
* address nullable
* website_url nullable
* description nullable
* source nullable

Qualification fields:

* lead_score number default 0
* lead_segment string nullable
* approved_for_outreach boolean default false
* qualification_status string default imported

Allowed qualification_status values:

* imported
* qualified
* needs_review
* low_priority
* rejected

Suggested lead_segment values:

* flooring_retailer
* carpet_rug_business
* interior_designer
* home_decor_furniture
* manufacturer_distributor
* adjacent
* unknown

Marketing fields:

* marketing_enabled boolean default true
* marketing_status string default imported

Allowed marketing_status values:

* imported
* approved
* not_started
* sample_report_sent
* follow_up_1_sent
* follow_up_2_sent
* engaged_extra_follow_up_sent
* completed
* registered
* replied
* not_interested
* do_not_contact
* unsubscribed
* bounced
* failed

Email counters:

* total_email_count number default 0
* report_email_count number default 0
* open_count number default 0
* max_report_email_count number default 3

Engagement fields:

* email_opened boolean default false
* clicked_report boolean default false
* reply_detected boolean default false
* last_engagement_at nullable
* first_opened_at nullable
* last_opened_at nullable
* last_email_sent_at nullable
* next_email_at nullable

Registration fields:

* registered boolean default false
* registered_user_id nullable
* registered_at nullable

Suppression fields:

* unsubscribe_requested boolean default false
* do_not_contact boolean default false
* bounce_detected boolean default false

Other:

* outreach_batch_id nullable
* last_error nullable
* created_at
* updated_at

Important:
Email must be unique. Duplicate emails from CSV upload must be skipped.

---

4. Lead Scoring

When importing CSV leads, calculate lead_score and lead_segment.

Example scoring:

Add points:

* +30 if company_name or description contains flooring
* +25 if contains carpet
* +25 if contains rug or rugs
* +20 if contains showroom
* +15 if contains interior design
* +15 if contains home decor
* +15 if contains furniture
* +10 if website_url exists
* +10 if email looks like business domain email
* +5 if phone exists

Subtract points:

* -20 if email is generic personal domain like gmail, yahoo, hotmail, outlook
* -20 if company_name is missing
* -30 if description/source appears unrelated
* -50 if email is missing or invalid

Qualification:

* lead_score >= 50: qualified
* lead_score 25 to 49: needs_review
* lead_score < 25: low_priority

Default approval:
approved_for_outreach = false

Admin must approve leads before marketing emails can be sent.

---

5. Email Tracking Models

Create marketing_email_logs table/model.

Fields:

* id
* lead_id
* email
* email_type

Allowed email_type values:

* sample_report
* follow_up_1
* follow_up_2
* engaged_extra_follow_up

Fields:

* tracking_id unique
* subject
* status default sent
* sent_at
* opened boolean default false
* first_opened_at nullable
* last_opened_at nullable
* open_count default 0
* clicked boolean default false
* clicked_at nullable
* error_message nullable
* created_at
* updated_at

Create marketing_email_open_events table/model.

Fields:

* id
* email_log_id
* tracking_id
* lead_id
* opened_at
* ip_address nullable
* user_agent nullable
* referer nullable
* created_at

---

6. Global Marketing Settings

Create CRM marketing settings.

Fields:

* crm_marketing_enabled boolean default false
* crm_daily_new_lead_limit number default 20
* crm_max_daily_new_lead_limit number default 50
* crm_successful_sending_days number default 0
* crm_last_limit_increase_at nullable
* crm_sender_name default FlooringIntel
* crm_sender_email nullable
* crm_report_url nullable
* crm_signup_url nullable

Admin can enable/disable marketing globally from the CRM page.

If disabled:

* Cron should not send marketing emails.
* CRM page should show Marketing Disabled.

---

7. CSV Upload Backend

Create API:

POST /api/admin/crm/import-csv

Admin only.

Request:
multipart/form-data
file: csv

Expected CSV headers:
company_name,email,phone,country,address,website_url,description,source

Behavior:

* Parse CSV
* Validate email
* Trim all values
* Lowercase email
* Skip rows without valid email
* Skip duplicate emails already in DB
* Skip duplicate emails inside same CSV
* Insert valid new leads
* Calculate lead_score
* Assign lead_segment
* Assign qualification_status
* Default approved_for_outreach = false
* Default marketing_enabled = true
* Default marketing_status = imported
* Default max_report_email_count = 3
* Default report_email_count = 0
* Default total_email_count = 0

Response:
{
total_rows,
imported_count,
skipped_duplicate_count,
skipped_invalid_count,
qualified_count,
needs_review_count,
low_priority_count
}

Do not crash if one row is invalid.

---

8. CRM Backend APIs

Create these admin-only endpoints:

GET /api/admin/crm/leads

Query params:

* page
* limit
* search
* status
* segment
* source
* qualification_status
* approved
* registered
* opened
* do_not_contact
* min_score
* max_score

Return paginated leads.

GET /api/admin/crm/leads/:id

Return single lead details and email logs.

PATCH /api/admin/crm/leads/:id

Allow updating:

* company_name
* phone
* country
* address
* website_url
* description
* source
* lead_score
* lead_segment
* qualification_status
* approved_for_outreach
* marketing_enabled
* marketing_status
* max_report_email_count
* do_not_contact
* unsubscribe_requested

POST /api/admin/crm/leads/bulk-approve

Request:
{
lead_ids: []
}

Set:
approved_for_outreach = true
marketing_status = approved

POST /api/admin/crm/leads/bulk-unapprove

Request:
{
lead_ids: []
}

Set:
approved_for_outreach = false

POST /api/admin/crm/leads/bulk-do-not-contact

Request:
{
lead_ids: []
}

Set:
do_not_contact = true
marketing_enabled = false
marketing_status = do_not_contact
next_email_at = null

DELETE /api/admin/crm/leads/:id

Optional. Admin only.

GET /api/admin/crm/settings

Return CRM marketing settings.

PATCH /api/admin/crm/settings

Update CRM marketing settings.

---

9. Marketing Automation Cron

Create a cron job that runs every day.

Recommended time:
10:00 AM server/app timezone.

Cron behavior:

1. Check global crm_marketing_enabled.
2. If false, stop.
3. Process scheduled follow-ups first.
4. Process new approved leads second.
5. Update DB after each send.
6. Log daily send summary.

Eligibility rules:

* lead.marketing_enabled = true
* lead.approved_for_outreach = true
* lead.registered = false
* lead.do_not_contact = false
* lead.unsubscribe_requested = false
* lead.bounce_detected = false
* lead.marketing_status is not completed, registered, replied, not_interested, do_not_contact, unsubscribed, bounced, failed
* valid email exists

---

10. Daily Sending Volume

Do not email all imported leads.

Start small.

Default:
crm_daily_new_lead_limit = 20

Smooth increase logic:

* Start with 20 new leads per day
* After every 3 successful sending days, increase by 10
* Max daily new lead limit = 50
* If failure/bounce rate is high, do not increase
* Admin can manually lower the limit

Important:
Daily new lead limit only controls new sample report emails.

Scheduled follow-ups should still send even if daily new lead limit is reached.

---

11. Updated Email Sequence

Do not use this old flow:
initial greeting email, then 5 minutes later report email, then repeated reports.

Use this safer report-first flow:

Email 1:
Sample report email

Send immediately when approved lead is selected by cron.

After sending:

* marketing_status = sample_report_sent
* total_email_count += 1
* report_email_count += 1
* last_email_sent_at = now
* next_email_at = now + 3 days

Email 2:
Follow Up 1

Send after 3 days if:

* no reply
* not registered
* not unsubscribed
* not do_not_contact

After sending:

* marketing_status = follow_up_1_sent
* total_email_count += 1
* last_email_sent_at = now
* next_email_at = now + 5 days

Email 3:
Follow Up 2

Send after 5 days if:

* no reply
* not registered
* not unsubscribed
* not do_not_contact

After sending:

* marketing_status = follow_up_2_sent
* total_email_count += 1
* last_email_sent_at = now

Then:

* If no opens and no clicks, mark completed and stop.
* If opened or clicked, allow one extra soft follow-up after 7 days.
* If not opened, stop after Email 3.

Optional Email 4:
Engaged Extra Follow Up

Only send if:

* email_opened = true or clicked_report = true
* no reply
* not registered
* not unsubscribed
* total_email_count < 4

After sending:

* marketing_status = engaged_extra_follow_up_sent
* total_email_count += 1
* last_email_sent_at = now
* next_email_at = null
* marketing_status = completed

Hard limits:

* Default max total marketing emails per lead = 4
* Default max report emails per lead = 1 to 3 depending on engagement
* Absolute max report_email_count = 5
* Never send more than 5 report emails to one lead

---

12. Cron Should Handle Both New Leads And Scheduled Follow-Ups

Every cron run should process:

A. Scheduled follow-ups first:

* next_email_at <= now
* approved_for_outreach = true
* stop conditions not met

B. New approved leads second:

* marketing_status = approved or not_started
* approved_for_outreach = true
* limited by crm_daily_new_lead_limit

Priority for new leads:

1. lead_score highest first
2. flooring/carpet/rug/showroom segment first
3. has company name
4. has website
5. valid business email

---

13. Email Templates

Create backend email template functions.

A. Sample Report Email

Subject:
Sample FlooringIntel product-change report

Body:
Hi {{companyNameOrName}},

I prepared a sample FlooringIntel product-change report using real flooring catalog data.

FlooringIntel helps flooring, carpet, rug, and home product businesses track supplier catalog changes without manually checking websites.

The report shows:

* New products
* Removed products
* Updated product information
* Supplier catalog activity

You can view the sample report here:
{{reportLink}}

If this kind of weekly product-change report would be useful for your team, you can create an account here:
{{signupLink}}

Best,
{{senderName}}

Opt-out line:
If you do not want to receive these sample reports, reply “unsubscribe” and I’ll stop sending them.

B. Follow Up 1

Subject:
Was the sample FlooringIntel report useful?

Body:
Hi {{companyNameOrName}},

Just wanted to follow up and see if the sample FlooringIntel report was useful.

The goal is simple: help flooring, rug, carpet, and home product teams stay updated on supplier catalog changes without manually checking multiple websites.

Would you want to monitor any specific supplier, carpet, or rug brands?

Best,
{{senderName}}

Opt-out line:
If you do not want to receive these messages, reply “unsubscribe” and I’ll stop sending them.

C. Follow Up 2

Subject:
How do you track supplier product updates today?

Body:
Hi {{companyNameOrName}},

Last quick follow-up.

Are you currently checking supplier websites manually for new or removed products, or does your team handle product updates another way?

That is the workflow FlooringIntel is designed to simplify with product tracking, weekly reports, and clean exports.

Best,
{{senderName}}

Opt-out line:
If you do not want to receive these messages, reply “unsubscribe” and I’ll stop sending them.

D. Engaged Extra Follow Up

Subject:
Should I stop sending these reports?

Body:
Hi {{companyNameOrName}},

I noticed there may have been some interest in the FlooringIntel sample report.

Should I stop sending these, or would it be useful to see how FlooringIntel could track the supplier websites your team cares about?

Best,
{{senderName}}

Opt-out line:
If you do not want to receive these messages, reply “unsubscribe” and I’ll stop sending them.

---

14. Report Data

For report emails:

* Use real FlooringIntel product data.
* Do not use mock data.
* Use existing product change/report logic if available.
* Prefer sending a report link instead of huge product lists.
* If a report page exists, include report link.
* If not, include a short summary.

Recommended summary:

* New product count
* Removed product count
* Top websites with changes
* Link to sample report/signup

Do not include huge product lists directly in email.

---

15. Email Open Tracking

Add tracking pixel to marketing emails.

When sending each marketing email:

1. Create marketing_email_log record.
2. Generate tracking_id.
3. Add tracking pixel to email HTML.
4. Send email.
5. Save sent status.

Tracking pixel:

<img src="{{APP_URL}}/api/marketing-email/open/{{trackingId}}.png" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />

Create endpoint:

GET /api/marketing-email/open/:trackingId.png

Behavior:

* Find email log by tracking_id.
* If found:

  * opened = true
  * open_count += 1
  * first_opened_at = now if empty
  * last_opened_at = now
  * Update related customer_lead:

    * email_opened = true
    * open_count += 1
    * first_opened_at = now if empty
    * last_opened_at = now
    * last_engagement_at = now
  * Create marketing_email_open_event
* Always return transparent 1x1 PNG.
* Never return JSON.
* If tracking ID is invalid, still return transparent PNG.

Headers:

* Content-Type: image/png
* Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
* Pragma: no-cache
* Expires: 0

Important:
Open tracking is not perfect because some email clients block or proxy images. Treat it as a signal, not exact truth.

---

16. Click Tracking Optional But Recommended

For report links and signup links, use redirect tracking.

Example:
https://app.flooringintel.com/api/marketing-email/click/{{trackingId}}?url={{encodedUrl}}

Behavior:

* Record clicked = true on email log
* Record clicked_report = true on lead
* Set last_engagement_at = now
* Redirect to final URL

Do not expose raw customer IDs in public URLs.

Use tracking_id only.

---

17. Registration Matching

When a new user registers:

After user is created:

* Check customer_leads by email.
* Email comparison should be lowercase.
* If matching lead exists:

  * registered = true
  * registered_user_id = new user id
  * registered_at = now
  * marketing_status = registered
  * marketing_enabled = false
  * approved_for_outreach = false
  * next_email_at = null

This prevents marketing emails from continuing after registration.

Also show this in CRM table.

---

18. Reply / Unsubscribe Handling

For first version, make reply/unsubscribe manually manageable.

Admin can mark:

* Replied
* Not Interested
* Do Not Contact
* Unsubscribed

When marked:

* marketing_enabled = false
* next_email_at = null
* stop all future emails

Future improvement:
Connect Gmail reply detection and unsubscribe detection.

For now:
Every marketing email should say:
If you do not want to receive these messages, reply “unsubscribe” and I’ll stop sending them.

---

19. Email Sending Failure Handling

If email send fails:

* Save email log status = failed
* Save error_message
* Update lead last_error
* Do not increment sent counters if email failed
* Do not move to next step if email failed

If email bounces are detectable:

* marketing_status = bounced
* bounce_detected = true
* marketing_enabled = false
* next_email_at = null

If bounce detection is not available yet:

* Keep bounced status manually editable from CRM page.

---

20. Frontend Lead Details

Lead detail modal/page should show:

Lead info:

* company
* email
* phone
* website
* source
* description
* segment
* lead score

Marketing info:

* qualification status
* approved for outreach
* marketing status
* marketing enabled
* report email count
* total email count
* open count
* first opened
* last opened
* last engagement
* last sent
* next email
* registered

Email logs:

* email type
* subject
* sent at
* opened
* clicked
* open count
* first opened
* last opened
* status
* error

Actions:

* Approve / unapprove outreach
* Enable / disable marketing
* Mark replied
* Mark not interested
* Mark do not contact
* Mark bounced
* Reset marketing optional
* Send test email optional

---

21. Compliance / Safety

Do not send marketing emails to:

* unapproved leads
* registered users
* replied leads
* not interested leads
* do not contact leads
* unsubscribed leads
* bounced leads
* leads with marketing_enabled = false
* leads that reached max email count

Marketing emails should include:

* clear sender identity
* opt-out line
* business/product context
* no misleading subject lines

Use conservative sending limits.

For Gmail:

* Start with 20 emails/day
* Increase slowly
* Do not blast thousands of emails
* Stop if bounce rate or negative replies increase

---

22. Final Expected Result

After implementation:

* Admin has CRM page.
* Admin can upload CSV customer leads.
* Duplicate emails are skipped.
* Leads are scored and segmented.
* Imported leads are not automatically emailed.
* Admin can approve selected leads for outreach.
* Admin can enable/disable marketing globally.
* Cron runs daily and sends only to approved qualified leads.
* System starts with a conservative daily limit and increases slowly.
* Email sequence is report-first, not greeting-first.
* Follow-ups stop quickly if there is no engagement.
* Engaged leads can receive one extra follow-up.
* Each lead has hard email/report limits.
* Email tracking pixel records open status.
* Optional click tracking records report/signup interest.
* Lead status is updated in DB.
* If a lead registers with the same email, CRM marks them registered and stops marketing.
* Admin can view lead status, qualification, engagement, and email logs.
