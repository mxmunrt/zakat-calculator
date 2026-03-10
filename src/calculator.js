/**
 * calculator.js — Zakat calculation engine
 * Handles Nisab threshold fetching & Zakat computation
 */

// Nisab constants (in grams)
const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;
const ZAKAT_RATE = 0.025; // 2.5%

// Fallback prices per gram — realistic estimates, updated March 2026
const FALLBACK_PRICES = {
  gold_gbp: 124.0,
  silver_gbp: 2.10,
  gold_usd: 155.0,
  silver_usd: 2.65,
  gold_eur: 143.0,
  silver_eur: 2.40,
};

let cachedPrices = null;

/**
 * Fetch live metal prices via our serverless API proxy.
 * In production (Vercel), calls /api/prices which proxies to Swissquote.
 * Falls back to hardcoded values if the API call fails.
 */
export async function fetchMetalPrices(currency = 'GBP') {
  // Try cached first (cache for 1 hour)
  if (cachedPrices && cachedPrices.currency === currency) {
    const age = Date.now() - (cachedPrices.timestamp || 0);
    if (age < 3600000) return cachedPrices; // 1 hour cache
  }

  try {
    const response = await fetch(`/api/prices?currency=${currency}`);
    if (!response.ok) throw new Error('API response not OK');

    const data = await response.json();
    cachedPrices = { ...data, timestamp: Date.now() };
    return cachedPrices;
  } catch (err) {
    console.warn('Price API failed, using fallback prices:', err.message);
    const goldPerGram = getFallback('gold', currency);
    const silverPerGram = getFallback('silver', currency);
    cachedPrices = { goldPerGram, silverPerGram, currency, live: false, timestamp: Date.now() };
    return cachedPrices;
  }
}

function getFallback(metal, currency) {
  const key = `${metal}_${currency.toLowerCase()}`;
  return FALLBACK_PRICES[key] || FALLBACK_PRICES[`${metal}_gbp`];
}

/**
 * Calculate the Nisab threshold in the given currency
 */
export function calculateNisab(silverPerGram) {
  return SILVER_NISAB_GRAMS * silverPerGram;
}

/**
 * Calculate Nisab using gold standard (for reference)
 */
export function calculateNisabGold(goldPerGram) {
  return GOLD_NISAB_GRAMS * goldPerGram;
}

/**
 * Get the currency symbol for a currency code
 */
export function getCurrencySymbol(currency) {
  const symbols = { GBP: '£', USD: '$', EUR: '€' };
  return symbols[currency] || currency;
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount, currency = 'GBP') {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Main Zakat calculation function
 *
 * @param {object} assets — All asset values in the user's currency
 * @param {object} liabilities — All liability values
 * @param {number} nisabThreshold — Current Nisab in the user's currency
 * @param {object} prices — { goldPerGram, silverPerGram } for converting grams
 *
 * @returns {{ zakatDue, totalAssets, totalLiabilities, netWealth,
 *             meetsNisab, breakdown }}
 */
export function calculateZakat(assets, liabilities, nisabThreshold, prices) {
  // Convert gold grams to currency value
  const goldFromGrams = (assets.goldGrams || 0) * (prices.goldPerGram || 0);
  const goldValue = goldFromGrams + (assets.goldValue || 0);

  // Convert silver grams to currency value
  const silverFromGrams = (assets.silverGrams || 0) * (prices.silverPerGram || 0);
  const silverValue = silverFromGrams + (assets.silverValue || 0);

  // Asset breakdown
  const breakdown = {
    cashInHand: assets.cashInHand || 0,
    cashInBank: assets.cashInBank || 0,
    moneyOwed: assets.moneyOwed || 0,
    gold: goldValue,
    silver: silverValue,
    stocks: assets.stocks || 0,
    crypto: assets.crypto || 0,
    business: assets.business || 0,
  };

  const totalAssets = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  const totalLiabilities = (liabilities.debts || 0) + (liabilities.bills || 0);

  const netWealth = totalAssets - totalLiabilities;

  const meetsNisab = netWealth >= nisabThreshold;

  const zakatDue = meetsNisab ? netWealth * ZAKAT_RATE : 0;

  return {
    zakatDue,
    totalAssets,
    totalLiabilities,
    netWealth,
    meetsNisab,
    nisabThreshold,
    breakdown,
    liabilities: {
      debts: liabilities.debts || 0,
      bills: liabilities.bills || 0,
    },
  };
}
