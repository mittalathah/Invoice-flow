export type Role = 'owner' | 'accountant' | 'vendor';
export type InvoiceStatus = 'pending' | 'partial' | 'paid';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type InvoiceType = 'sales' | 'purchase';

export interface Permissions {
  can_manage_clients: boolean;
  can_delete_invoices: boolean;
  can_send_reminders: boolean;
  can_view_payments: boolean;
  can_record_payments: boolean;
  can_edit_invoices: boolean;
  can_view_dashboard: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  is_approved: boolean;
  permissions?: Permissions;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  total_due: number;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  client_id?: string;
  client_name?: string; // For sales
  vendor_name?: string; // For purchase
  issue_date: string;
  due_date?: string;
  items?: LineItem[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  approval_status: ApprovalStatus;
  notes?: string;
  uploaded_by: string; // User ID
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

export interface DashboardStats {
  total_sales: number;
  total_purchases: number;
  total_due: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_clients: number;
}