/**
 * SIDDHI ESHOP - CORE INTERACTIVE ENGINE
 * Faithful to Siddhi Kabel LTD. industrial electrical catalog & brand styling
 */

// 1. PRODUCTS DATA STORE
const PRODUCTS_DATA = [
  {
    id: 'lapp-01',
    category: 'cables',
    brand: 'LAPP KABEL',
    partNo: 'LAPP-1119203',
    name: 'ÖLFLEX® CLASSIC 110 Control Cable',
    specs: ['3 Cores x 1.5 sq mm', 'PVC Insulation, Oil Resistant', 'Rated: 300/500V', 'VDE Approved'],
    voltage: '300/500 V',
    tempRange: '-40°C to +80°C',
    conductor: 'Bare copper wire, class 5',
    price: 68.50,
    unit: 'meter',
    stock: 'In Stock (5,000m+)',
    icon: 'cable',
    application: 'Industrial Machinery, Automation, Control Panels'
  },
  {
    id: 'lapp-02',
    category: 'cables',
    brand: 'LAPP KABEL',
    partNo: 'LAPP-0026154',
    name: 'ÖLFLEX® FD 855 CP High Flex Continuous Chain Cable',
    specs: ['4 Cores x 2.5 sq mm', 'PUR Sheath, Halogen-Free', 'Extra-flexible for cable tracks', 'UL/cUL Certified'],
    voltage: '300/500 V',
    tempRange: '-40°C to +90°C',
    conductor: 'Superfine bare copper strands',
    price: 245.00,
    unit: 'meter',
    stock: 'In Stock (1,200m)',
    icon: 'cable',
    application: 'Cable Drag Chains, Robotics, CNC Automation'
  },
  {
    id: 'lapp-03',
    category: 'data',
    brand: 'LAPP KABEL',
    partNo: 'LAPP-0028404',
    name: 'UNITRONIC® LiYCY Screened Data Cable',
    specs: ['4 Cores x 0.5 sq mm', 'Tinned copper screening braid', 'High EMC protection', 'Low capacitance'],
    voltage: '250 V (non-power)',
    tempRange: '-40°C to +80°C',
    conductor: 'Fine-wire bare copper',
    price: 52.00,
    unit: 'meter',
    stock: 'In Stock (3,500m)',
    icon: 'ethernet',
    application: 'Industrial Ethernet, RS485, Instrumentation, SCADA'
  },
  {
    id: 'lapp-04',
    category: 'data',
    brand: 'LAPP KABEL',
    partNo: 'LAPP-2170280',
    name: 'ETHERLINE® Cat.6A Industrial Ethernet Cable',
    specs: ['4x2xAWG24/7 (S/FTP)', '10 Gbit/s High Bandwidth', 'PUR Outer Sheath, Oil-Resistant', 'PROFINET Compliant'],
    voltage: '100 V',
    tempRange: '-40°C to +80°C',
    conductor: 'Stranded copper wire',
    price: 185.00,
    unit: 'meter',
    stock: 'In Stock (800m)',
    icon: 'ethernet',
    application: 'PROFINET, Industrial IoT, Factory Gigabit Networks'
  },
  {
    id: 'menn-01',
    category: 'plugs',
    brand: 'MENNEKES',
    partNo: 'MENN-013-16A',
    name: 'Mennekes CEE Industrial Plug 16A 5-Pin (3P+N+E)',
    specs: ['IP44 Splashproof standard', '400V 50/60 Hz (Red)', 'Ergonomic rubberized grip', 'Screw terminals with cage'],
    voltage: '400 V',
    tempRange: '-25°C to +40°C',
    conductor: 'Polyamide 6 casing',
    price: 540.00,
    unit: 'piece',
    stock: 'In Stock (120 units)',
    icon: 'plug',
    application: 'Industrial Machinery, Construction Sites, Power Distribution'
  },
  {
    id: 'menn-02',
    category: 'plugs',
    brand: 'MENNEKES',
    partNo: 'MENN-1014-32A',
    name: 'Mennekes CEE Receptacle Panel Socket 32A 5P',
    specs: ['IP67 Watertight enclosure', '32 Ampere heavy-duty contacts', 'Straight flange, Nickel-plated', 'High heat resistant'],
    voltage: '400 V',
    tempRange: '-25°C to +50°C',
    conductor: 'Highly nickel plated brass',
    price: 1150.00,
    unit: 'piece',
    stock: 'In Stock (85 units)',
    icon: 'plug',
    application: 'Heavy Industry, Outdoor Panels, Harsh Washdown Environments'
  },
  {
    id: 'eaton-01',
    category: 'switchgear',
    brand: 'EATON - MOELLER',
    partNo: 'EATON-072737',
    name: 'PKZM0 Motor-Protective Circuit-Breaker (6.3A - 10A)',
    specs: ['Overload & short-circuit trip', 'Switching capacity 150 kA', 'IEC/EN 60947, VDE 0660', 'Phase-failure sensitivity'],
    voltage: '690 V AC',
    tempRange: '-25°C to +55°C',
    conductor: 'Screw connection terminals',
    price: 2450.00,
    unit: 'piece',
    stock: 'In Stock (45 units)',
    icon: 'switchgear',
    application: 'Motor Starters, MCC Panels, Machine Protection'
  },
  {
    id: 'eaton-02',
    category: 'switchgear',
    brand: 'EATON - MOELLER',
    partNo: 'EATON-276690',
    name: 'DILM9-10 3-Pole Contactor 9A (230V 50Hz Coil)',
    specs: ['AC-3 rating: 4 kW @ 400V', '1 Auxiliary Contact (1 NO)', 'SmartWire-DT ready', 'Ultra-long electrical lifespan'],
    voltage: '400 V AC',
    tempRange: '-25°C to +60°C',
    conductor: 'Silver alloy power contacts',
    price: 1180.00,
    unit: 'piece',
    stock: 'In Stock (110 units)',
    icon: 'switchgear',
    application: 'Pumps, Compressors, Automation Conveyor Starters'
  },
  {
    id: 'jef-01',
    category: 'earthing',
    brand: 'JEF ECO SAFE',
    partNo: 'JEF-ES-3000',
    name: 'JEF Eco Safe Chemical Earthing Electrode 3m',
    specs: ['Pure copper bonded steel pipe', '250 Micron copper thickness', 'High corrosion resistance', 'Includes Eco-Safe Compound'],
    voltage: 'Fault rating up to 40kA',
    tempRange: 'Underground install',
    conductor: '99.9% Electrolytic Copper coating',
    price: 4600.00,
    unit: 'set',
    stock: 'In Stock (30 sets)',
    icon: 'earthing',
    application: 'Substations, Data Centers, High-Rise Buildings, Lightning Arresters'
  },
  {
    id: 'havells-01',
    category: 'cables',
    brand: 'HAVELLS',
    partNo: 'HAV-SMR-4C4',
    name: 'Havells SMR 1.1kV Flexible Multi-core Cable 4x4.0',
    specs: ['4 Cores x 4.0 sq mm Copper', 'Flame Retardant (FR-LSH)', 'IS:694 certified', 'Bright Annealed Copper'],
    voltage: '1100 V',
    tempRange: '-15°C to +70°C',
    conductor: 'Electrolytic grade plain copper',
    price: 165.00,
    unit: 'meter',
    stock: 'In Stock (2,200m)',
    icon: 'cable',
    application: 'Industrial Building Electrification, Panel Distribution'
  },
  {
    id: 'hager-01',
    category: 'switchgear',
    brand: 'HAGER',
    partNo: 'HAG-NBN332',
    name: 'Hager 3-Pole MCB 32A C-Curve 10kA Breaking',
    specs: ['10 kA Breaking Capacity', 'C-Curve inductive load trigger', 'Bi-connect terminal architecture', 'IEC 60898-1 certified'],
    voltage: '230/400 V',
    tempRange: '-25°C to +60°C',
    conductor: 'DIN rail mountable',
    price: 1320.00,
    unit: 'piece',
    stock: 'In Stock (60 units)',
    icon: 'switchgear',
    application: 'Commercial Distribution Boards, Heavy Power Feeds'
  },
  {
    id: 'neptune-01',
    category: 'switchgear',
    brand: 'NEPTUNE',
    partNo: 'NEP-HD-25KVAR',
    name: 'Neptune Heavy Duty APFC Power Capacitor 25 kVAR',
    specs: ['440V 50Hz 3-Phase', 'Self-healing Polypropylene', 'Overpressure disconnector', 'Low dielectric loss < 0.2W/kvar'],
    voltage: '440 V',
    tempRange: '-25°C to +55°C',
    conductor: 'M12 stud / terminal block',
    price: 5200.00,
    unit: 'piece',
    stock: 'In Stock (18 units)',
    icon: 'switchgear',
    application: 'Power Factor Correction, Industrial Substation Panels'
  },
  {
    id: 'partex-01',
    category: 'data',
    brand: 'PARTEX SWEDEN',
    partNo: 'PARTEX-PA-1000',
    name: 'Partex PA Closed Chevron Wire Markers (Box of 1,000)',
    specs: ['Size PA-02 for 0.5 - 1.5 sq mm', 'Cadmium & Silicon Free PVC', 'Chevron cut for perfect alignment', 'UL94-V0 Self-Extinguishing'],
    voltage: 'N/A (Identification)',
    tempRange: '-30°C to +60°C',
    conductor: 'Resistant to oils, acids and UV',
    price: 340.00,
    unit: 'box',
    stock: 'In Stock (250 boxes)',
    icon: 'cable',
    application: 'Control Panel Wiring, Terminal Block Identification, Industrial Machinery'
  },
  {
    id: 'partex-02',
    category: 'data',
    brand: 'PARTEX SWEDEN',
    partNo: 'PARTEX-T1000-KIT',
    name: 'Partex ProMark T-1000 Thermal Cable Marker Printer',
    specs: ['High speed: 40mm/sec printing', 'Prints profiles, sleeves & self-adhesive tapes', 'USB PC connectivity + internal memory', 'Includes heavy duty industrial carry case'],
    voltage: '230V AC adapter / Battery option',
    tempRange: '+15°C to +35°C operating',
    conductor: 'Thermal Transfer Technology 300 dpi',
    price: 38500.00,
    unit: 'kit',
    stock: 'In Stock (8 units)',
    icon: 'ethernet',
    application: 'Panel Builders, Switchgear Manufacturers, On-Site Industrial Marking'
  }
];

