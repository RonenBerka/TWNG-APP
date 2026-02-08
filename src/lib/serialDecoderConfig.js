/**
 * TWNG Serial Decoder Configuration
 * Centralized configuration constants for all brand serial decoders
 */

// ─── SUPPORTED BRANDS ──────────────────────────────────────────────────────

export const SUPPORTED_BRANDS = [
  'Fender',
  'Gibson',
  'PRS',
  'Martin',
  'Taylor',
  'Ibanez',
  'Epiphone',
  'Rickenbacker',
  'Gretsch',
  'Squier',
];

export const BRAND_HINTS = {
  Fender: {
    description: 'Fender Musical Instruments',
    formats: ['US##XXXXXX', 'MX##XXXXXX', 'JD##XXXXXX', 'CZ...', 'V######', 'E######', 'S######', 'N######', 'Z######'],
    example: 'US21034567',
  },
  Gibson: {
    description: 'Gibson Guitar Corporation',
    formats: ['YDDDYPPP', '8-digit modern', '9-digit 2014+', '5-6 digit vintage'],
    example: '92318970',
  },
  PRS: {
    description: 'Paul Reed Smith Guitars',
    formats: ['YYNNNNN', '1-2 digit year + 5 production'],
    example: '21094567',
  },
  Martin: {
    description: 'C.F. Martin & Company',
    formats: ['Sequential', 'Range-based estimation'],
    example: '1234567',
  },
  Taylor: {
    description: 'Taylor Guitars',
    formats: ['YYMMDDXXX', '9-11 digit date-based'],
    example: '20121234567',
  },
  Ibanez: {
    description: 'Ibanez / Hoshino Gakki',
    formats: ['FYYMXXX', 'Country-prefixed', 'Various factories'],
    example: 'F9504XXX',
  },
  Epiphone: {
    description: 'Epiphone (Gibson subsidiary)',
    formats: ['FYYMRRRR', 'Factory code + date'],
    example: 'S21101234',
  },
  Rickenbacker: {
    description: 'Rickenbacker International Corp.',
    formats: ['YYMMXXXX', '2-digit year/month'],
    example: '210112345',
  },
  Gretsch: {
    description: 'Gretsch Guitars (Fender-era)',
    formats: ['JTYYMXXX', 'KSYYMMXXX', 'Factory prefixes'],
    example: 'JT210512345',
  },
  Squier: {
    description: 'Squier / Fender budget line',
    formats: ['SE######', 'IC/ICS/IS', 'CGS/CY', 'Country codes'],
    example: 'SE210567890',
  },
};

// ─── FACTORY MAPPINGS ──────────────────────────────────────────────────────

export const FACTORIES = {
  fender: {
    'US': 'Corona, California',
    'MX': 'Ensenada, Mexico',
    'JD': 'Japan (Dyna Gakki)',
    'JV': 'Japan (Fujigen)',
    'CN': 'China',
    'CZ': 'Custom Shop (USA/Czech)',
  },
  gibson: {
    '1-4': 'Nashville, Tennessee',
    '5-9': 'Memphis, Tennessee (closed 2019)',
    '001-499': 'Nashville, Tennessee',
    '500-999': 'Memphis, Tennessee',
    'JD': 'Japan (Dyna Gakki)',
    'USA': 'Nashville, Tennessee',
    'EC': 'USA East Coast',
  },
  prs: {
    'Default': 'Stevensville, Maryland (USA)',
    'SE': 'Indonesia / South Korea',
  },
  martin: {
    'Default': 'Nazareth, Pennsylvania (USA)',
  },
  taylor: {
    'Default': 'El Cajon, California (USA)',
    '100': 'Tecate, Mexico',
  },
  ibanez: {
    'F': 'FujiGen, Japan',
    'C': 'CORT, South Korea',
    'S': 'Samick, South Korea',
    'W': 'Ibanez Indonesia',
    'I': 'Indonesia',
    'A': 'AcRE, South Korea',
  },
  epiphone: {
    'S': 'Samick Korea',
    'U': 'Unsung Korea',
    'I': 'Peerless, Indonesia',
    'C': 'China',
    'K': 'Korea (Samick)',
  },
  rickenbacker: {
    'Default': 'Santa Ana, California (USA)',
  },
  gretsch: {
    'JT': 'Terada, Japan (Fender era)',
    'KS': 'Samick, South Korea',
    'KF': 'Korea (Fender partnership)',
  },
};

// ─── YEAR MAPPINGS (Fender) ───────────────────────────────────────────────

export const FENDER_YEAR_PREFIXES = {
  'S': 1970,
  'E': 1980,
  'N': 1990,
  'Z': 2000,
  'V': 1982, // Vintage reissue
};

export const FENDER_SQUIER_FACTORIES = {
  'SE': 'South Korea / Indonesia',
  'IC': 'Indonesia (Cort)',
  'ICS': 'Indonesia (Cort)',
  'IS': 'Indonesia (Sulit)',
  'CGS': 'China (Guang Zhou)',
  'CY': 'South Korea',
  'AV': 'Vietnam',
};

// ─── GIBSON YEAR MAPPINGS ─────────────────────────────────────────────────

export const GIBSON_VINTAGE_SERIALS = [
  { min: 100, max: 42440, yearMin: 1952, yearMax: 1961 },
  { min: 42441, max: 85679, yearMin: 1961, yearMax: 1970 },
  { min: 100000, max: 99999, yearMin: 1974, yearMax: 1975 },
  { min: 1000, max: 9999, yearMin: 1975, yearMax: 1980 },
];

// ─── MARTIN SERIAL RANGES ─────────────────────────────────────────────────

export const MARTIN_RANGES = [
  { min: 8349, max: 10120, year: 1920 },
  { min: 20000, max: 50000, year: 1930 },
  { min: 50000, max: 100000, year: 1945 },
  { min: 100000, max: 200000, year: 1950 },
  { min: 200000, max: 300000, year: 1960 },
  { min: 300000, max: 400000, year: 1972 },
  { min: 400000, max: 500000, year: 1980 },
  { min: 500000, max: 750000, year: 1990 },
  { min: 750000, max: 1000000, year: 2000 },
  { min: 1000000, max: 1500000, year: 2008 },
  { min: 1500000, max: 2000000, year: 2014 },
];

// ─── MONTH NAMES (SHARED) ──────────────────────────────────────────────────

export const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
