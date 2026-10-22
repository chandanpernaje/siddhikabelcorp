import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import * as xlsx from 'xlsx';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validateCoreSqmm } from './cableSpecs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup Multer for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// --- MongoDB Connection ---
const mongoURI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/siddhicorp';
mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB!');
    // Safe one-time backfill of sqmm for legacy products
    try {
      await mongoose.connection.collection('products').updateMany(
        { sqmm: { $in: [null, undefined, ''] }, coreSize: { $ne: null } },
        [{ $set: { sqmm: '$coreSize' } }]
      );
      // Migrate legacy "Minak" -> "Mennekes"
      await mongoose.connection.collection('brands').updateMany(
        { name: 'Minak' },
        { $set: { name: 'Mennekes' } }
      );
      await mongoose.connection.collection('categories').updateMany(
        { make: 'Minak' },
        { $set: { make: 'Mennekes' } }
      );
      await mongoose.connection.collection('products').updateMany(
        { brandName: 'Minak' },
        { $set: { brandName: 'Mennekes' } }
      );
      // Permanently remove Solar Cables and migrate any products to Domestic / House Wiring
      await mongoose.connection.collection('products').updateMany(
        { categoryName: { $regex: /^solar cables$/i } },
        { $set: { categoryName: 'Domestic / House Wiring' } }
      );
      await mongoose.connection.collection('categories').deleteMany(
        { name: { $regex: /^solar cables$/i } }
      );
    } catch (e: any) {
      console.warn('sqmm/brand backfill notice:', e?.message);
    }
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));


// --- Mongoose Schemas & Models ---
const productSchema = new mongoose.Schema({
  partNo: { type: String, required: false },
  name: { type: String, required: true },
  description: { type: String, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  categoryName: { type: String, default: null },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
  brandName: { type: String, default: null },
  price: { type: Number, default: null },
  mrp: { type: Number, default: null },
  gst: { type: Number, default: null },
  validFrom: { type: String, default: null },
  expiryDate: { type: String, default: null },
  uom: { type: String, default: 'Meter' },
  colour: { type: String, default: null },
  core: { type: String, default: null },
  coreSize: { type: String, default: null },
  sqmm: { type: String, default: null },
  pe: { type: String, default: null },
  size: { type: Number, default: null },
  outerDiameter: { type: String, default: null },
  copperIndex: { type: String, default: null },
  weight: { type: String, default: null },
  testVoltage: { type: String, default: null },
  flameRetardancy: { type: String, default: null },
  imageUrl: { type: String, default: null },
  datasheetUrl: { type: String, default: null },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  make: { type: String, default: 'LAPP' },
  subGroup: { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  datasheetUrl: { type: String, default: null },
}, { timestamps: true });

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Customer' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  company: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  gstin: { type: String, default: '' },
  isCompanyMaster: { type: Boolean, default: false }
}, { timestamps: true });

const rfqSchema = new mongoose.Schema({
  quoteNo: { type: String, required: true },
  date: String,
  customerName: String,
  companyName: String,
  email: String,
  phone: String,
  address: String,
  billingAddress: { type: String, default: '' },
  deliveryAddress: { type: String, default: '' },
  deliveryLocation: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  city: String,
  state: String,
  pincode: String,
  lostReason: { type: String, default: null },
  lostReasonDetails: { type: String, default: null },
  assignedAt: { type: Date, default: null },
  expiredAt: { type: Date, default: null },
  validityDays: { type: Number, default: 7 },
  validUntil: { type: Date, default: null },
  expiryComments: { type: String, default: '' },
  items: [{
    partNo: String,
    name: String,
    description: String,
    brand: String,
    hsnCode: String,
    unit: String,
    uom: String,
    core: String,
    coreSize: String,
    sqmm: String,
    weight: String,
    outerDiameter: String,
    validity: String,
    qty: Number,
    unitPrice: Number,
    totalBeforeTax: Number,
    gstRate: Number,
    gstAmount: Number,
    totalWithTax: Number
  }],
  subtotal: Number,
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  grandTotal: Number,
  notes: { type: String, default: '' },
  deliveryTerms: { type: String, default: '' },
  paymentTerms: { type: String, default: '' },
  status: { type: String, default: "Pending" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToName: { type: String, default: null }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Brand = mongoose.model('Brand', brandSchema);
const RFQ = mongoose.model('RFQ', rfqSchema);
const User = mongoose.model('User', userSchema);

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['rfq', 'customer', 'system'], default: 'rfq' },
  referenceId: { type: String, default: null },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

const customCuttingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  requirement: { type: String, required: true },
  productName: { type: String, default: null },
  partNo: { type: String, default: null },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const CustomCutting = mongoose.model('CustomCutting', customCuttingSchema);

// Configure Email Transporter
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});


// --- Auth Middleware ---
const JWT_SECRET = process.env.JWT_SECRET || 'siddhi-super-secret-key-2026';

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Require Admin Authentication Token' });
  }
  verifyToken(req, res, () => {
    const role = (req.userRole || '').toLowerCase().trim();
    if (!role.includes('admin')) {
      return res.status(403).json({ error: 'Require Admin Role' });
    }
    next();
  });
};

const verifyManagerOrAdmin = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Require Authentication Token' });
  }
  verifyToken(req, res, () => {
    const role = (req.userRole || '').toLowerCase().trim();
    if (!role.includes('admin') && !role.includes('manager')) {
      return res.status(403).json({ error: 'Require Admin or Sales Manager Role' });
    }
    next();
  });
};

// Check if role belongs to customer
const isCustomerRole = (role?: string) => {
  const r = (role || '').toLowerCase().trim();
  return !r || r === 'customer' || r === 'website customer' || r === 'corporate customer' || r === 'client';
};

// --- API Routes ---

// Basic route & Health Check
app.get('/', (req, res) => {
  res.send('SiddhiCorp Admin API is running with Mongoose');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
  });
});

// Safety check endpoint (does NOT expose secret values)
app.get('/api/safety', (req, res) => {
  const isDbConfigured = Boolean(process.env.DATABASE_URL);
  const isJwtConfigured = Boolean(process.env.JWT_SECRET);
  res.json({
    status: 'safe',
    checks: {
      databaseConfigured: isDbConfigured,
      jwtConfigured: isJwtConfigured,
      secretsExposed: false,
      corsRestricted: false,
    },
    timestamp: new Date().toISOString(),
  });
});

