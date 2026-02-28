export const CURRENCIES = {
    FCFA: { symbol: 'FCFA', position: 'right', space: true },
    USD: { symbol: '$', position: 'left', space: false },
    EUR: { symbol: '€', position: 'right', space: true },
    GBP: { symbol: '£', position: 'left', space: false },
    NGN: { symbol: '₦', position: 'left', space: false },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = 'FCFA';

export const formatCurrency = (amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY) => {
    const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

    // Most currencies use 2 decimal places, but XAF (FCFA) is technically using 0 in many contexts natively,
    // though we can still show 0 decimal places for simplicity or 2 if preferred. We'll use 0 for FCFA and 2 for others.
    const fractionDigits = currencyCode === 'FCFA' ? 0 : 2;

    const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });

    if (currency.position === 'left') {
        return `${currency.symbol}${currency.space ? ' ' : ''}${formattedAmount}`;
    } else {
        return `${formattedAmount}${currency.space ? ' ' : ''}${currency.symbol}`;
    }
};
