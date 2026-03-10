/**
 * Vercel Serverless Function — /api/prices
 * Proxies live gold & silver prices from Swissquote (avoids CORS)
 *
 * Query params:
 *   currency — GBP (default), USD, EUR
 *
 * Returns JSON: { goldPerGram, silverPerGram, currency, live }
 */

const TROY_OZ_TO_GRAMS = 31.1035;

const FALLBACK = {
    GBP: { gold: 124.0, silver: 2.10 },
    USD: { gold: 155.0, silver: 2.65 },
    EUR: { gold: 143.0, silver: 2.40 },
};

function extractPrice(data) {
    if (!Array.isArray(data) || data.length === 0) return null;
    const spreads = data[0].spreadProfilePrices;
    if (!spreads || spreads.length === 0) return null;
    const { bid, ask } = spreads[0];
    return (bid + ask) / 2;
}

export default async function handler(req, res) {
    // CORS headers for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    const currency = (req.query.currency || 'GBP').toUpperCase();

    try {
        const [goldRes, silverRes] = await Promise.all([
            fetch(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/${currency}`),
            fetch(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/${currency}`),
        ]);

        if (!goldRes.ok || !silverRes.ok) throw new Error('Upstream API error');

        const [goldData, silverData] = await Promise.all([goldRes.json(), silverRes.json()]);

        const goldPerOz = extractPrice(goldData);
        const silverPerOz = extractPrice(silverData);

        if (!goldPerOz || !silverPerOz) throw new Error('Could not parse prices');

        const goldPerGram = goldPerOz / TROY_OZ_TO_GRAMS;
        const silverPerGram = silverPerOz / TROY_OZ_TO_GRAMS;

        return res.status(200).json({
            goldPerGram: Math.round(goldPerGram * 100) / 100,
            silverPerGram: Math.round(silverPerGram * 100) / 100,
            currency,
            live: true,
        });
    } catch (err) {
        console.error('Price fetch error:', err.message);
        const fb = FALLBACK[currency] || FALLBACK.GBP;
        return res.status(200).json({
            goldPerGram: fb.gold,
            silverPerGram: fb.silver,
            currency,
            live: false,
        });
    }
}
