import React, { useState, useEffect } from 'react';
import { Upload, Plus, Download, FileSpreadsheet, Search, Filter, ShoppingBag, X } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Retrieve current admin details
  const currentAdminStr = localStorage.getItem('siddhi_admin_user');
  const currentAdmin = currentAdminStr ? JSON.parse(currentAdminStr) : null;
  const isAdmin = currentAdmin?.role === 'Admin' || currentAdmin?.role === 'Super Admin';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/products/import', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      setUploadResult(data);
      
      if (res.ok) {
        fetchProducts(); // Refresh list after upload
      }
    } catch (error) {
      console.error('Upload failed', error);
      setUploadResult({ error: 'Failed to connect to the server' });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
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
      const res = await fetch('http://localhost:5000/api/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const url = currentProduct ? `http://localhost:5000/api/products/${currentProduct.id}` : 'http://localhost:5000/api/products';
      const method = currentProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setCurrentProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Products Management</h2>
          <p className="text-slate-500 mt-1">Manage your catalog, import via Excel, and update details.</p>
        </div>
        <div className="flex flex-wrap items-center space-x-3 gap-y-2">
          {isAdmin && (
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
                  className={`flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" /> : <FileSpreadsheet size={18} className="mr-2" />}
                  {uploading ? 'Importing...' : 'Bulk Import (Excel)'}
                </button>
              </div>
              <button 
                onClick={() => {
                  const csvData = "Product Name,Category,Brand,Image URL,Price,Core,Core Size,Outer Diameter,Copper Index,Weight,Test Voltage,Flame Retardancy\nSample Product,Power Cables,LAPP,/images/products/lapp-01.jpg,150.00,3,1.5,12.5,43,150,4000V,Yes";
                  const blob = new Blob([csvData], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Product_Import_Template.csv';
                  a.click();
                }}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
              >
                <Download size={18} className="mr-2" />
                Template
              </button>
              <button 
                onClick={() => {
                  setCurrentProduct(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                Add Product
              </button>
            </>
          )}
        </div>
      </div>

      {uploadResult && (
        <div className={`p-4 rounded-xl border relative ${uploadResult.error ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <button onClick={() => setUploadResult(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
          {uploadResult.error ? (
            <p className="text-red-700 font-medium pr-6">Error: {uploadResult.error}</p>
          ) : (
            <div>
              <p className="text-emerald-700 font-semibold text-lg">{uploadResult.message}</p>
              <div className="flex gap-4 mt-2">
                <p className="text-emerald-600 font-medium">Successfully Imported: {uploadResult.successCount}</p>
                <p className="text-red-600 font-medium">Failed: {uploadResult.failedCount}</p>
              </div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4 max-h-32 overflow-auto text-sm text-red-600 bg-white/50 p-2 rounded">
                  <p className="font-semibold mb-1">Errors:</p>
                  <ul className="list-disc pl-5">
                    {uploadResult.errors.map((e: any, i: number) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4 w-full max-w-xl">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          {isAdmin && selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex-shrink-0 flex items-center px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            All Products
          </button>
          {Array.from(new Set(products.map(p => {
            const cat = p.category?.name || 'Uncategorized';
            return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          }))).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-4 w-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Part No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category & Brand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Core / Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price / MRP</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No products found</p>
                    <p className="text-slate-500 text-sm mt-1">Upload an Excel file to get started.</p>
                  </td>
                </tr>
              ) : (
                products
                  .filter(p => {
                    const normalizedCat = (p.category?.name || 'Uncategorized').charAt(0).toUpperCase() + (p.category?.name || 'Uncategorized').slice(1).toLowerCase();
                    return activeCategory === 'All' || normalizedCat === activeCategory;
                  })
                  .map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectOne(product.id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {product.partNo || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative group">
                          {product.imageUrl ? (
                            <>
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover cursor-pointer" 
                                onClick={() => setViewingImage(product.imageUrl)}
                              />
                              {isAdmin && (
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(confirm('Delete image?')) {
                                      try {
                                        const res = await fetch(`http://localhost:5000/api/products/${product.id}/image`, {
                                          method: 'DELETE',
                                          headers: { 'Authorization': `Bearer ${localStorage.getItem('siddhi_admin_token')}` }
                                        });
                                        if (res.ok) fetchProducts();
                                      } catch (err) { console.error(err); }
                                    }
                                  }}
                                  className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center cursor-pointer text-white text-xs"
                                >
                                  <X size={14} className="text-red-400 mb-1" />
                                  Remove
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={18} className="text-slate-400" />
                              {isAdmin && (
                                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer">
                                  <Upload size={14} className="text-white" />
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const fd = new FormData();
                                      fd.append('image', file);
                                      try {
                                        const res = await fetch(`http://localhost:5000/api/products/${product.id}/image`, {
                                          method: 'POST',
                                          body: fd
                                        });
                                        if (res.ok) fetchProducts();
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{product.category?.name || '-'}</div>
                      <div className="text-sm text-slate-500">{product.brand?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.core ? `${product.core} / ${product.coreSize || '-'}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {product.price ? `₹${product.price}` : 'N/A'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm font-medium">
                        <button 
                          onClick={() => {
                            setCurrentProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{currentProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <input type="text" name="name" defaultValue={currentProduct?.name || ''} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category / Group *</label>
                  <select name="categoryName" defaultValue={currentProduct?.category?.name || currentProduct?.categoryName || ''} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">Select Category...</option>
                    <option value="Power and Control Cables">Power and Control Cables (ÖLFLEX)</option>
                    <option value="Data Communication Cables">Data Communication Cables (UNITRONIC)</option>
                    <option value="Control Cabinet Single Cores">Control Cabinet Single Cores (UNIPLUS)</option>
                    <option value="Cable Glands & Counter Nuts">Cable Glands & Counter Nuts (SKINTOP)</option>
                    <option value="Rill, Conduit & Klick">Rill, Conduit & Klick (SILVYN)</option>
                    <option value="Switchgear">Switchgear</option>
                    <option value="Earthing">Earthing</option>
                    <option value="Marking Systems">Marking Systems</option>
                    <option value="Plugs & Sockets">Plugs & Sockets</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                  <input type="text" name="brandName" defaultValue={currentProduct?.brand?.name || currentProduct?.brandName || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <input type="number" step="0.01" name="price" defaultValue={currentProduct?.price || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Core</label>
                  <input type="text" name="core" defaultValue={currentProduct?.core || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Core Size</label>
                  <input type="text" name="coreSize" defaultValue={currentProduct?.coreSize || currentProduct?.size || ''} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-lg mr-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-10 right-0 text-white hover:text-red-400 p-2">
              <X size={28} />
            </button>
            <img src={viewingImage} alt="Product full view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