// Customer Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, phone } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone: phone || 'dummy-no-match' }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }
    
    // Create customer
    const newUser = await User.create({ ...req.body, role: 'Customer' });
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Create admin notification
    try {
      await Notification.create({
        title: 'New Customer Registered',
        message: `${newUser.name} (${newUser.company || newUser.email || 'Customer'}) registered an account.`,
        type: 'customer',
        referenceId: newUser._id.toString()
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr);
    }

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Customer Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // Identifier can be email or phone
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }],
      password 
    });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status === 'Inactive') return res.status(403).json({ error: 'Account is inactive' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Login API
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    let user = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, 
      password 
    });
    
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const salesEmail = (process.env.SALES_EMAIL || '').trim().toLowerCase();
    const salesPassword = process.env.SALES_PASSWORD;

    // Auto-create super admin if configured in env and no admin exists
    if (!user && adminEmail && adminPassword && cleanEmail === adminEmail && password === adminPassword) {
      const count = await User.countDocuments();
      if (count === 0) {
        user = await User.create({ name: 'Super Admin', email: adminEmail, password: adminPassword, role: 'Admin' });
        if (salesEmail && salesPassword) {
          await User.create({ name: 'Sales Executive', email: salesEmail, password: salesPassword, role: 'Sales Executive' });
        }
      }
    }
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    
    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact an administrator.' });
    }

    // Restrict access: Only Internal Staff & Sales Team (and new internal staff added by admin) can log in to admin.
    // Customers are strictly prohibited from logging into the Admin Portal.
    if (isCustomerRole(user.role)) {
      return res.status(403).json({ 
        error: 'Access denied: Customer accounts cannot log in to the Admin Portal. Only authorized Internal Staff & Sales Team members are allowed.' 
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard Stats API
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    let userRole = '';
    let userId = '';
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userRole = decoded.role || '';
        userId = decoded.id || '';
      } catch (e) {
        // Optional token verification failure
      }
    }

    if (userRole && isCustomerRole(userRole)) {
      return res.status(403).json({ error: 'Access denied: Customer accounts cannot access the admin dashboard.' });
    }

    // Role scoping: if Sales Executive, filter RFQs to their assigned ones
    const isSalesExec = (userRole.toLowerCase().includes('executive') || userRole.toLowerCase().includes('salesman')) && !userRole.toLowerCase().includes('admin') && !userRole.toLowerCase().includes('manager');
    const rfqBaseFilter = isSalesExec && userId ? { assignedTo: userId } : {};

    // Pending Actions = RFQs that are awaiting action
    const pendingFilter = {
      ...rfqBaseFilter,
      status: { 
        $in: [
          'New', 'Pending', 'Open', 'RFQ Submitted', 'Generated', 
          'Assigned', 'Under Review', 'Processing', 'Process by Sales'
        ] 
      }
    };

    const [allUsers, totalProducts, totalRFQs, pendingRFQs, rawRecentRFQs, allRfqs] = await Promise.all([
      User.find().select('-password'),
      Product.countDocuments(),
      RFQ.countDocuments(rfqBaseFilter),
      RFQ.countDocuments(pendingFilter),
      RFQ.find(rfqBaseFilter).populate('assignedTo', 'name email role').sort({ createdAt: -1 }).limit(8),
      RFQ.find().select('email phone companyName customerName')
    ]);

    // Calculate total distinct corporate customers across User and RFQ collections
    const distinctCustomers = new Set<string>();
    for (const u of allUsers) {
      const r = (u.role || '').toLowerCase();
      if (r === 'customer' || r === 'website customer' || r === 'corporate customer') {
        const key = (u.email || u.phone || u.company || u.name || '').toLowerCase().trim();
        if (key) distinctCustomers.add(key);
      }
    }
    for (const r of allRfqs) {
      const key = (r.email || r.phone || r.companyName || r.customerName || '').toLowerCase().trim();
      if (key) distinctCustomers.add(key);
    }
    const totalCustomers = Math.max(distinctCustomers.size, 1);

    const recentRFQs = rawRecentRFQs.map((r: any) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (obj.assignedTo && typeof obj.assignedTo === 'object') {
        obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
        obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
      }
      return obj;
    });

    res.json({
      totalCustomers,
      totalProducts,
      totalRFQs,
      pendingRFQs,
      recentRFQs
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get Admin Users API (Allow Admin, Super Admin, Sales Manager, and auto-seed sales staff if empty)
app.get('/api/admin/users', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded?.role && isCustomerRole(decoded.role)) {
          return res.status(403).json({ error: 'Access denied: Customer accounts cannot view internal staff.' });
        }
      } catch (e) {}
    }

    // Clean up unwanted dummy staff accounts
    try {
      await User.deleteMany({
        email: { $in: ['admin@siddhikabel.com', 'sales@siddhikabel.com', 'manager@siddhikabel.com'] }
      });
    } catch (cleanErr) {}

    // Ensure Ramesh, Prithvi, Sumanth exist as internal team members
    try {
      let ramesh = await User.findOne({ $or: [{ name: /ramesh/i }, { email: /ramesh/i }] });
      if (!ramesh) {
        await User.create({ name: 'Ramesh', email: 'ramesh@siddhicorp.com', password: 'password123', role: 'Sales Executive', status: 'Active' });
      } else if (ramesh.name !== 'Ramesh') {
        await User.findByIdAndUpdate(ramesh._id, { name: 'Ramesh', role: 'Sales Executive' });
      }

      let prithvi = await User.findOne({ $or: [{ name: /prithvi/i }, { name: /pruthwik/i }, { email: /pruthwik/i }, { email: /prithvi/i }] });
      if (!prithvi) {
        await User.create({ name: 'Prithvi', email: 'prithvi@siddhicorp.com', password: 'password123', role: 'Sales Executive', status: 'Active' });
      } else if (prithvi.name !== 'Prithvi') {
        await User.findByIdAndUpdate(prithvi._id, { name: 'Prithvi', role: 'Sales Executive' });
      }

      let sumanth = await User.findOne({ $or: [{ name: /sumanth/i }, { email: /sumanth/i }] });
      if (!sumanth) {
        await User.create({ name: 'Sumanth', email: 'sumanth@siddhicorp.com', password: 'password123', role: 'Sales Executive', status: 'Active' });
      }
    } catch (seedErr) {}

    let users = await User.find().sort({ createdAt: -1 }).select('-password');
    // Filter out dummy accounts
    users = users.filter(u => {
      const em = (u.email || '').toLowerCase().trim();
      return em !== 'admin@siddhikabel.com' && em !== 'sales@siddhikabel.com' && em !== 'manager@siddhikabel.com';
    });

    // Also include corporate customers who submitted RFQs
    const rfqs = await RFQ.find().sort({ createdAt: -1 });
    const existingKeys = new Set(users.map(u => (u.email || u.phone || u.company || u.name || '').toLowerCase().trim()).filter(Boolean));
    const rfqCustomers: any[] = [];
    
    for (const r of rfqs) {
      const em = (r.email || '').toLowerCase().trim();
      const phone = (r.phone || '').trim();
      const company = (r.companyName || r.customerName || '').trim();
      const key = em || (company && phone ? `${company}_${phone}` : company || phone);

      if (key && !existingKeys.has(key)) {
        existingKeys.add(key);
        rfqCustomers.push({
          _id: `rfq-cust-${r._id}`,
          name: r.customerName || company || 'Corporate Client',
          email: r.email || '',
          phone: r.phone || '',
          company: r.companyName || r.customerName || 'Enterprise Customer',
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          gstin: 'UNREGISTERED',
          role: 'Customer',
          status: 'Active',
          createdAt: r.createdAt
        });
      }
    }
    
    // Sort combined list: newest records first
    const combined = [...users, ...rfqCustomers].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json(combined);
  } catch (error) {
    console.error('DB fetch users failed, using fallback');
    res.json([
      { _id: 'mock-ramesh', name: 'Ramesh', role: 'Sales Executive', email: 'ramesh@siddhicorp.com', status: 'Active' },
      { _id: 'mock-prithvi', name: 'Prithvi', role: 'Sales Executive', email: 'prithvi@siddhicorp.com', status: 'Active' },
      { _id: 'mock-sumanth', name: 'Sumanth', role: 'Sales Executive', email: 'sumanth@siddhicorp.com', status: 'Active' },
    ]);
  }
});

// Delete User API (Admin only)
app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Dedicated Assign Staff API (Strictly returns Ramesh, Prithvi, Sumanth)
app.get('/api/admin/assign-staff', async (req, res) => {
  try {
    // 1. Ensure Ramesh exists in DB
    let ramesh = await User.findOne({
      $or: [
        { name: /ramesh/i },
        { email: /ramesh/i }
      ]
    });
    if (!ramesh) {
      try {
        ramesh = await User.create({
          name: 'Ramesh',
          email: 'ramesh@siddhicorp.com',
          password: 'password123',
          role: 'Sales Executive'
        });
      } catch (e) {}
    }

    // 2. Ensure Prithvi exists in DB
    let prithvi = await User.findOne({
      $or: [
        { name: /prithvi/i },
        { name: /pruthwik/i },
        { email: /pruthwik/i },
        { email: /prithvi/i }
      ]
    });
    if (!prithvi) {
      try {
        prithvi = await User.create({
          name: 'Prithvi',
          email: 'prithvi@siddhicorp.com',
          password: 'password123',
          role: 'Sales Executive'
        });
      } catch (e) {}
    }

    // 3. Ensure Sumanth exists in DB
    let sumanth = await User.findOne({
      $or: [
        { name: /sumanth/i },
        { email: /sumanth/i }
      ]
    });
    if (!sumanth) {
      try {
        sumanth = await User.create({
          name: 'Sumanth',
          email: 'sumanth@siddhicorp.com',
          password: 'password123',
          role: 'Sales Executive'
        });
      } catch (e) {}
    }

    // Return strictly the 3 designated sales staff: Ramesh, Prithvi, Sumanth
    const assignStaff = [
      { 
        _id: ramesh?._id ? ramesh._id.toString() : 'sales-ramesh-id', 
        name: 'Ramesh', 
        role: 'Sales Executive' 
      },
      { 
        _id: prithvi?._id ? prithvi._id.toString() : 'sales-prithvi-id', 
        name: 'Prithvi', 
        role: 'Sales Executive' 
      },
      { 
        _id: sumanth?._id ? sumanth._id.toString() : 'sales-sumanth-id', 
        name: 'Sumanth', 
        role: 'Sales Executive' 
      }
    ];

    res.json(assignStaff);
  } catch (error) {
    console.error('Failed to get assign-staff, using fallback');
    res.json([
      { _id: 'sales-ramesh-id', name: 'Ramesh', role: 'Sales Executive' },
      { _id: 'sales-prithvi-id', name: 'Prithvi', role: 'Sales Executive' },
      { _id: 'sales-sumanth-id', name: 'Sumanth', role: 'Sales Executive' }
    ]);
  }
});

// Update User Status API (Activate/Deactivate User/Customer - Super Admin/Admin only)
app.patch('/api/admin/users/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create User API (Super Admin/Admin only)
app.post('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.status) data.status = 'Active';
    if (!data.password) data.password = 'Customer@123';
    if (!data.role) data.role = 'Customer';
    const newUser = await User.create(data);
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Update User / Customer / Staff API (Admin only)
app.put('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, email, role, status, company, phone, address, city, state, pincode, gstin, password } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (gstin !== undefined) updateData.gstin = gstin;
    if (password) updateData.password = password;

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' }).select('-password');
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update record', details: error.message });
  }
});

// Customer Master Auto-Suggestions (Requirement 3.4: Suggest existing companies while typing company name)
app.get('/api/customers/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      role: 'Customer',
      $or: [
        { company: regex },
        { gstin: regex },
        { name: regex }
      ]
    }).limit(10).select('name company gstin address city state pincode phone email');

    // Also deduplicate company records
    const seen = new Set();
    const suggestions = [];
    for (const u of users) {
      const compName = (u.company || u.name || '').trim();
      if (compName && !seen.has(compName.toLowerCase())) {
        seen.add(compName.toLowerCase());
        suggestions.push({
          id: u._id,
          company: compName,
          name: u.name,
          gstin: u.gstin || '',
          address: u.address || '',
          city: u.city || '',
          state: u.state || '',
          pincode: (u as any).pincode || '',
          phone: u.phone || '',
          email: u.email || ''
        });
      }
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get customer suggestions' });
  }
});

