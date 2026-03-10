/**
 * steps.js — Multi-step form controller
 * Handles step navigation, validation, and form data collection
 */

const TOTAL_STEPS = 5;

let currentStep = 1;
let hawlAnswer = null;
let onStepChange = null;

/**
 * Initialize the step controller
 * @param {Function} stepChangeCallback — called with (stepNumber) on each step change
 */
export function initSteps(stepChangeCallback) {
    onStepChange = stepChangeCallback;

    // Hawl toggle buttons
    const hawlToggle = document.getElementById('hawl-toggle');
    if (hawlToggle) {
        hawlToggle.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                hawlToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                hawlAnswer = btn.dataset.value;
            });
        });
    }

    // Next buttons
    for (let i = 1; i < TOTAL_STEPS; i++) {
        const nextBtn = document.getElementById(`next-${i}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (validateStep(i)) {
                    goToStep(i + 1);
                }
            });
        }
    }

    // Prev buttons
    for (let i = 2; i <= TOTAL_STEPS; i++) {
        const prevBtn = document.getElementById(`prev-${i}`);
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToStep(i - 1);
            });
        }
    }
}

/**
 * Validate a step before allowing the user to proceed
 */
function validateStep(stepNum) {
    if (stepNum === 1) {
        if (!hawlAnswer) {
            shakeElement(document.getElementById('hawl-toggle'));
            return false;
        }
        if (hawlAnswer === 'no') {
            // Show a brief message but still allow proceed
            // (they may want to calculate anyway for planning purposes)
        }
    }
    return true;
}

/**
 * Navigate to a specific step
 */
export function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > TOTAL_STEPS) return;

    // Hide current step
    const currentEl = document.getElementById(`step-${currentStep}`);
    if (currentEl) currentEl.classList.remove('active');

    // Show new step
    const newEl = document.getElementById(`step-${stepNum}`);
    if (newEl) {
        newEl.classList.remove('active');
        // Force re-trigger animation
        void newEl.offsetWidth;
        newEl.classList.add('active');
    }

    currentStep = stepNum;
    updateProgressBar(stepNum);

    if (onStepChange) onStepChange(stepNum);
}

/**
 * Update the visual progress bar and step indicators
 */
function updateProgressBar(stepNum) {
    const fill = document.getElementById('progress-fill');
    if (fill) {
        const pct = (stepNum / TOTAL_STEPS) * 100;
        fill.style.width = `${pct}%`;
    }

    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => {
        const sNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        if (sNum === stepNum) {
            step.classList.add('active');
        } else if (sNum < stepNum) {
            step.classList.add('completed');
        }
    });
}

/**
 * Apply a shake animation to an element for visual feedback on validation errors
 */
function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
        el.style.animation = '';
    }, 400);

    // Inject shake keyframes if not yet present
    if (!document.getElementById('shake-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shake-keyframes';
        style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); }
        80% { transform: translateX(6px); }
      }
    `;
        document.head.appendChild(style);
    }
}

/**
 * Collect all form data from every step
 */
export function collectFormData() {
    const val = (id) => {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) || 0 : 0;
    };

    return {
        hawl: hawlAnswer,
        assets: {
            cashInHand: val('cash-hand'),
            cashInBank: val('cash-bank'),
            moneyOwed: val('cash-owed'),
            goldGrams: val('gold-grams'),
            goldValue: val('gold-value'),
            silverGrams: val('silver-grams'),
            silverValue: val('silver-value'),
            stocks: val('stocks-value'),
            crypto: val('crypto-value'),
            business: val('business-value'),
        },
        liabilities: {
            debts: val('debts'),
            bills: val('bills'),
        },
    };
}

/**
 * Reset the form to step 1
 */
export function resetForm() {
    // Clear all inputs
    document.querySelectorAll('.form-input').forEach(input => {
        input.value = '';
    });

    // Clear toggle selection
    hawlAnswer = null;
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    goToStep(1);
}

export function getCurrentStep() {
    return currentStep;
}
