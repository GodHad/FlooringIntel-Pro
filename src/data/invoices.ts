export type PaymentType = "Stripe";
export type InvoiceStatus = "Pending Stripe Checkout" | "Paid" | "Completed" | "Failed" | "Cancelled" | "Refunded";

export interface InvoiceItem {
  websiteId: string;
  websiteName: string;
  websiteDomain?: string;
  planName: string;
  billingCycle: "trial" | "monthly" | "yearly" | "custom";
  price: number;
  currency: string;
  activationStatus: "Pending" | "Active" | "Rejected";
}

export interface InvoiceLineItem {
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: string;
  type?: "plan" | "extra_websites" | "selected_websites";
}

export interface AdminInvoiceNote {
  id: string;
  invoiceId: string;
  adminId?: string;
  adminName?: string;
  action: "VALIDATING" | "COMPLETED" | "REJECTED";
  note: string;
  createdAt: string;
}

export interface SellerBillingInfo {
  companyName?: string;
  billingEmail?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  invoiceFooterNote?: string;
}

export interface PaymentInstructions {
  method?: string;
  label?: string;
  value?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  billTo: {
    fullName: string;
    company?: string;
    email: string;
    address?: string;
  };
  paymentType: PaymentType;
  subscription: {
    websiteId?: string;
    planId?: string;
    planSlug?: string;
    planName: string;
    planType: "trial" | "monthly" | "yearly" | "custom";
    features: string[];
  };
  plan?: {
    id: string;
    slug: string;
    name: string;
    billingCycle: "trial" | "monthly" | "yearly" | "custom";
    features: string[];
  } | null;
  items?: InvoiceItem[];
  lineItems?: InvoiceLineItem[];
  pricingSummary?: {
    planName: string;
    billingCycle: "monthly" | "annual";
    billingCycleLabel: string;
    billingUnit: "month" | "year";
    includedSiteCount: number;
    selectedWebsiteCount: number;
    websiteCapacity: number;
    extraSiteCount: number;
    extraSitePriceMonthly: number;
    extraSiteUnitPrice: number;
    extraSiteSubtotal: number;
    basePrice: number;
    subtotal: number;
    finalTotal: number;
    currency: string;
  };
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  total?: number;
  price: number;
  currency: string;
  note?: string;
  userNote?: string;
  adminNotes?: AdminInvoiceNote[];
  sellerBillingInfo?: SellerBillingInfo;
  paymentInstructions?: PaymentInstructions;
  paymentProvider?: string;
  stripeCheckoutSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  stripeStatus?: string;
  selectedSiteCount?: number;
  includedSiteCount?: number;
  extraSites?: number;
  extraSitePriceMonthly?: number;
  basePrice?: number;
  extraSiteAmount?: number;
  paidAt?: string;
  status: InvoiceStatus;
  paidMarkedAt?: string;
  validatingAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const invoices: Invoice[] = [];
