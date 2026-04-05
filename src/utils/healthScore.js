export const getLoanHealthScore = ({ emi, income, rate, months }) => {
  let score = 100;

  // EMI/Income ratio (max 40 points deduction)
  if (income && parseFloat(income) > 0) {
    const ratio = (emi / parseFloat(income)) * 100;
    if (ratio > 60) score -= 40;
    else if (ratio > 50) score -= 32;
    else if (ratio > 40) score -= 24;
    else if (ratio > 30) score -= 14;
    else if (ratio > 20) score -= 6;
  }

  // Interest rate (max 30 points deduction)
  const r = parseFloat(rate);
  if (r > 15) score -= 30;
  else if (r > 12) score -= 22;
  else if (r > 10) score -= 14;
  else if (r > 8) score -= 8;
  else if (r > 6) score -= 3;

  // Tenure (max 30 points deduction)
  const years = parseInt(months) / 12;
  if (years > 25) score -= 30;
  else if (years > 20) score -= 20;
  else if (years > 15) score -= 12;
  else if (years > 10) score -= 6;
  else if (years > 5) score -= 2;

  score = Math.max(0, Math.min(100, score));

  let label, color, gradient;
  if (score >= 75) {
    label = 'Healthy';
    color = '#10B981';
    gradient = ['#10B981', '#059669'];
  } else if (score >= 45) {
    label = 'Moderate';
    color = '#F59E0B';
    gradient = ['#F59E0B', '#F97316'];
  } else {
    label = 'Risky';
    color = '#EF4444';
    gradient = ['#EF4444', '#DC2626'];
  }

  return { score, label, color, gradient };
};
