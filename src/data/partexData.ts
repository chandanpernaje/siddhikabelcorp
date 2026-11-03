export interface PartexProduct {
  partNo: string;
  name: string;
  series: string; // e.g. "PA", "ProMark", "PO", "PC", "PKS", "Cable Ties"
  price: number;
  gst: number;
  mrp: number;
  desc: string;
  specs: string[];
}

export const PARTEX_PRODUCTS: PartexProduct[] = [
  // 1. PA Closed Chevron Wire Markers
  {
    partNo: "PA-02-KIT",
    name: "PA-02 Closed Chevron Wire Markers (0.5 - 1.5 mm²)",
    series: "PA",
    price: 650,
    gst: 18,
    mrp: 850,
    desc: "Interlocking chevron cut ensures markers stay firmly locked and aligned in line. Self-extinguishing PVC to UL94-V0.",
    specs: ["Wire diameter: 1.3 - 3.0 mm (0.5 - 1.5 mm²)", "Material: Cadmium & silicon-free flexible PVC", "Flame resistance: UL94-V0 self-extinguishing", "Packaging: Reel of 1000 markers", "Shape: Interlocking chevron profile"]
  },
  {
    partNo: "PA-1-KIT",
    name: "PA-1 Closed Chevron Wire Markers (1.5 - 4.0 mm²)",
    series: "PA",
    price: 850,
    gst: 18,
    mrp: 1100,
    desc: "Interlocking closed wire marker for control cabinet wiring and standard terminal connections.",
    specs: ["Wire diameter: 2.5 - 5.0 mm (1.5 - 4.0 mm²)", "Material: Cadmium & silicon-free flexible PVC", "Flame resistance: UL94-V0", "Packaging: Reel of 1000 markers", "Temperature: -30°C to +60°C"]
  },
  {
    partNo: "PA-2-KIT",
    name: "PA-2 Closed Chevron Wire Markers (2.5 - 16.0 mm²)",
    series: "PA",
    price: 950,
    gst: 18,
    mrp: 1250,
    desc: "Larger chevron marker for heavy feeder wires, motor connections, and power distribution terminals.",
    specs: ["Wire diameter: 4.0 - 10.0 mm (2.5 - 16.0 mm²)", "Material: UL94-V0 self-extinguishing PVC", "Packaging: Box of 500 markers", "Print: Hot stamped deep print legend", "Locking: Chevron interlock prevents twist"]
  },
  {
    partNo: "PA-02-LETTERS",
    name: "PA-02 Chevron Letter Markers (A-Z Assortment)",
    series: "PA",
    price: 1250,
    gst: 18,
    mrp: 1650,
    desc: "Complete alphabetical character assortment of PA-02 chevron wire sleeves for intricate panel control schematics.",
    specs: ["Wire range: 0.5 - 1.5 mm²", "Characters: A to Z complete uppercase assortment", "Colour: Yellow with black lettering / White option", "Quantity: 2600 markers total"]
  },
  {
    partNo: "PA-02-SYMBOLS",
    name: "PA-02 Electrical Symbol Markers (+, -, ~, Earth)",
    series: "PA",
    price: 750,
    gst: 18,
    mrp: 980,
    desc: "Pre-printed electrical symbol markers for DC polarity, AC live, neutral, and protective earth wiring.",
    specs: ["Symbols: +, -, ~, Ground/Earth, /", "Wire range: 0.5 - 1.5 mm²", "Material: Flexible PVC UL94-V0", "Quantity: 1000 markers per pack"]
  },
  {
    partNo: "PAD-1-CASSETTE",
    name: "PAD-1 Marker Dispenser & Applicator Wand Kit",
    series: "PA",
    price: 1850,
    gst: 18,
    mrp: 2450,
    desc: "Ergonomic applicator wand and desktop cassette holder for high speed marker insertion onto stripped wire ends.",
    specs: ["Compatibility: PA-02, PA-1, PA-2 markers", "Includes: Teflon-coated applicator wand + 10-bay carousel", "Speed increase: Reduces wire marking time by up to 60%", "Build: Heavy duty Swedish workshop design"]
  },

  // 2. ProMark T-1000 Thermal Transfer Printer
  {
    partNo: "T-1000-KIT",
    name: "ProMark T-1000 High-Speed Marking Printer Kit",
    series: "ProMark",
    price: 48500,
    gst: 18,
    mrp: 62000,
    desc: "Compact high-speed marking printer for profiles, heat shrink tubing, and continuous label tapes. 40mm/sec print speed.",
    specs: ["Print speed: Up to 40 mm/sec", "Resolution: 300 dpi thermal transfer", "Media: PO/POZ profiles, PHZ heat shrink, PLT labels", "Interface: USB 2.0 + Bluetooth with ProMark Creator software", "Kit includes: AC adapter, USB cable, ribbon, carrying case"]
  },
  {
    partNo: "T-1000-RB-BK",
    name: "ProMark Black Thermal Transfer Ribbon (100m)",
    series: "ProMark",
    price: 1450,
    gst: 18,
    mrp: 1900,
    desc: "High-density resin thermal transfer ribbon cassette for extreme scratch, UV, and solvent resistance.",
    specs: ["Length: 100 meters", "Colour: Black resin", "Compatibility: ProMark T-1000, T-800 series", "Resistance: Oil, solvent, water, and scratch resistant"]
  },
  {
    partNo: "T-1000-RB-WH",
    name: "ProMark White Thermal Transfer Ribbon (85m)",
    series: "ProMark",
    price: 1650,
    gst: 18,
    mrp: 2150,
    desc: "Crisp opaque white thermal transfer ribbon for dark profiles and black heat-shrink tubing.",
    specs: ["Length: 85 meters", "Colour: Opaque white resin", "Compatibility: ProMark T-1000", "Adhesion: High bond onto polyolefin and PVC"]
  },
  {
    partNo: "T-1000-PO-PROFILE",
    name: "Continuous Oval Profile Reel PO-068 (100m)",
    series: "ProMark",
    price: 2600,
    gst: 18,
    mrp: 3400,
    desc: "Profile reel for continuous high-speed automated thermal printing and half-cutting in ProMark printer.",
    specs: ["Core size: 1.5 - 2.5 mm² (outer dia 2.8 - 3.8 mm)", "Profile: Pre-coiled oval PVC profile", "Length: 100 meters reel", "Colour: High-visibility yellow"]
  },
  {
    partNo: "T-1000-PHZ-TUBING",
    name: "ProMark PHZ Heat Shrink Tubing 3.2mm (Halogen-Free)",
    series: "ProMark",
    price: 3800,
    gst: 18,
    mrp: 4900,
    desc: "Flame retardant, 2:1 shrink ratio, halogen-free polyolefin heat-shrink continuous tubing for electrical cabinets.",
    specs: ["Initial diameter: 3.2 mm / Shrunk diameter: 1.6 mm", "Shrink ratio: 2:1", "Standards: Halogen-free, EN 45545-2 railway compliant", "Length: 100 meters continuous reel"]
  },
  {
    partNo: "T-1000-CLEAN",
    name: "ProMark Printhead Cleaning Kit & Replacement Cutter",
    series: "ProMark",
    price: 1950,
    gst: 18,
    mrp: 2600,
    desc: "Replacement tungsten carbide half-cutting blade and isopropyl printhead cleaning pen for sharp print quality.",
    specs: ["Contents: 1x Carbide rotary cutter + 3x Cleaning pens", "Lifespan: 150,000 clean cuts per blade", "Maintenance: Recommended every 10 ribbon reels"]
  },

  // 3. PO & POZ Oval Marker Sleeves
  {
    partNo: "PO-01",
    name: "PO Oval Profile PVC Marker Sleeves (0.5 - 1.5 mm²)",
    series: "PO",
    price: 1850,
    gst: 18,
    mrp: 2400,
    desc: "Flexible oval profile designed to conform smoothly over individual wire cores and stay firmly in position.",
    specs: ["Wire diameter: 1.3 - 2.8 mm (0.5 - 1.5 mm²)", "Material: Special soft grade PVC", "Package: Continuous spool 100 meters", "Colour: Yellow / White", "Operating temp: -30°C to +60°C"]
  },
  {
    partNo: "PO-02",
    name: "PO Oval Profile PVC Marker Sleeves (1.5 - 4.0 mm²)",
    series: "PO",
    price: 2150,
    gst: 18,
    mrp: 2800,
    desc: "Intermediate oval profile sleeve for standard panel power conductors and sensor cables.",
    specs: ["Wire diameter: 2.8 - 4.8 mm (1.5 - 4.0 mm²)", "Material: Soft-grade self-extinguishing PVC", "Package: 100m spool", "Memory: Spring-back action grips wire firmly"]
  },
  {
    partNo: "PO-03",
    name: "PO Oval Profile PVC Marker Sleeves (4.0 - 10.0 mm²)",
    series: "PO",
    price: 2450,
    gst: 18,
    mrp: 3200,
    desc: "Heavy wire oval profile sleeve for mains distribution connections and motor feeder terminals.",
    specs: ["Wire diameter: 4.8 - 7.5 mm (4.0 - 10.0 mm²)", "Material: Flexible PVC", "Package: 50m spool", "Resistant to: Lubricants, chemicals, and aging"]
  },
  {
    partNo: "POZ-01",
    name: "POZ Zero-Halogen Oval Profile Sleeves (0.5 - 1.5 mm²)",
    series: "PO",
    price: 2950,
    gst: 18,
    mrp: 3900,
    desc: "ZEROHEX halogen-free oval profile sleeves engineered for public transit, rail, airports, and tunnel projects.",
    specs: ["Wire range: 0.5 - 1.5 mm²", "Material: Halogen-free ZEROHEX polyolefin", "Standards: Low smoke zero halogen (LSZH), EN 45545-2", "Package: 100m spool", "Colour: White / Yellow"]
  },
  {
    partNo: "POZ-02",
    name: "POZ Zero-Halogen Oval Profile Sleeves (1.5 - 4.0 mm²)",
    series: "PO",
    price: 3450,
    gst: 18,
    mrp: 4500,
    desc: "Halogen-free oval profile sleeves for demanding safety-critical electrical distribution panels.",
    specs: ["Wire range: 1.5 - 4.0 mm²", "Material: LSZH polymer", "Toxicity: Conforms to zero-halogen international maritime specs", "Package: 100m spool"]
  },
  {
    partNo: "PO-HOLDER",
    name: "PK2 Transparent Snap-On Sleeve Carrier",
    series: "PO",
    price: 850,
    gst: 18,
    mrp: 1150,
    desc: "Transparent PVC carrier with cable tie slots, holds printed PO profile tags securely onto large cable bundles.",
    specs: ["Tag length: 40 mm", "Fixing: 2x Cable tie slots for up to 4.8mm wide ties", "Material: Clear impact PVC", "Packaging: Pack of 100 holders"]
  },

  // 4. PC Open-End Snap-On Wire Markers
  {
    partNo: "PC-10-KIT",
    name: "PC-10 Open Snap-On Wire Markers (1.2 - 2.0 mm OD)",
    series: "PC",
    price: 750,
    gst: 18,
    mrp: 990,
    desc: "Fast clip-on installation onto terminated wires and cables without disconnecting the terminal connections.",
    specs: ["Cable OD: 1.2 - 2.0 mm (0.4 - 1.0 mm²)", "Design: Open interlocking clip", "Material: Rigid self-extinguishing PVC", "Packaging: 200 markers per box", "Grip: Locking chevrons ensure alignment"]
  },
  {
    partNo: "PC-20-KIT",
    name: "PC-20 Open Snap-On Wire Markers (2.4 - 3.0 mm OD)",
    series: "PC",
    price: 820,
    gst: 18,
    mrp: 1080,
    desc: "Snap-on retro-fit markers for standard 1.5 mm² control cables, fast post-termination labeling.",
    specs: ["Cable OD: 2.4 - 3.0 mm (1.5 mm²)", "Action: Side-entry clip-on without wire removal", "Print: Hot-foil deep impression print", "Packaging: 200 markers per box"]
  },
  {
    partNo: "PC-30-KIT",
    name: "PC-30 Open Snap-On Wire Markers (3.0 - 4.0 mm OD)",
    series: "PC",
    price: 890,
    gst: 18,
    mrp: 1180,
    desc: "Snap-on markers for 2.5 mm² industrial power conductors and auxiliary contact wiring.",
    specs: ["Cable OD: 3.0 - 4.0 mm (2.5 mm²)", "Material: UL94-V0 PVC", "Design: Compact profile fits high-density terminal blocks", "Packaging: 200 markers per box"]
  },
  {
    partNo: "PC-40-KIT",
    name: "PC-40 Open Snap-On Wire Markers (4.0 - 5.0 mm OD)",
    series: "PC",
    price: 950,
    gst: 18,
    mrp: 1250,
    desc: "Snap-on markers for 4.0 - 6.0 mm² incoming power feeds, firmly grips without slippage.",
    specs: ["Cable OD: 4.0 - 5.0 mm (4.0 - 6.0 mm²)", "Retention: Dual-flange locking tabs", "Operating temp: -30°C to +60°C", "Packaging: 200 markers per box"]
  },
  {
    partNo: "PC-WAND",
    name: "PC Mounting Applicator Wand for Rapid Clip-On",
    series: "PC",
    price: 450,
    gst: 18,
    mrp: 600,
    desc: "Ergonomic handheld wand pre-loaded with PC markers, snaps labels onto wires in a fraction of a second.",
    specs: ["Applicator: Holds up to 20 markers in sequence", "Compatibility: PC-10, PC-20, PC-30, PC-40", "Speed: One-click snap transfer onto wire"]
  },
  {
    partNo: "PC-NUM-0-9",
    name: "PC Color-Coded Resistor Code Strips (0 to 9)",
    series: "PC",
    price: 980,
    gst: 18,
    mrp: 1300,
    desc: "International resistor colour coded snap-on numerical strips for fast visual verification across panels.",
    specs: ["Colour coding: International resistor code 0-9", "Markers: 10 strips of each digit 0 through 9", "Quantity: 250 markers total", "Material: Chemical resistant rigid PVC"]
  },

  // 5. PKS Stainless Steel Embossed Markers
  {
    partNo: "PKS-10-SS",
    name: "PKS AISI 316 Stainless Steel Carrier Strip (10 Char)",
    series: "PKS",
    price: 1850,
    gst: 18,
    mrp: 2400,
    desc: "Acid-proof AISI 316 stainless steel cable identification carrier for aggressive offshore, chemical, and nuclear environments.",
    specs: ["Material: Acid-proof AISI 316 (1.4404) Stainless Steel", "Capacity: 10 individual PKS characters", "Fixing: Slots for up to 10mm wide stainless steel cable ties", "Packaging: Pack of 50 strips"]
  },
  {
    partNo: "PKS-20-SS",
    name: "PKS AISI 316 Stainless Steel Carrier Strip (20 Char)",
    series: "PKS",
    price: 2450,
    gst: 18,
    mrp: 3200,
    desc: "Extended 20-character AISI 316 carrier strip for detailed KKS equipment tagging and pipeline identification.",
    specs: ["Material: Acid-proof AISI 316 Stainless Steel", "Capacity: 20 characters", "Temperature: -80°C to +500°C extreme thermal tolerance", "Packaging: Pack of 50 strips"]
  },
  {
    partNo: "PKS-DIGITS-KIT",
    name: "PKS Stainless Steel Embossed Digits (0 to 9)",
    series: "PKS",
    price: 3200,
    gst: 18,
    mrp: 4200,
    desc: "Pre-embossed AISI 316 individual numerical characters, slide into carrier strips with locking retention tabs.",
    specs: ["Characters: 0 through 9 (Pack of 100 per digit)", "Material: Acid-proof AISI 316", "Profile: Raised embossed relief, legible even when painted over"]
  },
  {
    partNo: "PKS-ALPHA-KIT",
    name: "PKS Stainless Steel Embossed Letters (A to Z)",
    series: "PKS",
    price: 4600,
    gst: 18,
    mrp: 5900,
    desc: "Pre-embossed uppercase alphabetical characters for full tag identification in refinery and marine setups.",
    specs: ["Characters: A through Z complete kit", "Material: Acid-proof AISI 316", "Corrosion test: ASTM B117 salt spray > 1000 hours certified"]
  },
  {
    partNo: "PKS-CABLE-TAG",
    name: "Custom Embossed Stainless Steel Cable Tag (AISI 316)",
    series: "PKS",
    price: 350,
    gst: 18,
    mrp: 480,
    desc: "One-piece customized engraved/embossed stainless steel identification tag, pre-made to custom client schedule.",
    specs: ["Dimensions: 89 mm x 19 mm", "Material: Grade 316 Stainless Steel, 0.75mm thick", "Fixing: Dual end slots for heavy-duty metal ties", "Service: Permanent indent custom tag creation"]
  },
  {
    partNo: "PKS-TIE-TOOL",
    name: "Heavy Duty Stainless Steel Tie Tensioner & Cutter Tool",
    series: "PKS",
    price: 8500,
    gst: 18,
    mrp: 11000,
    desc: "Ergonomic ratchet tool for tightening and flush-cutting stainless steel cable ties without sharp burrs.",
    specs: ["Tie width capacity: Up to 12.0 mm wide ties", "Action: Adjustable tension preset + automatic cut-off", "Construction: Cast aluminum body with hardened steel jaws"]
  },

  // 6. Heavy Duty Cable Ties & Mounts
  {
    partNo: "CT-100-2.5",
    name: "Polyamide 6.6 UV-Resistant Cable Ties 100mm x 2.5mm",
    series: "Cable Ties",
    price: 180,
    gst: 18,
    mrp: 250,
    desc: "Virgin Polyamide 6.6 cable ties with rounded interior edges to prevent wire insulation damage. UV stabilized.",
    specs: ["Length: 100 mm / Width: 2.5 mm", "Tensile strength: 8.2 kg (80 N)", "Bundle diameter: Up to 22 mm", "Material: Polyamide 6.6 UV resistant black", "Packaging: Pack of 100"]
  },
  {
    partNo: "CT-200-4.8",
    name: "Polyamide 6.6 UV-Resistant Cable Ties 200mm x 4.8mm",
    series: "Cable Ties",
    price: 360,
    gst: 18,
    mrp: 480,
    desc: "Standard heavy duty panel building cable ties for wire harnesses, cable trays, and trunking routing.",
    specs: ["Length: 200 mm / Width: 4.8 mm", "Tensile strength: 22.2 kg (220 N)", "Bundle diameter: Up to 50 mm", "Standards: UL94-V2 flammability rated", "Packaging: Pack of 100"]
  },
  {
    partNo: "CT-300-4.8",
    name: "Polyamide 6.6 UV-Resistant Cable Ties 300mm x 4.8mm",
    series: "Cable Ties",
    price: 490,
    gst: 18,
    mrp: 650,
    desc: "Long heavy-duty cable ties for securing power feeder cables onto heavy perforated trays.",
    specs: ["Length: 300 mm / Width: 4.8 mm", "Tensile strength: 22.2 kg (220 N)", "Bundle diameter: Up to 80 mm", "Packaging: Pack of 100"]
  },
  {
    partNo: "CT-370-7.6",
    name: "Extra Heavy Duty Polyamide Cable Ties 370mm x 7.6mm",
    series: "Cable Ties",
    price: 850,
    gst: 18,
    mrp: 1100,
    desc: "High tensile cable ties for heavy multi-core armoured cables and industrial conduit mounting.",
    specs: ["Length: 370 mm / Width: 7.6 mm", "Tensile strength: 55.0 kg (540 N)", "Bundle diameter: Up to 105 mm", "Packaging: Pack of 100"]
  },
  {
    partNo: "SS-CT-200",
    name: "AISI 316 Stainless Steel Ball-Lock Ties 200mm x 4.6mm",
    series: "Cable Ties",
    price: 1850,
    gst: 18,
    mrp: 2450,
    desc: "Non-releasable roller ball locking mechanism for extreme fire safety, chemical exposure, and offshore rigs.",
    specs: ["Length: 200 mm / Width: 4.6 mm", "Material: Grade 316 Marine Stainless Steel", "Tensile strength: 68.0 kg (670 N)", "Fire rating: Non-burning A1 fire class", "Packaging: Pack of 100"]
  },
  {
    partNo: "MB-20-BASE",
    name: "4-Way Self-Adhesive Tie Mounting Bases 28mm x 28mm",
    series: "Cable Ties",
    price: 420,
    gst: 18,
    mrp: 580,
    desc: "High-tack acrylic adhesive mounting base with 4-way cable tie insertion slot and central screw hole.",
    specs: ["Size: 28 mm x 28 mm", "Tie entry: 4-way slot accepts up to 5.2mm wide ties", "Mounting: Heavy duty rubber adhesive + central screw hole", "Packaging: Pack of 100"]
  }
];
