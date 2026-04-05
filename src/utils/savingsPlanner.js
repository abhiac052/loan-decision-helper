import { calculateEMI, calculatePrepayment } from './calculations';

export const planSavings = (principal, annualRate, currentMonths, targetMonths) => {
  const P = parseFloat(principal);
  const R = parseFloat(annualRate);
  const current = parseInt(currentMonths);
  const target = parseInt(targetMonths);

  if (P <= 0 || R <= 0 || current <= 0 || target <= 0 || target >= current) return null;

  const currentResult = calculateEMI(P, R, current);
  const targetResult = calculateEMI(P, R, target);

  const emiIncrease = targetResult.emi - currentResult.emi;
  const interestSaved = currentResult.totalInterest - targetResult.totalInterest;
  const monthsSaved = current - target;

  // Find yearly prepayment that roughly matches target tenure
  let low = 0, high = P, bestExtra = 0;
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const prepay = calculatePrepayment(P, R, current, mid);
    if (!prepay) break;
    if (prepay.newMonths <= target) {
      bestExtra = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return {
    currentEMI: currentResult.emi,
    targetEMI: targetResult.emi,
    emiIncrease: Math.round(emiIncrease),
    currentInterest: currentResult.totalInterest,
    targetInterest: targetResult.totalInterest,
    interestSaved: Math.round(interestSaved),
    monthsSaved,
    yearlyPrepayment: Math.round(bestExtra),
  };
};