// SVG ARTWORK MAPPER
function getProductSvg(type) {
  if (type === 'cable') {
    return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 6h16M4 12h16M4 18h16"/>
      <circle cx="6" cy="6" r="2" fill="currentColor"/>
      <circle cx="6" cy="12" r="2" fill="currentColor"/>
      <circle cx="6" cy="18" r="2" fill="currentColor"/>
      <path d="M14 6c0 3-4 3-4 6s4 3 4 6"/>
    </svg>`;
  } else if (type === 'ethernet') {
    return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="12" rx="2"/>
      <path d="M6 16v4h12v-4M9 20h6"/>
      <path d="M7 8h2m2 0h2m2 0h2"/>
    </svg>`;
  } else if (type === 'plug') {
    return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
      <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
    </svg>`;
  } else if (type === 'switchgear') {
    return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="3"/>
      <rect x="8" y="6" width="8" height="6" rx="1"/>
      <line x1="12" y1="14" x2="12" y2="18"/>
      <circle cx="12" cy="16" r="2" fill="currentColor"/>
    </svg>`;
  } else {
    return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="14"/>
      <path d="M6 14h12M8 17h8M10 20h4M11 23h2"/>
    </svg>`;
  }
}

// 2. STATE STORE
let cart = JSON.parse(localStorage.getItem('siddhi_eshop_cart') || '[]');
let activeFilter = 'all';

// 3. CART OPERATIONS
function saveCart() {
  localStorage.setItem('siddhi_eshop_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(productId, quantity = 1) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      partNo: product.partNo,
      brand: product.brand,
      price: product.price,
      unit: product.unit,
      qty: quantity
    });
  }

  saveCart();
  showToast(`Added ${product.name} to cart!`);
  openCartDrawer();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function openCartDrawer() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartCountBadge');
  const cartSubtotalVal = document.getElementById('cartSubtotalHeader');
  const cartItemsContainer = document.getElementById('cartItemsList');
  const cartDrawerSubtotal = document.getElementById('cartDrawerSubtotal');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartBadge) cartBadge.innerText = totalQty;
  if (cartSubtotalVal) cartSubtotalVal.innerText = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
  if (cartDrawerSubtotal) cartDrawerSubtotal.innerText = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your industrial quotation cart is empty.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="closeCartDrawer()">Browse Catalog</button>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <div style="font-size: 10px; color: var(--primary); font-weight: 700;">${item.brand} | ${item.partNo}</div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toFixed(2)} / ${item.unit}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button onclick="updateQty('${item.id}', -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.id}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
      </div>
    `).join('');
  }
}

