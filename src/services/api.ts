import type {
  Product,
  Website,
  ScrapingJob,
  Ticket,
  ExportRecord,
  ScrapingJobList,
} from "@/data/mock";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth, getFirebaseToken, googleProvider } from "@/services/firebase";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
const clearStoredToken = () => undefined;

const firebaseErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/user-not-found": "No account was found for this email.",
  "auth/wrong-password": "The email or password is incorrect.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/weak-password": "Please use a stronger password with at least 6 characters.",
  "auth/popup-closed-by-user": "Google sign in was closed before it finished.",
  "auth/cancelled-popup-request": "Google sign in was cancelled. Please try again.",
  "auth/popup-blocked": "Your browser blocked the Google sign in popup. Please allow popups and try again.",
  "auth/network-request-failed": "Network error. Please check your connection and try again.",
  "auth/requires-recent-login": "Please sign in again before continuing.",
};

const getFirebaseErrorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  return firebaseErrorMessages[code] || (error instanceof Error ? error.message : "Authentication failed. Please try again.");
};

const throwFriendlyFirebaseError = (error: unknown): never => {
  throw new Error(getFirebaseErrorMessage(error));
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await rawRequest(path, options);

  return response.json() as Promise<T>;
}

export async function rawRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getFirebaseToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      await signOut(firebaseAuth).catch(() => undefined);
    }
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? "API request failed");
  }

  return response;
}

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });

const toQueryString = (params: Record<string, string | number | undefined | boolean>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

export type CurrentUser = {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  phone?: string;
  userType?: string;
  profileComplete?: boolean;
  company: string;
  authProvider?: "email" | "google" | "legacy";
  emailVerified?: boolean;
  picture?: string;
  role: "Admin" | "Partner" | "User";
  planType: "Free" | "Pro";
  downloadCountUsed: number;
};

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  website?: string;
  availability?: string;
  addedFrom?: string;
  addedTo?: string;
  sortBy?: "name" | "price" | "dateScraped" | "lastUpdated";
  sortDir?: "asc" | "desc";
  fromDashboard?: boolean;
};

export type PaginatedProducts = {
  data: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  categories: string[];
};

export type ExportDownload = {
  blob: Blob;
  metadata: {
    limited: boolean;
    limit: number | null;
    exportedCount: number | null;
    totalRequested: number | null;
  };
};


export type ExportFieldSetting = {
  fields: string[];
  label: string;
  enabled: boolean;
  order: number;
  width: number;
};

export type ExportFieldSettings = {
  canCustomize: boolean;
  planRequired: string;
  availableFields: ExportFieldSetting[];
  fields: ExportFieldSetting[];
};

const parseExportDownload = async (response: Response): Promise<ExportDownload> => {
  const toNumber = (value: string | null) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    blob: await response.blob(),
    metadata: {
      limited: response.headers.get("X-Export-Limited") === "true",
      limit: toNumber(response.headers.get("X-Export-Limit")),
      exportedCount: toNumber(response.headers.get("X-Export-Count")),
      totalRequested: toNumber(response.headers.get("X-Export-Total-Requested")),
    },
  };
};

export type DiscountRule = {
  minSites: number;
  maxSites: number | null;
  percent: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: "free_trial" | "starter" | "pro" | "business" | string;
  price: number | null;
  description?: string;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  currency: string;
  billingCycle: "trial" | "monthly" | "yearly" | "custom";
  websiteLimit: number | null;
  userLimit: number | null;
  exportLimit: number | null;
  trialDays: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  stripeMonthlyPriceId?: string;
  stripeAnnualPriceId?: string;
  stripeProductId?: string;
};

export type BillingSettings = {
  freeDownloadLimit: number;
  freeTrialDays: number;
  annualPricePerSite?: number;
  discountRules?: DiscountRule[];
  plans: SubscriptionPlan[];
};

export type AdminBillingInfo = {
  companyName: string;
  billingEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  taxId?: string;
  invoiceFooterNote?: string;
};