// Customer Master Excel Import (Requirement 3.2 & 6.2)
app.post('/api/admin/customers/import', verifyAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No Excel file uploaded' });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ error: 'Excel file has no sheets' });
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return res.status(400).json({ error: 'Empty sheet' });

    const rows = xlsx.utils.sheet_to_json(worksheet) as any[];
    let successCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const company = (row['Company Name'] || row['Company'] || row['Customer Name'] || row['Customer'] || '').toString().trim();
      const name = (row['Contact Person'] || row['Customer Name'] || row['Name'] || company || 'Corporate Customer').toString().trim();
      const gstin = (row['GST Number'] || row['GST'] || row['GSTIN'] || '').toString().trim().toUpperCase();
      const address = (row['Address'] || '').toString().trim();
      const city = (row['City'] || '').toString().trim();
      const state = (row['State'] || '').toString().trim();
      const pincode = (row['PIN Code'] || row['Pincode'] || row['Pin'] || '').toString().trim();
      const phone = (row['Phone'] || row['Mobile'] || '').toString().trim();
      const email = (row['Email'] || row['Email Address'] || (gstin ? `${gstin.toLowerCase()}@client.siddhikabel.com` : `cust_${Date.now()}@siddhikabel.com`)).toString().trim().toLowerCase();

      if (!company && !name && !gstin) continue;

      const customerPayload = {
        name,
        company: company || name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        gstin: gstin || 'UNREGISTERED',
        role: 'Customer',
        status: 'Active' as const,
        isCompanyMaster: true
      };

      // Upsert: First match by GSTIN if provided (preferred identifier per Req 3.5), else by Email or Company
      let existing = null;
      if (gstin && gstin !== 'UNREGISTERED') {
        existing = await User.findOne({ gstin });
      }
      if (!existing && email) {
        existing = await User.findOne({ email });
      }
      if (!existing && company) {
        existing = await User.findOne({ company: new RegExp(`^${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), role: 'Customer' });
      }

      if (existing) {
        await User.findByIdAndUpdate(existing._id, customerPayload);
        updatedCount++;
      } else {
        await User.create({
          ...customerPayload,
          password: 'Password@123'
        });
        successCount++;
      }
    }

    res.json({
      message: `Customer import complete: ${successCount} new records created, ${updatedCount} existing records updated.`,
      successCount,
      updatedCount
    });
  } catch (error: any) {
    console.error('Customer import failed:', error);
    res.status(500).json({ error: 'Customer import failed', details: error.message });
  }
});

// Send password creation link / account activation (Requirement 3.6)
app.post('/api/customers/create-password-link', async (req, res) => {
  try {
    const { email, customerId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No customer account found with this email' });

    // Generate password creation reset token
    const resetToken = jwt.sign({ id: user._id, email: user.email, purpose: 'password_creation' }, JWT_SECRET, { expiresIn: '48h' });
    const creationLink = `http://localhost:3000/set-password?token=${resetToken}`;

    console.log(`✅ [Password Creation Link Generated for ${user.email}]: ${creationLink}`);
    
    // Attempt sending email if transporter configured
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await mailTransporter.sendMail({
          from: `"Siddhi Kabel Corp" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Set Your Siddhi Kabel Portal Account Password',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Welcome to Siddhi Kabel Corporation</h2>
              <p>Dear ${user.name || 'Valued Customer'},</p>
              <p>Your corporate account for <strong>${user.company || 'your organization'}</strong> has been registered on our customer portal.</p>
              <p>Please click the button below to set your account password and access B2B pricing, RFQ submissions, and order tracking:</p>
              <p><a href="${creationLink}" style="background: #c52328; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set Password</a></p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">This link is valid for 48 hours.</p>
            </div>
          `
        });
      }
    } catch (mailErr) {
      console.warn('Mail send notice:', mailErr);
    }

    res.json({
      message: `Password setup link dispatched to ${user.email}.`,
      link: creationLink
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate password creation link' });
  }
});

// Submit Custom Product Cutting Request API
app.post('/api/custom-cutting', async (req, res) => {
  try {
    const { name, companyName, phone, email, requirement, productName, partNo } = req.body;

    if (!name || !companyName || !phone || !email || !requirement) {
      return res.status(400).json({ 
        error: 'All fields (Name, Company Name, Phone, Email, Specific Requirement) are required.' 
      });
    }

    // 1. Save to Database
    const cuttingRequest = await CustomCutting.create({
      name: String(name).trim(),
      companyName: String(companyName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      requirement: String(requirement).trim(),
      productName: productName ? String(productName).trim() : null,
      partNo: partNo ? String(partNo).trim() : null,
      status: 'Pending'
    });

    // 2. Create in-app notification for admin/sales
    try {
      await Notification.create({
        title: 'New Custom Product Cutting Inquiry',
        message: `${name} from ${companyName} requested custom cutting: ${requirement.slice(0, 100)}...`,
        type: 'rfq',
        referenceId: cuttingRequest._id.toString()
      });
    } catch (notifErr) {
      console.error('Failed to create in-app notification', notifErr);
    }

    // 3. Dispatch Email Notification
    const recipientEmail = process.env.SALES_EMAIL || process.env.ADMIN_EMAIL || 'sales@siddhicorp.com';
    const emailSubject = `[Custom Cable Cutting Request] ${companyName} - ${name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #dc2626; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0 0 6px 0;">Siddhi Cable Corporation</h2>
          <p style="color: #dc2626; font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">
            New Custom Product Cutting Request
          </p>
        </div>
        
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          A customer has submitted a custom cutting and length preparation request through the web portal:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b; width: 35%;">Contact Person:</td>
              <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b;">Company Name:</td>
              <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${companyName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b;">Phone / Mobile:</td>
              <td style="padding: 10px 12px; font-weight: bold; color: #0284c7;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b;">Email Address:</td>
              <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${email}</td>
            </tr>
            ${productName ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b;">Product Reference:</td>
              <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${productName} ${partNo ? `(Part #${partNo})` : ''}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b; vertical-align: top;">Specific Requirement:</td>
              <td style="padding: 10px 12px; color: #0f172a; white-space: pre-wrap; font-family: monospace; background: #f8fafc; border-radius: 6px;">${requirement}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; color: #64748b;">Submission Time:</td>
              <td style="padding: 10px 12px; color: #64748b;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #f8fafc; border-radius: 8px; padding: 14px; text-align: center; border: 1px dashed #cbd5e1; margin-top: 24px;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            Request ID: <strong>${cuttingRequest._id}</strong> · Direct warehouse dispatch from Bangalore depot.
          </p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await mailTransporter.sendMail({
          from: `"Siddhi Cable Portal" <${process.env.SMTP_USER}>`,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml
        });
        console.log(`✅ Custom cutting inquiry email successfully dispatched to ${recipientEmail}`);
      } else {
        console.log(`ℹ️ [Simulated Email] Custom Cutting Inquiry from ${name} (${companyName}) dispatched to ${recipientEmail}`);
      }
    } catch (mailErr) {
      console.warn('⚠️ Mail send error (inquiry saved to DB successfully):', mailErr);
    }

    res.status(201).json({
      message: 'Custom product cutting request submitted successfully. Our team will contact you shortly.',
      request: cuttingRequest
    });
  } catch (error: any) {
    console.error('Error submitting custom cutting request:', error);
    res.status(500).json({ error: 'Failed to submit cutting request', details: error.message });
  }
});

// Get Custom Product Cutting Requests (Admin & Sales)
app.get('/api/custom-cutting', async (req, res) => {
  try {
    const list = await CustomCutting.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom cutting requests' });
  }
});

// Submit RFQ API (Requires authentication)
app.post('/api/rfqs', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in or create an account to submit an RFQ.' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found. Please register or sign in.' });
    }
    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact support.' });
    }

    let enrichedItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (enrichedItems.length > 0) {
      try {
        const partNos = enrichedItems.map((it: any) => it.partNo).filter(Boolean);
        const dbProducts = await Product.find({ partNo: { $in: partNos } }).lean();
        const pMap = new Map();
        dbProducts.forEach(p => pMap.set(p.partNo, p));
        enrichedItems = enrichedItems.map((it: any) => {
          const prod = it.partNo ? pMap.get(it.partNo) : null;
          return {
            ...it,
            core: it.core || prod?.core || '',
            coreSize: it.coreSize || prod?.coreSize || prod?.sqmm || '',
            sqmm: it.sqmm || prod?.sqmm || prod?.coreSize || '',
            uom: it.uom || prod?.uom || it.unit || 'm',
            weight: it.weight || prod?.weight || '',
            outerDiameter: it.outerDiameter || prod?.outerDiameter || '',
            description: it.description || it.name || prod?.name || '',
            validity: it.validity || '7 Days'
          };
        });
      } catch (enrichErr) {
        console.warn('Item enrichment error:', enrichErr);
      }
    }

    const rfqPayload = {
      ...req.body,
      items: enrichedItems,
      customerId: user._id,
      customerName: req.body.customerName || user.name,
      companyName: req.body.companyName || user.company || user.name,
      email: req.body.email || user.email,
      phone: req.body.phone || user.phone,
      address: req.body.address || req.body.billingAddress || user.address || '',
      billingAddress: req.body.billingAddress || req.body.address || user.address || '',
      deliveryAddress: req.body.deliveryAddress || req.body.deliveryLocation || req.body.address || user.address || '',
      deliveryLocation: req.body.deliveryLocation || req.body.city || user.city || '',
      specialInstructions: req.body.specialInstructions || req.body.notes || '',
      city: req.body.city || user.city,
      state: req.body.state || user.state,
      pincode: req.body.pincode || (user as any).pincode || '',
      status: 'Pending',
      validityDays: 7,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const newRfq = await RFQ.create(rfqPayload);
    
    // Create admin notification
    try {
      await Notification.create({
        title: 'New RFQ Received',
        message: `Estimate ${newRfq.quoteNo} submitted by ${newRfq.companyName || newRfq.customerName || 'Customer'} (Total: ₹${(newRfq.grandTotal || 0).toLocaleString('en-IN')}).`,
        type: 'rfq',
        referenceId: newRfq._id.toString()
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr);
    }

    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ error: 'Failed to submit RFQ' });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const pendingOnly = req.query.pendingOnly === 'true';
    const query = pendingOnly ? { read: false } : {};
    let notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);

    // If empty and not filtering by pendingOnly, auto-generate initial contextual notifications
    if (notifications.length === 0 && !pendingOnly) {
      try {
        const latestRfqs = await RFQ.find().sort({ createdAt: -1 }).limit(3);
        for (const r of latestRfqs) {
          await Notification.create({
            title: 'New RFQ Received',
            message: `Estimate ${r.quoteNo} generated for ${r.companyName || r.customerName || 'Client'}.`,
            type: 'rfq',
            referenceId: r._id.toString(),
            read: false
          });
        }
        notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
      } catch (e) {}
    }

    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { returnDocument: 'after' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

app.post('/api/notifications/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (Array.isArray(ids) && ids.length > 0) {
      const result = await Notification.deleteMany({ _id: { $in: ids } });
      return res.json({ message: `${result.deletedCount} notifications deleted` });
    }
    res.status(400).json({ error: 'No IDs provided' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk delete notifications' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

app.delete('/api/notifications/clear-read', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ read: true });
    res.json({ message: 'Cleared read notifications', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear read notifications' });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Update Admin Profile API (Name, Email, Password)
app.put('/api/admin/profile', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    let userId = '';
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    const { id, name, email, password } = req.body;
    const targetId = userId || id;
    if (!targetId) return res.status(400).json({ error: 'User ID required' });

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (password && password.trim()) updateFields.password = password.trim();

    const updatedUser = await User.findByIdAndUpdate(targetId, updateFields, { returnDocument: 'after' }).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    const newToken = jwt.sign({ id: updatedUser._id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: updatedUser, token: newToken, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get My RFQs API (for Customer)
app.get('/api/rfqs/my', async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });
    
    const rfqs = await RFQ.find({
      $or: [{ email }, { phone }]
    } as any).sort({ createdAt: -1 });
    
    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching my RFQs:', error);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// Get all RFQs API (for Admin panel)
app.get('/api/rfqs', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    let userRole = '';
    let userId = '';
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userRole = decoded.role || '';
        userId = decoded.id || '';
      } catch (e) {}
    }

    // Requirement 2.5: Automatic 7-day expiry for RFQs in Pending or Under Review
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const toExpire = await RFQ.find({
        status: { $in: ['Pending', 'Under Review', 'New', 'Assigned', 'Process by Sales', 'Processing'] },
        $or: [
          { assignedAt: { $lte: sevenDaysAgo } },
          { assignedAt: null, createdAt: { $lte: sevenDaysAgo } }
        ]
      });

      if (toExpire.length > 0) {
        await RFQ.updateMany(
          { _id: { $in: toExpire.map(r => r._id) } },
          { 
            $set: { 
              status: 'Expired', 
              expiredAt: new Date(),
              expiryComments: 'Automatically expired: 7 days quotation validity period elapsed without conversion. Price revalidation required.'
            } 
          }
        );
      }
    } catch (expErr) {
      console.warn('Auto-expiry error:', expErr);
    }

    const { assignedTo } = req.query;
    const isSalesExec = (userRole.toLowerCase().includes('executive') || userRole.toLowerCase().includes('salesman')) && !userRole.toLowerCase().includes('admin') && !userRole.toLowerCase().includes('manager');
    
    let filter: any = {};
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    } else if (isSalesExec && userId) {
      filter.assignedTo = userId;
    }

    const rfqs = await RFQ.find(filter).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
    
    // Normalize assignedTo, assignedToName and clean statuses
    const normalized = rfqs.map((r: any) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (obj.assignedTo && typeof obj.assignedTo === 'object') {
        obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
        obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
      }
      // Preserve the 4 primary statuses: Pending, Under Review, PO Received, Closed (plus Lost, Expired)
      if (obj.status === 'New' || obj.status === 'Assigned' || obj.status === 'Open' || obj.status === 'Processing' || obj.status === 'Process by Sales') {
        obj.status = 'Pending';
      } else if (obj.status === 'Approved' || obj.status === 'Completed') {
        obj.status = 'PO Received';
      } else if (obj.status === 'Closed') {
        obj.status = 'Closed';
      }
      return obj;
    });

    // Bulk enrich items with specs from Product database if missing
    const allPartNos = new Set<string>();
    normalized.forEach((r: any) => {
      if (r.items && Array.isArray(r.items)) {
        r.items.forEach((it: any) => {
          if (it.partNo) allPartNos.add(it.partNo);
        });
      }
    });

    if (allPartNos.size > 0) {
      try {
        const dbProducts = await Product.find({ partNo: { $in: Array.from(allPartNos) } }).lean();
        const pMap = new Map();
        dbProducts.forEach(p => pMap.set(p.partNo, p));

        normalized.forEach((r: any) => {
          if (r.items && Array.isArray(r.items)) {
            r.items = r.items.map((it: any) => {
              const p = it.partNo ? pMap.get(it.partNo) : null;
              return {
                ...it,
                core: it.core || p?.core || '',
                coreSize: it.coreSize || p?.coreSize || p?.sqmm || '',
                sqmm: it.sqmm || p?.sqmm || p?.coreSize || '',
                uom: it.uom || p?.uom || it.unit || 'm',
                weight: it.weight || p?.weight || '',
                outerDiameter: it.outerDiameter || p?.outerDiameter || '',
                description: it.description || it.name || p?.name || '',
                validity: it.validity || '7 Days'
              };
            });
          }
        });
      } catch (enrichErr) {}
    }

    res.json(normalized);
  } catch (error) {
    console.error('DB fetch RFQs failed, using fallback');
    res.json([
      { _id: 'mock-rfq-1', quoteNo: '#RFQ-001', companyName: 'Ramesh Engineering', customerName: 'Ramesh', status: 'Pending', date: 'Oct 8, 2026', grandTotal: 15400, items: [] },
      { _id: 'mock-rfq-2', quoteNo: '#RFQ-002', companyName: 'TechCorp Solutions', customerName: 'Suresh', status: 'Under Review', date: 'Oct 7, 2026', grandTotal: 25000, items: [] },
    ]);
  }
});