// 4. RENDER PRODUCTS GRID
function renderProducts(items) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-500);">No products match your search or filter.</div>`;
    return;
  }

  container.innerHTML = items.map(prod => `
    <div class="product-card" data-category="${prod.category}">
      <div class="product-badge-wrap">
        <span class="product-badge badge-brand">${prod.brand}</span>
        <span class="product-badge badge-stock">${prod.stock}</span>
      </div>

      <div class="product-image-box">
        ${getProductSvg(prod.icon)}
        <div class="product-quick-actions">
          <button class="btn-icon-action" onclick="openQuickView('${prod.id}')" title="Quick View Specs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      <div class="product-info">
        <span class="product-part-no">Part: ${prod.partNo}</span>
        <h4 class="product-name" title="${prod.name}">${prod.name}</h4>
        
        <div class="product-specs-list">
          ${prod.specs.map(s => `<div>• ${s}</div>`).join('')}
        </div>

        <div class="product-footer">
          <div class="product-pricing">
            <span class="price-main">₹${prod.price.toFixed(2)}</span>
            <span class="price-unit">per ${prod.unit} (excl. GST)</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart('${prod.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 5. QUICK VIEW MODAL
function openQuickView(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById('quickViewModal');
  const body = document.getElementById('quickViewContent');

  body.innerHTML = `
    <div class="modal-img-col">
      ${getProductSvg(prod.icon)}
    </div>
    <div class="modal-content-col">
      <span class="modal-badge">${prod.brand} | ${prod.partNo}</span>
      <h3 class="modal-title">${prod.name}</h3>
      <div class="modal-price">₹${prod.price.toFixed(2)} <span style="font-size: 13px; font-weight: 500; color: var(--gray-600);">/ ${prod.unit}</span></div>
      
      <p style="font-size: 13px; color: var(--gray-600); margin-bottom: 15px;">
        <strong>Application:</strong> ${prod.application}
      </p>

      <table class="modal-specs-table">
        <tr><td>Voltage Rating</td><td>${prod.voltage}</td></tr>
        <tr><td>Temp Range</td><td>${prod.tempRange}</td></tr>
        <tr><td>Conductor Spec</td><td>${prod.conductor}</td></tr>
        <tr><td>Stock Availability</td><td><strong style="color: var(--success);">${prod.stock}</strong></td></tr>
      </table>

      <div style="display: flex; gap: 12px; margin-top: auto;">
        <button class="btn btn-primary" style="flex: 1;" onclick="addToCart('${prod.id}'); closeQuickView();">
          Add To RFQ Cart
        </button>
        <button class="btn btn-secondary" onclick="scrollToRFQ('${prod.partNo}'); closeQuickView();">
          Custom Quote
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeQuickView() {
  document.getElementById('quickViewModal').classList.remove('open');
}

// 6. FILTER AND SEARCH LOGIC
function setCategoryFilter(category, clickedElement) {
  activeFilter = category;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (clickedElement) clickedElement.classList.add('active');

  filterProducts();
}

function filterProducts() {
  const searchInput = document.getElementById('headerSearchInput');
  const catSelect = document.getElementById('searchCategorySelect');
  const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const selectCat = catSelect ? catSelect.value : 'all';

  let filtered = PRODUCTS_DATA;

  // Tab filter
  if (activeFilter !== 'all') {
    filtered = filtered.filter(p => p.category === activeFilter);
  }

  // Dropdown filter
  if (selectCat !== 'all') {
    filtered = filtered.filter(p => p.category === selectCat);
  }

  // Search input
  if (searchTerm) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.partNo.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.specs.some(s => s.toLowerCase().includes(searchTerm))
    );
  }

  renderProducts(filtered);
}

