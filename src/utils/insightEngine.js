import { formatINR, calculateEMI, calculatePrepayment } from './calculations';

export const generateInsights = ({ principal, rate, months, emi, totalInterest, totalPayment, income }) => {
  const P = parseFloat(principal);
  const R = parseFloat(rate);
  const insights = [];

  // Interest as % of loan
  const interestRatio = (totalInterest / P) * 100;
  if (interestRatio > 80) {
    insights.push({ icon: '🔴', text: `You'll pay ${formatINR(totalInterest)} as interest — that's ${Math.round(interestRatio)}% of your loan amount!`, severity: 'high' });
  } else if (interestRatio > 50) {
    insights.push({ icon: '🟠', text: `Interest of ${formatINR(totalInterest)} is ${Math.round(interestRatio)}% of your loan. Consider a shorter tenure.`, severity: 'medium' });
  } else {
    insights.push({ icon: '🟢', text: `Interest is ${Math.round(interestRatio)}% of your loan — a reasonable deal.`, severity: 'low' });
  }

  // EMI to income ratio
  if (income && parseFloat(income) > 0) {
    const emiIncomeRatio = (emi / parseFloat(income)) * 100;
    if (emiIncomeRatio > 50) {
      insights.push({ icon: '🚨', text: `EMI is ${Math.round(emiIncomeRatio)}% of your income — this is financially risky.`, severity: 'high' });
    } else if (emiIncomeRatio > 30) {
      insights.push({ icon: '⚠️', text: `EMI takes ${Math.round(emiIncomeRatio)}% of your income. Keep it under 30% for safety.`, severity: 'medium' });
    } else {
      insights.push({ icon: '✅', text: `EMI is ${Math.round(emiIncomeRatio)}% of your income — comfortably affordable.`, severity: 'low' });
    }
  }

  // Rate insight
  if (R > 12) {
    insights.push({ icon: '📈', text: `${R}% is a high interest rate. Explore balance transfer options from banks.`, severity: 'high' });
  } else if (R > 9) {
    insights.push({ icon: '💡', text: `At ${R}%, check if you qualify for a lower rate with a good credit score.`, severity: 'medium' });
  }

  // Tenure insight
  const years = months / 12;
  if (years > 20) {
    insights.push({ icon: '⏳', text: `${Math.round(years)}-year tenure means you'll pay almost double. Try reducing to 15 years.`, severity: 'medium' });
  }

  // Prepayment suggestion
  if (P >= 500000) {
    const extraYearly = Math.round(P * 0.02);
    const prepay = calculatePrepayment(principal, rate, months, extraYearly);
    if (prepay && prepay.interestSaved > 10000) {
      insights.push({ icon: '💰', text: `Prepaying ${formatINR(extraYearly)}/year can save ${formatINR(prepay.interestSaved)} in interest & ${prepay.monthsSaved} months.`, severity: 'tip' });
    }
  }

  return insights;
};

export const generateShareText = ({ principal, rate, tenure, tenureType, emi, totalInterest, totalPayment, insights }) => {
  let text = `🏦 Loan EMI Summary\n\n`;
  text += `💰 Loan: ${formatINR(principal)}\n`;
  text += `📊 Rate: ${rate}%\n`;
  text += `📅 Tenure: ${tenure} ${tenureType}\n\n`;
  text += `━━━━━━━━━━━━━━━\n`;
  text += `📌 Monthly EMI: ${formatINR(emi)}\n`;
  text += `🔴 Total Interest: ${formatINR(totalInterest)}\n`;
  text += `💵 Total Payment: ${formatINR(totalPayment)}\n`;
  text += `━━━━━━━━━━━━━━━\n\n`;

  if (insights && insights.length > 0) {
    text += `🧠 Smart Insights:\n`;
    insights.slice(0, 3).forEach(i => { text += `${i.icon} ${i.text}\n`; });
    text += `\n`;
  }

  text += `— Loan Decision Helper 🇮🇳`;
  return text;
};
