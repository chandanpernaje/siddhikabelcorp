export interface EatonProduct {
  partNo: string;
  name: string;
  series: string; // e.g. "PKZM0", "DILM", "FAZ"
  price: number;
  gst: number;
  mrp: number;
  desc: string;
  specs: string[];
}

export const EATON_PRODUCTS: EatonProduct[] = [
  // PKZM0
  {
    partNo: "072734",
    name: "PKZM0-4 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 1850,
    gst: 18,
    mrp: 2450,
    desc: "Motor-protective circuit-breaker, 3p, Ir=2.5-4A",
    specs: ["Setting range overload releases: 2.5 - 4 A", "Short-circuit release: 56 A", "Rated uninterrupted current: 4 A"]
  },
  {
    partNo: "072735",
    name: "PKZM0-6.3 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 1950,
    gst: 18,
    mrp: 2600,
    desc: "Motor-protective circuit-breaker, 3p, Ir=4-6.3A",
    specs: ["Setting range overload releases: 4 - 6.3 A", "Short-circuit release: 88.2 A", "Rated uninterrupted current: 6.3 A"]
  },
  {
    partNo: "072736",
    name: "PKZM0-10 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 2150,
    gst: 18,
    mrp: 2850,
    desc: "Motor-protective circuit-breaker, 3p, Ir=6.3-10A",
    specs: ["Setting range overload releases: 6.3 - 10 A", "Short-circuit release: 140 A", "Rated uninterrupted current: 10 A"]
  },
  
  // DILM
  {
    partNo: "276550",
    name: "DILM7-10(230V50HZ,240V60HZ) Contactor",
    series: "DILM",
    price: 1250,
    gst: 18,
    mrp: 1650,
    desc: "Contactor, 3 pole, 380 V 400 V 3 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 7 A", "Motor rating AC-3 (380 V 400 V): 3 kW", "Contacts: 1 N/O"]
  },
  {
    partNo: "276690",
    name: "DILM9-10(230V50HZ,240V60HZ) Contactor",
    series: "DILM",
    price: 1450,
    gst: 18,
    mrp: 1900,
    desc: "Contactor, 3 pole, 380 V 400 V 4 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 9 A", "Motor rating AC-3 (380 V 400 V): 4 kW", "Contacts: 1 N/O"]
  },
  {
    partNo: "276830",
    name: "DILM12-10(230V50HZ,240V60HZ) Contactor",
    series: "DILM",
    price: 1750,
    gst: 18,
    mrp: 2300,
    desc: "Contactor, 3 pole, 380 V 400 V 5.5 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 12 A", "Motor rating AC-3 (380 V 400 V): 5.5 kW", "Contacts: 1 N/O"]
  },

  // FAZ
  {
    partNo: "278553",
    name: "FAZ-C10/1 Miniature Circuit Breaker",
    series: "FAZ",
    price: 450,
    gst: 18,
    mrp: 600,
    desc: "Miniature circuit breaker (MCB), 10A, 1p, characteristic: C",
    specs: ["Rated current: 10 A", "Number of poles: 1", "Tripping characteristic: C"]
  },
  {
    partNo: "278555",
    name: "FAZ-C16/1 Miniature Circuit Breaker",
    series: "FAZ",
    price: 450,
    gst: 18,
    mrp: 600,
    desc: "Miniature circuit breaker (MCB), 16A, 1p, characteristic: C",
    specs: ["Rated current: 16 A", "Number of poles: 1", "Tripping characteristic: C"]
  },
  {
    partNo: "278556",
    name: "FAZ-C20/1 Miniature Circuit Breaker",
    series: "FAZ",
    price: 450,
    gst: 18,
    mrp: 600,
    desc: "Miniature circuit breaker (MCB), 20A, 1p, characteristic: C",
    specs: ["Rated current: 20 A", "Number of poles: 1", "Tripping characteristic: C"]
  },

  // NZM
  {
    partNo: "259075",
    name: "NZMN1-A40 Circuit-Breaker",
    series: "NZM",
    price: 12500,
    gst: 18,
    mrp: 16500,
    desc: "Circuit-breaker, 3p, 40A",
    specs: ["Rated current = rated uninterrupted current: 40 A", "Switching capacity: 50 kA", "Release system: Thermomagnetic release"]
  },
  {
    partNo: "259081",
    name: "NZMN1-A100 Circuit-Breaker",
    series: "NZM",
    price: 13500,
    gst: 18,
    mrp: 18000,
    desc: "Circuit-breaker, 3p, 100A",
    specs: ["Rated current = rated uninterrupted current: 100 A", "Switching capacity: 50 kA", "Release system: Thermomagnetic release"]
  }
];