// 7. SPEC SELECTOR CALCULATOR
function runSpecSelector() {
  const app = document.getElementById('selApp').value;
  const cores = document.getElementById('selCores').value;
  const cross = document.getElementById('selCross').value;
  const brand = document.getElementById('selBrand').value;

  const resultsWrap = document.getElementById('specResultsWrap');
  const resultsContainer = document.getElementById('specResultsCards');
  const resultsCount = document.getElementById('specResultsCount');

  // Realistic matching
  let matches = PRODUCTS_DATA.filter(p => {
    if (brand !== 'all' && !p.brand.toLowerCase().includes(brand.toLowerCase())) return false;
    if (app === 'drag-chain' && !p.name.toLowerCase().includes('chain') && !p.name.toLowerCase().includes('flex')) return false;
    if (app === 'ethernet' && p.category !== 'data') return false;
    if (app === 'switchgear' && p.category !== 'switchgear') return false;
    return true;
  });

  if (matches.length === 0) {
    matches = PRODUCTS_DATA.slice(0, 3); // Fallback recommendation
  } else if (matches.length > 3) {
    matches = matches.slice(0, 3);
  }

  resultsCount.innerText = `${matches.length} Certified Options Found`;
  resultsContainer.innerHTML = matches.map(m => `
    <div class="result-card-mini">
      <span class="res-brand">${m.brand} • ${m.partNo}</span>
      <h4>${m.name}</h4>
      <div style="font-size: 12px; color: #a0aec0;">${m.specs[0]} | ${m.voltage}</div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
        <strong style="color: #ff7e82; font-size: 14px;">₹${m.price.toFixed(2)}</strong>
        <button class="btn btn-primary btn-sm" onclick="addToCart('${m.id}')">Add</button>
      </div>
    </div>
  `).join('');

  resultsWrap.classList.add('show');
}

// 8. MOGLIX-STYLE HERO SLIDER CONTROLLER
let currentSlide = 0;
const totalSlides = 4;
let sliderInterval = null;

