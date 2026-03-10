/**
 * results.js — Results display component
 * Renders the Zakat calculation results with animated breakdown
 */

import { formatCurrency } from './calculator.js';

/**
 * Show the results panel and hide the calculator steps
 */
export function showResults(result, currency) {
    const resultsEl = document.getElementById('results');
    const stepsContainer = document.getElementById('steps-container');
    const progressBar = document.getElementById('progress-bar');
    const progressSteps = document.getElementById('progress-steps');

    if (stepsContainer) stepsContainer.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    if (progressSteps) progressSteps.style.display = 'none';

    // Set date
    const dateEl = document.getElementById('results-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = `Calculated on ${now.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}`;
    }

    // Main result area
    const mainEl = document.getElementById('results-main');
    if (mainEl) {
        if (result.meetsNisab) {
            mainEl.innerHTML = `
        <p class="results-zakat-label">Your Zakat Due</p>
        <div class="results-zakat-amount" id="zakat-amount-counter">${formatCurrency(0, currency)}</div>
        <p class="results-nisab-note">
          Nisab threshold: ${formatCurrency(result.nisabThreshold, currency)} (Silver Standard)
        </p>
      `;
            // Animate the counter
            animateCounter(result.zakatDue, currency);
        } else {
            mainEl.innerHTML = `
        <div class="results-not-due">
          <div class="not-due-icon">✅</div>
          <h4>Zakat is Not Due</h4>
          <p>Your net zakatable wealth of ${formatCurrency(result.netWealth, currency)}
          is below the Nisab threshold of ${formatCurrency(result.nisabThreshold, currency)}.</p>
          <p style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.85rem;">
            You are not obligated to pay Zakat at this time. May Allah bless you.
          </p>
        </div>
      `;
        }
    }

    // Breakdown table
    const tbody = document.getElementById('breakdown-body');
    if (tbody) {
        const b = result.breakdown;
        const l = result.liabilities;

        const rows = [
            { label: 'Cash in Hand', value: b.cashInHand },
            { label: 'Bank Accounts', value: b.cashInBank },
            { label: 'Money Owed to You', value: b.moneyOwed },
            { label: 'Gold', value: b.gold },
            { label: 'Silver', value: b.silver },
            { label: 'Stocks & Shares', value: b.stocks },
            { label: 'Cryptocurrency', value: b.crypto },
            { label: 'Business Merchandise', value: b.business },
        ];

        let html = '';

        // Asset rows (only show non-zero)
        rows.forEach(row => {
            if (row.value > 0) {
                html += `<tr>
          <td>${row.label}</td>
          <td>${formatCurrency(row.value, currency)}</td>
        </tr>`;
            }
        });

        // Total assets
        html += `<tr class="total-row">
      <td>Total Assets</td>
      <td>${formatCurrency(result.totalAssets, currency)}</td>
    </tr>`;

        // Liabilities (only show non-zero)
        if (l.debts > 0) {
            html += `<tr class="deduct">
        <td>− Outstanding Debts</td>
        <td>−${formatCurrency(l.debts, currency)}</td>
      </tr>`;
        }
        if (l.bills > 0) {
            html += `<tr class="deduct">
        <td>− Immediate Bills</td>
        <td>−${formatCurrency(l.bills, currency)}</td>
      </tr>`;
        }

        if (result.totalLiabilities > 0) {
            html += `<tr class="total-row">
        <td>Net Zakatable Wealth</td>
        <td>${formatCurrency(result.netWealth, currency)}</td>
      </tr>`;
        }

        // Zakat due row
        if (result.meetsNisab) {
            html += `<tr class="zakat-row">
        <td>Zakat Due (2.5%)</td>
        <td>${formatCurrency(result.zakatDue, currency)}</td>
      </tr>`;
        }

        tbody.innerHTML = html;
    }

    if (resultsEl) resultsEl.classList.remove('hidden');

    // Scroll to results
    resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hide results and re-show the calculator
 */
export function hideResults() {
    const resultsEl = document.getElementById('results');
    const stepsContainer = document.getElementById('steps-container');
    const progressBar = document.getElementById('progress-bar');
    const progressSteps = document.getElementById('progress-steps');

    if (resultsEl) resultsEl.classList.add('hidden');
    if (stepsContainer) stepsContainer.style.display = '';
    if (progressBar) progressBar.style.display = '';
    if (progressSteps) progressSteps.style.display = '';
}

/**
 * Animate the Zakat amount counting up from 0
 */
function animateCounter(target, currency) {
    const el = document.getElementById('zakat-amount-counter');
    if (!el) return;

    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        el.textContent = formatCurrency(current, currency);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = formatCurrency(target, currency);
        }
    }

    requestAnimationFrame(tick);
}