export type SubscriptionOverview = {
  role: "Admin" | "Partner" | "User";
  planType: string;
  currentSubscription: UserPlanSubscription | null;
  plans: SubscriptionPlan[];
  downloadLimit: number | null;
  downloadCountUsed: number;
  remainingDownloads: number | null;
  trialDurationDays: number;
  annualPricePerSite?: number;
  discountRules?: DiscountRule[];
  unlimitedAccess?: boolean;
  websites: Website[];
  subscriptions: UserPlanSubscription[];
};

export type UserPlanSubscription = {
  id: string;
  plan: SubscriptionPlan | null;
  planId: string;
  planSlug: string;
  planName: string;
  status: "trialing" | "pending_payment" | "pending_checkout" | "active" | "expired" | "cancelled" | "suspended" | "past_due" | "unpaid" | "cancellation_pending";
  billingCycle: "trial" | "monthly" | "yearly" | "custom";
  selectedSiteCount?: number | null;
  includedSiteCount?: number | null;
  extraSites?: number;
  extraSitePriceMonthly?: number;
  basePrice?: number;
  finalPrice?: number;
  startsAt?: string;
  endsAt?: string;
  trialEndsAt?: string;
  invoiceId?: string;
  paymentProvider?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  stripeStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  lastPaymentAt?: string;
  nextBillingAt?: string;
  websites: Array<{
    id: string;
    websiteId: string;
    status: "pending" | "active" | "expired" | "cancelled";
    activatedAt?: string;
    userSubscriptionId: string;
  }>;
};

export type BillingPreview = {
  plan: SubscriptionPlan | null;
  selectedSites: Array<{
    id: string;
    name: string;
    alreadyActive: boolean;
    pending?: boolean;
    billable: boolean;
  }>;
  pricePerSite: number;
  planPrice: number;
  selectedSiteCount: number;
  includedSiteCount: number;
  extraSites: number;
  extraSitePriceMonthly: number;
  extraSiteAmount: number;
  basePrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  finalTotal: number;
  billingCycle: "monthly" | "annual" | "yearly";
  duration: string;
  expirationDate: string | null;
};

export type AdminUserSubscription = {
  id: string;
  websiteId: string;
  websiteName?: string;
  planType: "Free" | "Pro";
  status: "active" | "expired" | "cancelled";
  startDate: string;
  expirationDate: string;
  paymentAmount: number;
  discountAmount: number;
  finalPaidAmount: number;
  downloadLimit: number | null;
  unlimitedDownloads: boolean;
};

export type AdminUserSubscriptionOverview = {
  user: CurrentUser & { createdAt: string; updatedAt: string };
  websites: Array<Pick<Website, "id" | "name"> & { url?: string; enabled?: boolean }>;
  subscriptions: AdminUserSubscription[];
};

export type AdminSubscriptionRecord = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string;
    role: string;
  } | null;
  plan: SubscriptionPlan | null;
  status: "trialing" | "pending_payment" | "active" | "expired" | "cancelled";
  billingCycle: "trial" | "monthly" | "yearly" | "custom";
  startsAt?: string;
  endsAt?: string;
  trialEndsAt?: string;
  invoiceId?: string;
  websites: Array<{
    websiteId: string;
    status: "pending" | "active" | "expired" | "cancelled";
    activatedAt?: string;
  }>;
};


