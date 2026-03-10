# ☪ ZakatCalc

A modern, responsive Zakat calculator built to help Muslims accurately determine their Zakat obligations based on authentic Islamic rulings.

🔗 **Live:** [zakatcalc.mrtalukdar.dev](https://zakatcalc.mrtalukdar.dev)

![Zakat Calculator Screenshot](https://img.shields.io/badge/status-live-10b981?style=for-the-badge)
![Built with Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white)

## Features

- **Multi-step calculator** — guided 5-step form covering eligibility, cash & savings, gold & silver, investments, and liabilities
- **Live Nisab threshold** — fetches real-time silver prices daily via the Swissquote forex feed to calculate the accurate Nisab
- **Multi-currency support** — GBP, USD, and EUR with automatic currency symbol updates
- **Detailed breakdown** — results page with full asset/liability breakdown and Zakat amount
- **Print-friendly** — print your Zakat summary directly from the browser
- **Fully responsive** — optimised for desktop, tablet, and mobile
- **Modern UI** — dark theme with glassmorphism, smooth animations, and emerald green accents

## How It Works

1. **Eligibility** — confirm you've held wealth for one full lunar year (Hawl)
2. **Cash & Savings** — enter cash in hand, bank balances, and money owed to you
3. **Gold & Silver** — input weight (grams) or market value of gold and silver holdings
4. **Investments & Business** — stocks, cryptocurrency, and business merchandise
5. **Liabilities** — deduct outstanding debts and immediate bills
6. **Results** — view your net zakatable wealth and Zakat due (2.5%)

The Nisab threshold is calculated using the **silver standard** (612.36g of silver) with live market prices updated daily.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (ES Modules) |
| Build | Vite 7 |
| API | Vercel Serverless Functions |
| Price Data | Swissquote Forex Feed |
| Hosting | Vercel |

## Project Structure

```
├── index.html              # Main HTML with all sections
├── api/
│   └── prices.js           # Serverless function — live metal price proxy
├── src/
│   ├── main.js             # App entry point & event wiring
│   ├── calculator.js       # Zakat calculation engine & price fetching
│   ├── steps.js            # Multi-step form controller
│   ├── results.js          # Results display & animations
│   └── style.css           # Complete design system & styles
├── vite.config.js          # Vite config with dev API proxy
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`. The Vite dev server includes a proxy plugin that handles the `/api/prices` endpoint locally.

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

The `api/prices.js` serverless function runs server-side on Vercel, fetching live metal prices from Swissquote and caching the response for 24 hours.

## Islamic References

Zakat rules and calculations are based on teachings by **Sheikh Majed Mahmoud** — [Fiqh of Zakat Series](https://www.youtube.com/watch?v=OF-Nb8qdfcU).

Key principles applied:
- **Nisab** — 87.48g of gold or 612.36g of silver (silver standard used by default)
- **Hawl** — one full lunar year (~354 days)
- **Rate** — 2.5% of net zakatable wealth
- **Exemptions** — personal home, car, clothing, household items, and tools of trade

> ⚠️ This calculator is for guidance only. Please consult a qualified Islamic scholar for specific rulings.

## License

MIT

---

**Built with ❤️ by [mrtalukdar.dev](https://mrtalukdar.dev)**
