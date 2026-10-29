// 4-Level Product Hierarchy Configuration
// Level 1: Brand (e.g., LAPP, Eaton, Partex, Mennekes)
// Level 2: Brand Category (e.g., Power and Control Cables)
// Level 3: Product Group (e.g., ÖLFLEX® CLASSIC 110, ÖLFLEX® CLASSIC 110 SY, etc.)
// Level 4: Product / Variant (e.g., ÖLFLEX® CLASSIC 110 3G1.5, Part No: 1119003)

export interface ProductGroupItem {
  id: string;
  name: string;
  brand: string;
  categoryName: string;
  description: string;
  pattern: RegExp;
  baselineCount: number;
  datasheetUrl?: string | null;
}

// Minimal valid base64 PDF template for default datasheets
const createDefaultPdfBase64 = (title: string, spec: string) => {
  const contentText = `BT /F1 14 Tf 50 730 Td (${title} - Technical Data Sheet) Tj /F1 10 Tf 0 -25 Td (Official Siddhi Kabel Industrial Product Specifications) Tj 0 -20 Td (${spec}) Tj ET`;
  const streamLength = contentText.length;
  const rawPdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length ${streamLength}>>stream
${contentText}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
0000000200 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
340
%%EOF`;
  return `data:application/pdf;base64,${btoa(rawPdf)}`;
};

export const INITIAL_PRODUCT_GROUPS: ProductGroupItem[] = [
  // LAPP - Power and Control Cables (Level 2: Power and Control Cables)
  {
    id: 'lapp-classic-110',
    name: 'ÖLFLEX® CLASSIC 110',
    brand: 'LAPP',
    categoryName: 'Power and Control Cables',
    description: 'VDE-registered PVC control cable with numbered cores (300/500V)',
    pattern: /classic\s*110\b(?!.*(?:sy|cy))/i,
    baselineCount: 45,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX CLASSIC 110', 'VDE-registered numbered cores, 300/500V rated')
  },
  {
    id: 'lapp-classic-110-sy',
    name: 'ÖLFLEX® CLASSIC 110 SY',
    brand: 'LAPP',
    categoryName: 'Power and Control Cables',
    description: 'Steel wire braid armored PVC control cable for mechanical protection (300/500V)',
    pattern: /classic\s*110\s*sy/i,
    baselineCount: 32,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX CLASSIC 110 SY', 'Steel wire braid armored mechanical protection (300/500V)')
  },
  {
    id: 'lapp-classic-110-cy',
    name: 'ÖLFLEX® CLASSIC 110 CY',
    brand: 'LAPP',
    categoryName: 'Power and Control Cables',
    description: 'Screened PVC control cable with copper braid for EMC compliance (300/500V)',
    pattern: /classic\s*110\s*cy/i,
    baselineCount: 38,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX CLASSIC 110 CY', 'EMC-compliant copper braided screening (300/500V)')
  },
  {
    id: 'lapp-classic-100',
    name: 'ÖLFLEX® CLASSIC 100I',
    brand: 'LAPP',
    categoryName: 'Power and Control Cables',
    description: 'Color-coded PVC control cable for power & industrial connections (300/500V - 450/750V)',
    pattern: /(?:classic\s*)?100/i,
    baselineCount: 28,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX CLASSIC 100I', 'Color-coded industrial power cable (450/750V)')
  },

  // LAPP - Data Communication Cables
  {
    id: 'lapp-unitronic-liycy-tp',
    name: 'UNITRONIC® LiYCY (TP)',
    brand: 'LAPP',
    categoryName: 'Data Communication Cables',
    description: 'Screened twisted pair data transmission cable for noise-sensitive EMC environments',
    pattern: /liycy\s*\(tp\)/i,
    baselineCount: 20,
    datasheetUrl: createDefaultPdfBase64('UNITRONIC LiYCY (TP)', 'Screened twisted pair high-speed data transmission')
  },
  {
    id: 'lapp-unitronic-liycy',
    name: 'UNITRONIC® LiYCY',
    brand: 'LAPP',
    categoryName: 'Data Communication Cables',
    description: 'Screened multi-core data cable with tinned copper braid against electromagnetic interference',
    pattern: /liycy\b(?!.*\(tp\))/i,
    baselineCount: 24,
    datasheetUrl: createDefaultPdfBase64('UNITRONIC LiYCY', 'Tinned copper braid screened multi-core signal cable')
  },
  {
    id: 'lapp-unitronic-liyy-tp',
    name: 'UNITRONIC® LiYY (TP)',
    brand: 'LAPP',
    categoryName: 'Data Communication Cables',
    description: 'Space-saving twisted pair data cable with compact outer diameter and minimal crosstalk',
    pattern: /liyy\s*\(tp\)/i,
    baselineCount: 14,
    datasheetUrl: createDefaultPdfBase64('UNITRONIC LiYY (TP)', 'Space-saving twisted pair low-capacitance cable')
  },
  {
    id: 'lapp-unitronic-liyy',
    name: 'UNITRONIC® LiYY',
    brand: 'LAPP',
    categoryName: 'Data Communication Cables',
    description: 'Space-saving unshielded multi-core data and signal transmission cable',
    pattern: /liyy\b(?!.*\(tp\))/i,
    baselineCount: 10,
    datasheetUrl: createDefaultPdfBase64('UNITRONIC LiYY', 'Unshielded compact multi-core automation signal cable')
  },

  // LAPP - Control Cabinet Single Cores
  {
    id: 'lapp-uniplus-h07v-k',
    name: 'ÖLFLEX® UNIPLUS H07V-K',
    brand: 'LAPP',
    categoryName: 'Control Cabinet Single Cores',
    description: 'Flexible PVC single core wiring cable for switch cabinets & control panels (450/750V)',
    pattern: /h07v-k|uniplus.*(?:1\.5|2\.5|4|6|10|16)/i,
    baselineCount: 36,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX UNIPLUS H07V-K', 'Harmonized flexible single core panel wiring (450/750V)')
  },
  {
    id: 'lapp-uniplus-h05v-k',
    name: 'ÖLFLEX® UNIPLUS H05V-K',
    brand: 'LAPP',
    categoryName: 'Control Cabinet Single Cores',
    description: 'Flexible hook-up wire for internal apparatus wiring and electronics (300/500V)',
    pattern: /h05v-k|uniplus.*(?:0\.5|0\.75|1\b)/i,
    baselineCount: 24,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX UNIPLUS H05V-K', 'Hook-up wire for apparatus and switchboard electronics')
  },
  {
    id: 'lapp-uniplus-multinorm',
    name: 'ÖLFLEX® MULTINORM',
    brand: 'LAPP',
    categoryName: 'Control Cabinet Single Cores',
    description: 'UL/CSA/HAR multi-standard approved single core wire for export machinery',
    pattern: /multinorm/i,
    baselineCount: 18,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX MULTINORM', 'UL/CSA/HAR multi-standard approved single core wire')
  },
  {
    id: 'lapp-uniplus-tri-rated',
    name: 'UNIPLUS® TRI-RATED',
    brand: 'LAPP',
    categoryName: 'Control Cabinet Single Cores',
    description: 'BS/UL/CSA certified panel wiring wire for high temperature resistance up to 105°C',
    pattern: /tri-rated|trirated/i,
    baselineCount: 17,
    datasheetUrl: createDefaultPdfBase64('UNIPLUS TRI-RATED', 'High-temperature BS/UL/CSA 105°C panel wiring')
  },

  // LAPP - Cable Glands & Counter Nuts
  {
    id: 'lapp-skintop-st-m',
    name: 'SKINTOP® ST-M',
    brand: 'LAPP',
    categoryName: 'Cable Glands & Counter Nuts',
    description: 'Metric polyamide cable gland with integrated vibration protection and IP68 seal',
    pattern: /st-m|st\s*pg|st\s*m/i,
    baselineCount: 32,
    datasheetUrl: createDefaultPdfBase64('SKINTOP ST-M', 'Metric polyamide IP68 cable gland with vibration protection')
  },
  {
    id: 'lapp-skintop-gmp-gl-m',
    name: 'SKINTOP® GMP-GL-M',
    brand: 'LAPP',
    categoryName: 'Cable Glands & Counter Nuts',
    description: 'Metric glass-fiber reinforced polyamide counter nuts / locknuts',
    pattern: /gmp-gl-m|gmp|counter\s*nut|locknut/i,
    baselineCount: 22,
    datasheetUrl: createDefaultPdfBase64('SKINTOP GMP-GL-M', 'Glass-fiber reinforced polyamide counter locknuts')
  },
  {
    id: 'lapp-skintop-ms-m',
    name: 'SKINTOP® MS-M',
    brand: 'LAPP',
    categoryName: 'Cable Glands & Counter Nuts',
    description: 'Nickel-plated brass cable gland for harsh mechanical and chemical environments',
    pattern: /ms-m|brass/i,
    baselineCount: 18,
    datasheetUrl: createDefaultPdfBase64('SKINTOP MS-M', 'Nickel-plated brass IP68 heavy-duty industrial cable gland')
  },
  {
    id: 'lapp-skintop-click',
    name: 'SKINTOP® CLICK',
    brand: 'LAPP',
    categoryName: 'Cable Glands & Counter Nuts',
    description: 'Innovative quick-mount click cable gland system with snap-in installation',
    pattern: /click/i,
    baselineCount: 12,
    datasheetUrl: createDefaultPdfBase64('SKINTOP CLICK', 'Snap-in toolless quick-mount cable gland system')
  },

  // LAPP - Rill, Conduit & Klick
  {
    id: 'lapp-silvyn-rill',
    name: 'SILVYN® RILL',
    brand: 'LAPP',
    categoryName: 'Rill, Conduit & Klick',
    description: 'Corrugated flexible polyamide conduit for dynamic cable bundling and physical protection',
    pattern: /rill/i,
    baselineCount: 20,
    datasheetUrl: createDefaultPdfBase64('SILVYN RILL', 'Corrugated flexible polyamide protective conduit system')
  },
  {
    id: 'lapp-silvyn-klick',
    name: 'SILVYN® KLICK',
    brand: 'LAPP',
    categoryName: 'Rill, Conduit & Klick',
    description: 'Quick-snap push-in conduit connector glands with high pull-out resistance (IP66/IP68)',
    pattern: /klick/i,
    baselineCount: 16,
    datasheetUrl: createDefaultPdfBase64('SILVYN KLICK', 'Push-in conduit connector glands with high pull-out safety')
  },
  {
    id: 'lapp-silvyn-fpas',
    name: 'SILVYN® FPAS',
    brand: 'LAPP',
    categoryName: 'Rill, Conduit & Klick',
    description: 'Heavy-duty polyamide PA6 flexible protective conduit for machinery & automation',
    pattern: /fpas/i,
    baselineCount: 10,
    datasheetUrl: createDefaultPdfBase64('SILVYN FPAS', 'Heavy-duty PA6 flexible protective conduit for automation')
  },
  {
    id: 'lapp-silvyn-lgs-2',
    name: 'SILVYN® LGS-2',
    brand: 'LAPP',
    categoryName: 'Rill, Conduit & Klick',
    description: 'Liquid-tight galvanized steel armored conduit with oil-resistant PVC jacket',
    pattern: /lgs|metal/i,
    baselineCount: 6,
    datasheetUrl: createDefaultPdfBase64('SILVYN LGS-2', 'Liquid-tight galvanized steel armored conduit system')
  },

  // LAPP - Domestic / House Wiring
  {
    id: 'lapp-infra-frls',
    name: 'ÖLFLEX® INFRA FRLS',
    brand: 'LAPP',
    categoryName: 'Domestic / House Wiring',
    description: 'Flame Retardant Low Smoke building wire for residential & commercial wiring (1100V)',
    pattern: /frls/i,
    baselineCount: 28,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX INFRA FRLS', 'Flame Retardant Low Smoke building wire 1100V')
  },
  {
    id: 'lapp-infra-fr',
    name: 'ÖLFLEX® INFRA FR',
    brand: 'LAPP',
    categoryName: 'Domestic / House Wiring',
    description: 'Flame Retardant PVC insulated house wire with high oxygen index for fire safety',
    pattern: /\bfr\b(?!.*(?:ls|zh))/i,
    baselineCount: 20,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX INFRA FR', 'Flame Retardant PVC insulated house wire with high oxygen index')
  },
  {
    id: 'lapp-infra-hrfr',
    name: 'ÖLFLEX® INFRA HRFR',
    brand: 'LAPP',
    categoryName: 'Domestic / House Wiring',
    description: 'Heat Resistant Flame Retardant house wire for high-load and warm environments (85°C)',
    pattern: /hrfr/i,
    baselineCount: 16,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX INFRA HRFR', 'Heat Resistant Flame Retardant house wire 85°C')
  },
  {
    id: 'lapp-infra-zhfr',
    name: 'ÖLFLEX® INFRA ZHFR',
    brand: 'LAPP',
    categoryName: 'Domestic / House Wiring',
    description: 'Zero Halogen Flame Retardant eco-friendly building wire with zero toxic emissions',
    pattern: /zhfr/i,
    baselineCount: 14,
    datasheetUrl: createDefaultPdfBase64('ÖLFLEX INFRA ZHFR', 'Zero Halogen Flame Retardant eco-friendly building wire')
  },

  // Eaton Groups
  {
    id: 'eaton-pkzm0',
    name: 'PKZM0 Motor Breakers',
    brand: 'Eaton',
    categoryName: 'Switchgear & Protection',
    description: 'Rotary motor protection breakers with overload & short circuit release up to 150 kA',
    pattern: /pkzm0/i,
    baselineCount: 8,
    datasheetUrl: createDefaultPdfBase64('EATON PKZM0', 'Motor-protective circuit-breaker up to 32 A')
  },
  {
    id: 'eaton-dilm',
    name: 'DILM Power Contactors',
    brand: 'Eaton',
    categoryName: 'Switchgear & Protection',
    description: 'Heavy-duty 3-pole and 4-pole contactors with electronic coils and auxiliary relays',
    pattern: /dilm/i,
    baselineCount: 8,
    datasheetUrl: createDefaultPdfBase64('EATON DILM', 'Power contactor up to 170 A with electronic actuation')
  },
  {
    id: 'eaton-nzm',
    name: 'NZM Compact MCCBs',
    brand: 'Eaton',
    categoryName: 'Switchgear & Protection',
    description: 'Electronic trip molded case circuit breakers up to 1600A for industrial distribution',
    pattern: /nzm/i,
    baselineCount: 6,
    datasheetUrl: createDefaultPdfBase64('EATON NZM', 'Molded case circuit breaker up to 1600 A')
  },
  {
    id: 'eaton-faz',
    name: 'FAZ DIN-Rail MCBs',
    brand: 'Eaton',
    categoryName: 'Switchgear & Protection',
    description: '10kA and 15kA breaking capacity DIN rail miniature circuit breakers',
    pattern: /faz/i,
    baselineCount: 6,
    datasheetUrl: createDefaultPdfBase64('EATON FAZ', 'Miniature circuit breaker for industrial applications')
  }
];

const LOCAL_STORAGE_KEY = 'siddhi_product_group_datasheets';

export function getStoredGroupDatasheets(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProductGroupDatasheet(groupIdOrName: string, datasheetUrl: string): void {
  try {
    const current = getStoredGroupDatasheets();
    current[groupIdOrName.toLowerCase().trim()] = datasheetUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save group datasheet to localStorage:', err);
  }
}

export function removeProductGroupDatasheet(groupIdOrName: string): void {
  try {
    const current = getStoredGroupDatasheets();
    delete current[groupIdOrName.toLowerCase().trim()];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to remove group datasheet from localStorage:', err);
  }
}

/**
 * Resolves the appropriate datasheet URL for a product based on the 4-Level hierarchy:
 * 1. Product Variant datasheet (Level 4)
 * 2. Product Group datasheet (Level 3 - from localStorage or INITIAL_PRODUCT_GROUPS)
 * 3. Brand Category datasheet (Level 2)
 */
export function resolveProductDatasheet(
  productName?: string,
  variantDatasheet?: string | null,
  categoryDatasheet?: string | null
): string | null {
  // Level 4: Variant specific datasheet takes precedence
  if (variantDatasheet && variantDatasheet.trim()) {
    return variantDatasheet;
  }

  const pName = (productName || '').trim();
  if (!pName) return categoryDatasheet || null;

  const storedDatasheets = getStoredGroupDatasheets();

  // Level 3: Match against Product Groups
  for (const group of INITIAL_PRODUCT_GROUPS) {
    if (group.pattern.test(pName)) {
      // Check if admin has uploaded a custom datasheet for this group
      const customKey = group.name.toLowerCase().trim();
      const customIdKey = group.id.toLowerCase().trim();
      if (storedDatasheets[customKey]) return storedDatasheets[customKey];
      if (storedDatasheets[customIdKey]) return storedDatasheets[customIdKey];
      // Otherwise use the group's default datasheet
      if (group.datasheetUrl) return group.datasheetUrl;
    }
  }

  // Fallback to Category datasheet (Level 2)
  return categoryDatasheet || null;
}

/**
 * Helper to get the matched Product Group for a product name
 */
export function getMatchedProductGroup(productName?: string): ProductGroupItem | null {
  if (!productName) return null;
  const pName = productName.trim();
  for (const group of INITIAL_PRODUCT_GROUPS) {
    if (group.pattern.test(pName)) {
      return group;
    }
  }
  return null;
}

