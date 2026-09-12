import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGE = "/part-placeholder.svg";

const CATEGORIES: Array<{
  name: string;
  slug: string;
  icon: string;
  children: Array<{ name: string; slug: string }>;
}> = [
  {
    name: "سیستم ترمز", slug: "brake-system", icon: "disc",
    children: [
      { name: "لنت ترمز جلو", slug: "brake-pad-front" },
      { name: "لنت ترمز عقب", slug: "brake-pad-rear" },
      { name: "دیسک ترمز", slug: "brake-disc" },
      { name: "کاسه ترمز", slug: "brake-drum" },
      { name: "سیلندر ترمز", slug: "brake-cylinder" },
    ],
  },
  {
    name: "موتور و متعلقات", slug: "engine-parts", icon: "gauge",
    children: [
      { name: "واترپمپ", slug: "water-pump" },
      { name: "تسمه تایم", slug: "timing-belt" },
      { name: "تسمه دینام", slug: "alternator-belt" },
      { name: "واشر سرسیلندر", slug: "head-gasket" },
      { name: "دسته موتور", slug: "engine-mount" },
    ],
  },
  {
    name: "تعلیق و جلوبندی", slug: "suspension", icon: "wrench",
    children: [
      { name: "کمک‌فنر", slug: "shock-absorber" },
      { name: "طبق", slug: "control-arm" },
      { name: "سیبک", slug: "ball-joint" },
      { name: "بوش طبق", slug: "arm-bushing" },
      { name: "پلوس و گردگیر", slug: "axle-cv" },
      { name: "توپی چرخ", slug: "wheel-hub" },
    ],
  },
  {
    name: "برق و الکترونیک", slug: "electric", icon: "zap",
    children: [
      { name: "باتری", slug: "battery" },
      { name: "دینام", slug: "alternator" },
      { name: "استارت", slug: "starter" },
      { name: "شمع و وایر", slug: "spark-plug" },
      { name: "سنسورها", slug: "sensors" },
      { name: "کوئل", slug: "ignition-coil" },
    ],
  },
  {
    name: "خنک‌کننده", slug: "cooling", icon: "snowflake",
    children: [
      { name: "رادیاتور", slug: "radiator" },
      { name: "فن و پروانه", slug: "radiator-fan" },
      { name: "ترموستات", slug: "thermostat" },
    ],
  },
  {
    name: "فیلترها", slug: "filters", icon: "funnel",
    children: [
      { name: "فیلتر روغن", slug: "oil-filter" },
      { name: "فیلتر هوا", slug: "air-filter" },
      { name: "فیلتر کابین", slug: "cabin-filter" },
      { name: "فیلتر بنزین", slug: "fuel-filter" },
    ],
  },
  {
    name: "روغن و مایعات", slug: "oil-fluids", icon: "droplets",
    children: [
      { name: "روغن موتور", slug: "engine-oil" },
      { name: "روغن گیربکس", slug: "gearbox-oil" },
      { name: "ضدیخ و ضدجوش", slug: "antifreeze" },
      { name: "مایع ترمز", slug: "brake-fluid" },
    ],
  },
  {
    name: "سوخت‌رسان", slug: "fuel-system", icon: "fuel",
    children: [
      { name: "انژکتور", slug: "injector" },
      { name: "پمپ بنزین", slug: "fuel-pump" },
    ],
  },
  {
    name: "بدنه و چراغ", slug: "body-lights", icon: "lightbulb",
    children: [
      { name: "چراغ جلو", slug: "headlight" },
      { name: "چراغ عقب", slug: "taillight" },
      { name: "آینه جانبی", slug: "side-mirror" },
      { name: "دسته‌موتور و قفل", slug: "handles-locks" },
    ],
  },
  {
    name: "انتقال قدرت", slug: "transmission", icon: "cog",
    children: [
      { name: "دیسک و صفحه کلاچ", slug: "clutch-kit" },
      { name: "بلبرینگ", slug: "bearings" },
    ],
  },
];

const BRANDS = [
  { name: "بوش", slug: "bosch", country: "آلمان", isOriginal: true },
  { name: "والئو", slug: "valeo", country: "فرانسه", isOriginal: true },
  { name: "زاکس", slug: "sachs", country: "آلمان", isOriginal: true },
  { name: "کی‌وای‌بی KYB", slug: "kyb", country: "ژاپن", isOriginal: true },
  { name: "ان‌جی‌کی NGK", slug: "ngk", country: "ژاپن", isOriginal: true },
  { name: "مان", slug: "mann", country: "آلمان", isOriginal: true },
  { name: "ماهله", slug: "mahle", country: "آلمان", isOriginal: true },
  { name: "دنسو", slug: "denso", country: "ژاپن", isOriginal: true },
  { name: "فبی", slug: "febi", country: "آلمان", isOriginal: false },
  { name: "گیتس", slug: "gates", country: "بلژیک", isOriginal: false },
  { name: "اس‌کی‌اف SKF", slug: "skf", country: "سوئد", isOriginal: true },
  { name: "بهران", slug: "behran", country: "ایران", isOriginal: false },
  { name: "نفت پارس", slug: "naft-pars", country: "ایران", isOriginal: false },
  { name: "ساکو", slug: "sakoo", country: "ایران", isOriginal: false },
  { name: "کاویر", slug: "kavir", country: "ایران", isOriginal: false },
  { name: "ایساکو", slug: "isaco", country: "ایران", isOriginal: true },
  { name: "سایپا یدک", slug: "saipa-yadak", country: "ایران", isOriginal: true },
];