export type CrmLead = {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  country?: string;
  address?: string;
  website_url?: string;
  description?: string;
  source?: string;
  lead_score: number;
  score_reasons: string[];
  scoreReasons?: string;
  recommended_action?: string;
  email_domain?: string;
  scored_at?: string;
  lead_segment?: string;
  qualification_status: string;
  approved_for_outreach: boolean;
  marketing_enabled: boolean;
  marketing_status: string;
  total_email_count: number;
  report_email_count: number;
  open_count: number;
  max_report_email_count: number;
  email_opened: boolean;
  clicked_report: boolean;
  reply_detected: boolean;
  last_engagement_at?: string;
  first_opened_at?: string;
  last_opened_at?: string;
  last_email_sent_at?: string;
  next_email_at?: string;
  registered: boolean;
  registered_user_id?: string;
  registered_at?: string;
  unsubscribe_requested: boolean;
  do_not_contact: boolean;
  bounce_detected: boolean;
  outreach_batch_id?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmLeadSummary = {
  total_leads: number;
  qualified_leads: number;
  approved_for_outreach: number;
  marketing_enabled: number;
  marketing_disabled: number;
  emails_sent_today: number;
  opened_emails: number;
  replied_leads: number;
  registered_leads: number;
  bounced_failed_leads: number;
  do_not_contact_leads: number;
};

export type CrmLeadParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  segment?: string;
  source?: string;
  qualification_status?: string;
  approved?: boolean | string;
  registered?: boolean | string;
  opened?: boolean | string;
  do_not_contact?: boolean | string;
  min_score?: number;
  max_score?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
};

export type CrmLeadList = {
  data: CrmLead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: CrmLeadSummary;
  options?: {
    qualification_statuses: string[];
    lead_segments: string[];
    marketing_statuses: string[];
  };
};

export type CrmLeadDetail = {
  lead: CrmLead;
  emailLogs: unknown[];
};

export type CrmImportResult = {
  total_rows: number;
  imported_count: number;
  skipped_duplicate_count: number;
  skipped_invalid_count: number;
  qualified_count: number;
  needs_review_count: number;
  low_priority_count: number;
};

export type CrmBulkResult = {
  ok: true;
  matched: number;
  modified: number;
};

export type NotificationType =
  | "invoice_status_changed"
  | "ticket_status_changed"
  | "daily_new_products"
  | "scraping_status_changed"
  | "new_products_found"
  | "admin_note_added";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedType: "invoice" | "ticket" | "product" | "scraping" | null;
  relatedId: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPreferences = {
  id: string;
  userId: string;
  websiteIds: string[];
  emailInvoiceUpdates: boolean;
  emailTicketUpdates: boolean;
  emailDailyNewProducts: boolean;
  emailScrapingUpdates: boolean;
  inAppInvoiceUpdates: boolean;
  inAppTicketUpdates: boolean;
  inAppDailyNewProducts: boolean;
  inAppScrapingUpdates: boolean;
  dailySummaryTime: string;
};

export type PublicWeeklyReport = {
  weekStart: string;
  generatedAt: string;
  stats: {
    newProducts: number;
    removedProducts: number;
    catalogUpdates: number;
    brandsTracked: number;
  };
  rows: Array<{
    websiteId: string;
    websiteName: string;
    newProducts: number;
    removedProducts: number;
    catalogUpdates: number;
    total: number;
    primaryType: "new" | "removed" | "updated";
  }>;
  latestProducts: Array<{
    id: string;
    name: string;
    websiteName: string;
    color: string;
    createdAt: string;
  }>;
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await credential.user.reload();
      if (!credential.user.emailVerified) {
        throw new Error("Please verify your email before continuing.");
      }
      return authService.syncUser({ authProvider: "email" });
    } catch (error) {
      throwFriendlyFirebaseError(error);
    }
  },
  register: async (data: { name: string; company?: string; phone: string; userType: string; email: string; password: string }) => {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.name });
      await sendEmailVerification(credential.user);
      await authService.syncUser({
        name: data.name,
        phone: data.phone,
        userType: data.userType,
        company: data.company,
        authProvider: "email",
      });
      return { user: credential.user };
    } catch (error) {
      throwFriendlyFirebaseError(error);
    }
  },
  loginWithGoogle: async () => {
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      return authService.syncUser({
        name: credential.user.displayName || undefined,
        phone: credential.user.phoneNumber || undefined,
        authProvider: "google",
      });
    } catch (error) {
      throwFriendlyFirebaseError(error);
    }
  },
  resendVerificationEmail: async () => {
    try {
      if (!firebaseAuth.currentUser) throw new Error("Please sign in first");
      await sendEmailVerification(firebaseAuth.currentUser);
      return { ok: true };
    } catch (error) {
      throwFriendlyFirebaseError(error);
    }
  },
  reloadAndSyncUser: async () => {
    if (!firebaseAuth.currentUser) throw new Error("Please sign in first");
    await firebaseAuth.currentUser.reload();
    if (!firebaseAuth.currentUser.emailVerified) {
      throw new Error("Your email is not verified yet.");
    }
    return authService.syncUser({ authProvider: "email" });
  },
  sendPasswordReset: async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      throwFriendlyFirebaseError(error);
    }
  },
  syncUser: (data: { name?: string; phone?: string; userType?: string; company?: string; authProvider: "email" | "google" }) =>
    post<{ user: CurrentUser }>("/auth/sync-user", {
      name: data.name,
      phone: data.phone,
      user_type: data.userType,
      company: data.company,
      auth_provider: data.authProvider,
    }),
  completeProfile: (data: { name: string; phone: string; userType: string }) =>
    post<{ user: CurrentUser }>("/auth/complete-profile", {
      name: data.name,
      phone: data.phone,
      user_type: data.userType,
    }),
  logout: async () => {
    try {
      return await post<{ ok: true }>("/auth/logout");
    } finally {
      await signOut(firebaseAuth).catch(() => undefined);
      clearStoredToken();
    }
  },
  getCurrentUser: () => request<CurrentUser>("/auth/me"),
  getToken: getFirebaseToken,
  isAuthenticated: () => Boolean(firebaseAuth.currentUser),
};

