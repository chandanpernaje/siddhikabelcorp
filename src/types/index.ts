export interface Product {
  id: string;
  category: string;
  categoryName?: string;
  brand: string;
  brandName?: string;
  partNo: string;
  name: string;
  specs: string[];
  core?: string | number;
  coreSize?: string;
  sqmm?: string;
  size?: number;
  colour?: string;
  uom?: string;
  outerDiameter?: string;
  weight?: string;
  copperIndex?: string;
  testVoltage?: string;
  flameRetardancy?: string;
  voltage?: string;
  tempRange?: string;
  conductor?: string;
  price: number;
  mrp?: number;
  gst?: number;
  unit: string;
  stock: string;
  icon: string;
  application: string;
  image?: string;
  imageUrl?: string;
  datasheetUrl?: string;
  validFrom?: string;
  expiryDate?: string;
  categoryDatasheetUrl?: string;
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
  core?: string | number;
  coreSize?: string;
  sqmm?: string;
  uom?: string;
  weight?: string;
  outerDiameter?: string;
}

export interface OlflexProduct {
  partNo: string;
  name: string;
  core: number;
  pe: string;
  size: number;
  sqmm?: string;
  colour?: string;
  uom?: string;
  outerDia?: number;
  copperIndex?: number;
  weight?: number;
  price: number;
  gst: number;
  mrp?: number;
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
  uom?: string;
  core?: string | number;
  coreSize?: string;
  sqmm?: string;
  weight?: string;
  outerDiameter?: string;
  validity?: string;
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
  validityDays?: number;
  customerName: string;
  companyName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  billingAddress?: string;
  deliveryAddress?: string;
  deliveryLocation?: string;
  specialInstructions?: string;
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
  status: 'Pending' | 'Under Review' | 'PO Received' | 'Closed' | 'Lost' | 'Expired' | string;
  lostReason?: string;
  lostReasonDetails?: string;
  assignedAt?: string;
  expiredAt?: string;
  expiryComments?: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
}