// Update RFQ Status API (Agreed Statuses: Pending, Under Review, PO Received, Closed, Lost, Expired)
app.patch('/api/rfqs/:id/status', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    let userRole = '';
    let userId = '';
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userRole = (decoded.role || '').toLowerCase().trim();
        userId = decoded.id || '';
      } catch (e) {}
    }

    if (userRole && isCustomerRole(userRole)) {
      return res.status(403).json({ error: 'Customer accounts cannot update RFQ status.' });
    }

    // Role Matrix: Sales Executive has limited access - can only update status of assigned RFQs
    const isSalesExec = (userRole.includes('executive') || userRole.includes('salesman')) && !userRole.includes('admin') && !userRole.includes('manager');
    if (isSalesExec && userId) {
      const existingRfq = await RFQ.findById(req.params.id);
      if (!existingRfq) return res.status(404).json({ error: 'RFQ not found' });
      if (existingRfq.assignedTo?.toString() !== userId) {
        return res.status(403).json({ error: 'Sales Executives can only update status for RFQs assigned to them.' });
      }
    }

    const { status, notes, lostReason, lostReasonDetails, expiryComments } = req.body;
    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;
    if (lostReason !== undefined) updateFields.lostReason = lostReason;
    if (lostReasonDetails !== undefined) updateFields.lostReasonDetails = lostReasonDetails;
    if (expiryComments !== undefined) updateFields.expiryComments = expiryComments;
    
    if (status === 'Expired') {
      updateFields.expiredAt = new Date();
      if (!expiryComments && !updateFields.expiryComments) {
        updateFields.expiryComments = 'Quotation expired after 7 days validity period. Rate reconfirmation required before processing.';
      }
    }

    const updatedRfq = await RFQ.findByIdAndUpdate(req.params.id, updateFields, { returnDocument: 'after' }).populate('assignedTo', 'name email role');
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });

    // Notification for status transitions
    if (status === 'Lost') {
      try {
        await Notification.create({
          title: `RFQ ${updatedRfq.quoteNo} Marked as Lost`,
          message: `Reason: ${lostReason || 'Not specified'} ${lostReasonDetails ? `(${lostReasonDetails})` : ''}`,
          type: 'rfq',
          referenceId: updatedRfq._id.toString()
        });
      } catch (nErr) {}
    } else if (notes && status === 'Pending') {
      try {
        await Notification.create({
          title: `RFQ ${updatedRfq.quoteNo} Returned to Sales`,
          message: `Returned for revision: ${notes}`,
          type: 'rfq',
          referenceId: updatedRfq._id.toString()
        });
      } catch (nErr) {}
    }

    const obj: any = updatedRfq.toObject ? updatedRfq.toObject() : { ...updatedRfq };
    if (obj.assignedTo && typeof obj.assignedTo === 'object') {
      obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
      obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
    }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RFQ status' });
  }
});

