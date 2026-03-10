/**
 * main.js — Zakat Calculator App entry point
 * Wires up the calculator engine, step controller, and results display
 */

import './style.css';
import {
  fetchMetalPrices,
  calculateNisab,
  calculateNisabGold,
  calculateZakat,
  formatCurrency,
  getCurrencySymbol,
} from './calculator.js';
import { initSteps, collectFormData, resetForm, goToStep } from './steps.js';
import { showResults, hideResults } from './results.js';

// ─── State ───────────────────────────────────────────
let currentCurrency = 'GBP';
let metalPrices = null;
let nisabValue = 0;

// ─── Boot ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize multi-step form
  initSteps(onStepChange);

  // Currency selector
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', async (e) => {
      currentCurrency = e.target.value;
      updateCurrencySymbols();
      await loadPrices();
    });
  }

  // Calculate button
  const calculateBtn = document.getElementById('calculate-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculate);
  }

  // Recalculate button
  const recalcBtn = document.getElementById('recalculate-btn');
  if (recalcBtn) {
    recalcBtn.addEventListener('click', handleRecalculate);
  }

  // Print button
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Smooth scroll for hero CTA
  const heroBtn = document.querySelector('#hero .btn-primary');
  if (heroBtn) {
    heroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('calculator')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  // Load initial prices
  await loadPrices();

  // Intersection observer for info card animations
  initScrollAnimations();
});

// ─── Load Metal Prices ───────────────────────────────
async function loadPrices() {
  const nisabEl = document.getElementById('nisab-value');
  if (nisabEl) {
    nisabEl.textContent = 'Loading...';
    nisabEl.classList.add('loading');
  }

  try {
    metalPrices = await fetchMetalPrices(currentCurrency);
    nisabValue = calculateNisab(metalPrices.silverPerGram);

    if (nisabEl) {
      nisabEl.textContent = formatCurrency(nisabValue, currentCurrency);
      nisabEl.classList.remove('loading');
    }

    // Update note with per-gram price
    const noteEl = document.querySelector('.nisab-note');
    if (noteEl) {
      if (metalPrices.live) {
        const perGramFormatted = formatCurrency(metalPrices.silverPerGram, currentCurrency);
        noteEl.textContent = `Based on 612.36g of silver at today's price (${perGramFormatted}/g)`;
      } else {
        noteEl.textContent = `Based on 612.36g of silver at estimated price`;
      }
    }
  } catch (err) {
    console.error('Failed to load prices:', err);
    if (nisabEl) {
      nisabEl.textContent = 'Unavailable';
      nisabEl.classList.remove('loading');
    }
  }
}

// ─── Update Currency Symbols ─────────────────────────
function updateCurrencySymbols() {
  const symbol = getCurrencySymbol(currentCurrency);
  document.querySelectorAll('.currency-symbol').forEach(el => {
    el.textContent = symbol;
  });
}

// ─── Step Change Callback ────────────────────────────
function onStepChange(stepNum) {
  // Scroll step into view on mobile
  if (window.innerWidth < 768) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    if (stepEl) {
      setTimeout(() => {
        stepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
}

// ─── Handle Calculation ──────────────────────────────
function handleCalculate() {
  const formData = collectFormData();

  if (!metalPrices) {
    alert('Metal prices are still loading. Please wait a moment and try again.');
    return;
  }

  const result = calculateZakat(
    formData.assets,
    formData.liabilities,
    nisabValue,
    metalPrices
  );

  showResults(result, currentCurrency);
}

// ─── Handle Recalculation ────────────────────────────
function handleRecalculate() {
  hideResults();
  resetForm();
}

// ─── Scroll Animations ──────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  // Observe info cards
  document.querySelectorAll('.info-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1}s`;
    card.style.opacity = '0';
    observer.observe(card);
  });
}