export const productService = {
  getProducts: (params: ProductListParams = {}): Promise<PaginatedProducts> =>
    request(`/products${toQueryString(params)}`),
  getProductById: (id: string): Promise<Product | undefined> => request(`/products/${id}`),
  getProductsByWebsite: (website: string): Promise<Product[]> =>
    request<PaginatedProducts>(`/products${toQueryString({ website })}`).then((result) => result.data),
  downloadProductsExcel: (payload: { ids?: string[]; filters?: ProductListParams }) =>
    rawRequest("/products/export", { method: "POST", body: JSON.stringify(payload) }).then(parseExportDownload),
};

export const websiteService = {
  getWebsites: (params?: { includeDisabled?: boolean }): Promise<Website[]> =>
    request(`/websites${params?.includeDisabled ? "?includeDisabled=true" : ""}`),
  getWebsiteById: (id: string): Promise<Website | undefined> => request(`/websites/${id}`),
  createWebsite: (payload: unknown) => post<Website>("/websites", payload),
  updateWebsite: (id: string, payload: unknown) =>
    request<Website>(`/websites/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  exportWebsiteProducts: (id: string) =>
    productService.downloadProductsExcel({ filters: { website: id } }),
  requestNewWebsite: (payload: unknown) => post<{ ticketId: string }>("/websites/request", payload),
};

export const scrapingService = {
  getScrapingJobs: (): Promise<ScrapingJobList> => request("/scraping-jobs"),
  getScrapingJobById: (id: string): Promise<ScrapingJob | undefined> => request(`/scraping-jobs/${id}`),
  retryScrapingJob: (id: string) => post<{ ok: true }>(`/scraping-jobs/${id}/retry`),
  getScrapingLogs: (id: string): Promise<Array<{ time: string; msg: string }>> =>
    request(`/scraping-jobs/${id}/logs`),
  getScrapingStatusSites: (): Promise<ScrapingStatusSite[]> => request("/scraping-status/sites"),
  getScrapingRequests: (params: { status?: string; siteId?: string } = {}): Promise<ScrapingRequestRecord[]> =>
    request(`/scraping-requests${toQueryString(params)}`),
  getScrapingRequestLogs: (id: string): Promise<Array<{ time: string; msg: string; status?: string }>> =>
    request(`/scraping-requests/${id}/logs`),
  getScrapingSiteLogs: (siteId: string): Promise<Array<{ time: string; msg: string; status?: string }>> =>
    request(`/scraping-status/sites/${siteId}/logs`),
  createScrapingRequest: (siteId: string) => post<{ ok: true; message: string; siteId: string }>("/admin/scraping-requests", { siteId }),
};

export type ScrapingStatusSite = {
  id: string;
  name: string;
  domain: string;
  status: string;
  lastUpdate?: string;
  lastScrapeAt?: string | null;
  lastRequestStatus?: string | null;
  lastRequestId?: string | null;
};

export type ScrapingRequestRecord = {
  id: string;
  requestId: string;
  siteId: string;
  siteName: string;
  requestedBy: string;
  status: "Pending" | "Running" | "Completed" | "Failed" | string;
  startedAt: string;
  finishedAt?: string | null;
  addedCount: number;
  removedCount: number;
  addedUrls?: number;
  removedUrls?: number;
  errorMessage?: string;
  createdAt: string;
};

export const ticketService = {
  getTickets: (): Promise<Ticket[]> => request("/tickets"),
  createTicket: (payload: unknown) => {
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      return request<{ id: string }>("/tickets", { method: "POST", body: payload });
    }

    return post<{ id: string }>("/tickets", payload);
  },
  getTicketById: (id: string): Promise<Ticket | undefined> => request(`/tickets/${id}`),
  updateTicket: (id: string, payload: unknown) =>
    request<{ ok: true }>(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};

export const subscriptionService = {
  getSubscriptions: (): Promise<SubscriptionOverview> => request("/subscriptions"),
  subscribeToWebsite: (id: string) => post<{ ok: true }>(`/subscriptions/${id}`),
  unsubscribeFromWebsite: (id: string) =>
    request<{ ok: true }>(`/subscriptions/${id}`, { method: "DELETE" }),
  addWebsites: (websiteIds: string[]) =>
    post<{ ok: true; addedWebsiteIds: string[] }>("/subscriptions/websites", { websiteIds }),
  updateNotificationPreferences: (prefs: unknown) =>
    request<{ ok: true }>("/subscriptions/preferences", { method: "PUT", body: JSON.stringify(prefs) }),
  getBillingPreview: (planId: string, siteIds: string[], allowUnavailable = false, billingCycle: "monthly" | "annual" = "monthly", selectedSiteCount?: number): Promise<BillingPreview> =>
    request(`/billing/preview${toQueryString({ planId, siteIds: siteIds.join(","), allowUnavailable: allowUnavailable ? "true" : undefined, billingCycle, selectedSiteCount })}`),
  createStripeCheckoutSession: (payload: {
    planId: string;
    billingCycle: "monthly" | "annual";
    selectedSiteCount: number;
    selectedWebsiteIds: string[];
  }) =>
    post<{
      ok: true;
      checkoutUrl: string;
      sessionId: string;
      invoiceId: string;
      invoice: unknown;
    }>("/billing/stripe/create-checkout-session", {
      plan_id: payload.planId,
      billing_cycle: payload.billingCycle,
      selected_site_count: payload.selectedSiteCount,
      selected_website_ids: payload.selectedWebsiteIds,
    }),
  createStripePortalSession: () =>
    post<{ url: string }>("/billing/stripe/create-portal-session"),
  cancelStripeSubscription: () =>
    post<{ ok: true }>("/billing/stripe/cancel-subscription"),
};

export const adminService = {
  getUsers: (): Promise<Array<CurrentUser & { createdAt: string; updatedAt: string }>> => request("/admin/users"),
  getSubscriptions: (): Promise<AdminSubscriptionRecord[]> => request("/admin/subscriptions"),
  updateUser: (id: string, payload: Partial<Pick<CurrentUser, "name" | "company" | "role" | "planType" | "downloadCountUsed">>) =>
    request<CurrentUser & { createdAt: string; updatedAt: string }>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getUserSubscriptions: (id: string): Promise<AdminUserSubscriptionOverview> =>
    request(`/admin/users/${id}/subscriptions`),
  upsertUserSubscription: (id: string, siteId: string, payload: Partial<AdminUserSubscription>) =>
    request<{ ok: true; subscription: AdminUserSubscription }>(`/admin/users/${id}/subscriptions/${siteId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  removeUserSubscription: (id: string, siteId: string) =>
    request<{ ok: true }>(`/admin/users/${id}/subscriptions/${siteId}`, { method: "DELETE" }),
  getBillingSettings: (): Promise<BillingSettings> => request("/billing/settings"),
  updateBillingSettings: (payload: BillingSettings) =>
    request<BillingSettings>("/billing/settings", { method: "PUT", body: JSON.stringify(payload) }),
  getAdminBillingInfo: (): Promise<AdminBillingInfo> => request("/admin/settings/billing"),
  updateAdminBillingInfo: (payload: AdminBillingInfo) =>
    request<AdminBillingInfo>("/admin/settings/billing", { method: "PUT", body: JSON.stringify(payload) }),
};


export const crmService = {
  getLeads: (params: CrmLeadParams = {}): Promise<CrmLeadList> =>
    request("/admin/crm/leads" + toQueryString(params)),
  importCsv: (file: File): Promise<CrmImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    return rawRequest("/admin/crm/import-csv", { method: "POST", body: formData }).then((response) => response.json());
  },
  getLead: (id: string): Promise<CrmLeadDetail> => request("/admin/crm/leads/" + id),
  updateLead: (id: string, payload: Partial<CrmLead>): Promise<CrmLead> =>
    request("/admin/crm/leads/" + id, { method: "PATCH", body: JSON.stringify(payload) }),
  bulkApprove: (lead_ids: string[]): Promise<CrmBulkResult> => post("/admin/crm/leads/bulk-approve", { lead_ids }),
  bulkUnapprove: (lead_ids: string[]): Promise<CrmBulkResult> => post("/admin/crm/leads/bulk-unapprove", { lead_ids }),
  bulkDoNotContact: (lead_ids: string[]): Promise<CrmBulkResult> => post("/admin/crm/leads/bulk-do-not-contact", { lead_ids }),
  bulkNotInterested: (lead_ids: string[]): Promise<CrmBulkResult> => post("/admin/crm/leads/bulk-not-interested", { lead_ids }),
  recalculateScore: (lead_ids: string[]): Promise<CrmBulkResult> => post("/admin/crm/leads/recalculate-score", { lead_ids }),
};

export const downloadService = {
  createExport: (payload: unknown) => post<ExportRecord>("/exports", payload),
  getExportHistory: (): Promise<ExportRecord[]> => request("/exports"),
  getExportFields: (): Promise<ExportFieldSettings> => request("/export-fields"),
  updateExportFields: (fields: ExportFieldSetting[]): Promise<ExportFieldSettings> =>
    request("/export-fields", { method: "PUT", body: JSON.stringify({ fields }) }),
  downloadExportFile: (id: string) => Promise.resolve({ url: getApiUrl(`/exports/${id}/download`) }),
  downloadExportBlob: (id: string) => rawRequest(`/exports/${id}/download`).then(parseExportDownload),
};

export const notificationService = {
  getNotifications: (): Promise<AppNotification[]> => request("/notifications"),
  getUnreadCount: (): Promise<{ count: number }> => request("/notifications/unread-count"),
  markAsRead: (id: string): Promise<AppNotification> =>
    request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllAsRead: () => request<{ ok: true }>("/notifications/read-all", { method: "PUT" }),
  deleteNotification: (id: string) =>
    request<{ ok: true }>(`/notifications/${id}`, { method: "DELETE" }),
  getNotificationPreferences: (): Promise<NotificationPreferences> =>
    request("/notification-preferences"),
  updateNotificationPreferences: (payload: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>("/notification-preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const publicService = {
  getWeeklyReport: (): Promise<PublicWeeklyReport> => request("/public/weekly-report"),
};

export const getApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;

  if (path.startsWith("/uploads/")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_BASE}${path}`;
};