// Assign RFQ API (Allowed for Super Admin, Admin, and Sales Manager)
app.patch('/api/rfqs/:id/assign', verifyManagerOrAdmin, async (req, res) => {
  try {
    const { assignedTo, assignedToName } = req.body;
    let updateData: any = {};
    
    if (!assignedTo || assignedTo === 'unassigned' || assignedTo === '') {
      updateData = { 
        assignedTo: null, 
        assignedToName: null, 
        assignedAt: null,
        status: 'Pending' 
      };
    } else {
      let resolvedName = assignedToName;
      if (!resolvedName) {
        const u = await User.findById(assignedTo);
        if (u) resolvedName = u.name;
      }
      updateData = { 
        assignedTo, 
        assignedToName: resolvedName || 'Assigned Staff',
        assignedAt: new Date(),
        status: 'Pending' // Retain Pending status with assigned staff name
      };
    }

    const updatedRfq = await RFQ.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' }).populate('assignedTo', 'name email role');
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });
    
    const obj: any = updatedRfq.toObject ? updatedRfq.toObject() : { ...updatedRfq };
    if (obj.assignedTo && typeof obj.assignedTo === 'object') {
      obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
      obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
    }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign RFQ' });
  }
});

// Update RFQ Pricing & Special Discount API
app.patch('/api/rfqs/:id/price', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userRole = (decoded?.role || '').toLowerCase().trim();
        if (isCustomerRole(userRole)) {
          return res.status(403).json({ error: 'Customer accounts cannot modify quotation pricing.' });
        }
      } catch (e) {}
    }

    const { items, discountRate, discountAmount, subtotal, grandTotal, notes, deliveryTerms, paymentTerms } = req.body;
    const updateData: any = {};
    if (items !== undefined) updateData.items = items;
    if (discountRate !== undefined) updateData.discountRate = Number(discountRate);
    if (discountAmount !== undefined) updateData.discountAmount = Number(discountAmount);
    if (subtotal !== undefined) updateData.subtotal = Number(subtotal);
    if (grandTotal !== undefined) updateData.grandTotal = Number(grandTotal);
    if (notes !== undefined) updateData.notes = String(notes);
    if (deliveryTerms !== undefined) updateData.deliveryTerms = String(deliveryTerms);
    if (paymentTerms !== undefined) updateData.paymentTerms = String(paymentTerms);

    const updatedRfq = await RFQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    ).populate('assignedTo', 'name email role');
    
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });
    
    const obj: any = updatedRfq.toObject ? updatedRfq.toObject() : { ...updatedRfq };
    if (obj.assignedTo && typeof obj.assignedTo === 'object') {
      obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
      obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
    }
    res.json(obj);
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Failed to update quotation pricing' });
  }
});

// Delete RFQ API
app.delete('/api/rfqs/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedRfq = await RFQ.findByIdAndDelete(req.params.id);
    if (!deletedRfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json({ message: 'RFQ deleted successfully' });
  } catch (error) {
    console.error('Delete RFQ error:', error);
    res.status(500).json({ error: 'Failed to delete RFQ' });
  }
});

