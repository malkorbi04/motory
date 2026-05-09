export const MAKES = [
  "Toyota",
  "Nissan",
  "Lexus",
  "GMC",
  "Ford",
  "Chevrolet",
  "Mitsubishi",
  "Kia",
  "Hyundai",
  "BMW",
  "Mercedes",
  "Audi",
  "Jetour",
  "Other",
] as const;

export type Make = (typeof MAKES)[number];

export const MODEL_MAP: Record<string, string[]> = {
  Toyota: [
    "Camry",
    "Corolla",
    "Land Cruiser",
    "Prado",
    "Yaris",
    "Hilux",
    "RAV4",
    "Fortuner",
    "Avalon",
  ],
  Nissan: ["Patrol", "Altima", "Sentra", "X-Trail", "Navara", "Kicks", "Sunny"],
  Lexus: ["LX570", "GX460", "ES350", "RX350", "LS500", "IS300"],
  GMC: ["Yukon", "Sierra", "Canyon", "Terrain", "Acadia"],
  Ford: ["Explorer", "Expedition", "F-150", "Mustang", "Edge", "Bronco"],
  Chevrolet: ["Tahoe", "Silverado", "Traverse", "Malibu", "Camaro"],
  Mitsubishi: ["Pajero", "L200", "Eclipse Cross", "Outlander", "ASX"],
  Kia: ["Sportage", "Sorento", "Telluride", "Cerato", "Carnival"],
  Hyundai: ["Tucson", "Santa Fe", "Sonata", "Elantra", "Palisade"],
  BMW: ["X5", "X6", "X7", "3 Series", "5 Series", "7 Series", "M5"],
  Mercedes: ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "G-Class"],
  Audi: ["Q5", "Q7", "Q8", "A4", "A6", "A8"],
  Jetour: ["X70", "X95", "Dashing"],
  Other: [],
};

export const TRIM_MAP: Record<string, string[]> = {
  "Toyota|Land Cruiser": ["GXR", "VXR", "GX.R", "Sahara", "Sahara Edition"],
  "Toyota|Prado": ["TXL", "VXL", "GXL"],
  "Toyota|Camry": ["SE", "XSE", "XLE", "TRD"],
  "Toyota|Corolla": ["SE", "XSE", "XLE", "Hybrid"],
  "Toyota|Fortuner": ["SR5", "TRD"],
  "Toyota|Hilux": ["SR5", "TRD", "Rogue"],
  "Nissan|Patrol": ["SE", "LE", "Platinum", "SE Ti"],
  "Nissan|X-Trail": ["S", "SV", "SL", "Platinum"],
  "Lexus|LX570": ["Base", "Sport", "Black Vision", "Three-Row"],
  "Lexus|GX460": ["Base", "Luxury", "Sport"],
  "GMC|Yukon": ["SLE", "SLT", "AT4", "Denali"],
  "GMC|Sierra": ["SLE", "SLT", "AT4", "Denali"],
  "Ford|Explorer": ["Base", "XLT", "Timberline", "ST", "Platinum"],
  "Ford|F-150": ["XL", "XLT", "Lariat", "King Ranch", "Raptor", "Platinum"],
  "Chevrolet|Tahoe": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
  "Chevrolet|Silverado": ["WT", "Custom", "LT", "RST", "LTZ", "High Country"],
  "Mitsubishi|Pajero": ["GLX", "GLS", "Exceed"],
  "Kia|Sorento": ["LX", "S", "EX", "SX", "SX Prestige"],
  "BMW|X5": ["xDrive40i", "xDrive50i", "M50i", "xDrive45e"],
  "BMW|X7": ["xDrive40i", "xDrive50i", "M60i"],
  "BMW|5 Series": ["520i", "530i", "540i", "M550i"],
  "Mercedes|G-Class": ["G500", "G63 AMG"],
  "Mercedes|GLE": ["350", "450", "53 AMG", "63 AMG"],
  "Mercedes|S-Class": ["S500", "S580", "S63 AMG", "S680"],
  "Audi|Q7": ["Premium", "Premium Plus", "Prestige"],
  "Audi|Q8": ["Premium", "Premium Plus", "Prestige"],
};

export function getModels(make: string): string[] {
  return MODEL_MAP[make] ?? [];
}

export function getTrims(make: string, model: string): string[] {
  return TRIM_MAP[`${make}|${model}`] ?? [];
}
