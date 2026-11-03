export interface MennekesProduct {
  partNo: string;
  name: string;
  series: string; // e.g. "PowerTOP", "Panel Sockets", "AMAXX", "DUO", "EverGUM", "Phase Inverters"
  amps?: string;
  poles?: string;
  voltage?: string;
  ipRating?: string;
  price: number;
  gst: number;
  mrp: number;
  desc: string;
  specs: string[];
}

export const MENNEKES_PRODUCTS: MennekesProduct[] = [
  // 1. PowerTOP® Xtra CEE Plugs & Connectors
  {
    partNo: "1311",
    name: "PowerTOP® Xtra 16A 3P 230V CEE Plug",
    series: "PowerTOP",
    amps: "16A",
    poles: "3P (2P+E)",
    voltage: "230V",
    ipRating: "IP54",
    price: 850,
    gst: 18,
    mrp: 1150,
    desc: "Ergonomic rubberized grip with rotating cable gland, nickel-plated contacts, and IP54 protection.",
    specs: ["Current: 16A", "Poles: 3P (2P+E)", "Voltage: 230V (6h)", "Protection: IP54", "Terminal: Screw terminals with captive screws"]
  },
  {
    partNo: "1411",
    name: "PowerTOP® Xtra 16A 3P 230V CEE Connector",
    series: "PowerTOP",
    amps: "16A",
    poles: "3P (2P+E)",
    voltage: "230V",
    ipRating: "IP54",
    price: 980,
    gst: 18,
    mrp: 1300,
    desc: "Coupler socket with rubberized grip area, integrated cable gland and high heat resistant contact carrier.",
    specs: ["Current: 16A", "Poles: 3P (2P+E)", "Voltage: 230V (6h)", "Protection: IP54", "Connection: Screwless TwinContact technology"]
  },
  {
    partNo: "1321",
    name: "PowerTOP® Xtra 32A 5P 400V CEE Plug",
    series: "PowerTOP",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP54",
    price: 1350,
    gst: 18,
    mrp: 1800,
    desc: "Heavy-duty 5-pin industrial plug with rubberized grip for 3-phase machines and automated industrial equipment.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP54", "Contact carrier: Highly heat resistant"]
  },
  {
    partNo: "1421",
    name: "PowerTOP® Xtra 32A 5P 400V CEE Connector",
    series: "PowerTOP",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP54",
    price: 1550,
    gst: 18,
    mrp: 2050,
    desc: "Trailing connector coupler with self-closing flip lid and strain relief for demanding mobile machine feeds.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP54", "Grip: Moulded rubber surface"]
  },
  {
    partNo: "13202",
    name: "PowerTOP® Xtra 63A 5P 400V IP67 Watertight Plug",
    series: "PowerTOP",
    amps: "63A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 4600,
    gst: 18,
    mrp: 5900,
    desc: "Watertight heavy industrial plug with X-CONTACT technology for minimal insertion resistance and extreme vibration resistance.",
    specs: ["Current: 63A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP67 Watertight", "Contacts: Nickel-plated X-CONTACT"]
  },
  {
    partNo: "14202",
    name: "PowerTOP® Xtra 63A 5P 400V IP67 Watertight Connector",
    series: "PowerTOP",
    amps: "63A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 5200,
    gst: 18,
    mrp: 6700,
    desc: "Watertight coupler socket with bayonet locking ring, IP67 rated for washdown areas, shipyards, and outdoor plants.",
    specs: ["Current: 63A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP67 Watertight", "Contacts: Nickel-plated X-CONTACT"]
  },

  // 2. Panel Mounted Sockets (Straight & Angled)
  {
    partNo: "1014",
    name: "Mennekes 16A 3P 230V Panel Socket (Straight)",
    series: "Panel Sockets",
    amps: "16A",
    poles: "3P (2P+E)",
    voltage: "230V",
    ipRating: "IP44",
    price: 680,
    gst: 18,
    mrp: 890,
    desc: "Straight panel-mounted socket outlet with flip lid, flange 75x75mm, standard machine control panel mounting.",
    specs: ["Current: 16A", "Poles: 3P (2P+E)", "Voltage: 230V (6h)", "Protection: IP44", "Flange size: 75 x 75 mm"]
  },
  {
    partNo: "1015",
    name: "Mennekes 16A 5P 400V Panel Socket (Straight)",
    series: "Panel Sockets",
    amps: "16A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 820,
    gst: 18,
    mrp: 1050,
    desc: "Straight 3-phase panel mounted receptacle for automated machine enclosures and power distribution switchboards.",
    specs: ["Current: 16A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP44", "Flange size: 75 x 75 mm"]
  },
  {
    partNo: "1124",
    name: "Mennekes 32A 5P 400V Angled Panel Socket",
    series: "Panel Sockets",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 1250,
    gst: 18,
    mrp: 1650,
    desc: "20° angled panel-mounted socket for ergonomic cable insertion downward, preventing cable bend fatigue.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP44", "Angle: 20° downward insertion"]
  },
  {
    partNo: "1125",
    name: "Mennekes 32A 4P 400V Angled Panel Socket",
    series: "Panel Sockets",
    amps: "32A",
    poles: "4P (3P+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 1180,
    gst: 18,
    mrp: 1550,
    desc: "Angled receptacle for 3-phase motor connections without neutral requirement, robust Polyamide 6 construction.",
    specs: ["Current: 32A", "Poles: 4P (3P+E)", "Voltage: 400V (6h)", "Protection: IP44", "Flange size: 85 x 85 mm"]
  },
  {
    partNo: "1144",
    name: "Mennekes 63A 5P 400V IP67 Angled Panel Socket",
    series: "Panel Sockets",
    amps: "63A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 3900,
    gst: 18,
    mrp: 5100,
    desc: "Heavy duty watertight panel socket with hinged cover and bayonet lock for high power industrial installations.",
    specs: ["Current: 63A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP67 Watertight", "Contacts: X-CONTACT technology"]
  },
  {
    partNo: "3455",
    name: "Mennekes 125A 5P 400V IP67 Panel Socket",
    series: "Panel Sockets",
    amps: "125A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 8900,
    gst: 18,
    mrp: 11500,
    desc: "Maximum capacity CEE panel socket for heavy port machinery, generators, and large automated facilities.",
    specs: ["Current: 125A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP67 Watertight", "Contacts: Silver-plated X-CONTACT"]
  },

  // 3. AMAXX® Receptacle Combination Enclosures
  {
    partNo: "910001",
    name: "AMAXX® Compact Receptacle Unit (IP44)",
    series: "AMAXX",
    ipRating: "IP44",
    price: 5500,
    gst: 18,
    mrp: 7200,
    desc: "Compact pre-wired distribution unit in AMAPLAST housing with 1x CEE 16A 5P and 2x Schuko outlets.",
    specs: ["Outlets: 1x CEE 16A 5P 400V + 2x Schuko 16A 230V", "Enclosure: High grade AMAPLAST", "Protection: IP44", "Mounting: External fixing lugs"]
  },
  {
    partNo: "920005",
    name: "AMAXX® Receptacle Combination 2x16A + 2xSchuko",
    series: "AMAXX",
    ipRating: "IP44",
    price: 8800,
    gst: 18,
    mrp: 11400,
    desc: "Pre-wired industrial distributor equipped with MCB protection window and dual CEE 16A 5P outlets.",
    specs: ["Outlets: 2x CEE 16A 5P 400V + 2x Schuko 16A 230V", "Protection: IP44", "Window: Transparent hinged cover for MCBs", "Housing: AMAPLAST silicon-free"]
  },
  {
    partNo: "930006",
    name: "AMAXX® Combination 1x32A + 2x16A + 4xSchuko",
    series: "AMAXX",
    ipRating: "IP44",
    price: 14500,
    gst: 18,
    mrp: 18900,
    desc: "Versatile industrial power distribution center with integrated RCD and MCB breakers for plant floors.",
    specs: ["Outlets: 1x CEE 32A 5P + 2x CEE 16A 5P + 4x Schuko 16A", "Breakers: Integrated DIN-rail MCB/RCD breakers", "Protection: IP44", "Connection: Ready for connection"]
  },
  {
    partNo: "940008",
    name: "AMAXX® IP67 Watertight Combination Unit",
    series: "AMAXX",
    ipRating: "IP67",
    price: 24500,
    gst: 18,
    mrp: 31900,
    desc: "Watertight IP67 distribution box with 1x 63A 5P, 1x 32A 5P, and 2x 16A 5P for harsh washdown areas.",
    specs: ["Outlets: 1x CEE 63A + 1x CEE 32A + 2x CEE 16A", "Protection: IP67 Watertight", "Cable entry: M40 / M32 top & bottom knockouts", "Material: Chemical-resistant AMELAN option"]
  },
  {
    partNo: "950012",
    name: "AMAXX® Suspended Energy Distribution Unit",
    series: "AMAXX",
    ipRating: "IP44",
    price: 18500,
    gst: 18,
    mrp: 23900,
    desc: "Overhead ceiling-suspended workstation distribution unit with CEE, Schuko, and integrated compressed air outlet.",
    specs: ["Outlets: 2x CEE 16A 5P + 4x Schuko 16A + Compressed air feed", "Suspension: Chain and bracket ready", "Protection: IP44", "Application: Assembly lines and workshops"]
  },
  {
    partNo: "960015",
    name: "AMAXX® Heavy Duty Double-Tier Station",
    series: "AMAXX",
    ipRating: "IP67",
    price: 36000,
    gst: 18,
    mrp: 46900,
    desc: "Multi-tier high-capacity power station for heavy manufacturing, shipyards, and major automation plants.",
    specs: ["Capacity: Up to 125A total incomer", "Outlets: Multiple CEE 63A, 32A, 16A combinations", "Protection: IP67", "Certification: IEC 61439 compliant"]
  },

  // 4. DUO Interlocked Switched Sockets
  {
    partNo: "5106",
    name: "DUO Switched Interlocked Socket 16A 3P 230V IP67",
    series: "DUO",
    amps: "16A",
    poles: "3P (2P+E)",
    voltage: "230V",
    ipRating: "IP67",
    price: 4200,
    gst: 18,
    mrp: 5450,
    desc: "Mechanical interlock prevents insertion or withdrawal of plugs under live load. Lockable in OFF position.",
    specs: ["Current: 16A", "Poles: 3P (2P+E)", "Voltage: 230V", "Protection: IP67 Watertight", "Interlock: Mechanical dual-cam lock"]
  },
  {
    partNo: "5107",
    name: "DUO Switched Interlocked Socket 16A 5P 400V IP67",
    series: "DUO",
    amps: "16A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 4600,
    gst: 18,
    mrp: 5950,
    desc: "3-phase switched receptacle with mechanical safety lock, ideal for washdown food processing and chemical plants.",
    specs: ["Current: 16A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Switch: 3-pole load-break switch"]
  },
  {
    partNo: "5788",
    name: "DUO Switched Interlocked Socket 32A 4P 400V IP67",
    series: "DUO",
    amps: "32A",
    poles: "4P (3P+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 5800,
    gst: 18,
    mrp: 7500,
    desc: "32A 4-pole interlocked switched socket for motor circuits, lockable rotary actuator with padlock facility.",
    specs: ["Current: 32A", "Poles: 4P (3P+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Padlockable: Up to 3 padlocks in 0-position"]
  },
  {
    partNo: "5789",
    name: "DUO Switched Interlocked Socket 32A 5P 400V IP67",
    series: "DUO",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 6400,
    gst: 18,
    mrp: 8300,
    desc: "Heavy duty 32A 5-pin watertight switched socket with full mechanical interlock mechanism.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Switch rating: AC-3 motor switching capacity"]
  },
  {
    partNo: "5690",
    name: "DUO Switched Interlocked Socket 63A 5P 400V IP67",
    series: "DUO",
    amps: "63A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 13500,
    gst: 18,
    mrp: 17500,
    desc: "High capacity 63A interlocked socket with X-CONTACT technology for maximum current reliability and operator safety.",
    specs: ["Current: 63A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Contacts: Highly heat resistant contact carrier"]
  },
  {
    partNo: "5904",
    name: "DUO Switched Interlocked Socket 125A 5P 400V IP67",
    series: "DUO",
    amps: "125A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 28500,
    gst: 18,
    mrp: 36900,
    desc: "Ultra heavy-duty 125A switched interlocked receptacle for port installations, steel works, and heavy shore power feeds.",
    specs: ["Current: 125A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Load switch: Integrated heavy load disconnector"]
  },

  // 5. EverGUM® Solid Rubber Enclosures
  {
    partNo: "70015",
    name: "EverGUM® Compact Portable Block (4x Schuko)",
    series: "EverGUM",
    ipRating: "IP44",
    price: 4900,
    gst: 18,
    mrp: 6400,
    desc: "Unbreakable vulcanized solid rubber distributor block with 4 shock-proof socket outlets.",
    specs: ["Outlets: 4x Schuko 16A 230V", "Housing: Solid vulcanized rubber (butyl)", "Protection: IP44", "Impact resistance: IK10 maximum mechanical resistance"]
  },
  {
    partNo: "70001",
    name: "EverGUM® Portable Distributor 1x32A + 2x16A + 4xSchuko",
    series: "EverGUM",
    ipRating: "IP44",
    price: 13500,
    gst: 18,
    mrp: 17500,
    desc: "Portable solid rubber distribution box with carrying handle, high resistance to acids, oils, and physical crushing.",
    specs: ["Outlets: 1x CEE 32A 5P + 2x CEE 16A 5P + 4x Schuko", "Housing: Solid black rubber", "Protection: IP44", "Carrying handle: Ergonomic recessed grip"]
  },
  {
    partNo: "70004",
    name: "EverGUM® Wall Mounted Rubber Distributor",
    series: "EverGUM",
    ipRating: "IP44",
    price: 19500,
    gst: 18,
    mrp: 25500,
    desc: "Wall mounted heavy rubber distribution enclosure with internal DIN rail for MCBs and RCDs.",
    specs: ["Outlets: 1x CEE 63A 5P + 2x CEE 32A 5P", "Housing: Solid synthetic rubber", "Protection: IP44", "Resistant to: UV, grease, fuels, and chemical cleaners"]
  },
  {
    partNo: "70010",
    name: "EverGUM® Heavy Duty Construction Box (IP54)",
    series: "EverGUM",
    ipRating: "IP54",
    price: 24500,
    gst: 18,
    mrp: 31900,
    desc: "Reinforced vulcanized rubber distributor with hinged inspection window and integrated earth-leakage relay.",
    specs: ["Outlets: 2x CEE 32A 5P + 4x CEE 16A 5P", "Housing: Solid rubber stackable design", "Protection: IP54", "Crash-proof: High drop and vehicle run-over tolerance"]
  },
  {
    partNo: "70020",
    name: "EverGUM® Shipyard & Marine Distribution Station",
    series: "EverGUM",
    ipRating: "IP67",
    price: 38000,
    gst: 18,
    mrp: 49500,
    desc: "Watertight rubber distribution hub engineered for offshore, dockyards, container terminals, and tunnel construction.",
    specs: ["Outlets: 1x CEE 63A 5P + 1x CEE 32A 5P + 2x CEE 16A 3P", "Protection: IP67 Watertight", "Salt-mist tested: Conforms to extreme marine standards", "Material: Non-conductive solid rubber"]
  },
  {
    partNo: "70025",
    name: "EverGUM® Mobile Trolley Power Station 125A",
    series: "EverGUM",
    ipRating: "IP54",
    price: 68000,
    gst: 18,
    mrp: 88500,
    desc: "Mobile solid rubber wheeled power station with steel crash frame for large infrastructure and turn-around projects.",
    specs: ["Incomer: 125A CEE Inlet", "Outlets: Multi-voltage CEE outlets with individual RCD/MCB", "Frame: Hot-dip galvanized tubular frame with wheels", "Protection: IP54"]
  },

  // 6. Phase Inverters & Motor Sockets
  {
    partNo: "3578",
    name: "Mennekes 16A 4P 400V Phase Inverter Plug",
    series: "Phase Inverters",
    amps: "16A",
    poles: "4P (3P+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 1450,
    gst: 18,
    mrp: 1900,
    desc: "Enables fast 180° rotation of two phase pins using a screwdriver to reverse 3-phase motor rotation instantly.",
    specs: ["Current: 16A", "Poles: 4P (3P+E)", "Voltage: 400V (6h)", "Protection: IP44", "Operation: Screwdriver twist mechanism for phase swap"]
  },
  {
    partNo: "3579",
    name: "Mennekes 16A 5P 400V Phase Inverter Plug",
    series: "Phase Inverters",
    amps: "16A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 1650,
    gst: 18,
    mrp: 2150,
    desc: "5-pole phase inverter CEE plug for portable pumps, mixers, fans, and compressors requiring quick direction switching.",
    specs: ["Current: 16A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP44", "Feature: Quick phase reversal without opening wiring"]
  },
  {
    partNo: "3584",
    name: "Mennekes 32A 4P 400V Phase Inverter Plug",
    series: "Phase Inverters",
    amps: "32A",
    poles: "4P (3P+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 2100,
    gst: 18,
    mrp: 2750,
    desc: "32A 4-pin phase inverter plug with heavy duty screw terminals and highly heat resistant contact carrier.",
    specs: ["Current: 32A", "Poles: 4P (3P+E)", "Voltage: 400V (6h)", "Protection: IP44", "Housing: Polyamide 6 high impact"]
  },
  {
    partNo: "3585",
    name: "Mennekes 32A 5P 400V Phase Inverter Plug",
    series: "Phase Inverters",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 2350,
    gst: 18,
    mrp: 3050,
    desc: "32A 5-pin heavy duty phase inverter plug with ergonomic grip, prevents phase rotation rewiring errors on site.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V (6h)", "Protection: IP44", "Contacts: Nickel-plated brass pins"]
  },
  {
    partNo: "3980",
    name: "Mennekes 16A 5P 400V Phase Inverter Appliance Inlet",
    series: "Phase Inverters",
    amps: "16A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP44",
    price: 1850,
    gst: 18,
    mrp: 2400,
    desc: "Panel-mounted appliance inlet with built-in rotary phase inverter mechanism for direct machine chassis mounting.",
    specs: ["Current: 16A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP44", "Mounting: Flange mounted appliance inlet"]
  },
  {
    partNo: "3982",
    name: "Mennekes 32A 5P 400V IP67 Phase Inverter Inlet",
    series: "Phase Inverters",
    amps: "32A",
    poles: "5P (3P+N+E)",
    voltage: "400V",
    ipRating: "IP67",
    price: 3450,
    gst: 18,
    mrp: 4500,
    desc: "Watertight IP67 phase inverter appliance inlet with threaded locking ring for harsh outdoor construction machines.",
    specs: ["Current: 32A", "Poles: 5P (3P+N+E)", "Voltage: 400V", "Protection: IP67 Watertight", "Threaded ring: Bayonet locking mechanism"]
  }
];