// Bulk Delete RFQs API
app.post('/api/rfqs/bulk-delete', verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid or missing ids array' });
    }
    await RFQ.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} RFQs deleted successfully` });
  } catch (error) {
    console.error('Bulk delete RFQs error:', error);
    res.status(500).json({ error: 'Failed to delete RFQs' });
  }
});

// --- Categories API (Strict 24 Categories Mapped to 4 Manufacturers, 6 Categories Each) ---
const OFFICIAL_24_CATEGORIES = [
  // 1. LAPP (6 Categories - strictly in client specified order)
  {
    name: 'Power and Control Cables',
    make: 'LAPP',
    subGroup: 'ÖLFLEX® Power & Control',
    description: 'Flexible control cables, oil-resistant PVC/PUR cables, and heat-resistant power cables'
  },
  {
    name: 'Data Communication Cables',
    make: 'LAPP',
    subGroup: 'UNITRONIC® / ETHERLINE®',
    description: 'Shielded data transmission cables, industrial ethernet cables, and bus system cables'
  },
  {
    name: 'Control Cabinet Single Cores',
    make: 'LAPP',
    subGroup: 'Single Core Panel Wires',
    description: 'Hook-up wires, panel single cores, halogen-free and high-temperature single conductor wires'
  },
  {
    name: 'Cable Glands & Counter Nuts',
    make: 'LAPP',
    subGroup: 'SKINTOP® Cable Glands',
    description: 'Polyamide, brass, and stainless steel strain relief cable glands and locknuts'
  },
  {
    name: 'Rill, Conduit & Klick',
    make: 'LAPP',
    subGroup: 'SILVYN® Protective Conduits',
    description: 'Protective cable conduits, spiral hoses, and quick-click conduit connectors'
  },
  {
    name: 'Domestic / House Wiring',
    make: 'LAPP',
    subGroup: 'Building Wires / Single Cores',
    description: 'Flame-retardant FR-LSH building wires, copper conductor house wiring cables for residential and commercial installations'
  },

  // 2. Eaton (6 Categories)
  {
    name: 'Switchgear & Protection',
    make: 'Eaton',
    subGroup: 'Motor Starters, Contactors & Breakers',
    description: 'Industrial motor control, power distribution switchgear, and safety isolators'
  },
  {
    name: 'Motor Protection Breakers',
    make: 'Eaton',
    subGroup: 'PKZM0 Motor Breakers',
    description: 'Rotary motor protection with overload & short circuit release up to 150 kA'
  },
  {
    name: 'Molded Case Circuit Breakers',
    make: 'Eaton',
    subGroup: 'NZM Compact MCCBs',
    description: 'Electronic trip molded case circuit breakers up to 1600A for industrial distribution'
  },
  {
    name: 'Miniature Circuit Breakers & RCDs',
    make: 'Eaton',
    subGroup: 'FAZ DIN-Rail MCBs',
    description: '10kA and 15kA breaking capacity DIN rail miniature circuit breakers and residual current devices'
  },
  {
    name: 'Power Contactors & Relays',
    make: 'Eaton',
    subGroup: 'DILM Power Contactors',
    description: 'Heavy-duty 3-pole and 4-pole contactors with electronic coils and auxiliary relays'
  },
  {
    name: 'Power Quality & UPS',
    make: 'Eaton',
    subGroup: 'Capacitors & APFC Systems',
    description: 'Automatic power factor correction panels, harmonic filters, and industrial UPS systems'
  },

  // 3. Mennekes (6 Categories)
  {
    name: 'Industrial Plugs & Sockets',
    make: 'Mennekes',
    subGroup: 'Heavy Duty CEE Plugs & Sockets',
    description: 'CEE-norm 16A to 125A industrial plugs, couplers, and switched interlocked receptacles'
  },
  {
    name: 'AMAXX® & Distribution Enclosures',
    make: 'Mennekes',
    subGroup: 'Modular Distribution Units',
    description: 'Combination receptacle distribution enclosures in high-impact AMAPLAST housing'
  },
  {
    name: 'Panel Mounted Receptacle Sockets',
    make: 'Mennekes',
    subGroup: 'Watertight Receptacles',
    description: 'Straight and angled panel mounted receptacles with nickel-plated contacts'
  },
  {
    name: 'Chemical Earthing Electrodes',
    make: 'Mennekes',
    subGroup: 'Maintenance-Free Chemical Electrodes',
    description: 'High corrosion-resistant chemical earthing electrodes with crystalline earth compound'
  },
  {
    name: 'Copper Clad Earth Rods & Accessories',
    make: 'Mennekes',
    subGroup: 'Earth Rods & Clamps',
    description: 'Molecularly bonded copper clad steel earth rods, driving heads, and bronze couplers'
  },
  {
    name: 'Earthing Solutions',
    make: 'Mennekes',
    subGroup: 'Chemical Electrodes & Earthing Accessories',
    description: 'Low-impedance industrial earthing solutions and lightning protection grounding pits'
  },

  // 4. Partex (6 Categories)
  {
    name: 'Cable Marking Systems',
    make: 'Partex',
    subGroup: 'PA Markers & ProMark Printers',
    description: 'Pre-printed interlocking cable markers, chevron-cut wire tags, and carrier strips'
  },
  {
    name: 'Profile Marking Sleeves',
    make: 'Partex',
    subGroup: 'PO/POZ Profile Sleeves',
    description: 'Oval profile marking sleeves and halogen-free printable tubing for wire identification'
  },
  {
    name: 'Stainless Steel Cable Markers',
    make: 'Partex',
    subGroup: 'PKS Embossed Steel Markers',
    description: 'Acid-proof AISI 316 stainless steel cable markers for harsh marine and chemical environments'
  },
  {
    name: 'Component & Terminal Block Marking',
    make: 'Partex',
    subGroup: 'Snap-On Terminal Markers',
    description: 'Snap-on terminal block markers and component identification tags for switchboards'
  },
  {
    name: 'Industrial Thermal Printers & Ribbons',
    make: 'Partex',
    subGroup: 'ProMark T-1000 Printers',
    description: 'Portable high-speed thermal transfer profile and label printers with resin ribbons'
  },
  {
    name: 'Industrial Cable Ties & Fasteners',
    make: 'Partex',
    subGroup: 'Polyamide & Steel Cable Ties',
    description: 'UV-resistant nylon cable ties, stainless steel ball-lock ties, and fastening mounts'
  }
];

app.get('/api/categories', async (req, res) => {
  try {
    // Ensure all 24 official categories exist with proper make and subgroup mappings
    for (const catDef of OFFICIAL_24_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: catDef.name },
        { 
          $set: { 
            make: catDef.make,
            subGroup: catDef.subGroup,
            description: catDef.description
          } 
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // Clean up empty obsolete placeholder names and permanently purge Solar Cables
    await Category.deleteMany({ name: { $regex: /^solar cables$/i } });
    await Product.updateMany(
      { categoryName: { $regex: /^solar cables$/i } },
      { $set: { categoryName: 'Domestic / House Wiring' } }
    );
    const obsoleteNames = ['Control Cables', 'Power Cables', 'Data & Communication', 'Cable Accessories', 'Solar Cables'];
    for (const oldName of obsoleteNames) {
      await Category.deleteOne({ name: oldName });
    }

    // Fetch all categories excluding obsolete ones
    const allCategories = await Category.find({ name: { $nin: ['Solar Cables', ...obsoleteNames] } });
    
    // Sort map based on OFFICIAL_24_CATEGORIES order
    const orderMap = new Map<string, number>();
    OFFICIAL_24_CATEGORIES.forEach((c, index) => {
      orderMap.set(c.name.toLowerCase().trim(), index);
    });

    const sortedCategories = allCategories.sort((a, b) => {
      const keyA = (a.name || '').toLowerCase().trim();
      const keyB = (b.name || '').toLowerCase().trim();
      const orderA = orderMap.has(keyA) ? (orderMap.get(keyA) as number) : 999;
      const orderB = orderMap.has(keyB) ? (orderMap.get(keyB) as number) : 999;
      if (orderA !== orderB) return orderA - orderB;
      return keyA.localeCompare(keyB);
    });

    res.json(sortedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json(OFFICIAL_24_CATEGORIES.map((c, idx) => ({ _id: `cat_${idx}`, ...c })));
  }
});

app.post('/api/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, description, make, subGroup, imageUrl, datasheetUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await Category.create({ 
      name: name.trim(), 
      description: description || '',
      make: make || 'LAPP',
      subGroup: subGroup || '',
      imageUrl: imageUrl || null,
      datasheetUrl: datasheetUrl || null
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create category' });
  }
});

app.put('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, make, subGroup, imageUrl, datasheetUrl } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name?.trim();
    if (description !== undefined) updateData.description = description;
    if (make !== undefined) updateData.make = make;
    if (subGroup !== undefined) updateData.subGroup = subGroup;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (datasheetUrl !== undefined) updateData.datasheetUrl = datasheetUrl;

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update category' });
  }
});

// Upload Category Datasheet (PDF) - Requirement 5.5
app.post('/api/categories/:id/datasheet', verifyAdmin, upload.single('datasheet'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No datasheet uploaded' });
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const updated = await Category.findByIdAndUpdate(req.params.id, { datasheetUrl: base64 }, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload category datasheet' });
  }
});

// Upload Category Image - Requirement 5.6
app.post('/api/categories/:id/image', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const updated = await Category.findByIdAndUpdate(req.params.id, { imageUrl: base64 }, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload category image' });
  }
});

app.delete('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// --- Brands API ---
// --- Make / Brand Management APIs (Strictly 4 Approved Makes: LAPP, Eaton, Partex, Mennekes) ---
const APPROVED_MAKES_LIST = ['LAPP', 'Eaton', 'Partex', 'Mennekes'] as const;

const getMakesHandler = async (req: express.Request, res: express.Response) => {
  try {
    // Ensure all 4 approved makes exist
    const defaultDescriptions: Record<string, string> = {
      'LAPP': "Global pioneer in flexible control cables, industrial data systems & cable glands (ÖLFLEX®, UNITRONIC®, SKINTOP®)",
      'Eaton': "Intelligent power management, industrial switchgear, motor protection breakers & contactors (PKZM0, DILM, NZM)",
      'Partex': "Swedish precision wire, cable and component marking systems, interlocking markers & portable thermal printers",
      'Mennekes': "Industrial earthing solutions, chemical electrodes, heavy-duty industrial plugs, sockets & distribution accessories (AMAPLAST, AMAXX®)"
    };

    for (const makeName of APPROVED_MAKES_LIST) {
      const exists = await Brand.findOne({ name: makeName });
      if (!exists) {
        await Brand.create({ name: makeName, description: defaultDescriptions[makeName] || 'Authorized Manufacturer Make' });
      }
    }

    // Fetch only approved makes
    const makes = await Brand.find({ name: { $in: APPROVED_MAKES_LIST } }).sort({ name: 1 });
    
    // Attach live product count and category count
    const enrichedMakes = await Promise.all(makes.map(async (m) => {
      const productCount = await Product.countDocuments({ brandName: m.name });
      const categoryCount = await Category.countDocuments({ make: m.name });
      return {
        _id: m._id,
        name: m.name,
        description: m.description,
        productCount,
        categoryCount,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      };
    }));

    const brandOrder = ['LAPP', 'Eaton', 'Partex', 'Mennekes'];
    enrichedMakes.sort((a, b) => {
      const idxA = brandOrder.indexOf(a.name);
      const idxB = brandOrder.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    res.json(enrichedMakes);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.json([
      { _id: 'm1', name: 'LAPP', description: 'Cables & Connection Technology', productCount: 822, categoryCount: 8 },
      { _id: 'm2', name: 'Eaton', description: 'Switchgear & Motor Control', productCount: 8, categoryCount: 2 },
      { _id: 'm3', name: 'Partex', description: 'Wire Marking Systems', productCount: 6, categoryCount: 1 },
      { _id: 'm4', name: 'Mennekes', description: 'Earthing & Distribution Accessories', productCount: 7, categoryCount: 2 }
    ]);
  }
};

app.get('/api/makes', getMakesHandler);
app.get('/api/brands', getMakesHandler);

const createMakeHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Make / Manufacturer name is required' });
    const cleanName = name.trim();
    if (!APPROVED_MAKES_LIST.includes(cleanName as any)) {
      return res.status(400).json({ 
        error: `Invalid make '${cleanName}'. Only the four approved manufacturers are permitted: ${APPROVED_MAKES_LIST.join(', ')}.` 
      });
    }
    const make = await Brand.findOneAndUpdate(
      { name: cleanName },
      { $set: { description: description || '' } },
      { upsert: true, returnDocument: 'after' }
    );
    res.status(201).json(make);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create make' });
  }
};

app.post('/api/makes', verifyAdmin, createMakeHandler);
app.post('/api/brands', verifyAdmin, createMakeHandler);

const updateMakeHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { name, description } = req.body;
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (name) {
      const cleanName = name.trim();
      if (!APPROVED_MAKES_LIST.includes(cleanName as any)) {
        return res.status(400).json({ 
          error: `Invalid make '${cleanName}'. Allowed makes are: ${APPROVED_MAKES_LIST.join(', ')}.` 
        });
      }
      updateData.name = cleanName;
    }
    const updated = await Brand.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Make not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update make' });
  }
};

app.put('/api/makes/:id', verifyAdmin, updateMakeHandler);
app.put('/api/brands/:id', verifyAdmin, updateMakeHandler);

const deleteMakeHandler = async (req: express.Request, res: express.Response) => {
  try {
    const make = await Brand.findById(req.params.id);
    if (!make) return res.status(404).json({ error: 'Make not found' });
    
    // Check if products exist for this make
    const prodsCount = await Product.countDocuments({ brandName: make.name });
    if (prodsCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete make '${make.name}' because ${prodsCount} products are mapped to it. Please reassign products first.` 
      });
    }
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Make deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete make' });
  }
};

app.delete('/api/makes/:id', verifyAdmin, deleteMakeHandler);
app.delete('/api/brands/:id', verifyAdmin, deleteMakeHandler);

