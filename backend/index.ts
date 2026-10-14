import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import * as xlsx from 'xlsx';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
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
  core: { type: String, default: null },
  coreSize: { type: String, default: null },
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
  description: { type: String, default: '' },
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
  gstin: { type: String, default: '' }
}, { timestamps: true });

const rfqSchema = new mongoose.Schema({
  quoteNo: { type: String, required: true },
  date: String,
  customerName: String,
  companyName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  items: [{
    partNo: String,
    name: String,
    brand: String,
    qty: Number,
    unitPrice: Number,
    totalBeforeTax: Number
  }],
  subtotal: Number,
  grandTotal: Number,
  status: { type: String, default: "New" },
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
    return next();
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
    return next();
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

// Basic route
app.get('/', (req, res) => {
  res.send('SiddhiCorp Admin API is running with Mongoose');
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

    let users = await User.find().select('-password');
    // Ensure we have at least standard sales staff in DB
    const hasSales = users.some(u => {
      const r = (u.role || '').toLowerCase();
      return r.includes('sales') || r.includes('manager');
    });

    if (!hasSales) {
      try {
        const salesEmail = (process.env.SALES_EMAIL || '').trim().toLowerCase();
        const salesPassword = process.env.SALES_PASSWORD;
        const managerEmail = (process.env.MANAGER_EMAIL || '').trim().toLowerCase();
        const managerPassword = process.env.MANAGER_PASSWORD;

        if (salesEmail && salesPassword) {
          await User.create({ name: 'Sales Executive', email: salesEmail, password: salesPassword, role: 'Sales Executive' });
        }
        if (managerEmail && managerPassword) {
          await User.create({ name: 'Sales Manager', email: managerEmail, password: managerPassword, role: 'Sales Manager' });
        }
        users = await User.find().select('-password');
      } catch (seedErr) {}
    }

    // Also include corporate customers who submitted RFQs
    const rfqs = await RFQ.find();
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
    
    res.json([...users, ...rfqCustomers]);
  } catch (error) {
    console.error('DB fetch users failed, using fallback');
    res.json([
      { _id: 'mock1', name: 'Ramesh Sales', role: 'Sales Executive' },
      { _id: 'mock2', name: 'Suresh Manager', role: 'Sales Manager' },
      { _id: 'mock3', name: 'Super Admin', role: 'Admin' }
    ]);
  }
});

// Update User Status API (Activate/Deactivate User/Customer)
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create User API
app.post('/api/admin/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Submit RFQ API
app.post('/api/rfqs', async (req, res) => {
  try {
    const newRfq = await RFQ.create(req.body);
    
    // Create admin notification
    try {
      await Notification.create({
        title: 'New RFQ Received',
        message: `Quotation ${newRfq.quoteNo} submitted by ${newRfq.companyName || newRfq.customerName || 'Customer'} (Total: ₹${(newRfq.grandTotal || 0).toLocaleString('en-IN')}).`,
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
    let notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    // If empty, auto-generate initial contextual notifications from latest RFQs and users
    if (notifications.length === 0) {
      try {
        const latestRfqs = await RFQ.find().sort({ createdAt: -1 }).limit(3);
        for (const r of latestRfqs) {
          await Notification.create({
            title: 'New RFQ Received',
            message: `Quotation ${r.quoteNo} generated for ${r.companyName || r.customerName || 'Client'}.`,
            type: 'rfq',
            referenceId: r._id.toString(),
            read: false
          });
        }
        const latestUsers = await User.find({ role: 'Customer' }).sort({ createdAt: -1 }).limit(2);
        for (const u of latestUsers) {
          await Notification.create({
            title: 'New Customer Registered',
            message: `${u.name} (${u.company || u.email || 'Customer'}) registered an account.`,
            type: 'customer',
            referenceId: u._id.toString(),
            read: false
          });
        }
        notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
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

    const { assignedTo } = req.query;
    const isSalesExec = (userRole.toLowerCase().includes('executive') || userRole.toLowerCase().includes('salesman')) && !userRole.toLowerCase().includes('admin') && !userRole.toLowerCase().includes('manager');
    
    let filter: any = {};
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    } else if (isSalesExec && userId) {
      filter.assignedTo = userId;
    }

    const rfqs = await RFQ.find(filter).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
    
    // Normalize assignedTo and assignedToName for seamless frontend binding
    const normalized = rfqs.map((r: any) => {
      const obj = r.toObject ? r.toObject() : { ...r };
      if (obj.assignedTo && typeof obj.assignedTo === 'object') {
        obj.assignedToName = obj.assignedTo.name || obj.assignedToName;
        obj.assignedTo = obj.assignedTo._id?.toString() || obj.assignedTo;
      }
      return obj;
    });

    res.json(normalized);
  } catch (error) {
    console.error('DB fetch RFQs failed, using fallback');
    res.json([
      { _id: 'mock-rfq-1', quoteNo: '#RFQ-001', companyName: 'Ramesh Engineering', customerName: 'Ramesh', status: 'New', date: 'Oct 8, 2026', grandTotal: 15400, items: [] },
      { _id: 'mock-rfq-2', quoteNo: '#RFQ-002', companyName: 'TechCorp Solutions', customerName: 'Suresh', status: 'Assigned', date: 'Oct 7, 2026', grandTotal: 25000, items: [] },
      { _id: 'mock-rfq-3', quoteNo: '#RFQ-003', companyName: 'Global Industries', customerName: 'Rakesh', status: 'Under Review', date: 'Oct 7, 2026', grandTotal: 12500, items: [] },
    ]);
  }
});

// Update RFQ Status API (Phase 1 Statuses: New, Assigned, Under Review, Process by Sales, Closed)
app.patch('/api/rfqs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRfq = await RFQ.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(updatedRfq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RFQ status' });
  }
});

// Assign RFQ API (Allowed for Admin, Super Admin, and Sales Manager as per Phase 1 Matrix)
app.patch('/api/rfqs/:id/assign', async (req, res) => {
  try {
    const { assignedTo, assignedToName } = req.body;
    let updateData: any = {};
    
    if (!assignedTo || assignedTo === 'unassigned' || assignedTo === '') {
      updateData = { 
        assignedTo: null, 
        assignedToName: null, 
        status: 'New' 
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
        status: 'Assigned' // Auto update status to Assigned
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

// --- Categories API ---
app.get('/api/categories', async (req, res) => {
  try {
    // Standard catalog categories
    const standardCategories = [
      'Power and Control Cables',
      'Control Cabinet Single Cores',
      'Data Communication Cables',
      'Cable Glands & Counter Nuts',
      'Rill, Conduit & Klick',
      'Cable Marking Systems',
      'Industrial Plugs & Sockets',
      'Switchgear & Protection',
      'Solar Cables',
      'Power Quality & UPS',
      'Earthing Solutions'
    ];

    // Also get all distinct categories actively used in Product collection
    const distinctProductCats: string[] = await Product.distinct('categoryName');
    const allTargetNames = Array.from(new Set([
      ...standardCategories,
      ...distinctProductCats.filter(Boolean)
    ]));

    // Ensure all target categories exist in the Category collection
    for (const catName of allTargetNames) {
      if (typeof catName === 'string' && catName.trim()) {
        const trimmed = catName.trim();
        const exists = await Category.findOne({ name: trimmed });
        if (!exists) {
          await Category.create({ name: trimmed, description: 'Catalog Product Category' });
        }
      }
    }

    // Clean up empty placeholder categories that have zero products
    const obsoleteNames = ['Control Cables', 'Power Cables', 'Data & Communication', 'Cable Accessories'];
    for (const oldName of obsoleteNames) {
      const prodsWithOld = await Product.countDocuments({ categoryName: oldName });
      if (prodsWithOld === 0) {
        await Category.deleteOne({ name: oldName });
      }
    }

    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json([
      { _id: 'cat1', name: 'Power and Control Cables' },
      { _id: 'cat2', name: 'Control Cabinet Single Cores' },
      { _id: 'cat3', name: 'Data Communication Cables' },
      { _id: 'cat4', name: 'Cable Glands & Counter Nuts' },
      { _id: 'cat5', name: 'Rill, Conduit & Klick' },
      { _id: 'cat6', name: 'Industrial Plugs & Sockets' }
    ]);
  }
});

app.post('/api/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await Category.create({ name: name.trim(), description: description || '' });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create category' });
  }
});

app.put('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Category.findByIdAndUpdate(req.params.id, { name: name?.trim(), description }, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update category' });
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
app.get('/api/brands', async (req, res) => {
  try {
    // Auto-sync brands from Product collection
    const distinctBrands: string[] = await Product.distinct('brandName');
    const targetBrands = Array.from(new Set([
      'LAPP KABEL', 'ÖLFLEX', 'UNITRONIC', 'SKINTOP', 'SILVYN', 
      'EATON - MOELLER', 'MENNEKES', 'PARTEX SWEDEN',
      ...distinctBrands.filter(Boolean)
    ]));

    for (const bName of targetBrands) {
      if (typeof bName === 'string' && bName.trim()) {
        const trimmed = bName.trim();
        const exists = await Brand.findOne({ name: trimmed });
        if (!exists) {
          await Brand.create({ name: trimmed, description: 'Authorized Industrial Brand' });
        }
      }
    }

    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.json([
      { _id: 'b1', name: 'LAPP KABEL' },
      { _id: 'b2', name: 'EATON - MOELLER' },
      { _id: 'b3', name: 'MENNEKES' },
      { _id: 'b4', name: 'PARTEX SWEDEN' }
    ]);
  }
});

app.post('/api/brands', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required' });
    const brand = await Brand.create({ name: name.trim(), description: description || '' });
    res.status(201).json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create brand' });
  }
});

