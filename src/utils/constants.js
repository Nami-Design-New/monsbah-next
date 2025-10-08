export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const FCM = process.env.NEXT_PUBLIC_FCM_TOKEN;
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const LOCALES = ["ar", "en"];

export const META_LOCALES = [
  "ar-kw",
  "ar-sa",
  "en-sa",
  "en-kw",
  "ar-ae",
  "en-ae",
  "ar-bh",
  "en-bh",
  "ar-om",
  "en-om",
  "ar-qa",
  "en-qa",
];
export const META_LOCALES_DEF = "ar-kw";

export const META_DATA_CONTENT = {
  en: {
    title: "Monsbah",
    description:
      "A women's community for recycling and selling everything at home, including clothes, dresses, fashion, watches, shoes, and accessories—both used and new. Find everything you need to prepare for any occasion.",
    keywords: [
      "Clothes",
      "Dresses",
      "Fashion",
      "Style",
      "Watches",
      "Shoes",
      "Accessories",
      "Used",
      "New",
      "Women",
      "Recycling",
      "Occasions",
    ],
  },
  ar: {
    title: "مناسبة",
    description:
      "مجتمع نسائي يتم فيه إعادة تدوير وبيع كل ما هو موجود داخل المنزل من ملابس وفساتين وأزياء وموضة وساعات وأحذية وإكسسوارات مستعملة وجديدة، وتوفير كل ما يلبي حاجتك لتجهيز أي مناسبة.",
    keywords: [
      "ملابس",
      "فساتين",
      "ازياء",
      "موضة",
      "ساعات",
      "أحذية",
      "إكسسوارات",
      "مستعملة",
      "جديدة",
      "نسائي",
      "إعادة تدوير",
      "مناسبات",
    ],
  },
};

export const PROFILE_TABS = [
  { key: "ads", icon: "fa-bullhorn" },
  { key: "addAd", icon: "fa-plus" },
  { key: "notifications", icon: "fa-bell" },
  { key: "favorites", icon: "fa-heart" },
  { key: "settings", icon: "fa-gear" },
  { key: "verification", icon: "fa-badge-check" },
];

export const CATEGORY_TYPES = {
  SALE: "sale",
  RENT: "rent",
  ALL: "",
};

export const DRESS_CATEGORY_ID = 1;
