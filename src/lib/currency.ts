export type Currency = string;

export const CURRENCIES: { code: string; label: string; symbol: string }[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "₵" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh" },
  { code: "RWF", label: "Rwandan Franc", symbol: "Fr" },
  { code: "XOF", label: "West African CFA Franc", symbol: "CFA" },
  { code: "EGP", label: "Egyptian Pound", symbol: "E£" },
  { code: "ETB", label: "Ethiopian Birr", symbol: "Br" },
  { code: "MAD", label: "Moroccan Dirham", symbol: "MAD" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr" },
  { code: "SEK", label: "Swedish Krona", symbol: "kr" },
  { code: "NOK", label: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", label: "Danish Krone", symbol: "kr" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
  { code: "MXN", label: "Mexican Peso", symbol: "MX$" },
  { code: "ARS", label: "Argentine Peso", symbol: "ARS" },
  { code: "COP", label: "Colombian Peso", symbol: "COP" },
  { code: "CLP", label: "Chilean Peso", symbol: "CLP" },
  { code: "PEN", label: "Peruvian Sol", symbol: "S/" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", label: "Thai Baht", symbol: "฿" },
  { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", label: "Philippine Peso", symbol: "₱" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", label: "Bangladeshi Taka", symbol: "৳" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", label: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "KD" },
  { code: "ILS", label: "Israeli Shekel", symbol: "₪" },
  { code: "TRY", label: "Turkish Lira", symbol: "₺" },
  { code: "PLN", label: "Polish Zloty", symbol: "zł" },
  { code: "CZK", label: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", label: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", label: "Romanian Leu", symbol: "lei" },
  { code: "UAH", label: "Ukrainian Hryvnia", symbol: "₴" },
];

let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;

export async function getRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cacheTime < 3600_000) return cachedRates;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const json = await res.json();
    if (json?.rates) { cachedRates = json.rates; cacheTime = Date.now(); return json.rates; }
  } catch { /* fall through */ }
  return { NGN: 1650, EUR: 0.92, GBP: 0.79, USD: 1 };
}

export async function getNgnToUsdRate(): Promise<number> {
  const rates = await getRates();
  return rates.NGN ?? 1650;
}

export function formatCurrency(kobo: number, currency: Currency, rates: Record<string, number>): string {
  const ngnAmount = kobo / 100;
  const usdAmount = ngnAmount / (rates.NGN ?? 1650);
  if (currency === "NGN") {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(ngnAmount);
  }
  const rate = rates[currency] ?? 1;
  const amount = usdAmount * rate;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function getCurrencyFromCookie(cookieHeader: string): Currency {
  const match = cookieHeader.match(/admin_currency=([^;]+)/);
  return match?.[1] ?? "USD";
}

export function koboToDisplay(kobo: number, currency: Currency, rates: Record<string, number>): number {
  const ngnAmount = kobo / 100;
  const usdAmount = ngnAmount / (rates.NGN ?? 1650);
  if (currency === "NGN") return ngnAmount;
  return parseFloat((usdAmount * (rates[currency] ?? 1)).toFixed(2));
}