const VEHICLES: Array<{
  name: string;
  slug: string;
  models: Array<{
    name: string;
    slug: string;
    trims: Array<{ name: string; yearFrom: number; yearTo: number | null; engine?: string; fuel?: string; transmission?: string }>;
  }>;
}> = [
  {
    name: "ایران خودرو", slug: "ikco",
    models: [
      {
        name: "پژو ۲۰۶", slug: "peugeot-206",
        trims: [
          { name: "تیپ ۲", yearFrom: 1381, yearTo: 1392, engine: "TU1 1.4" },
          { name: "تیپ ۵", yearFrom: 1383, yearTo: 1392, engine: "TU5 1.6" },
          { name: "تیپ ۶", yearFrom: 1384, yearTo: 1392, engine: "TU3 1.6" },
          { name: "V8 اتوماتیک", yearFrom: 1386, yearTo: 1392, engine: "TU5 1.6", transmission: "اتوماتیک" },
        ],
      },
      {
        name: "پژو ۲۰۷i", slug: "peugeot-207i",
        trims: [
          { name: "دنده E2", yearFrom: 1385, yearTo: 1400, engine: "TU5 1.6" },
          { name: "اتوماتیک", yearFrom: 1385, yearTo: 1400, engine: "TU5 1.6", transmission: "اتوماتیک" },
          { name: "پنل سفید TU5", yearFrom: 1394, yearTo: 1400, engine: "TU5 1.6" },
        ],
      },
      {
        name: "پژو ۴۰۵", slug: "peugeot-405",
        trims: [
          { name: "GLX", yearFrom: 1374, yearTo: 1389, engine: "XU7 1.8" },
          { name: "SLX بنزینی", yearFrom: 1374, yearTo: 1389, engine: "XU7 1.8" },
          { name: "P", yearFrom: 1374, yearTo: 1389, engine: "XU7 1.8" },
        ],
      },
      {
        name: "پژو پارس", slug: "peugeot-pars",
        trims: [
          { name: "LX", yearFrom: 1375, yearTo: 1394, engine: "XU7 1.8" },
          { name: "TU5", yearFrom: 1386, yearTo: 1394, engine: "TU5 1.6" },
          { name: "ELX", yearFrom: 1390, yearTo: 1394, engine: "XU7 1.8" },
        ],
      },
      {
        name: "سمند", slug: "samand",
        trims: [
          { name: "LX", yearFrom: 1381, yearTo: 1399, engine: "XU7 1.8" },
          { name: "EF7", yearFrom: 1385, yearTo: 1399, engine: "EF7 1.7" },
          { name: "سرویس دوگانه‌سوز", yearFrom: 1385, yearTo: 1399, engine: "XU7 1.8", fuel: "دوگانه" },
        ],
      },
      {
        name: "دنا پلاس", slug: "dena-plus",
        trims: [
          { name: "دنا پلاس EF7", yearFrom: 1394, yearTo: null, engine: "EF7 1.7" },
          { name: "دنا پلاس توربو", yearFrom: 1398, yearTo: null, engine: "EC5 1.5 توربو" },
        ],
      },
      {
        name: "تارا", slug: "tara",
        trims: [
          { name: "تارا TU5", yearFrom: 1399, yearTo: null, engine: "TU5 1.6" },
          { name: "تارا EC5", yearFrom: 1400, yearTo: null, engine: "EC5 1.5" },
        ],
      },
      {
        name: "رانا پلاس", slug: "rana-plus",
        trims: [
          { name: "رانا پلاس", yearFrom: 1390, yearTo: null, engine: "TU5 1.6" },
          { name: "رانا پلاس S", yearFrom: 1398, yearTo: null, engine: "TU5 1.6" },
        ],
      },
    ],
  },
  {
    name: "سایپا", slug: "saipa",
    models: [
      {
        name: "پراید", slug: "pride",
        trims: [
          { name: "۱۳۱", yearFrom: 1385, yearTo: 1399, engine: "SOHC 1.3" },
          { name: "۱۳۲ صندوق‌دار", yearFrom: 1385, yearTo: 1399, engine: "SOHC 1.3" },
          { name: "۱۱۱ هاچبک", yearFrom: 1385, yearTo: 1399, engine: "SOHC 1.3" },
        ],
      },
      {
        name: "تیبا", slug: "tiba",
        trims: [
          { name: "تیبا ۱ (سدری)", yearFrom: 1387, yearTo: 1399, engine: "M13 1.5" },
          { name: "تیبا ۲ هاچبک", yearFrom: 1392, yearTo: 1399, engine: "M13 1.5" },
        ],
      },
      {
        name: "ساینا", slug: "saina",
        trims: [
          { name: "ساینا S", yearFrom: 1394, yearTo: null, engine: "M15 1.5" },
        ],
      },
      {
        name: "کوییک", slug: "quick",
        trims: [
          { name: "کوییک R", yearFrom: 1397, yearTo: null, engine: "M15 1.5" },
        ],
      },
      {
        name: "شاهین", slug: "shahin",
        trims: [
          { name: "شاهین", yearFrom: 1400, yearTo: null, engine: "M15 1.5" },
        ],
      },
    ],
  },
  {
    name: "کیا", slug: "kia",
    models: [
      {
        name: "سراتو", slug: "cerato",
        trims: [
          { name: "کوپه ۲.۰", yearFrom: 1385, yearTo: 1389, engine: "2.0" },
          { name: "صندوق‌دار ۲.۰", yearFrom: 1389, yearTo: 1394, engine: "2.0" },
          { name: "صندوق‌دار ۱.۶", yearFrom: 1394, yearTo: null, engine: "1.6" },
        ],
      },
      {
        name: "اپتیما", slug: "optima",
        trims: [
          { name: "اپتیما ۲.۴", yearFrom: 1390, yearTo: 1398, engine: "2.4" },
        ],
      },
      {
        name: "اسپورتیج", slug: "sportage",
        trims: [
          { name: "اسپورتیج ۲.۰", yearFrom: 1389, yearTo: 1399, engine: "2.0" },
        ],
      },
    ],
  },
  {
    name: "هیوندای", slug: "hyundai",
    models: [
      {
        name: "النترا", slug: "elantra",
        trims: [
          { name: "النترا ۱.۶", yearFrom: 1386, yearTo: 1395, engine: "1.6" },
          { name: "النترا ۲.۰", yearFrom: 1386, yearTo: 1395, engine: "2.0" },
        ],
      },
      {
        name: "توسان", slug: "tucson",
        trims: [
          { name: "توسان ۲.۰", yearFrom: 1386, yearTo: 1398, engine: "2.0" },
        ],
      },
    ],
  },
  {
    name: "چری", slug: "chery",
    models: [
      {
        name: "آریزو", slug: "arrizo",
        trims: [
          { name: "آریزو ۵", yearFrom: 1396, yearTo: null, engine: "1.5 توربو" },
          { name: "آریزو ۶", yearFrom: 1398, yearTo: null, engine: "1.5 توربو" },
        ],
      },
      {
        name: "تیگو", slug: "tiggo",
        trims: [
          { name: "تیگو ۵", yearFrom: 1395, yearTo: null, engine: "2.0" },
          { name: "تیگو ۷ پرو", yearFrom: 1400, yearTo: null, engine: "1.6 توربو" },
        ],
      },
    ],
  },
  {
    name: "ام‌وی‌ام", slug: "mvm",
    models: [
      {
        name: "X22", slug: "x22",
        trims: [{ name: "X22 1.5", yearFrom: 1394, yearTo: null, engine: "1.5 توربو" }],
      },
      {
        name: "X33", slug: "x33",
        trims: [{ name: "X33 2.0", yearFrom: 1390, yearTo: null, engine: "2.0" }],
      },
    ],
  },
  {
    name: "مزدا", slug: "mazda",
    models: [
      {
        name: "مزدا ۳", slug: "mazda-3",
        trims: [{ name: "مزدا ۳ ۱.۶", yearFrom: 1383, yearTo: 1393, engine: "1.6" }],
      },
    ],
  },
];