function showSlide(index) {
  const slideElements = document.querySelectorAll('.moglix-slide');
  const subCards = document.querySelectorAll('.banner-subCard');
  const progressItems = document.querySelectorAll('.carousel-progress .progress-item');

  if (index >= totalSlides) currentSlide = 0;
  else if (index < 0) currentSlide = totalSlides - 1;
  else currentSlide = index;

  slideElements.forEach((el, i) => {
    el.classList.toggle('active', i === currentSlide);
  });

  subCards.forEach((card, i) => {
    card.classList.toggle('active', i === currentSlide);
  });

  progressItems.forEach((item, i) => {
    item.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function selectSlide(index) {
  showSlide(index);
  restartSliderTimer();
}

function startSliderTimer() {
  if (sliderInterval) clearInterval(sliderInterval);
  sliderInterval = setInterval(nextSlide, 5000);
}

function restartSliderTimer() {
  clearInterval(sliderInterval);
  startSliderTimer();
}

function initSlider() {
  showSlide(0);
  startSliderTimer();
}

// 9. TOAST NOTIFICATIONS
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// 10. RFQ FORM SUBMISSION
function handleRfqSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('rfqName').value;
  const company = document.getElementById('rfqCompany').value;
  const phone = document.getElementById('rfqPhone').value;

  showToast(`Thank you, ${name}! Your RFQ for ${company || 'your project'} has been logged. Our technical sales engineer will contact you on ${phone} within 2 business hours.`);
  e.target.reset();
}

function scrollToRFQ(partNo = '') {
  const rfqSection = document.getElementById('rfqSection');
  if (rfqSection) {
    rfqSection.scrollIntoView({ behavior: 'smooth' });
    if (partNo) {
      const notes = document.getElementById('rfqNotes');
      if (notes) {
        notes.value = `Inquiry regarding Part No: ${partNo}. Please share formal quote with bulk quantity discounts and delivery lead time to our location.`;
      }
    }
  }
}

function checkoutRfq() {
  if (cart.length === 0) {
    showToast('Your cart is empty. Please add items to request a quote.');
    return;
  }

  closeCartDrawer();
  scrollToRFQ();
  const notes = document.getElementById('rfqNotes');
  if (notes) {
    const summary = cart.map(i => `${i.brand} ${i.partNo} (${i.qty} ${i.unit})`).join(', ');
    notes.value = `Order / RFQ Items from Cart: ${summary}. Please provide formal GST quotation with delivery schedule to Bangalore / site.`;
  }
  showToast('Cart contents transferred to RFQ form below!');
}

// 11. DOM INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(PRODUCTS_DATA);
  updateCartUI();
  initSlider();

  // Search input listeners
  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => filterProducts());
  }

  const searchCatSelect = document.getElementById('searchCategorySelect');
  if (searchCatSelect) {
    searchCatSelect.addEventListener('change', () => filterProducts());
  }

  // Mobile menu toggle
  const mobileToggler = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinksMenu');
  if (mobileToggler && navLinks) {
    mobileToggler.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Close modals when clicking overlay
  const qvModal = document.getElementById('quickViewModal');
  if (qvModal) {
    qvModal.addEventListener('click', (e) => {
      if (e.target === qvModal) closeQuickView();
    });
  }
});

