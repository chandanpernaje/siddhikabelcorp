export interface Product {
  id: string;
  category: string;
  brand: string;
  partNo: string;
  name: string;
  specs: string[];
  voltage?: string;
  tempRange?: string;
  conductor?: string;
  price: number;
  unit: string;
  stock: string;
  icon: string;
  application: string;
  image?: string;
  hsnCode?: string;
}

export interface CartItem {
  id: string;
  name: string;
  partNo: string;
  brand: string;
  price: number;
  unit: string;
  qty: number;
  hsnCode?: string;
}

export interface OlflexProduct {
  partNo: string;
  name: string;
  core: number;
  pe: string;
  size: number;
  outerDia?: number;
  copperIndex?: number;
  weight?: number;
  price: number;
  gst: number;
  mrp: number;
  category?: string;
  subCategory?: string;
  brand?: string;
  voltage?: string;
  testVoltage?: string;
  standard?: string;
  tempRange?: string;
  desc?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  password?: string;
}

export interface QuotationItem {
  id: string;
  partNo: string;
  name: string;
  brand: string;
  description?: string;
  hsnCode: string;
  unit: string;
  qty: number;
  unitPrice: number;
  totalBeforeTax: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  totalWithTax: number;
}

export interface QuotationDocument {
  id: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  customerName: string;
  companyName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: QuotationItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterstate: boolean;
  freight: number;
  grandTotal: number;
  deliveryTerms: string;
  paymentTerms: string;
  status: 'Draft' | 'Generated' | 'Sent' | 'Approved' | 'RFQ Submitted';
  notes?: string;
}
