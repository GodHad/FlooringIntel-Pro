import type { AdminInvoiceNote, Invoice, InvoiceItem, InvoiceStatus, PaymentType } from "@/data/invoices";
import { post, rawRequest, request } from "@/services/api";

export type CreateInvoiceInput = {
  userId?: string;
  userName: string;
  userEmail: string;
  billTo: Invoice["billTo"];
  paymentType: PaymentType;
  subscription: Invoice["subscription"];
  items?: InvoiceItem[];
  subtotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  total?: number;
  price: number;
  currency?: string;
  note?: string;
  userNote?: string;
};

export type AdminInvoiceFilters = {
  status?: string;
  paymentType?: string;
  q?: string;
  userId?: string;
};

const toQueryString = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== "all") query.set(key, value);
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};

export const invoiceService = {
  getInvoices: (userId?: string): Promise<Invoice[]> =>
    request<Invoice[]>(`/invoices${toQueryString({ userId })}`),

  getAdminInvoices: (filters: AdminInvoiceFilters = {}): Promise<Invoice[]> =>
    request<Invoice[]>(`/admin/invoices${toQueryString(filters)}`),

  getInvoiceById: (id: string): Promise<Invoice | undefined> =>
    request<Invoice>(`/invoices/${id}`),

  createInvoice: (data: CreateInvoiceInput): Promise<Invoice> =>
    post<Invoice>("/invoices", {
      billTo: data.billTo,
      paymentType: data.paymentType,
      subscription: data.subscription,
      items: data.items,
      subtotal: data.subtotal,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      total: data.total,
      price: data.price,
      currency: data.currency ?? "USD",
      note: data.userNote ?? data.note,
      userNote: data.userNote ?? data.note,
    }),

  getInvoiceNotes: (id: string): Promise<AdminInvoiceNote[]> =>
    invoiceService.getInvoiceById(id).then((invoice) => invoice?.adminNotes ?? []),

  downloadInvoice: (id: string): Promise<Blob> =>
    rawRequest(`/invoices/${id}/download`).then((response) => response.blob()),
};

export type { Invoice, InvoiceStatus, PaymentType };
