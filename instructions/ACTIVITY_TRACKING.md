Update both frontend and backend to add user activity tracking only.

Do not use mock data. Apply this to the real current app.

Important:
Do not track scraping activity.
Do not track product activity.
Do not track products added/removed.
Do not track scraping started/completed/failed.

Track only user, admin, account, billing, subscription, export, alert, and website request activities.

Backend:

Create activity_logs table/model:

Fields:
- id
- user_id nullable
- actor_type: user, admin, system
- action
- entity_type nullable
- entity_id nullable
- message
- metadata JSON nullable
- ip_address nullable
- user_agent nullable
- created_at
- updated_at

Track these activities:
- User registered
- User logged in
- User logged out
- User completed profile
- User updated profile
- User selected plan
- User generated invoice
- Invoice email sent
- User downloaded invoice
- User marked manual invoice as paid
- User started PayPal subscription checkout
- User completed PayPal subscription approval
- User selected manual PayPal payment
- Admin changed invoice status
- Admin marked invoice as validating
- Admin completed invoice
- Admin rejected invoice
- Subscription activated
- Subscription cancelled
- User downloaded products
- User exported website products
- User enabled email alerts
- User disabled email alerts
- User requested new website scraping
- User updated notification preferences

Create helper service:

activityService.log({
  userId,
  actorType,
  action,
  entityType,
  entityId,
  message,
  metadata,
  req
})

The helper should automatically capture:
- ip_address from request
- user_agent from request
- created_at timestamp

Frontend:

Add admin Activity page:

Route:
`/dashboard/admin/activity`

Admin can see all user/admin account and billing activity.

Admin activity table:
- Time
- User
- Actor type
- Action
- Message
- Entity
- Metadata preview

Admin filters:
- User
- Actor type
- Action
- Date range
- Entity type

Backend API endpoints:

GET /api/admin/activity
- Admin only
- Returns all activity logs
- Newest first
- Supports filters:
  - user_id
  - actor_type
  - action
  - entity_type
  - date_from
  - date_to

Security:
- Admin can see all activity.
- Partner access should follow existing role rules.

UI:
- Show loading state.
- Show empty state:
  No activity yet.
- Show readable activity messages.
- Use badges for actor type and entity type.
- Keep design consistent with current dashboard.

Final expected result:
- App tracks user/admin account and billing activity only.
- Activity logs are stored in database.
- Only admin can view all activity.
- Scraping/product system events are not included in activity logs.