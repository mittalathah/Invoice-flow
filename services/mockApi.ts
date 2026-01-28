
import { User, Client, Invoice, Payment, DashboardStats, Role } from '../types';

// --- WHATSAPP CONFIGURATION (For actual connection) ---
// To use the real Cloud API, you need these from developers.facebook.com
const WHATSAPP_ACCESS_TOKEN = 'YOUR_META_ACCESS_TOKEN'; 
const WHATSAPP_PHONE_NUMBER_ID = 'YOUR_PHONE_NUMBER_ID';
const API_VERSION = 'v17.0';

const MOCK_USERS: User[] = [
  { id: 'u1', email: 'owner@invoiceflow.com', name: 'Jane Owner', role: 'owner', is_approved: true },
  { id: 'u2', email: 'acc@invoiceflow.com', name: 'John Accountant', role: 'accountant', is_approved: true, permissions: { can_manage_clients: true, can_delete_invoices: false, can_send_reminders: true, can_view_payments: true, can_record_payments: true, can_edit_invoices: true, can_view_dashboard: true } },
  { id: 'u3', email: 'vendor@supplies.com', name: 'Vendor Supplies Co', role: 'vendor', is_approved: true }
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'billing@acme.com', phone: '919876543210', total_due: 15000 },
  { id: 'c2', name: 'Globex Inc', email: 'accounts@globex.com', phone: '919123456789', total_due: 0 },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', invoice_number: 'SI0001', invoice_type: 'sales', client_id: 'c1', client_name: 'Acme Corp', issue_date: '2023-10-01', due_date: '2023-10-31', items: [{ description: 'Consulting Services', quantity: 10, unit_price: 1500, amount: 15000 }], subtotal: 15000, tax_rate: 0, tax_amount: 0, total_amount: 15000, paid_amount: 0, status: 'pending', approval_status: 'approved', uploaded_by: 'u1', created_at: '2023-10-01T10:00:00Z' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiService {
  private users: User[] = MOCK_USERS;
  private clients: Client[] = MOCK_CLIENTS;
  private invoices: Invoice[] = MOCK_INVOICES;
  private payments: Payment[] = [];

  async login(email: string): Promise<User | null> {
    await delay(500);
    return this.users.find(u => u.email === email) || null;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);
    return { total_sales: 15000, total_purchases: 5000, total_due: 15000, pending_invoices: 1, overdue_invoices: 0, total_clients: 2 };
  }

  async getClients(): Promise<Client[]> {
    await delay(300);
    return [...this.clients];
  }

  async getClientById(id: string): Promise<Client | undefined> {
    await delay(200);
    return this.clients.find(c => c.id === id);
  }

  async getInvoices(type?: 'sales' | 'purchase', clientId?: string): Promise<Invoice[]> {
    await delay(300);
    let filtered = this.invoices;
    if (type) filtered = filtered.filter(i => i.invoice_type === type);
    if (clientId) filtered = filtered.filter(i => i.client_id === clientId);
    return [...filtered];
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    await delay(200);
    return this.invoices.find(i => i.id === id);
  }

  async getUsers(): Promise<User[]> {
    await delay(300);
    return [...this.users];
  }

  async getPayments(invoiceId?: string): Promise<Payment[]> {
    await delay(300);
    return [];
  }

  // Fix: Added createInvoice method to handle invoice creation
  async createInvoice(invoice: Partial<Invoice>, role: Role): Promise<Invoice> {
    await delay(500);
    const newInvoice: Invoice = {
      id: `inv${Math.floor(Math.random() * 10000)}`,
      invoice_number: invoice.invoice_number || 'INV-000',
      invoice_type: invoice.invoice_type || 'sales',
      client_id: invoice.client_id,
      client_name: invoice.client_name,
      vendor_name: invoice.vendor_name,
      issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
      due_date: invoice.due_date,
      items: invoice.items,
      subtotal: invoice.subtotal || 0,
      tax_rate: invoice.tax_rate || 0,
      tax_amount: invoice.tax_amount || 0,
      total_amount: invoice.total_amount || 0,
      paid_amount: 0,
      status: 'pending',
      approval_status: role === 'owner' ? 'approved' : 'pending',
      uploaded_by: invoice.uploaded_by || '',
      created_at: new Date().toISOString(),
    };
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  // Fix: Added approveInvoice method to handle invoice approvals
  async approveInvoice(id: string): Promise<boolean> {
    await delay(300);
    const index = this.invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      this.invoices[index] = { ...this.invoices[index], approval_status: 'approved' };
      return true;
    }
    return false;
  }

  /**
   * ACTUAL WHATSAPP API CONNECTION
   * Option A: Meta Cloud API (Automated, requires setup)
   * Option B: wa.me Deep Linking (Instant, free, requires user to hit 'send')
   */
  async sendWhatsAppReminder(targetId: string, type: 'invoice' | 'client'): Promise<{ success: boolean; message: string; method: 'api' | 'link' }> {
    const isInvoice = type === 'invoice';
    const invoice = isInvoice ? this.invoices.find(i => i.id === targetId) : null;
    const client = isInvoice ? this.clients.find(c => c.id === invoice?.client_id) : this.clients.find(c => c.id === targetId);

    if (!client) throw new Error("Client or Phone number not found");

    // Clean phone number (remove +, spaces, etc)
    const phone = client.phone.replace(/\D/g, '');
    let text = '';

    if (isInvoice && invoice) {
      text = `Hello ${client.name}, this is a reminder for Invoice ${invoice.invoice_number} of ₹${invoice.total_amount.toLocaleString()}. Due Date: ${new Date(invoice.due_date!).toLocaleDateString()}. Please process the payment at your earliest convenience.`;
    } else {
      text = `Hello ${client.name}, you have an outstanding balance of ₹${client.total_due.toLocaleString()} with InvoiceFlow. Please check your dashboard for details.`;
    }

    // --- OPTION 1: Meta Cloud API (Example structure) ---
    /*
    try {
      const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: text }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return { success: true, message: "Sent via Cloud API", method: 'api' };
    } catch (err) {
      console.error("Cloud API failed, falling back to deep link", err);
    }
    */

    // --- OPTION 2: wa.me Link (Used as active method for this demo) ---
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    
    // In a browser environment, we open the window
    window.open(whatsappUrl, '_blank');

    return { 
      success: true, 
      message: `Opened WhatsApp Chat with ${client.name}`,
      method: 'link'
    };
  }
}

export const mockApi = new MockApiService();