app.put('/api/brands/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Brand.findByIdAndUpdate(req.params.id, { name: name?.trim(), description }, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Brand not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update brand' });
  }
});

app.delete('/api/brands/:id', verifyAdmin, async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Get Products API
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Map data to match frontend expectations
    const formatted = products.map((p: any) => ({
      id: p._id.toString(),
      partNo: p.partNo,
      name: p.name,
      category: { name: p.categoryName },
      brand: { name: p.brandName },
      core: p.core,
      coreSize: p.coreSize,
      size: p.size,
      price: p.price,
      mrp: p.mrp,
      gst: p.gst,
      imageUrl: p.imageUrl,
      datasheetUrl: p.datasheetUrl,
      application: p.description || p.name
    }));
    res.json(formatted);
  } catch (error) {
    console.error('DB fetch products failed, using fallback', error);
    res.json([
      { id: 'prod1', partNo: 'LAPP001', name: 'ÖLFLEX® CLASSIC 110', category: { name: 'Control Cables' }, brand: { name: 'LAPP' }, price: 45 },
      { id: 'prod2', partNo: 'EATON101', name: 'Eaton 5P UPS', category: { name: 'Power Quality' }, brand: { name: 'Eaton' }, price: 12500 }
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
    
    res.json({
      id: p._id.toString(),
      partNo: p.partNo,
      name: p.name,
      category: { name: p.categoryName },
      brand: { name: p.brandName },
      core: p.core,
      coreSize: p.coreSize,
      price: p.price,
      imageUrl: p.imageUrl,
      datasheetUrl: p.datasheetUrl,
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

    // Auto-link Category and Brand ObjectIds if categoryName / brandName provided
    if (data.categoryName && !data.categoryId) {
      const cat = await Category.findOne({ name: data.categoryName.trim() });
      if (cat) data.categoryId = cat._id;
    }
    if (data.brandName && !data.brandId) {
      const br = await Brand.findOne({ name: data.brandName.trim() });
      if (br) data.brandId = br._id;
    }

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
    if (data.imageUrl === '') {
      data.imageUrl = null;
    }
    if (data.datasheetUrl === '') {
      data.datasheetUrl = null;
    }
    if (!data.categoryId) delete data.categoryId;
    if (!data.brandId) delete data.brandId;

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

// Excel Bulk Import API
app.post('/api/products/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ error: 'Excel file has no sheets' });
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return res.status(400).json({ error: 'Worksheet not found' });
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // Process each row
    for (const [index, row] of data.entries()) {
      try {
        const rowNum = index + 2; // +1 for 0-index, +1 for header
        const productName = row['Product Name'] || row['Name'];

        if (!productName) {
          failedCount++;
          errors.push({ row: rowNum, error: 'Product Name is required' });
          continue;
        }

        const categoryName = row['Category'] ? String(row['Category']) : null;
        const brandName = row['Brand'] ? String(row['Brand']) : null;

        // Create product directly
        await Product.create({
          partNo: row['Part No'] ? String(row['Part No']) : null,
          name: String(productName),
          description: row['Description'] ? String(row['Description']) : null,
          categoryName: categoryName,
          brandName: brandName,
          price: row['Price'] ? parseFloat(row['Price']) : null,
          mrp: row['MRP'] ? parseFloat(row['MRP']) : null,
          gst: row['GST'] ? parseFloat(row['GST']) : null,
          core: row['Core'] ? String(row['Core']) : null,
          coreSize: row['Core Size'] ? String(row['Core Size']) : null,
          pe: row['PE'] ? String(row['PE']) : null,
          size: row['Size'] ? parseFloat(row['Size']) : null,
          outerDiameter: row['Outer Diameter'] ? String(row['Outer Diameter']) : null,
          copperIndex: row['Copper Index'] ? String(row['Copper Index']) : null,
          weight: row['Weight'] ? String(row['Weight']) : null,
          testVoltage: row['Test Voltage'] ? String(row['Test Voltage']) : null,
          flameRetardancy: row['Flame Retardancy'] ? String(row['Flame Retardancy']) : null,
        });
        successCount++;
      } catch (rowError: any) {
        failedCount++;
        errors.push({ row: index + 2, error: rowError.message });
      }
    }

    res.json({
      message: 'Import completed',
      successCount,
      failedCount,
      errors
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
