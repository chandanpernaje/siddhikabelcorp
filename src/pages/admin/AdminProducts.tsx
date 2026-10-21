import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, Plus, Download, FileSpreadsheet, Search, ShoppingBag, X, 
  Image as ImageIcon, Trash2, Link as LinkIcon, RefreshCw, Layers, Tag, 
  Edit2, FileText, CheckCircle2, AlertCircle, ExternalLink, Eye,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface CategoryItem {
  _id: string;
  name: string;
  description?: string;
}

interface BrandItem {
  _id: string;
  name: string;
  description?: string;
}

export const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<'Products' | 'Categories' | 'Brands'>('Products');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBrand, setActiveBrand] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'partNo' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  
  // Datasheet State
  const [modalDatasheet, setModalDatasheet] = useState<string | null>(null);
  const [datasheetInputMode, setDatasheetInputMode] = useState<'upload' | 'url'>('upload');
  const [datasheetUrlInput, setDatasheetUrlInput] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Category / Brand Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState<CategoryItem | null>(null);
  const [catFormData, setCatFormData] = useState({ name: '', description: '' });

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<BrandItem | null>(null);
  const [brandFormData, setBrandFormData] = useState({ name: '', description: '' });

  // Current admin details & role permissions (Case-Insensitive check)
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const rawRole = (currentAdmin?.role || '').toLowerCase().trim();
  const isSuperAdmin = rawRole.includes('super');
  const isAdmin = rawRole.includes('admin') || isSuperAdmin || !currentAdminStr;
  const isSalesManager = rawRole.includes('manager');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/brands`);
      if (res.ok) {
        setBrands(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch brands', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/import`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      setUploadResult(data);
      
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Upload failed', error);
      setUploadResult({ error: 'Failed to connect to the server' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openAddModal = () => {
    setCurrentProduct(null);
    setModalImage(null);
    setImageUrlInput('');
    setImageInputMode('upload');
    setModalDatasheet(null);
    setDatasheetUrlInput('');
    setDatasheetInputMode('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setCurrentProduct(product);
    setModalImage(product.imageUrl || null);
    setImageUrlInput(product.imageUrl || '');
    setImageInputMode('upload');
    setModalDatasheet(product.datasheetUrl || null);
    setDatasheetUrlInput(product.datasheetUrl || '');
    setDatasheetInputMode('upload');
    setIsModalOpen(true);
  };

  // Image Upload Handlers
  const handleModalImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setModalImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Datasheet (PDF) Upload Handlers
  const handleModalDatasheetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF datasheet file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Datasheet PDF size should be less than 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setModalDatasheet(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { 
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (error) {
      console.error('Bulk delete failed', error);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: any = Object.fromEntries(formData.entries());

    data.imageUrl = modalImage || '';
    data.datasheetUrl = modalDatasheet || datasheetUrlInput || '';

    try {
      const token = localStorage.getItem('token');
      const url = currentProduct ? `${API_BASE_URL}/api/products/${currentProduct.id}` : `${API_BASE_URL}/api/products`;
      const method = currentProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setModalImage(null);
        setModalDatasheet(null);
        fetchProducts();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to connect to the server');
    } finally {
      setIsSaving(false);
    }
  };

  // Category Save / Delete
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = currentCat ? `${API_BASE_URL}/api/categories/${currentCat._id}` : `${API_BASE_URL}/api/categories`;
      const method = currentCat ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(catFormData)
      });
      if (res.ok) {
        setIsCatModalOpen(false);
        setCurrentCat(null);
        setCatFormData({ name: '', description: '' });
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Brand Save / Delete
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = currentBrand ? `${API_BASE_URL}/api/brands/${currentBrand._id}` : `${API_BASE_URL}/api/brands`;
      const method = currentBrand ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(brandFormData)
      });
      if (res.ok) {
        setIsBrandModalOpen(false);
        setCurrentBrand(null);
        setBrandFormData({ name: '', description: '' });
        fetchBrands();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (res.ok) fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  // Count products per category
  const categoryCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category?.name || p.categoryName || '';
      if (catName) {
        const key = catName.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Combined list of categories from backend /api/categories AND products in state
  const dropdownCategories = React.useMemo(() => {
    const catMap = new Map<string, string>();
    categories.forEach((c) => {
      if (c.name && c.name.trim()) {
        catMap.set(c.name.trim().toLowerCase(), c.name.trim());
      }
    });
    products.forEach((p) => {
      const name = p.category?.name || p.categoryName;
      if (name && typeof name === 'string' && name.trim()) {
        const key = name.trim().toLowerCase();
        if (!catMap.has(key)) {
          catMap.set(key, name.trim());
        }
      }
    });
    return Array.from(catMap.values()).sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  // Count products per brand
  const brandCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const brandName = p.brand?.name || p.brandName || '';
      if (brandName) {
        const key = brandName.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Combined list of brands from backend /api/brands AND products in state
  const dropdownBrands = React.useMemo(() => {
    const brandMap = new Map<string, string>();
    brands.forEach((b) => {
      if (b.name && b.name.trim()) {
        brandMap.set(b.name.trim().toLowerCase(), b.name.trim());
      }
    });
    products.forEach((p) => {
      const name = p.brand?.name || p.brandName;
      if (name && typeof name === 'string' && name.trim()) {
        const key = name.trim().toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, name.trim());
        }
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  // Filter Products by Search, Category, and Brand
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const pCat = (p.category?.name || p.categoryName || '').toLowerCase().trim();
      const pBrand = (p.brand?.name || p.brandName || '').toLowerCase().trim();

      const matchesSearch = 
        !searchQuery.trim() ||
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.partNo && p.partNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pBrand.includes(searchQuery.toLowerCase()) ||
        pCat.includes(searchQuery.toLowerCase());

      const activeCatLower = activeCategory.toLowerCase().trim();
      const matchesCategory = 
        activeCategory === 'All' || 
        pCat === activeCatLower ||
        (activeCatLower === 'control cables' && pCat.includes('control')) ||
        (activeCatLower === 'power cables' && pCat.includes('power')) ||
        (activeCatLower === 'cable accessories' && (pCat.includes('gland') || pCat.includes('rill')));

      const activeBrandLower = activeBrand.toLowerCase().trim();
      const matchesBrand =
        activeBrand === 'All' ||
        pBrand === activeBrandLower;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchQuery, activeCategory, activeBrand]);

  // Sort Products (Product Name and Part Number ascending/descending)
  const sortedProducts = React.useMemo(() => {
    if (!sortField) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase().trim();
      const valB = String(b[sortField] || '').toLowerCase().trim();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'partNo') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Product & Catalog Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSalesManager 
              ? 'Catalog View Mode (Sales Manager View-Only Access)' 
              : 'Add, edit, bulk import products, technical specifications, and manufacturer datasheets.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => { fetchProducts(); fetchCategories(); fetchBrands(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {isAdmin && activeTab === 'Products' && (
            <>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <button
                  disabled={uploading}
                  className={`flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" /> : <FileSpreadsheet size={14} className="mr-1" />}
                  {uploading ? 'Importing...' : 'Bulk Excel'}
                </button>
              </div>

              <button 
                onClick={openAddModal}
                className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Add Product
              </button>
            </>
          )}

          {isAdmin && activeTab === 'Categories' && (
            <button 
              onClick={() => { setCurrentCat(null); setCatFormData({ name: '', description: '' }); setIsCatModalOpen(true); }}
              className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
            >
              <Plus size={14} className="mr-1" />
              Add Category
            </button>
          )}

          {isAdmin && activeTab === 'Brands' && (
            <button 
              onClick={() => { setCurrentBrand(null); setBrandFormData({ name: '', description: '' }); setIsBrandModalOpen(true); }}
              className="flex items-center px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-lg transition-all shadow-md shadow-red-600/20 text-xs cursor-pointer"
            >
              <Plus size={14} className="mr-1" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-sm font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('Products')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Products' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag size={16} />
          Products Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('Categories')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Categories' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          Category Management ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('Brands')}
          className={`px-5 py-2.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'Brands' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag size={16} />
          Brand Management ({brands.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS CATALOG */}
      {activeTab === 'Products' && (
        <div className="space-y-3">
          {/* Search, Category & Brand Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search products by name, part no, category, or brand..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 cursor-pointer hover:border-slate-300"
                title="Filter by Category"
              >
                <option value="All">All Categories ({products.length})</option>
                {dropdownCategories.map((catName) => {
                  const count = categoryCountMap[catName.toLowerCase().trim()] || 0;
                  return (
                    <option key={catName} value={catName}>
                      {catName} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>

              {/* Brand Filter */}
              <select
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none font-semibold text-slate-700 cursor-pointer hover:border-slate-300"
                title="Filter by Brand"
              >
                <option value="All">All Brands ({products.length})</option>
                {dropdownBrands.map((brandName) => {
                  const count = brandCountMap[brandName.toLowerCase().trim()] || 0;
                  return (
                    <option key={brandName} value={brandName}>
                      {brandName} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>

              {isAdmin && selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Products Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[950px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <tr>
                    {isAdmin && (
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input 
                          type="checkbox" 
                          checked={sortedProducts.length > 0 && selectedIds.length === sortedProducts.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                        />
                      </th>
                    )}
                    <th 
                      onClick={() => handleSort('name')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-100 select-none group transition-colors"
                      title="Click to sort by Product Name (Ascending / Descending)"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Product Name</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp size={13} className="text-red-600" /> : <ArrowDown size={13} className="text-red-600" />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 opacity-60" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('partNo')}
                      className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-100 select-none group transition-colors"
                      title="Click to sort by Part Number (Ascending / Descending)"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Part No</span>
                        {sortField === 'partNo' ? (
                          sortDirection === 'asc' ? <ArrowUp size={13} className="text-red-600" /> : <ArrowDown size={13} className="text-red-600" />
                        ) : (
                          <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 opacity-60" />
                        )}
                      </div>
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Category & Brand</th>
                    <th className="py-2.5 px-3 font-semibold">Specifications</th>
                    <th className="py-2.5 px-3 font-semibold">Price (₹)</th>
                    <th className="py-2.5 px-3 font-semibold">UOM</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Datasheet (PDF)</th>
                    {isAdmin && <th className="py-2.5 px-3 font-semibold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="px-4 py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="px-4 py-12 text-center text-slate-500">
                        <ShoppingBag size={24} className="mx-auto text-slate-300 mb-2" />
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                        {isAdmin && (
                          <td className="py-2.5 px-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(p.id)}
                              onChange={() => handleSelectOne(p.id)}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer w-3.5 h-3.5"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {p.imageUrl ? (
                                <img 
                                  src={p.imageUrl} 
                                  alt={p.name} 
                                  className="h-full w-full object-contain cursor-pointer"
                                  onClick={() => setViewingImage(p.imageUrl)} 
                                />
                              ) : (
                                <ShoppingBag size={16} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p 
                                onClick={() => setViewProduct(p)}
                                className="font-semibold text-slate-800 hover:text-red-700 line-clamp-1 cursor-pointer transition-colors"
                                title="Click to view full details"
                              >
                                {p.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                          {p.partNo ? (
                            <span 
                              onClick={() => setViewProduct(p)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 hover:border-red-400 cursor-pointer"
                              title="Click to view details"
                            >
                              {p.partNo}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5 items-start">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {p.category?.name || 'Uncategorized'}
                            </span>
                            {p.brand?.name && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 rounded">
                                {p.brand.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="flex flex-col gap-1 items-start">
                            {(p.core || p.coreSize || p.size) && (
                              <span className="font-semibold text-slate-800">
                                {p.core ? `${p.core} Cores` : ''}
                                {p.core && (p.coreSize || p.size) ? ' × ' : ''}
                                {p.coreSize || p.size ? `${p.coreSize || p.size}` : ''}
                              </span>
                            )}
                            {p.colour && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Colour: {p.colour}
                              </span>
                            )}
                            {(p.outerDiameter || p.od) && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                OD: {p.outerDiameter || p.od}
                              </span>
                            )}
                            {!p.core && !p.coreSize && !p.size && !p.colour && !p.outerDiameter && (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : <span className="text-slate-400 font-normal">Quote</span>}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            {p.uom || p.packSize || 'Meter'}
                          </span>
                        </td>
                        
                        {/* Datasheet Column */}
                        <td className="py-2.5 px-3 text-center">
                          {p.datasheetUrl ? (
                            <a
                              href={p.datasheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                              title="Open Technical Datasheet PDF"
                            >
                              <FileText size={12} className="text-red-600" />
                              <span>PDF</span>
                              <ExternalLink size={10} className="opacity-60" />
                            </a>
                          ) : (
                            <span className="text-slate-300 font-medium">None</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setViewProduct(p)}
                              className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                              title="View Full Product Information"
                            >
                              <Eye size={15} />
                            </button>
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                                  title="Edit Product"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY MANAGEMENT */}
      {activeTab === 'Categories' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                <tr>
                  <th className="py-3 px-6 font-semibold">Category Name</th>
                  <th className="py-3 px-6 font-semibold">Description</th>
                  {isAdmin && <th className="py-3 px-6 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-6 text-slate-500">{c.description || 'Standard Category'}</td>
                      {isAdmin && (
                        <td className="py-3 px-6 text-right">
                          <button
                            onClick={() => { setCurrentCat(c); setCatFormData({ name: c.name, description: c.description || '' }); setIsCatModalOpen(true); }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded mr-1 cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BRAND MANAGEMENT */}
      {activeTab === 'Brands' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                <tr>
                  <th className="py-3 px-6 font-semibold">Manufacturer Brand</th>
                  <th className="py-3 px-6 font-semibold">Description</th>
                  {isAdmin && <th className="py-3 px-6 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">No brands found.</td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b._id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-900">{b.name}</td>
                      <td className="py-3 px-6 text-slate-500">{b.description || 'Manufacturer Brand'}</td>
                      {isAdmin && (
                        <td className="py-3 px-6 text-right">
                          <button
                            onClick={() => { setCurrentBrand(b); setBrandFormData({ name: b.name, description: b.description || '' }); setIsBrandModalOpen(true); }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded mr-1 cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(b._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL - PORTAL-MOUNTED, FULLY RESPONSIVE */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header - Permanently Pinned at Top with Close (X) */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <p className="text-xs text-slate-500">Configure catalog details, image, and technical PDF datasheet.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200/80 hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 custom-scrollbar">
                
                {/* 1. Image Upload Section */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-red-600" /> Product Image
                    </label>
                    <div className="flex gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium ${imageInputMode === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2 py-0.5 rounded font-medium ${imageInputMode === 'url' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  {modalImage ? (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                      <img src={modalImage} alt="Preview" className="w-14 h-14 object-contain rounded bg-slate-50" />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-800">Image Attached</p>
                        <button
                          type="button"
                          onClick={() => setModalImage(null)}
                          className="text-red-500 hover:text-red-700 font-semibold mt-1 cursor-pointer"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : imageInputMode === 'upload' ? (
                    <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg bg-white cursor-pointer transition-colors text-center">
                      <Upload size={18} className="text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Upload Product Image (PNG, JPG, WEBP)</span>
                      <input type="file" accept="image/*" onChange={handleModalImageFileChange} className="hidden" />
                    </label>
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://example.com/cable.jpg" 
                      value={imageUrlInput}
                      onChange={(e) => { setImageUrlInput(e.target.value); setModalImage(e.target.value); }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* 2. Technical Datasheet Section (Phase 1 Requirement) */}
                <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText size={14} className="text-red-500" /> Technical Datasheet (PDF)
                    </label>
                    <div className="flex gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setDatasheetInputMode('upload')}
                        className={`px-2 py-0.5 rounded font-medium ${datasheetInputMode === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatasheetInputMode('url')}
                        className={`px-2 py-0.5 rounded font-medium ${datasheetInputMode === 'url' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                      >
                        PDF Link
                      </button>
                    </div>
                  </div>

                  {modalDatasheet ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-red-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Datasheet PDF Attached</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Ready for customer downloads</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setModalDatasheet(null); setDatasheetUrlInput(''); }}
                        className="text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : datasheetInputMode === 'upload' ? (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-red-200 hover:border-red-400 rounded-lg bg-white cursor-pointer transition-colors text-center">
                      <Upload size={18} className="text-red-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Upload Technical Datasheet (.pdf)</span>
                      <span className="text-[10px] text-slate-400">Official manufacturer specification sheet</span>
                      <input type="file" accept="application/pdf" onChange={handleModalDatasheetFileChange} className="hidden" />
                    </label>
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://example.com/datasheet.pdf" 
                      value={datasheetUrlInput}
                      onChange={(e) => { setDatasheetUrlInput(e.target.value); setModalDatasheet(e.target.value); }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                {/* 3. Product Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      defaultValue={currentProduct?.name || ''} 
                      required 
                      placeholder="e.g. ÖLFLEX® CLASSIC 110"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select 
                      name="categoryName" 
                      defaultValue={currentProduct?.category?.name || currentProduct?.categoryName || ''} 
                      required 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    >
                      <option value="">Select Category...</option>
                      {dropdownCategories.map((catName) => (
                        <option key={catName} value={catName}>{catName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                    <input 
                      list="brand-list"
                      name="brandName" 
                      defaultValue={currentProduct?.brand?.name || currentProduct?.brandName || ''} 
                      placeholder="e.g. LAPP, EATON"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                    <datalist id="brand-list">
                      {brands.map((b) => (
                        <option key={b._id} value={b.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Part Number</label>
                    <input 
                      type="text" 
                      name="partNo" 
                      defaultValue={currentProduct?.partNo || ''} 
                      placeholder="e.g. 1119003"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="price" 
                      defaultValue={currentProduct?.price || ''} 
                      placeholder="e.g. 150.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Core / Cores</label>
                    <input 
                      type="text" 
                      name="core" 
                      defaultValue={currentProduct?.core || ''} 
                      placeholder="e.g. 3G, 4G, 2"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Core Size</label>
                    <input 
                      type="text" 
                      name="coreSize" 
                      defaultValue={currentProduct?.coreSize || currentProduct?.size || ''} 
                      placeholder="e.g. 1.5, 2.5 mm²"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Colour</label>
                    <input 
                      type="text" 
                      name="colour" 
                      defaultValue={currentProduct?.colour || ''} 
                      placeholder="e.g. Grey (RAL 7001), Black, Blue"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UOM (Unit of Measurement)</label>
                    <input 
                      type="text" 
                      name="uom" 
                      defaultValue={currentProduct?.uom || currentProduct?.packSize || 'Meter'} 
                      placeholder="e.g. Meter, 100 m, 500 m, Coil, Drum"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>


                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">MRP (List Price ₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="mrp" 
                      defaultValue={currentProduct?.mrp || ''} 
                      placeholder="e.g. 200.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GST (%)</label>
                    <input 
                      type="number" 
                      step="1" 
                      name="gst" 
                      defaultValue={currentProduct?.gst || 18} 
                      placeholder="18"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Outer Diameter (OD)</label>
                    <input 
                      type="text" 
                      name="outerDiameter" 
                      defaultValue={currentProduct?.outerDiameter || ''} 
                      placeholder="e.g. 6.3 mm"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Weight / Specs</label>
                    <input 
                      type="text" 
                      name="weight" 
                      defaultValue={currentProduct?.weight || ''} 
                      placeholder="e.g. 75 kg/km"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Description / Application Notes</label>
                    <textarea 
                      name="description" 
                      rows={2}
                      defaultValue={currentProduct?.description || currentProduct?.application || ''} 
                      placeholder="Technical application, specifications, standards..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Footer - Permanently Pinned at Bottom */}
              <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 shrink-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Complete Product Information View Modal (Requirement 9) - Portal-Mounted */}
      {viewProduct && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewProduct(null);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header - Permanently Pinned at Top with Close (X) */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Product Specification Details</h3>
                  <p className="text-xs text-slate-500">Complete catalog information, images, and datasheet</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewProduct(null)} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200/80 hover:bg-red-50 hover:text-red-600 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar flex-1">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  {viewProduct.imageUrl ? (
                    <img src={viewProduct.imageUrl} alt={viewProduct.name} className="w-full h-full object-contain cursor-pointer" onClick={() => setViewingImage(viewProduct.imageUrl)} />
                  ) : (
                    <ShoppingBag size={36} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                      {viewProduct.category?.name || viewProduct.categoryName || 'Catalog Item'}
                    </span>
                    {viewProduct.brand?.name && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {viewProduct.brand.name}
                      </span>
                    )}
                    {viewProduct.partNo && (
                      <span className="font-mono text-slate-500 text-xs">
                        Part #{viewProduct.partNo}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{viewProduct.name}</h4>
                  <p className="text-slate-500 leading-relaxed text-xs">
                    {viewProduct.description || viewProduct.application || 'Standard catalog certified industrial specification.'}
                  </p>
                </div>
              </div>

              {/* Specs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 w-1/3 bg-slate-100/50">Part Number</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{viewProduct.partNo || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Price (Ex-GST)</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-red-700">
                        {viewProduct.price ? `₹${Number(viewProduct.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'On Request / Quotation'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">UOM (Unit of Measurement)</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {viewProduct.uom || viewProduct.packSize || 'Meter'}
                        </span>
                      </td>
                    </tr>
                    {viewProduct.mrp && (
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">MRP (List Price)</td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">₹{Number(viewProduct.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Colour</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {viewProduct.colour ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {viewProduct.colour}
                          </span>
                        ) : 'Standard / As per spec'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Cores / Configuration</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.core || 'Standard'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Core Size / Cross Section</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.coreSize || viewProduct.size || 'N/A'}</td>
                    </tr>
                    {viewProduct.pe && (
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">PE (Packaging Unit)</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.pe}</td>
                      </tr>
                    )}
                    {viewProduct.copperIndex && (
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Copper Index</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.copperIndex} kg/km</td>
                      </tr>
                    )}
                    {viewProduct.outerDiameter && (
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Outer Diameter</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.outerDiameter}</td>
                      </tr>
                    )}
                    {viewProduct.weight && (
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Weight / Specs</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{viewProduct.weight}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-100/50">Datasheet PDF</td>
                      <td className="px-4 py-2.5">
                        {viewProduct.datasheetUrl ? (
                          <a href={viewProduct.datasheetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-bold text-xs cursor-pointer">
                            <FileText size={14} /> Open Datasheet PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No PDF datasheet uploaded</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions - Permanently Pinned at Bottom */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 shrink-0 z-10">
              <button 
                type="button" 
                onClick={() => setViewProduct(null)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              {isAdmin && (
                <button 
                  type="button" 
                  onClick={() => { const prod = viewProduct; setViewProduct(null); openEditModal(prod); }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Product Information
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CATEGORY MODAL - Portal-Mounted */}
      {isCatModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCatModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{currentCat ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  required 
                  value={catFormData.name} 
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  value={catFormData.description} 
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-lg shadow-sm hover:opacity-95 cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* BRAND MODAL - Portal-Mounted */}
      {isBrandModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBrandModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{currentBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBrand} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input 
                  type="text" 
                  required 
                  value={brandFormData.name} 
                  onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input 
                  type="text" 
                  value={brandFormData.description} 
                  onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsBrandModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white font-bold rounded-lg shadow-sm hover:opacity-95 cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* IMAGE VIEWER MODAL - Portal-Mounted */}
      {viewingImage && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute -top-12 right-0 text-white hover:text-red-400 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Image"
            >
              <X size={24} />
            </button>
            <img src={viewingImage} alt="Product" className="max-w-full max-h-[80vh] object-contain rounded-2xl bg-white/5 border border-white/10 shadow-2xl" />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
