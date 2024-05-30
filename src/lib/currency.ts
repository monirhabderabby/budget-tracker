export const Currencies = [
  {
    value: "USD",
    label: "$ Dollar",
    locale: "en-US",
  },
  {
    value: "BDT",
    label: "৳ Taka",
    locale: "bn-BD",
  },
  {
    value: "INR",
    label: "₹ Rupee",
    locale: "en-IN",
  },
  {
    value: "AED",
    label: "د.إ Dirham",
    locale: "ar-AE",
  },
  {
    value: "SAR",
    label: "ر.س Riyal",
    locale: "ar-SA",
  },
  {
    value: "TRY",
    label: "₺ Lira",
    locale: "tr-TR",
  },
];

export type Currency = (typeof Currencies)[0];
