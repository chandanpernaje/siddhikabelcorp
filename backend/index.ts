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
app.use(express.json());

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
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
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
  verifyToken(req, res, () => {
    if (req.userRole !== 'Admin' && req.userRole !== 'Super Admin') {
      return res.status(403).json({ error: 'Require Admin Role' });
    }
    next();
  });
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
    let user = await User.findOne({ email, password });
    
    // Auto-create super admin if no users exist
    if (!user && email === 'admin@siddhicorp.com' && password === 'admin123') {
      const count = await User.countDocuments();
      if (count === 0) {
        user = await User.create({ name: 'Super Admin', email: 'admin@siddhicorp.com', password: 'admin123', role: 'Admin' });
        // Also create a dummy sales exec
        await User.create({ name: 'Ramesh Sales', email: 'ramesh@siddhicorp.com', password: 'sales123', role: 'Sales Executive' });
      }
    }
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard Stats API
app.get('/api/admin/dashboard', verifyToken, async (req, res) => {
  try {
    const [totalCustomers, totalProducts, totalRFQs, pendingRFQs, recentRFQs] = await Promise.all([
      User.countDocuments({ role: { $ne: 'Admin' } }), // Roughly customers + sales
      Product.countDocuments(),
      RFQ.countDocuments(),
      RFQ.countDocuments({ status: { $in: ['New', 'RFQ Submitted', 'Pending'] } }),
      RFQ.find().sort({ createdAt: -1 }).limit(6)
    ]);
    res.json({
      totalCustomers,
      totalProducts,
      totalRFQs,
      pendingRFQs,
      recentRFQs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get Admin Users API
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('DB fetch users failed, using fallback');
    res.json([
      { _id: 'mock1', name: 'Ramesh Engineering', role: 'Sales Executive' },
      { _id: 'mock2', name: 'TechCorp Solutions', role: 'Sales Manager' },
      { _id: 'mock3', name: 'Super Admin', role: 'Admin' }
    ]);
  }
});

// Create User API
app.post('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Submit RFQ API
app.post('/api/rfqs', verifyToken, async (req, res) => {
  try {
    const newRfq = await RFQ.create(req.body);
    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ error: 'Failed to submit RFQ' });
  }
});

// Get My RFQs API (for Customer)
app.get('/api/rfqs/my', verifyToken, async (req, res) => {
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
app.get('/api/rfqs', verifyToken, async (req, res) => {
  try {
    // If a sales executive requests, they should ideally only see their assigned ones.
    // For now, we'll let the frontend pass an assignedTo filter if needed
    const { assignedTo } = req.query;
    const filter = assignedTo ? { assignedTo: assignedTo as string } : {};
    
    const rfqs = await RFQ.find(filter).sort({ createdAt: -1 });
    res.json(rfqs);
  } catch (error) {
    console.error('DB fetch RFQs failed, using fallback');
    res.json([
      { _id: 'mock-rfq-1', quoteNo: '#RFQ-001', companyName: 'Ramesh Engineering', customerName: 'Ramesh', status: 'Pending', date: 'Oct 8, 2026', grandTotal: 15400, items: [] },
      { _id: 'mock-rfq-2', quoteNo: '#RFQ-002', companyName: 'TechCorp Solutions', customerName: 'Suresh', status: 'Assigned', date: 'Oct 7, 2026', grandTotal: 25000, items: [] },
      { _id: 'mock-rfq-3', quoteNo: '#RFQ-003', companyName: 'Global Industries', customerName: 'Rakesh', status: 'Quoted', date: 'Oct 7, 2026', grandTotal: 12500, items: [] },
    ]);
  }
});

// Update RFQ Status API
app.patch('/api/rfqs/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRfq = await RFQ.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(updatedRfq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RFQ status' });
  }
});

// Assign RFQ API
app.patch('/api/rfqs/:id/assign', verifyAdmin, async (req, res) => {
  try {
    const { assignedTo, assignedToName } = req.body;
    const updatedRfq = await RFQ.findByIdAndUpdate(req.params.id, { 
      assignedTo, 
      assignedToName,
      status: 'Assigned' // Auto update status
    }, { returnDocument: 'after' });
    if (!updatedRfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(updatedRfq);
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
      imageUrl: p.imageUrl
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

// Create Product API
app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update Product API
app.put('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Upload Product Image API
app.post('/api/products/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    // In a real app, upload to S3/Cloudinary and get URL.
    // Here we'll just mock a URL or save it locally.
    // For local, we'd need express.static. Let's just create a mock or data URI
    // But since multer uses memoryStorage (assuming), let's create a base64 string
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { imageUrl: base64Image }, 
      { new: true }
    );
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Image uploaded successfully', imageUrl: product.imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
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

// Product Image Upload API
app.post('/api/products/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    
    // In a real app we would upload to S3/Cloudinary. 
    // Here we'll convert it to base64 for simplicity in local demo
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const updated = await Product.findByIdAndUpdate(req.params.id, { imageUrl: base64Image }, { returnDocument: 'after' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}

export default app;
