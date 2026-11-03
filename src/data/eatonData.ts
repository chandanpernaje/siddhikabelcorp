export interface EatonProduct {
  partNo: string;
  name: string;
  series: string; // e.g. "PKZM0", "DILM", "NZM", "RMQ", "FAZ", "PowerXL"
  price: number;
  gst: number;
  mrp: number;
  desc: string;
  specs: string[];
}

export const EATON_PRODUCTS: EatonProduct[] = [
  // 1. PKZM0 Motor-Protective Circuit-Breakers
  {
    partNo: "072734",
    name: "PKZM0-4 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 1850,
    gst: 18,
    mrp: 2450,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=2.5-4A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 2.5 - 4 A", "Short-circuit release: 56 A", "Rated uninterrupted current: 4 A", "Breaking capacity Icu: 150 kA @ 400V", "Integrated phase-failure sensitivity"]
  },
  {
    partNo: "072735",
    name: "PKZM0-6.3 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 1950,
    gst: 18,
    mrp: 2600,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=4-6.3A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 4 - 6.3 A", "Short-circuit release: 88.2 A", "Rated uninterrupted current: 6.3 A", "Breaking capacity Icu: 150 kA @ 400V", "Integrated phase-failure sensitivity"]
  },
  {
    partNo: "072736",
    name: "PKZM0-10 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 2150,
    gst: 18,
    mrp: 2850,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=6.3-10A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 6.3 - 10 A", "Short-circuit release: 140 A", "Rated uninterrupted current: 10 A", "Breaking capacity Icu: 150 kA @ 400V", "Integrated phase-failure sensitivity"]
  },
  {
    partNo: "072737",
    name: "PKZM0-16 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 2450,
    gst: 18,
    mrp: 3200,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=10-16A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 10 - 16 A", "Short-circuit release: 224 A", "Rated uninterrupted current: 16 A", "Breaking capacity Icu: 50 kA @ 400V", "Integrated phase-failure sensitivity"]
  },
  {
    partNo: "072738",
    name: "PKZM0-25 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 2850,
    gst: 18,
    mrp: 3750,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=20-25A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 20 - 25 A", "Short-circuit release: 350 A", "Rated uninterrupted current: 25 A", "Breaking capacity Icu: 50 kA @ 400V", "Integrated phase-failure sensitivity"]
  },
  {
    partNo: "072739",
    name: "PKZM0-32 Motor-Protective Circuit-Breaker",
    series: "PKZM0",
    price: 3250,
    gst: 18,
    mrp: 4300,
    desc: "Motor-protective circuit-breaker, 3-pole, Ir=25-32A with short-circuit and thermal overload releases.",
    specs: ["Setting range overload releases: 25 - 32 A", "Short-circuit release: 448 A", "Rated uninterrupted current: 32 A", "Breaking capacity Icu: 50 kA @ 400V", "Integrated phase-failure sensitivity"]
  },

  // 2. DILM Power Contactors
  {
    partNo: "276550",
    name: "DILM7-10(230V50HZ) Contactor",
    series: "DILM",
    price: 1250,
    gst: 18,
    mrp: 1650,
    desc: "Contactor, 3 pole, 380 V 400 V 3 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 7 A", "Motor rating AC-3 (380 V 400 V): 3 kW", "Contacts: 1 N/O", "Coil voltage: 230V AC 50Hz", "Mechanical lifespan: 10M operations"]
  },
  {
    partNo: "276690",
    name: "DILM9-10(230V50HZ) Contactor",
    series: "DILM",
    price: 1450,
    gst: 18,
    mrp: 1900,
    desc: "Contactor, 3 pole, 380 V 400 V 4 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 9 A", "Motor rating AC-3 (380 V 400 V): 4 kW", "Contacts: 1 N/O", "Coil voltage: 230V AC 50Hz", "SmartWire-DT ready"]
  },
  {
    partNo: "276830",
    name: "DILM12-10(230V50HZ) Contactor",
    series: "DILM",
    price: 1750,
    gst: 18,
    mrp: 2300,
    desc: "Contactor, 3 pole, 380 V 400 V 5.5 kW, 1 N/O, 230 V 50 Hz, 240 V 60 Hz",
    specs: ["Rated operational current AC-3: 12 A", "Motor rating AC-3 (380 V 400 V): 5.5 kW", "Contacts: 1 N/O", "Coil voltage: 230V AC 50Hz", "Box terminals with captive screws"]
  },
  {
    partNo: "277004",
    name: "DILM17-10(230V50HZ) Contactor",
    series: "DILM",
    price: 2450,
    gst: 18,
    mrp: 3200,
    desc: "Contactor, 3 pole, 380 V 400 V 7.5 kW, 1 N/O, 230 V 50 Hz",
    specs: ["Rated operational current AC-3: 18 A", "Motor rating AC-3 (380 V 400 V): 7.5 kW", "Contacts: 1 N/O", "Electronic coil technology", "Dual box terminals for conductors"]
  },
  {
    partNo: "277132",
    name: "DILM25-10(230V50HZ) Contactor",
    series: "DILM",
    price: 2950,
    gst: 18,
    mrp: 3900,
    desc: "Contactor, 3 pole, 380 V 400 V 11 kW, 1 N/O, 230 V 50 Hz",
    specs: ["Rated operational current AC-3: 25 A", "Motor rating AC-3 (380 V 400 V): 11 kW", "Contacts: 1 N/O", "High electrical life", "Finger and back-of-hand proof to VDE 0106"]
  },
  {
    partNo: "277260",
    name: "DILM32-10(230V50HZ) Contactor",
    series: "DILM",
    price: 3850,
    gst: 18,
    mrp: 5100,
    desc: "Contactor, 3 pole, 380 V 400 V 15 kW, 1 N/O, 230 V 50 Hz",
    specs: ["Rated operational current AC-3: 32 A", "Motor rating AC-3 (380 V 400 V): 15 kW", "Contacts: 1 N/O", "Coil voltage: 230V AC 50Hz", "Heavy-duty industrial applications"]
  },

  // 3. NZM Compact Molded Case Circuit Breakers
  {
    partNo: "259075",
    name: "NZMN1-A40 Molded Case Circuit Breaker",
    series: "NZM",
    price: 12500,
    gst: 18,
    mrp: 16500,
    desc: "Circuit-breaker, 3-pole, 40A with thermomagnetic release and 50 kA breaking capacity.",
    specs: ["Rated uninterrupted current: 40 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Thermomagnetic release", "Frame size: NZM1", "Overload release setting: 32 - 40 A"]
  },
  {
    partNo: "259081",
    name: "NZMN1-A100 Molded Case Circuit Breaker",
    series: "NZM",
    price: 13500,
    gst: 18,
    mrp: 18000,
    desc: "Circuit-breaker, 3-pole, 100A with thermomagnetic release and 50 kA breaking capacity.",
    specs: ["Rated uninterrupted current: 100 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Thermomagnetic release", "Frame size: NZM1", "Overload release setting: 80 - 100 A"]
  },
  {
    partNo: "259084",
    name: "NZMN1-A160 Molded Case Circuit Breaker",
    series: "NZM",
    price: 15800,
    gst: 18,
    mrp: 21000,
    desc: "Circuit-breaker, 3-pole, 160A with thermomagnetic release and 50 kA breaking capacity.",
    specs: ["Rated uninterrupted current: 160 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Thermomagnetic release", "Frame size: NZM1", "Overload release setting: 125 - 160 A"]
  },
  {
    partNo: "259099",
    name: "NZMN2-A250 Molded Case Circuit Breaker",
    series: "NZM",
    price: 22400,
    gst: 18,
    mrp: 29500,
    desc: "Circuit-breaker, 3-pole, 250A with electronic trip unit and diagnostic USB interface.",
    specs: ["Rated uninterrupted current: 250 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Electronic Trip Unit (ETU)", "Frame size: NZM2", "Overload release setting: 200 - 250 A"]
  },
  {
    partNo: "259114",
    name: "NZMN3-AE400 Molded Case Circuit Breaker",
    series: "NZM",
    price: 38500,
    gst: 18,
    mrp: 49000,
    desc: "Circuit-breaker, 3-pole, 400A with electronic trip unit and onboard energy measurement.",
    specs: ["Rated uninterrupted current: 400 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Electronic Trip Unit (ETU)", "Frame size: NZM3", "Overload release setting: 200 - 400 A"]
  },
  {
    partNo: "259115",
    name: "NZMN3-AE630 Molded Case Circuit Breaker",
    series: "NZM",
    price: 49500,
    gst: 18,
    mrp: 64000,
    desc: "Circuit-breaker, 3-pole, 630A with electronic trip unit for main industrial incomer switchboards.",
    specs: ["Rated uninterrupted current: 630 A", "Switching capacity Icu: 50 kA @ 415V", "Release system: Electronic Trip Unit (ETU)", "Frame size: NZM3", "Overload release setting: 315 - 630 A"]
  },

  // 4. RMQ-Titan 22mm Pilot Devices & Pushbuttons
  {
    partNo: "216596",
    name: "M22-D-G Flush Pushbutton Actuator (Green)",
    series: "RMQ",
    price: 320,
    gst: 18,
    mrp: 420,
    desc: "RMQ-Titan pushbutton actuator, flat, green, momentary, IP66/IP67/IP69K front ring titanium.",
    specs: ["Mounting diameter: 22.5 mm", "Degree of protection: IP66, IP67, IP69K", "Actuation: Momentary", "Colour: Green", "Bezel: Titanium"]
  },
  {
    partNo: "216594",
    name: "M22-D-R Flush Pushbutton Actuator (Red)",
    series: "RMQ",
    price: 320,
    gst: 18,
    mrp: 420,
    desc: "RMQ-Titan pushbutton actuator, flat, red, momentary, IP66/IP67/IP69K front ring titanium.",
    specs: ["Mounting diameter: 22.5 mm", "Degree of protection: IP66, IP67, IP69K", "Actuation: Momentary", "Colour: Red", "Bezel: Titanium"]
  },
  {
    partNo: "216525",
    name: "M22-PV/KC11/IY Emergency-Stop Complete Unit",
    series: "RMQ",
    price: 1850,
    gst: 18,
    mrp: 2450,
    desc: "Emergency-stop actuator, 38mm mushroom head, turn-to-reset, complete with enclosure, 1 NO + 1 NC contacts.",
    specs: ["Diameter: 38 mm", "Reset method: Turn-to-reset", "Contacts: 1 N/O + 1 N/C positive opening", "Enclosure: Yellow surface mount IP66/IP69K", "Conforms to: EN ISO 13850, IEC/EN 60947-5-5"]
  },
  {
    partNo: "216874",
    name: "M22-WKV 2-Position Selector Switch",
    series: "RMQ",
    price: 490,
    gst: 18,
    mrp: 650,
    desc: "RMQ-Titan selector switch actuator, 2 positions (60°), maintained, V-position, titanium bezel.",
    specs: ["Mounting diameter: 22.5 mm", "Positions: 2-position (maintained)", "Degree of protection: IP66", "Bezel: Titanium", "Thumb-grip rotary operator"]
  },
  {
    partNo: "216563",
    name: "M22-LED230-W White LED Light Element",
    series: "RMQ",
    price: 580,
    gst: 18,
    mrp: 760,
    desc: "RMQ-Titan LED element, front fixing, white light, rated operating voltage 85 - 264 V AC.",
    specs: ["Rated operational voltage: 85 - 264 V AC", "Colour: White", "Fixing: Front mounting", "Connection: Screw terminals", "Lifespan: 100,000 hours continuous"]
  },
  {
    partNo: "216376",
    name: "M22-K10 Auxiliary Contact Element (1 N/O)",
    series: "RMQ",
    price: 195,
    gst: 18,
    mrp: 260,
    desc: "RMQ-Titan contact block, front fixing, 1 normally open contact (1 N/O) with screw terminals.",
    specs: ["Contacts: 1 N/O", "Fixing: Front element", "Rated operational current AC-15: 6A @ 230V", "Connection: Screw terminals", "SmartWire-DT compatible"]
  },

  // 5. FAZ DIN-Rail Miniature Circuit Breakers
  {
    partNo: "278553",
    name: "FAZ-C10/1 Miniature Circuit Breaker (10A, 1P)",
    series: "FAZ",
    price: 350,
    gst: 18,
    mrp: 480,
    desc: "Miniature circuit breaker (MCB), 10A, 1-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 10 A", "Number of poles: 1", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "Mounting: Standard DIN rail EN 60715"]
  },
  {
    partNo: "278555",
    name: "FAZ-C16/1 Miniature Circuit Breaker (16A, 1P)",
    series: "FAZ",
    price: 350,
    gst: 18,
    mrp: 480,
    desc: "Miniature circuit breaker (MCB), 16A, 1-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 16 A", "Number of poles: 1", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "Dual-purpose terminals (lift/open)"]
  },
  {
    partNo: "278556",
    name: "FAZ-C20/1 Miniature Circuit Breaker (20A, 1P)",
    series: "FAZ",
    price: 360,
    gst: 18,
    mrp: 490,
    desc: "Miniature circuit breaker (MCB), 20A, 1-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 20 A", "Number of poles: 1", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "Contact position indicator red/green"]
  },
  {
    partNo: "278558",
    name: "FAZ-C32/1 Miniature Circuit Breaker (32A, 1P)",
    series: "FAZ",
    price: 390,
    gst: 18,
    mrp: 520,
    desc: "Miniature circuit breaker (MCB), 32A, 1-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 32 A", "Number of poles: 1", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "DIN rail quick-release clip"]
  },
  {
    partNo: "278869",
    name: "FAZ-C16/3 Miniature Circuit Breaker (16A, 3P)",
    series: "FAZ",
    price: 1150,
    gst: 18,
    mrp: 1550,
    desc: "Miniature circuit breaker (MCB), 16A, 3-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 16 A", "Number of poles: 3", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "Captive terminal screws"]
  },
  {
    partNo: "278873",
    name: "FAZ-C32/3 Miniature Circuit Breaker (32A, 3P)",
    series: "FAZ",
    price: 1350,
    gst: 18,
    mrp: 1800,
    desc: "Miniature circuit breaker (MCB), 32A, 3-pole, tripping characteristic: C, breaking capacity 15 kA.",
    specs: ["Rated current: 32 A", "Number of poles: 3", "Tripping characteristic: C", "Rated switching capacity: 15 kA (IEC/EN 60947-2)", "Standard 3-phase commercial / industrial busbar ready"]
  },

  // 6. PowerXL Variable Frequency Drives
  {
    partNo: "185809",
    name: "PowerXL DC1 0.75kW VFD (1-Phase 230V)",
    series: "PowerXL",
    price: 11500,
    gst: 18,
    mrp: 14900,
    desc: "PowerXL DC1 compact variable frequency drive, 230V 1-phase in / 3-phase out, 4.3A, 0.75 kW (1 HP), IP20.",
    specs: ["Rated power: 0.75 kW (1.0 HP)", "Input voltage: 1-phase 200 - 240 V AC", "Output current: 4.3 A", "Integrated braking transistor & EMC filter", "Degree of protection: IP20"]
  },
  {
    partNo: "185860",
    name: "PowerXL DC1 1.5kW VFD (3-Phase 400V)",
    series: "PowerXL",
    price: 14500,
    gst: 18,
    mrp: 18900,
    desc: "PowerXL DC1 compact variable frequency drive, 400V 3-phase in / 3-phase out, 4.1A, 1.5 kW (2 HP), IP20.",
    specs: ["Rated power: 1.5 kW (2.0 HP)", "Input voltage: 3-phase 380 - 480 V AC", "Output current: 4.1 A", "Built-in 7-segment LED display with keypad", "Modbus RTU / CANopen onboard"]
  },
  {
    partNo: "185863",
    name: "PowerXL DC1 4.0kW VFD (3-Phase 400V)",
    series: "PowerXL",
    price: 21800,
    gst: 18,
    mrp: 27900,
    desc: "PowerXL DC1 compact variable frequency drive, 400V 3-phase in / 3-phase out, 9.5A, 4.0 kW (5.5 HP), IP20.",
    specs: ["Rated power: 4.0 kW (5.5 HP)", "Input voltage: 3-phase 380 - 480 V AC", "Output current: 9.5 A", "Sensorless vector control & V/f control", "Degree of protection: IP20"]
  },
  {
    partNo: "174327",
    name: "PowerXL DE1 0.25kW Variable Speed Starter",
    series: "PowerXL",
    price: 8900,
    gst: 18,
    mrp: 11500,
    desc: "PowerXL DE1 speed starter, bridges gap between contactor and drive, 230V 1-ph in / 3-ph out, 1.4A, 0.25 kW.",
    specs: ["Rated power: 0.25 kW (0.33 HP)", "Input voltage: 1-phase 200 - 240 V AC", "Output current: 1.4 A", "Out-of-the-box commissioning without parameterization", "Trip-free design for high plant availability"]
  },
  {
    partNo: "185866",
    name: "PowerXL DC1 7.5kW VFD (3-Phase 400V)",
    series: "PowerXL",
    price: 33500,
    gst: 18,
    mrp: 42500,
    desc: "PowerXL DC1 compact variable frequency drive, 400V 3-phase, 18A, 7.5 kW (10 HP), IP20.",
    specs: ["Rated power: 7.5 kW (10 HP)", "Input voltage: 3-phase 380 - 480 V AC", "Output current: 18.0 A", "Heavy overload: 150% for 60s, 175% for 2s", "Degree of protection: IP20"]
  },
  {
    partNo: "185867",
    name: "PowerXL DC1 11kW VFD (3-Phase 400V)",
    series: "PowerXL",
    price: 44500,
    gst: 18,
    mrp: 56900,
    desc: "PowerXL DC1 compact variable frequency drive, 400V 3-phase, 24A, 11 kW (15 HP), IP20.",
    specs: ["Rated power: 11.0 kW (15 HP)", "Input voltage: 3-phase 380 - 480 V AC", "Output current: 24.0 A", "Conformal coated boards for harsh environments", "Degree of protection: IP20"]
  }
];