// Get Products API
app.get('/api/products', async (req, res) => {
  try {
    const [products, allCategories] = await Promise.all([
      Product.find().sort({ createdAt: -1 }),
      Category.find()
    ]);
    const catMap = new Map(allCategories.map(c => [c.name?.toLowerCase().trim(), c.datasheetUrl]));

    // Deduplicate database records (latest created wins since sorted by createdAt: -1)
    const seenKeys = new Set<string>();
    const deduplicatedProducts: any[] = [];
    for (const p of products) {
      const pNo = p.partNo ? String(p.partNo).trim().toLowerCase() : null;
      const key = pNo || (p.name ? String(p.name).trim().toLowerCase() : p._id.toString());
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      deduplicatedProducts.push(p);
    }

    // Map data to match frontend expectations with strict core & sqmm normalization
    const formatted = deduplicatedProducts.map((p: any) => {
      const catKey = p.categoryName ? p.categoryName.toLowerCase().trim() : '';
      const fallbackDatasheet = catKey ? catMap.get(catKey) : null;

      // Normalize core
      let cleanCore: string | null = null;
      if (p.core !== undefined && p.core !== null && String(p.core).trim() !== '') {
        const coreNum = parseInt(String(p.core).replace(/cores?/gi, '').trim(), 10);
        if (!isNaN(coreNum) && coreNum > 0) cleanCore = coreNum.toString();
      }

      // Normalize sqmm / cross section
      const rawSqmm = p.sqmm || p.coreSize || (p.size !== null && p.size !== undefined ? String(p.size) : null);
      let cleanSqmm: string | null = null;
      let numericSize: number | null = null;
      if (rawSqmm !== null && rawSqmm !== undefined && String(rawSqmm).trim() !== '') {
        const cleanedStr = String(rawSqmm).replace(/,/g, '.').replace(/mm²|sqmm|sq\.?\s*mm/gi, '').trim();
        const parsedFloat = parseFloat(cleanedStr);
        if (!isNaN(parsedFloat) && parsedFloat > 0) {
          cleanSqmm = parsedFloat.toString();
          numericSize = parsedFloat;
        }
      }

      // Fallback: extract core and sqmm from product name (e.g. 3G1.5, 4X2,5)
      if ((!cleanCore || !cleanSqmm) && p.name) {
        const nameMatch = String(p.name).match(/(\d+)\s*[xXgG]\s*([0-9]+(?:[.,][0-9]+)?)/);
        if (nameMatch) {
          if (!cleanCore) {
            const parsedC = parseInt(nameMatch[1], 10);
            if (!isNaN(parsedC) && parsedC > 0) cleanCore = parsedC.toString();
          }
          if (!cleanSqmm) {
            const parsedS = parseFloat(nameMatch[2].replace(',', '.'));
            if (!isNaN(parsedS) && parsedS > 0) {
              cleanSqmm = parsedS.toString();
              if (numericSize === null) numericSize = parsedS;
            }
          }
        }
      }

      return {
        id: p._id.toString(),
        partNo: p.partNo,
        name: p.name,
        category: { name: p.categoryName },
        categoryName: p.categoryName,
        brand: { name: p.brandName },
        brandName: p.brandName,
        core: cleanCore || p.core,
        coreSize: cleanSqmm || p.coreSize,
        sqmm: cleanSqmm || p.sqmm || (numericSize ? String(numericSize) : null),
        size: numericSize !== null ? numericSize : (typeof p.size === 'number' ? p.size : null),
        colour: p.colour,
        uom: p.uom || 'Meter',
        outerDiameter: p.outerDiameter,
        weight: p.weight,
        copperIndex: p.copperIndex,
        testVoltage: p.testVoltage,
        flameRetardancy: p.flameRetardancy,
        price: p.price,
        mrp: p.mrp,
        gst: p.gst,
        validFrom: p.validFrom || null,
        expiryDate: p.expiryDate || null,
        imageUrl: p.imageUrl,
        datasheetUrl: p.datasheetUrl || fallbackDatasheet || null,
        categoryDatasheetUrl: fallbackDatasheet || null,
        description: p.description,
        application: p.description || p.name
      };
    });
    res.json(formatted);
  } catch (error) {
    console.error('DB fetch products failed, using fallback', error);
    res.json([
      { id: 'prod1', partNo: 'LAPP001', name: 'ÖLFLEX® CLASSIC 110', category: { name: 'Control Cables' }, brand: { name: 'LAPP' }, price: 45, uom: 'Meter', colour: 'Grey', core: '3', sqmm: '1.5' },
      { id: 'prod2', partNo: 'EATON101', name: 'Eaton 5P UPS', category: { name: 'Power Quality' }, brand: { name: 'Eaton' }, price: 12500, uom: 'Piece', colour: 'Black' }
    ]);
  }
});

// Get Single Product API
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const product = isObjectId 
      ? await Product.findById(id)
      : await Product.findOne({ partNo: id });
      
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const p: any = product;
    
    // Fall back to category datasheet if product does not have an individual one (Requirement 5.5)
    let resolvedDatasheet = p.datasheetUrl;
    if (!resolvedDatasheet && p.categoryName) {
      try {
        const cat = await Category.findOne({ name: p.categoryName });
        if (cat?.datasheetUrl) resolvedDatasheet = cat.datasheetUrl;
      } catch (catErr) {}
    }

    res.json({
      id: p._id.toString(),
      partNo: p.partNo,
      name: p.name,
      category: { name: p.categoryName },
      categoryName: p.categoryName,
      brand: { name: p.brandName },
      brandName: p.brandName,
      core: p.core,
      coreSize: p.coreSize,
      sqmm: p.sqmm || p.coreSize || (p.size ? String(p.size) : null),
      size: p.size,
      colour: p.colour,
      uom: p.uom || 'Meter',
      outerDiameter: p.outerDiameter,
      weight: p.weight,
      copperIndex: p.copperIndex,
      testVoltage: p.testVoltage,
      flameRetardancy: p.flameRetardancy,
      price: p.price,
      mrp: p.mrp,
      gst: p.gst,
      validFrom: p.validFrom || null,
      expiryDate: p.expiryDate || null,
      imageUrl: p.imageUrl,
      datasheetUrl: resolvedDatasheet,
      description: p.description,
      application: p.description || p.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Upload Product Image API
app.post('/api/products/:id/image', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });
    
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const updated = await Product.findByIdAndUpdate(req.params.id, { imageUrl: base64 }, { returnDocument: 'after' });
    
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload Product Datasheet API (PDF)
app.post('/api/products/:id/datasheet', verifyAdmin, upload.single('datasheet'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No datasheet uploaded' });
    
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const updated = await Product.findByIdAndUpdate(req.params.id, { datasheetUrl: base64 }, { returnDocument: 'after' });
    
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    console.error('Datasheet upload failed:', error);
    res.status(500).json({ error: 'Failed to upload datasheet' });
  }
});

// Delete Product Datasheet API
app.delete('/api/products/:id/datasheet', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { $unset: { datasheetUrl: 1 } }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Datasheet deleted successfully' });
  } catch (error) {
    console.error('Delete datasheet error:', error);
    res.status(500).json({ error: 'Failed to delete datasheet' });
  }
});