interface SeedProduct {
  slug: string;
  name: string;
  cat: string;
  brand: string;
  price: number;
  partnerPrice?: number;
  discountPrice?: number;
  partNumber: string;
  oemNumber?: string;
  technicalCode?: string;
  crossRefs?: string[];
  condition: "NEW" | "ORIGINAL" | "AFTERMARKET" | "STOCK" | "REFURBISHED";
  warrantyMonths: number;
  country: string;
  stock: number;
  shortDesc: string;
  specs: string;
  compat: Array<[string, string] | [string, string, string]>;
  flags?: { featured?: boolean; isNew?: boolean; best?: boolean; freeShip?: boolean };
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: "brake-pad-front-206-tu5", name: "لنت ترمز جلو پژو ۲۰۶ تیپ ۵ و V8", cat: "brake-pad-front", brand: "valeo",
    price: 1850000, partnerPrice: 1620000, discountPrice: 1690000, partNumber: "VL-206-TU5-BPF",
    oemNumber: "1610805280", crossRefs: ["BP-1037", "GDB1330"], condition: "ORIGINAL", warrantyMonths: 6, country: "فرانسه",
    stock: 24,
    shortDesc: "لنت ترمز جلو اورجینال والئو مخصوص پژو ۲۰۶ تیپ ۵، تیپ ۶ و V8 با راندمان ترمزگیری بالا و صدای کم.",
    specs: "جنس: نیمه‌فلزی\nتعداد در بسته: ۴ عدد (یک ست)\nمحل نصب: جلو\nوزن: ۱۴۵۰ گرم",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-206", "تیپ ۶"], ["ikco", "peugeot-206", "V8 اتوماتیک"], ["ikco", "peugeot-207i"]],
    flags: { featured: true, best: true },
  },
  {
    slug: "brake-pad-front-405-pars", name: "لنت ترمز جلو پژو ۴۰۵ / پارس / سمند", cat: "brake-pad-front", brand: "bosch",
    price: 2150000, partnerPrice: 1900000, partNumber: "BS-405-GLX-F",
    oemNumber: "9566437180", crossRefs: ["BP-2151"], condition: "ORIGINAL", warrantyMonths: 6, country: "آلمان",
    stock: 31,
    shortDesc: "لنت ترمز جلو بوش مناسب پژو ۴۰۵، پارس و سمند با موتور XU7 — کاهش غبار و عمر مفید بالا.",
    specs: "جنس: سرامیکی\nتعداد در بسته: ۴ عدد (یک ست)\nمحل نصب: جلو",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars"], ["ikco", "samand"], ["ikco", "peugeot-405", "P"]],
    flags: { best: true },
  },
  {
    slug: "brake-pad-front-pride", name: "لنت ترمز جلو پراید و تیبا", cat: "brake-pad-front", brand: "kavir",
    price: 640000, partnerPrice: 545000, partNumber: "KV-PRI-BPF",
    oemNumber: "T11-3501080", condition: "AFTERMARKET", warrantyMonths: 3, country: "ایران",
    stock: 58,
    shortDesc: "لنت ترمز جلو کاویر مخصوص پراید (131/132/111) و تیبا ۱ و ۲ — تولید ایران با کیفیت مناسب.",
    specs: "جنس: آلی\nتعداد در بسته: ۴ عدد (یک ست)\nمحل نصب: جلو",
    compat: [["saipa", "pride"], ["saipa", "tiba"]],
    flags: { best: true },
  },
  {
    slug: "brake-disc-206", name: "دیسک ترمز جلو پژو ۲۰۶ (جفت)", cat: "brake-disc", brand: "febi",
    price: 3950000, partnerPrice: 3550000, partNumber: "FB-206-BD",
    oemNumber: "4249V4", condition: "AFTERMARKET", warrantyMonths: 6, country: "آلمان",
    stock: 12,
    shortDesc: "دیسک ترمز جلوی ونابودشونده فبی مخصوص پژو ۲۰۶ تمام تیپ‌ها — قطر ۲۶۶ میلی‌متر.",
    specs: "قطر: ۲۶۶ میلی‌متر\nضخامت: ۲۲ میلی‌متر\nتعداد در بسته: ۲ عدد",
    compat: [["ikco", "peugeot-206"]],
  },
  {
    slug: "water-pump-405-xu7", name: "واترپمپ پژو ۴۰۵ / پارس XU7", cat: "water-pump", brand: "valeo",
    price: 2750000, partnerPrice: 2450000, partNumber: "VL-405-WP",
    oemNumber: "1201V3", condition: "ORIGINAL", warrantyMonths: 12, country: "فرانسه",
    stock: 9,
    shortDesc: "واترپمپ اورجینال والئو برای موتور XU7 پژو ۴۰۵، پارس و سمند LX — همراه با واشر آب‌بندی.",
    specs: "مناسب موتور: XU7 1.8\nجنس پره: فلز\nهمراه واشر: بله",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars", "LX"], ["ikco", "peugeot-pars", "ELX"], ["ikco", "samand", "LX"]],
    flags: { featured: true },
  },
  {
    slug: "water-pump-206-tu5", name: "واترپمپ پژو ۲۰۶ TU5", cat: "water-pump", brand: "sakoo",
    price: 1650000, partNumber: "SK-206-WP-TU5", condition: "AFTERMARKET", warrantyMonths: 6, country: "ایران",
    stock: 17,
    shortDesc: "واترپمپ ساکو مخصوص موتور TU5 پژو ۲۰۶ تیپ ۵، ۲۰۷ و رانا پلاس.",
    specs: "مناسب موتور: TU5 1.6\nجنس پره: فلز",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"], ["ikco", "peugeot-pars", "TU5"], ["ikco", "tara", "تارا TU5"]],
  },
  {
    slug: "timing-belt-206-tu5", name: "تسمه تایم پژو ۲۰۶ TU5 (گیتس)", cat: "timing-belt", brand: "gates",
    price: 1250000, partnerPrice: 1080000, partNumber: "GT-5578XS",
    oemNumber: "0830VP", condition: "ORIGINAL", warrantyMonths: 6, country: "بلژیک",
    stock: 42,
    shortDesc: "تسمه تایم گیتس مدل 5578XS مخصوص موتور TU5 — استاندارد اروپا، مقاوم در برابر پارگی.",
    specs: "تعداد دندانه: ۱۱۱\nعرض: ۲۴ میلی‌متر\nسطح تعویض: هر ۸۰ هزار کیلومتر",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"], ["ikco", "peugeot-pars", "TU5"]],
    flags: { best: true },
  },
  {
    slug: "timing-belt-pride", name: "تسمه تایم پراید و تیبا", cat: "timing-belt", brand: "gates",
    price: 520000, partNumber: "GT-5154", condition: "AFTERMARKET", warrantyMonths: 3, country: "بلژیک",
    stock: 76,
    shortDesc: "تسمه تایم گیتس مخصوص موتور SOHC پراید و M13 تیبا.",
    specs: "سطح تعویض: هر ۶۰ هزار کیلومتر",
    compat: [["saipa", "pride"], ["saipa", "tiba"]],
  },
  {
    slug: "shock-absorber-front-pars", name: "کمک‌فنر جلو پژو پارس و سمند (جفت)", cat: "shock-absorber", brand: "kyb",
    price: 8900000, partnerPrice: 7900000, partNumber: "KYB-334843-Pair",
    oemNumber: "5202C8", condition: "ORIGINAL", warrantyMonths: 12, country: "ژاپن",
    stock: 7,
    shortDesc: "کمک‌فنر جلو KYB اکسل-G مخصوص پژو پارس و سمند — سواری نرم و کنترل بهتر در سرعت بالا.",
    specs: "نوع: گازی\nتعداد در بسته: ۲ عدد\nمحل نصب: جلو",
    compat: [["ikco", "peugeot-pars"], ["ikco", "samand"]],
    flags: { featured: true },
  },
  {
    slug: "shock-absorber-rear-pride", name: "کمک‌فنر عقب پراید (جفت)", cat: "shock-absorber", brand: "kyb",
    price: 1980000, partNumber: "KYB-341100-Pair", condition: "AFTERMARKET", warrantyMonths: 6, country: "ژاپن",
    stock: 21,
    shortDesc: "کمک‌فنر عقب KYB مخصوص پراید ۱۳۱، ۱۳۲ و ۱۱۱.",
    specs: "نوع: روغنی-گازی\nتعداد در بسته: ۲ عدد\nمحل نصب: عقب",
    compat: [["saipa", "pride"]],
  },
  {
    slug: "ball-joint-405", name: "سیبک طبق پایین پژو ۴۰۵ / پارس", cat: "ball-joint", brand: "skf",
    price: 890000, partnerPrice: 760000, partNumber: "SKF-VKDS-405B", oemNumber: "364016", condition: "ORIGINAL",
    warrantyMonths: 6, country: "سوئد", stock: 33,
    shortDesc: "سیبک طبق پایین SKF با گردگیری بلندمدت — مناسب ۴۰۵، پارس و سمند.",
    specs: "محل نصب: طبق پایین\nبسته: تک عدد",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars"], ["ikco", "samand"], ["ikco", "dena-plus"]],
  },
  {
    slug: "control-arm-206", name: "طبق چپ پژو ۲۰۶", cat: "control-arm", brand: "isaco",
    price: 3450000, partnerPrice: 3050000, partNumber: "IS-206-CA-L", oemNumber: "3520P2", condition: "ORIGINAL",
    warrantyMonths: 6, country: "ایران", stock: 14,
    shortDesc: "طبق جلوی چپ اورجینال ایساکو مخصوص پژو ۲۰۶ تمام تیپ‌ها — همراه بوش و سیبک.",
    specs: "سمت: چپ (راننده)\nهمراه سیبک: بله\nهمراه بوش: بله",
    compat: [["ikco", "peugeot-206"]],
  },
  {
    slug: "battery-66ah", name: "باتری ۶۶ آمپر اتمی اورجینال", cat: "battery", brand: "bosch",
    price: 6950000, partnerPrice: 6450000, discountPrice: 6590000, partNumber: "BS-S4-66", condition: "NEW",
    warrantyMonths: 18, country: "آلمان", stock: 15,
    shortDesc: "باتری اتمی ۶۶ آمپر بوش با جریان راه‌اندازی بالا — مناسب سمند، پارس، ۲۰۷ و خودروهای خانواده.",
    specs: "ظرفیت: ۶۶ آمپرساعت\nجریان استارت: ۵۸۰ آمپر\nولتاژ: ۱۲ ولت\nنوع: اتمی بدون نیاز به سرویس",
    compat: [["ikco", "samand"], ["ikco", "peugeot-pars"], ["ikco", "peugeot-207i"], ["ikco", "dena-plus"], ["kia", "cerato"], ["hyundai", "elantra"]],
    flags: { featured: true, freeShip: true },
  },
  {
    slug: "battery-55ah", name: "باتری ۵۵ آمپر اتمی", cat: "battery", brand: "sakoo",
    price: 4950000, partNumber: "SK-BAT-55", condition: "NEW", warrantyMonths: 12, country: "ایران",
    stock: 28,
    shortDesc: "باتری ۵۵ آمپر اتمی مناسب پراید، تیبا، ساینا، ۲۰۶ و کوییک.",
    specs: "ظرفیت: ۵۵ آمپرساعت\nجریان استارت: ۴۶۰ آمپر\nنوع: اتمی",
    compat: [["saipa", "pride"], ["saipa", "tiba"], ["saipa", "saina"], ["saipa", "quick"], ["ikco", "peugeot-206"]],
  },
  {
    slug: "alternator-206-tu5", name: "دینام پژو ۲۰۶ TU5 / ۲۰۷", cat: "alternator", brand: "valeo",
    price: 12500000, partnerPrice: 11200000, partNumber: "VL-206-ALT", oemNumber: "5705V2", condition: "ORIGINAL",
    warrantyMonths: 12, country: "فرانسه", stock: 5,
    shortDesc: "دینام اورجینال والئو ۸۰ آمپر مخصوص موتور TU5 — پژو ۲۰۶ تیپ ۵، ۲۰۷ و رانا.",
    specs: "جریان: ۸۰ آمپر\nولتاژ: ۱۴ ولت\nپولی: تک‌شیار",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"]],
  },
  {
    slug: "starter-motor-samand", name: "استارت سمند / پارس XU7", cat: "starter", brand: "valeo",
    price: 14800000, partnerPrice: 13200000, partNumber: "VL-SMD-STR", oemNumber: "5940V4", condition: "ORIGINAL",
    warrantyMonths: 12, country: "فرانسه", stock: 4,
    shortDesc: "استارت اورجینال والئو مخصوص موتور XU7 سمند و پارس — راه‌اندازی سریع در هوای سرد.",
    specs: "توان: ۱.۱ کیلووات\nدنده: ۹ عدد",
    compat: [["ikco", "samand"], ["ikco", "peugeot-pars"], ["ikco", "peugeot-405"]],
  },
  {
    slug: "spark-plug-ngk-206", name: "شمع NGK مخصوص پژو ۲۰۶ TU5 (بسته ۴ عددی)", cat: "spark-plug", brand: "ngk",
    price: 1680000, partnerPrice: 1450000, partNumber: "NGK-BKR6E-11", condition: "ORIGINAL", warrantyMonths: 0,
    country: "ژاپن", stock: 64,
    shortDesc: "شمع استاندارد NGK مدل BKR6E-11 — مناسب موتور TU5 پژو ۲۰۶ تیپ ۵، ۲۰۷ و رانا.",
    specs: "فاصله دهانه: ۱.۱ میلی‌متر\nنوع: معمولی نیکل\nبسته: ۴ عدد",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"], ["ikco", "peugeot-pars", "TU5"], ["ikco", "tara", "تارا TU5"]],
    flags: { best: true },
  },
  {
    slug: "oxygen-sensor-cerato", name: "سنسور اکسیژن کیا سراتو / اپتیما", cat: "sensors", brand: "denso",
    price: 4650000, partnerPrice: 4200000, partNumber: "DN-O2-CER", condition: "AFTERMARKET", warrantyMonths: 6,
    country: "ژاپن", stock: 8,
    shortDesc: "سنسور اکسیژن (لاندا) دنسو مخصوص کیا سراتو و اپتیما — کاهش مصرف سوخت و رفع خطای موتور.",
    specs: "تعداد سیم: ۴\nمحل نصب: قبل از کاتالیزور",
    compat: [["kia", "cerato"], ["kia", "optima"], ["hyundai", "elantra"]],
  },
  {
    slug: "radiator-pars", name: "رادیاتور آب پژو پارس / سمند", cat: "radiator", brand: "sakoo",
    price: 7800000, partnerPrice: 7000000, partNumber: "SK-PARS-RAD", condition: "AFTERMARKET", warrantyMonths: 12,
    country: "ایران", stock: 6,
    shortDesc: "رادیاتور آب آلومینیومی ساکو مخصوص پارس و سمند — خنک‌کاری عالی در ترافیک و گرما.",
    specs: "جنس: آلومینیوم-پلاستیک\nعرض: دو ردیف پره\nهمراه درپوش: بله",
    compat: [["ikco", "peugeot-pars"], ["ikco", "samand"]],
  },
  {
    slug: "radiator-fan-206", name: "فن رادیاتور پژو ۲۰۶", cat: "radiator-fan", brand: "kavir",
    price: 3250000, partNumber: "KV-206-FAN", condition: "AFTERMARKET", warrantyMonths: 6, country: "ایران",
    stock: 11,
    shortDesc: "فن و پروانه رادیاتور کاویر مخصوص پژو ۲۰۶ — عملکرد بی‌صدا و گردش هوای بالا.",
    specs: "ولتاژ: ۱۲ ولت\nتعداد پره: ۷",
    compat: [["ikco", "peugeot-206"]],
  },
  {
    slug: "thermostat-405", name: "ترموستات پژو ۴۰۵ / پارس XU7", cat: "thermostat", brand: "valeo",
    price: 690000, partNumber: "VL-TH-405-88", condition: "ORIGINAL", warrantyMonths: 6, country: "فرانسه",
    stock: 26,
    shortDesc: "ترموستات ۸۸ درجه والئو مخصوص موتور XU7 — تنظیم دقیق دمای موتور.",
    specs: "دمای بازشوندگی: ۸۸ درجه\nهمراه آب‌بند: بله",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars"], ["ikco", "samand"]],
  },
  {
    slug: "oil-filter-206", name: "فیلتر روغن پژو ۲۰۶ / ۲۰۷", cat: "oil-filter", brand: "mann",
    price: 320000, partnerPrice: 265000, partNumber: "MN-W75-3", oemNumber: "1109AY", condition: "ORIGINAL",
    warrantyMonths: 0, country: "آلمان", stock: 120,
    shortDesc: "فیلتر روغن مان W75/3 — مناسب تمام پژوهای موتور TU5 و TU3.",
    specs: "ارتفاع: ۶۵ میلی‌متر\nرزوه: M20x1.5",
    compat: [["ikco", "peugeot-206"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"], ["ikco", "peugeot-pars", "TU5"]],
    flags: { best: true },
  },
  {
    slug: "oil-filter-pride", name: "فیلتر روغن پراید و تیبا", cat: "oil-filter", brand: "sakoo",
    price: 145000, partNumber: "SK-OF-PRI", condition: "AFTERMARKET", warrantyMonths: 0, country: "ایران",
    stock: 200,
    shortDesc: "فیلتر روغن ساکو مخصوص پراید، تیبا، ساینا و کوییک.",
    specs: "رزوه: M18x1.5",
    compat: [["saipa", "pride"], ["saipa", "tiba"], ["saipa", "saina"], ["saipa", "quick"], ["saipa", "shahin"]],
    flags: { best: true },
  },
  {
    slug: "air-filter-pars", name: "فیلتر هوا پژو پارس / سمند", cat: "air-filter", brand: "mahle",
    price: 580000, partnerPrice: 490000, partNumber: "MH-LX-745", oemNumber: "1457434480", condition: "ORIGINAL",
    warrantyMonths: 0, country: "آلمان", stock: 45,
    shortDesc: "فیلتر هوای ماهله مخصوص پارس و سمند — فیلتراسیون بالا برای موتور XU7 و EF7.",
    specs: "نوع: پنلی\nقابلیت شست‌وشو: خیر",
    compat: [["ikco", "peugeot-pars"], ["ikco", "samand"], ["ikco", "dena-plus"]],
  },
  {
    slug: "engine-oil-behran-20w50", name: "روغن موتور بهران رخش 20W-50 (۴ لیتری)", cat: "engine-oil", brand: "behran",
    price: 720000, partnerPrice: 640000, partNumber: "BH-RKSH-4L", condition: "NEW", warrantyMonths: 0,
    country: "ایران", stock: 150,
    shortDesc: "روغن موتور بهران رخش 20W-50 — مناسب موتورهای بنزینی خودروهای ایرانی، بسته ۴ لیتری.",
    specs: "گرانروی: 20W-50\nحجم: ۴ لیتر\nاستاندارد: API SL",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars"], ["ikco", "samand"], ["saipa", "pride"], ["saipa", "tiba"]],
    flags: { featured: true, freeShip: true },
  },
  {
    slug: "engine-oil-naftpars-10w40", name: "روغن موتور نفت پارس 10W-40 نیمه‌سنتزی (۴ لیتری)", cat: "engine-oil", brand: "naft-pars",
    price: 980000, partnerPrice: 870000, partNumber: "NP-10W40-4L", condition: "NEW", warrantyMonths: 0,
    country: "ایران", stock: 95,
    shortDesc: "روغن نیمه‌سنتزی 10W-40 نفت پارس مناسب موتورهای TU5 و EF7 و خودروهای کره‌ای.",
    specs: "گرانروی: 10W-40\nحجم: ۴ لیتر\nاستاندارد: API SN",
    compat: [["ikco", "peugeot-206"], ["ikco", "peugeot-207i"], ["ikco", "dena-plus"], ["kia", "cerato"], ["hyundai", "tucson"], ["chery", "arrizo"], ["mvm", "x22"]],
  },
  {
    slug: "clutch-kit-405", name: "دیسک و صفحه کلاچ پژو ۴۰۵ / پارس (ست کامل)", cat: "clutch-kit", brand: "valeo",
    price: 9850000, partnerPrice: 8900000, partNumber: "VL-405-CL-KIT", oemNumber: "2002G5", condition: "ORIGINAL",
    warrantyMonths: 12, country: "فرانسه", stock: 6,
    shortDesc: "ست کامل کلاچ والئو شامل دیسک، صفحه و بلبرینگ — مناسب ۴۰۵، پارس و سمند XU7.",
    specs: "قطر دیسک: ۲۰۰ میلی‌متر\nتعداد دندانه: ۱۸\nشامل بلبرینگ: بله",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-pars"], ["ikco", "samand"]],
    flags: { featured: true },
  },
  {
    slug: "wheel-bearing-pride", name: "بلبرینگ چرخ جلو پراید (جفت)", cat: "bearings", brand: "skf",
    price: 1150000, partnerPrice: 990000, partNumber: "SKF-PRI-WB-Pair", condition: "ORIGINAL", warrantyMonths: 6,
    country: "سوئد", stock: 38,
    shortDesc: "بلبرینگ چرخ جلوی SKF مخصوص پراید — بسته جفت با واشر و قفل.",
    specs: "محل نصب: چرخ جلو\nبسته: ۲ عدد",
    compat: [["saipa", "pride"], ["saipa", "tiba"], ["saipa", "saina"]],
  },
  {
    slug: "injector-206-tu5", name: "انژکتور پژو ۲۰۶ TU5 (تک عدد)", cat: "injector", brand: "bosch",
    price: 3450000, partnerPrice: 3050000, partNumber: "BS-0280156-206", condition: "ORIGINAL", warrantyMonths: 6,
    country: "آلمان", stock: 19,
    shortDesc: "انژکتور بوش مخصوص موتور TU5 — پاشش دقیق و کاهش مصرف سوخت.",
    specs: "نوع: ۴ سوراخه\nامپدانس: بالا\nتک عدد",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"], ["ikco", "peugeot-pars", "TU5"]],
  },
  {
    slug: "fuel-pump-pride", name: "پمپ بنزین پراید و تیبا", cat: "fuel-pump", brand: "kavir",
    price: 2250000, partNumber: "KV-PRI-FP", condition: "AFTERMARKET", warrantyMonths: 6, country: "ایران",
    stock: 23,
    shortDesc: "پمپ بنزین الکتریکی کاویر مخصوص پراید انژکتوری و تیبا — فشار پایدار.",
    specs: "فشار: ۳.۵ بار\nولتاژ: ۱۲ ولت",
    compat: [["saipa", "pride"], ["saipa", "tiba"], ["saipa", "saina"], ["saipa", "quick"]],
  },
  {
    slug: "headlight-206", name: "چراغ جلو راست پژو ۲۰۶", cat: "headlight", brand: "isaco",
    price: 5600000, partnerPrice: 4950000, partNumber: "IS-206-HL-R", condition: "ORIGINAL", warrantyMonths: 6,
    country: "ایران", stock: 7,
    shortDesc: "چراغ جلوی راست اورجینال ایساکو مخصوص پژو ۲۰۶ — شیشه کریستال و کاسه آینه‌ای.",
    specs: "سمت: راست\nنوع لامپ: H4",
    compat: [["ikco", "peugeot-206"]],
  },
  {
    slug: "taillight-pride", name: "چراغ عقب چپ پراید ۱۳۱", cat: "taillight", brand: "saipa-yadak",
    price: 1450000, partNumber: "SY-131-TL-L", condition: "ORIGINAL", warrantyMonths: 3, country: "ایران",
    stock: 16,
    shortDesc: "چراغ عقب چپ اورجینال سایپا یدک مخصوص پراید ۱۳۱.",
    specs: "سمت: چپ",
    compat: [["saipa", "pride", "۱۳۱"]],
  },
  {
    slug: "side-mirror-cerato", name: "آینه جانبی برقی کیا سراتو", cat: "side-mirror", brand: "febi",
    price: 4850000, partNumber: "FB-CER-MIR-L", condition: "AFTERMARKET", warrantyMonths: 6, country: "آلمان",
    stock: 5,
    shortDesc: "آینه جانبی چپ برقی با گرمکن مخصوص کیا سراتو صندوق‌دار.",
    specs: "سمت: چپ\nبرقی: بله\nگرمکن: بله",
    compat: [["kia", "cerato", "صندوق‌دار ۲.۰"], ["kia", "cerato", "صندوق‌دار ۱.۶"]],
  },
  {
    slug: "engine-mount-206", name: "دسته موتور راست پژو ۲۰۶ TU5", cat: "engine-mount", brand: "isaco",
    price: 1850000, partnerPrice: 1650000, partNumber: "IS-206-EM-R", condition: "ORIGINAL", warrantyMonths: 6,
    country: "ایران", stock: 13,
    shortDesc: "دسته موتور راست اورجینال مخصوص موتور TU5 — کاهش لرزش و صدای موتور.",
    specs: "سمت: راست\nجنس لاستیک: طبیعی",
    compat: [["ikco", "peugeot-206", "تیپ ۵"], ["ikco", "peugeot-207i"], ["ikco", "rana-plus"]],
  },
  {
    slug: "brake-fluid-dot4", name: "مایع ترمز DOT4 (۵۰۰ سی‌سی)", cat: "brake-fluid", brand: "behran",
    price: 185000, partNumber: "BH-DOT4-500", condition: "NEW", warrantyMonths: 0, country: "ایران",
    stock: 180,
    shortDesc: "مایع ترمز DOT4 بهران — نقطه جوش بالا، مناسب تمام خودروها.",
    specs: "استاندارد: DOT4\nحجم: ۵۰۰ سی‌سی",
    compat: [["ikco", "peugeot-206"], ["saipa", "pride"], ["kia", "cerato"], ["hyundai", "tucson"]],
    flags: { best: true },
  },
  {
    slug: "antifreeze-coolant", name: "ضدیخ و ضدجوش مایع خنک‌کننده (۴ لیتری)", cat: "antifreeze", brand: "behran",
    price: 420000, partNumber: "BH-AF-4L", condition: "NEW", warrantyMonths: 0, country: "ایران",
    stock: 85,
    shortDesc: "ضدیخ و ضدجوش بهران — محافظت از موتور در دمای منفی ۳۷ تا مثبت ۱۳۰ درجه.",
    specs: "حجم: ۴ لیتر\nرنگ: سبز\nنقطه انجماد: −۳۷ درجه",
    compat: [["ikco", "peugeot-405"], ["ikco", "peugeot-206"], ["saipa", "pride"], ["kia", "sportage"]],
  },
  {
    slug: "cabin-filter-207", name: "فیلتر کابین (اتاق) پژو ۲۰۷", cat: "cabin-filter", brand: "mahle",
    price: 490000, partNumber: "MH-CF-207", condition: "AFTERMARKET", warrantyMonths: 0, country: "آلمان",
    stock: 34,
    shortDesc: "فیلتر کابین ماهله مخصوص پژو ۲۰۷ و ۲۰۶ — جلوگیری از ورود گرد و غبار به کابین.",
    specs: "نوع: زغالی‌دار",
    compat: [["ikco", "peugeot-207i"], ["ikco", "peugeot-206"]],
  },
  {
    slug: "gearbox-oil-ef7", name: "روغن گیربکس دستی خودروهای ایرانی (۱ لیتری)", cat: "gearbox-oil", brand: "naft-pars",
    price: 310000, partNumber: "NP-GB-1L", condition: "NEW", warrantyMonths: 0, country: "ایران",
    stock: 110,
    shortDesc: "روغن گیربکس دستی GL-4 مناسب سمند، پارس، ۲۰۶ و پراید.",
    specs: "گرانروی: 75W-85\nاستاندارد: API GL-4\nحجم: ۱ لیتر",
    compat: [["ikco", "samand"], ["ikco", "peugeot-206"], ["ikco", "peugeot-pars"], ["saipa", "pride"]],
  },
];

async function main() {
  console.log("Seeding Yadaki store...");

  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.question.deleteMany().catch(() => {});
  await prisma.stockMovement.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.crossRef.deleteMany().catch(() => {});
  await prisma.compatibility.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.userVehicle.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.brand.deleteMany().catch(() => {});
  await prisma.vehicleTrim.deleteMany().catch(() => {});
  await prisma.vehicleModel.deleteMany().catch(() => {});
  await prisma.vehicleMake.deleteMany().catch(() => {});
  await prisma.shippingMethod.deleteMany().catch(() => {});
  await prisma.coupon.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  await prisma.post.deleteMany().catch(() => {});
  await prisma.priceTier.deleteMany().catch(() => {});

  for (const [i, c] of CATEGORIES.entries()) {
    const parent = await prisma.category.create({
      data: { name: c.name, slug: c.slug, icon: c.icon, order: i },
    });
    for (const [j, ch] of c.children.entries()) {
      await prisma.category.create({
        data: { name: ch.name, slug: ch.slug, parentId: parent.id, order: j },
      });
    }
  }
  console.log(`✔ ${CATEGORIES.length} دسته اصلی ساخته شد`);

  const brandMap = new Map<string, string>();
  for (const b of BRANDS) {
    const created = await prisma.brand.create({ data: b });
    brandMap.set(b.slug, created.id);
  }
  console.log(`✔ ${BRANDS.length} برند ساخته شد`);

  const trimMap = new Map<string, string>();
  for (const v of VEHICLES) {
    const make = await prisma.vehicleMake.create({
      data: { name: v.name, slug: v.slug, order: 0 },
    });
    for (const m of v.models) {
      const model = await prisma.vehicleModel.create({
        data: { makeId: make.id, name: m.name, slug: m.slug },
      });
      for (const t of m.trims) {
        const trim = await prisma.vehicleTrim.create({
          data: {
            modelId: model.id,
            name: t.name,
            yearFrom: t.yearFrom,
            yearTo: t.yearTo,
            engine: t.engine,
            fuel: t.fuel,
            transmission: t.transmission,
          },
        });
        trimMap.set(`${v.slug}/${m.slug}/${t.name}`, trim.id);
      }
      trimMap.set(`${v.slug}/${m.slug}/*`, (await prisma.vehicleTrim.findFirst({ where: { modelId: model.id } }))!.id);
    }
  }
  console.log(`✔ ${VEHICLES.length} برند خودرو و ${trimMap.size} تیپ ثبت شد`);

  const catMap = new Map<string, string>();
  const cats = await prisma.category.findMany();
  for (const c of cats) catMap.set(c.slug, c.id);

  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        categoryId: catMap.get(p.cat)!,
        brandId: brandMap.get(p.brand)!,
        partNumber: p.partNumber,
        oemNumber: p.oemNumber,
        technicalCode: p.technicalCode,
        condition: p.condition,
        warrantyMonths: p.warrantyMonths,
        country: p.country,
        price: p.price,
        partnerPrice: p.partnerPrice,
        discountPrice: p.discountPrice,
        stock: p.stock,
        shortDesc: p.shortDesc,
        longDesc: `${p.shortDesc}\n\nاین قطعه از فروشگاه یدکی با تضمین اصالت کالا عرضه می‌شود. تمام قطعات پیش از ارسال از نظر سلامت فیزیکی و اصالت برند بررسی می‌شوند. برای اطمینان از سازگاری، خودروی خود را از بالای صفحه انتخاب کنید تا فقط قطعات مناسب خودروی شما نمایش داده شود.`,
        specs: p.specs,
        status: "ACTIVE",
        isFeatured: p.flags?.featured ?? false,
        isNew: p.flags?.isNew ?? Math.random() > 0.7,
        isBestSeller: p.flags?.best ?? false,
        hasFreeShipping: p.flags?.freeShip ?? false,
        ratingAvg: 0,
        salesCount: Math.floor(Math.random() * 50),
      },
    });

    await prisma.productImage.create({
      data: { productId: product.id, url: IMAGE, alt: p.name, order: 0 },
    });

    if (p.crossRefs) {
      for (const code of p.crossRefs) {
        await prisma.crossRef.create({ data: { productId: product.id, code } });
      }
    }

    for (const c of p.compat) {
      const [makeSlug, modelSlug, trimName] = c;
      const model = await prisma.vehicleModel.findUnique({
        where: { makeId_slug: { makeId: (await prisma.vehicleMake.findUnique({ where: { slug: makeSlug } }))!.id, slug: modelSlug } },
      });
      if (!model) continue;
      let trimId: string | null = null;
      if (trimName) {
        trimId = trimMap.get(`${makeSlug}/${modelSlug}/${trimName}`) ?? null;
      }
      await prisma.compatibility.create({
        data: {
          productId: product.id,
          makeId: model.makeId,
          modelId: model.id,
          trimId,
        },
      });
    }
  }
  console.log(`✔ ${PRODUCTS.length} محصول ساخته شد`);

  await prisma.shippingMethod.createMany({
    data: [
      { name: "پست پیشتاز", cost: 55000, etaDays: "۲ تا ۴ روز کاری", order: 1 },
      { name: "تیپاکس", cost: 85000, etaDays: "۱ تا ۳ روز کاری", order: 2 },
      { name: "پیک موتوری تهران", cost: 45000, etaDays: "همان روز", order: 3 },
      { name: "تحویل حضوری (انبار مرکزی)", cost: 0, etaDays: "همان روز", order: 4 },
    ],
  });
  console.log("✔ روش‌های ارسال ساخته شد");

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      maxDiscount: 1000000,
      minSubtotal: 2000000,
      usageLimit: 1000,
      isActive: true,
    },
  });
  await prisma.coupon.create({
    data: { code: "FIRSTBUY", type: "FIXED", value: 300000, minSubtotal: 3000000, isActive: true },
  });
  console.log("✔ کوپن‌های نمونه ساخته شد");

  const admin = await prisma.user.create({
    data: {
      phone: "09120000000",
      name: "مدیر یدکی",
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      phone: "09121111111",
      name: "تعمیرگاه نمونه",
      role: "MECHANIC",
    },
  });
  await prisma.user.create({
    data: { phone: "09122222222", name: "مشتری نمونه", role: "CUSTOMER" },
  });
  console.log("✔ کاربران نمونه ساخته شد (ادمین: 09120000000)");

  const sampleProduct = await prisma.product.findUnique({ where: { slug: "brake-pad-front-206-tu5" } });
  if (sampleProduct) {
    await prisma.review.create({
      data: {
        productId: sampleProduct.id,
        userId: admin.id,
        rating: 5,
        body: "کیفیت لنت عالیه، ترمزگیری خیلی بهتر از لنت قبلیه. بسته‌بندی هم اورجینال بود.",
        isApproved: true,
      },
    });
    await prisma.question.create({
      data: {
        productId: sampleProduct.id,
        userId: admin.id,
        body: "برای ۲۰۷ هم مناسب هست؟",
        answer: "بله، لنت جلوی ۲۰۶ تیپ ۵ با ۲۰۷ یکسان است.",
        answeredAt: new Date(),
      },
    });
    await prisma.product.update({
      where: { id: sampleProduct.id },
      data: { ratingAvg: 5, ratingCount: 1 },
    });

    await prisma.priceTier.createMany({
      data: [
        { productId: sampleProduct.id, minQty: 5, price: 1600000 },
        { productId: sampleProduct.id, minQty: 10, price: 1520000 },
        { productId: sampleProduct.id, minQty: 20, price: 1450000 },
      ],
    });
    const oilProduct = await prisma.product.findUnique({ where: { slug: "engine-oil-behran-20w50" } });
    if (oilProduct) {
      await prisma.priceTier.createMany({
        data: [
          { productId: oilProduct.id, minQty: 6, price: 690000 },
          { productId: oilProduct.id, minQty: 12, price: 650000 },
        ],
      });
    }
    const filterProduct = await prisma.product.findUnique({ where: { slug: "oil-filter-pride" } });
    if (filterProduct) {
      await prisma.priceTier.createMany({
        data: [
          { productId: filterProduct.id, minQty: 20, price: 130000 },
          { productId: filterProduct.id, minQty: 50, price: 118000 },
        ],
      });
    }
  }

  const POSTS = [
    {
      slug: "how-to-choose-auto-parts",
      title: "راهنمای کامل خرید لوازم یدکی: اصلی، اورجینال یا افترمارکت؟",
      excerpt:
        "تفاوت قطعه اصلی، اورجینال و افترمارکت چیست و برای هر خودرو کدام انتخاب بهینه است؟ در این مقاله همه آنچه قبل از خرید قطعه باید بدانید را مرور می‌کنیم.",
      body: `وقتی صحبت از خرید لوازم یدکی می‌شود، سه اصطلاح رایج هستند: قطعه اصلی (OEM)، قطعه اورجینال برند و قطعه افترمارکت.

قطعه اصلی (OEM) قطعه‌ای است که با نام خود خودروساز بسته‌بندی و عرضه می‌شود؛ همان قطعه‌ای که هنگام تولید خودرو روی ماشین نصب شده است. کیفیت تضمینی دارد اما قیمت آن معمولاً بالاترین است.

قطعه اورجینال برند همان قطعه OEM است ولی با بسته‌بندی شرکت سازنده قطعه (مثل بوش یا والئو) عرضه می‌شود؛ کیفیت یکسان، قیمت کمی پایین‌تر.

قطعه افترمارکت توسط شرکت‌های ثالث تولید می‌شود. برندهای معتبر افترمارکت مانند فبی، گیتس و KYB کیفیت بسیار خوبی دارند و انتخاب اقتصادی هوشمندانه‌ای هستند؛ اما برندهای بی‌نام ریسک خرابی و آسیب به خودرو را بالا می‌برند.

توصیه یدکی: برای قطعات حساس ایمنی (ترمز، فرمان، تعلیق) سراغ برندهای معتبر یا OEM بروید و برای قطعات مصرفی ساده، افترمارکت معتبر انتخاب مناسبی است.`,
    },
    {
      slug: "fake-parts-detection",
      title: "۷ نشانه قطعه تقلبی؛ چطور لوازم یدکی تقلبی را تشخیص دهیم؟",
      excerpt:
        "بازار قطعات تقلبی پر از کالای شبیه‌سازی‌شده است. با این ۷ نشانه ساده می‌توانید احتمال خرید قطعه تقلبی را به حداقل برسانید.",
      body: `۱) کیفیت چاپ بسته‌بندی: برندهای معتبر چاپ و هولوگرام تمیز و یکدست دارند.

۲) وزن قطعه: قطعات تقلبی معمولاً سبک‌تر از نمونه اصلی هستند.

۳) کیفیت آبکاری و رنگ: لبه‌های تیز، رنگ ناهموار یا زنگ‌زدگی زودهنگام علامت خطر است.

۴) کد و شماره سریال: از طریق سایت برند، اصالت کد را استعلام کنید.

۵) قیمت غیرمنطقی: اگر قیمتی بیش از ۴۰٪ زیر بازار بود، مشکوک باشید.

۶) بسته‌بندی: پلمپ سالم، آدرس و مشخصات کامل سازنده و بارکد معتبر را چک کنید.

۷) محل خرید: از فروشگاه‌های دارای ضمانت اصالت خرید کنید تا در صورت مشکل، امکان مرجوعی داشته باشید.

فروشگاه یدکی تمام کالاها را با ضمانت اصالت عرضه می‌کند و در صورت اثبات تقلبی بودن، هزینه‌ها کامل بازگردانده می‌شود.`,
    },
    {
      slug: "when-to-replace-brake-pads",
      title: "چه زمانی باید لنت ترمز را عوض کنیم؟ علامت‌ها و بازه تعویض",
      excerpt:
        "لنت ترمز یکی از مهم‌ترین قطعات ایمنی خودروست. این علامت‌ها یعنی وقت تعویض لنت فرا رسیده است.",
      body: `علامت‌های رایج فرسودگی لنت ترمز:

• صدای سوت یا فلز روی فلز هنگام ترمزگیری
• افزایش فاصله ترمز و احساس نرمی پدال
• هشدار لنت در پشت‌بمیز خودروهای مجهز به سنسور
• ضخامت زیر ۳ میلی‌متر در بازرسی چشمی

بازه توصیه‌شده تعویض: برای رانندگی شهری معمولاً هر ۴۰ تا ۶۰ هزار کیلومتر؛ در رانندگی پرترمز و کوهستانی این بازه کوتاه‌تر می‌شود.

نکته مهم: هنگام تعویض لنت، همیشه لنت‌های یک محور (هر دو چرخ جلو یا هر دو عقب) را با هم تعویض کنید تا ترمزگیری متعادل بماند.`,
    },
  ];
  for (const p of POSTS) {
    await prisma.post.create({ data: { ...p, isPublished: true, publishedAt: new Date() } });
  }

  console.log("✅ Seed کامل شد");
  console.log("🔑 ورود ادمین: شماره 09120000000 + کد OTP (در کنسول چاپ می‌شود)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
