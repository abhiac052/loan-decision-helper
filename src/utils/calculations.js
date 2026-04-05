// EMI = [P × R × (1+R)^N] / [(1+R)^N – 1]
export const calculateEMI = (principal, annualRate, months) => {
  if (!principal || !annualRate || !months) return { emi: 0, totalInterest: 0, totalPayment: 0 };
  const P = parseFloat(principal);
  const R = parseFloat(annualRate) / 12 / 100;
  const N = parseInt(months);
  if (P <= 0 || R <= 0 || N <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };

  const factor = Math.pow(1 + R, N);
  const emi = (P * R * factor) / (factor - 1);
  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  };
};

export const getAmortizationSchedule = (principal, annualRate, months) => {
  const P = parseFloat(principal);
  const R = parseFloat(annualRate) / 12 / 100;
  const N = parseInt(months);
  const { emi } = calculateEMI(P, annualRate, N);
  if (!emi) return [];

  let balance = P;
  const schedule = [];
  for (let i = 1; i <= N; i++) {
    const interest = balance * R;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    schedule.push({
      month: i,
      emi,
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(balance)),
    });
  }
  return schedule;
};

export const getAffordability = (salary, expenses, existingEMIs) => {
  const income = parseFloat(salary) || 0;
  const exp = parseFloat(expenses) || 0;
  const existing = parseFloat(existingEMIs) || 0;
  const disposable = income - exp - existing;
  const safeEMI = Math.max(0, Math.round(income * 0.3 - existing));
  const maxEMI = Math.max(0, Math.round(disposable * 0.5));
  const usedRatio = income > 0 ? ((exp + existing) / income) * 100 : 0;

  let risk, riskColor;
  if (income <= 0) {
    risk = 'N/A'; riskColor = '#999';
  } else if (usedRatio <= 30) {
    risk = 'Low Risk'; riskColor = '#0D904F';
  } else if (usedRatio <= 50) {
    risk = 'Medium Risk'; riskColor = '#E37400';
  } else {
    risk = 'High Risk'; riskColor = '#D93025';
  }

  return { disposable: Math.max(0, Math.round(disposable)), safeEMI, maxEMI, risk, riskColor, usedRatio: Math.round(usedRatio) };
};

export const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  const n = Math.round(num);
  const s = n.toString();
  if (s.length <= 3) return '₹' + s;
  let result = s.slice(-3);
  let remaining = s.slice(0, -3);
  while (remaining.length > 2) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) result = remaining + ',' + result;
  return '₹' + result;
};

export const calculatePrepayment = (principal, annualRate, months, extraYearly) => {
  const P = parseFloat(principal);
  const R = parseFloat(annualRate) / 12 / 100;
  const N = parseInt(months);
  const extra = parseFloat(extraYearly) || 0;
  if (P <= 0 || R <= 0 || N <= 0) return null;

  const { emi } = calculateEMI(P, annualRate, N);
  const originalTotal = emi * N;
  const originalInterest = originalTotal - P;

  // Simulate with prepayment
  let balance = P;
  let totalPaid = 0;
  let totalInterest = 0;
  let month = 0;

  while (balance > 0 && month < N * 2) {
    month++;
    const interest = balance * R;
    const principalPaid = Math.min(emi - interest, balance);
    balance -= principalPaid;
    totalInterest += interest;
    totalPaid += emi;

    // Apply yearly extra at end of every 12th month
    if (extra > 0 && month % 12 === 0 && balance > 0) {
      const lump = Math.min(extra, balance);
      balance -= lump;
      totalPaid += lump;
    }

    if (balance <= 0.5) { balance = 0; break; }
  }

  return {
    originalMonths: N,
    newMonths: month,
    monthsSaved: N - month,
    originalInterest: Math.round(originalInterest),
    newInterest: Math.round(totalInterest),
    interestSaved: Math.round(originalInterest - totalInterest),
    emi: Math.round(emi),
    originalTotal: Math.round(originalTotal),
    newTotal: Math.round(totalPaid),
  };
};

export const validateNumber = (text) => {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
};

export const formatAmountInput = (text) => {
  const raw = text.replace(/[^0-9]/g, '');
  if (!raw) return '';
  const len = raw.length;
  if (len <= 3) return raw;
  let result = raw.slice(-3);
  let remaining = raw.slice(0, -3);
  while (remaining.length > 2) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) result = remaining + ',' + result;
  return result;
};

export const stripCommas = (text) => text ? text.replace(/,/g, '') : '';