// Create Product API
app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price !== undefined && data.price !== '') {
      data.price = Number(data.price);
    } else {
      data.price = null;
    }
    if (data.mrp !== undefined && data.mrp !== '') {
      data.mrp = Number(data.mrp);
    } else {
      data.mrp = null;
    }
    if (data.gst !== undefined && data.gst !== '') {
      data.gst = Number(data.gst);
    } else {
      data.gst = 18;
    }
    if (data.imageUrl === '') {
      data.imageUrl = null;
    }
    if (data.datasheetUrl === '') {
      data.datasheetUrl = null;
    }
    if (!data.categoryId) delete data.categoryId;
    if (!data.brandId) delete data.brandId;

    // Validate Core Size & SQMM Combination
    const coreVal = data.core ? String(data.core).trim() : null;
    const sqmmVal = data.sqmm ? String(data.sqmm).trim() : (data.coreSize ? String(data.coreSize).trim() : null);
    if (coreVal && sqmmVal) {
      const validation = validateCoreSqmm(coreVal, sqmmVal);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    // Synchronize core, sqmm, coreSize, and numerical size
    if (coreVal) data.core = coreVal;
    if (sqmmVal) {
      data.sqmm = sqmmVal;
      data.coreSize = sqmmVal;
      const parsedNum = parseFloat(sqmmVal);
      if (!isNaN(parsedNum)) {
        data.size = parsedNum;
      }
    }
    if (data.colour) data.colour = String(data.colour).trim();
    if (data.uom) data.uom = String(data.uom).trim();

    // Auto-link Category and Brand ObjectIds if categoryName / brandName provided
    if (data.categoryName && !data.categoryId) {
      const cat = await Category.findOne({ name: data.categoryName.trim() });
      if (cat) data.categoryId = cat._id;
    }
    if (data.brandName && !data.brandId) {
      const br = await Brand.findOne({ name: data.brandName.trim() });
      if (br) data.brandId = br._id;
    }

    if (data.validFrom !== undefined) data.validFrom = data.validFrom ? String(data.validFrom).trim() : null;
    if (data.expiryDate !== undefined) data.expiryDate = data.expiryDate ? String(data.expiryDate).trim() : null;

    const newProduct = await Product.create(data);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update Product API
app.put('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price !== undefined && data.price !== '') {
      data.price = Number(data.price);
    } else if (data.price === '') {
      data.price = null;
    }
    if (data.mrp !== undefined && data.mrp !== '') {
      data.mrp = Number(data.mrp);
    } else if (data.mrp === '') {
      data.mrp = null;
    }
    if (data.gst !== undefined && data.gst !== '') {
      data.gst = Number(data.gst);
    }
    if (data.validFrom !== undefined) data.validFrom = data.validFrom ? String(data.validFrom).trim() : null;
    if (data.expiryDate !== undefined) data.expiryDate = data.expiryDate ? String(data.expiryDate).trim() : null;
    if (data.imageUrl === '') {
      data.imageUrl = null;
    }
    if (data.datasheetUrl === '') {
      data.datasheetUrl = null;
    }
    if (!data.categoryId) delete data.categoryId;
    if (!data.brandId) delete data.brandId;

    // Validate Core Size & SQMM Combination
    const coreVal = data.core !== undefined ? (data.core ? String(data.core).trim() : null) : undefined;
    const sqmmVal = data.sqmm !== undefined ? (data.sqmm ? String(data.sqmm).trim() : null) : (data.coreSize !== undefined ? (data.coreSize ? String(data.coreSize).trim() : null) : undefined);
    
    if (coreVal !== undefined || sqmmVal !== undefined) {
      const existing = await Product.findById(req.params.id);
      const effectiveCore = coreVal !== undefined ? coreVal : existing?.core;
      const effectiveSqmm = sqmmVal !== undefined ? sqmmVal : (existing?.sqmm || existing?.coreSize);
      if (effectiveCore && effectiveSqmm) {
        const validation = validateCoreSqmm(effectiveCore, effectiveSqmm);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }
      }
    }

    if (data.sqmm !== undefined) {
      data.sqmm = data.sqmm ? String(data.sqmm).trim() : null;
      data.coreSize = data.sqmm;
      const parsedNum = data.sqmm ? parseFloat(data.sqmm) : NaN;
      data.size = !isNaN(parsedNum) ? parsedNum : null;
    } else if (data.coreSize !== undefined) {
      data.sqmm = data.coreSize ? String(data.coreSize).trim() : null;
      const parsedNum = data.coreSize ? parseFloat(data.coreSize) : NaN;
      data.size = !isNaN(parsedNum) ? parsedNum : null;
    }

    if (data.colour !== undefined) data.colour = data.colour ? String(data.colour).trim() : null;
    if (data.uom !== undefined) data.uom = data.uom ? String(data.uom).trim() : 'Meter';

    if (data.categoryName && !data.categoryId) {
      const cat = await Category.findOne({ name: data.categoryName.trim() });
      if (cat) data.categoryId = cat._id;
    }
    if (data.brandName && !data.brandId) {
      const br = await Brand.findOne({ name: data.brandName.trim() });
      if (br) data.brandId = br._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after' });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete Product Image API
app.delete('/api/products/:id/image', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { $unset: { imageUrl: 1 } }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Delete Product API
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Bulk Delete Products API
app.post('/api/products/bulk-delete', verifyAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid or missing ids array' });
    }
    
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} products deleted successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

// Excel Bulk Import API (Supports full catalog import AND price-only updates per Requirement 5.8)
app.post('/api/products/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const isPriceOnly = req.query.mode === 'price_only' || req.body?.mode === 'price_only';
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ error: 'Excel file has no sheets' });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const data = xlsx.utils.sheet_to_json(worksheet) as any[];
      if (!data || data.length === 0) continue;

      // Determine default category & brand from sheet name if applicable
      let defaultCategory = 'Control Cables';
      const snLower = sheetName.toLowerCase();
      if (snLower.includes('skintop')) defaultCategory = 'Cable Glands';
      else if (snLower.includes('silvyn')) defaultCategory = 'Conduits & Accessories';
      else if (snLower.includes('liy') || snLower.includes('unitronic')) defaultCategory = 'Data & Signal Cables';
      else if (snLower.includes('uniplus') || snLower.includes('infra') || snLower.includes('fr')) defaultCategory = 'Single Core Wires';
      else if (snLower.includes('power')) defaultCategory = 'Power Cables';

      for (const [index, row] of data.entries()) {
        try {
          const rowNum = index + 2;
          const productName = row['Product Name'] || row['Product name'] || row['Description'] || row['Name'] || row['Part Description'];
          const partNo = row['Part No'] || row['Part no'] || row['Part Number'] || row['PartNo'] ? String(row['Part No'] || row['Part no'] || row['Part Number'] || row['PartNo']).trim() : null;

          if (!productName && !partNo) {
            continue; // Skip blank or header sub-rows
          }

          // Extract Price / LP
          const rawPrice = row['Price'] || row['Current LP'] || row['New LP'] || row[' LP '] || row['LP'] || row['Rate'] || row['List Price'];
          const price = rawPrice !== undefined && rawPrice !== null && rawPrice !== '' ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) : null;

          // Extract Price Validity (Requirement 5.9)
          const validFrom = row['Valid From'] || row['validFrom'] || row['Valid from'] ? String(row['Valid From'] || row['validFrom'] || row['Valid from']).trim() : null;
          const expiryDate = row['Expiry Date'] || row['expiryDate'] || row['Valid To'] || row['validTo'] ? String(row['Expiry Date'] || row['expiryDate'] || row['Valid To'] || row['validTo']).trim() : null;

          // Requirement 5.8: Price-only update mode
          if (isPriceOnly) {
            if (!partNo) continue;
            if (price !== null && !isNaN(price)) {
              const priceUpdate: any = { price };
              if (validFrom) priceUpdate.validFrom = validFrom;
              if (expiryDate) priceUpdate.expiryDate = expiryDate;
              await Product.findOneAndUpdate({ partNo }, { $set: priceUpdate });
              successCount++;
            }
            continue;
          }

          const resolvedName = String(productName || (partNo ? `LAPP Product ${partNo}` : 'Industrial Cable'));
          const categoryName = row['Category'] || row['Category Name'] ? String(row['Category'] || row['Category Name']).trim() : defaultCategory;
          const brandName = row['Brand'] || row['Brand Name'] ? String(row['Brand'] || row['Brand Name']).trim() : 'LAPP KABEL';

          // Extract MRP / SP
          const rawMrp = row['MRP'] || row['Current SP'] || row['New SP'] || row['SP'] || row['Selling Price'];
          const mrp = rawMrp !== undefined && rawMrp !== null && rawMrp !== '' ? parseFloat(String(rawMrp).replace(/[^0-9.]/g, '')) : null;

          // Extract GST
          const rawGst = row['GST'] || row['Tax'];
          const gst = rawGst !== undefined && rawGst !== null && rawGst !== '' ? parseFloat(String(rawGst).replace(/[^0-9.]/g, '')) : 18;

          // Extract Specs: Core, Core Size, SQMM, Colour, PE, UOM
          const core = row['Core'] || row['Cores'] !== undefined ? String(row['Core'] || row['Cores']).trim() : null;
          const rawSqmm = row['SQMM'] || row['sqmm'] || row['Sqmm'] || row['Core Size'] || row['Core size'] || row['Size'] !== undefined ? String(row['SQMM'] || row['sqmm'] || row['Sqmm'] || row['Core Size'] || row['Core size'] || row['Size']).trim() : null;
          const coreSize = rawSqmm;
          const sqmm = rawSqmm;
          const parsedSize = rawSqmm ? parseFloat(rawSqmm) : null;
          const colour = row['Colour'] || row['Color'] || row['colour'] || row['color'] ? String(row['Colour'] || row['Color'] || row['colour'] || row['color']).trim() : null;
          const pe = row['PE'] || row['pe'] ? String(row['PE'] || row['pe']) : null;
          const uom = row['Pack size'] || row['Pack Size'] || row['UOM'] || row['Unit'] || (snLower.includes('skintop') || snLower.includes('silvyn') ? 'Piece' : 'Meter');

          const outerDiameter = row['Outer Diameter'] || row['Outer Dia'] || row['OD'] ? String(row['Outer Diameter'] || row['Outer Dia'] || row['OD']) : null;
          const copperIndex = row['Copper Index'] ? String(row['Copper Index']) : null;
          const weight = row['Weight'] ? String(row['Weight']) : null;
          const testVoltage = row['Test Voltage'] ? String(row['Test Voltage']) : null;
          const flameRetardancy = row['Flame Retardancy'] ? String(row['Flame Retardancy']) : null;
          const description = row['Description'] ? String(row['Description']) : null;

          const productPayload: any = {
            partNo,
            name: resolvedName,
            description,
            categoryName,
            brandName,
            price: isNaN(price as number) ? null : price,
            mrp: isNaN(mrp as number) ? null : mrp,
            gst: isNaN(gst as number) ? 18 : gst,
            validFrom,
            expiryDate,
            uom: String(uom).trim(),
            colour,
            core,
            coreSize,
            sqmm,
            pe,
            size: parsedSize && !isNaN(parsedSize) ? parsedSize : null,
            outerDiameter,
            copperIndex,
            weight,
            testVoltage,
            flameRetardancy
          };

          if (partNo) {
            // Upsert by Part Number
            await Product.findOneAndUpdate({ partNo }, productPayload, { upsert: true, new: true });
          } else {
            await Product.create(productPayload);
          }
          successCount++;
        } catch (rowError: any) {
          failedCount++;
          errors.push({ sheet: sheetName, row: index + 2, error: rowError.message });
        }
      }
    }

    res.json({
      message: isPriceOnly 
        ? `Price-only update completed: ${successCount} product rates updated.`
        : `Import completed across all sheets. ${successCount} products imported/updated successfully.`,
      successCount,
      failedCount,
      errors: errors.slice(0, 10)
    });

  } catch (error: any) {
    console.error('Import Error:', error);
    res.status(500).json({ error: 'Failed to process Excel file', details: error.message });
  }
});



// Start Server
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

export default app;
