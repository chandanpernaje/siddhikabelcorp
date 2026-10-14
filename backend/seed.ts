import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

// Setup MongoDB connection
const mongoURI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/siddhicorp';
console.log('Connecting to:', mongoURI);

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

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Need to read the TS files, but ts-node can execute this.
// We will dynamically import the compiled/raw data if possible.
// Actually, it's easier to just copy the data structure or run via tsx.

import { NEW_LAPP_OTHER_PRODUCTS } from '../src/data/lappOtherData';
import { PRODUCTS_DATA } from '../src/data/products';

async function seed() {
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Successfully connected to MongoDB!');

    let addedCount = 0;

    for (const prod of NEW_LAPP_OTHER_PRODUCTS) {
      // check if exists
      const exists = await Product.findOne({ partNo: prod.partNo });
      if (!exists) {
        await Product.create({
          partNo: prod.partNo,
          name: prod.name,
          description: prod.desc,
          brandName: prod.brand,
          price: prod.price,
          mrp: prod.mrp,
          gst: prod.gst,
          core: String(prod.core),
          pe: prod.pe,
          size: prod.size,
          categoryName: 'Cables'
        });
        addedCount++;
      }
    }
    
    for (const prod of PRODUCTS_DATA) {
      // check if exists
      const exists = await Product.findOne({ partNo: prod.partNo });
      if (!exists) {
        await Product.create({
          partNo: prod.partNo,
          name: prod.name,
          description: prod.application || prod.specs?.[0],
          brandName: prod.brand,
          price: prod.price,
          categoryName: prod.category,
          imageUrl: prod.image,
        });
        addedCount++;
      }
    }

    console.log(`✅ Seed complete! Added ${addedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}

seed();