// 9. BRAND PORTFOLIO TABS FILTERS
function filterLappCards(cat, btn) {
  const tabs = document.querySelectorAll('#lappPortfolioSection .lapp-tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    if (!btn) {
      const onclickAttr = t.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${cat}'`)) {
        t.classList.add('active');
      }
    }
  });
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#lappCardsGrid .lapp-photo-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-cat');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  if (!btn) {
    const section = document.getElementById('lappPortfolioSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterEatonCards(cat, btn) {
  const tabs = document.querySelectorAll('#eatonPortfolioSection .brand-tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    if (!btn) {
      const onclickAttr = t.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${cat}'`)) {
        t.classList.add('active');
      }
    }
  });
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#eatonCardsGrid .brand-photo-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-cat');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  if (!btn) {
    const section = document.getElementById('eatonPortfolioSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterPartexCards(cat, btn) {
  const tabs = document.querySelectorAll('#partexPortfolioSection .brand-tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    if (!btn) {
      const onclickAttr = t.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${cat}'`)) {
        t.classList.add('active');
      }
    }
  });
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#partexCardsGrid .brand-photo-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-cat');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  if (!btn) {
    const section = document.getElementById('partexPortfolioSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterMennekesCards(cat, btn) {
  const tabs = document.querySelectorAll('#mennekesPortfolioSection .brand-tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    if (!btn) {
      const onclickAttr = t.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${cat}'`)) {
        t.classList.add('active');
      }
    }
  });
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#mennekesCardsGrid .brand-photo-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-cat');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  if (!btn) {
    const section = document.getElementById('mennekesPortfolioSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ====================================================================
// 9. CUSTOMER ACCOUNT & AUTHENTICATION ENGINE
// ====================================================================
function getStoredCustomers() {
  try {
    return JSON.parse(localStorage.getItem('siddhi_customers') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem('siddhi_customers', JSON.stringify(customers));
}

function getCurrentCustomer() {
  try {
    const raw = localStorage.getItem('siddhi_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentCustomer(user) {
  if (user) {
    localStorage.setItem('siddhi_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('siddhi_current_user');
  }
  updateAuthUI();
}

function handleHeaderAccountClick() {
  const user = getCurrentCustomer();
  if (user) {
    openCustomerAccountModal();
  } else {
    openAuthModal('login');
  }
}

function openAuthModal(initialTab = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('open');
    switchAuthTab(initialTab);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
  const logAlert = document.getElementById('loginAlert');
  const regAlert = document.getElementById('registerAlert');
  if (logAlert) logAlert.style.display = 'none';
  if (regAlert) regAlert.style.display = 'none';
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('customerLoginForm');
  const formRegister = document.getElementById('customerRegisterForm');
  const title = document.getElementById('authModalTitle');

  if (tab === 'register') {
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
    if (formLogin) formLogin.classList.remove('active');
    if (formRegister) formRegister.classList.add('active');
    if (title) title.innerText = 'Create Customer Account';
  } else {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
    if (formLogin) formLogin.classList.add('active');
    if (formRegister) formRegister.classList.remove('active');
    if (title) title.innerText = 'Sign In to Your Account';
  }
}

function handleCustomerRegister(event) {
  event.preventDefault();
  const alertBox = document.getElementById('registerAlert');
  if (alertBox) alertBox.style.display = 'none';

  const companyName = document.getElementById('regCompanyName')?.value.trim();
  const contactPerson = document.getElementById('regContactPerson')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const gstNo = document.getElementById('regGstNo')?.value.trim().toUpperCase();
  const state = document.getElementById('regState')?.value;
  const city = document.getElementById('regCity')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const address = document.getElementById('regAddress')?.value.trim();

  if (!companyName || !contactPerson || !phone || !email || !gstNo || !state || !city || !password || !address) {
    showAuthAlert(alertBox, 'Please fill in all required fields.');
    return;
  }

  // Validate Password Strength: Minimum 6 characters with at least one special character
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password);
  if (password.length < 6) {
    showAuthAlert(alertBox, 'Password must be at least 6 characters long.');
    return;
  }
  if (!hasSpecialChar) {
    showAuthAlert(alertBox, 'Password must contain at least one special character (e.g. @, #, $, %, &, *).');
    return;
  }

  const customers = getStoredCustomers();

  // Check if Phone or Email is unique
  const phoneExists = customers.some(c => c.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
  if (phoneExists) {
    showAuthAlert(alertBox, `An account with Phone Number "${phone}" is already registered. Please Sign In.`);
    return;
  }

  const emailExists = customers.some(c => c.email.toLowerCase() === email);
  if (emailExists) {
    showAuthAlert(alertBox, `An account with Email "${email}" is already registered. Please Sign In.`);
    return;
  }

  const newCustomer = {
    id: 'SK-CUST-' + Date.now(),
    companyName,
    contactPerson,
    phone,
    email,
    gstNo,
    state,
    city,
    password,
    address,
    createdAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  saveCustomers(customers);
  setCurrentCustomer(newCustomer);

  closeAuthModal();
  showToast(`Welcome, ${contactPerson}! Your customer account for ${companyName} has been created.`);

  populateRfqWithCustomer(newCustomer);
}

function handleCustomerLogin(event) {
  event.preventDefault();
  const alertBox = document.getElementById('loginAlert');
  if (alertBox) alertBox.style.display = 'none';

  const identifier = document.getElementById('loginIdentifier')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!identifier || !password) {
    showAuthAlert(alertBox, 'Please enter your Phone No / Email and password.');
    return;
  }

  const customers = getStoredCustomers();
  const cleanId = identifier.replace(/[^0-9]/g, '');

  const user = customers.find(c => {
    const phoneMatch = cleanId.length > 5 && c.phone.replace(/[^0-9]/g, '').endsWith(cleanId);
    const emailMatch = c.email.toLowerCase() === identifier.toLowerCase();
    return (phoneMatch || emailMatch) && c.password === password;
  });

  if (!user) {
    showAuthAlert(alertBox, 'Invalid credentials. No customer account matched this Phone/Email and password.');
    return;
  }

  setCurrentCustomer(user);
  closeAuthModal();
  showToast(`Welcome back, ${user.contactPerson} (${user.companyName})!`);
  populateRfqWithCustomer(user);
}

function showAuthAlert(elem, msg) {
  if (!elem) return;
  elem.innerText = msg;
  elem.style.display = 'block';
}

function logoutCustomer() {
  setCurrentCustomer(null);
  closeCustomerAccountModal();
  showToast('You have been signed out.');
}

function openCustomerAccountModal() {
  const user = getCurrentCustomer();
  if (!user) {
    openAuthModal('login');
    return;
  }

  const modal = document.getElementById('customerAccountModal');
  if (!modal) return;

  const avatar = document.getElementById('accountAvatarText');
  const compName = document.getElementById('accountModalCompanyName');
  const contact = document.getElementById('accountModalContact');
  const gst = document.getElementById('accountModalGst');
  const infoContact = document.getElementById('accountInfoContact');
  const infoPhone = document.getElementById('accountInfoPhone');
  const infoEmail = document.getElementById('accountInfoEmail');
  const infoGst = document.getElementById('accountInfoGst');
  const infoAddress = document.getElementById('accountInfoAddress');
  const offersList = document.getElementById('accountOffersList');

  const initials = user.contactPerson.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SK';
  if (avatar) avatar.innerText = initials;
  if (compName) compName.innerText = user.companyName;
  if (contact) contact.innerText = user.contactPerson;
  if (gst) gst.innerText = user.gstNo;
  if (infoContact) infoContact.innerText = user.contactPerson;
  if (infoPhone) infoPhone.innerText = user.phone;
  if (infoEmail) infoEmail.innerText = user.email;
  if (infoGst) infoGst.innerText = user.gstNo;
  if (infoAddress) infoAddress.innerText = `${user.address}, ${user.city}, ${user.state}`;

  try {
    const allOffers = JSON.parse(localStorage.getItem('siddhi_offers') || '[]');
    const userOffers = allOffers.filter(o => o.customerId === user.id || o.email === user.email || o.phone === user.phone);
    if (offersList) {
      if (userOffers.length === 0) {
        offersList.innerHTML = `<p style="font-size: 13px; color: #64748b; margin: 6px 0;">No offers or RFQs sent yet. Use the RFQ form to send a commercial offer.</p>`;
      } else {
        offersList.innerHTML = userOffers.map(o => `
          <div class="offer-item-card">
            <div class="offer-item-top">
              <span class="offer-ref">${o.refNo}</span>
              <span class="offer-date">${o.date}</span>
            </div>
            <div><strong>Category:</strong> ${o.category}</div>
            ${o.notes ? `<div style="color: #475569; margin-top: 3px;">"${o.notes.slice(0, 75)}..."</div>` : ''}
            ${o.filesCount ? `<div style="font-size: 11px; color: #16a34a; margin-top: 4px;">📎 ${o.filesCount} file(s) attached</div>` : ''}
          </div>
        `).join('');
      }
    }
  } catch (e) {}

  modal.classList.add('open');
}

function closeCustomerAccountModal() {
  const modal = document.getElementById('customerAccountModal');
  if (modal) modal.classList.remove('open');
}

function updateAuthUI() {
  const user = getCurrentCustomer();
  const label = document.getElementById('headerAuthLabel');
  const val = document.getElementById('headerAuthVal');
  const rfqNotice = document.getElementById('rfqAuthNotice');

  if (user) {
    if (label) label.innerText = 'Welcome,';
    if (val) {
      const shortName = user.contactPerson.split(' ')[0];
      val.innerText = `${shortName} (${user.companyName.slice(0, 14)}...)`;
    }
    if (rfqNotice) {
      rfqNotice.className = 'rfq-auth-notice authenticated';
      rfqNotice.innerHTML = `
        <div class="auth-notice-body">
          <div class="auth-notice-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="auth-notice-text">
            <strong>Verified Customer: ${user.companyName} (${user.contactPerson})</strong>
            <span>GSTIN: ${user.gstNo} • Ready to send commercial offer</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="logoutCustomer()">Sign Out</button>
      `;
    }
  } else {
    if (label) label.innerText = 'Sign In / Register';
    if (val) val.innerText = 'Customer Account';
    if (rfqNotice) {
      rfqNotice.className = 'rfq-auth-notice unauthenticated';
      rfqNotice.innerHTML = `
        <div class="auth-notice-body">
          <div class="auth-notice-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="auth-notice-text">
            <strong>Customer Account Required to Send Offer</strong>
            <span>Please create an account or login to dispatch your official commercial offer &amp; BOM.</span>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="openAuthModal('login')">Sign In / Create Account</button>
      `;
    }
  }
}

function populateRfqWithCustomer(user) {
  if (!user) return;
  const nameF = document.getElementById('rfqName');
  const compF = document.getElementById('rfqCompany');
  const emailF = document.getElementById('rfqEmail');
  const phoneF = document.getElementById('rfqPhone');
  const cityF = document.getElementById('rfqCity');
  const gstF = document.getElementById('rfqGst');

  if (nameF) nameF.value = user.contactPerson;
  if (compF) compF.value = user.companyName;
  if (emailF) emailF.value = user.email;
  if (phoneF) phoneF.value = user.phone;
  if (cityF) cityF.value = `${user.city}, ${user.state}`;
  if (gstF) gstF.value = user.gstNo;
}

// ====================================================================
// 10. RFQ FILE ATTACHMENTS & OFFER SUBMISSION (GATED)
// ====================================================================
let uploadedRfqFiles = [];

function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!uploadedRfqFiles.some(existing => existing.name === f.name && existing.size === f.size)) {
      uploadedRfqFiles.push(f);
    }
  }
  renderUploadedFiles();
  event.target.value = '';
}

function removeRfqFile(index, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (index >= 0 && index < uploadedRfqFiles.length) {
    uploadedRfqFiles.splice(index, 1);
    renderUploadedFiles();
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderUploadedFiles() {
  const container = document.getElementById('fileSelectedList');
  const dropzone = document.getElementById('fileUploadDropzone');
  if (!container) return;

  if (uploadedRfqFiles.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    if (dropzone) dropzone.classList.remove('has-files');
    return;
  }

  if (dropzone) dropzone.classList.add('has-files');
  container.style.display = 'flex';
  container.innerHTML = uploadedRfqFiles.map((file, idx) => `
    <div class="file-chip" title="${file.name}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      <span class="file-chip-name">${file.name}</span>
      <span class="file-chip-size">(${formatFileSize(file.size)})</span>
      <button type="button" class="file-chip-remove" onclick="removeRfqFile(${idx}, event)" title="Remove file">&times;</button>
    </div>
  `).join('');
}

function handleRfqSubmit(event) {
  event.preventDefault();

  // AUTH GATING: User must be signed in or have created account
  const user = getCurrentCustomer();
  if (!user) {
    showToast('Customer Account Required: Please Sign In or Create an Account to send this offer.');
    openAuthModal('login');
    return;
  }

  const name = document.getElementById('rfqName')?.value.trim() || user.contactPerson;
  const company = document.getElementById('rfqCompany')?.value.trim() || user.companyName;
  const email = document.getElementById('rfqEmail')?.value.trim() || user.email;
  const phone = document.getElementById('rfqPhone')?.value.trim() || user.phone;
  const cat = document.getElementById('rfqCat')?.selectedOptions[0]?.text || 'Electrical Products';
  const notes = document.getElementById('rfqNotes')?.value.trim();
  const refNo = 'SK-OFFER-' + Math.floor(100000 + Math.random() * 900000);

  const offerRecord = {
    refNo,
    customerId: user.id,
    company,
    name,
    email,
    phone,
    category: cat,
    notes,
    filesCount: uploadedRfqFiles.length,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  try {
    const offers = JSON.parse(localStorage.getItem('siddhi_offers') || '[]');
    offers.unshift(offerRecord);
    localStorage.setItem('siddhi_offers', JSON.stringify(offers));
  } catch (e) {}

  let msg = `Commercial Offer & RFQ (${refNo}) dispatched successfully for ${company}!`;
  if (uploadedRfqFiles.length > 0) {
    msg += ` (${uploadedRfqFiles.length} file attachments sent)`;
  }
  showToast(msg);

  event.target.reset();
  uploadedRfqFiles = [];
  renderUploadedFiles();
  populateRfqWithCustomer(user);
}

function scrollToRFQ(prefillTopic) {
  const rfqSec = document.getElementById('rfqSection');
  if (rfqSec) {
    rfqSec.scrollIntoView({ behavior: 'smooth' });
    if (prefillTopic) {
      const notes = document.getElementById('rfqNotes');
      if (notes) {
        notes.value = `Inquiry regarding: ${prefillTopic}\n\nPlease share price list, technical datasheet, and delivery timeline.`;
        notes.focus();
      }
    }
  }
}

function checkoutRfq() {
  if (cart.length === 0) {
    showToast('Your RFQ Cart is empty. Please add items before requesting a quotation.');
    return;
  }

  const user = getCurrentCustomer();
  if (!user) {
    showToast('Please Sign In or Create an Account to request formal quotation.');
    closeCartDrawer();
    openAuthModal('login');
    return;
  }

  closeCartDrawer();
  const rfqSec = document.getElementById('rfqSection');
  if (rfqSec) {
    rfqSec.scrollIntoView({ behavior: 'smooth' });
    const notesField = document.getElementById('rfqNotes');
    if (notesField) {
      const summaryList = cart.map(item => `• ${item.brand} | ${item.name} (${item.partNo}): ${item.qty} ${item.unit}`).join('\n');
      notesField.value = `Official GST Quotation Request for Cart Items:\n\n${summaryList}\n\nPlease provide formal GST quote with freight to site and delivery lead times.`;
      notesField.focus();
    }
  }
  showToast('Cart items populated in RFQ form.');
}

function handleSearchCatChange() {
  const cat = document.getElementById('searchCategorySelect')?.value;
  if (cat === 'lapp') {
    document.getElementById('lappPortfolioSection')?.scrollIntoView({ behavior: 'smooth' });
  } else if (cat === 'eaton') {
    document.getElementById('eatonPortfolioSection')?.scrollIntoView({ behavior: 'smooth' });
  } else if (cat === 'partex') {
    document.getElementById('partexPortfolioSection')?.scrollIntoView({ behavior: 'smooth' });
  } else if (cat === 'mennekes') {
    document.getElementById('mennekesPortfolioSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateAuthUI();
  const currentUser = getCurrentCustomer();
  if (currentUser) {
    populateRfqWithCustomer(currentUser);
  }
});
