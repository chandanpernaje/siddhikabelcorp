export const CORE_TO_SQMM_MAP: Record<string, string[]> = {
  "1": ["0.5", "0.75", "1", "1.5", "2.5", "4", "6", "10", "16", "25", "35", "50", "70", "95", "120", "150", "185", "240"],
  "2": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5", "4", "6", "10", "45"],
  "3": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5", "4", "6", "10", "16"],
  "4": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5", "4", "6", "10", "16", "25", "35"],
  "5": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2.5", "4", "6", "10", "16", "25", "35"],
  "6": ["0.14", "0.25", "0.34", "0.5", "1", "1.5", "2"],
  "7": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5", "4", "6", "10", "16", "25"],
  "8": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2"],
  "10": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2"],
  "12": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5"],
  "14": ["0.14", "0.25", "0.5", "1", "1.5", "2.5"],
  "15": ["0.14", "0.25", "0.34", "0.75"],
  "16": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2"],
  "18": ["0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5"],
  "20": ["0.14", "0.25", "0.34", "0.5", "0.75", "1"],
  "21": ["0.5", "0.75", "1.5"],
  "25": ["0.14", "0.25", "0.34", "0.5", "0.75", "1", "1.5", "2", "2.5"],
  "30": ["0.34", "0.5", "0.75"],
  "32": ["0.25", "0.34", "1", "1.5"],
  "34": ["1", "1.5"],
  "35": ["0.5"],
  "36": ["0.25", "1"],
  "40": ["0.14", "0.25", "0.34", "0.5", "0.75", "1"],
  "41": ["0.75", "1"],
  "50": ["0.14", "0.25", "0.34", "1", "1.5"],
  "52": ["0.5"],
  "63": ["1"],
  "0": ["7", "9", "10", "11", "13", "15.8", "16", "18.5", "21", "21.2", "28.5", "29", "34.5", "36", "42", "42.5", "48", "54.5"]
};

export const AVAILABLE_CORES = Object.keys(CORE_TO_SQMM_MAP).sort((a, b) => {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (numA === 0) return 1;
  if (numB === 0) return -1;
  return numA - numB;
});

export function getValidSqmmOptions(core: string | number | null | undefined): string[] {
  if (core === null || core === undefined || core === '') return [];
  const c = String(core).trim();
  return CORE_TO_SQMM_MAP[c] || [];
}

export function validateCoreSqmm(core?: string | number | null, sqmm?: string | number | null): { valid: boolean; error?: string } {
  if (!core || !sqmm) return { valid: true };
  const c = String(core).trim();
  const s = String(sqmm).trim();
  const validOptions = CORE_TO_SQMM_MAP[c];
  if (!validOptions) {
    return { valid: true };
  }
  const numS = parseFloat(s);
  const isValid = validOptions.some(opt => parseFloat(opt) === numS || opt.toLowerCase() === s.toLowerCase());
  if (!isValid) {
    return {
      valid: false,
      error: `Invalid combination: Core size ${c} does not support ${s} mm². Valid SQMM size(s) for core ${c}: ${validOptions.join(', ')} mm²`
    };
  }
  return { valid: true };
}

export interface UomOption {
  code: string;
  label: string;
  category: 'Length' | 'Area' | 'Packaging' | 'Unit';
  abbreviation: string;
}

export const UOM_OPTIONS: UomOption[] = [
  { code: 'Meter', label: 'Metre (m)', category: 'Length', abbreviation: 'm' },
  { code: 'Piece', label: 'Piece (pc)', category: 'Unit', abbreviation: 'pc' },
  { code: 'Coil', label: 'Coil (100m bundle)', category: 'Packaging', abbreviation: 'coil' },
  { code: 'Drum', label: 'Drum (Bulk spool)', category: 'Packaging', abbreviation: 'drum' },
  { code: 'Pack', label: 'Pack / Box', category: 'Packaging', abbreviation: 'pack' },
  { code: 'Roll', label: 'Roll', category: 'Packaging', abbreviation: 'roll' },
  { code: 'mm', label: 'Millimetre (mm)', category: 'Length', abbreviation: 'mm' },
  { code: 'cm', label: 'Centimetre (cm)', category: 'Length', abbreviation: 'cm' },
  { code: 'ft', label: 'Foot (ft)', category: 'Length', abbreviation: 'ft' },
  { code: 'in', label: 'Inch (in)', category: 'Length', abbreviation: 'in' },
  { code: 'sqmm', label: 'Square millimetre (sqmm)', category: 'Area', abbreviation: 'sqmm' },
  { code: 'Set', label: 'Set', category: 'Unit', abbreviation: 'set' },
];

export interface ColourOption {
  code: string;
  label: string;
  hex: string;
  gradient?: string;
  border?: string;
}

export const COLOUR_OPTIONS: ColourOption[] = [
  { code: 'Grey', label: 'Grey', hex: '#64748B' },
  { code: 'Black', label: 'Black', hex: '#1E293B' },
  { code: 'Blue', label: 'Blue', hex: '#2563EB' },
  { code: 'Red', label: 'Red', hex: '#DC2626' },
  { code: 'Green', label: 'Green', hex: '#16A34A' },
  { code: 'Yellow', label: 'Yellow', hex: '#EAB308' },
  { code: 'White', label: 'White', hex: '#F8FAFC', border: '#CBD5E1' },
  { code: 'Brown', label: 'Brown', hex: '#78350F' },
  { code: 'Green/Yellow', label: 'Green/Yellow (Earthing)', hex: '#16A34A', gradient: 'linear-gradient(135deg, #16A34A 50%, #EAB308 50%)' },
  { code: 'Orange', label: 'Orange', hex: '#EA580C' },
  { code: 'Violet', label: 'Violet', hex: '#7C3AED' },
  { code: 'Transparent', label: 'Transparent / Clear', hex: '#E2E8F0', border: '#94A3B8' },
  { code: 'Other', label: 'Other', hex: '#94A3B8' }
];

export function getColourInfo(colourName?: string | null): ColourOption | undefined {
  if (!colourName) return undefined;
  const clean = colourName.trim().toLowerCase();
  return COLOUR_OPTIONS.find(c => c.code.toLowerCase() === clean || c.label.toLowerCase() === clean || clean.includes(c.code.toLowerCase()));
}

export function getUomLabel(uomCode?: string | null): string {
  if (!uomCode) return 'Meter';
  const match = UOM_OPTIONS.find(u => u.code.toLowerCase() === uomCode.toLowerCase() || u.abbreviation.toLowerCase() === uomCode.toLowerCase());
  return match ? match.code : uomCode;
}
