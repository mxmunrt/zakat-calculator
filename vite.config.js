import { defineConfig } from 'vite';

const TROY_OZ_TO_GRAMS = 31.1035;

// Dev-only plugin that mimics the Vercel serverless function
function devApiProxy() {
    return {
        name: 'dev-api-proxy',
        configureServer(server) {
            server.middlewares.use('/api/prices', async (req, res) => {
                const url = new URL(req.url, 'http://localhost');
                const currency = (url.searchParams.get('currency') || 'GBP').toUpperCase();

                res.setHeader('Content-Type', 'application/json');

                try {
                    const [goldRes, silverRes] = await Promise.all([
                        fetch(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/${currency}`),
                        fetch(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/${currency}`),
                    ]);

                    if (!goldRes.ok || !silverRes.ok) throw new Error('Upstream error');

                    const [goldData, silverData] = await Promise.all([goldRes.json(), silverRes.json()]);

                    const goldPerOz = extractPrice(goldData);
                    const silverPerOz = extractPrice(silverData);

                    if (!goldPerOz || !silverPerOz) throw new Error('Parse error');

                    res.end(JSON.stringify({
                        goldPerGram: Math.round((goldPerOz / TROY_OZ_TO_GRAMS) * 100) / 100,
                        silverPerGram: Math.round((silverPerOz / TROY_OZ_TO_GRAMS) * 100) / 100,
                        currency,
                        live: true,
                    }));
                } catch (err) {
                    const FALLBACK = { GBP: { gold: 124.0, silver: 2.10 }, USD: { gold: 155.0, silver: 2.65 }, EUR: { gold: 143.0, silver: 2.40 } };
                    const fb = FALLBACK[currency] || FALLBACK.GBP;
                    res.end(JSON.stringify({
                        goldPerGram: fb.gold,
                        silverPerGram: fb.silver,
                        currency,
                        live: false,
                    }));
                }
            });
        },
    };
}

function extractPrice(data) {
    if (!Array.isArray(data) || data.length === 0) return null;
    const spreads = data[0].spreadProfilePrices;
    if (!spreads || spreads.length === 0) return null;
    const { bid, ask } = spreads[0];
    return (bid + ask) / 2;
}

export default defineConfig({
    plugins: [devApiProxy()],
});
